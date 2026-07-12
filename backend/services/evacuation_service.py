from schemas.request_models import EvacuationGuideRequest
from services.incident_service import get_incident_by_id


def create_evacuation_guide_for_incident(incident_id: int):
    incident = get_incident_by_id(incident_id)
    if not incident:
        return None

    payload = EvacuationGuideRequest(
        location=incident["address"],
        current_floor=incident["fire_floor"],
        has_smoke=incident.get("report", {}).get("has_smoke", "연기" in incident["summary"]),
        has_flame=incident.get("report", {}).get("has_flame", "화재" in incident["summary"] or "불꽃" in incident["summary"]),
        stairs_available=incident.get("report", {}).get("stairs_available", "계단 이용 가능" in incident["summary"]),
        is_trapped=incident.get("report", {}).get("is_trapped", "고립" in incident["summary"]),
        has_vulnerable_people=incident.get("report", {}).get("has_vulnerable_people", False),
    )

    guide = create_evacuation_guide(payload)
    guide["incident_id"] = incident_id
    guide["disclaimer"] = "현재 입력된 정보를 기준으로 한 참고 안내입니다. 실제 상황에서는 119와 현장 안내를 우선하세요."
    return guide


def create_evacuation_guide(payload: EvacuationGuideRequest):
    actions = []

    if payload.is_trapped:
        guide = "문을 닫고 연기가 들어오는 틈을 막은 뒤 119에 현재 위치와 층수를 반복해서 알리세요."
        actions.extend([
            "문틈을 젖은 천이나 옷으로 막기",
            "창가나 잘 보이는 위치에서 구조 신호 보내기",
            "낮은 자세로 호흡하고 이동 최소화하기",
        ])
    elif not payload.stairs_available or payload.has_flame:
        guide = "계단이나 복도가 위험할 수 있습니다. 무리하게 이동하지 말고 안전한 방으로 이동해 구조 요청을 유지하세요."
        actions.extend([
            "불꽃이 보이는 방향으로 이동하지 않기",
            "가까운 방으로 들어가 문 닫기",
            "119에 위치, 층수, 동행자 여부 알리기",
        ])
    else:
        guide = "엘리베이터를 사용하지 말고 낮은 자세로 가장 가까운 안전한 계단을 통해 대피하세요."
        actions.extend([
            "젖은 천이나 옷으로 코와 입 가리기",
            "벽을 따라 낮은 자세로 계단까지 이동하기",
            "건물 밖 집결지로 이동 후 재진입하지 않기",
        ])

    if payload.has_smoke:
        actions.insert(0, "연기 아래쪽으로 몸을 낮추고 짧게 호흡하기")

    if payload.has_vulnerable_people:
        actions.append("노약자, 아이, 장애인은 한 명씩 부축하고 이동 속도를 맞추기")

    warning = "엘리베이터는 사용하지 마세요. 상황이 악화되면 즉시 119와 현장 안내를 우선하세요."

    return {
        "guide": f"{payload.location} {payload.current_floor} 기준 안내입니다. {guide}",
        "priority_actions": actions,
        "avoid_actions": ["엘리베이터 사용", "연기가 많은 방향으로 이동", "대피 후 건물 재진입"],
        "warning": warning,
        "disclaimer": "현재 입력된 정보를 기준으로 한 참고 안내입니다. 실제 상황에서는 119와 현장 안내를 우선하세요.",
    }
