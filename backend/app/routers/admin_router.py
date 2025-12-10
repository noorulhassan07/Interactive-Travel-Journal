from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.db import get_database
from app.utils.security import create_access_token, decode_access_token
from typing import List, Dict

router = APIRouter(prefix="/admin", tags=["Admin"])

ADMIN_EMAIL = "admin@gmail.com"
ADMIN_PASSWORD = "admin@123"

security = HTTPBearer()

class AdminLoginSchema(BaseModel):
    email: str
    password: str

async def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = decode_access_token(token)
        if payload.get("sub") != "admin":
            raise HTTPException(status_code=403, detail="Not authorized")
    except:
        raise HTTPException(status_code=403, detail="Not authorized")
    return True

@router.post("/login")
async def admin_login(data: AdminLoginSchema):
    if data.email != ADMIN_EMAIL or data.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid admin credentials")
    
    token = create_access_token(subject="admin")
    return {"token": token}

@router.get("/users", response_model=List[Dict])
async def get_all_users(admin: bool = Depends(get_current_admin)):
    db = get_database()
    users = await db["users"].find().to_list(length=None)
    
    result = []
    for user in users:
        result.append({
            "id": str(user["_id"]),
            "username": user.get("username"),
            "email": user.get("email"),
            "travel_style": user.get("travel_style"),
            "isAdmin": user.get("isAdmin", False)
        })
    return result
