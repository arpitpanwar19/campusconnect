from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime
from uuid import UUID
from app.database import get_db
from app.models.event import Event
from app.models.registration import Registration
from app.models.user import User
from app.schemas.registration import RegistrationCreate, RegistrationResponse
from app.middleware.auth import get_current_user
from app.services.notification_service import create_notification

router = APIRouter()

@router.post("/", response_model=RegistrationResponse)
async def register_event(
    data: RegistrationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    event = await db.get(Event, data.event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    if event.status != 'published':
        raise HTTPException(status_code=400, detail="Event is not published")
        
    if event.registration_deadline and datetime.utcnow().replace(tzinfo=event.registration_deadline.tzinfo) > event.registration_deadline:
        raise HTTPException(status_code=400, detail="Registration deadline has passed")
        
    if event.capacity:
        count = await db.scalar(select(func.count()).select_from(Registration).where(Registration.event_id == event.id, Registration.status == 'registered'))
        if count and count >= event.capacity:
            raise HTTPException(status_code=400, detail="Event is at full capacity")
            
    existing = await db.scalar(select(Registration).where(Registration.event_id == event.id, Registration.user_id == current_user.id))
    if existing:
        if existing.status == 'cancelled':
            existing.status = 'registered'
            existing.registered_at = func.now()
            registration = existing
        else:
            raise HTTPException(status_code=400, detail="Already registered for this event")
    else:
        registration = Registration(event_id=event.id, user_id=current_user.id)
        db.add(registration)
        
    await db.commit()
    await db.refresh(registration)
    
    await create_notification(
        db, current_user.id, "Registration Successful", 
        f"You have successfully registered for {event.title}.", 
        "registration", event.id
    )
    
    return registration

@router.delete("/{event_id}")
async def cancel_registration(
    event_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    reg = await db.scalar(select(Registration).where(Registration.event_id == event_id, Registration.user_id == current_user.id))
    if not reg:
        raise HTTPException(status_code=404, detail="Registration not found")
        
    reg.status = 'cancelled'
    await db.commit()
    return {"status": "cancelled"}

@router.get("/my")
async def my_registrations(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stmt = select(Registration, Event).join(Event).where(Registration.user_id == current_user.id, Registration.status == 'registered')
    result = await db.execute(stmt)
    
    upcoming = []
    past = []
    today = datetime.utcnow().date()
    
    for reg, event in result.all():
        if event.event_date >= today:
            upcoming.append({"registration": reg, "event": event})
        else:
            past.append({"registration": reg, "event": event})
            
    return {"upcoming": upcoming, "past": past}
