from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID

class NotificationResponse(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    message: str
    type: str
    is_read: bool
    related_event_id: Optional[UUID] = None
    created_at: datetime

    class Config:
        from_attributes = True
