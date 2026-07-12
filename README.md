# FireFlow AI

FireFlow AI는 화재 발생 시 역할에 따라 필요한 기능을 다르게 제공하는 AI 기반 소방안전 웹서비스 MVP입니다.

이 버전은 GitHub `main` 브랜치에 올릴 수 있는 안정적인 초기 버전을 목표로 하며, 실제 외부 API나 인증 시스템 없이 더미 데이터와 더미 로직만으로 전체 흐름을 시연합니다.

## 공모전 MVP 범위

이 프로젝트는 공모전 발표와 기능 시연을 위한 프로토타입입니다.

- 실제 119 신고 접수 시스템과 연동하지 않습니다.
- 실제 소방 출동 지시, 배차, 상황 전파 시스템과 연동하지 않습니다.
- 화면의 신고 목록과 출동 상태는 더미 데이터 기반 시연 정보입니다.
- 대피 안내와 현장 브리핑은 입력된 더미 정보를 역할별로 정리한 참고 정보이며 실제 안전 판단을 보장하지 않습니다.
- 실제 재난 상황에서는 119와 현장 안내를 우선해야 합니다.

## 역할별 기능

- 일반 사용자: 현재 위치, 층수, 연기/불꽃/계단 상태 등을 입력하고 대피 안내를 받습니다.
- 소방관: 신고 내용과 건물 정보를 바탕으로 현장 상황 요약, 위험도, 대응 우선순위, 체크리스트를 확인합니다.
- 중앙 통제: 여러 신고 목록, 통계, 출동 상태, 신고 상세 정보를 모니터링합니다.

## 기술 스택

- Frontend: React, Vite
- Backend: FastAPI
- Data: JSON 더미 데이터
- Container: Docker, Docker Compose

## 폴더 구조

```text
fireflow-ai/
  README.md
  .gitignore
  .env.example
  docker-compose.yml
  frontend/
    Dockerfile
    package.json
    index.html
    src/
      main.jsx
      App.jsx
      pages/
      components/
      services/
      styles/
  backend/
    Dockerfile
    requirements.txt
    main.py
    data/
    schemas/
    services/
  docs/
    idea.md
    architecture.md
```

## Docker Compose 실행

```bash
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend: http://localhost:8000

## 프론트엔드 단독 실행

```bash
cd frontend
npm install
npm run dev
```

## 백엔드 단독 실행

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Windows PowerShell에서는 가상환경 활성화 명령이 다음과 같습니다.

```powershell
.\.venv\Scripts\Activate.ps1
```

## API 명세

모든 주요 API 응답은 다음 공통 형식을 사용합니다.

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

### GET /api/v1/health

서버 상태 확인

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "service": "fireflow-ai"
  },
  "error": null
}
```

### POST /api/v1/citizen/evacuation-guide

일반 사용자 대피 안내 생성

```json
{
  "location": "부산광역시 해운대구 A빌딩",
  "current_floor": "5층",
  "has_smoke": true,
  "has_flame": false,
  "stairs_available": true,
  "is_trapped": false,
  "has_vulnerable_people": true
}
```

### GET /api/v1/citizen/incidents/{incident_id}/evacuation-guide

특정 신고 기준 일반 사용자 대피 안내 조회

공모전 시연에서는 기본적으로 `incident_id=1` 신고를 시민, 소방관, 중앙 통제 화면에서 공통 대표 시나리오로 사용합니다.

### POST /api/v1/firefighter/summary

소방관 현장 상황 요약 생성

```json
{
  "address": "부산광역시 해운대구 A빌딩",
  "report_text": "5층 사무실에서 연기가 많이 납니다.",
  "fire_floor": "5층",
  "smoke_spread": true,
  "people_trapped": true
}
```

### GET /api/v1/firefighter/incidents/{incident_id}/briefing

특정 신고 기준 소방관 현장 브리핑 조회

### GET /api/v1/incidents

중앙 통제용 신고 목록 조회

### GET /api/v1/incidents/{incident_id}

특정 신고 상세 조회

### GET /api/v1/control/overview

중앙 통제용 신고 통계와 목록 조회

## 향후 확장 계획

- 실제 로그인/권한 시스템
- OpenAI API 연동
- Kakao Map API 연동
- 소방안전 빅데이터 API 연동
- 건축물대장 API 연동
- 건물 도면/BIM/실내지도 연동
- 음성 신고 입력 기능
