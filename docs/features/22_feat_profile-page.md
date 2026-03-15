# 나(프로필) 페이지 구현 — 시니어 기획/디자인 검토

> 원본 스펙: `reel-feat-profile-page.md` (사용자 제공)
> 작성 기준: 2026-03-15
> 현재 코드베이스 분석 기반

---

## 1. 스펙 검토 요약

### 잘 설계된 부분 ✅

- ⚙ 아이콘 제거 → 설정 진입점 단일화 — UX 단순화, 올바른 방향
- 홈(오늘/현재 streak) vs 여기(역대/bestStreak) 데이터 명확 분리
- 롤 관리 = 탐색 아닌 액션 중심 — 필름롤 탭과 역할 구분
- OverlaySheet 없이 페이지 내 스크롤 구조 — 복잡도 최소화

### 수정이 필요한 부분 ⚠️

아래 4개 항목은 현재 코드베이스와 충돌하거나 구현 방향 조정이 필요함.

---

## 2. 충돌 지점 및 해결 방향

### 2-1. `bestStreak` — User 엔티티에 컬럼 추가 필요

**스펙 요구**
```typescript
journey.bestStreak: number  // 역대 최장 (현재 진행 중 streak 아님)
```

**현실**
`User` 엔티티에는 `streakCount`(현재 연속일)만 있음.
`bestStreak`은 별도 필드가 없어서 전체 프레임에서 매번 재계산하면 비쌈.

**해결: `best_streak` 컬럼 추가 + `updateStreak()` 시 동기화**

```java
// User.java 추가
@Column(name = "best_streak", nullable = false, columnDefinition = "INT DEFAULT 0")
private int bestStreak = 0;

// updateStreak() 수정
public void updateStreak(LocalDate today) {
    // ... 기존 streakCount 업데이트 로직 ...
    if (streakCount > bestStreak) bestStreak = streakCount;
    lastFrameDate = today;
}
```

DB 마이그레이션: `ALTER TABLE users ADD COLUMN best_streak INT NOT NULL DEFAULT 0;`
기존 사용자는 배포 시 `best_streak = streak_count`로 초기화 (허용 가능 — 이미 진행 중인 streak이 최장일 수 있음).

---

### 2-2. `bio` — User 엔티티에 컬럼 추가 필요

**스펙 요구**
```typescript
user.bio: string  // "오늘도 한 장 현상하는 중"
```

**현실**
`User`에 `bio` 필드 없음. 현재 OAuth 가입 시 이름/이메일만 저장.

**해결: `bio` 컬럼 추가 (nullable, 빈 문자열 기본값)**

```java
@Column(length = 100)
private String bio = "";
```

DB 마이그레이션: `ALTER TABLE users ADD COLUMN bio VARCHAR(100) DEFAULT '';`
초기값 빈 문자열 → 프론트에서 "한 줄 소개를 입력해보세요" 플레이스홀더로 처리.

**1단계 구현에서는 bio 수정 기능 제외 — 프로필 카드에 표시만 구현.**
수정은 추후 별도 피처로 분리.

---

### 2-3. 롤 `startDate` / `endDate` — Roll 엔티티에 없음, 파생 계산

**스펙 요구**
```typescript
completed[].startDate: string  // "2025-11"
completed[].endDate: string    // "2026-01"
```

**현실**
`Roll` 엔티티에 날짜 필드 없음. `createdAt` 만 있음 (제목 설정 시점 = 롤 완성 직후).

**해결: 각 롤 번호 범위의 프레임 날짜에서 파생**

```java
// ROLL N = frameNum (N-1)*24+1 ~ N*24
int startNum = (rollNum - 1) * 24 + 1;
int endNum   = rollNum * 24;

// FrameRepository 신규 쿼리 추가
@Query("SELECT MIN(f.date), MAX(f.date) FROM Frame f " +
       "WHERE f.user.id = :userId AND f.frameNum BETWEEN :start AND :end")
Object[] findDateRangeByRollNum(@Param("userId") Long userId,
                                @Param("start") int start,
                                @Param("end") int end);
```

