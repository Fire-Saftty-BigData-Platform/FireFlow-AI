from services.incident_service import get_incidents


def create_control_overview():
    incidents = get_incidents()
    risk_counts = {}
    status_counts = {}

    for incident in incidents:
        risk = incident.get("risk_level", "미확인")
        status = incident.get("status", "미확인")
        risk_counts[risk] = risk_counts.get(risk, 0) + 1
        status_counts[status] = status_counts.get(status, 0) + 1

    active_count = sum(1 for incident in incidents if incident.get("status") != "완료")

    return {
        "total_incidents": len(incidents),
        "high_risk_count": risk_counts.get("높음", 0),
        "active_count": active_count,
        "risk_counts": risk_counts,
        "status_counts": status_counts,
        "incidents": incidents,
    }
