# backend/app/schemas/media_schema.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class MediaOut(BaseModel):
    id: str
    filename: str
    content_type: Optional[str] = None
    url: Optional[str] = None
    owner_id: Optional[str] = None
    uploaded_at: datetime
    description: Optional[str] = None

    class Config:
        orm_mode = True

class MediaCreate(BaseModel):
    filename: str
    content_type: Optional[str] = None
    url: Optional[str] = None
    owner_id: Optional[str] = None
    description: Optional[str] = None
