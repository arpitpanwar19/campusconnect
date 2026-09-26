import pytest

@pytest.mark.asyncio
async def test_health_check(client):
    response = await client.get("/api/health")
    assert response.status_code == 200

@pytest.mark.asyncio
async def test_unauthorized_access(client):
    response = await client.get("/api/auth/me")
    assert response.status_code in [401, 403]

@pytest.mark.asyncio
async def test_events_list_public(client):
    response = await client.get("/api/events")
    # depending on auth requirement, could be 200, 401, etc.
    assert response.status_code in [200, 401, 403]
