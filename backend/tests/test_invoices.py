from fastapi.testclient import TestClient

from app.main import app


def test_list_invoices_requires_auth():
    with TestClient(app) as client:
        response = client.get("/api/invoices")
    assert response.status_code == 401
