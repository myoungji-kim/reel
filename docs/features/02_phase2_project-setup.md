# Phase 2 — 프로젝트 세팅

## 사전 준비

`docs/00_context_project-overview.md` 를 읽고 컨텍스트를 확인해줘.
Phase 1 설계 내용을 기억하고 있어야 해.
Phase 1 설계 결과는 `docs/01_phase1_analysis-and-design_result.md` 에 있어.

---

## 요청사항

### 백엔드

1. `backend/build.gradle.kts`
    - Spring Boot 3, Security, JPA, QueryDSL, Redis, JWT(jjwt), PostgreSQL 의존성 포함

2. `backend/src/main/resources/application.yml`
    - 공통 설정 (profile 분기 포함)

3. `backend/src/main/resources/application-local.yml`
    - DB, Redis, OAuth2 클라이언트 설정 (값은 `${PLACEHOLDER}` 형태)

4. `backend/src/main/resources/application-prod.yml`
    - 환경변수 참조 형태로 작성

5. 각 패키지 하위 클래스를 빈 상태로 생성해서 구조 완성
    - `config/`, `auth/`, `user/`, `chat/`, `frame/`, `ai/`, `common/`

### 프론트엔드

1. Vite + React + TypeScript 프로젝트 초기화
    - 패키지 설치: `zustand`, `@tanstack/react-query`, `axios`, `react-router-dom`, `tailwindcss`

2. `frontend/src/styles/tokens.css`
    - 아래 CSS 변수 그대로 이식할 것 (값 변경 금지):
      ```css
      --bg: #131008; --bg-mid: #1a1510; --bg-card: #1e1a0f;
      --border: #2e2518; --border-light: #3d3220;
      --amber: #d4822a; --amber-light: #e8a94a; --amber-pale: #f0c878;
      --cream: #f2e8d0; --cream-dim: #c8b898; --cream-muted: #8a7a60;
      --fade-green: #7a9e8a;
      ```

3. `frontend/src/styles/index.css`
    - 폰트 import: Bebas Neue, VT323, Noto Sans KR, Noto Serif KR, Space Mono
    - 기존 reset CSS 유지 (`* { box-sizing: border-box; margin: 0; padding: 0; }` 등)

4. 각 파일을 빈 컴포넌트/함수로라도 생성해서 구조 완성
    - `pages/`, `components/`, `store/`, `api/`, `hooks/`, `types/`

5. `.env.example`
   ```
   VITE_API_BASE_URL=http://localhost:8080
   ```

### 인프라

1. `docker-compose.yml`
    - PostgreSQL (포트 5432)
    - Redis (포트 6379)

2. 루트 `README.md`
    - 로컬 실행 방법 (docker-compose up → 백엔드 → 프론트)
    - 필요한 환경변수 목록

---

완료 후 "Phase 2 완료. 확인 후 03_phase3_auth-oauth2-jwt.md 를 전달해줘." 라고 말해줘.
