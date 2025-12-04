# backend/app/routes/trip_router.py
from fastapi import APIRouter

router = APIRouter(prefix="/trips", tags=["Trips"])

@router.get("/")
async def get_trips():
    return {"message": "Trips endpoint - ready for implementation"}
