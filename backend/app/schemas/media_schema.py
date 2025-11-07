# backend/app/schemas/media_schema.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class MediaOut(BaseModel):
    id: str
    filename: str
    content_type: Optional[str]
    url: Optional[str]
    owner_id: Optional[str]
    uploaded_at: datetime
    description: Optional[str]

    class Config:
        orm_mode = True
