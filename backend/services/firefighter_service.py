from schemas.request_models import FirefighterSummaryRequest
from services.building_service import find_building_by_address
from services.incident_service import get_incident_by_id


def _risk_level(payload: FirefighterSummaryRequest):
    score = 0
    if payload.smoke_spread:
        score += 1
    if payload.people_trapped:
        score += 2
    if any(token in payload.report_text for token in ["폭발", "다수", "검은 연기", "고립"]):
        score += 1

    if score >= 3:
        return "높음"
    if score >= 1:
        return "중간"
    return "낮음"


def create_firefighter_summary(payload: FirefighterSummaryRequest):
    building = find_building_by_address(payload.address)
    risk_level = _risk_level(payload)

    priorities = [
        f"{payload.fire_floor} 진입 전 연기 확산 방향 확인",
        "계단실과 피난 경로 확보 여부 확인",
        "전기/가스 차단 가능성 현장 확인",
    ]

    if payload.people_trapped:
        priorities.insert(0, "인명 고립 가능 구역 우선 수색")

    if payload.smoke_spread:
        priorities.append("상층부 연기 확산 차단 및 배연 계획 수립")

    checklist = [
        "현장 지휘관에게 신고 요약 공유",
        "호흡보호장비 착용 상태 확인",
        "진입조와 대기조 임무 분리",
        "무전 채널과 퇴출 신호 확인",
    ]

    summary = (
        f"{payload.address} {payload.fire_floor}에서 화재 신고가 접수되었습니다. "
        f"신고 내용: {payload.report_text} "
        f"건물은 {building['structure']}이며 {building['risk_note']}. "
        f"현재 더미 판단 위험도는 {risk_level}입니다."
    )

    return {
        "building_info": building,
        "summary": summary,
        "risk_level": risk_level,
        "priorities": priorities,
        "checklist": checklist,
        "disclaimer": "시연용 더미 브리핑입니다. 화재 규모, 구조 안정성, 인명 상태는 현장 확인이 필요합니다.",
    }


def create_firefighter_briefing_for_incident(incident_id: int):
    incident = get_incident_by_id(incident_id)
    if not incident:
        return None

    payload = FirefighterSummaryRequest(
        address=incident["address"],
        report_text=incident["summary"],
        fire_floor=incident["fire_floor"],
        smoke_spread="연기" in incident["summary"],
        people_trapped="고립" in incident["summary"],
    )

    briefing = create_firefighter_summary(payload)
    briefing["incident_id"] = incident_id
    briefing["dispatch_status"] = incident["status"]
    return briefing
