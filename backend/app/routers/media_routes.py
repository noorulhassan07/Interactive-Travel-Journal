# backend/app/routes/media_router.py
from fastapi import APIRouter

router = APIRouter(prefix="/media", tags=["Media"])

@router.get("/")
async def get_media():
    return {"message": "Media endpoint - ready for implementation"}
