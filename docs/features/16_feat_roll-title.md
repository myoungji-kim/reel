# 롤 타이틀 (Roll Title)

## 사전 준비
- `docs/00_context_project-overview.md` 읽기
- 관련 파일:
  - `frontend/src/pages/RollPage.tsx`
  - `frontend/src/components/frame/RollDivider.tsx`
  - `frontend/src/components/frame/RollProgressBar.tsx`
  - `frontend/src/components/Toast.tsx`
  - `frontend/src/hooks/useToast.ts`
  - `frontend/src/api/frameApi.ts`
  - `frontend/src/types/frame.ts`
  - `backend/src/main/java/com/reel/frame/entity/Frame.java`
  - `backend/src/main/java/com/reel/frame/service/FrameService.java`
  - `backend/src/main/java/com/reel/frame/controller/FrameController.java`
  - `backend/src/main/java/com/reel/frame/repository/FrameRepository.java`
  - `backend/src/main/java/com/reel/ai/AnthropicService.java`

## 기능 개요
24컷 롤이 완성되면 사용자가 해당 롤에 이름을 붙일 수 있다.
롤 타이틀은 롤 구분선(`RollDivider`)에 표시되며, AI가 해당 롤의 프레임 제목들을 바탕으로 자동으로 후보 1개를 제안한다.

## UX 의도
24개의 기록이 쌓였다는 건 하나의 챕터가 완성된 것이다.
"ROLL 01 완성"이라는 알림보다, "봄이 왔던 롤", "첫 서울살이" 같은 제목이 붙으면 그 롤이 의미 있는 기억의 묶음이 된다.
이름은 직접 쓸 수도 있고 AI 제안을 그대로 쓸 수도 있어 부담이 없다.

## DB 변경

### `rolls` 테이블 신규 생성
```sql
CREATE TABLE rolls (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT REFERENCES users(id) NOT NULL,
    roll_num    INT NOT NULL,
    title       VARCHAR(100),
    created_at  TIMESTAMP DEFAULT NOW(),
    UNIQUE (user_id, roll_num)
);
```
- `roll_num`: 1부터 시작하는 롤 번호 (`Math.ceil(frameNum / 24)`)
- `title`: 사용자가 지정한 타이틀 (null 허용 — 미설정 롤은 "ROLL 01" 형태로 기본 표시)
- 롤 완성 시점에 레코드 생성, 이후 타이틀만 업데이트

## API 변경

### 신규 엔드포인트

#### 롤 타이틀 저장/수정
```
PATCH /api/rolls/{rollNum}/title
```
- 인증 필요 (JWT)
- Request Body:
  ```json
  { "title": "봄이 왔던 롤" }
  ```
- Response:
  ```json
  { "rollNum": 1, "title": "봄이 왔던 롤" }
  ```

#### 전체 롤 목록 조회 (타이틀 포함)
```
GET /api/rolls
```
- 인증 필요 (JWT)
- Response:
  ```json
  [
    { "rollNum": 1, "title": "봄이 왔던 롤" },
    { "rollNum": 2, "title": null }
  ]
  ```

#### AI 타이틀 제안
```
POST /api/rolls/{rollNum}/title-suggest
```
- 인증 필요 (JWT)
- Request Body: 없음
- Response:
  ```json
  { "suggested": "봄이 왔던 롤" }
  ```
- 해당 롤(rollNum)에 속한 프레임 제목 목록을 AI에 전달하여 1줄 제목 생성

## 구현 요청

### 백엔드

1. **`Roll` 엔티티 신규 생성**
   ```java
   // backend/src/main/java/com/reel/frame/entity/Roll.java
   @Entity
   @Table(
       name = "rolls",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "roll_num"})
   )
   @Getter
   @NoArgsConstructor(access = AccessLevel.PROTECTED)
   public class Roll {
       @Id
       @GeneratedValue(strategy = GenerationType.IDENTITY)
       private Long id;

       @ManyToOne(fetch = FetchType.LAZY)
       @JoinColumn(name = "user_id", nullable = false)
       private User user;

       @Column(name = "roll_num", nullable = false)
       private Integer rollNum;

       @Column(length = 100)
       private String title;

       @Column(name = "created_at", nullable = false, updatable = false)
       private LocalDateTime createdAt;

       @PrePersist
       protected void onCreate() { createdAt = LocalDateTime.now(); }

       public static Roll of(User user, int rollNum) {
           Roll roll = new Roll();
           roll.user = user;
           roll.rollNum = rollNum;
           return roll;
       }

       public void updateTitle(String title) { this.title = title; }
   }
   ```

2. **`RollRepository` 신규 생성**
   ```java
   // backend/src/main/java/com/reel/frame/repository/RollRepository.java
   public interface RollRepository extends JpaRepository<Roll, Long> {
       Optional<Roll> findByUserIdAndRollNum(Long userId, int rollNum);
       List<Roll> findByUserIdOrderByRollNumAsc(Long userId);
   }
   ```

