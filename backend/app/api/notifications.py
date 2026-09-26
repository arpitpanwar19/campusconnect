from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, update
from typing import List
from uuid import UUID
from app.database import get_db
from app.models.notification import Notification
from app.models.user import User
from app.schemas.notification import NotificationResponse
from app.schemas.common import PaginatedResponse
from app.middleware.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=PaginatedResponse[NotificationResponse])
async def list_notifications(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stmt = select(Notification).where(Notification.user_id == current_user.id)
    
    total = await db.scalar(select(func.count()).select_from(stmt.subquery()))
    
    stmt = stmt.offset((page - 1) * page_size).limit(page_size).order_by(Notification.created_at.desc())
    result = await db.execute(stmt)
    notifications = result.scalars().all()
    
    total_pages = (total + page_size - 1) // page_size if total else 0
    return PaginatedResponse(items=notifications, total=total or 0, page=page, page_size=page_size, total_pages=total_pages)

@router.put("/{notification_id}/read")
async def mark_as_read(
    notification_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notification = await db.get(Notification, notification_id)
    if notification and notification.user_id == current_user.id:
        notification.is_read = True
        await db.commit()
    return {"status": "success"}

@router.put("/read-all")
async def mark_all_read(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stmt = update(Notification).where(Notification.user_id == current_user.id).values(is_read=True)
    await db.execute(stmt)
    await db.commit()
    return {"status": "success"}

@router.get("/unread-count")
async def unread_count(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    count = await db.scalar(select(func.count()).select_from(Notification).where(Notification.user_id == current_user.id, Notification.is_read == False))
    return {"count": count or 0}
