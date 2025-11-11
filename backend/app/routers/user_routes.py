from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def get_users():
    return {"message": "Users endpoint - ready for implementation"}

@router.get("/{user_id}")
async def get_user(user_id: str):
    return {"message": f"User {user_id} details - ready for implementation"}
