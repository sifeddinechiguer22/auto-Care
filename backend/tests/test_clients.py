from fastapi.testclient import TestClient

from app.main import app


def test_create_client_requires_auth():
    with TestClient(app) as client:
        response = client.post(
            "/api/clients",
            json={
                "first_name": "Alice",
                "last_name": "Martin",
                "phone": "+212600000000",
                "email": "alice@example.com",
                "address": "Casablanca",
            },
        )
    assert response.status_code == 401
