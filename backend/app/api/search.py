from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import List, Optional
from app.database import get_db
from app.models.event import Event
from app.services.ai_service import parse_natural_query
from app.api.events import list_events

router = APIRouter()

class NaturalSearchRequest(BaseModel):
    query: str

@router.get("/")
async def standard_search(
    category: Optional[str] = None,
    tags: Optional[List[str]] = Query(None),
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    return await list_events(page=1, page_size=50, category=category, tags=tags, search=search, db=db)

@router.post("/natural")
async def natural_search(
    request: NaturalSearchRequest,
    db: AsyncSession = Depends(get_db)
):
    parsed = await parse_natural_query(request.query)
    
    if parsed:
        return await list_events(
            page=1, 
            page_size=50, 
            category=parsed.category,
            tags=parsed.tags,
            search=parsed.search,
            db=db
        )
    else:
        # Fallback to standard text search
        return await list_events(page=1, page_size=50, search=request.query, db=db)
