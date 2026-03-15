# 현상소 홈 벤토 그리드 — 시니어 기획/디자인 검토

> 원본 스펙: `reel-feat-home-bento.md` (사용자 제공)
> 작성 기준: 2026-03-15
> 현재 코드베이스 분석 기반

---

## 1. 스펙 검토 요약

### 잘 설계된 부분 ✅

- CSS Grid 고집 (flex 금지) — tall/wide 스패닝에 필수, 올바른 판단
- `grain-overlay` per cell 적용 — 필름 감성 일관성
- intensity 기반 MoodFlow 바 — 단순 있음/없음보다 정보량이 풍부
- 스켈레톤 로딩 — 레이아웃 shift 방지

### 수정이 필요한 부분 ⚠️

아래 5개 항목은 현재 코드베이스와 충돌하거나 구현 불가 상태.
각 항목별 해결 방향을 제시한다.

---

## 2. 충돌 지점 및 해결 방향

### 2-1. MoodType 불일치 (가장 중요)

**문제**
스펙의 MoodType은 영문 (`'joy' | 'warm' | 'tired' | 'sad' | 'calm'`)이지만,
실제 DB는 한국어 문자열 (`'기쁨'`, `'설렘'`, `'평온'` 등)로 저장됨.
백엔드는 enum 없이 `String mood` 컬럼 사용.

**현재 한국어 감정값 8종**
```
기쁨 / 설렘 / 평온 / 감사 / 슬픔 / 외로움 / 피곤 / 무기력
```

**해결: 프론트에서 변환 유틸 사용**

`moodTone.ts`에 이미 `getMoodBarColor(mood)` 함수가 있고,
emotion 변수(`--emotion-joy` 등)도 이미 tokens.css에 정의됨.
새로운 MoodType enum 대신 **기존 한국어 값을 그대로 사용**하고,
색상 매핑은 `getMoodBarColor()`로 처리한다.

```typescript
// 스펙의 MOOD_COLOR 객체 대신 기존 함수 활용
import { getMoodBarColor } from '../utils/moodTone'
// getMoodBarColor('기쁨') → '#c8a96e'
// getMoodBarColor('슬픔') → '#7a8fa6'
```

**StreakCell 도트도 동일하게** `getMoodBarColor(mood)` 사용.

---

### 2-2. `/api/home/summary` 신규 엔드포인트 필요

**문제**
해당 엔드포인트가 존재하지 않음.
기존 API 조합으로 일부 대체 가능하나, **`streak.recentDays`와 `moodFlow`는 불가**.

**기존 API로 대체 가능한 항목**

| 스펙 필드 | 대체 API | 비고 |
|---|---|---|
| `today.hasRecord` | `GET /api/user/streak` → `recordedToday` | ✅ 즉시 사용 |
| `streak.count` | `GET /api/user/streak` → `streakCount` | ✅ 즉시 사용 |
| `monthStats.frameCount` | `GET /api/frames/calendar?year&month` → 배열 길이 | ✅ 조합 가능 |
| `today.mood` | `GET /api/frames/calendar` → 오늘 날짜 항목 | ✅ 조합 가능 |
| `recentRecords` | `GET /api/frames?page=0&size=5` | ✅ 즉시 사용 |

**신규 백엔드 작업이 필요한 항목**

| 스펙 필드 | 이유 | 결정 |
|---|---|---|
| `streak.recentDays` (최근 7일 감정) | 현재 streak API엔 날짜별 감정 없음 | **신규 API 추가** |
| `moodFlow.days[].intensity` | DB에 intensity 컬럼 없음 | **제거 → 단순화** |

**결론: `/api/home/summary` 신규 엔드포인트 추가**
(기존 API 여러 번 호출 대신 단일 호출로 성능 최적화)

```java
// GET /api/home/summary
// 응답에 포함: streakCount, recordedToday, todayMood,
//              recentDays(최근 7일 날짜+감정), frameCount(이번달), recentFrames(최근 5개)
```

---

### 2-3. `moodFlow.intensity` 제거 → 단순화

**문제**
`intensity(1~5)` 값은 DB에 저장되지 않음.
감정 입력 시 강도를 따로 입력받지 않으므로 데이터 없음.

**해결: intensity 제거, 바 높이 고정 2단계**

```
기록 있는 날 → 16px (고정)
기록 없는 날 → 6px  (empty, border-default 색)
```

단순하지만 "기록했다 / 안 했다"의 리듬감을 표현하기에 충분.
추후 감정 강도 입력 기능이 생기면 그때 intensity 적용.

---

