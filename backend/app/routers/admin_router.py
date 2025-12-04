from fastapi import APIRouter, HTTPException
from pymongo import MongoClient
from typing import List, Dict

client = MongoClient("mongodb://root:example@mongo:27017/")
db = client["travel_journal_db"]

# The router must be named "router"
router = APIRouter()

def admin_auth(username: str, password: str):
    if username != "admin" or password != "admin@123":
        raise HTTPException(status_code=401, detail="Unauthorized admin access")
    return True

@router.get("/users", response_model=List[Dict])
def get_all_users(username: str = "admin@gmail.com", password: str = "admin@123"):
    admin_auth(username, password)

    users_collection = db["users"]
    badges_collection = db["badges"]

    users = list(users_collection.find({}))

    result = []
    for user in users:
        badges_count = badges_collection.count_documents({"user_id": str(user["_id"])})
        result.append({
            "id": str(user["_id"]),
            "username": user.get("username"),
            "email": user.get("email"),
            "password": user.get("password"),
            "badges_count": badges_count
        })
    return result
