import re

from schemas.request_models import EvacuationGuideRequest
from services.incident_service import get_incident_by_id


DISCLAIMER = (
    "현재 입력된 정보를 기준으로 한 참고 안내입니다. "
    "실제 상황에서는 119와 현장 안내를 우선하세요."
)


def create_evacuation_guide_for_incident(incident_id: int):
    incident = get_incident_by_id(incident_id)
    if not incident:
        return None

    report = incident.get("report", {})
    payload = EvacuationGuideRequest(
        location=incident["address"],
        current_floor=incident["fire_floor"],
        has_smoke=report.get("has_smoke", "연기" in incident["summary"]),
        has_flame=report.get("has_flame", "불꽃" in incident["summary"] or "화재" in incident["summary"]),
        stairs_available=report.get("stairs_available", "계단 이용 가능" in incident["summary"]),
        is_trapped=report.get("is_trapped", "고립" in incident["summary"]),
        has_vulnerable_people=report.get("has_vulnerable_people", False),
        has_child_companion=report.get("has_child_companion", False),
        hallway_smoke_visible=report.get("hallway_smoke_visible", False),
        door_closed=report.get("door_closed", False),
        door_handle_hot=report.get("door_handle_hot", False),
        report_note=report.get("report_note", ""),
    )

    guide = create_evacuation_guide(payload)
    guide["incident_id"] = incident_id
    return guide


def _parse_floor_number(current_floor: str):
    match = re.search(r"-?\d+", current_floor or "")
    return int(match.group()) if match else None


def _contains_any(text: str, keywords):
    return any(keyword in text for keyword in keywords)


def _dedupe(items):
    deduped = []
    for item in items:
        if item not in deduped:
            deduped.append(item)
    return deduped


def _derive_context(payload: EvacuationGuideRequest):
    note = (payload.report_note or "").lower()
    floor_number = _parse_floor_number(payload.current_floor)
    is_basement = "지하" in payload.current_floor or (floor_number is not None and floor_number < 0)
    is_high_floor = floor_number is not None and floor_number >= 6

    return {
        "note": note,
        "floor_number": floor_number,
        "is_basement": is_basement,
        "is_high_floor": is_high_floor,
        "mentions_child": _contains_any(note, ["아이", "어린", "유아", "아동"]),
        "mentions_hallway_smoke": "복도" in note and "연기" in note,
        "mentions_door_risk": _contains_any(note, ["문", "손잡이", "문고리"]) and _contains_any(
            note, ["뜨겁", "열", "닫", "안 열"]
        ),
        "mentions_window": _contains_any(note, ["창문", "베란다", "발코니"]),
    }


def create_evacuation_guide(payload: EvacuationGuideRequest):
    context = _derive_context(payload)
    actions = [
        "119에 현재 주소, 층수, 동행자 여부를 먼저 알리세요.",
    ]
    avoid_actions = [
        "엘리베이터 사용",
        "대피 후 건물 재진입",
        "확인되지 않은 통로로 단독 이동",
    ]
    guide_parts = []

    child_companion = payload.has_child_companion or context["mentions_child"]
    hallway_smoke = payload.hallway_smoke_visible or context["mentions_hallway_smoke"] or payload.has_smoke
    door_risk = payload.door_closed or payload.door_handle_hot or context["mentions_door_risk"]

    if payload.is_trapped:
        guide_parts.append("현재 위치에서 무리하게 이동하지 말고 구조 요청을 유지하는 상황으로 판단됩니다.")
        actions.extend(
            [
                "문틈을 젖은 수건이나 천으로 막아 연기 유입을 줄이세요.",
                "창문이나 외부에서 보이는 위치에서 구조 신호를 보내되, 뛰어내리거나 난간으로 이동하지 마세요.",
                "가능하면 바닥 가까이 낮은 자세를 유지하고 통화 배터리를 아끼세요.",
            ]
        )
    elif not payload.stairs_available or payload.has_flame:
        guide_parts.append("계단이나 복도 이용이 불확실하므로 이동 전 통로 상태를 다시 확인해야 합니다.")
        actions.extend(
            [
                "불꽃이 보이는 방향과 연기가 짙은 방향으로 이동하지 마세요.",
                "가까운 방이나 구획된 공간으로 들어가 문을 닫고 119에 위치를 반복해서 알리세요.",
            ]
        )
    else:
        guide_parts.append("통로가 확인되는 경우에만 낮은 자세로 가까운 계단 방향 대피를 시도하세요.")
        actions.extend(
            [
                "수건이나 옷으로 코와 입을 가리고 벽을 따라 천천히 이동하세요.",
                "계단 진입 전 연기와 열기가 강해지는지 확인하고 이상하면 즉시 되돌아가세요.",
            ]
        )

    if hallway_smoke:
        guide_parts.append("복도 쪽 연기 가능성이 있으므로 복도 이동은 특히 주의가 필요합니다.")
        actions.insert(1, "복도를 지나야 한다면 머리와 몸을 최대한 숙이고, 젖은 천으로 코와 입을 가리세요.")
        avoid_actions.append("연기가 보이는 복도에서 서서 빠르게 뛰기")

    if door_risk:
        guide_parts.append("문 주변 열기나 닫힌 문 정보가 있어 문을 열기 전 확인이 필요합니다.")
        actions.insert(1, "문 손잡이를 함부로 잡지 말고 손등으로 문 주변 열기를 확인하세요.")
        actions.insert(2, "열리지 않는 문은 억지로 열지 말고 다른 위치에서 구조 요청을 이어가세요.")
        avoid_actions.append("뜨겁거나 열리지 않는 문 강제로 열기")

    if child_companion:
        guide_parts.append("어린아이는 놀라서 구석이나 가구 뒤로 숨을 수 있어 계속 시야 안에 두어야 합니다.")
        actions.insert(1, "어린아이가 있다면 손을 잡거나 품 가까이에 두고, 구석으로 숨지 않는지 계속 확인하세요.")

    if payload.has_vulnerable_people:
        actions.append("노약자, 장애인 등 이동이 느린 동행자는 한 사람씩 역할을 나눠 부축하고 속도를 맞추세요.")

    if context["is_basement"]:
        guide_parts.append("지하층은 연기가 아래로 유입될 수 있어 출입구 방향 확인과 구조 요청이 중요합니다.")
        actions.append("지하층이면 출입구 방향의 연기와 열기를 확인하고, 막혀 있으면 즉시 현재 위치를 119에 알리세요.")

    if context["is_high_floor"]:
        actions.append("고층에서는 창문 밖으로 이동하거나 뛰어내리지 말고 계단 상태와 구조 안내를 우선 확인하세요.")

    if context["mentions_window"]:
        actions.append("창문을 열 때는 연기가 더 들어오는지 확인하고, 구조 신호가 필요한 경우에만 짧게 활용하세요.")

    if payload.report_note.strip():
        guide_parts.append("추가 메모에 적힌 상황을 반영한 참고 안내입니다.")

    warning = "상황이 나빠지거나 이동 경로가 불확실하면 즉시 이동을 멈추고 119 및 현장 안내를 우선하세요."

    return {
        "guide": f"{payload.location} {payload.current_floor} 기준 안내입니다. {' '.join(guide_parts)}",
        "priority_actions": _dedupe(actions),
        "avoid_actions": _dedupe(avoid_actions),
        "warning": warning,
        "disclaimer": DISCLAIMER,
    }
