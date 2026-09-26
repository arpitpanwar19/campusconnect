import pytest

@pytest.mark.asyncio
async def test_copilot_unauthorized(client):
    response = await client.post("/api/ai/copilot", json={"title": "Test"})
    assert response.status_code in [401, 403]

@pytest.mark.asyncio
async def test_search_natural_unauthorized(client):
    response = await client.post("/api/search/natural", json={"query": "test"})
    assert response.status_code in [401, 403]
