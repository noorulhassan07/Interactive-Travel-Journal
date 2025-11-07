# backend/app/routes/auth_routes.py
from fastapi import APIRouter, HTTPException, status, Depends, Body
from app.schemas.user_schema import UserCreate, Token
from app.models.user_model import User
from app.utils.security import hash_password, verify_password, create_access_token
from beanie import PydanticObjectId

router = APIRouter()

@router.post("/signup", response_model=dict)
async def signup(payload: UserCreate = Body(...)):
    # check email or username exists
    existing = await User.find_one({"$or": [{"email": payload.email}, {"username": payload.username}]})
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email or username already registered")
    user = User(
        email=payload.email,
        username=payload.username,
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name
    )
    await user.insert()
    return {"message": "user_created", "user_id": str(user.id)}

@router.post("/login", response_model=Token)
async def login(username: str = Body(...), password: str = Body(...)):
    # allow login by email or username
    user = await User.find_one({"$or": [{"email": username}, {"username": username}]})
    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid credentials")
    if not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid credentials")
    access_token = create_access_token(subject=str(user.id))
    return {"access_token": access_token, "token_type": "bearer"}
