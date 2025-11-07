# backend/app/routes/trip_routes.py
from fastapi import APIRouter, Depends, HTTPException, Body
from typing import List
from app.schemas.trip_schema import TripCreate, TripOut
from app.models.trip_model import Trip
from app.models.user_model import User
from app.utils.auth_helpers import get_current_user

router = APIRouter()

@router.post("/", response_model=dict)
async def create_trip(payload: TripCreate = Body(...), current_user: User = Depends(get_current_user)):
    trip = Trip(
        title=payload.title,
        description=payload.description,
        owner=current_user,
        start_date=payload.start_date,
        end_date=payload.end_date,
        location=payload.location
    )
    await trip.insert()
    return {"message": "trip_created", "trip_id": str(trip.id)}

@router.get("/", response_model=List[TripOut])
async def list_trips():
    trips = await Trip.find_many().to_list()
    out = []
    for t in trips:
        out.append({
            "id": str(t.id),
            "title": t.title,
            "description": t.description,
            "owner_id": str(t.owner.id) if t.owner else None,
            "start_date": t.start_date,
            "end_date": t.end_date,
            "location": t.location,
            "created_at": t.created_at,
            "media_ids": [str(m.id) for m in t.media] if t.media else []
        })
    return out

@router.get("/{trip_id}", response_model=TripOut)
async def get_trip(trip_id: str):
    trip = await Trip.get(trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return {
        "id": str(trip.id),
        "title": trip.title,
        "description": trip.description,
        "owner_id": str(trip.owner.id) if trip.owner else None,
        "start_date": trip.start_date,
        "end_date": trip.end_date,
        "location": trip.location,
        "created_at": trip.created_at,
        "media_ids": [str(m.id) for m in trip.media] if trip.media else []
    }
