from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from typing import List, Optional
from uuid import UUID
from datetime import date, time
from app.database import get_db
from app.models.event import Event
from app.models.organization import Organization, OrganizationMember
from app.models.registration import Registration
from app.models.bookmark import Bookmark
from app.models.user import User
from app.schemas.event import EventCreate, EventUpdate, EventResponse, EventListResponse
from app.schemas.common import PaginatedResponse
from app.middleware.auth import get_current_user, get_optional_user, require_role
from app.services.recommendation_service import get_recommended_events
from app.services.conflict_service import check_conflicts
import re
import uuid

router = APIRouter()

def generate_slug(title: str) -> str:
    return re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')

@router.get("/", response_model=PaginatedResponse[EventListResponse])
async def list_events(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    category: Optional[str] = None,
    tags: Optional[List[str]] = Query(None),
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    org_id: Optional[UUID] = None,
    search: Optional[str] = None,
    status: str = 'published',
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Event).where(Event.status == status)
    
    if category:
        stmt = stmt.where(Event.category == category)
    if org_id:
        stmt = stmt.where(Event.org_id == org_id)
    if date_from:
        stmt = stmt.where(Event.event_date >= date_from)
    if date_to:
        stmt = stmt.where(Event.event_date <= date_to)
    if search:
        stmt = stmt.where(Event.title.ilike(f"%{search}%"))
    if tags:
        stmt = stmt.where(Event.tags.contains(tags))
        
    total = await db.scalar(select(func.count()).select_from(stmt.subquery()))
    
    stmt = stmt.offset((page - 1) * page_size).limit(page_size).order_by(Event.event_date.asc())
    result = await db.execute(stmt)
    events = result.scalars().all()
    
    total_pages = (total + page_size - 1) // page_size if total else 0
    return PaginatedResponse(items=events, total=total or 0, page=page, page_size=page_size, total_pages=total_pages)

@router.get("/recommended", response_model=List[EventListResponse])
async def recommended_events(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    stmt = select(Event).where(Event.status == 'published')
    result = await db.execute(stmt)
    all_events = result.scalars().all()
    
    recommendations = await get_recommended_events(current_user, all_events, db)
    
    response = []
    for rec in recommendations:
        event = rec['event']
        event_dict = event.__dict__.copy()
        event_dict['match_score'] = rec['score']
        event_dict['match_reasons'] = rec['reasons']
        response.append(EventListResponse(**event_dict))
        
    return response

@router.get("/calendar", response_model=List[EventListResponse])
async def calendar_events(
    start_date: date,
    end_date: date,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Event).where(
        Event.status == 'published',
        Event.event_date >= start_date,
        Event.event_date <= end_date
    ).order_by(Event.event_date.asc())
    
    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/conflicts")
async def check_event_conflicts(
    event_date: date,
    start_time: time,
    end_time: time,
    venue: str,
    exclude_event_id: Optional[UUID] = None,
    db: AsyncSession = Depends(get_db)
):
    conflicts = await check_conflicts(db, event_date, start_time, end_time, venue, exclude_event_id)
    return [{"id": c.id, "title": c.title, "start_time": c.start_time, "end_time": c.end_time} for c in conflicts]

@router.get("/{slug}", response_model=EventResponse)
async def get_event(
    slug: str,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_optional_user)
):
    stmt = select(Event).where(Event.slug == slug)
    result = await db.execute(stmt)
    event = result.scalar_one_or_none()
    
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    event.views_count += 1
    await db.commit()
    await db.refresh(event)
    
    # Get registration count
    reg_count = await db.scalar(select(func.count()).select_from(Registration).where(Registration.event_id == event.id, Registration.status == 'registered'))
    
    is_registered = False
    is_bookmarked = False
    
    if current_user:
        reg = await db.scalar(select(Registration).where(Registration.event_id == event.id, Registration.user_id == current_user.id, Registration.status == 'registered'))
        is_registered = reg is not None
        
        bmk = await db.scalar(select(Bookmark).where(Bookmark.event_id == event.id, Bookmark.user_id == current_user.id))
        is_bookmarked = bmk is not None
        
    event_dict = event.__dict__.copy()
    event_dict['registration_count'] = reg_count or 0
    event_dict['is_registered'] = is_registered
    event_dict['is_bookmarked'] = is_bookmarked
    
    return EventResponse(**event_dict)

@router.post("/", response_model=EventResponse)
async def create_event(
    data: EventCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_role('organizer', 'admin'))
):
    # Verify user is member of org
    member = await db.scalar(select(OrganizationMember).where(
        OrganizationMember.org_id == data.org_id,
        OrganizationMember.user_id == current_user.id
    ))
    if not member and current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Not a member of this organization")
        
    slug = generate_slug(data.title)
    # Handle slug conflicts simply for this implementation
    slug += f"-{uuid.uuid4().hex[:6]}"
    
    event = Event(**data.model_dump(), slug=slug, created_by=current_user.id, status='draft')
    db.add(event)
    await db.commit()
    await db.refresh(event)
    return await get_event(slug=event.slug, db=db, current_user=current_user)

@router.put("/{event_id}", response_model=EventResponse)
async def update_event(
    event_id: UUID,
    data: EventUpdate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_role('organizer', 'admin'))
):
    event = await db.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    if event.created_by != current_user.id and current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Not authorized to edit this event")
        
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(event, key, value)
        
    await db.commit()
    return await get_event(slug=event.slug, db=db, current_user=current_user)

@router.post("/{event_id}/publish")
async def publish_event(
    event_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_role('organizer', 'admin'))
):
    event = await db.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if event.created_by != current_user.id and current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Not authorized")
        
    event.status = 'published'
    await db.commit()
    return {"status": "published"}

@router.post("/{event_id}/cancel")
async def cancel_event(
    event_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_role('organizer', 'admin'))
):
    event = await db.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if event.created_by != current_user.id and current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Not authorized")
        
    event.status = 'cancelled'
    await db.commit()
    return {"status": "cancelled"}

@router.delete("/{event_id}")
async def delete_event(
    event_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_role('admin'))
):
    event = await db.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    await db.delete(event)
    await db.commit()
    return {"status": "deleted"}

@router.get("/{event_id}/registrations")
async def event_registrations(
    event_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_role('organizer', 'admin'))
):
    event = await db.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if event.created_by != current_user.id and current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Not authorized")
        
    stmt = select(Registration, User).join(User).where(Registration.event_id == event_id)
    result = await db.execute(stmt)
    
    return [{"registration": r, "user": u} for r, u in result.all()]
