# backend/app/config.py
import os
from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

from app.models.user_model import User
from app.models.trip_model import Trip
from app.models.media_model import Media
from app.models.token_model import Token


# Load environment variables from .env file
load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017/travel_journal_db")


async def init_db():
    """
    Initialize the MongoDB connection and register all models.
    """
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client.get_default_database()

    await init_beanie(
        database=db,
        document_models=[User, Trip, Media, Token]
    )
