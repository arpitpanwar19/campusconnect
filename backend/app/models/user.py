from sqlalchemy import Column, String, Integer, Boolean, DateTime, func, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.database import Base

class User(Base):
    __tablename__ = 'users'

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    email = Column(String(255), unique=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(20), default='student')
    admission_year = Column(Integer, nullable=True)
    branch = Column(String(100), nullable=True)
    interests = Column(JSONB, default=[])
    goals = Column(JSONB, default=[])
    onboarding_complete = Column(Boolean, default=False)
    avatar_url = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
