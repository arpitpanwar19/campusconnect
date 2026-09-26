from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional
from uuid import UUID
from datetime import datetime
from app.database import get_db
from app.models.organization import Organization
from app.models.event import Event
from app.models.user import User
from app.models.audit_log import AuditLog
from app.models.registration import Registration
from app.schemas.organization import OrgResponse
from app.schemas.user import UserProfile
from app.schemas.common import PaginatedResponse
from app.middleware.auth import require_role, get_current_user
from app.services.audit_service import log_action

router = APIRouter()

@router.get("/organizations/pending", response_model=List[OrgResponse])
async def pending_orgs(db: AsyncSession = Depends(get_db), _ = Depends(require_role('admin'))):
    stmt = select(Organization).where(Organization.is_verified == False)
    result = await db.execute(stmt)
    return result.scalars().all()

@router.post("/organizations/{org_id}/verify")
async def verify_org(
    org_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role('admin'))
):
    org = await db.get(Organization, org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
        
    org.is_verified = True
    org.verified_at = datetime.utcnow()
    org.verified_by = current_user.id
    
    creator = await db.get(User, org.created_by)
    if creator and creator.role == 'student':
        creator.role = 'organizer'
        
    await log_action(db, current_user.id, 'verify_org', 'organization', org_id, {"org_name": org.name})
    await db.commit()
    return {"status": "verified"}

@router.post("/organizations/{org_id}/reject")
async def reject_org(
    org_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role('admin'))
):
    org = await db.get(Organization, org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
        
    org.is_verified = False
    await log_action(db, current_user.id, 'reject_org', 'organization', org_id, {"org_name": org.name})
    await db.commit()
    return {"status": "rejected"}

@router.get("/events")
async def admin_events(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    _ = Depends(require_role('admin'))
):
    stmt = select(Event)
    total = await db.scalar(select(func.count()).select_from(Event))
    
    stmt = stmt.offset((page - 1) * page_size).limit(page_size).order_by(Event.created_at.desc())
    result = await db.execute(stmt)
    
    return {
        "items": result.scalars().all(),
        "total": total or 0,
        "page": page,
        "page_size": page_size
    }

@router.post("/events/{event_id}/disable")
async def disable_event(
    event_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role('admin'))
):
    event = await db.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    event.status = 'cancelled'
    await log_action(db, current_user.id, 'disable_event', 'event', event_id, {"event_title": event.title})
    await db.commit()
    return {"status": "disabled"}

@router.get("/users")
async def admin_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    role: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    _ = Depends(require_role('admin'))
):
    stmt = select(User)
    if role:
        stmt = stmt.where(User.role == role)
        
    total = await db.scalar(select(func.count()).select_from(stmt.subquery()))
    stmt = stmt.offset((page - 1) * page_size).limit(page_size).order_by(User.created_at.desc())
    result = await db.execute(stmt)
    
    return {
        "items": result.scalars().all(),
        "total": total or 0,
        "page": page,
        "page_size": page_size
    }

@router.put("/users/{user_id}/role")
async def change_user_role(
    user_id: UUID,
    role: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role('admin'))
):
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    old_role = user.role
    user.role = role
    await log_action(db, current_user.id, 'change_role', 'user', user_id, {"old_role": old_role, "new_role": role})
    await db.commit()
    return {"status": "success", "new_role": role}

@router.get("/audit-logs")
async def get_audit_logs(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    _ = Depends(require_role('admin'))
):
    stmt = select(AuditLog)
    total = await db.scalar(select(func.count()).select_from(AuditLog))
    stmt = stmt.offset((page - 1) * page_size).limit(page_size).order_by(AuditLog.created_at.desc())
    result = await db.execute(stmt)
    return {
        "items": result.scalars().all(),
        "total": total or 0,
        "page": page,
        "page_size": page_size
    }

@router.get("/stats")
async def platform_stats(
    db: AsyncSession = Depends(get_db),
    _ = Depends(require_role('admin'))
):
    users_count = await db.scalar(select(func.count()).select_from(User))
    events_count = await db.scalar(select(func.count()).select_from(Event))
    orgs_count = await db.scalar(select(func.count()).select_from(Organization))
    regs_count = await db.scalar(select(func.count()).select_from(Registration))
    
    return {
        "total_users": users_count or 0,
        "total_events": events_count or 0,
        "total_organizations": orgs_count or 0,
        "total_registrations": regs_count or 0
    }
