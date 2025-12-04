from beanie import Document, Link
from pydantic import Field
from typing import Optional
from datetime import datetime
from app.models.user_model import User

class Media(Document):
    filename: str = Field(...)
    content_type: Optional[str] = None
    url: Optional[str] = None
    owner: Optional[Link[User]] = None
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)
    description: Optional[str] = None

    class Settings:
        name = "media"
