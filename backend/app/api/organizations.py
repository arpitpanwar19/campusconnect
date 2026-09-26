from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List
from uuid import UUID
from app.database import get_db
from app.models.organization import Organization, OrganizationMember
from app.models.event import Event
from app.models.user import User
from app.schemas.organization import OrgCreate, OrgUpdate, OrgResponse, OrgMemberAdd
from app.middleware.auth import get_current_user, get_optional_user, require_role
import re

router = APIRouter()

def generate_slug(name: str) -> str:
    return re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')

@router.get("/", response_model=List[OrgResponse])
async def list_orgs(db: AsyncSession = Depends(get_db)):
    stmt = select(Organization).where(Organization.is_verified == True)
    result = await db.execute(stmt)
    orgs = result.scalars().all()
    
    responses = []
    for org in orgs:
        member_count = await db.scalar(select(func.count()).select_from(OrganizationMember).where(OrganizationMember.org_id == org.id))
        event_count = await db.scalar(select(func.count()).select_from(Event).where(Event.org_id == org.id, Event.status == 'published'))
        
        org_dict = org.__dict__.copy()
        org_dict['member_count'] = member_count or 0
        org_dict['event_count'] = event_count or 0
        responses.append(OrgResponse(**org_dict))
        
    return responses

@router.get("/{slug}", response_model=OrgResponse)
async def get_org(slug: str, db: AsyncSession = Depends(get_db)):
    stmt = select(Organization).where(Organization.slug == slug)
    result = await db.execute(stmt)
    org = result.scalar_one_or_none()
    
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
        
    member_count = await db.scalar(select(func.count()).select_from(OrganizationMember).where(OrganizationMember.org_id == org.id))
    event_count = await db.scalar(select(func.count()).select_from(Event).where(Event.org_id == org.id, Event.status == 'published'))
    
    org_dict = org.__dict__.copy()
    org_dict['member_count'] = member_count or 0
    org_dict['event_count'] = event_count or 0
    return OrgResponse(**org_dict)

@router.post("/", response_model=OrgResponse)
async def create_org(
    data: OrgCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    slug = generate_slug(data.name)
    existing = await db.scalar(select(Organization).where(Organization.slug == slug))
    if existing:
        raise HTTPException(status_code=400, detail="Organization with this name already exists")
        
    org = Organization(**data.model_dump(), slug=slug, created_by=current_user.id)
    db.add(org)
    await db.commit()
    await db.refresh(org)
    
    member = OrganizationMember(org_id=org.id, user_id=current_user.id, role='admin')
    db.add(member)
    await db.commit()
    
    return await get_org(slug=org.slug, db=db)

@router.put("/{org_id}", response_model=OrgResponse)
async def update_org(
    org_id: UUID,
    data: OrgUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    org = await db.get(Organization, org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
        
    member = await db.scalar(select(OrganizationMember).where(OrganizationMember.org_id == org_id, OrganizationMember.user_id == current_user.id, OrganizationMember.role == 'admin'))
    if not member and current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Not authorized")
        
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(org, key, value)
        
    await db.commit()
    return await get_org(slug=org.slug, db=db)

@router.get("/{org_id}/members")
async def list_members(
    org_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    member = await db.scalar(select(OrganizationMember).where(OrganizationMember.org_id == org_id, OrganizationMember.user_id == current_user.id, OrganizationMember.role == 'admin'))
    if not member and current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Not authorized")
        
    stmt = select(OrganizationMember, User).join(User).where(OrganizationMember.org_id == org_id)
    result = await db.execute(stmt)
    return [{"member": m, "user": u} for m, u in result.all()]

@router.post("/{org_id}/members")
async def add_member(
    org_id: UUID,
    data: OrgMemberAdd,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    admin_member = await db.scalar(select(OrganizationMember).where(OrganizationMember.org_id == org_id, OrganizationMember.user_id == current_user.id, OrganizationMember.role == 'admin'))
    if not admin_member and current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Not authorized")
        
    new_member = OrganizationMember(org_id=org_id, user_id=data.user_id, role=data.role)
    db.add(new_member)
    await db.commit()
    return {"status": "added"}

@router.delete("/{org_id}/members/{user_id}")
async def remove_member(
    org_id: UUID,
    user_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    admin_member = await db.scalar(select(OrganizationMember).where(OrganizationMember.org_id == org_id, OrganizationMember.user_id == current_user.id, OrganizationMember.role == 'admin'))
    if not admin_member and current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Not authorized")
        
    target = await db.scalar(select(OrganizationMember).where(OrganizationMember.org_id == org_id, OrganizationMember.user_id == user_id))
    if target:
        await db.delete(target)
        await db.commit()
    return {"status": "removed"}
