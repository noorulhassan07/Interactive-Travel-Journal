from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class TripCreate(BaseModel):
    title: str
    description: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    location: Optional[str] = None
    user_id: str

class TripOut(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    owner_id: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    location: Optional[str] = None
    created_at: datetime
    media_ids: List[str] = []

    class Config:
        orm_mode = True
