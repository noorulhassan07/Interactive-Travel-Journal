## interactive travel journal/backend/app/models/user_model.py

from beanie import Document
from pydantic import Field, EmailStr
from typing import Optional, List
from datetime import datetime
from .trip_model import Trip
from .media_model import Media
from .token_model import Token

class User(Document):
    username: str = Field(..., description="The unique username of the user")
    email: EmailStr = Field(..., description="The email address of the user")
    password_hash: str = Field(..., description="The hashed password of the user")
    full_name: Optional[str] = Field(None, description="The full name of the user")
    bio: Optional[str] = Field(None, description="A short biography of the user")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="The timestamp when the user was created")
    trips: List[str] = Field(default_factory=list, description="List of trip IDs associated with the user")
    media: List[str] = Field(default_factory=list, description="List of media IDs uploaded by the user")
    tokens: List[str] = Field(default_factory=list, description="List of token IDs associated with the user")
    is_active: bool = Field(default=True, description="Indicates if the user account is active")
    is_verified: bool = Field(default=False, description="Indicates if the user's email is verified")

    class Settings:
        name = "users"
    
    class Config:
        json_schema_extra = {
            "example": {
                "username": "johndoe",
                "email": "john@example.com",
                "password_hash": "hashed_password_here",
                "full_name": "John Doe",
                "bio": "Travel enthusiast and photographer.",
                "created_at": "2023-10-01T12:00:00Z",
                "trips": ["trip_id_1", "trip_id_2"],
                "media": ["media_id_1", "media_id_2"],
                "tokens": ["token_id_1", "token_id_2"],
                "is_active": True,
                "is_verified": False
            }
        }
