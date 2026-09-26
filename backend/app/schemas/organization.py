from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from uuid import UUID

class OrgCreate(BaseModel):
    name: str
    type: str
    description: Optional[str] = None
    logo_url: Optional[str] = None

class OrgUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None

class OrgResponse(BaseModel):
    id: UUID
    name: str
    slug: str
    type: str
    description: Optional[str] = None
    logo_url: Optional[str] = None
    is_verified: bool
    verified_at: Optional[datetime] = None
    created_by: UUID
    created_at: datetime
    member_count: int = 0
    event_count: int = 0

    class Config:
        from_attributes = True

class OrgMemberAdd(BaseModel):
    user_id: UUID
    role: str
