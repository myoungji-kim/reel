# AI 월간 회고 (AI Retrospective)

## 사전 준비
- `docs/00_context_project-overview.md` 읽기
- 관련 파일:
  - `frontend/src/pages/RollPage.tsx`
  - `frontend/src/components/frame/FilmFrame.tsx`
  - `frontend/src/components/frame/FrameOverlay.tsx`
  - `frontend/src/components/frame/RollDivider.tsx`
  - `frontend/src/api/frameApi.ts`
  - `frontend/src/types/frame.ts`
  - `backend/src/main/java/com/reel/frame/entity/Frame.java`
  - `backend/src/main/java/com/reel/frame/entity/FrameType.java`
  - `backend/src/main/java/com/reel/frame/service/FrameService.java`
  - `backend/src/main/java/com/reel/frame/controller/FrameController.java`
  - `backend/src/main/java/com/reel/frame/repository/FrameRepository.java`
  - `backend/src/main/java/com/reel/ai/AnthropicService.java`

## 기능 개요
한 달의 프레임이 3개 이상 쌓이면, AI가 그 달의 모든 기록을 읽고 한 편의 월간 에세이를 생성한다.
생성된 회고는 `RETROSPECTIVE` 타입의 특별한 프레임으로 저장되어 롤 타임라인에서 월 구분선 뒤에 표시된다.

## UX 의도
하루하루의 기록은 파편적이다. 한 달이 지났을 때 AI가 "당신의 3월은 이런 달이었어요"라고 조용히 말해준다면, 그 기록들이 하나의 이야기가 된다.
회고는 강요하지 않는다 — CTA를 탭했을 때만 생성되고, 생성된 후엔 롤 안에 특별한 프레임으로 남아 언제든 다시 꺼내볼 수 있다.

## DB 변경

### `FrameType` 확장
```java
// 기존: DEVELOPED, QUICK
// 추가:
RETROSPECTIVE  // AI 월간 회고
```

### 별도 테이블 생성 없음
회고도 `frames` 테이블에 `frame_type = RETROSPECTIVE`로 저장.
- `session_id = null`
- `mood = null` (월간 회고는 단일 mood 없음)
- `date` = 해당 월의 말일 (예: 2026-03-31)
- `frame_num` = 기존 프레임 수 + 1 (롤 카운트 포함)
- `title` = "MARCH 2026 회고" 형태 (AI가 생성하는 경우 AI 제목 사용)
- `content` = AI가 생성한 에세이 전문

## API 변경

### 신규 엔드포인트

#### 월간 회고 생성 가능 여부 확인
```
GET /api/frames/retrospective/available?year={year}&month={month}
```
- 인증 필요 (JWT)
- 응답:
  ```json
  {
    "available": true,
    "frameCount": 8,
    "alreadyGenerated": false
  }
  ```
  - `available`: 해당 월 프레임이 3개 이상이고, 해당 월이 현재 월 이전이며, 아직 회고가 생성되지 않은 경우 `true`
  - `alreadyGenerated`: 이미 해당 월 회고가 존재하면 `true` (재생성 방지)

#### 월간 회고 생성
```
POST /api/frames/retrospective
```
- 인증 필요 (JWT)
- Request Body:
  ```json
  { "year": 2026, "month": 2 }
  ```
- Response: 저장된 프레임 DTO (기존 `FrameResponse`와 동일)
  ```json
  {
    "frameId": 55,
    "frameNum": 55,
    "title": "기다림과 설렘이 공존했던 2월",
    "content": "2월의 기록들을 돌아보면...",
    "mood": null,
    "frameType": "RETROSPECTIVE",
    "date": "2026-02-28"
  }
  ```
- 이미 생성된 월은 `409 Conflict` 반환

## 구현 요청

### 백엔드

1. **`FrameType` enum 수정**
   ```java
   // backend/src/main/java/com/reel/frame/entity/FrameType.java
   public enum FrameType {
       DEVELOPED,
       QUICK,
       RETROSPECTIVE
   }
   ```

