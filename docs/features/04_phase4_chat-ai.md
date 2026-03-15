# Phase 4 — 채팅 + AI 연동

## 사전 준비

`docs/00_context_project-overview.md` 를 읽고 컨텍스트를 확인해줘.
Phase 1~3이 완료된 상태야.

---

## DB 스키마

```sql
CREATE TABLE chat_sessions (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT REFERENCES users(id),
    date       DATE NOT NULL,
    developed  BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (user_id, date)
);

CREATE TABLE chat_messages (
    id         BIGSERIAL PRIMARY KEY,
    session_id BIGINT REFERENCES chat_sessions(id),
    role       VARCHAR(10) NOT NULL,  -- USER | AI
    content    TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## API

| Method | URL | 설명 |
|--------|-----|------|
| GET | `/api/chat/session/today` | 오늘 세션 조회 (없으면 생성) |
| GET | `/api/chat/session/{sessionId}/messages` | 메시지 목록 조회 |
| POST | `/api/chat/session/{sessionId}/message` | 유저 메시지 저장 + AI 응답 생성 후 반환 |

---

## AI 채팅 시스템 프롬프트 (변경 금지)

```
당신은 사용자의 하루를 채팅으로 들어주는 따뜻한 AI 일기 친구입니다.
규칙:
- 짧고 자연스럽게 대화하세요. 2-3문장 이내로.
- 공감하고, 더 이야기하도록 유도하는 질문을 1개만 던지세요.
- 이모지는 1개까지만 사용하세요.
- 강요하지 말고 편안하게 대화하세요.
- 반말로 편하게 이야기하세요.
```

---

## 요청사항

### 백엔드

1. `ChatSession`, `ChatMessage` 엔티티 + Repository
2. `MessageRole` enum (USER, AI)
3. `AnthropicClient`
    - POST `https://api.anthropic.com/v1/messages`
    - API 키: 환경변수 `ANTHROPIC_API_KEY`
    - 대화 히스토리를 `messages` 배열로 구성해서 요청
    - 모델: `claude-sonnet-4-20250514`, `max_tokens: 1000`
    - 타임아웃 30초
    - 실패 시 `AiException` 발생
4. `ChatService`
    - 오늘 세션 조회 or 생성
    - 유저 메시지 저장
    - `AnthropicClient`로 AI 응답 생성 후 저장
    - 응답: `ChatMessageResponse` (AI 메시지 내용 포함)
5. `ChatController` — 위 API 구현 (인증된 사용자만)
6. `ErrorCode` 에 `SESSION_NOT_FOUND`, `AI_RESPONSE_ERROR` 추가

### 프론트엔드

기존 채팅 UI를 컴포넌트로 분리할 것. **디자인 변경 금지**, `prototype_reel.html` 과 픽셀 단위로 동일해야 함.

1. `types/chat.ts` — `ChatSession`, `ChatMessage`, `MessageRole` 타입

2. `api/chatApi.ts`
    - `getTodaySession()` — 오늘 세션 조회
    - `getMessages(sessionId)` — 메시지 목록
    - `sendMessage(sessionId, content)` — 메시지 전송

3. `store/chatStore.ts` (Zustand)
    - `sessionId`, `messages`, `userMsgCount`, `isTyping` 상태
    - `addMessage`, `setTyping`, `incrementCount` 액션

4. 컴포넌트 분리 (스타일은 prototype 그대로):
    - `components/chat/MessageBubble.tsx` — user/ai 버블
    - `components/chat/TypingIndicator.tsx` — 점 3개 바운스 애니메이션
    - `components/chat/ChatInput.tsx` — Enter 전송 / Shift+Enter 줄바꿈 / autoResize
    - `components/chat/DevelopBanner.tsx` — `userMsgCount >= 3` 시 페이드인 표시

5. `pages/ChatPage.tsx`
    - 진입 시 오늘 세션 조회 + 메시지 로드
    - 이미 `developed: true` 인 세션이면 "오늘은 이미 현상했어요 🎞️ 내일 또 이야기해줘요." 표시
    - 위 컴포넌트 조합

6. `components/layout/TopBar.tsx`, `components/layout/FilmBar.tsx`
    - 탭 전환 로직 포함
    - FilmBar 애니메이션: `40s linear infinite` 유지

---

완료 후 아래 커밋 메시지로 커밋해줘:
```
feat: add chat and Anthropic AI integration

- ChatSession / ChatMessage 엔티티 및 API 구현
- AnthropicClient (채팅 응답 생성)
- 채팅 UI 컴포넌트 분리 (MessageBubble, TypingIndicator, ChatInput, DevelopBanner)
- TopBar, FilmBar 컴포넌트 분리
- Zustand chatStore 구현
```
커밋 완료 후 "Phase 4 완료. 확인 후 05_phase5_develop-frame.md 를 전달해줘." 라고 말해줘.
