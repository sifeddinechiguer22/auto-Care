from fastapi.testclient import TestClient

from app.main import app


def test_login_returns_token_and_user():
    with TestClient(app) as client:
        response = client.post(
            "/api/auth/login",
            json={"email": "admin@autocare.local", "password": "Admin123!"},
        )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "admin@autocare.local"
    assert data["role"] == "ADMIN"


def test_get_me_requires_auth():
    with TestClient(app) as client:
        response = client.get("/api/auth/me")
    assert response.status_code == 401
