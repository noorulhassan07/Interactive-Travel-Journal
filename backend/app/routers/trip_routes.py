# Updated backend/app/routes/trip_routes.py
from fastapi import APIRouter, UploadFile, Form, File, HTTPException, Depends, BackgroundTasks
from fastapi.responses import Response
from app.db import get_database
from app.services.hdfs_service import hdfs_service
from app.auth import get_current_user
import uuid
import os
from datetime import datetime
from bson import ObjectId
import logging
from typing import Optional

router = APIRouter()
logger = logging.getLogger(__name__)

@router.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    logger.info("Initializing HDFS connection...")
    if hdfs_service.connect():
        logger.info("HDFS connected successfully")
    else:
        logger.warning("HDFS connection failed, will use fallback storage")

@router.post("/upload")
async def upload_trip(
    background_tasks: BackgroundTasks,
    country: str = Form(...),
    place_name: str = Form(...),
    description: str = Form(...),
    photo: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """
    Upload a trip with photo to HDFS
    
    Note: user_id is now obtained from authentication token
    """
    db = get_database()
    
    try:
        if not photo.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        if photo.size > 10 * 1024 * 1024: 
            raise HTTPException(status_code=400, detail="Image size must be less than 10MB")
        
        user_id = str(current_user.get("_id"))
        logger.info(f"Uploading trip for user: {user_id}")
        
        photo_data = await photo.read()
        
        hdfs_path = hdfs_service.upload_photo(user_id, photo_data, photo.filename)
        
        trip_data = {
            "user_id": user_id,
            "user_email": current_user.get("email"),
            "username": current_user.get("username"),
            "country": country,
            "place_name": place_name,
            "description": description,
            "photo_hdfs_path": hdfs_path,
            "photo_filename": photo.filename,
            "photo_size": len(photo_data),
            "photo_content_type": photo.content_type,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = await db["trips"].insert_one(trip_data)
        trip_id = str(result.inserted_id)
        
        await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$inc": {"countriesVisited": 1}}
        )
        
        background_tasks.add_task(
            create_analytics_log,
            user_id=user_id,
            trip_id=trip_id,
            country=country
        )
        
        return {
            "message": "Trip uploaded successfully",
            "trip_id": trip_id,
            "hdfs_path": hdfs_path,
            "photo_url": f"/api/trips/photo/{trip_id}"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Trip upload failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to upload trip: {str(e)}")
    finally:
        await photo.close()

@router.get("/photo/{trip_id}")
async def get_trip_photo(trip_id: str, thumbnail: bool = False):
    """
    Serve photo from HDFS by trip ID
    
    Args:
        trip_id: Trip ID from MongoDB
        thumbnail: If True, returns thumbnail version
    """
    db = get_database()
    
    try:
        trip = await db["trips"].find_one({"_id": ObjectId(trip_id)})
        if not trip:
            raise HTTPException(status_code=404, detail="Trip not found")
        
        hdfs_path = trip.get("photo_hdfs_path")
        if not hdfs_path:
            raise HTTPException(status_code=404, detail="Photo not found")
        
        if thumbnail:
            hdfs_path = hdfs_path.replace("/original/", "/thumbnails/")
        
        try:
            photo_data = hdfs_service.read_file(hdfs_path)
        except HTTPException:
            if thumbnail:
                hdfs_path = trip.get("photo_hdfs_path")
                photo_data = hdfs_service.read_file(hdfs_path)
            else:
                raise
        
        content_type = trip.get("photo_content_type", "image/jpeg")
        
        return Response(
            content=photo_data,
            media_type=content_type,
            headers={
                "Content-Disposition": f'inline; filename="{trip.get("photo_filename", "photo.jpg")}"',
                "Cache-Control": "public, max-age=86400"  # Cache for 1 day
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to serve photo: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve photo")

@router.get("/")
async def get_trips(current_user: dict = Depends(get_current_user)):
    """Get all trips (with authentication)"""
    db = get_database()
    try:
        trips = await db["trips"].find().sort("created_at", -1).to_list(100)
        
        for trip in trips:
            trip["_id"] = str(trip["_id"])
            trip["photo_url"] = f"/api/trips/photo/{trip['_id']}"
            trip["thumbnail_url"] = f"/api/trips/photo/{trip['_id']}?thumbnail=true"

            if "photo_hdfs_path" in trip:
                del trip["photo_hdfs_path"]
        
        return {"trips": trips}
    except Exception as e:
        logger.error(f"Failed to get trips: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve trips")

@router.get("/user/{user_id}")
async def get_user_trips(user_id: str):
    """Get trips for a specific user"""
    db = get_database()
    try:
        user = await db["users"].find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        trips = await db["trips"].find({"user_id": user_id}).sort("created_at", -1).to_list(100)
        
        for trip in trips:
            trip["_id"] = str(trip["_id"])
            trip["photo_url"] = f"/api/trips/photo/{trip['_id']}"
            trip["thumbnail_url"] = f"/api/trips/photo/{trip['_id']}?thumbnail=true"

            if "photo_hdfs_path" in trip:
                del trip["photo_hdfs_path"]
        
        return {"trips": trips}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get user trips: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve user trips")

@router.delete("/{trip_id}")
async def delete_trip(trip_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a trip and its photo from HDFS"""
    db = get_database()
    
    try:
        trip = await db["trips"].find_one({"_id": ObjectId(trip_id)})
        if not trip:
            raise HTTPException(status_code=404, detail="Trip not found")
        
        if str(trip["user_id"]) != str(current_user.get("_id")):
            raise HTTPException(status_code=403, detail="Not authorized to delete this trip")
        
        hdfs_path = trip.get("photo_hdfs_path")
        if hdfs_path:
            hdfs_service.delete_file(hdfs_path)
            
            thumb_path = hdfs_path.replace("/original/", "/thumbnails/")
            hdfs_service.delete_file(thumb_path)
        
        await db["trips"].delete_one({"_id": ObjectId(trip_id)})
        
        await db.users.update_one(
            {"_id": ObjectId(trip["user_id"])},
            {"$inc": {"countriesVisited": -1}}
        )
        
        return {"message": "Trip deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete trip: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete trip")

async def create_analytics_log(user_id: str, trip_id: str, country: str):
    """Create analytics log in HDFS"""
    try:
        log_entry = {
            "user_id": user_id,
            "trip_id": trip_id,
            "country": country,
            "timestamp": datetime.utcnow().isoformat(),
            "action": "trip_upload"
        }
        
        import json
        log_data = json.dumps(log_entry).encode('utf-8')
        
        log_filename = f"{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{trip_id}.json"
        log_path = f"{hdfs_service.base_path}/analytics/{log_filename}"
        
        with hdfs_service.client.write(log_path, overwrite=True) as writer:
            writer.write(log_data)
            
    except Exception as e:
        logger.error(f"Failed to create analytics log: {str(e)}")

@router.get("/hdfs/stats")
async def get_hdfs_stats(current_user: dict = Depends(get_current_user)):
    """Get HDFS statistics (admin only)"""

    if not current_user.get("isAdmin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    stats = hdfs_service.get_hdfs_stats()
    return stats
