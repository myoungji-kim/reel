# 연속 기록 스트릭 (Writing Streak)

## 사전 준비
- `docs/00_context_project-overview.md` 읽기
- 관련 파일:
  - `frontend/src/pages/ChatPage.tsx`
  - `frontend/src/components/layout/TopBar.tsx`
  - `frontend/src/components/chat/DevelopBanner.tsx`
  - `frontend/src/api/frameApi.ts`
  - `frontend/src/types/frame.ts`
  - `backend/src/main/java/com/reel/user/entity/User.java`
  - `backend/src/main/java/com/reel/user/repository/UserRepository.java`
  - `backend/src/main/java/com/reel/frame/service/FrameService.java`
  - `backend/src/main/java/com/reel/frame/controller/FrameController.java`

## 기능 개요
프레임을 저장할 때마다 연속 기록 일수(스트릭)를 계산하고 업데이트한다.
스트릭은 채팅 페이지 상단에 조용하게 표시되며, 오늘 기록을 완료하면 스트릭이 갱신된다.
하루를 건너뛰면 스트릭은 리셋된다.

## UX 의도
일기 앱에서 이탈이 가장 많이 발생하는 시점은 "3일 연속으로 못 썼을 때"다.
스트릭은 그 이탈을 막는 가장 강력한 심리 장치다.
단, 부담을 주면 안 된다 — 화려한 축하 연출보다, 조용히 숫자가 쌓이는 것이 더 오래간다.
"오늘 기록하면 7일 연속"이라는 작은 문장 하나가 앱을 열게 만든다.

## DB 변경

### `users` 테이블에 컬럼 추가
```sql
ALTER TABLE users ADD COLUMN streak_count INT NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN last_frame_date DATE;
```
- `streak_count`: 현재 연속 기록 일수
- `last_frame_date`: 마지막으로 프레임을 저장한 날짜 (스트릭 계산 기준)
- `RETROSPECTIVE` 타입 프레임은 스트릭 계산에서 제외 (AI 생성이므로)

## API 변경

### 신규 엔드포인트
```
GET /api/user/streak
```
- 인증 필요 (JWT)
- 응답:
  ```json
  {
    "streakCount": 5,
    "lastFrameDate": "2026-03-07",
    "recordedToday": true
  }
  ```
  - `streakCount`: 현재 연속 기록 일수 (0이면 아직 기록 없음 또는 끊긴 상태)
  - `lastFrameDate`: 마지막 기록 날짜 (null 가능 — 첫 사용자)
  - `recordedToday`: 오늘 날짜에 이미 프레임이 저장되었는지 여부

### 기존 엔드포인트 변경
- 프레임 저장 API (`POST /api/frames`, `POST /api/frames/quick`) 내부에서 스트릭 자동 갱신
  - 별도 응답 필드 추가 없음 (클라이언트가 저장 성공 후 `GET /api/user/streak` 재조회)

## 구현 요청

### 백엔드

1. **`User` 엔티티에 스트릭 필드 추가**
   ```java
   // backend/src/main/java/com/reel/user/entity/User.java
   @Column(name = "streak_count", nullable = false, columnDefinition = "INT DEFAULT 0")
   private int streakCount = 0;

   @Column(name = "last_frame_date")
   private LocalDate lastFrameDate;

   public void updateStreak(LocalDate today) {
       if (lastFrameDate == null) {
           // 첫 기록
           streakCount = 1;
       } else if (lastFrameDate.equals(today)) {
           // 오늘 이미 기록함 — 스트릭 변화 없음
           return;
       } else if (lastFrameDate.equals(today.minusDays(1))) {
           // 어제 기록 → 연속
           streakCount += 1;
       } else {
           // 하루 이상 공백 → 리셋
           streakCount = 1;
       }
       lastFrameDate = today;
   }
   ```

2. **`StreakResponse` DTO 신규 생성**
   ```java
   // backend/src/main/java/com/reel/user/dto/StreakResponse.java
   public record StreakResponse(
       int streakCount,
       LocalDate lastFrameDate,   // nullable
       boolean recordedToday
   ) {}
   ```

3. **`UserService` 신규 생성 (또는 기존에 있으면 메서드 추가)**
   ```java
   // backend/src/main/java/com/reel/user/service/UserService.java
   @Service
   @RequiredArgsConstructor
   @Transactional(readOnly = true)
   public class UserService {
       private final UserRepository userRepository;

       public StreakResponse getStreak(Long userId) {
           User user = userRepository.findById(userId).orElseThrow();
           boolean recordedToday = LocalDate.now().equals(user.getLastFrameDate());
           return new StreakResponse(user.getStreakCount(), user.getLastFrameDate(), recordedToday);
       }
   }
   ```

4. **`UserController` 신규 생성 (또는 기존에 있으면 엔드포인트 추가)**
   ```java
   // backend/src/main/java/com/reel/user/controller/UserController.java
   @RestController
   @RequestMapping("/api/user")
   @RequiredArgsConstructor
   public class UserController {
       private final UserService userService;

       @GetMapping("/streak")
       public ResponseEntity<ApiResponse<StreakResponse>> getStreak(
           @AuthenticationPrincipal CustomOAuth2User principal
       ) {
           return ResponseEntity.ok(ApiResponse.success(userService.getStreak(principal.getUserId())));
       }
   }
   ```

