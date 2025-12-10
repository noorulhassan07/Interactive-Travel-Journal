from fastapi import APIRouter, HTTPException, Query
from app.db import get_database
from bson import ObjectId

router = APIRouter()

def serialize_user(user):
    return {
        "id": str(user["_id"]),
        "username": user.get("username"),
        "email": user.get("email"),
        "profilePic": user.get("profilePic"),
    }

@router.get("/leaderboard")
async def leaderboard(user_id: str = Query(None)):
    db = get_database()
    users = await db["users"].find().to_list(length=None)
    trips = await db["trips"].find().to_list(length=None)

    following_ids = []
    if user_id:
        follows = await db["follows"].find({"follower_id": user_id}).to_list(length=None)
        following_ids = [f["following_id"] for f in follows]

    result = []
    for user in users:
        user_trips = [t for t in trips if t["user_id"] == str(user["_id"])]
        countries = len(set([t["country"] for t in user_trips]))
        result.append({
            **serialize_user(user),
            "countriesVisited": countries,
            "isFollowing": str(user["_id"]) in following_ids
        })
    result.sort(key=lambda x: x["countriesVisited"], reverse=True)
    return result

@router.get("/friends")
async def friends(email: str):
    db = get_database()
    user = await db["users"].find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user_id = str(user["_id"])

    users = await db["users"].find().to_list(length=None)
    follows = await db["follows"].find({"follower_id": user_id}).to_list(length=None)
    trips = await db["trips"].find().to_list(length=None)

    following_ids = [f["following_id"] for f in follows]
    result = []
    for u in users:
        if str(u["_id"]) == user_id:
            continue
        user_trips = [t for t in trips if t["user_id"] == str(u["_id"])]
        countries = len(set([t["country"] for t in user_trips]))
        result.append({
            **serialize_user(u),
            "countriesVisited": countries,
            "isFollowing": str(u["_id"]) in following_ids
        })
    return result

@router.post("/follow/{friend_id}")
async def toggle_follow(friend_id: str, follower_id: str = Query(...)):
    db = get_database()
    exists = await db["follows"].find_one({"follower_id": follower_id, "following_id": friend_id})
    if exists:
        await db["follows"].delete_one({"_id": exists["_id"]})
        return {"message": "Unfollowed"}
    await db["follows"].insert_one({"follower_id": follower_id, "following_id": friend_id})
    return {"message": "Followed"}
