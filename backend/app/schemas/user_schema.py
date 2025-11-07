# backend/app/schemas/user_schema.py
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str
    full_name: Optional[str] = None

class UserOut(BaseModel):
    id: str
    email: EmailStr
    username: str
    full_name: Optional[str] = None
    bio: Optional[str] = None
    created_at: datetime
    is_active: bool
    is_verified: bool

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
