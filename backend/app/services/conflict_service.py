from typing import List
from datetime import date, time
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_
from app.models.event import Event
from uuid import UUID

async def check_conflicts(
    db: AsyncSession,
    event_date: date,
    start_time: time,
    end_time: time,
    venue: str,
    exclude_event_id: UUID | None = None
) -> List[Event]:
    """Check for conflicting events at the same venue and overlapping times."""
    
    stmt = select(Event).where(
        Event.event_date == event_date,
        Event.venue == venue,
        Event.status != 'cancelled',
        or_(
            and_(Event.start_time <= start_time, Event.end_time > start_time),
            and_(Event.start_time < end_time, Event.end_time >= end_time),
            and_(Event.start_time >= start_time, Event.end_time <= end_time)
        )
    )
    
    if exclude_event_id:
        stmt = stmt.where(Event.id != exclude_event_id)
        
    result = await db.execute(stmt)
    return list(result.scalars().all())