### 2-4. `navigate('/develop')`, `navigate('/frame/${id}')` 라우팅 미존재

**문제**
현재 앱은 모든 화면이 `/home` 단일 경로 내에서 탭 전환으로 구현됨.
`/develop`, `/frame/:id` 경로가 없음.

**해결: 기존 탭/오버레이 방식 유지**

| 스펙 동작 | 실제 구현 |
|---|---|
| `navigate('/develop')` | `setActiveTab('chat')` |
| `navigate('/frame/${id}')` | `setSelectedFrameId(id); setFrameDetailOpen(true)` |
| HomeHeader [+] 버튼 | `setActiveTab('chat')` (또는 `setQuickNoteOpen(true)`) |

> [+] 버튼의 의미: "오늘 일기 쓰러 가기" → 현상소(chat) 탭 전환이 자연스러움.
> 단, 현상소 탭 자체가 이미 현상 화면이므로 [+] 버튼을 **빠른 현상(QuickNote)** 진입으로 쓰는 것도 고려.
> **잠정 결정: `setQuickNoteOpen(true)`** — 빠른 기록 진입이 더 유용함.

---

### 2-5. `grain-overlay` CSS 클래스 미정의

**문제**
현재 grain 효과는 `body::after` pseudo-element로 전역 적용됨.
벤토 셀에 per-cell grain을 주려면 별도 CSS 클래스 필요.

**해결: 셀별 grain 제거, 전역 grain으로 충분**

벤토 셀에 `<div className="grain-overlay" />` 추가 없이도
`body::after`의 전역 grain이 모든 셀 위에 적용됨.
구현 복잡도를 낮추기 위해 **per-cell grain div 생략**.

---

## 3. 확정된 API 설계

### 신규: `GET /api/home/summary`

```typescript
interface HomeSummaryResponse {
  today: {
    date: string        // "2026-03-15"
    dayOfWeek: string   // "SAT"
    hasRecord: boolean
    mood: string | null // 한국어 그대로: "기쁨", "평온" 등
  }
  streak: {
    count: number
    recentDays: Array<{
      date: string        // "2026-03-15"
      mood: string | null // 한국어, 없으면 null
    }>                    // 오늘 포함 최근 7일, 오래된 순
  }
  monthStats: {
    year: number
    month: number
    frameCount: number
  }
  recentFrames: Array<{
    id: number
    title: string
    date: string    // "2026-03-12"
    mood: string | null
    frameNum: number
  }>                // 최근 5개, 최신순
}
```

**백엔드 구현 위치**: `HomeController` 신규 생성
**쿼리 방식**: 기존 Repository 메서드 조합 (N+1 없이)

---

## 4. 컴포넌트 구조 수정안

원본 스펙 트리에서 수정된 부분:

```
현상소 탭 (activeTab === 'chat' → 'home'으로 변경 필요)
├── HomeHeader
│   └── [+] 버튼 → setQuickNoteOpen(true)
├── BentoGrid (CSS Grid)
│   ├── StreakCell (tall + dark, grid-row: span 2)
│   ├── TodayCell (gold)
│   ├── MonthCell (기본)
│   └── MoodFlowCell (wide, grid-column: span 2)
│       └── 바 높이: 기록O=16px / 기록X=6px (intensity 제거)
├── Divider
├── SectionLabel
└── PrevRecordList
    └── PrevRecordCard × 최대 5개
        └── 클릭 → setSelectedFrameId + setFrameDetailOpen(true)
```

---

## 5. uiStore / 탭 구조 변경

현재 현상소 탭(`'chat'`)이 ChatPage를 보여주고 있음.
벤토 홈으로 교체하려면 탭 타입 변경 필요.

```typescript
// 현재
type Tab = 'chat' | 'roll' | 'favorites'

// 변경 후
type Tab = 'home' | 'roll' | 'favorites'
// 'chat'은 탭이 아닌 내부 네비게이션으로 처리
// ChatPage는 'home' 탭 내 조건부 렌더링 또는 별도 상태로 관리
```

**ChatPage 진입 방법 (변경 후)**
- BottomNav FAB → 현상소 탭 내 ChatPage로 전환 (내부 서브뷰)
- HomeHeader [+] → QuickNoteSheet 오픈

**구현 전략**: `HomePage` 내에 `homeView: 'bento' | 'chat'` 상태 추가
```
homeView === 'bento' → HomeBentoPage 렌더
homeView === 'chat'  → ChatPage 렌더
FAB 클릭 → setHomeView('chat')
ChatPage 완료/뒤로가기 → setHomeView('bento')
```

