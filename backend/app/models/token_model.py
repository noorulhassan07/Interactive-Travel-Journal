## interactive travel journal/backend/app/models/token_model.py

from beanie import Document,  Link
from typing import Optional
from .user_model import User
from datetime import datetime, timedelta

class Token(Document):
    user: Link[User] = Field(..., description="Reference to the user associated with the token")
    token: str = Field(..., description="The authentication token")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="The timestamp when the token was created")
    expires_at: datetime = Field(..., description="The timestamp when the token expires")
    is_active: bool = Field(default=True, description="Indicates if the token is active")

    class Settings:
        name = "tokens"
    
    class Config:
        json_schema_extra = {
            "example": {
                "user": "user_id_here",
                "token": "some_random_token_string",
                "created_at": "2023-10-01T12:00:00Z",
                "expires_at": "2023-10-02T12:00:00Z",
                "is_active": True
            }
        }
