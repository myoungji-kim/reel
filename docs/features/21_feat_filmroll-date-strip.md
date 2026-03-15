# 필름롤 날짜 스트립 + 월 선택 바텀시트 — 시니어 기획/디자인 검토

> 원본 스펙: `reel-feat-filmroll-date-strip.md` (사용자 제공)
> 작성 기준: 2026-03-15
> 현재 코드베이스 분석 기반

---

## 1. 스펙 검토 요약

### 잘 설계된 부분 ✅

- ROLL/GRID 이중 탭 → 날짜 스트립 통합 — UX 단순화, 올바른 방향
- MonthPickerSheet로 연도/월 점프 — 오래된 기록 접근성 확보
- `position: fixed` 금지 명시 — 440px 컨테이너 레이아웃 보호 의식
- 미래 날짜/달 비활성 처리 — 엣지케이스 고려

### 수정이 필요한 부분 ⚠️

아래 5개 항목은 현재 코드베이스와 충돌하거나 구현 방향 조정이 필요함.

---

## 2. 충돌 지점 및 해결 방향

### 2-1. DateStrip 데이터 소스 — 신규 API 불필요

**스펙 언급**
```typescript
// GET /api/records?month=2026-03 → 해당 월 기록 목록 (기존 API 재사용)
```

**현실**
`GET /api/frames/calendar?year&month` 가 이미 존재하고,
`CalendarFrame[]` 타입으로 날짜 + mood + frameType + 썸네일까지 반환함.
DateStrip의 감정 도트 표시에 필요한 데이터가 모두 포함됨.

**해결: `getCalendarFrames(year, month)` 직접 재사용**

```typescript
// 이미 존재하는 API
const { data: calendarFrames = [] } = useQuery({
  queryKey: ['calendarFrames', currentMonth.year, currentMonth.month],
  queryFn: () => getCalendarFrames(currentMonth.year, currentMonth.month),
  staleTime: 1000 * 60,
})

// CalendarFrame { frameId, date, mood, title, contentPreview, thumbnailUrl, frameType }
// DateStrip 도트: getMoodBarColor(frame.mood)
// SelectedPreviewCard: CalendarFrame 그대로 사용
```

---

### 2-2. `recordsByMonth` & `availableYears` — 신규 API 없이 처리

**스펙의 신규 API**
```typescript
// GET /api/filmroll/summary
interface FilmRollSummary {
  recordsByMonth: { [key: string]: { hasRecord: boolean; frameCount: number } }
  availableYears: number[]
}
```

**문제**
`/api/filmroll/summary`가 없고, 바텀시트에서만 필요한 데이터임.

**현실**
RollPage는 이미 `getFrames(0, 200)` 으로 전체 프레임을 로드하고 `frameStore`에 저장함.
frames 배열에서 클라이언트 집계로 충분히 처리 가능.

**해결: frameStore.frames 기반 클라이언트 집계**

```typescript
// 기록 있는 연도 목록
const availableYears = useMemo(() =>
  [...new Set(frames.map(f => new Date(f.date).getFullYear()))].sort(),
  [frames]
)

// 기록 있는 월 목록 (Set으로 빠른 조회)
const recordMonthSet = useMemo(() =>
  new Set(frames.map(f => f.date.slice(0, 7))),  // "2026-03"
  [frames]
)
```

신규 백엔드 API 없이 바텀시트 구현 가능.
단, frames가 200개 이상인 사용자는 누락 발생 → 추후 전체 로드로 교체 검토.
**현재 단계에서는 클라이언트 집계로 진행.**

---

### 2-3. 바텀시트 `position: absolute` 금지 → `OverlaySheet` 재사용

**스펙**
```
바텀시트는 position: absolute 로 페이지 내부에 구현
(position: fixed 사용 금지 — 레이아웃 깨짐)
```

**현실**
기존 `OverlaySheet.tsx` 컴포넌트가 `position: fixed`를 사용하지만,
`maxWidth: 440`으로 컨테이너를 제한하고 있어 레이아웃 깨짐 없음.
모든 기존 바텀시트(QuickNoteSheet, ArchivedSheet, RollTitleSheet)가 이 방식으로 동작 중.

`position: absolute`는 부모에 `overflow: hidden`이 있으면 잘려서 더 위험함.

**해결: `OverlaySheet` 재사용 (position: fixed 유지)**

```typescript
// MonthPickerSheet는 OverlaySheet를 래핑
<OverlaySheet isOpen={sheetOpen} onBackdropClick={() => setSheetOpen(false)}>
  {/* 연도 칩 + 월 그리드 */}
</OverlaySheet>
```

