from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.database import Base

class Notification(Base):
    __tablename__ = 'notifications'

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    title = Column(String(255))
    message = Column(Text)
    type = Column(String(50))
    is_read = Column(Boolean, default=False)
    related_event_id = Column(UUID(as_uuid=True), ForeignKey('events.id'), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
