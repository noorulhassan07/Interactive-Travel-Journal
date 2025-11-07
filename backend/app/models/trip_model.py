# backend/app/models/trip_model.py
from beanie import Document, Link
from pydantic import Field
from typing import List, Optional
from datetime import datetime
from app.models.user_model import User
from app.models.media_model import Media

class Trip(Document):
    title: str = Field(...)
    description: Optional[str] = None
    owner: Optional[Link[User]] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    location: Optional[str] = None
    media: List[Link[Media]] = Field(default_factory=list)

    class Settings:
        name = "trips"
