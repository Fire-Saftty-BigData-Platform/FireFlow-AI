from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from schemas.api_response import ApiResponse, error_response, success_response
from schemas.request_models import EvacuationGuideRequest, FirefighterSummaryRequest
from services.control_service import create_control_overview
from services.evacuation_service import create_evacuation_guide, create_evacuation_guide_for_incident
from services.firefighter_service import create_firefighter_briefing_for_incident, create_firefighter_summary
from services.incident_service import get_incident_by_id, get_incidents

app = FastAPI(title="FireFlow AI Backend", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(HTTPException)
def http_exception_handler(request: Request, exc: HTTPException):
    code = "INCIDENT_NOT_FOUND" if exc.status_code == 404 else "HTTP_ERROR"
    message = exc.detail if isinstance(exc.detail, str) else "요청을 처리하지 못했습니다."
    return JSONResponse(status_code=exc.status_code, content=error_response(code, message))


@app.exception_handler(RequestValidationError)
def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content=error_response("VALIDATION_ERROR", "요청값 형식이 올바르지 않습니다."),
    )


@app.get("/")
def health_check():
    return {"message": "FireFlow AI backend is running"}


@app.get("/api/v1/health", response_model=ApiResponse)
def health_check_v1():
    return success_response({"status": "ok", "service": "fireflow-ai"})


@app.post("/api/v1/citizen/evacuation-guide", response_model=ApiResponse)
def evacuation_guide(payload: EvacuationGuideRequest):
    return success_response(create_evacuation_guide(payload))


@app.get("/api/v1/citizen/incidents/{incident_id}/evacuation-guide", response_model=ApiResponse)
def evacuation_guide_by_incident(incident_id: int):
    guide = create_evacuation_guide_for_incident(incident_id)
    if not guide:
        raise HTTPException(status_code=404, detail="신고 정보를 찾을 수 없습니다.")
    return success_response(guide)


@app.post("/api/v1/firefighter/summary", response_model=ApiResponse)
def firefighter_summary(payload: FirefighterSummaryRequest):
    return success_response(create_firefighter_summary(payload))


@app.get("/api/v1/firefighter/incidents/{incident_id}/briefing", response_model=ApiResponse)
def firefighter_briefing_by_incident(incident_id: int):
    briefing = create_firefighter_briefing_for_incident(incident_id)
    if not briefing:
        raise HTTPException(status_code=404, detail="신고 정보를 찾을 수 없습니다.")
    return success_response(briefing)


@app.get("/api/v1/incidents", response_model=ApiResponse)
def incidents():
    return success_response({"incidents": get_incidents()})


@app.get("/api/v1/incidents/{incident_id}", response_model=ApiResponse)
def incident_detail(incident_id: int):
    incident = get_incident_by_id(incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="신고 정보를 찾을 수 없습니다.")
    return success_response(incident)


@app.get("/api/v1/control/overview", response_model=ApiResponse)
def control_overview():
    return success_response(create_control_overview())
