from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from app.database import get_db
from app.models.user import User
from app.models.event import Event
from app.middleware.auth import get_current_user, require_role
from app.services.ai_service import generate_event_content
from datetime import datetime

router = APIRouter()

class CopilotRequest(BaseModel):
    prompt: str

@router.post("/copilot")
async def event_copilot(
    request: CopilotRequest,
    current_user: User = Depends(require_role('organizer', 'admin'))
):
    content = await generate_event_content(request.prompt)
    if not content:
        raise HTTPException(status_code=500, detail="AI generation failed")
    return content

@router.post("/digest")
async def generate_digest(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Fetch upcoming events matching user interests for the prompt
    stmt = select(Event).where(Event.status == 'published', Event.event_date >= datetime.utcnow().date()).limit(20)
    result = await db.execute(stmt)
    events = result.scalars().all()
    
    event_titles = [e.title for e in events]
    return {
        "digest": f"Here is your weekly digest based on {len(events)} upcoming events on campus! Check out events like: {', '.join(event_titles[:3])}."
    }
