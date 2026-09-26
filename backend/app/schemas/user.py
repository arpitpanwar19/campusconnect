from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime
from uuid import UUID

class UserCreate(BaseModel):
    id: str  # from supabase auth
    email: EmailStr
    full_name: str

class UserOnboarding(BaseModel):
    admission_year: int
    branch: str
    interests: List[str]
    goals: List[str]

class UserProfile(BaseModel):
    id: UUID
    email: EmailStr
    full_name: str
    role: str
    admission_year: Optional[int] = None
    branch: Optional[str] = None
    interests: List[str] = []
    goals: List[str] = []
    onboarding_complete: bool
    avatar_url: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    admission_year: Optional[int] = None
    branch: Optional[str] = None
    interests: Optional[List[str]] = None
    goals: Optional[List[str]] = None
    avatar_url: Optional[str] = None
