from beanie import Document
from pydantic import EmailStr, Field
from datetime import datetime
from typing import Optional

class User(Document):
    email: EmailStr = Field(...)
    username: str = Field(...)
    hashed_password: str = Field(...)
    full_name: Optional[str] = None
    bio: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = Field(default=True)
    is_verified: bool = Field(default=False)
    badges: int = Field(default=0)

    class Settings:
        name = "users"
