from sqlalchemy.ext.asyncio import AsyncSession
from app.models.notification import Notification
from uuid import UUID

async def create_notification(
    db: AsyncSession,
    user_id: UUID,
    title: str,
    message: str,
    type: str,
    related_event_id: UUID | None = None
) -> Notification:
    notification = Notification(
        user_id=user_id,
        title=title,
        message=message,
        type=type,
        related_event_id=related_event_id
    )
    db.add(notification)
    await db.commit()
    await db.refresh(notification)
    return notification
