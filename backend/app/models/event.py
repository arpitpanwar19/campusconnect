from sqlalchemy import Column, String, Integer, Boolean, DateTime, Date, Time, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from app.database import Base

class Event(Base):
    __tablename__ = 'events'

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    title = Column(String(500), nullable=False)
    slug = Column(String(500), unique=True)
    description = Column(Text)
    org_id = Column(UUID(as_uuid=True), ForeignKey('organizations.id'))
    created_by = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    category = Column(String(50))
    tags = Column(JSONB, default=[])
    event_date = Column(Date, nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=True)
    venue = Column(String(255))
    eligibility = Column(Text)
    registration_deadline = Column(DateTime(timezone=True))
    capacity = Column(Integer, nullable=True)
    poster_url = Column(String(500))
    benefits = Column(Text)
    contact_info = Column(String(255))
    status = Column(String(20), default='draft')
    is_free = Column(Boolean, default=True)
    registration_link = Column(String(500))
    views_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