startDate/endDate를 `"yyyy-MM"` 형식으로 반환.

---

### 2-4. TopBar ⚙ 제거 — 기존 로그아웃/보관 기능 이관

**현실**
`TopBar.tsx`에 Settings 드롭다운(로그아웃 + 보관된 필름)이 존재.
이 기능들이 ProfilePage의 SettingsSection으로 이관되면 TopBar에서 제거해야 함.

**해결 순서**
1. ProfilePage SettingsSection에 `로그아웃` + `보관된 필름` 항목 구현 확인
2. `TopBar.tsx`에서 Settings 버튼 + 드롭다운 전체 제거
3. import에서 `Settings` (lucide-react), `useNavigate`, `logout`, `useAuthStore` 제거

**주의:** TopBar는 ChatPage 헤더가 아닌 전역 레이아웃이므로 제거 시 모든 탭에 적용됨.
ChatPage는 자체 헤더를 사용하므로 영향 없음.

---

## 3. `GET /api/profile` 구현 전략

### 3-1. 패키지 구조

```
backend/src/main/java/com/reel/profile/
├── dto/ProfileResponse.java
├── service/ProfileService.java
└── controller/ProfileController.java
```

기존 `home/` 패키지와 동일한 구조. `user/` 패키지에 합치지 않고 분리 — 관심사 분리.

### 3-2. ProfileResponse 설계

```java
public record ProfileResponse(
    UserInfo user,
    JourneyInfo journey,
    RollsInfo rolls
) {
    public record UserInfo(
        String nickname,
        String avatarUrl,    // profileImg (nullable)
        String initial,      // nickname 첫 글자 대문자
        String joinedAt,     // "2025-11-11"
        String bio
    ) {}

    public record JourneyInfo(
        int totalFrames,
        int completedRolls,
        int bestStreak,
        String topMood,
        List<MoodDist> moodDistribution
    ) {}

    public record MoodDist(String mood, int count, double ratio) {}

    public record RollsInfo(
        ActiveRoll active,
        List<CompletedRoll> completed
    ) {}

    public record ActiveRoll(
        int rollNumber,
        String title,        // null이면 프론트에서 "ROLL 02" 표시
        int currentFrames,
        int totalFrames,     // 항상 24
        int remaining
    ) {}

    public record CompletedRoll(
        int rollNumber,
        String title,
        int frameCount,
        String startDate,    // "2025-11"
        String endDate       // "2026-01"
    ) {}
}
```

### 3-3. ProfileService 핵심 로직

```java
// 총 프레임 수 (아카이브 포함 X, RETROSPECTIVE 포함)
long totalFrames = frameRepository.countByUserId(userId);

// 완성 롤 수
int completedRolls = (int)(totalFrames / 24);

// 현재 진행 중 롤
int activeRollNum = completedRolls + 1;
int currentFrames = (int)(totalFrames % 24);

// 역대 최장 streak
User user = userRepository.findById(userId).orElseThrow();
int bestStreak = user.getBestStreak();

// 전체 감정 분포 (isArchived=false, 전체 기간)
List<Frame> allFrames = frameRepository.findByUserIdAndIsArchivedFalse(userId);
// mood null 제외, 집계 후 내림차순 정렬
Map<String, Long> moodCount = allFrames.stream()
    .filter(f -> f.getMood() != null)
    .collect(Collectors.groupingBy(Frame::getMood, Collectors.counting()));
long total = moodCount.values().stream().mapToLong(Long::longValue).sum();
List<MoodDist> moodDistribution = moodCount.entrySet().stream()
    .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
    .map(e -> new MoodDist(e.getKey(), e.getValue().intValue(),
                           total > 0 ? (double) e.getValue() / total : 0))
    .collect(Collectors.toList());
String topMood = moodDistribution.isEmpty() ? null : moodDistribution.get(0).mood();
```

**참고:** `findByUserIdAndIsArchivedFalse`는 현재 `findByUserIdAndIsArchivedFalseOrderByCreatedAtDesc`로 존재 (Page 반환). 전체 로드가 필요하므로 List 반환 쿼리 신규 추가:

