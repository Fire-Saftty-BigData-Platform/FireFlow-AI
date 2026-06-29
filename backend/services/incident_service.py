import json
from pathlib import Path

DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "sample_incidents.json"
RISK_ORDER = {"높음": 3, "중간": 2, "낮음": 1}


def get_incidents():
    with DATA_PATH.open(encoding="utf-8") as file:
        incidents = json.load(file)
    return sorted(incidents, key=lambda item: RISK_ORDER.get(item["risk_level"], 0), reverse=True)


def get_incident_by_id(incident_id: int):
    for incident in get_incidents():
        if incident["id"] == incident_id:
            return incident
    return None
