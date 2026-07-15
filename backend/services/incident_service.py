import json
from datetime import datetime, timezone
from pathlib import Path

from schemas.request_models import CitizenIncidentReportRequest

DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "sample_incidents.json"
RISK_ORDER = {"높음": 3, "중간": 2, "낮음": 1}
STATUS_ORDER = {"접수됨": 3, "출동 중": 2, "현장 확인": 1, "진압 중": 1, "완료": 0}

_created_incidents = []


def _load_sample_incidents():
    with DATA_PATH.open(encoding="utf-8") as file:
        return json.load(file)


def _sort_incidents(incidents):
    return sorted(
        incidents,
        key=lambda item: (
            RISK_ORDER.get(item.get("risk_level"), 0),
            STATUS_ORDER.get(item.get("status"), 0),
            item.get("reported_at", ""),
            item.get("id", 0),
        ),
        reverse=True,
    )


def _next_incident_id():
    incidents = _load_sample_incidents() + _created_incidents
    return max((incident["id"] for incident in incidents), default=0) + 1


def _risk_level_from_report(payload: CitizenIncidentReportRequest):
    score = 0
    if payload.has_smoke:
        score += 1
    if payload.hallway_smoke_visible:
        score += 1
    if payload.has_flame:
        score += 2
    if payload.is_trapped:
        score += 2
    if not payload.stairs_available:
        score += 1
    if payload.has_vulnerable_people:
        score += 1
    if payload.has_child_companion:
        score += 1
    if payload.door_handle_hot:
        score += 1

    if score >= 4:
        return "높음"
    if score >= 2:
        return "중간"
    return "낮음"


def _summary_from_report(payload: CitizenIncidentReportRequest):
    conditions = []
    if payload.has_smoke:
        conditions.append("연기 발생")
    if payload.hallway_smoke_visible:
        conditions.append("복도 쪽 연기 확인")
    if payload.has_flame:
        conditions.append("불꽃 목격")
    if not payload.stairs_available:
        conditions.append("계단 이용 불확실")
    if payload.is_trapped:
        conditions.append("신고자 고립 가능")
    if payload.has_vulnerable_people:
        conditions.append("노약자/장애인 동행")
    if payload.has_child_companion:
        conditions.append("어린아이 동행")
    if payload.door_closed:
        conditions.append("문 닫힘")
    if payload.door_handle_hot:
        conditions.append("문 손잡이 열감")

    condition_text = ", ".join(conditions) if conditions else "세부 위험 정보 제한적"
    note = f" 추가 메모: {payload.report_note}" if payload.report_note.strip() else ""
    return f"{payload.current_floor}에서 시민 입력 신고 접수. {condition_text}.{note}"


def get_incidents():
    return _sort_incidents(_load_sample_incidents() + _created_incidents)


def get_incident_by_id(incident_id: int):
    for incident in get_incidents():
        if incident["id"] == incident_id:
            return incident
    return None


def create_incident_from_citizen_report(payload: CitizenIncidentReportRequest):
    incident = {
        "id": _next_incident_id(),
        "reported_at": datetime.now(timezone.utc).isoformat(),
        "address": payload.location,
        "fire_floor": payload.current_floor,
        "risk_level": _risk_level_from_report(payload),
        "status": "접수됨",
        "summary": _summary_from_report(payload),
        "source": "citizen_demo_report",
        "report": {
            "has_smoke": payload.has_smoke,
            "has_flame": payload.has_flame,
            "stairs_available": payload.stairs_available,
            "is_trapped": payload.is_trapped,
            "has_vulnerable_people": payload.has_vulnerable_people,
            "has_child_companion": payload.has_child_companion,
            "hallway_smoke_visible": payload.hallway_smoke_visible,
            "door_closed": payload.door_closed,
            "door_handle_hot": payload.door_handle_hot,
            "report_note": payload.report_note,
        },
    }
    _created_incidents.append(incident)
    return incident
