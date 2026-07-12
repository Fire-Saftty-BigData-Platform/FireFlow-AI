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


def test_created_citizen_report_is_visible_to_other_roles():
    report_response = client.post(
        "/api/v1/incidents/citizen-reports",
        json={
            "location": "시연용 신규 건물",
            "current_floor": "7층",
            "has_smoke": True,
            "has_flame": True,
            "stairs_available": False,
            "is_trapped": True,
            "has_vulnerable_people": False,
            "report_note": "복도 쪽 열기와 연기가 강함",
        },
    )

    assert report_response.status_code == 200
    created = report_response.json()["data"]["incident"]
    assert created["address"] == "시연용 신규 건물"
    assert created["risk_level"] == "높음"

    incidents_response = client.get("/api/v1/incidents")
    incident_ids = [incident["id"] for incident in incidents_response.json()["data"]["incidents"]]
    assert created["id"] in incident_ids

    briefing_response = client.get(f"/api/v1/firefighter/incidents/{created['id']}/briefing")
    assert briefing_response.status_code == 200
    assert briefing_response.json()["data"]["incident_id"] == created["id"]
