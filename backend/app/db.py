# backend/app/db.py
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
import os
from app.models.user_model import User
from app.models.trip_model import Trip
from app.models.media_model import Media
from app.models.token_model import RevokedToken
from typing import Optional

db_client: Optional[AsyncIOMotorClient] = None

async def init_db(mongo_url: str):
    global db_client
    if not mongo_url:
        raise RuntimeError("MONGODB_URL environment variable not set")
    db_client = AsyncIOMotorClient(mongo_url)
    db = db_client.get_default_database()
    # initialize beanie with document models
    await init_beanie(database=db, document_models=[User, Trip, Media, RevokedToken])
