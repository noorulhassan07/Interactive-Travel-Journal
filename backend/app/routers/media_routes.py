# backend/app/routes/media_routes.py
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status, Form
import os
from pathlib import Path
from app.models.media_model import Media
from app.models.user_model import User
from app.utils.auth_helpers import get_current_user
from beanie import PydanticObjectId

router = APIRouter()
UPLOAD_DIR = Path("/app/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@router.post("/upload", response_model=dict)
async def upload_media(file: UploadFile = File(...), description: str = Form(None), current_user: User = Depends(get_current_user)):
    # save file locally (inside container). In production store in S3 or similar.
    safe_name = f"{int(__import__('time').time())}_{file.filename}"
    save_path = UPLOAD_DIR / safe_name
    try:
        with open(save_path, "wb") as f:
            content = await file.read()
            f.write(content)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to save file")
    url = f"/uploads/{safe_name}"  # if you serve static files, map this path
    media = Media(
        filename=file.filename,
        content_type=file.content_type,
        url=url,
        owner=current_user,
        description=description
    )
    await media.insert()
    return {"message": "uploaded", "media_id": str(media.id), "url": url}

@router.get("/{media_id}", response_model=dict)
async def get_media(media_id: str):
    m = await Media.get(media_id)
    if not m:
        raise HTTPException(status_code=404, detail="Media not found")
    return {
        "id": str(m.id),
        "filename": m.filename,
        "content_type": m.content_type,
        "url": m.url,
        "owner_id": str(m.owner.id) if m.owner else None,
        "uploaded_at": m.uploaded_at,
        "description": m.description
    }
