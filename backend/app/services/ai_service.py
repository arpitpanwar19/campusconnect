from google import genai
from pydantic import BaseModel, Field
from typing import List, Optional
import os
from app.config import settings

class EventCopilotResponse(BaseModel):
    description: str
    category: str
    tags: List[str]
    target_audience: str
    announcement: str

class ParsedQueryResponse(BaseModel):
    category: Optional[str] = None
    tags: Optional[List[str]] = Field(default_factory=list)
    search: Optional[str] = None

client = genai.Client(api_key=settings.GEMINI_API_KEY)

async def generate_event_content(prompt: str) -> EventCopilotResponse | None:
    try:
        response = await client.aio.models.generate_content(
            model='gemini-2.5-flash',
            contents=f"Generate event details based on this prompt: {prompt}",
            config=genai.types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=EventCopilotResponse,
            ),
        )
        return response.parsed
    except Exception as e:
        print(f"AI Generation Error: {e}")
        return None

async def parse_natural_query(query: str) -> ParsedQueryResponse | None:
    try:
        response = await client.aio.models.generate_content(
            model='gemini-2.5-flash',
            contents=f"Parse this event search query into filters: {query}",
            config=genai.types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=ParsedQueryResponse,
            ),
        )
        return response.parsed
    except Exception as e:
        print(f"AI Parse Error: {e}")
        return None