스펙의 "fixed 금지" 의도는 넓은 화면에서 레이아웃 탈출을 막으려는 것이며,
`maxWidth: 440` 제한이 적용된 OverlaySheet는 이 의도를 만족함.

---

### 2-4. 월간 회고 기능 보존

**문제**
기존 CalendarView 내부에 **월간 회고 생성 UI**가 있었음.
GRID 탭 제거 시 회고 생성 진입점이 사라짐.

**현재 회고 관련 코드**
- `CalendarView.tsx`: `checkRetrospectiveAvailable()` + `createRetrospective()` 호출
- `RetrospectiveBanner.tsx`: 별도 컴포넌트로 분리되어 있음

**해결: RetrospectiveBanner를 DateStrip 아래에 배치 유지**

```
DateStripSection
  └── StripHeader (MonthTabButton + RollIndicator)
  └── DateStrip
RetrospectiveBanner     ← 이 위치에 유지 (기존 동작 보존)
FilmCardList
```

CalendarView는 RollPage에서 import만 제거하고 파일은 삭제하지 않음.

---

### 2-5. 검색 + 빠른현상 버튼 이관

**문제**
기존 `filterBar`에 있던 검색 아이콘, "✦ 빠른 현상" 버튼이
filterBar 제거 시 사라짐.

**해결: StripHeader 우측에 통합**

```
StripHeader
├── 좌: MonthTabButton ("MARCH 2026 ▾")
└── 우: [검색 아이콘] [빠른 현상 버튼] + RollIndicator
```

StripHeader 우측에 기존 버튼들을 그대로 이관.
검색 활성 시 DateStrip 영역 위에 인라인 검색창 슬라이드 인.

---

## 3. 확정된 컴포넌트 구조

```
RollPage
├── RollProgressBar (제거 — StripHeader의 RollIndicator로 대체)
├── DateStripSection
│   ├── StripHeader
│   │   ├── MonthTabButton    "MARCH 2026 ▾" → OverlaySheet 오픈
│   │   └── HeaderActions     검색 아이콘 + 빠른 현상 버튼 + ROLL 02 — 8/24
│   └── DateStrip             가로 스크롤, CalendarFrame[] 기반
│       └── DateItem × N      감정 도트, 오늘 강조, 미래 비활성
├── [검색창]                  isSearchOpen === true 일 때만 표시
├── RetrospectiveBanner       기존 그대로 유지
├── [SelectedPreviewCard]     selectedDate && record 있을 때만 표시
└── FilmCardList              기존 필름 카드 리스트 (수정 없이 재사용)
    ├── MonthDivider × N
    ├── FilmFrame × N         isHighlighted prop 추가
    └── RollDivider × N
```

**제거 대상**
- `viewMode` 상태 (`'roll' | 'calendar'`)
- `CalendarView` import + 렌더링
- filterBar (ROLL/GRID 탭 버튼)
- `RollProgressBar` 독립 렌더링 (StripHeader 내부로 이동)

---

## 4. FilmFrame — `isHighlighted` prop 추가

스펙에서 선택 날짜 카드에 골드 아웃라인을 요구.
`FilmFrame` 컴포넌트에 `isHighlighted?: boolean` prop 하나만 추가.

```typescript
// FilmFrame.tsx 수정 최소화
interface Props {
  frame: Frame
  onClick: () => void
  skeleton?: boolean
  isHighlighted?: boolean   // ← 추가
}

// 스타일: isHighlighted 시 outline 적용
outline: isHighlighted ? '2px solid var(--gold)' : 'none',
outlineOffset: -1,
```

---

## 5. DateStrip 스크롤 초기화 전략

오늘 날짜가 중앙에 오도록 초기 스크롤 구현.
`scrollIntoView`는 부모 overflow 충돌 위험 → `scrollLeft` 직접 계산.

```typescript
useEffect(() => {
  if (!stripRef.current) return
  const today = new Date().getDate()
  const itemWidth = 44  // DateItem 너비 + gap 예상
  const containerWidth = stripRef.current.clientWidth
  const offset = (today - 1) * itemWidth - containerWidth / 2 + itemWidth / 2
  stripRef.current.scrollLeft = Math.max(0, offset)
}, [currentMonth])
```

월 변경 시에도 해당 월의 1일 기준으로 리셋.

---

## 6. SelectedPreviewCard 스펙

CalendarView의 기존 프리뷰 카드 패턴 재사용.
`CalendarFrame` 타입 그대로 활용.

```typescript
interface SelectedPreviewCardProps {
  cf: CalendarFrame
  onOpen: () => void    // FrameOverlay 열기
  onClose: () => void   // 선택 해제
}
```

