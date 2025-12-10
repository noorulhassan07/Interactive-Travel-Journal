from fastapi import APIRouter, UploadFile, Form, HTTPException
from app.db import get_database
import uuid
import os
import shutil

router = APIRouter()

UPLOAD_DIR = "uploads/images"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_trip(
    user_id: str = Form(...),
    country: str = Form(...),
    place_name: str = Form(...),
    description: str = Form(...),
    photo: UploadFile = Form(...)
):
    db = get_database()
    try:
        filename = f"{uuid.uuid4()}_{photo.filename}"
        filepath = os.path.join(UPLOAD_DIR, filename)
        with open(filepath, "wb") as f:
            shutil.copyfileobj(photo.file, f)

        await db["trips"].insert_one({
            "user_id": user_id,
            "country": country,
            "place_name": place_name,
            "description": description,
            "photo": filepath,
        })
        return {"message": "Trip uploaded successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
