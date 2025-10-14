# backend/app/services/user_service.py
from app.models.user_model import User
from app.schemas.user_schema import BadgeUpdate
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


async def update_user_badges(user_id: PydanticObjectId, badge_data: BadgeUpdate) -> User:
    user = await User.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.badges = badge_data.badges
    await user.save()
    return user


async def delete_user(user_id: PydanticObjectId):
    user = await User.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    await user.delete()
    return {"detail": "User deleted successfully"}
