# 빠른 현장 노트 (Quick Note)

## 사전 준비
- `docs/00_context_project-overview.md` 읽기
- 관련 파일:
  - `frontend/src/pages/ChatPage.tsx`
  - `frontend/src/components/FilmFrame.tsx`
  - `frontend/src/components/DevelopingOverlay.tsx`
  - `frontend/src/api/axiosInstance.ts`
  - `backend/src/main/java/com/reel/frame/FrameController.java`
  - `backend/src/main/java/com/reel/frame/FrameService.java`
  - `backend/src/main/java/com/reel/frame/Frame.java`

## 기능 개요
AI 대화 없이, 지금 이 순간의 짧은 기록을 바로 프레임으로 저장하는 빠른 입력 경로를 제공한다.

## UX 의도
감동적인 순간이나 빠르게 메모해두고 싶은 생각은 AI와 대화할 여유 없이 지나간다.
셔터 버튼처럼 — 지금 이 순간을 바로 찍어 롤에 넣는 경험.
채팅 흐름을 방해하지 않고, 별도 진입점에서 가볍게 접근 가능해야 한다.

## DB 변경
없음. `Frame`의 `session_id`가 이미 nullable.
`frame_type` 컬럼이 없으면 추가: `VARCHAR(20) DEFAULT 'DEVELOPED'`
- `DEVELOPED`: 기존 AI 현상 프레임
- `QUICK`: 빠른 현장 노트

> `frame_type` 컬럼이 이미 존재하면 스킵.

## API 변경

### 신규 엔드포인트
```
POST /api/frames/quick
```
- 인증 필요 (JWT)
- Request Body:
  ```json
  {
    "title": "카페 창가에서",
    "content": "오후 햇살이 너무 따뜻해서 사진 한 장 찍었다.",
    "date": "2026-03-02",
    "photoKeys": ["uploads/abc123.jpg"]
  }
  ```
  - `photoKeys`: 선택적, 기존 파일 업로드 방식과 동일 (이미 구현된 경우)
- Response:
  ```json
  {
    "frameId": 30,
    "frameNum": 30,
    "title": "카페 창가에서",
    "frameType": "QUICK"
  }
  ```

## 구현 요청

### 백엔드

1. **`Frame` 엔티티에 `frameType` 필드 추가** (없는 경우)
   ```java
   @Column(name = "frame_type", nullable = false)
   @Enumerated(EnumType.STRING)
   private FrameType frameType = FrameType.DEVELOPED;
   ```
   - `FrameType` enum: `DEVELOPED`, `QUICK`

2. **`FrameService`에 메서드 추가**
   ```java
   public QuickFrameResponse createQuickFrame(Long userId, QuickFrameRequest request)
   ```
   - `session_id = null`
   - `frame_type = QUICK`
   - `mood = null` (AI 분석 없음)
   - `frame_num` = 기존 프레임 수 + 1 (기존 로직과 동일)
   - `content` = request.content
   - `title` = request.title
   - `frame_date` = request.date (없으면 오늘)

3. **`FrameController`에 엔드포인트 추가**
   ```java
   @PostMapping("/quick")
   public ResponseEntity<QuickFrameResponse> createQuickFrame(
     @RequestBody @Valid QuickFrameRequest request,
     @AuthenticationPrincipal ...
   )
   ```

4. **`QuickFrameRequest`, `QuickFrameResponse` DTO 신규 생성**

### 프론트엔드

1. **`api/frameApi.ts`에 함수 추가**
   ```ts
   export const createQuickFrame = (data: QuickFrameRequest) =>
     axiosInstance.post('/api/frames/quick', data).then(r => r.data)
   ```

2. **`QuickNoteSheet` 컴포넌트 신규 생성** (`frontend/src/components/QuickNoteSheet.tsx`)
   - 바텀시트 형태 (하단에서 슬라이드 업)
   - 내부 필드:
     - 제목 입력 (1줄, placeholder: "오늘의 한 장면")
     - 내용 입력 (3줄 textarea, placeholder: "지금 이 순간을 기록하세요")
     - 날짜 (기본 오늘, 변경 가능)
     - 사진 첨부 버튼 (선택적, 기존 사진 첨부 로직 재사용)
   - 저장 버튼: "✦ 현상하기" → `createQuickFrame` 호출
   - 저장 성공 시: 시트 닫기 + `RollPage`로 이동 (DevelopingOverlay 없이)
   - 취소 버튼으로 닫기 가능

3. **`ChatPage.tsx` 수정**
   - 채팅 입력창 옆 또는 상단에 "✦ 빠른 기록" 버튼 추가
   - 탭 시 `QuickNoteSheet` 열기
   - 버튼 스타일: 작고 눈에 띄지 않게, `var(--color-text-muted)` 색상

4. **`FilmFrame.tsx` 수정**
   - `frameType === 'QUICK'`인 프레임에 `QUICK` 배지 표시
   - 배지 위치: 기존 `DEVELOPED` 배지와 동일한 위치
   - 배지 스타일: 기존 배지와 동일한 형태, 텍스트만 `QUICK`

## 디자인 규칙
- 바텀시트: 기존 오버레이 스타일과 통일 (배경색, 모서리, 핸들 바)
- "빠른 기록" 진입 버튼은 채팅 핵심 흐름을 방해하지 않을 크기
- 저장 후 DevelopingOverlay(현상 연출) 없이 바로 RollPage 이동
- 기존 디자인 토큰 이외의 색상 추가 금지

## 검증
- [ ] "빠른 기록" 버튼 탭 시 바텀시트 열림 확인
- [ ] 제목+내용 입력 후 저장 시 `/api/frames/quick` 호출 확인
- [ ] 저장된 프레임이 RollPage에 `QUICK` 배지로 표시 확인
- [ ] `session_id = null`로 저장되는지 DB 확인
- [ ] DevelopingOverlay 없이 바로 RollPage 이동 확인
- [ ] 사진 첨부 시 기존 업로드 로직과 동일하게 동작 확인

## 커밋 메시지
```
feat: add quick note feature for instant frame creation without AI chat
```
