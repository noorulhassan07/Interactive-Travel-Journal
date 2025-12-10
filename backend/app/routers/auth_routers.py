from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from app.db import get_database
from app.auth import get_password_hash, verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from datetime import timedelta
from typing import Optional

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

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict


@router.post("/register")
async def register(user_data: UserRegister):
    db = get_database()
    
    existing_user = await db["users"].find_one({
        "$or": [{"email": user_data.email}, {"username": user_data.username}]
    })
    if existing_user:
        raise HTTPException(
            status_code=400, 
            detail="User with this email or username already exists"
        )

    hashed_password = get_password_hash(user_data.password)
    
    new_user = user_data.dict()
    new_user["password"] = hashed_password
    new_user["countriesVisited"] = 0 
    
    result = await db["users"].insert_one(new_user)
    
    return {"message": "User registered successfully", "id": str(result.inserted_id)}

@router.post("/login", response_model=TokenResponse)
async def login(login_data: UserLogin):
    db = get_database()
    

    user = await db["users"].find_one({"email": login_data.email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not verify_password(login_data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"]}, 
        expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(user["_id"]),
            "username": user["username"],
            "email": user["email"],
            "name": user["name"],
            "travel_style": user.get("travel_style", "")
        }
    }
