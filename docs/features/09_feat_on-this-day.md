# 이날의 기억 (On This Day)

## 사전 준비
- `docs/00_context_project-overview.md` 읽기
- 관련 파일:
  - `frontend/src/pages/ChatPage.tsx`
  - `frontend/src/components/FrameOverlay.tsx`
  - `frontend/src/api/axiosInstance.ts`
  - `backend/src/main/java/com/reel/frame/FrameRepository.java`
  - `backend/src/main/java/com/reel/frame/FrameController.java`
  - `backend/src/main/java/com/reel/frame/FrameService.java`

## 기능 개요
오늘과 같은 날짜의 작년·재작년 프레임이 있으면, 채팅 페이지 상단에 작은 띠 배너로 표시한다.

## UX 의도
"작년 오늘 나는 뭘 했더라?" — 일상이 쌓이면 과거 기억이 오늘을 더 특별하게 만든다.
알림 없이 조용히, 그냥 오늘 앱을 열었을 때 과거 기억이 슬며시 올라오는 경험.

## DB 변경
없음. 기존 `frames` 테이블의 `frame_date` 컬럼을 활용.

## API 변경

### 신규 엔드포인트
```
GET /api/frames/on-this-day
```
- 인증 필요 (JWT)
- 쿼리 파라미터: 없음 (서버에서 오늘 날짜 기준 계산)
- 응답:
  ```json
  [
    {
      "frameId": 12,
      "frameNum": 12,
      "title": "첫 눈이 왔다",
      "mood": "설렘",
      "frameDate": "2025-03-02",
      "yearsAgo": 1
    }
  ]
  ```
- 결과 없으면 빈 배열 `[]`

## 구현 요청

### 백엔드

1. **`FrameRepository`에 쿼리 메서드 추가**
   ```java
   List<Frame> findByUserIdAndFrameDateIn(Long userId, List<LocalDate> dates);
   ```
   - `dates` = [작년 오늘, 재작년 오늘] (최대 2개)

2. **`FrameService`에 메서드 추가**
   ```java
   public List<OnThisDayResponse> getOnThisDay(Long userId)
   ```
   - `LocalDate today = LocalDate.now()`
   - `dates = [today.minusYears(1), today.minusYears(2)]`
   - 조회 후 `yearsAgo` 값 계산하여 응답 DTO에 포함

3. **`FrameController`에 엔드포인트 추가**
   ```java
   @GetMapping("/on-this-day")
   public ResponseEntity<List<OnThisDayResponse>> getOnThisDay(@AuthenticationPrincipal ...)
   ```

4. **`OnThisDayResponse` DTO 신규 생성**
   - 필드: `frameId`, `frameNum`, `title`, `mood`, `frameDate`, `yearsAgo`

### 프론트엔드

1. **`api/frameApi.ts` (또는 기존 API 파일)에 함수 추가**
   ```ts
   export const getOnThisDay = () =>
     axiosInstance.get<OnThisDayItem[]>('/api/frames/on-this-day').then(r => r.data)
   ```

2. **`OnThisDayBanner` 컴포넌트 신규 생성** (`frontend/src/components/OnThisDayBanner.tsx`)
   - `useQuery`로 `/api/frames/on-this-day` 호출
   - 결과 없으면 `null` 반환 (렌더링 없음)
   - 결과 있을 때 표시 형식:
     ```
     ◆ 1년 전 오늘  #12 · 첫 눈이 왔다
     ```
   - 스타일: 얇은 띠 (height ~36px), 배경 `var(--color-surface-2)`, 텍스트 `var(--color-text-muted)`, 좌우 패딩 16px
   - 여러 개이면 수평 스크롤 또는 첫 번째만 표시 (최대 2개)
   - 탭(클릭) 시 해당 `frameId`로 `FrameOverlay` 열기

3. **`ChatPage.tsx` 수정**
   - 채팅 상단 (헤더 바로 아래, 메시지 목록 위)에 `<OnThisDayBanner />` 삽입
   - 배너가 없을 땐 공간 차지하지 않음

## 디자인 규칙
- 배너는 눈에 띄되 방해되지 않게: 작고 얇게
- 기존 채팅 레이아웃 밀리지 않도록 (배너 없을 때 height: 0)
- 프로토타입 색상 토큰 사용, 커스텀 색상 추가 금지
- 탭 피드백: 가벼운 opacity 감소 (0.7) 정도

## 검증
- [ ] 작년 오늘 날짜에 저장된 프레임이 있을 때 배너 표시 확인
- [ ] 해당 날짜 프레임이 없을 때 배너 미표시 확인
- [ ] 배너 탭 시 FrameOverlay가 해당 프레임으로 열리는지 확인
- [ ] 배너 없을 때 채팅 레이아웃에 빈 공간 없는지 확인
- [ ] `GET /api/frames/on-this-day` 401 응답 처리 (미로그인 시) 확인

## 커밋 메시지
```
feat: add on-this-day memory banner to ChatPage
```
