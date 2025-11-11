from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def get_media():
    return {"message": "Media endpoint - ready for implementation"}
