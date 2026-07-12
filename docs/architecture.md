# FireFlow AI Architecture

## 1. 문서 목적

이 문서는 FireFlow AI MVP의 전체 구조, 역할별 기능, 데이터 흐름, API 계약, 개발 원칙을 정의합니다.

FireFlow AI는 화재 상황에서 **시민**, **소방관**, **중앙 통제 담당자**에게 서로 다른 정보를 제공하는 역할 기반 소방안전 웹서비스입니다. MVP 단계에서는 실제 인증, 외부 AI, 지도, 공공데이터 연동 없이 더미 데이터로 동작하지만, 이후 실제 서비스로 확장할 수 있도록 계층과 인터페이스를 분리합니다.

---

## 2. MVP 범위

### 2.1 포함 범위

- 첫 화면에서 시민·소방관·중앙 통제 역할 선택
- 역할별 독립 화면 제공
- 화재 신고 및 건물 정보 조회
- 시민용 대피 행동 지침 제공
- 소방관용 현장 브리핑 제공
- 중앙 통제용 신고 목록, 위험도, 출동 상태 제공
- React 프론트엔드와 FastAPI 백엔드 간 API 통신
- JSON 기반 더미 데이터 및 더미 AI 응답
- 로딩, 빈 데이터, API 오류 상태 처리

### 2.2 제외 범위

- 실제 회원가입 및 로그인
- 실제 119 신고 접수 또는 출동 시스템 연동
- 실시간 위치 추적
- 실제 건물 도면 기반 실내 길찾기
- OpenAI 등 외부 LLM 직접 호출
- Kakao Map 등 실제 지도 API 호출
- 공공데이터 API 실시간 조회
- 의료·소방 판단을 대체하는 자동 의사결정

> FireFlow AI MVP의 안내는 시연용 정보이며, 실제 재난 상황에서는 119와 현장 안내를 우선합니다.

---

## 3. 핵심 설계 원칙

1. **역할 분리**  
   시민, 소방관, 중앙 통제 화면과 기능을 명확히 분리합니다.

2. **프론트엔드와 백엔드 책임 분리**  
   프론트엔드는 화면과 사용자 상호작용을 담당하고, 백엔드는 데이터 조회, 위험도 계산, 응답 조합을 담당합니다.

3. **API 계약 우선**  
   더미 데이터라도 실제 서비스와 동일한 요청·응답 구조를 사용합니다.

4. **외부 서비스 교체 가능성 확보**  
   더미 AI, 더미 지도, JSON 저장소는 Adapter 계층을 통해 실제 API로 교체할 수 있게 합니다.

5. **안전한 표현**  
   AI 응답은 권고 정보로 표시하며, 확정적 구조 판단이나 실제 출동 완료 여부를 임의 생성하지 않습니다.

6. **MVP 우선**  
   복잡한 실시간 기능보다 역할별 핵심 흐름을 시연 가능하게 완성하는 데 집중합니다.

---

## 4. 전체 시스템 구성

