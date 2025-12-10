from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.db import get_database
import uuid
import os
from datetime import datetime

router = APIRouter()
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@router.post("/travel_logs/upload")
async def upload_travel_log(
    user_id: str = Form(...),
    country: str = Form(...),
    place_name: str = Form(...),
    description: str = Form(...),
    photo: UploadFile = File(...)
):
    db = get_database()
    try:
        file_id = f"{uuid.uuid4()}_{photo.filename}"
        file_path = os.path.join(UPLOAD_FOLDER, file_id)
        with open(file_path, "wb") as f:
            f.write(await photo.read())

        await db["travel_logs"].insert_one({
            "user_id": user_id,
            "country": country,
            "place_name": place_name,
            "description": description,
            "photo_url": file_path,
            "created_at": datetime.utcnow(),
        })
        return {"status": "success", "message": "Trip uploaded successfully!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