3. **`RollService` 신규 생성**
   ```java
   // backend/src/main/java/com/reel/frame/service/RollService.java
   @Service
   @RequiredArgsConstructor
   @Transactional
   public class RollService {
       private final RollRepository rollRepository;
       private final FrameRepository frameRepository;
       private final AnthropicService anthropicService;

       // 롤 완성 시점에 호출 (FrameService에서 호출)
       public void ensureRollCreated(User user, int rollNum) {
           if (rollRepository.findByUserIdAndRollNum(user.getId(), rollNum).isEmpty()) {
               rollRepository.save(Roll.of(user, rollNum));
           }
       }

       public RollTitleResponse updateTitle(Long userId, int rollNum, String title) {
           Roll roll = rollRepository.findByUserIdAndRollNum(userId, rollNum)
               .orElseThrow(() -> new ReelException(ErrorCode.NOT_FOUND));
           roll.updateTitle(title);
           return new RollTitleResponse(rollNum, roll.getTitle());
       }

       @Transactional(readOnly = true)
       public List<RollInfoResponse> getAllRolls(Long userId) {
           return rollRepository.findByUserIdOrderByRollNumAsc(userId).stream()
               .map(r -> new RollInfoResponse(r.getRollNum(), r.getTitle()))
               .toList();
       }

       public RollTitleSuggestResponse suggestTitle(Long userId, int rollNum) {
           // 해당 롤의 프레임 범위 계산
           int startFrameNum = (rollNum - 1) * 24 + 1;
           int endFrameNum = rollNum * 24;

           List<String> titles = frameRepository
               .findTitlesByUserIdAndFrameNumBetween(userId, startFrameNum, endFrameNum);

           String suggested = anthropicService.suggestRollTitle(titles);
           return new RollTitleSuggestResponse(suggested);
       }
   }
   ```

4. **`FrameRepository`에 메서드 추가**
   ```java
   @Query("SELECT f.title FROM Frame f WHERE f.user.id = :userId AND f.frameNum BETWEEN :start AND :end AND f.isArchived = false ORDER BY f.frameNum ASC")
   List<String> findTitlesByUserIdAndFrameNumBetween(
       @Param("userId") Long userId,
       @Param("start") int start,
       @Param("end") int end
   );
   ```

5. **`AnthropicService`에 타이틀 제안 메서드 추가**
   ```java
   public String suggestRollTitle(List<String> frameTitles) {
       String titlesText = String.join(", ", frameTitles);
       String prompt = String.format("""
           다음은 한 롤에 담긴 24개 일기의 제목 목록입니다:
           %s

           이 기록들을 하나로 묶는 감성적인 롤 이름을 10자 이내로 제안해주세요.
           이름만 출력하고, 따옴표나 설명 없이 답변해주세요.
           """, titlesText);
       // 기존 AnthropicService 호출 방식과 동일하게 단발성 메시지 요청
       return anthropicClient.singleMessage(prompt).trim();
   }
   ```

6. **`FrameService` 수정** — 롤 완성 시 `RollService.ensureRollCreated()` 호출
   - 프레임 저장 후 `totalFrames % 24 == 0`인 경우 (롤 완성 시점)
   - `rollService.ensureRollCreated(user, completedRollNum)` 호출

7. **`RollController` 신규 생성**
   ```java
   // backend/src/main/java/com/reel/frame/controller/RollController.java
   @RestController
   @RequestMapping("/api/rolls")
   @RequiredArgsConstructor
   public class RollController {

       private final RollService rollService;

       @GetMapping
       public ResponseEntity<ApiResponse<List<RollInfoResponse>>> getAllRolls(
           @AuthenticationPrincipal CustomOAuth2User principal
       ) {
           return ResponseEntity.ok(ApiResponse.success(rollService.getAllRolls(principal.getUserId())));
       }

       @PatchMapping("/{rollNum}/title")
       public ResponseEntity<ApiResponse<RollTitleResponse>> updateTitle(
           @PathVariable int rollNum,
           @RequestBody @Valid UpdateRollTitleRequest request,
           @AuthenticationPrincipal CustomOAuth2User principal
       ) {
           return ResponseEntity.ok(ApiResponse.success(
               rollService.updateTitle(principal.getUserId(), rollNum, request.title())
           ));
       }

       @PostMapping("/{rollNum}/title-suggest")
       public ResponseEntity<ApiResponse<RollTitleSuggestResponse>> suggestTitle(
           @PathVariable int rollNum,
           @AuthenticationPrincipal CustomOAuth2User principal
       ) {
           return ResponseEntity.ok(ApiResponse.success(
               rollService.suggestTitle(principal.getUserId(), rollNum)
           ));
       }
   }
   ```

8. **DTO 신규 생성**
   - `RollInfoResponse(int rollNum, String title)`
   - `RollTitleResponse(int rollNum, String title)`
   - `RollTitleSuggestResponse(String suggested)`
   - `UpdateRollTitleRequest(String title)` — `@NotBlank`, 최대 100자

### 프론트엔드

