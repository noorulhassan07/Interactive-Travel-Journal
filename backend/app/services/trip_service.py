# backend/app/services/trip_service.py
from app.models.trip_model import Trip
from app.models.user_model import User
from app.schemas.trip_schema import TripCreate
from beanie import PydanticObjectId
from fastapi import HTTPException
from typing import List


async def create_trip_service(trip_data: TripCreate) -> Trip:
    user = await User.get(trip_data.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    trip = Trip(
        user=user,
        title=trip_data.title,
        description=trip_data.description,
        location=trip_data.location,
        start_date=trip_data.start_date,
        end_date=trip_data.end_date,
        photos=trip_data.photos
    )
    await trip.insert()
    return trip


async def get_trip_by_id(trip_id: PydanticObjectId) -> Trip:
    trip = await Trip.get(trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip


async def get_all_trips() -> List[Trip]:
    return await Trip.find_all().to_list()


async def update_trip(trip_id: PydanticObjectId, updated_data: dict) -> Trip:
    trip = await Trip.get(trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    for key, value in updated_data.items():
        setattr(trip, key, value)
    await trip.save()
    return trip


async def delete_trip(trip_id: PydanticObjectId):
    trip = await Trip.get(trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    await trip.delete()
    return {"detail": "Trip deleted successfully"}
