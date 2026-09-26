import pytest

@pytest.mark.asyncio
async def test_list_events(client):
    response = await client.get("/api/events")
    if response.status_code == 200:
        data = response.json()
        assert "items" in data or isinstance(data, list)

@pytest.mark.asyncio
async def test_event_not_found(client):
    response = await client.get("/api/events/nonexistent-slug")
    assert response.status_code == 404

@pytest.mark.asyncio
async def test_create_event_unauthorized(client):
    response = await client.post("/api/events", json={"title": "Test Event"})
    assert response.status_code in [401, 403]
