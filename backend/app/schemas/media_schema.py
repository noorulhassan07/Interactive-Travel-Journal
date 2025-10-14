##interactive travel journal / backend/app/schemas/media_schema.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class MediaBase(BaseModel):
    filename: str
    url: str
    media_type: str  # e.g., 'image', 'video'
    trip_id: Optional[int] = None
    user_id: Optional[int] = None
    file_path: Optional[str] = None
    uploaded_at: Optional[datetime] = datetime.utcnow()

class MediaCreate(MediaBase):
    pass

class MediaResponse(MediaBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