```text
┌───────────────────────────────────────────────────────────────┐
│                         Web Browser                           │
│                                                               │
│  ┌──────────────── React + Vite Frontend ──────────────────┐  │
│  │ 역할 선택 / 시민 / 소방관 / 중앙 통제 화면             │  │
│  │ 공통 UI / 상태 관리 / API Client / 오류 처리            │  │
│  └──────────────────────────┬───────────────────────────────┘  │
└─────────────────────────────│─────────────────────────────────┘
                              │ HTTP + JSON
                              ▼
┌────────────────────── FastAPI Backend ─────────────────────────┐
│                                                               │
│  API Router                                                   │
│      │                                                        │
│      ▼                                                        │
│  Application Service                                         │
│  - 시민 대피 안내 조합                                       │
│  - 소방관 현장 브리핑 조합                                   │
│  - 중앙 통제 신고 현황 조합                                  │
│      │                                                        │
│      ▼                                                        │
│  Domain Logic                                                 │
│  - 위험도 계산                                               │
│  - 역할별 정보 필터링                                        │
│  - 출동 상태 정렬                                            │
│      │                                                        │
│      ▼                                                        │
│  Adapter / Repository                                        │
│  - JSON 신고 데이터                                          │
│  - JSON 건물 데이터                                          │
│  - Dummy AI Provider                                         │
│  - Dummy Map Provider                                        │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

---

## 5. 역할별 기능 구조

### 5.1 시민 화면

시민에게는 복잡한 분석보다 **즉시 실행 가능한 행동**을 우선 제공합니다.

#### 주요 기능

- 현재 화재 상황 요약
- 위험도 표시
- 건물 기본 정보 표시
- 대피 행동 지침 표시
- 피해야 할 행동 표시
- 119 신고 및 현장 안내 우선 문구 표시

#### 화면 데이터 우선순위

1. 즉시 행동 지침
2. 위험 요소
3. 대피 시 주의사항
4. 건물 정보
5. 추가 설명

---

### 5.2 소방관 화면

소방관에게는 여러 신고 내용을 압축하여 **현장 진입 전 빠르게 판단할 수 있는 브리핑**을 제공합니다.

#### 주요 기능

- 신고 위치 및 신고 시각
- 신고 내용 요약
- 추정 화재 층과 위험 요소
- 건물 구조 및 용도
- 인명 관련 신고 정보
- 진입 전 확인사항
- 출동 상태 표시

#### 브리핑 구성

```text
상황 요약
→ 건물 특성
→ 인명 위험
→ 주요 위험 요소
→ 현장 확인 필요사항
```

AI 또는 더미 요약은 신고 내용을 압축할 뿐, 실제 화재 규모나 구조 안정성을 확정하지 않습니다.

---

### 5.3 중앙 통제 화면

중앙 통제 화면은 여러 신고를 한눈에 비교하고 우선순위를 판단할 수 있도록 구성합니다.

#### 주요 기능

- 전체 신고 건수
- 위험도별 신고 건수
- 출동 상태별 신고 건수
- 신고 목록 정렬 및 필터링
- 선택 신고 상세 조회
- 지도 Placeholder
- 역할별 전달 정보 확인

#### 기본 정렬 기준

1. 위험도 높은 순
2. 미출동·출동 중 상태 우선
3. 신고 시각이 최근인 순

---

## 6. 프론트엔드 아키텍처

### 6.1 권장 폴더 구조

```text
frontend/
├─ public/
├─ src/
│  ├─ app/
│  │  ├─ App.jsx
│  │  └─ routes.jsx
│  ├─ pages/
│  │  ├─ RoleSelectPage.jsx
│  │  ├─ citizen/
│  │  │  └─ CitizenDashboardPage.jsx
│  │  ├─ firefighter/
│  │  │  └─ FirefighterDashboardPage.jsx
│  │  └─ control/
│  │     └─ ControlDashboardPage.jsx
│  ├─ components/
│  │  ├─ common/
│  │  │  ├─ AppLayout.jsx
│  │  │  ├─ LoadingState.jsx
│  │  │  ├─ EmptyState.jsx
│  │  │  └─ ErrorState.jsx
│  │  ├─ incident/
│  │  │  ├─ IncidentCard.jsx
│  │  │  ├─ IncidentList.jsx
│  │  │  ├─ RiskBadge.jsx
│  │  │  └─ DispatchStatusBadge.jsx
│  │  ├─ citizen/
│  │  │  ├─ EvacuationGuide.jsx
│  │  │  └─ SafetyWarning.jsx
│  │  ├─ firefighter/
│  │  │  └─ FieldBriefing.jsx
│  │  └─ control/
│  │     ├─ IncidentStatistics.jsx
│  │     └─ MapPlaceholder.jsx
│  ├─ services/
│  │  ├─ apiClient.js
│  │  ├─ incidentApi.js
│  │  ├─ citizenApi.js
│  │  ├─ firefighterApi.js
│  │  └─ controlApi.js
│  ├─ hooks/
│  │  ├─ useIncident.js
│  │  └─ useIncidents.js
│  ├─ constants/
│  │  ├─ roles.js
│  │  ├─ riskLevels.js
│  │  └─ dispatchStatuses.js
│  ├─ utils/
│  │  ├─ dateFormatter.js
│  │  └─ errorMessage.js
│  ├─ styles/
│  └─ main.jsx
├─ .env.example
├─ package.json
└─ vite.config.js
```

### 6.2 주요 책임

#### `app/`

- 앱 진입점
- 역할별 라우팅
- 공통 레이아웃 연결

#### `pages/`

- API에서 받은 데이터를 조합하여 화면을 구성
- 복잡한 재사용 로직은 직접 포함하지 않음

#### `components/`

- 화면을 구성하는 재사용 가능한 UI 단위
- 가능하면 API를 직접 호출하지 않음

#### `services/`

- 백엔드 API 호출을 한곳에서 관리
- URL, 헤더, 오류 응답 처리 통일

#### `hooks/`

- 데이터 요청 상태 관리
- 로딩, 성공, 오류 상태 캡슐화

### 6.3 상태 관리

MVP에서는 전역 상태 관리 라이브러리를 필수로 사용하지 않습니다.

- 역할 선택: URL 경로 또는 `App.jsx` 상태
- 서버 데이터: 역할별 페이지 또는 Custom Hook
- 공통 UI 상태: 필요한 컴포넌트 내부 상태

프로젝트 규모가 커질 경우 Zustand 또는 TanStack Query 도입을 검토합니다.

---

## 7. 백엔드 아키텍처

### 7.1 권장 폴더 구조

```text
backend/
├─ app/
│  ├─ main.py
│  ├─ core/
│  │  ├─ config.py
│  │  ├─ exceptions.py
│  │  └─ response.py
│  ├─ api/
│  │  ├─ router.py
│  │  └─ routes/
│  │     ├─ health.py
│  │     ├─ incidents.py
│  │     ├─ citizen.py
│  │     ├─ firefighter.py
│  │     └─ control.py
│  ├─ schemas/
│  │  ├─ common.py
│  │  ├─ incident.py
│  │  ├─ building.py
│  │  ├─ citizen.py
│  │  ├─ firefighter.py
│  │  └─ control.py
│  ├─ domain/
│  │  ├─ risk.py
│  │  ├─ dispatch.py
│  │  └─ roles.py
│  ├─ services/
│  │  ├─ incident_service.py
│  │  ├─ citizen_service.py
│  │  ├─ firefighter_service.py
│  │  └─ control_service.py
│  ├─ repositories/
│  │  ├─ incident_repository.py
│  │  └─ building_repository.py
│  ├─ providers/
│  │  ├─ ai/
│  │  │  ├─ base.py
│  │  │  └─ dummy_ai_provider.py
│  │  ├─ map/
│  │  │  ├─ base.py
│  │  │  └─ dummy_map_provider.py
│  │  └─ public_data/
│  │     ├─ base.py
│  │     └─ dummy_public_data_provider.py
│  └─ data/
│     ├─ incidents.json
│     └─ buildings.json
├─ tests/
│  ├─ test_health.py
│  ├─ test_incidents.py
│  ├─ test_citizen.py
│  ├─ test_firefighter.py
│  └─ test_control.py
├─ .env.example
├─ requirements.txt
└─ Dockerfile
```

### 7.2 계층별 책임

#### API Router

- HTTP 요청 수신
- 요청값 검증
- 서비스 호출
- HTTP 상태 코드 반환

비즈니스 로직을 직접 작성하지 않습니다.

#### Application Service

- Repository와 Provider에서 받은 데이터를 조합
- 역할별 응답 생성
- 도메인 로직 호출

#### Domain Logic

- 위험도 규칙
- 출동 상태 규칙
- 역할별 정보 공개 범위

FastAPI, JSON 파일 등 외부 기술에 의존하지 않습니다.

#### Repository

- 신고 및 건물 데이터 조회
- MVP에서는 JSON 파일 사용
- 이후 DB Repository로 교체 가능

#### Provider

- AI, 지도, 공공데이터 등 외부 서비스 인터페이스
- MVP에서는 Dummy Provider 사용
- 실제 API 연동 시 구현체만 교체

---

## 8. 핵심 도메인 모델

### 8.1 Incident

```text
id
reported_at
address
latitude
longitude
report_text
suspected_floor
risk_level
dispatch_status
building_id
casualty_reported
hazards[]
```

### 8.2 Building

```text
id
name
address
usage
floors_above_ground
floors_below_ground
structure_type
main_material
fire_safety_grade
known_risks[]
```

### 8.3 EvacuationGuide

```text
incident_id
summary
immediate_actions[]
avoid_actions[]
warnings[]
disclaimer
```

### 8.4 FieldBriefing

```text
incident_id
situation_summary
building_summary
human_risk_summary
hazards[]
checkpoints[]
disclaimer
```

### 8.5 ControlOverview

```text
total_incidents
risk_counts
dispatch_counts
incidents[]
```

---

## 9. API 설계

모든 API 기본 경로는 `/api/v1`로 통일합니다.

### 9.1 상태 확인

```http
GET /api/v1/health
```

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

### 9.2 신고 목록 조회

```http
GET /api/v1/incidents
```

선택 Query Parameter:

- `risk_level`
- `dispatch_status`
- `sort`

### 9.3 신고 상세 조회

```http
GET /api/v1/incidents/{incident_id}
```

### 9.4 시민용 대피 안내

```http
GET /api/v1/citizen/incidents/{incident_id}/evacuation-guide
```

### 9.5 소방관용 현장 브리핑

```http
GET /api/v1/firefighter/incidents/{incident_id}/briefing
```

### 9.6 중앙 통제 현황

```http
GET /api/v1/control/overview
```

### 9.7 출동 상태 변경

MVP 시연에 필요한 경우에만 제공합니다.

```http
PATCH /api/v1/incidents/{incident_id}/dispatch-status
```

```json
{
  "dispatch_status": "DISPATCHING"
}
```

---

## 10. 공통 API 응답 형식

### 성공 응답

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

### 실패 응답

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "INCIDENT_NOT_FOUND",
    "message": "신고 정보를 찾을 수 없습니다."
  }
}
```

