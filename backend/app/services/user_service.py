from app.models.user_model import User
from app.schemas.user_schema import UserOut
from fastapi import HTTPException
from beanie import PydanticObjectId
from typing import List

async def get_user_by_id(user_id: PydanticObjectId) -> User:
    user = await User.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

async def get_all_users() -> List[User]:
    return await User.find_all().to_list()

async def delete_user(user_id: PydanticObjectId):
    user = await User.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    await user.delete()
    return {"detail": "User deleted successfully"}
