from sqlalchemy import Column, String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.database import Base

class Registration(Base):
    __tablename__ = 'registrations'

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    event_id = Column(UUID(as_uuid=True), ForeignKey('events.id'))
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    status = Column(String(20), default='registered')
    registered_at = Column(DateTime, server_default=func.now())

    __table_args__ = (UniqueConstraint('event_id', 'user_id', name='uq_event_registration'),)
