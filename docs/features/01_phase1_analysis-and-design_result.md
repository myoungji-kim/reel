# Phase 1 — 분석 및 설계 결과

---

## 프로토타입 기능 확인 결과

모든 기능 존재 확인 완료:

| 기능 | 위치 | 확인 |
|------|------|------|
| 탭 전환 | `switchView()` | ✅ |
| 필름 퍼포레이션 애니메이션 `40s linear infinite` | `filmScroll` keyframe | ✅ |
| 채팅 입력/전송/AI 응답/타이핑 인디케이터 | `sendMessage()`, `showTyping()` | ✅ |
| 메시지 3개 이상 시 현상 배너 | `if(userMsgCount >= 3)` | ✅ |
| DEVELOPING 오버레이 + 진행바 + AI 일기 생성 | `startDevelop()`, `animateProgress()` | ✅ |
| 미리보기 제목/본문 직접 수정 | `preview-title-input`, `preview-content-input` | ✅ |
| 저장 후 필름 롤 프레임 추가 + 탭 자동 전환 | `saveFrame()` | ✅ |
| 프레임 클릭 → 상세 오버레이 | `openFrame()`, `closeOverlay()` | ✅ |
| Anthropic API 연동 (채팅 + 현상) | `getAIReply()`, `startDevelop()` | ✅ |
| 에러 fallback | try/catch 양쪽 함수 모두 | ✅ |

---

## 1. 관심사 분리 목록

현재 단일 HTML에서 분리해야 할 관심사:

- **디자인 토큰 / 전역 CSS** — CSS Variables, 폰트, 애니메이션 keyframes
- **레이아웃 컴포넌트** — TopBar, FilmBar(퍼포레이션), Tabs
- **채팅 컴포넌트** — ChatView, MessageBubble, TypingIndicator, ChatInput, DevelopBanner
- **필름 롤 컴포넌트** — FilmRollView, FilmFrame, MonthDivider, Perforations
- **오버레이 컴포넌트** — FrameDetailOverlay, DevelopingOverlay, PreviewOverlay
- **클라이언트 상태** — 채팅 메시지 목록, isAITyping, userMsgCount (Zustand)
- **서버 상태** — 일기 프레임 목록 (TanStack Query)
- **커스텀 훅** — useChat, useDevelop, useFilmRoll
- **API 통신 레이어** — Axios 인스턴스, 엔드포인트 함수
- **타입 정의** — Message, DiaryEntry, User 등
- **날짜 유틸** — 포맷 함수 분리
- **Anthropic API 호출** — 현재 프론트에서 직접 호출 → **백엔드로 이동** (API 키 보안)
- **인증** — OAuth2 로그인 흐름, JWT 관리 (Spring Security)
- **데이터 영속화** — DB 저장/조회 (JPA + PostgreSQL)

---

## 2. 디렉토리 구조

```
reel/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   ├── axiosInstance.ts        # 기본 설정, 인터셉터
│   │   │   ├── auth.ts
│   │   │   ├── chat.ts
│   │   │   └── diary.ts
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── TopBar.tsx
│   │   │   │   ├── FilmBar.tsx          # 퍼포레이션 애니메이션
│   │   │   │   └── Tabs.tsx
│   │   │   ├── chat/
│   │   │   │   ├── ChatView.tsx
│   │   │   │   ├── MessageBubble.tsx
│   │   │   │   ├── TypingIndicator.tsx
│   │   │   │   ├── ChatInput.tsx
│   │   │   │   └── DevelopBanner.tsx
│   │   │   ├── film/
│   │   │   │   ├── FilmRollView.tsx
│   │   │   │   ├── FilmFrame.tsx
│   │   │   │   ├── MonthDivider.tsx
│   │   │   │   └── Perforations.tsx
│   │   │   └── overlay/
│   │   │       ├── FrameDetailOverlay.tsx
│   │   │       ├── DevelopingOverlay.tsx
│   │   │       └── PreviewOverlay.tsx
│   │   ├── hooks/
│   │   │   ├── useChat.ts
│   │   │   ├── useDevelop.ts
│   │   │   └── useFilmRoll.ts
│   │   ├── stores/
│   │   │   ├── chatStore.ts             # Zustand: 메시지, 타이핑 상태
│   │   │   └── uiStore.ts              # Zustand: 탭, 오버레이 열림 상태
│   │   ├── types/
│   │   │   ├── chat.ts
│   │   │   ├── diary.ts
│   │   │   └── user.ts
│   │   ├── utils/
│   │   │   └── dateFormat.ts
│   │   ├── styles/
│   │   │   └── globals.css             # 디자인 토큰, keyframes
│   │   ├── pages/
│   │   │   ├── HomePage.tsx
│   │   │   └── LoginPage.tsx
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
│
└── backend/
    └── src/
        ├── main/
        │   ├── java/com/reel/
        │   │   ├── ReelApplication.java
        │   │   ├── config/
        │   │   │   ├── SecurityConfig.java
        │   │   │   ├── RedisConfig.java
        │   │   │   ├── JwtConfig.java
        │   │   │   └── CorsConfig.java
        │   │   ├── auth/
        │   │   │   ├── controller/AuthController.java
        │   │   │   ├── service/AuthService.java
        │   │   │   ├── jwt/JwtProvider.java
        │   │   │   ├── dto/
        │   │   │   └── oauth2/
        │   │   │       ├── CustomOAuth2UserService.java
        │   │   │       ├── GoogleOAuth2UserInfo.java
        │   │   │       └── KakaoOAuth2UserInfo.java
        │   │   ├── chat/
        │   │   │   ├── controller/ChatController.java
        │   │   │   ├── service/ChatService.java
        │   │   │   ├── entity/
        │   │   │   │   ├── ChatSession.java
        │   │   │   │   └── ChatMessage.java
        │   │   │   ├── repository/
        │   │   │   │   ├── ChatSessionRepository.java
        │   │   │   │   └── ChatMessageRepository.java
        │   │   │   └── dto/
        │   │   ├── diary/
        │   │   │   ├── controller/DiaryController.java
        │   │   │   ├── service/DiaryService.java
        │   │   │   ├── entity/DiaryEntry.java
        │   │   │   ├── repository/DiaryRepository.java
        │   │   │   └── dto/
        │   │   ├── ai/
        │   │   │   └── AnthropicService.java  # API 키 서버 보관
        │   │   └── user/
        │   │       ├── entity/User.java
        │   │       └── repository/UserRepository.java
        │   └── resources/
        │       ├── application.yml
        │       └── application-local.yml
        └── test/
```

