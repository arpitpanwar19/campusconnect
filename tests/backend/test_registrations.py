import pytest

@pytest.mark.asyncio
async def test_register_unauthorized(client):
    response = await client.post("/api/registrations", json={"event_id": 1})
    assert response.status_code in [401, 403]

@pytest.mark.asyncio
async def test_my_registrations_unauthorized(client):
    response = await client.get("/api/registrations/my")
    assert response.status_code in [401, 403]