### 주요 오류 코드

| 코드 | 의미 |
|---|---|
| `VALIDATION_ERROR` | 요청값 검증 실패 |
| `INCIDENT_NOT_FOUND` | 신고 정보 없음 |
| `BUILDING_NOT_FOUND` | 건물 정보 없음 |
| `DATA_LOAD_FAILED` | 더미 데이터 로드 실패 |
| `INTERNAL_SERVER_ERROR` | 처리 중 알 수 없는 오류 |

---

## 11. 위험도 규칙

MVP 위험도는 실제 소방 판단을 대신하지 않는 단순 시연 규칙입니다.

### 위험도 예시

- `CRITICAL`: 인명 피해 신고 또는 다수 위험 요소 존재
- `HIGH`: 고층, 지하, 가연성 물질 등 주요 위험 요소 존재
- `MEDIUM`: 화재 신고는 있으나 인명·구조 위험 정보가 제한적
- `LOW`: 훈련 또는 오인 신고 등 낮은 위험 시나리오

위험도는 백엔드 `domain/risk.py`에서 계산하며, 프론트엔드에서 임의 계산하지 않습니다.

---

## 12. 더미 데이터 전략

### 12.1 목적

- 외부 API 없이 시연 가능
- API 응답 구조 조기 확정
- 프론트엔드와 백엔드 병렬 개발
- 실제 연동 이전 화면과 흐름 검증

