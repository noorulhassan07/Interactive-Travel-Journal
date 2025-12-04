# backend/app/models/token_model.py
from beanie import Document
from pydantic import Field
from datetime import datetime
from typing import Optional

class RevokedToken(Document):
    jti: str = Field(..., description="JWT token identifier")
    revoked_at: datetime = Field(default_factory=datetime.utcnow, description="Timestamp when token was revoked")
    reason: Optional[str] = Field(None, description="Optional reason for revocation")

    class Settings:
        name = "revoked_tokens"
