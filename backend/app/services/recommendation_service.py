from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.event import Event
from app.models.user import User
from app.models.registration import Registration
from datetime import datetime

async def get_recommended_events(user: User, events: List[Event], db: AsyncSession) -> List[Dict[str, Any]]:
    # Get user's past registrations to determine category preferences
    stmt = select(Event.category).join(Registration).where(Registration.user_id == user.id)
    result = await db.execute(stmt)
    past_categories = [r[0] for r in result.all()]
    
    scored_events = []
    
    for event in events:
        score = 0
        reasons = []
        
        # Interest match (0-30)
        overlap = set(user.interests).intersection(set(event.tags))
        if overlap:
            match_score = min(30, len(overlap) * 10)
            score += match_score
            reasons.append(f"Matches your interests: {', '.join(overlap)}")
            
        # Category match (0-20)
        if event.category in past_categories:
            score += 20
            reasons.append(f"You often attend {event.category} events")
            
        # Branch relevance (0-15)
        if user.branch and event.eligibility and user.branch.lower() in event.eligibility.lower():
            score += 15
            reasons.append("Relevant to your branch")
            
        # Popularity (0-5)
        if event.capacity and event.capacity > 0:
            popularity = min(5, (event.views_count / event.capacity) * 5)
            score += popularity
            
        # Date proximity (0-5)
        days_away = (event.event_date - datetime.utcnow().date()).days
        if 0 <= days_away <= 7:
            score += 5
            reasons.append("Happening soon")
            
        # Normalize to 100
        score = min(100, score)
        
        if score > 0:
            scored_events.append({
                "event": event,
                "score": score,
                "reasons": reasons[:3] # Keep top 3 reasons
            })
            
    # Sort by score descending
    scored_events.sort(key=lambda x: x["score"], reverse=True)
    return scored_events
