## interactive travel journal/backend/app/models/trip_model.py

from beanie import Document, Link
from pydantic import Field
from typing import Optional, List
from datetime import datetime
from .user_model import User
from .media_model import Media

class Trip(Document):
    user: Link[User] = Field(..., description="Reference to the user who created the trip")
    title: str = Field(..., description="The title of the trip")
    description: Optional[str] = Field(None, description="A detailed description of the trip")
    start_date: datetime = Field(..., description="The start date of the trip")
    end_date: Optional[datetime] = Field(None, description="The end date of the trip") 
    locations: List[str] = Field(default_factory=list, description="List of locations visited during the trip")
    media: List[Link[Media]] = Field(default_factory=list, description="List of media associated with the trip")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="The timestamp when the trip was created")
    updated_at: datetime = Field(default_factory=datetime.utcnow, description="The timestamp when the trip was last updated")
    is_public: bool = Field(default=False, description="Indicates if the trip is public or private")
    tags: List[str] = Field(default_factory=list, description="List of tags associated with the trip")
    

    class Settings:
        name = "trips"

    class Config:
        json_schema_extra = {
            "example": {
                "user": "user_id_here",
                "title": "Summer Vacation 2023",
                "description": "A wonderful trip to the beaches of Hawaii.",
                "start_date": "2023-06-15T00:00:00Z",
                "end_date": "2023-06-25T00:00:00Z",
                "locations": ["Honolulu", "Maui", "Kauai"],
                "media": ["media_id_1", "media_id_2"],
                "created_at": "2023-05-01T12:00:00Z",
                "updated_at": "2023-05-01T12:00:00Z",
                "is_public": True,
                "tags": ["beach", "summer", "vacation"]
            }
        }
