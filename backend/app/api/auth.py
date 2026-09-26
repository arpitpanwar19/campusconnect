from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserOnboarding, UserProfile, UserUpdate
from app.middleware.auth import get_current_user
import uuid

router = APIRouter()

@router.post("/signup", response_model=UserProfile)
async def signup(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    stmt = select(User).where(User.email == user_data.email)
    result = await db.execute(stmt)
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="User already exists")
        
    try:
        user_uuid = uuid.UUID(user_data.id)
    except ValueError:
        user_uuid = uuid.uuid4()
        
    new_user = User(
        id=user_uuid,
        email=user_data.email,
        full_name=user_data.full_name,
        role='student'
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user

@router.post("/onboarding", response_model=UserProfile)
async def onboarding(
    data: UserOnboarding, 
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    current_user.admission_year = data.admission_year
    current_user.branch = data.branch
    current_user.interests = data.interests
    current_user.goals = data.goals
    current_user.onboarding_complete = True
    
    await db.commit()
    await db.refresh(current_user)
    return current_user

@router.get("/me", response_model=UserProfile)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UserProfile)
async def update_me(
    data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(current_user, key, value)
        
    await db.commit()
    await db.refresh(current_user)
    return current_user
