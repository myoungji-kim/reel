# Phase 5 — 현상(Frame) 기능

## 사전 준비

`docs/00_context_project-overview.md` 를 읽고 컨텍스트를 확인해줘.
Phase 1~4가 완료된 상태야.

---

## DB 스키마

```sql
CREATE TABLE frames (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT REFERENCES users(id),
    session_id BIGINT REFERENCES chat_sessions(id),
    frame_num  INT NOT NULL,
    title      VARCHAR(200) NOT NULL,
    content    TEXT NOT NULL,
    mood       VARCHAR(50),
    date       DATE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## API

| Method | URL | 설명 |
|--------|-----|------|
| POST | `/api/frames/develop/{sessionId}` | 세션 대화를 AI로 요약 → 미리보기 반환 (저장 X) |
| PUT | `/api/frames/{frameId}` | 미리보기 수정 내용 최종 저장 |
| GET | `/api/frames` | 전체 프레임 목록 (page, size 쿼리 파라미터) |
| GET | `/api/frames/{frameId}` | 프레임 상세 |

---

## AI 현상 시스템 프롬프트 (변경 금지)

```
채팅 대화를 분석해서 JSON 형태로만 응답하세요.
형식: {"title":"한 줄 제목","content":"일기 내용 (3-5문단, 감성적으로 정리)"}
- 제목은 오늘 하루를 가장 잘 나타내는 짧은 문장
- 내용은 사용자 입장에서 1인칭으로, 자연스러운 일기 문체로
- JSON만 출력하세요
```

---

## 요청사항

### 백엔드

1. `Frame` 엔티티 + `FrameRepository`

2. `DevelopService`
    - `sessionId`로 `ChatMessage` 전체 조회
    - `AnthropicClient`로 일기 생성 요청 (JSON 파싱)
    - 결과를 저장하지 않고 `DevelopPreviewResponse`로 반환
    - JSON 파싱 실패 시 `AiParseException` 발생

3. `FrameService`
    - 최종 저장: `DevelopPreviewResponse` + 사용자 수정본으로 `Frame` 저장
    - 저장 시 `ChatSession.developed = true` 업데이트
    - `frame_num`: 해당 유저의 전체 프레임 수 + 1 자동 부여
    - 전체 목록: 최신순 페이지네이션
    - 상세 조회

4. `FrameController` — 위 API 구현

5. `ErrorCode` 에 `ALREADY_DEVELOPED`, `FRAME_NOT_FOUND`, `AI_PARSE_ERROR` 추가

### 프론트엔드

기존 오버레이 UI를 컴포넌트로 분리할 것. **디자인 변경 금지**, `prototype_reel.html` 과 픽셀 단위로 동일해야 함.

1. `types/frame.ts` — `Frame`, `DevelopPreview` 타입

2. `api/frameApi.ts`
    - `developPreview(sessionId)` — 현상 미리보기 API
    - `saveFrame(frameId, title, content)` — 최종 저장
    - `getFrames(page, size)` — 목록
    - `getFrame(frameId)` — 상세

3. `store/frameStore.ts` (Zustand)
    - `frames`, `preview`, `isDeveloping` 상태

4. 컴포넌트 분리 (스타일은 prototype 그대로):
    - `components/overlays/DevelopingOverlay.tsx`
        - 필름 5장 플래시 애니메이션
        - 진행바 (2.2초 동안 0 → 100%)
        - "// DEVELOPING..." 깜빡임 텍스트
    - `components/overlays/PreviewOverlay.tsx`
        - 제목 input, 본문 textarea 수정 가능
        - 취소 / 이대로 현상하기 버튼
    - `components/frame/FilmFrame.tsx`
        - 좌우 퍼포레이션 포함 카드
        - frame_num, date, title, preview, mood, status 표시
    - `components/frame/FrameOverlay.tsx`
        - 상세 보기 바텀시트
        - 배경 클릭 시 닫힘
    - `components/frame/MonthDivider.tsx`

5. `pages/RollPage.tsx`
    - 진입 시 프레임 목록 로드
    - 월별 그룹핑 + `MonthDivider` 렌더링
    - 로딩 중: `FilmFrame` 스켈레톤 3개 표시

6. `pages/ChatPage.tsx` 에 현상 플로우 연결
    - `DevelopBanner` 클릭
    - → `DevelopingOverlay` 표시
    - → `developPreview(sessionId)` API 호출
    - → `PreviewOverlay` 표시 (제목/본문 수정 가능)
    - → `saveFrame()` 호출
    - → 채팅 초기화 + RollPage로 이동

---

완료 후 "Phase 5 완료. 확인 후 06_phase6_cleanup-and-deploy.md 를 전달해줘." 라고 말해줘.