### 12.2 원칙

- 신고 ID와 건물 ID의 참조 관계를 유지
- 위험도와 신고 내용이 모순되지 않게 작성
- 최소 5개 이상의 다양한 신고 시나리오 제공
- 정상, 빈 데이터, 일부 누락 데이터 시나리오 포함
- 실제 인물·전화번호·주소처럼 보이는 민감정보 사용 금지

---

## 13. 외부 서비스 확장 구조

### 13.1 AI Provider

```python
class AIProvider:
    def create_evacuation_guide(self, incident, building): ...
    def create_field_briefing(self, incident, building): ...
```

MVP:

```text
DummyAIProvider
```

향후:

```text
OpenAIProvider 또는 LocalLLMProvider
```

### 13.2 Map Provider

MVP에서는 좌표와 Placeholder만 반환합니다.

향후 Kakao Map 또는 다른 지도 API를 연동할 때 프론트엔드 지도 컴포넌트와 Provider 구현체를 교체합니다.

### 13.3 Public Data Provider

건물 용도, 층수, 구조 등 필요한 정보만 표준화하여 반환합니다. 외부 API 원본 응답을 프론트엔드에 직접 노출하지 않습니다.

---

## 14. 환경변수

### Frontend `.env.example`

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_MAP_PROVIDER=dummy
```

### Backend `.env.example`

```env
APP_ENV=development
APP_NAME=FireFlow AI
API_V1_PREFIX=/api/v1
FRONTEND_ORIGIN=http://localhost:5173
DATA_SOURCE=json
AI_PROVIDER=dummy
MAP_PROVIDER=dummy
PUBLIC_DATA_PROVIDER=dummy
OPENAI_API_KEY=
KAKAO_MAP_API_KEY=
PUBLIC_DATA_API_KEY=
```

비밀키는 Git에 커밋하지 않습니다.

---

## 15. 오류 및 예외 처리

### 프론트엔드

- 로딩 중: Skeleton 또는 Loading State
- 데이터 없음: Empty State
- API 실패: Error State와 재시도 버튼
- 특정 필드 누락: 화면 전체가 깨지지 않도록 기본값 처리

### 백엔드

- Pydantic 요청·응답 모델 사용
- 도메인 예외를 공통 오류 응답으로 변환
- 존재하지 않는 신고 ID는 `404`
- 잘못된 상태값은 `422`
- 내부 예외 상세 내용은 사용자에게 직접 노출하지 않음

---

## 16. 테스트 전략

### 백엔드 필수 테스트

- Health API 정상 응답
- 신고 목록 및 상세 조회
- 존재하지 않는 신고 조회
- 시민 대피 안내 응답 구조
- 소방관 브리핑 응답 구조
- 중앙 통제 통계 계산
- 위험도 및 출동 상태 정렬

### 프론트엔드 필수 테스트

- 역할 선택 후 올바른 화면 이동
- API 로딩 상태 표시
- API 오류 상태 표시
- 시민·소방관·중앙 통제 데이터가 섞이지 않음
- 위험도 및 출동 상태 배지 표시

### 수동 시연 체크

1. 첫 화면에서 역할 선택
2. 시민 화면에서 대피 지침 확인
3. 소방관 화면에서 현장 브리핑 확인
4. 중앙 통제 화면에서 신고 우선순위 확인
5. API 서버 중지 시 오류 화면 확인

---

## 17. 보안 및 안전 원칙

- API 키를 코드에 직접 작성하지 않음
- 실제 사용자 개인정보를 더미 데이터에 포함하지 않음
- 역할 선택 기능을 실제 권한 인증처럼 설명하지 않음
- 실제 소방 출동 시스템과 연결되었다고 표현하지 않음
- AI 안내에는 면책 및 119 우선 안내를 포함
- HTML 입력을 직접 렌더링하지 않음
- CORS는 개발 주소만 허용

---

## 18. 배포 구조

### 개발 환경

```text
Frontend: localhost:5173
Backend:  localhost:8000
```

### Docker Compose 권장 구조

```text
Browser
  -> frontend container
  -> backend container
  -> mounted JSON data
