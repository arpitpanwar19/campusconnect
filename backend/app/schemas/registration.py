from pydantic import BaseModel
from datetime import datetime
from uuid import UUID

class RegistrationCreate(BaseModel):
    event_id: UUID

class RegistrationResponse(BaseModel):
    id: UUID
    event_id: UUID
    user_id: UUID
    status: str
    registered_at: datetime

    class Config:
        from_attributes = True
