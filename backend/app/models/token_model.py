# backend/app/models/token_model.py
from beanie import Document
from pydantic import Field
from datetime import datetime
from typing import Optional

class RevokedToken(Document):
    jti: str = Field(...)  # token identifier
    revoked_at: datetime = Field(default_factory=datetime.utcnow)
    reason: Optional[str] = None

    class Settings:
        name = "revoked_tokens"
