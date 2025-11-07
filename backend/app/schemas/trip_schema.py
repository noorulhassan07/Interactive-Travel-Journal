# backend/app/schemas/trip_schema.py
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class TripCreate(BaseModel):
    title: str
    description: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    location: Optional[str] = None

class TripOut(BaseModel):
    id: str
    title: str
    description: Optional[str]
    owner_id: Optional[str]
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    location: Optional[str]
    created_at: datetime
    media_ids: List[str] = []

    class Config:
        orm_mode = True
