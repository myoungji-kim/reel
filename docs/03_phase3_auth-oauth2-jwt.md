# Phase 3 — 인증 (OAuth2 + JWT)

## 사전 준비

`docs/00_context_project-overview.md` 를 읽고 컨텍스트를 확인해줘.
Phase 1 설계, Phase 2 세팅이 완료된 상태야.

---

## DB 스키마

```sql
CREATE TABLE users (
    id          BIGSERIAL PRIMARY KEY,
    oauth_id    VARCHAR(255) NOT NULL,
    provider    VARCHAR(20)  NOT NULL,  -- GOOGLE | KAKAO
    email       VARCHAR(255),
    nickname    VARCHAR(100),
    profile_img VARCHAR(500),
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW(),
    UNIQUE (oauth_id, provider)
);
```

---

## API

| Method | URL | 설명 |
|--------|-----|------|
| GET | `/api/auth/login/google` | Google OAuth2 시작 |
| GET | `/api/auth/login/kakao` | Kakao OAuth2 시작 |
| GET | `/api/auth/callback/{provider}` | 콜백 처리 → JWT 발급 후 프론트로 리다이렉트 |
| POST | `/api/auth/refresh` | Access Token 재발급 (Refresh Token은 httpOnly 쿠키) |
| POST | `/api/auth/logout` | 로그아웃 (Redis에서 Refresh Token 삭제) |

---

## 요청사항

### 백엔드

1. `User` 엔티티 (`BaseTimeEntity` 상속), `OAuthProvider` enum (GOOGLE, KAKAO), `UserRepository`

2. `JwtTokenProvider`
    - Access Token 생성/검증 (30분)
    - Refresh Token 생성/검증 (14일, Redis 저장)
    - Refresh Token Rotation 적용

3. `OAuth2UserService`
    - Google, Kakao 사용자 정보 파싱
    - User upsert (없으면 생성, 있으면 업데이트)

4. `SecurityConfig`
    - `/api/auth/**` 는 permitAll, 나머지는 인증 필요
    - CORS: `localhost:5173` 허용
    - 세션 STATELESS, JWT 필터 등록

5. `AuthController` — 위 API 구현

6. 공통 클래스
    - `ApiResponse<T>` 공통 응답 래퍼
    - `ErrorCode` enum (UNAUTHORIZED, TOKEN_EXPIRED, TOKEN_INVALID, USER_NOT_FOUND)
    - `GlobalExceptionHandler` 기본 세팅

### 프론트엔드

1. `types/auth.ts` — User, TokenResponse 타입

2. `store/authStore.ts` (Zustand)
    - `accessToken`, `user` 상태 관리
    - `setAuth`, `clearAuth` 액션

3. `pages/LoginPage.tsx`
    - Google / Kakao 로그인 버튼
    - REEL 디자인 시스템 적용 (암실 톤, amber 컬러)
    - 버튼 클릭 시 `/api/auth/login/{provider}` 로 이동

4. `api/axios.ts`
    - `baseURL`: `VITE_API_BASE_URL` 환경변수
    - 요청 인터셉터: `Authorization: Bearer {accessToken}` 자동 주입
    - 응답 인터셉터: 401 수신 시 `/api/auth/refresh` 호출 후 원래 요청 재시도, 재시도도 실패 시 로그인 페이지로 이동

5. `api/authApi.ts` — refresh, logout API 함수

6. `App.tsx`
    - 라우팅: `/` (LoginPage), `/chat` (ChatPage), `/roll` (RollPage)
    - `PrivateRoute`: 미인증 시 `/` 로 리다이렉트

---

완료 후 "Phase 3 완료. 확인 후 04_phase4_chat-ai.md 를 전달해줘." 라고 말해줘.
