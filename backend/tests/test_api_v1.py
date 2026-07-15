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
    assert incidents == []


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
    assert data["total_incidents"] == 0
    assert data["high_risk_count"] == 0
    assert "risk_counts" in data
    assert "status_counts" in data


def test_created_citizen_report_is_visible_to_other_roles():
    report_response = client.post(
        "/api/v1/incidents/citizen-reports",
        json={
            "location": "시연용 복합 건물",
            "current_floor": "7층",
            "has_smoke": True,
            "has_flame": True,
            "stairs_available": False,
            "is_trapped": True,
            "has_vulnerable_people": False,
            "has_child_companion": True,
            "hallway_smoke_visible": True,
            "door_closed": True,
            "door_handle_hot": True,
            "report_note": "복도 쪽 연기가 강하고 아이가 함께 있음",
        },
    )

    assert report_response.status_code == 200
    data = report_response.json()["data"]
    created = data["incident"]
    guide = data["evacuation_guide"]
    assert created["address"] == "시연용 복합 건물"
    assert created["risk_level"] == "높음"
    assert created["report"]["has_child_companion"] is True
    assert any("어린아이" in action for action in guide["priority_actions"])
    assert any("문 손잡이" in action for action in guide["priority_actions"])
    assert any("복도" in action for action in guide["priority_actions"])

    incidents_response = client.get("/api/v1/incidents")
    incident_ids = [incident["id"] for incident in incidents_response.json()["data"]["incidents"]]
    assert created["id"] in incident_ids

    briefing_response = client.get(f"/api/v1/firefighter/incidents/{created['id']}/briefing")
    assert briefing_response.status_code == 200
    assert briefing_response.json()["data"]["incident_id"] == created["id"]

    guide_response = client.get(f"/api/v1/citizen/incidents/{created['id']}/evacuation-guide")
    assert guide_response.status_code == 200
    assert guide_response.json()["data"]["incident_id"] == created["id"]


def test_evacuation_guide_changes_by_note_floor_and_conditions():
    response = client.post(
        "/api/v1/citizen/evacuation-guide",
        json={
            "location": "시연용 지하 상가",
            "current_floor": "지하 1층",
            "has_smoke": False,
            "has_flame": False,
            "stairs_available": True,
            "is_trapped": False,
            "has_vulnerable_people": False,
            "has_child_companion": False,
            "hallway_smoke_visible": False,
            "door_closed": False,
            "door_handle_hot": False,
            "report_note": "복도에 연기가 보이고 문 손잡이가 뜨겁습니다. 어린 아이와 있습니다.",
        },
    )

    assert response.status_code == 200
    guide = response.json()["data"]
    assert "지하층" in guide["guide"]
    assert any("어린아이" in action for action in guide["priority_actions"])
    assert any("복도" in action for action in guide["priority_actions"])
    assert any("문 손잡이" in action for action in guide["priority_actions"])
