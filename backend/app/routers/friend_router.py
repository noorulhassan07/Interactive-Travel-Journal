from fastapi import APIRouter, HTTPException, Query
from bson import ObjectId
from app.db import get_database

router = APIRouter(prefix="/friends", tags=["Friends"])


def validate_object_id(id_str: str):
    """Convert string to ObjectId or raise 400"""
    try:
        return ObjectId(id_str)
    except:
        raise HTTPException(400, "Invalid user ID")


@router.post("/follow/{friend_id}")
async def toggle_follow(friend_id: str, user_id: str = Query(...)):
    """
    Follow or unfollow a friend.
    """
    db = get_database()
    user_oid = validate_object_id(user_id)
    friend_oid = validate_object_id(friend_id)

    user = await db.users.find_one({"_id": user_oid})
    if not user:
        raise HTTPException(404, "User not found")

    following = [str(fid) for fid in user.get("following", [])]

    if str(friend_oid) in following:
        following.remove(str(friend_oid))
    else:
        following.append(str(friend_oid))

    await db.users.update_one({"_id": user_oid}, {"$set": {"following": following}})

    return {"status": "success", "following": following}


@router.get("/")
async def get_friends(email: str = Query(...)):
    """
    Get all friends of a user by email.
    """
    db = get_database()
    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(404, "User not found")

    following_ids = [ObjectId(fid) for fid in user.get("following", [])]

    friends = await db.users.find({"_id": {"$in": following_ids}}).to_list(100)

    result = []
    for f in friends:
        result.append({
            "id": str(f["_id"]),
            "username": f["username"],
            "email": f["email"],
            "profilePic": f.get("profilePic"),
            "countriesVisited": f.get("countriesVisited", 0),
            "isFollowing": True
        })

    return result


@router.get("/search")
async def search_users(username: str = Query(...)):
    """
    Search users by username (case-insensitive)
    """
    db = get_database()
    users = await db.users.find({"username": {"$regex": username, "$options": "i"}}).to_list(50)

    result = []
    for u in users:
        result.append({
            "id": str(u["_id"]),
            "username": u["username"],
            "email": u["email"],
            "profilePic": u.get("profilePic"),
            "countriesVisited": u.get("countriesVisited", 0),
            "isFollowing": False
        })

    return result


@router.get("/leaderboard")
async def get_leaderboard(user_id: str = Query(...)):
    """
    Get top travelers with following info
    """
    db = get_database()
    user_oid = validate_object_id(user_id)

    current_user = await db.users.find_one({"_id": user_oid})
    if not current_user:
        raise HTTPException(404, "User not found")

    users = await db.users.find().sort("countriesVisited", -1).to_list(50)

    following = [str(fid) for fid in current_user.get("following", [])]

    result = []
    for u in users:
        result.append({
            "id": str(u["_id"]),
            "username": u["username"],
            "email": u["email"],
            "profilePic": u.get("profilePic"),
            "countriesVisited": u.get("countriesVisited", 0),
            "isFollowing": str(u["_id"]) in following
        })

    return result
