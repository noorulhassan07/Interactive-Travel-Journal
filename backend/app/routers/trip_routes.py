from fastapi import APIRouter, UploadFile, Form, File, HTTPException
from app.db import get_database
import uuid
import os
import shutil
from datetime import datetime

router = APIRouter()

UPLOAD_DIR = "uploads/images"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_trip(
    user_id: str = Form(...),
    country: str = Form(...),
    place_name: str = Form(...),
    description: str = Form(...),
    photo: UploadFile = File(...) 
):
    db = get_database()
    try:

        file_ext = os.path.splitext(photo.filename)[1]
        filename = f"{uuid.uuid4()}{file_ext}"
        filepath = os.path.join(UPLOAD_DIR, filename)
        
        with open(filepath, "wb") as f:
            content = await photo.read()
            f.write(content)
        
        trip_data = {
            "user_id": user_id,
            "country": country,
            "place_name": place_name,
            "description": description,
            "photo_url": f"/{filepath}",
            "created_at": datetime.utcnow()
        }
        
        result = await db["trips"].insert_one(trip_data)
        
        return {
            "message": "Trip uploaded successfully",
            "trip_id": str(result.inserted_id),
            "photo_url": f"/{filepath}"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        await photo.close()

@router.get("/")
async def get_trips():
    db = get_database()
    trips = await db["trips"].find().to_list(100)
    return {"trips": trips}

@router.get("/user/{user_id}")
async def get_user_trips(user_id: str):
    db = get_database()
    trips = await db["trips"].find({"user_id": user_id}).to_list(100)
    return {"trips": trips}
