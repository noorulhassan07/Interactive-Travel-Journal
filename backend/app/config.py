import os
from pydantic import BaseSettings

class Settings(BaseSettings):
    MONGODB_URL: str = os.getenv(
        "MONGODB_URL",
        "mongodb://root:example@mongo:27017/travel_journal_db?authSource=admin"
    )
    SECRET_KEY: str = os.getenv("SECRET_KEY", "replace_this_with_a_secure_random_value")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

settings = Settings()