---

## 6. StreakCell — 도트 렌더링 스펙

```
최근 7일 (오늘 포함, 왼쪽=오래된 날)
각 칸: 8×8px 원형 도트

기록 있음 → getMoodBarColor(mood) 배경색
기록 없음 → 빈 도트 (rgba(240,238,233,0.2) bg + rgba(240,238,233,0.3) border)
```

```tsx
// 도트 렌더 예시
{recentDays.map((day, i) => (
  <div
    key={i}
    style={{
      width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
      background: day.mood
        ? getMoodBarColor(day.mood)
        : 'rgba(240,238,233,0.2)',
      border: day.mood ? 'none' : '1px solid rgba(240,238,233,0.3)',
    }}
  />
))}
```

---

## 7. MoodFlowCell — 바 스펙 (intensity 제거 후)

```tsx
{recentDays.map((day, i) => (
  <div
    key={i}
    style={{
      width: 10,
      height: day.mood ? 16 : 6,
      borderRadius: '3px 3px 0 0',
      background: day.mood
        ? getMoodBarColor(day.mood)
        : 'var(--border-default)',
      flexShrink: 0,
      transition: 'height 0.3s ease',
    }}
  />
))}
```

날짜 라벨은 생략 — 7개 바 자체로 "지난 7일"을 시각적으로 전달.

---

## 8. PrevRecordCard 스펙

```tsx
// 최근 5개, 최신순
// 클릭 → FrameOverlay 오픈 (setSelectedFrameId + setFrameDetailOpen)

<div style={styles.card} onClick={onClick}>
  <div>
    <div style={styles.title}>{title}</div>
    <div style={styles.meta}>
      <span style={styles.date}>{formatChatDate(new Date(date))}</span>
      <span style={styles.frameNum}>#{String(frameNum).padStart(2, '0')}</span>
    </div>
  </div>
  <span style={styles.arrow}>›</span>
</div>

// CSS
card:   margin 0 16px 8px / bg surface-muted / radius 12 / padding 11 14 / border border-default
title:  Noto Sans KR 11px 500 text-primary
date:   DM Mono 8px text-muted
frameNum: DM Mono 8px text-placeholder
arrow:  DM Mono 16px text-muted
```

---

## 9. 빈 상태 처리

| 상황 | 표시 |
|---|---|
| 첫 사용 (기록 0개) | StreakCell: "0일", MoodFlowCell: 7개 빈 바, PrevRecordList 숨김 |
| 오늘 기록 없음 | TodayCell: "—" |
| 이번 달 기록 없음 | MonthCell: "0" |

별도 empty state 화면 없음 — 숫자 0과 빈 도트로 상태 표현.

---

## 10. 구현 순서 (추천)

```
1. 백엔드: HomeController + /api/home/summary 엔드포인트
2. 프론트 타입: HomeSummaryResponse 타입 정의 + homeApi.ts
3. uiStore: Tab 'chat' → 'home', homeView 상태 추가
4. BottomNav: 현상소 탭 'home' 탭으로 변경
5. HomePage: homeView 분기 (bento / chat)
6. HomeBentoPage: 컴포넌트 구현
   6a. HomeHeader
   6b. StreakCell
   6c. TodayCell
   6d. MonthCell
   6e. MoodFlowCell
   6f. PrevRecordList + PrevRecordCard
7. 로딩 스켈레톤
8. FrameOverlay 연결 (PrevRecordCard 클릭)
```

---

## 11. 최종 체크리스트 (수정판)

```
[ ] GET /api/home/summary 신규 엔드포인트 구현
[ ] MoodType을 한국어 문자열 그대로 사용 (영문 변환 없음)
[ ] getMoodBarColor() 로 색상 처리
[ ] BentoGrid: display:grid / grid-template-columns: 1fr 1fr
[ ] StreakCell: grid-row: span 2
[ ] MoodFlowCell: grid-column: span 2
[ ] 바 높이: 기록O=16px / 기록X=6px (intensity 없음)
[ ] 오늘 기록 없을 때 TodayCell "—"
[ ] StreakCell 도트: 7개, 기록 없는 날 빈 회색 도트
[ ] [+] 버튼 → setQuickNoteOpen(true)
[ ] PrevRecordCard 클릭 → FrameOverlay 오픈
[ ] navigate('/develop') 대신 homeView 상태 전환
[ ] per-cell grain-overlay div 생략 (전역 grain으로 충분)
[ ] 로딩 중 스켈레톤 표시
[ ] 설계 토큰(tokens.css) 사용
```
