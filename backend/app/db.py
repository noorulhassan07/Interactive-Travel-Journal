#backend/app/db.py
from motor.motor_asyncio import AsyncIOMotorClient
import os

class MongoDB:
    client: AsyncIOMotorClient = None
    database = None

db = MongoDB()

async def init_db(mongo_url: str = None):
    if not mongo_url:
        mongo_url = os.getenv(
            "MONGODB_URL",
            "mongodb://root:example@mongo:27017/travel_journal_db?authSource=admin"
        )
    db.client = AsyncIOMotorClient(mongo_url)
    db.database = db.client.travel_journal_db
    await db.client.admin.command('ping')
    print("Connected to MongoDB successfully!")
    return db.database

def get_database():
    return db.database

def get_client():
    return db.client