```java
// FrameRepository 추가
List<Frame> findByUserIdAndIsArchivedFalse(Long userId);
```

---

## 4. 프론트엔드 구현 전략

### 4-1. 탭 추가

```typescript
// uiStore.ts
type Tab = 'home' | 'roll' | 'favorites' | 'profile'

// BottomNav.tsx — 기존 placeholder "나" 탭을 activeTab 연결로 교체
<button onClick={() => onTabChange('profile')} ...>
```

### 4-2. 컴포넌트 파일 구조

```
frontend/src/pages/ProfilePage.tsx          // 메인 페이지
frontend/src/api/profileApi.ts              // GET /api/profile
```

CSS는 인라인 styles 객체 패턴 유지 (기존 코드 패턴 통일). 별도 CSS 클래스 파일 불필요.

### 4-3. HomePage.tsx 라우팅 추가

```tsx
// HomePage.tsx — activeTab 분기에 profile 추가
{activeTab === 'profile' && <ProfilePage />}
```

### 4-4. 확인 모달

로그아웃/회원탈퇴에 `window.confirm()` 대신 기존 `useToast` 패턴 확인.
→ 기존 앱에 확인 모달 컴포넌트 없음. 단순 `window.confirm()` 사용 (추후 교체 가능).
또는 인라인 확인 상태(isConfirmingDelete) 패턴으로 구현:

```tsx
// 회원탈퇴 2단계 확인
{!isConfirmingDelete ? (
  <button onClick={() => setIsConfirmingDelete(true)}>회원탈퇴</button>
) : (
  <div>
    <span>정말 탈퇴하시겠어요?</span>
    <button onClick={handleDeleteAccount}>확인</button>
    <button onClick={() => setIsConfirmingDelete(false)}>취소</button>
  </div>
)}
```

### 4-5. grain-overlay

기존 `index.css`에 `.grain-overlay` 정의 확인 후 ProfilePage wrapper에 추가.

---

## 5. 확정된 컴포넌트 구조

```
ProfilePage
├── TopBar (로고 + "MY PAGE" 레이블, ⚙ 없음)
└── ScrollContent (overflowY: auto)
    ├── ProfileCard
    │   ├── Avatar (이니셜 or 이미지)
    │   ├── Nickname + SINCE {joinedAt}
    │   └── bio
    ├── JourneySection           "전체 여정" + "가입 이후 전체 기간 누적"
    │   └── 2×2 Bento Grid
    │       ├── TotalFramesCell  dark bg, ALL TIME 뱃지
    │       ├── CompletedRollsCell  COMPLETED 뱃지
    │       ├── BestStreakCell    gold bg, BEST 뱃지
    │       └── TopMoodCell      ALL TIME 뱃지, 감정 분포 미니 바
    ├── RollManageSection        "롤 관리" + "제목 수정 · 완성 롤 열람"
    │   ├── ActiveRollItem       진행 중 + 진행률 바
    │   └── CompletedRollItem×N  완성 + 기간 표시
    └── SettingsSection
        ├── 매일 현상 알림 (토글)
        ├── 테마 (→ 추후 구현, 현재 비활성)
        ├── 데이터 내보내기 (→ 추후 구현, 현재 비활성)
        ├── [구분선]
        ├── 보관된 필름 → setArchivedOpen(true)
        ├── 로그아웃 → confirm → logout() + clearAuth()
        ├── [구분선]
        └── 회원탈퇴 → 2단계 확인 → DELETE /api/auth/withdraw (신규 API)
```

---

## 6. 신규 API 목록

| API | 메서드 | 설명 |
|-----|--------|------|
| `GET /api/profile` | GET | ProfileResponse 전체 반환 |
| `DELETE /api/auth/withdraw` | DELETE | 회원탈퇴 (계정 + 데이터 삭제) |