2. **`FrameRepository`에 메서드 추가**
   ```java
   // 해당 월 프레임 수 조회 (archived, retrospective 제외)
   @Query("""
       SELECT COUNT(f) FROM Frame f
       WHERE f.user.id = :userId
         AND YEAR(f.date) = :year
         AND MONTH(f.date) = :month
         AND f.isArchived = false
         AND f.frameType != 'RETROSPECTIVE'
       """)
   int countByUserIdAndYearAndMonth(
       @Param("userId") Long userId,
       @Param("year") int year,
       @Param("month") int month
   );

   // 해당 월 회고 프레임 존재 여부
   @Query("""
       SELECT COUNT(f) > 0 FROM Frame f
       WHERE f.user.id = :userId
         AND YEAR(f.date) = :year
         AND MONTH(f.date) = :month
         AND f.frameType = 'RETROSPECTIVE'
       """)
   boolean existsRetrospectiveByUserIdAndYearAndMonth(
       @Param("userId") Long userId,
       @Param("year") int year,
       @Param("month") int month
   );

   // 해당 월 전체 프레임 조회 (회고용 컨텍스트 수집)
   @Query("""
       SELECT f FROM Frame f
       WHERE f.user.id = :userId
         AND YEAR(f.date) = :year
         AND MONTH(f.date) = :month
         AND f.isArchived = false
         AND f.frameType != 'RETROSPECTIVE'
       ORDER BY f.date ASC
       """)
   List<Frame> findAllByUserIdAndYearAndMonth(
       @Param("userId") Long userId,
       @Param("year") int year,
       @Param("month") int month
   );
   ```

3. **`AnthropicService`에 회고 생성 메서드 추가**
   ```java
   public record RetrospectiveResult(String title, String content) {}

   public RetrospectiveResult generateRetrospective(int year, int month, List<Frame> frames) {
       String framesSummary = frames.stream()
           .map(f -> String.format("[%s] %s\n%s", f.getDate(), f.getTitle(), f.getContent()))
           .collect(Collectors.joining("\n\n---\n\n"));

       String monthLabel = String.format("%d년 %d월", year, month);

       String prompt = String.format("""
           아래는 %s의 일기 기록들입니다.

           %s

           ---

           이 기록들을 바탕으로 %s을 회고하는 감성적인 에세이를 작성해주세요.

           [작성 규칙]
           - 분량: 200~300자 내외
           - 어조: 따뜻하고 감성적인 1인칭 시점 ("나는", "우리는" 혼용 가능)
           - 특정 날짜나 사건을 직접 언급하되, 전체 흐름으로 묶어줄 것
           - 마지막 문장은 다음 달로 이어지는 희망 또는 여운이 느껴지도록

           응답 형식 (JSON):
           {
             "title": "이 달을 한 문장으로 표현한 제목 (20자 이내)",
             "content": "에세이 본문"
           }
           """, monthLabel, framesSummary, monthLabel);

       // JSON 파싱 후 RetrospectiveResult 반환
       return anthropicClient.singleMessageAsJson(prompt, RetrospectiveResult.class);
   }
   ```

4. **`FrameService`에 회고 관련 메서드 추가**
   ```java
   @Transactional(readOnly = true)
   public RetrospectiveAvailableResponse checkRetrospectiveAvailable(Long userId, int year, int month) {
       // 현재 월 이전인지 확인
       YearMonth targetMonth = YearMonth.of(year, month);
       if (!targetMonth.isBefore(YearMonth.now())) {
           return new RetrospectiveAvailableResponse(false, 0, false);
       }

       int frameCount = frameRepository.countByUserIdAndYearAndMonth(userId, year, month);
       boolean alreadyGenerated = frameRepository.existsRetrospectiveByUserIdAndYearAndMonth(userId, year, month);
       boolean available = frameCount >= 3 && !alreadyGenerated;

       return new RetrospectiveAvailableResponse(available, frameCount, alreadyGenerated);
   }

   public FrameResponse createRetrospective(Long userId, int year, int month) {
       // 중복 생성 방지
       if (frameRepository.existsRetrospectiveByUserIdAndYearAndMonth(userId, year, month)) {
           throw new ReelException(ErrorCode.ALREADY_EXISTS);
       }

       List<Frame> monthFrames = frameRepository.findAllByUserIdAndYearAndMonth(userId, year, month);
       if (monthFrames.size() < 3) {
           throw new ReelException(ErrorCode.INSUFFICIENT_FRAMES);
       }

       User user = userRepository.findById(userId).orElseThrow();
       AnthropicService.RetrospectiveResult result = anthropicService.generateRetrospective(year, month, monthFrames);

       LocalDate frameDate = YearMonth.of(year, month).atEndOfMonth();
       int nextFrameNum = frameRepository.countByUserId(userId) + 1;

       Frame retrospective = new Frame();
       // retrospective 팩토리 메서드 (Frame 엔티티에 추가)
       Frame saved = frameRepository.save(Frame.retrospective(user, nextFrameNum, result.title(), result.content(), frameDate));

       return FrameResponse.from(saved);
   }
   ```

5. **`Frame` 엔티티에 팩토리 메서드 추가**
   ```java
   public static Frame retrospective(User user, int frameNum, String title, String content, LocalDate date) {
       Frame frame = new Frame();
       frame.user = user;
       frame.frameNum = frameNum;
       frame.title = title;
       frame.content = content;
       frame.date = date;
       frame.frameType = FrameType.RETROSPECTIVE;
       return frame;
   }
   ```

6. **`FrameController`에 엔드포인트 추가**
   ```java
   @GetMapping("/retrospective/available")
   public ResponseEntity<ApiResponse<RetrospectiveAvailableResponse>> checkRetrospectiveAvailable(
       @RequestParam int year,
       @RequestParam int month,
       @AuthenticationPrincipal CustomOAuth2User principal
   ) {
       return ResponseEntity.ok(ApiResponse.success(
           frameService.checkRetrospectiveAvailable(principal.getUserId(), year, month)
       ));
   }

   @PostMapping("/retrospective")
   public ResponseEntity<ApiResponse<FrameResponse>> createRetrospective(
       @RequestBody @Valid CreateRetrospectiveRequest request,
       @AuthenticationPrincipal CustomOAuth2User principal
   ) {
       return ResponseEntity.ok(ApiResponse.success(
           frameService.createRetrospective(principal.getUserId(), request.year(), request.month())
       ));
   }
   ```

7. **`ErrorCode`에 항목 추가**
   - `ALREADY_EXISTS(409, "이미 생성된 회고입니다.")`
   - `INSUFFICIENT_FRAMES(422, "회고를 생성하기 위한 프레임이 부족합니다.")`

8. **DTO 신규 생성**
   - `RetrospectiveAvailableResponse(boolean available, int frameCount, boolean alreadyGenerated)`
   - `CreateRetrospectiveRequest(int year, int month)`

### 프론트엔드

1. **`types/frame.ts`에 타입 추가**
   ```ts
   // FrameType에 RETROSPECTIVE 추가
   export type FrameType = 'DEVELOPED' | 'QUICK' | 'RETROSPECTIVE'

   export interface RetrospectiveAvailable {
     available: boolean
     frameCount: number
     alreadyGenerated: boolean
   }
   ```

2. **`api/frameApi.ts`에 함수 추가**
   ```ts
   export const checkRetrospectiveAvailable = (year: number, month: number) =>
     axiosInstance
       .get<ApiResponse<RetrospectiveAvailable>>('/api/frames/retrospective/available', { params: { year, month } })
       .then(r => r.data.data)

   export const createRetrospective = (year: number, month: number) =>
     axiosInstance
       .post<ApiResponse<Frame>>('/api/frames/retrospective', { year, month })
       .then(r => r.data.data)
   ```

