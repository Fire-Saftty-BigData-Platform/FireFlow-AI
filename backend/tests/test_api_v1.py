import sys
from pathlib import Path

from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from main import app


client = TestClient(app)


def test_health_response_shape():
    response = client.get("/api/v1/health")

    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert body["data"]["status"] == "ok"
    assert body["error"] is None


def test_incidents_are_wrapped_and_sorted():
    response = client.get("/api/v1/incidents")

    assert response.status_code == 200
    body = response.json()
    incidents = body["data"]["incidents"]
    assert body["success"] is True
    assert len(incidents) >= 1
    assert incidents[0]["risk_level"] == "높음"


def test_unknown_incident_returns_common_error():
    response = client.get("/api/v1/incidents/9999")

    assert response.status_code == 404
    body = response.json()
    assert body["success"] is False
    assert body["data"] is None
    assert body["error"]["code"] == "INCIDENT_NOT_FOUND"


def test_control_overview_contains_backend_stats():
    response = client.get("/api/v1/control/overview")

    assert response.status_code == 200
    data = response.json()["data"]
    assert data["total_incidents"] == len(data["incidents"])
    assert data["high_risk_count"] >= 1
    assert "risk_counts" in data
    assert "status_counts" in data


def test_role_based_incident_endpoints():
    guide_response = client.get("/api/v1/citizen/incidents/1/evacuation-guide")
    briefing_response = client.get("/api/v1/firefighter/incidents/1/briefing")

    assert guide_response.status_code == 200
    assert guide_response.json()["data"]["incident_id"] == 1
    assert "disclaimer" in guide_response.json()["data"]
    assert briefing_response.status_code == 200
    assert briefing_response.json()["data"]["incident_id"] == 1
