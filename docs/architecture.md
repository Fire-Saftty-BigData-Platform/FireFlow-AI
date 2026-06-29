# FireFlow AI Architecture

## Overview

FireFlow AI MVP는 React/Vite 프론트엔드와 FastAPI 백엔드를 분리한 구조입니다.

```text
Browser
  -> React + Vite frontend
  -> FastAPI backend
  -> JSON dummy data
```

## Frontend

- `App.jsx`: 선택된 역할 상태를 관리합니다.
- `pages/`: 역할 선택, 시민, 소방관, 중앙 통제 화면을 분리합니다.
- `components/`: 레이아웃, 카드, 통계, 신고 목록, 지도 placeholder를 재사용합니다.
- `services/api.js`: 백엔드 API 호출을 한 곳에서 관리합니다.

## Backend

- `main.py`: FastAPI 앱, CORS, 라우팅을 정의합니다.
- `schemas/`: 요청 모델을 정의합니다.
- `services/`: 더미 비즈니스 로직과 JSON 데이터 조회를 담당합니다.
- `data/`: 건물과 신고 샘플 데이터를 저장합니다.

## External APIs

이 MVP는 실제 OpenAI API, Kakao Map API, 공공데이터 API를 호출하지 않습니다. 키는 `.env.example`에 빈 값으로만 문서화되어 있습니다.
