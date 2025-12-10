from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from app.db import get_database
from typing import Optional
from bson import ObjectId

router = APIRouter()

class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str
    name: str
    travel_style: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    username: str
    email: EmailStr
    name: str
    travel_style: str
    message: Optional[str] = None

@router.post("/register", response_model=UserResponse)
async def register(user_data: UserRegister):
    db = get_database()
    existing_user = await db["users"].find_one({
        "$or": [{"email": user_data.email}, {"username": user_data.username}]
    })
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email or username already exists")

    result = await db["users"].insert_one(user_data.dict())
    return {
        "id": str(result.inserted_id),
        "username": user_data.username,
        "email": user_data.email,
        "name": user_data.name,
        "travel_style": user_data.travel_style,
        "message": "User registered successfully"
    }

@router.post("/login", response_model=UserResponse)
async def login(login_data: UserLogin):
    db = get_database()
    user = await db["users"].find_one({"email": login_data.email})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    if user["password"] != login_data.password:
        raise HTTPException(status_code=401, detail="Invalid password")

    return {
        "id": str(user["_id"]),
        "username": user["username"],
        "email": user["email"],
        "name": user["name"],
        "travel_style": user["travel_style"],
        "message": "Login successful"
    }
