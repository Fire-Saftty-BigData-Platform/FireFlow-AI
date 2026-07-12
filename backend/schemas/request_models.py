from pydantic import BaseModel


class EvacuationGuideRequest(BaseModel):
    location: str
    current_floor: str
    has_smoke: bool
    has_flame: bool
    stairs_available: bool
    is_trapped: bool
    has_vulnerable_people: bool


class CitizenIncidentReportRequest(EvacuationGuideRequest):
    report_note: str = ""


class FirefighterSummaryRequest(BaseModel):
    address: str
    report_text: str
    fire_floor: str
    smoke_spread: bool
    people_trapped: bool
