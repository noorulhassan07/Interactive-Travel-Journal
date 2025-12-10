import os
from app.models.media_model import Media
from app.models.user_model import User
from app.models.trip_model import Trip
from beanie import PydanticObjectId
from fastapi import HTTPException, UploadFile
from datetime import datetime

UPLOAD_DIR = "static/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Save media
async def save_media(file: UploadFile, user_id: str = None, trip_id: str = None) -> Media:
    file_path = os.path.join(UPLOAD_DIR, f"{datetime.utcnow().timestamp()}_{file.filename}")
    with open(file_path, "wb") as f:
        f.write(await file.read())

    user = await User.get(PydanticObjectId(user_id)) if user_id else None
    trip = await Trip.get(PydanticObjectId(trip_id)) if trip_id else None

    media = Media(
        filename=file.filename,
        content_type=file.content_type,
        url=file_path,
        owner=user,
        trip=trip,
        uploaded_at=datetime.utcnow()
    )
    await media.insert()
    return media

# Get media by ID
async def get_media_by_id(media_id: str) -> Media:
    media = await Media.get(PydanticObjectId(media_id))
    if not media:
        raise HTTPException(status_code=404, detail="Media not found")
    return media

# Get all media
async def get_all_media() -> list[Media]:
    return await Media.find_all().to_list()

# Delete media
async def delete_media(media_id: str):
    media = await Media.get(PydanticObjectId(media_id))
    if not media:
        raise HTTPException(status_code=404, detail="Media not found")
    await media.delete()
    return {"detail": "Media deleted successfully"}
