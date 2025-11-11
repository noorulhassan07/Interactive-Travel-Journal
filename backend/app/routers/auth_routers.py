from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.db import get_database
from bson import ObjectId
from typing import Optional

router = APIRouter()

class UserRegister(BaseModel):
    username: str
    email: str
    password: str
    name: str
    travel_style: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    name: str
    travel_style: str
    message: Optional[str] = None

@router.post("/register", response_model=UserResponse)
async def register(user_data: UserRegister):
    try:
        db = get_database()
        if not db:
            raise HTTPException(status_code=500, detail="Database not connected")
        
        # Check if user exists
        existing_user = await db.users.find_one({
            "$or": [
                {"email": user_data.email},
                {"username": user_data.username}
            ]
        })
        
        if existing_user:
            raise HTTPException(
                status_code=400, 
                detail="User with this email or username already exists"
            )

        user_dict = user_data.dict()

        result = await db.users.insert_one(user_dict)
        
        return {
            "id": str(result.inserted_id),
            "username": user_data.username,
            "email": user_data.email,
            "name": user_data.name,
            "travel_style": user_data.travel_style,
            "message": "User registered successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@router.post("/login", response_model=UserResponse)
async def login(login_data: UserLogin):
    try:
        db = get_database()
        if not db:
            raise HTTPException(status_code=500, detail="Database not connected")
        
        user = await db.users.find_one({"email": login_data.email})
        
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
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")

@router.get("/test")
async def auth_test():
    return {"message": "Auth routes are working!"}
