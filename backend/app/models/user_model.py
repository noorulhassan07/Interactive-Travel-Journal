# backend/app/models/user_model.py
from beanie import Document, Indexed
from pydantic import EmailStr, Field
from typing import Optional
from datetime import datetime

class User(Document):
    email: EmailStr = Field(...)
    username: str = Field(...)
    hashed_password: str = Field(...)
    full_name: Optional[str] = None
    bio: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = Field(default=True)
    is_verified: bool = Field(default=False)

    class Settings:
        name = "users"
