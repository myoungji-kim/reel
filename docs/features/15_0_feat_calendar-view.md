# 캘린더 뷰 (Calendar View)

## 사전 준비
- `docs/00_context_project-overview.md` 읽기
- 관련 파일:
  - `frontend/src/pages/RollPage.tsx`
  - `frontend/src/components/frame/FilmFrame.tsx`
  - `frontend/src/components/frame/FrameOverlay.tsx`
  - `frontend/src/components/frame/RollProgressBar.tsx`
  - `frontend/src/stores/uiStore.ts`
  - `frontend/src/api/frameApi.ts`
  - `frontend/src/types/frame.ts`
  - `backend/src/main/java/com/reel/frame/controller/FrameController.java`
  - `backend/src/main/java/com/reel/frame/service/FrameService.java`
  - `backend/src/main/java/com/reel/frame/repository/FrameRepository.java`

## 기능 개요
RollPage에 캘린더 뷰를 추가한다. 기존 세로 스크롤 타임라인(롤 뷰)과 캘린더 뷰를 토글로 전환할 수 있으며, 캘린더에서는 기록한 날에 무드 색상 dot이 표시되고 날짜를 탭하면 해당 프레임을 바로 열 수 있다.

## UX 의도
타임라인은 최근 기록을 보기엔 좋지만, "이번 달에 며칠이나 썼나", "저번 달엔 어떤 흐름이었나"를 파악하기 어렵다.
캘린더는 기록의 밀도와 감정 온도를 한 화면에 보여준다. 빈 날이 보일수록 "오늘은 써야겠다"는 동기가 생기고, dot의 색깔로 감정의 흐름도 느껴진다.

## DB 변경
없음. 기존 `frames` 테이블의 `date`, `mood` 컬럼 활용.

## API 변경

### 신규 엔드포인트
```
GET /api/frames/calendar?year={year}&month={month}
```
- 인증 필요 (JWT)
- 쿼리 파라미터:
  - `year`: 연도 (예: 2026)
  - `month`: 월 (1~12)
- 응답:
  ```json
  [
    { "frameId": 5, "date": "2026-03-02", "mood": "기쁨" },
    { "frameId": 8, "date": "2026-03-07", "mood": "평온" },
    { "frameId": 10, "date": "2026-03-10", "mood": null }
  ]
  ```
- 해당 월에 기록이 없으면 빈 배열 `[]`
- 하루에 프레임이 여러 개인 경우 가장 최근 것 1개만 반환 (캘린더 dot 표시 목적)
- archived 프레임 제외

## 구현 요청

### 백엔드

1. **`CalendarFrameResponse` DTO 신규 생성**
   ```java
   // backend/src/main/java/com/reel/frame/dto/CalendarFrameResponse.java
   public record CalendarFrameResponse(
       Long frameId,
       LocalDate date,
       String mood
   ) {}
   ```

2. **`FrameRepository`에 쿼리 메서드 추가**
   ```java
   // 해당 월 전체 프레임 조회 (archived 제외)
   @Query("""
       SELECT f FROM Frame f
       WHERE f.user.id = :userId
         AND f.date >= :startDate
         AND f.date <= :endDate
         AND f.isArchived = false
       ORDER BY f.date ASC, f.createdAt DESC
       """)
   List<Frame> findByUserIdAndDateBetween(
       @Param("userId") Long userId,
       @Param("startDate") LocalDate startDate,
       @Param("endDate") LocalDate endDate
   );
   ```

3. **`FrameService`에 메서드 추가**
   ```java
   public List<CalendarFrameResponse> getCalendarFrames(Long userId, int year, int month) {
       LocalDate startDate = LocalDate.of(year, month, 1);
       LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());

       List<Frame> frames = frameRepository.findByUserIdAndDateBetween(userId, startDate, endDate);

       // 날짜별 중복 제거: 같은 날 여러 프레임이면 가장 최근(마지막 저장) 1개만
       return frames.stream()
           .collect(Collectors.toMap(
               Frame::getDate,
               f -> f,
               (existing, newer) -> newer.getCreatedAt().isAfter(existing.getCreatedAt()) ? newer : existing
           ))
           .values().stream()
           .sorted(Comparator.comparing(Frame::getDate))
           .map(f -> new CalendarFrameResponse(f.getId(), f.getDate(), f.getMood()))
           .toList();
   }
   ```

4. **`FrameController`에 엔드포인트 추가**
   ```java
   @GetMapping("/calendar")
   public ResponseEntity<ApiResponse<List<CalendarFrameResponse>>> getCalendarFrames(
       @RequestParam int year,
       @RequestParam int month,
       @AuthenticationPrincipal CustomOAuth2User principal
   ) {
       List<CalendarFrameResponse> result = frameService.getCalendarFrames(principal.getUserId(), year, month);
       return ResponseEntity.ok(ApiResponse.success(result));
   }
   ```

### 프론트엔드

1. **`types/frame.ts`에 타입 추가**
   ```ts
   export interface CalendarFrame {
     frameId: number
     date: string        // "YYYY-MM-DD"
     mood: string | null
   }
   ```

