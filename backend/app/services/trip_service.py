from app.models.trip_model import Trip
from app.models.user_model import User
from app.schemas.trip_schema import TripCreate
from beanie import PydanticObjectId
from fastapi import HTTPException
from typing import List

async def create_trip(trip_data: TripCreate, user_id: str) -> Trip:
    user = await User.get(PydanticObjectId(user_id))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    trip = Trip(
        title=trip_data.title,
        description=trip_data.description,
        owner=user,
        start_date=trip_data.start_date,
        end_date=trip_data.end_date,
        location=trip_data.location
    )
    await trip.insert()
    return trip

async def get_trip_by_id(trip_id: str) -> Trip:
    trip = await Trip.get(PydanticObjectId(trip_id))
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip

async def get_all_trips() -> List[Trip]:
    return await Trip.find_all().to_list()

async def update_trip(trip_id: str, updated_data: dict) -> Trip:
    trip = await Trip.get(PydanticObjectId(trip_id))
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    for key, value in updated_data.items():
        setattr(trip, key, value)
    await trip.save()
    return trip

async def delete_trip(trip_id: str):
    trip = await Trip.get(PydanticObjectId(trip_id))
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    await trip.delete()
    return {"detail": "Trip deleted successfully"}
