import pytest

@pytest.mark.asyncio
async def test_admin_panel_unauthorized(client):
    response = await client.get("/api/admin/stats")
    assert response.status_code in [401, 403]

@pytest.mark.asyncio
async def test_admin_events_unauthorized(client):
    response = await client.get("/api/admin/events")
    assert response.status_code in [401, 403]
