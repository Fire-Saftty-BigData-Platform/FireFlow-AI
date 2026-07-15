from pydantic import BaseModel


class EvacuationGuideRequest(BaseModel):
    location: str
    current_floor: str
    has_smoke: bool = False
    has_flame: bool = False
    stairs_available: bool = False
    is_trapped: bool = False
    has_vulnerable_people: bool = False
    has_child_companion: bool = False
    hallway_smoke_visible: bool = False
    door_closed: bool = False
    door_handle_hot: bool = False
    report_note: str = ""


class CitizenIncidentReportRequest(EvacuationGuideRequest):
    report_note: str = ""


class FirefighterSummaryRequest(BaseModel):
    address: str
    report_text: str
    fire_floor: str
    smoke_spread: bool
    people_trapped: bool
