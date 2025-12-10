from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str
    full_name: Optional[str] = None
    travel_style: Optional[str] = "Explorer"

class UserOut(BaseModel):
    id: str
    email: EmailStr
    username: str
    full_name: Optional[str] = None
    travel_style: Optional[str] = None
    bio: Optional[str] = None
    created_at: Optional[datetime] = None
    is_active: bool = True
    is_verified: bool = False
    badges: int = 0
    role: str = "user"

    class Config:
        orm_mode = True