```
┌─────────────────────────────────────────┐
│  FR.07  2026.03.12 — THU      [×] 닫기 │
│  제목 텍스트                             │
│  내용 미리보기...                        │
└─────────────────────────────────────────┘
```

배경: `var(--gold-pale)`, border: `1px solid var(--gold)`,
margin: `8px 16px`, borderRadius: 10px.

클릭 시 `getFrame(cf.frameId)`로 전체 데이터 로드 후 FrameOverlay 오픈.

---

## 7. MoodType 처리

스펙의 DateItem에서 사용된 MOOD_COLOR는 영문 키 기반:
```javascript
const MOOD_COLOR = { joy: '#c8a96e', warm: '#c4866a', ... }
```

실제 DB는 한국어 저장. `getMoodBarColor(mood)` 함수 그대로 사용.

```typescript
// DateItem 도트
background: record ? getMoodBarColor(record.mood) : 'transparent'
```

---

## 8. 구현 순서 (추천)

```
1. RollPage 정리
   1a. viewMode 상태 + CalendarView import + filterBar 제거
   1b. RollProgressBar 독립 렌더링 제거 (StripHeader로 이동 예정)
   1c. FilmFrame에 isHighlighted prop 추가

2. DateItem 컴포넌트 구현
   - day, isSelected, record, onClick props
   - 오늘/미래/주말 스타일 분기
   - getMoodBarColor() 도트

3. DateStrip 컴포넌트 구현
   - 가로 스크롤, ref 기반 초기 스크롤
   - CalendarFrame[] → DateItem 렌더

4. StripHeader 구현
   - MonthTabButton (월 텍스트 + ▾)
   - RollIndicator (ROLL 번호 + 진행도)
   - HeaderActions (검색 아이콘 + 빠른 현상)

5. DateStripSection 조합
   - currentMonth 상태, 스트립 + 헤더 연결
   - 검색 활성 시 검색창 표시

6. MonthPickerSheet 구현
   - OverlaySheet 재사용
   - 연도 칩 + 4열 월 그리드
   - recordMonthSet으로 도트 표시
   - 미래 달 비활성

7. SelectedPreviewCard 구현
   - CalendarFrame 기반
   - 클릭 → getFrame() → FrameOverlay 오픈

8. RollPage 최종 조립
   - selectedDate 상태 + handleDateSelect
   - 날짜 선택 시 해당 카드 scrollIntoView
   - FilmFrame isHighlighted 연결
```

---

## 9. 최종 체크리스트 (수정판)

```
[ ] 기존 ROLL/GRID SubTabs 제거
[ ] CalendarView import 제거 (파일 삭제 X)
[ ] RollProgressBar → StripHeader의 RollIndicator로 통합
[ ] DateStrip: getCalendarFrames() 재사용 (신규 API 없음)
[ ] DateStrip: 오늘 날짜 중앙 스크롤 초기화
[ ] DateItem: getMoodBarColor()로 감정 도트
[ ] DateItem: 미래 날짜 탭 불가
[ ] MonthPickerSheet: OverlaySheet 재사용 (position: fixed 유지)
[ ] MonthPickerSheet: frameStore.frames 기반 recordMonthSet 집계
[ ] MonthPickerSheet: frameStore.frames 기반 availableYears 집계
[ ] MonthPickerSheet: 미래 달 비활성
[ ] FilmFrame: isHighlighted prop 추가 (골드 아웃라인)
[ ] SelectedPreviewCard: gold-pale 배경, CalendarFrame 기반
[ ] SelectedPreviewCard 클릭 → getFrame() → FrameOverlay
[ ] 검색 기능: StripHeader에 이관
[ ] 빠른 현상 버튼: StripHeader에 이관
[ ] RetrospectiveBanner: DateStrip 아래 유지
[ ] 같은 날짜 재탭 시 selectedDate null 처리
[ ] 월 변경 시 selectedDate 초기화
```

---

## 10. 변경 없이 재사용되는 컴포넌트

| 컴포넌트 | 재사용 방식 |
|---|---|
| `FilmFrame` | `isHighlighted` prop만 추가 |
| `MonthDivider` | 변경 없음 |
| `RollDivider` | 변경 없음 |
| `FrameOverlay` | 변경 없음 |
| `OverlaySheet` | MonthPickerSheet에서 래핑 |
| `RetrospectiveBanner` | 위치만 변경 (DateStrip 아래) |
| `getMoodBarColor()` | DateItem 도트에 직접 사용 |
| `getCalendarFrames()` | DateStrip 데이터 소스 |
