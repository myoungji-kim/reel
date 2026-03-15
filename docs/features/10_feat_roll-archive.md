# 롤 완성 개념 (Roll Archive)

## 사전 준비
- `docs/00_context_project-overview.md` 읽기
- 관련 파일:
  - `frontend/src/pages/RollPage.tsx`
  - `frontend/src/components/FilmFrame.tsx`
  - `frontend/src/api/axiosInstance.ts`
  - `backend/src/main/java/com/reel/frame/FrameController.java`
  - `backend/src/main/java/com/reel/frame/FrameService.java`
  - `backend/src/main/java/com/reel/frame/Frame.java`

## 기능 개요
36컷짜리 필름 롤처럼, 프레임 24개가 쌓이면 하나의 롤이 완성된다.
현재 롤 진행률을 시각적으로 보여주고, 완성 시 특별한 피드백을 제공한다.

## UX 의도
일기를 쓰는 것이 아니라 필름을 채워가는 경험.
"이번 롤 16/24" 처럼 진행률이 보이면 기록에 대한 작은 성취감이 생긴다.
24개를 채웠을 때의 완성 순간이 다음 롤을 시작하게 만드는 동기가 된다.

## DB 변경
없음. `frame_num`으로 롤 번호와 진행률을 계산할 수 있음.
- 롤 번호: `Math.ceil(frameNum / 24)`
- 현재 롤 내 위치: `((frameNum - 1) % 24) + 1`

## API 변경

### 신규 엔드포인트
```
GET /api/frames/roll-stats
```
- 인증 필요 (JWT)
- 응답:
  ```json
  {
    "currentRollNum": 2,
    "currentRollProgress": 5,
    "rollSize": 24,
    "totalFrames": 29
  }
  ```
  - `currentRollNum`: 현재 롤 번호 (1부터 시작)
  - `currentRollProgress`: 현재 롤에서 쌓인 프레임 수 (1~24)
  - `rollSize`: 고정값 24
  - `totalFrames`: 전체 프레임 수

## 구현 요청

### 백엔드

1. **`FrameService`에 메서드 추가**
   ```java
   public RollStatsResponse getRollStats(Long userId) {
     int totalFrames = frameRepository.countByUserId(userId);
     int currentRollNum = (totalFrames / 24) + 1;
     int currentRollProgress = totalFrames % 24; // 0이면 방금 완성된 롤
     // totalFrames == 0이면 currentRollNum=1, progress=0
     return new RollStatsResponse(currentRollNum, currentRollProgress == 0 && totalFrames > 0 ? 24 : currentRollProgress, 24, totalFrames);
   }
   ```
   - 주의: `totalFrames % 24 == 0`이고 `totalFrames > 0`이면 이전 롤이 방금 완성된 상태. 이 경우 `currentRollNum`을 +1, `progress`를 0으로 처리

2. **`FrameController`에 엔드포인트 추가**
   ```java
   @GetMapping("/roll-stats")
   public ResponseEntity<RollStatsResponse> getRollStats(@AuthenticationPrincipal ...)
   ```

3. **`RollStatsResponse` DTO 신규 생성**

### 프론트엔드

1. **`api/frameApi.ts`에 함수 추가**
   ```ts
   export const getRollStats = () =>
     axiosInstance.get<RollStatsResponse>('/api/frames/roll-stats').then(r => r.data)
   ```

2. **`RollProgressBar` 컴포넌트 신규 생성** (`frontend/src/components/RollProgressBar.tsx`)
   - 표시 형식: `ROLL 02  ●●●●●○○○○○○○○○○○○○○○○○○○  5 / 24`
   - 또는 텍스트 + 얇은 프로그레스 바 형태
   - 스타일: `var(--color-text-muted)`, 폰트 `var(--font-mono)`, 높이 ~32px

3. **`RollPage.tsx` 수정**
   - 상단 (헤더 아래)에 `<RollProgressBar />` 삽입
   - `useQuery(['rollStats'], getRollStats)` 사용

4. **롤 완성 토스트 처리** — 프레임 저장 직후
   - 프레임 저장 후 `getRollStats()` 재조회
   - `currentRollProgress === 0 && totalFrames > 0` (또는 `totalFrames % 24 === 0`) 이면 롤 완성 상태
   - 토스트 메시지: `"ROLL ${rollNum} 완성! 🎞 새 롤이 시작됩니다"`
   - 토스트는 기존 토스트 컴포넌트/유틸 사용

5. **롤 구분선 추가** — `RollPage` 프레임 목록
   - 24번째 프레임마다 (frame_num이 24의 배수마다) 롤 구분선 삽입
   - 구분선 텍스트: `— ROLL 01 완성 —`
   - 기존 `MonthDivider`와 별개로 동작 (겹칠 수 있음)

## 디자인 규칙
- 프로그레스 바: 기존 토큰 색상만 사용, 새 색상 추가 금지
- 완성 토스트: 화려하지 않게 — 필름 느낌의 담백한 텍스트
- 구분선: 가느다란 선 + 중앙 텍스트 형태 (모노 폰트)
- 프로토타입 레이아웃 변경 최소화

## 검증
- [ ] `GET /api/frames/roll-stats` 응답값 정확성 확인 (0개, 24개, 25개일 때)
- [ ] `RollProgressBar`에서 현재 롤 번호 및 진행률 표시 확인
- [ ] 24번째 프레임 저장 직후 완성 토스트 표시 확인
- [ ] 25번째 프레임부터 rollNum이 +1 되고 progress가 1 표시 확인
- [ ] 롤 구분선이 frame_num 24번 이후에 올바르게 삽입되는지 확인

## 커밋 메시지
```
feat: add film roll progress tracking and roll-complete toast
```
