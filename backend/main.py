from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from schemas.request_models import EvacuationGuideRequest, FirefighterSummaryRequest
from services.evacuation_service import create_evacuation_guide
from services.firefighter_service import create_firefighter_summary
from services.incident_service import get_incident_by_id, get_incidents

app = FastAPI(title="FireFlow AI Backend", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def health_check():
    return {"message": "FireFlow AI backend is running"}


@app.post("/api/evacuation-guide")
def evacuation_guide(payload: EvacuationGuideRequest):
    return create_evacuation_guide(payload)


@app.post("/api/firefighter-summary")
def firefighter_summary(payload: FirefighterSummaryRequest):
    return create_firefighter_summary(payload)


@app.get("/api/incidents")
def incidents():
    return {"incidents": get_incidents()}


@app.get("/api/incidents/{incident_id}")
def incident_detail(incident_id: int):
    incident = get_incident_by_id(incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident
