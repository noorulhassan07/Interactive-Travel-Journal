# backend/app/routes/user_routes.py
from fastapi import APIRouter, Depends, HTTPException
from app.schemas.user_schema import UserOut
from app.models.user_model import User
from app.utils.auth import get_current_user
from typing import List

router = APIRouter()

@router.get("/me", response_model=UserOut)
async def read_me(current_user=Depends(get_current_user)):
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "username": current_user.username,
        "full_name": current_user.full_name,
        "bio": current_user.bio,
        "created_at": current_user.created_at,
        "is_active": current_user.is_active,
        "is_verified": current_user.is_verified,
    }

@router.get("/", response_model=List[UserOut])
async def list_users():
    users = await User.find_many().to_list()
    out = []
    for u in users:
        out.append({
            "id": str(u.id),
            "email": u.email,
            "username": u.username,
            "full_name": u.full_name,
            "bio": u.bio,
            "created_at": u.created_at,
            "is_active": u.is_active,
            "is_verified": u.is_verified,
        })
    return out