5. **`FrameService` 수정** — 프레임 저장 시 스트릭 갱신 호출

   `saveFrame()`과 `createQuickFrame()` 메서드 내부에서, 저장 성공 후:
   ```java
   // RETROSPECTIVE 타입이 아닌 경우에만 스트릭 갱신
   if (frameType != FrameType.RETROSPECTIVE) {
       user.updateStreak(LocalDate.now());
       userRepository.save(user);
   }
   ```
   - `user` 객체는 이미 `FrameService` 내에서 조회하므로 추가 쿼리 없음
   - `User.updateStreak()`이 `@Transactional` 범위 안이므로 별도 save 불필요 (dirty checking)

### 프론트엔드

1. **`types/user.ts` 신규 생성 (또는 기존 타입 파일에 추가)**
   ```ts
   export interface StreakInfo {
     streakCount: number
     lastFrameDate: string | null  // "YYYY-MM-DD"
     recordedToday: boolean
   }
   ```

2. **`api/userApi.ts` 신규 생성 (또는 기존 API 파일에 추가)**
   ```ts
   import axiosInstance from './axiosInstance'
   import type { StreakInfo } from '../types/user'

   export const getStreak = () =>
     axiosInstance.get<ApiResponse<StreakInfo>>('/api/user/streak').then(r => r.data.data)
   ```

3. **`StreakBadge` 컴포넌트 신규 생성** (`frontend/src/components/chat/StreakBadge.tsx`)
   - `useQuery(['streak'], getStreak, { staleTime: 60_000 })` 사용
   - `streakCount === 0`이면 `null` 반환 (렌더링 없음)
   - 표시 조건 및 형태:

     | 조건 | 표시 텍스트 |
     |------|------------|
     | `recordedToday === true` | `◆ {streakCount}일 연속 기록 중` |
     | `recordedToday === false && streakCount >= 1` | `◇ 오늘 기록하면 {streakCount + 1}일 연속` |

   - 스타일:
     - 높이 ~32px, 배경 없음 (투명)
     - 텍스트 색상: `recordedToday`이면 `var(--amber)`, 아니면 `var(--cream-muted)`
     - 폰트: `Space Mono`, 11px
     - 좌측에 `◆` / `◇` 아이콘 (유니코드)
   - 프레임 저장 성공 이벤트 발생 시 쿼리 invalidate: `queryClient.invalidateQueries(['streak'])`

4. **`ChatPage.tsx` 수정** — StreakBadge 삽입
   - `OnThisDayBanner` 아래(채팅 메시지 목록 위)에 `<StreakBadge />` 삽입
   - 배너/배지가 없을 때 공간 차지하지 않음 (height 0 유지)
   - 레이아웃 순서:
     ```
     [TopBar]
     [OnThisDayBanner]   ← 기존
     [StreakBadge]        ← 신규
     [채팅 메시지 목록]
     [ChatInput]
     ```

5. **스트릭 invalidate 시점 연결**

   프레임 저장이 완료되는 두 지점에서 `['streak']` 쿼리 invalidate 추가:
   - `PreviewOverlay.tsx` (AI 현상 저장 완료 후)
   - `QuickNoteSheet.tsx` (Quick Note 저장 완료 후)

   ```ts
   queryClient.invalidateQueries({ queryKey: ['streak'] })
   ```

## 디자인 규칙
- StreakBadge는 작고 조용하게 — 채팅 화면을 지배하지 않음
- 오늘 기록 완료 상태(`recordedToday: true`)와 미완료 상태의 색상 차이로 충분히 구분
- 강조/축하 애니메이션 없음 — 숫자 자체가 보상
- 스트릭 0일 때는 완전히 숨김 (첫 사용자에게 부담 주지 않음)
- 기존 디자인 토큰 외 색상 추가 금지

## 스트릭 계산 규칙 명세
| 상황 | 결과 |
|------|------|
| 첫 프레임 저장 | `streakCount = 1`, `lastFrameDate = 오늘` |
| 오늘 이미 저장했는데 추가 저장 | 변화 없음 |
| 어제 저장 후 오늘 저장 | `streakCount += 1` |
| 이틀 이상 공백 후 저장 | `streakCount = 1` (리셋) |
| RETROSPECTIVE 타입 저장 | 스트릭 계산 제외 |

## 검증
- [ ] 첫 프레임 저장 후 `GET /api/user/streak` → `streakCount: 1`, `recordedToday: true` 확인
- [ ] 연속 2일 저장 후 → `streakCount: 2` 확인
- [ ] 하루 건너뛰고 저장 → `streakCount: 1` (리셋) 확인
- [ ] 오늘 두 번 저장해도 `streakCount` 중복 증가 없음 확인
- [ ] ChatPage에서 `StreakBadge` 텍스트 조건별 표시 확인 (`◆` vs `◇`)
- [ ] 프레임 저장 직후 StreakBadge 텍스트 즉시 업데이트 확인 (쿼리 invalidate)
- [ ] `streakCount === 0`인 신규 사용자 — 배지 미표시 확인
- [ ] RETROSPECTIVE 프레임 생성 시 스트릭 변화 없음 확인
- [ ] Quick Note 저장 후에도 스트릭 갱신 확인

## 커밋 메시지
```
feat: add writing streak tracking with badge display on ChatPage
```
