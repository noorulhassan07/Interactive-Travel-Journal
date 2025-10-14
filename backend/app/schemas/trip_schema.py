## interactive travel journal / backend/app/schemas/trip_schema.py

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class TripBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=100)
    description: Optional[str] = Field(None, max_length=1000)
    start_date: datetime
    end_date: datetime
    location: Optional[str] = Field(None, max_length=255)
    is_public: bool = True
    photos: Optional[list[str]] = []
    tags: Optional[list[str]] = []

class TripCreate(TripBase):
    user_id: str

class TripResponse(TripBase):
    id: int
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class TripUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=100)
    description: Optional[str] = Field(None, max_length=1000)
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    location: Optional[str] = Field(None, max_length=255)
    is_public: Optional[bool] = None
    photos: Optional[list[str]] = []
    tags: Optional[list[str]] = []
