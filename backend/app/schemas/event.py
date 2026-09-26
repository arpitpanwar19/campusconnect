from pydantic import BaseModel
from typing import List, Optional
from datetime import date, time, datetime
from uuid import UUID

class EventCreate(BaseModel):
    title: str
    description: str
    org_id: UUID
    category: str
    tags: List[str] = []
    event_date: date
    start_time: time
    end_time: Optional[time] = None
    venue: str
    eligibility: str
    registration_deadline: datetime
    capacity: Optional[int] = None
    poster_url: Optional[str] = None
    benefits: str
    contact_info: str
    is_free: bool = True
    registration_link: Optional[str] = None

class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    event_date: Optional[date] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    venue: Optional[str] = None
    eligibility: Optional[str] = None
    registration_deadline: Optional[datetime] = None
    capacity: Optional[int] = None
    poster_url: Optional[str] = None
    benefits: Optional[str] = None
    contact_info: Optional[str] = None
    is_free: Optional[bool] = None
    registration_link: Optional[str] = None

class EventListResponse(BaseModel):
    id: UUID
    title: str
    slug: str
    category: str
    event_date: date
    start_time: time
    venue: str
    poster_url: Optional[str] = None
    status: str
    is_free: bool
    views_count: int
    match_score: Optional[float] = None
    match_reasons: Optional[List[str]] = None

    class Config:
        from_attributes = True

class EventResponse(EventListResponse):
    description: str
    org_id: UUID
    created_by: UUID
    tags: List[str] = []
    end_time: Optional[time] = None
    eligibility: str
    registration_deadline: datetime
    capacity: Optional[int] = None
    benefits: str
    contact_info: str
    registration_link: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    registration_count: int = 0
    is_registered: bool = False
    is_bookmarked: bool = False

class EventFilterParams(BaseModel):
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    date_from: Optional[date] = None
    date_to: Optional[date] = None
    org_id: Optional[UUID] = None
    search: Optional[str] = None
    status: Optional[str] = 'published'
