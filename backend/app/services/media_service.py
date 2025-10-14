# backend/app/services/media_service.py
import os
from app.models.media_model import Media
from app.models.user_model import User
from app.models.trip_model import Trip
from beanie import PydanticObjectId
from fastapi import HTTPException, UploadFile

UPLOAD_DIR = "static/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


async def save_media(file: UploadFile, user_id: str = None, trip_id: str = None):
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as f:
        f.write(await file.read())

    user = await User.get(PydanticObjectId(user_id)) if user_id else None
    trip = await Trip.get(PydanticObjectId(trip_id)) if trip_id else None

    media = Media(
        filename=file.filename,
        file_type=file.content_type,
        file_path=file_path,
        uploaded_by=user,
        trip=trip
    )
    await media.insert()
    return media


async def get_media_by_id(media_id: PydanticObjectId) -> Media:
    media = await Media.get(media_id)
    if not media:
        raise HTTPException(status_code=404, detail="Media not found")
    return media


async def get_all_media():
    return await Media.find_all().to_list()


async def delete_media(media_id: PydanticObjectId):
    media = await Media.get(media_id)
    if not media:
        raise HTTPException(status_code=404, detail="Media not found")
    await media.delete()
    return {"detail": "Media deleted successfully"}