3. **`RetrospectiveBanner` 컴포넌트 신규 생성** (`frontend/src/components/frame/RetrospectiveBanner.tsx`)
   - props: `year: number`, `month: number`
   - 내부 로직:
     - `useQuery(['retrospectiveAvailable', year, month], () => checkRetrospectiveAvailable(year, month))` 호출
     - `available === false`이면 `null` 반환 (렌더링 없음)
   - 표시 형식:
     ```
     ◆ FEBRUARY 회고 생성하기  →
     ```
   - 스타일:
     - 높이 ~40px, 배경 `var(--bg-card)`, 테두리 `1px solid var(--border-light)`
     - 텍스트 `var(--amber-light)`, 폰트 `Space Mono`, 11px
     - 우측에 얇은 `→` 화살표
   - 탭 시 로딩 상태 진입 → `createRetrospective(year, month)` 호출
   - 생성 중: 텍스트 → `"현상 중..."` + 텍스트 깜빡임 애니메이션 (기존 DevelopingOverlay 스타일 참고)
   - 생성 완료:
     - 쿼리 invalidate: `['frames']`, `['retrospectiveAvailable', year, month]`
     - 배너 자동 숨김 (available이 false로 바뀌므로)
     - 토스트: `"회고가 생성됐어요"` (성공)

4. **`MonthDivider.tsx` 수정** — 회고 배너 삽입
   - props에 `year: number`, `month: number` 추가
   - 구분선 바로 아래에 `<RetrospectiveBanner year={year} month={month} />` 삽입
   - 단, 현재 월(오늘이 속한 월)의 구분선에는 배너 미표시 (이전 월에만)

5. **`FilmFrame.tsx` 수정** — 회고 프레임 특별 스타일
   - `frameType === 'RETROSPECTIVE'`인 경우:
     - 상단 배지: `RECAP` (기존 `DEVELOPED` / `QUICK` 배지와 동일한 위치, 동일한 형태)
     - 배지 배경: `var(--fade-green)` (기존 배지 색상과 구분)
     - 카드 테두리: `1px solid var(--fade-green)` (subtle하게 구분)
     - 제목 폰트: `Noto Serif KR` (일반 프레임의 산세리프와 구분, 에세이 느낌)

6. **`FrameOverlay.tsx` 수정** — 회고 프레임 뷰 조정
   - `frameType === 'RETROSPECTIVE'`인 경우:
     - 편집 버튼 숨김 (회고는 수정 불가)
     - 아카이브 버튼 표시 유지 (숨기기는 가능)
     - 헤더에 `RECAP` 레이블 표시

7. **`RollPage.tsx` 수정**
   - `MonthDivider`에 `year`, `month` props 전달 (기존 `toMonthLabel()` 파싱 로직에서 추출)

## 디자인 규칙
- 회고 배너는 월 구분선 바로 아래 — 타임라인 흐름을 방해하지 않도록 얇게
- 회고 프레임의 특별함은 `RECAP` 배지 + 테두리 색상으로만 표현 (레이아웃 변경 없음)
- 생성 중 텍스트 애니메이션은 기존 DevelopingOverlay의 깜빡임 스타일과 동일하게
- 회고 프레임의 내용(에세이)은 `Noto Serif KR` 폰트로 — 문학적 분위기 강화
- 기존 디자인 토큰 외 색상 추가 금지

## 검증
- [ ] 이전 달(프레임 3개 이상) 구분선 아래 배너 표시 확인
- [ ] 이전 달(프레임 2개 이하) 배너 미표시 확인
- [ ] 현재 월 구분선에는 배너 미표시 확인
- [ ] 배너 탭 → "현상 중..." 상태 → 완료 후 배너 사라짐 확인
- [ ] 생성된 회고가 롤에 `RECAP` 배지 프레임으로 표시 확인
- [ ] 동일 월 재생성 시도 시 409 에러 처리 및 배너 `alreadyGenerated: true` 상태에서 미표시 확인
- [ ] 회고 프레임 FrameOverlay에서 편집 버튼 없음 확인
- [ ] 에세이 본문 `Noto Serif KR` 폰트 적용 확인
- [ ] `POST /api/frames/retrospective` 응답 DTO 정확성 확인

## 커밋 메시지
```
feat: add AI monthly retrospective generation as a special RETROSPECTIVE frame
```
