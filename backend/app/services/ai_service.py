from google import genai
from pydantic import BaseModel, Field
from typing import List, Optional
from app.config import settings

class EventCopilotResponse(BaseModel):
    description: str = ""
    category: str = ""
    tags: List[str] = []
    target_audience: str = ""
    announcement: str = ""

class ParsedQueryResponse(BaseModel):
    category: Optional[str] = None
    tags: Optional[List[str]] = Field(default_factory=list)
    search: Optional[str] = None

_client = None

def _get_client():
    global _client
    if _client is None:
        api_key = settings.GEMINI_API_KEY
        if not api_key or api_key == "your-gemini-api-key":
            return None
        _client = genai.Client(api_key=api_key)
    return _client

async def generate_event_content(prompt: str) -> EventCopilotResponse | None:
    client = _get_client()
    if not client:
        return None
    try:
        response = await client.aio.models.generate_content(
            model='gemini-2.0-flash',
            contents=f"Generate event details for a college campus event based on this prompt. Return JSON with fields: description, category, tags (array), target_audience, announcement.\n\nPrompt: {prompt}",
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
    client = _get_client()
    if not client:
        return None
    try:
        response = await client.aio.models.generate_content(
            model='gemini-2.0-flash',
            contents=f"Parse this campus event search query into structured filters. Extract category, tags (array), and search text.\n\nQuery: {query}",
            config=genai.types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=ParsedQueryResponse,
            ),
        )
        return response.parsed
    except Exception as e:
        print(f"AI Parse Error: {e}")
        return None