**회원탈퇴 구현 범위:** 1단계에서는 User 소프트 삭제(isDeleted 플래그) 또는 하드 삭제.
데이터 정책 미정 시 일단 하드 삭제로 구현, 추후 변경.

---

## 7. DB 마이그레이션 요약

```sql
-- users 테이블 컬럼 추가
ALTER TABLE users ADD COLUMN best_streak INT NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN bio VARCHAR(100) NOT NULL DEFAULT '';

-- 기존 사용자 best_streak 초기화 (현재 streak_count 값으로)
UPDATE users SET best_streak = streak_count;
```

---

## 8. 구현 순서 (추천)

```
1. DB 마이그레이션 (best_streak, bio 컬럼 추가)
2. User 엔티티 + updateStreak() 수정 (bestStreak 동기화)
3. FrameRepository 신규 쿼리 추가
   - findByUserIdAndIsArchivedFalse(Long userId) → List<Frame>
   - findDateRangeByRollNum(userId, start, end) → Object[]
4. ProfileResponse DTO 작성
5. ProfileService 구현 (journey + rolls 집계)
6. ProfileController GET /api/profile
7. DELETE /api/auth/withdraw (AuthController 또는 UserController)
8. TopBar.tsx — Settings 아이콘 + 드롭다운 제거
9. uiStore.ts — Tab에 'profile' 추가
10. BottomNav.tsx — "나" 탭 onTabChange('profile') 연결
11. profileApi.ts — getProfile() 구현
12. ProfilePage.tsx — 전체 컴포넌트 구현
13. HomePage.tsx — activeTab === 'profile' 분기 추가
```

---

## 9. 변경 없이 재사용되는 컴포넌트

| 컴포넌트/유틸 | 재사용 방식 |
|---|---|
| `OverlaySheet` | ArchivedSheet는 setArchivedOpen(true)로 기존 그대로 |
| `useToast` | 로그아웃 성공/실패 피드백 |
| `getMoodBarColor()` | 감정 분포 미니 바 색상 |
| `useUIStore.setArchivedOpen` | 보관된 필름 진입점 |
| `logout()` + `clearAuth()` | TopBar에서 ProfilePage로 이관 |
| `getRollStats()` | 진행 중인 롤 currentFrames/remaining 계산 가능 (대안) |

---

## 10. 최종 체크리스트

```
[ ] DB: best_streak 컬럼 추가 + 기존 사용자 초기화
[ ] DB: bio 컬럼 추가
[ ] User.updateStreak(): bestStreak 동기화
[ ] FrameRepository: findByUserIdAndIsArchivedFalse() 추가
[ ] FrameRepository: findDateRangeByRollNum() 추가
[ ] ProfileService: journey.bestStreak이 역대 최장값인가
[ ] ProfileService: journey.moodDistribution이 전체 기간 기준인가
[ ] ProfileService: rolls.completed[].startDate/endDate 파생 계산
[ ] GET /api/profile 응답에 user/journey/rolls 모두 포함
[ ] DELETE /api/auth/withdraw 구현
[ ] TopBar.tsx: Settings 아이콘 + 드롭다운 제거
[ ] uiStore.ts: Tab 타입에 'profile' 추가
[ ] BottomNav.tsx: "나" 탭 onTabChange('profile') 연결
[ ] ProfilePage: 벤토 셀 ALL TIME / BEST / COMPLETED 뱃지 표시
[ ] ProfilePage: sec-sublabel "가입 이후 전체 기간 누적" 문구
[ ] ProfilePage: progress-fill 너비 (currentFrames/24)*100%
[ ] ProfilePage: 완성 롤에 startDate — endDate 기간 표시
[ ] ProfilePage: 로그아웃 — confirm 후 처리
[ ] ProfilePage: 회원탈퇴 — 2단계 확인 + danger 스타일
[ ] ProfilePage: 보관된 필름 → setArchivedOpen(true)
[ ] ProfilePage: grain-overlay 적용
[ ] HomePage.tsx: activeTab === 'profile' 분기 추가
[ ] 모든 화면 우상단 ⚙ 아이콘 제거 확인
```