2. **`api/frameApi.ts`에 함수 추가**
   ```ts
   export const getCalendarFrames = (year: number, month: number) =>
     axiosInstance
       .get<ApiResponse<CalendarFrame[]>>('/api/frames/calendar', { params: { year, month } })
       .then(r => r.data.data)
   ```

3. **`utils/moodTone.ts`에 캘린더용 dot 색상 함수 추가**
   ```ts
   // 기존 getMoodToneStyle()과 별개. 캘린더 dot에만 사용.
   export function getMoodDotColor(mood: string | null): string {
     switch (mood) {
       case '기쁨': case '설렘':   return 'var(--amber)'
       case '슬픔': case '외로움': return '#607d8b'
       case '평온': case '감사':   return 'var(--fade-green)'
       case '피곤': case '무기력': return 'var(--cream-muted)'
       default:                   return 'var(--border-light)'
     }
   }
   ```

4. **`CalendarView` 컴포넌트 신규 생성** (`frontend/src/components/frame/CalendarView.tsx`)
   - props: `onFrameSelect: (frameId: number) => void`
   - 내부 상태: `year`, `month` (기본값: 오늘 기준)
   - `useQuery(['calendarFrames', year, month], () => getCalendarFrames(year, month))` 사용
   - 레이아웃:
     ```
     ◀  MARCH 2026  ▶           ← 월 이동 헤더
     SUN MON TUE WED THU FRI SAT
      1   2   3   4   5   6   7
      8   9  10  11  12  13  14
     ...
     ```
   - 날짜 셀 구조:
     - 기록 있는 날: 날짜 숫자 아래에 mood 색상 dot (지름 4px, `border-radius: 50%`)
     - 오늘 날짜: 날짜 숫자에 `var(--amber)` 색상 적용
     - 기록 없는 날: 날짜 숫자만 표시 (`var(--cream-muted)` 색상, opacity: 0.4)
     - archived 또는 미래 날짜: opacity: 0.2
   - 날짜 탭 시: 해당 날짜에 기록이 있으면 `onFrameSelect(frameId)` 호출
   - 월 이동: `◀ ▶` 버튼으로 전월/다음월 이동 (미래 월은 이동 불가)
   - 폰트: 헤더 `Bebas Neue`, 요일/날짜 `Space Mono` 10px
   - 스타일 규칙:
     - 배경: `var(--bg-card)`, 테두리: `1px solid var(--border)`
     - 셀 크기: 균등 7분할 (CSS Grid `grid-template-columns: repeat(7, 1fr)`)
     - 셀 높이: ~44px

5. **`RollPage.tsx` 수정** (뷰 전환 토글 추가)

   **상태 추가:**
   ```ts
   type ViewMode = 'roll' | 'calendar'
   const [viewMode, setViewMode] = useState<ViewMode>('roll')
   ```

   **헤더 영역에 토글 버튼 추가:**
   - 기존 검색 아이콘(`🔍`) 및 북마크 필터(`★`) 옆에 뷰 전환 버튼 배치
   - 버튼: `▦` (캘린더) 아이콘 — 폰트 또는 SVG
   - 활성 상태: `var(--amber)` 색상, 비활성: `var(--cream-muted)`
   - 캘린더 뷰 활성 중에는 검색/북마크 필터 버튼 숨김 (캘린더와 충돌)

   **조건부 렌더링:**
   ```tsx
   {viewMode === 'roll' ? (
     // 기존 롤 타임라인 렌더링
     <...기존 코드...>
   ) : (
     <CalendarView onFrameSelect={(frameId) => {
       setSelectedFrameId(frameId)
       setFrameDetailOpen(true)
     }} />
   )}
   ```

   - 캘린더 뷰에서 `RollProgressBar`는 유지 (상단 진행률 표시 그대로)
   - 캘린더 뷰 진입 시 검색 창이 열려있으면 자동으로 닫기

## 디자인 규칙
- 캘린더 셀 dot은 4px 이하 — 날짜 숫자를 방해하지 않음
- 기존 디자인 토큰 외 색상 추가 금지
- 월 이동 화살표: `◀ ▶` 유니코드 사용 (새 아이콘 라이브러리 추가 금지)
- 캘린더 전체 배경은 `var(--bg-card)`, RollPage 배경과 자연스럽게 이어지도록
- 프로토타입 레이아웃(TopBar, Tabs) 변경 금지

## 검증
- [ ] RollPage 헤더에서 뷰 전환 버튼 탭 시 캘린더/롤 전환 확인
- [ ] 현재 월의 기록 있는 날짜에 mood dot 표시 확인
- [ ] dot 색상이 mood 값에 따라 다르게 표시되는지 확인
- [ ] 기록 없는 날짜는 dot 없이 날짜 숫자만 표시 확인
- [ ] 날짜 탭 시 해당 프레임 FrameOverlay 오픈 확인
- [ ] 기록 없는 날짜 탭 시 아무 반응 없음 확인
- [ ] `◀ ▶` 버튼으로 월 이동 및 해당 월 데이터 재로딩 확인
- [ ] 미래 월로는 이동 불가 확인
- [ ] archived 프레임은 캘린더에 표시되지 않음 확인
- [ ] `GET /api/frames/calendar` 401 응답 처리 확인

## 커밋 메시지
```
feat: add calendar view to RollPage with mood dot indicators
```
