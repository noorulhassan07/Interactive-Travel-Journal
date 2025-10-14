## interactive jounal travel/backend/app/models/media_model.py
from .user_model import User
from .trip_model import Trip
from beanie import Documennt
from pydantic import Field, EmailStr
from datetime import datetime
from typing import Optional, List

class Media(Document):
    filename: str = Field(..., description="The name of the media file")
    url: str = Field(..., description="The URL where the media file is stored")
    file_path: str = Field(..., description="The path to the media file in storage")
    uploaded_at: datetime = Field(default_factory=datetime.utcnow, description="The timestamp when the media was uploaded")
    uploaded_by: EmailStr = Field(..., description="The email of the user who uploaded the media")
    trip_id: Optional[str] = Field(None, description="The ID of the trip associated with the media")
    description: Optional[str] = Field(None, description="A description of the media file")

    class Settings:
        name = "media"
    
    class Config:
        json_schema_extra = {
            "example": {
                "filename": "beach_photo.jpg",
                "url": "https://example.com/media/beach_photo.jpg",
                "file_path": "/media/beach_photo.jpg",
                "uploaded_at": "2023-10-01T12:00:00Z",
                "uploaded_by": "user_id_here",
                "trip_id": "trip12345",
                "description": "A photo from my trip to the beach."
                }
        }