---

## 3. 개선 필요 사항

| # | 문제 | 위치 | 해결 방향 |
|---|------|------|-----------|
| 1 | **API 키 프론트 노출** | `getAIReply()`, `startDevelop()` — `fetch('https://api.anthropic.com/...')` 직접 호출 | Anthropic 호출 전량 백엔드로 이동, `ANTHROPIC_API_KEY` 환경변수 서버 보관 |
| 2 | **데이터 비영속** | `let messages = []`, `const frames = [...]` — 새로고침 시 소멸 | 서버 DB(PostgreSQL) + TanStack Query 캐싱 |
| 3 | **타입 없음** | 전체 JavaScript | TypeScript 전환, `Message`, `DiaryEntry`, `ChatSession` 타입 정의 |
| 4 | **JSON 파싱 취약** | `JSON.parse(clean)` — regex로 ` ``` `만 제거, 불완전한 JSON 시 catch | 백엔드에서 파싱 후 타입화된 DTO 반환 |
| 5 | **인증 없음** | 전체 미인증 | Google/Kakao OAuth2, JWT Access/Refresh Token |
| 6 | **DOM 직접 조작** | `appendChild`, `innerHTML` 반복 | React 컴포넌트 및 상태 기반 렌더링으로 교체 |
| 7 | **퍼포레이션 생성 중복** | HTML 초기화, 오버레이 열 때마다 `for` 루프 | `<Perforations count={n} />` 컴포넌트로 재사용 |
| 8 | **시간대(timezone) 미처리** | `new Date()` 직접 사용 | 서버 기준 날짜 사용, 프론트는 표시용 포맷만 담당 |
| 9 | **에러 구분 없음** | 네트워크/API/파싱 에러 동일 fallback | 에러 종류별 처리, 사용자에게 적절한 메시지 표시 |
| 10 | **탭 전환 직접 DOM 조작** | `saveFrame()` 내 `querySelectorAll('.tab')` | Zustand `uiStore`의 activeTab 상태로 제어 |

---

## 4. DB 스키마

```sql
-- 사용자
CREATE TABLE users (
    id          BIGSERIAL       PRIMARY KEY,
    provider    VARCHAR(20)     NOT NULL,          -- 'google' | 'kakao'
    provider_id VARCHAR(100)    NOT NULL,
    email       VARCHAR(255),
    nickname    VARCHAR(100),
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    UNIQUE (provider, provider_id)
);

-- 채팅 세션 (사용자 × 날짜 = 1 세션)
CREATE TABLE chat_sessions (
    id          BIGSERIAL   PRIMARY KEY,
    user_id     BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date        DATE        NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, date)
);

-- 채팅 메시지
CREATE TABLE chat_messages (
    id          BIGSERIAL   PRIMARY KEY,
    session_id  BIGINT      NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role        VARCHAR(10) NOT NULL,              -- 'user' | 'assistant'
    content     TEXT        NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 일기 프레임
CREATE TABLE diary_entries (
    id          BIGSERIAL       PRIMARY KEY,
    user_id     BIGINT          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id  BIGINT          REFERENCES chat_sessions(id) ON DELETE SET NULL,
    frame_num   INT             NOT NULL,
    title       VARCHAR(255)    NOT NULL,
    content     TEXT            NOT NULL,
    mood        VARCHAR(50),
    diary_date  DATE            NOT NULL,
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);
```

---

## 5. API 명세

### Auth

| Method | URL | 설명 |
|--------|-----|------|
| `GET` | `/api/auth/google` | Google OAuth2 인증 시작 (redirect) |
| `GET` | `/api/auth/kakao` | Kakao OAuth2 인증 시작 (redirect) |
| `POST` | `/api/auth/refresh` | Refresh Token → 새 Access Token 발급 |
| `POST` | `/api/auth/logout` | Refresh Token 무효화, 쿠키 삭제 |

### Chat

| Method | URL | 설명 |
|--------|-----|------|
| `GET` | `/api/chat/today` | 오늘 날짜 세션 + 메시지 목록 조회 (없으면 세션 자동 생성) |
| `POST` | `/api/chat/messages` | 사용자 메시지 저장 + Anthropic API 호출 → AI 응답 반환 |

### Diary

| Method | URL | 설명 |
|--------|-----|------|
| `POST` | `/api/diary/develop` | 오늘 채팅 세션 기반 AI 일기 생성 (현상하기) |
| `GET` | `/api/diary` | 전체 일기 목록 조회 (월별 그룹 포함) |
| `POST` | `/api/diary` | 미리보기 확인 후 일기 최종 저장 |
| `GET` | `/api/diary/{id}` | 일기 상세 조회 |