1. **`types/frame.ts`에 타입 추가**
   ```ts
   export interface RollInfo {
     rollNum: number
     title: string | null
   }
   ```

2. **`api/rollApi.ts` 신규 생성**
   ```ts
   import axiosInstance from './axiosInstance'
   import type { RollInfo } from '../types/frame'

   export const getRolls = () =>
     axiosInstance.get<ApiResponse<RollInfo[]>>('/api/rolls').then(r => r.data.data)

   export const updateRollTitle = (rollNum: number, title: string) =>
     axiosInstance.patch<ApiResponse<RollInfo>>(`/api/rolls/${rollNum}/title`, { title }).then(r => r.data.data)

   export const suggestRollTitle = (rollNum: number) =>
     axiosInstance.post<ApiResponse<{ suggested: string }>>(`/api/rolls/${rollNum}/title-suggest`).then(r => r.data.data)
   ```

3. **`RollTitleSheet` 컴포넌트 신규 생성** (`frontend/src/components/frame/RollTitleSheet.tsx`)
   - props: `rollNum: number`, `currentTitle: string | null`, `onClose: () => void`
   - 바텀시트 형태 (기존 `QuickNoteSheet`와 동일한 시트 스타일)
   - 내부 구성:
     ```
     ── ROLL 01 완성 ──
     이 롤의 이름을 붙여주세요

     [ 봄이 왔던 롤          ]  ← 텍스트 입력 (최대 20자)

     ✦ AI 제안 받기           ← 버튼. 탭 시 로딩 후 input에 제안 내용 자동 채움

     [ 건너뛰기 ]  [ 저장하기 ]
     ```
   - "AI 제안 받기" 탭 시 `suggestRollTitle(rollNum)` 호출, 응답을 input value에 세팅
   - "저장하기" 탭 시 `updateRollTitle(rollNum, title)` 호출 → 성공 시 시트 닫기 + 쿼리 invalidate
   - "건너뛰기" 탭 시 저장 없이 시트 닫기

4. **`uiStore.ts` 수정** — 롤 타이틀 시트 상태 추가
   ```ts
   isRollTitleOpen: boolean
   setRollTitleOpen: (open: boolean) => void
   pendingRollNum: number | null          // 타이틀 입력 대상 롤 번호
   setPendingRollNum: (num: number | null) => void
   ```

5. **`RollDivider.tsx` 수정** — 타이틀 표시 및 수정 진입
   - props에 `title: string | null`, `onEditTitle: () => void` 추가
   - 기존 구분선 텍스트 `— ROLL 01 완성 —` → 타이틀 있으면 `— 봄이 왔던 롤 —` 으로 표시
   - 타이틀 옆에 작은 `✎` 편집 아이콘 배치 (탭 시 `RollTitleSheet` 오픈)
   - 편집 아이콘 스타일: `var(--cream-muted)`, opacity: 0.4, 8px

6. **`RollPage.tsx` 수정**
   - `useQuery(['rolls'], getRolls)` 구독 → `rollNum → title` 맵 생성
   - `RollDivider`에 해당 롤의 타이틀 전달
   - 롤 완성 토스트 탭 시 `RollTitleSheet` 오픈 (기존 완성 토스트에 액션 추가)
     - 토스트 메시지: `"ROLL 01 완성! 이름 붙이기 →"` → 탭 시 시트 오픈

7. **`HomePage.tsx`에 `RollTitleSheet` 렌더링 추가**
   - `isRollTitleOpen`, `pendingRollNum` 상태를 구독
   - `<RollTitleSheet rollNum={pendingRollNum} ... />` 렌더링

## 디자인 규칙
- `RollTitleSheet` 스타일은 기존 `QuickNoteSheet`와 동일한 바텀시트 규격
- 롤 구분선의 타이틀 텍스트: `Bebas Neue` 폰트, `var(--cream-dim)` 색상
- 편집 아이콘(`✎`)은 최대한 약하게 — 기본 상태에서는 거의 보이지 않아야 함
- AI 제안 로딩 중: 입력 필드 placeholder에 "생각 중..." 표시
- 기존 디자인 토큰 외 색상 추가 금지

## 검증
- [ ] 24번째 프레임 저장 직후 롤 완성 토스트 탭 → `RollTitleSheet` 오픈 확인
- [ ] "AI 제안 받기" 탭 시 AI 응답이 input에 채워지는지 확인
- [ ] 제목 입력 후 저장 → `RollDivider`에 타이틀 반영 확인
- [ ] "건너뛰기" 탭 시 타이틀 null 상태 유지 (기존 `ROLL 01` 표시) 확인
- [ ] 기존 저장된 타이틀을 `✎` 버튼으로 수정 가능한지 확인
- [ ] `PATCH /api/rolls/{rollNum}/title` 응답 확인
- [ ] 타이틀 20자 초과 입력 방지 확인
- [ ] 롤이 완성되지 않은 상태에서 `POST /api/rolls/{rollNum}/title-suggest` 호출 시 적절한 에러 처리 확인

## 커밋 메시지
```
feat: add roll title with AI suggestion on roll completion
```
