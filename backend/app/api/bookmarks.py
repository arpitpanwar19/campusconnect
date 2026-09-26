from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from app.database import get_db
from app.models.bookmark import Bookmark
from app.models.event import Event
from app.models.user import User
from app.middleware.auth import get_current_user

router = APIRouter()

@router.post("/")
async def create_bookmark(
    event_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    event = await db.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    existing = await db.scalar(select(Bookmark).where(Bookmark.event_id == event_id, Bookmark.user_id == current_user.id))
    if existing:
        return {"status": "already bookmarked"}
        
    bookmark = Bookmark(event_id=event_id, user_id=current_user.id)
    db.add(bookmark)
    await db.commit()
    return {"status": "bookmarked"}

@router.delete("/{event_id}")
async def remove_bookmark(
    event_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    bookmark = await db.scalar(select(Bookmark).where(Bookmark.event_id == event_id, Bookmark.user_id == current_user.id))
    if not bookmark:
        raise HTTPException(status_code=404, detail="Bookmark not found")
        
    await db.delete(bookmark)
    await db.commit()
    return {"status": "removed"}

@router.get("/")
async def my_bookmarks(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stmt = select(Event).join(Bookmark).where(Bookmark.user_id == current_user.id)
    result = await db.execute(stmt)
    return result.scalars().all()