```

```text
project-root/
├─ frontend/
├─ backend/
├─ docs/
├─ docker-compose.yml
├─ README.md
└─ AGENTS.md
```

MVP에서는 데이터베이스 컨테이너가 필수는 아닙니다. 실제 서비스 확장 시 PostgreSQL을 추가합니다.

---

## 19. 구현 순서

### 1단계: 기반 구성

- 프론트엔드·백엔드 실행 환경 구성
- Health API 연결
- 공통 API 응답 형식 구현

### 2단계: 신고·건물 데이터

- JSON 데이터 작성
- Repository 구현
- 신고 목록 및 상세 API 구현

### 3단계: 역할별 서비스

- 시민 대피 안내
- 소방관 현장 브리핑
- 중앙 통제 현황

### 4단계: 역할별 화면

- 역할 선택
- 시민 Dashboard
- 소방관 Dashboard
- 중앙 통제 Dashboard

### 5단계: 안정화

- 오류·빈 상태 처리
- 테스트 작성
- Docker 실행 환경 구성
- 시연 시나리오 점검

---

## 20. 완료 기준

FireFlow AI MVP는 다음 조건을 충족하면 1차 완료로 판단합니다.

- 프론트엔드와 백엔드가 분리되어 실행됨
- 역할 선택 후 세 개 역할 화면에 접근 가능
- 모든 화면이 FastAPI API 응답을 사용함
- 시민용 대피 안내가 표시됨
- 소방관용 현장 브리핑이 표시됨
- 중앙 통제에서 신고 목록과 통계가 표시됨
- 더미 데이터만으로 전체 시연 가능
- 로딩, 빈 데이터, 오류 상태가 처리됨
- 실제 외부 API 미연동 사실이 문서와 화면에 명확히 표시됨
