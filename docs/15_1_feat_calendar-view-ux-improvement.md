# 캘린더 뷰 UX 개선 (Calendar View UX Improvement)

## 사전 준비
- `docs/00_context_project-overview.md` 읽기
- `docs/15_feat_calendar-view.md` 읽기 (선행 구현 완료 상태)
- 관련 파일:
  - `frontend/src/pages/RollPage.tsx`
  - `frontend/src/components/frame/CalendarView.tsx`
  - `frontend/src/components/frame/FilmFrame.tsx`
  - `frontend/src/components/frame/FrameOverlay.tsx`
  - `frontend/src/components/frame/RollProgressBar.tsx`
  - `frontend/src/api/frameApi.ts`
  - `frontend/src/types/frame.ts`

## 개선 개요
`15_feat_calendar-view.md` 기준으로 캘린더 뷰가 구현된 상태에서, UX 검토를 통해 발견된 7가지 문제를 개선한다.
백엔드 변경은 없다. 모든 수정은 프론트엔드 전용이다.

---

## 개선 1. 하단 빈 공간 → 선택 날짜 프리뷰 카드

### 문제
캘린더 그리드가 화면 상단 절반만 차지하고 나머지가 완전히 비어있다.
날짜를 탭하면 곧장 FrameOverlay(바텀시트)가 올라오기 때문에 사용자는
"어떤 날 어떤 기록인지"를 미리 확인할 방법이 없다.

### UX 의도
탐색은 2단계가 자연스럽다. 날짜 탭 → 프리뷰 확인 → 프리뷰 탭 → 상세 열기.
캘린더 하단 빈 공간이 프리뷰 영역으로 채워지면 화면 낭비가 사라지고
"이 날 뭘 썼더라"를 빠르게 훑을 수 있다.

### 구현 요청

#### `CalendarView.tsx` 수정

1. **내부 상태 추가**
   ```ts
   const [selectedDate, setSelectedDate] = useState<string | null>(null)
   ```
   - 초기값 `null` (선택 없음)
   - 월이 변경되면 `null`로 리셋

2. **날짜 클릭 동작 변경**
   - 기존: `onFrameSelect(cf.frameId)` 직접 호출
   - 변경: `setSelectedDate(dateStr)` 로 선택 상태만 저장
   - 기록이 없는 날짜 탭 시: `setSelectedDate(null)`

3. **선택된 날짜 셀 강조**
   - `selectedDate === dateStr` 인 셀에 배경 원 추가:
   ```ts
   // 셀 내부 span 스타일에 조건부 추가
   background: selectedDate === dateStr ? 'rgba(212,130,42,0.18)' : 'transparent',
   borderRadius: '50%',
   width: 26,
   height: 26,
   display: 'flex',
   alignItems: 'center',
   justifyContent: 'center',
   ```
   - 선택+기록있는 날: amber 배경 원 + amber 텍스트
   - 선택+기록없는 날: 선택 처리 자체를 막음 (클릭 무반응)

4. **프리뷰 영역 추가** — 그리드 아래에 조건부 렌더링
   ```tsx
   {selectedDate && (() => {
     const cf = frameByDate.get(selectedDate)
     if (!cf) return null
     // previewFrame은 props로 받아온 frames 배열에서 찾거나
     // cf.frameId를 onPreviewRequest로 전달
     return (
       <div style={styles.preview} onClick={() => onFrameSelect(cf.frameId)}>
         <div style={styles.previewDate}>
           {selectedDate.replace(/-/g, '.')}
         </div>
         <div style={styles.previewTitle}>{cf.title}</div>
         <div style={styles.previewContent}>{cf.content}</div>
         <span style={styles.previewArrow}>→ 자세히 보기</span>
       </div>
     )
   })()}
   ```

5. **`CalendarFrame` 타입 확장** (`types/frame.ts`)
   ```ts
   export interface CalendarFrame {
     frameId: number
     date: string
     mood: string | null
     title: string      // 추가
     content: string    // 추가 (프리뷰용, 앞 50자)
   }
   ```

6. **백엔드 `CalendarFrameResponse` 확장** (`CalendarFrameResponse.java`)
   ```java
   public record CalendarFrameResponse(
       Long frameId,
       LocalDate date,
       String mood,
       String title,
       String contentPreview   // content 앞 50자만
   ) {}
   ```
   - `FrameService.getCalendarFrames()` 에서 매핑 시:
     ```java
     String preview = f.getContent().length() > 50
         ? f.getContent().substring(0, 50) + "..."
         : f.getContent();
     new CalendarFrameResponse(f.getId(), f.getDate(), f.getMood(), f.getTitle(), preview)
     ```

7. **프리뷰 스타일 규칙**
   - 배경: `var(--bg-card)`, 테두리: `1px solid var(--border)`
   - 상단 구분선 대신 margin-top 16px + 점선 border-top
   - 날짜: `Space Mono` 10px, `var(--amber-light)`, opacity 0.7
   - 제목: `Noto Serif KR` 15px, `var(--cream)`
   - 내용: `Noto Serif KR` 12px, `var(--cream-muted)`, 2줄 clamp
   - "→ 자세히 보기": `Space Mono` 10px, `var(--cream-muted)`, opacity 0.5, 우측 정렬
   - 탭 피드백: `scale(0.98)` 0.15s

---

## 개선 2. 오늘 날짜 원형 배경 강조

### 문제
오늘 날짜는 텍스트 색상만 amber로 변경되는데, 앱 전반에 amber 계열이 많아
어느 날이 오늘인지 빠르게 찾기 어렵다. 캘린더 앱의 관례인 원형 강조가 없다.

### 구현 요청

#### `CalendarView.tsx` — 오늘 날짜 셀 스타일 변경

날짜 숫자 `<span>` 대신 래퍼 `<div>`를 사용해 원형 배경을 적용한다.

```tsx
// 날짜 숫자 렌더링 부분 교체
<div
  style={{
    width: 26,
    height: 26,
    borderRadius: '50%',
    background: isToday ? 'var(--amber)' : 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  }}
>
  <span
    style={{
      ...styles.dayNum,
      color: isToday
        ? 'var(--bg)'              // 오늘: 어두운 배경색 (역전)
        : hasRecord
          ? 'var(--cream)'
          : 'var(--cream-muted)',
      opacity: !hasRecord && !isToday ? 0.4 : 1,
      fontWeight: isToday ? 700 : 400,
    }}
  >
    {day}
  </span>
</div>
```

- 오늘이면서 기록도 있는 날: amber 원 배경 유지, dot은 아래에 그대로 표시
- 오늘이면서 선택된 날: amber 원이 이미 강하므로 선택 오버레이 생략

---

## 개선 3. filterBar 레이아웃 점프 + 캘린더 컨텍스트 표시

### 문제
롤 뷰 → 캘린더 전환 시, ALL·★·검색·빠른현상 버튼이 모두 사라지며
filterBar 좌측이 완전히 비어 레이아웃이 어색하게 흔들린다.
캘린더 뷰에서 "어느 달을 보고 있는지"도 filterBar에서 파악이 안 된다.

### 구현 요청

#### `RollPage.tsx` — filterBar 캘린더 뷰 분기 수정

캘린더 뷰 활성 시, filterBar 좌측에 현재 월 레이블을 표시한다.
`CalendarView`의 현재 year/month 상태를 `RollPage`로 올려서 공유한다.

1. **상태 lift-up** — `CalendarView` 내부의 `year`, `month` state를 `RollPage`로 이동
   ```ts
   // RollPage에 추가
   const today = new Date()
   const [calYear, setCalYear] = useState(today.getFullYear())
   const [calMonth, setCalMonth] = useState(today.getMonth() + 1)
   ```
   - `CalendarView`에 props로 전달:
     ```tsx
     <CalendarView
       year={calYear}
       month={calMonth}
       onYearMonthChange={(y, m) => { setCalYear(y); setCalMonth(m) }}
       onFrameSelect={...}
     />
     ```

2. **`CalendarView` props 변경**
   ```ts
   interface CalendarViewProps {
     year: number
     month: number
     onYearMonthChange: (year: number, month: number) => void
     onFrameSelect: (frameId: number) => void
   }
   ```
   - 내부에서 `handlePrevMonth` / `handleNextMonth` 호출 시 `onYearMonthChange` 호출로 교체

3. **filterBar 캘린더 뷰 좌측 콘텐츠 추가**
   ```tsx
   {viewMode === 'roll' ? (
     // 기존 ALL / ★ 탭
   ) : (
     <div style={styles.calendarLabel}>
       {MONTH_NAMES[calMonth - 1]} {calYear}
     </div>
   )}
   ```
   - `calendarLabel` 스타일:
     - 폰트: `Bebas Neue`, 16px, `var(--cream-dim)`, letterSpacing 0.1em
     - padding: `8px 12px`
     - 캘린더 뷰의 월 헤더와 동일한 텍스트 — 한눈에 컨텍스트 파악 가능

4. **캘린더 뷰 내부 월 헤더 숨기기**
   - filterBar에 이미 월이 표시되므로 `CalendarView` 내부의 `◀ MONTH YEAR ▶` 헤더는 제거
   - `◀ ▶` 월 이동 버튼은 filterBar 우측 `▦` 버튼 왼쪽으로 이동
   ```
   캘린더 뷰 filterBar:
   [ MARCH 2026 ]─────────────[ ◀  ▶  ▦ ]
   ```
   - `◀ ▶` 스타일: `Space Mono` 10px, `var(--cream-muted)`, opacity 0.6

---

## 개선 4. 월간 기록 통계 한 줄 표시

### 문제
캘린더를 보면서 "이번 달 며칠이나 기록했나"를 즉시 알 수 없다.
dot 개수를 직접 세야 하는 불편함이 있다.

### 구현 요청

#### `CalendarView.tsx` — 통계 표시 추가

`calendarFrames.length`를 활용해 그리드 위에 통계 한 줄을 추가한다.
(개선 3에서 filterBar로 월 헤더를 올렸으므로, 이 통계는 그리드 바로 위에 위치)

```tsx
// 그리드 위, 요일 헤더 위에 삽입
<div style={styles.statsRow}>
  <span style={styles.statsText}>
    {calendarFrames.length > 0
      ? `${calendarFrames.length}일 기록`
      : '기록 없음'}
  </span>
</div>
```

- `statsRow` 스타일:
  - `textAlign: 'right'`, padding: `0 4px 8px`
- `statsText` 스타일:
  - 폰트: `Space Mono` 9px, `var(--cream-muted)`, opacity 0.5, letterSpacing 0.08em

> **참고**: 이 통계는 클라이언트에서 `calendarFrames.length`만으로 계산 가능. API 추가 불필요.

---

## 개선 5. 선택 날짜 시각적 피드백

### 문제
기록 있는 날짜를 탭해도 어떤 날짜가 선택됐는지 시각적 반응이 없었다.
(개선 1에서 선택 상태 강조를 구현하므로 이 항목은 개선 1과 통합 구현)

### 구현 요청

개선 1의 **선택된 날짜 셀 강조** 항목에서 이미 처리된다.
추가로 아래만 반영:

- **탭 즉시 반응** (press 피드백): 날짜 셀 전체에 `active` 스타일 적용
  ```ts
  // 셀 div에 onMouseDown / onTouchStart 추가
  onMouseDown: () => { /* scale(0.9) 순간 적용 */ }
  onMouseUp: () => { /* 원복 */ }
  ```
  - scale 범위: `0.90` (날짜 셀이 작으므로 강하게)
  - duration: `0.1s`

---

## 개선 6. 월 이동 시 로딩 상태

### 문제
`◀ ▶`로 월을 이동하면 API 응답 전까지 이전 달 dot들이 잠깐 잔류하거나
갑자기 사라진다. 사용자가 로딩 중인지 데이터 없는 달인지 구분할 수 없다.

### 구현 요청

#### `CalendarView.tsx` — `isFetching` 상태 활용

```ts
const { data: calendarFrames = [], isFetching } = useQuery({
  queryKey: ['calendarFrames', year, month],
  queryFn: () => getCalendarFrames(year, month),
  staleTime: 1000 * 60,
})
```

- 그리드 전체에 조건부 opacity 적용:
  ```tsx
  <div style={{ ...styles.grid, opacity: isFetching ? 0.35 : 1, transition: 'opacity 0.2s' }}>
  ```
- 월 이동 버튼(`◀ ▶`)도 `isFetching` 중에는 `pointerEvents: 'none'` 처리 (중복 클릭 방지)
- 별도 스피너 없이 opacity 감소만으로 충분 — 달력 구조는 유지되어 레이아웃 안정

---

## 개선 7. 기록 없는 달 빈 상태 처리

### 문제
해당 월에 프레임이 하나도 없어도 빈 달력만 보인다.
"기록이 없는 달"인지, "데이터를 못 불러온 것"인지 알 수 없다.

### 구현 요청

#### `CalendarView.tsx` — 빈 상태 렌더링 추가

```tsx
// 그리드 아래, 프리뷰 영역 위에 조건부 삽입
{!isFetching && calendarFrames.length === 0 && (
  <div style={styles.emptyState}>
    <p style={styles.emptyCode}>// NO RECORDS</p>
    <p style={styles.emptySub}>이 달에는 기록이 없어요</p>
  </div>
)}
```

- `emptyState` 스타일:
  - `textAlign: 'center'`, paddingTop: 24, paddingBottom: 8
- `emptyCode` 스타일:
  - 폰트: `Space Mono` 11px, `var(--amber)`, opacity 0.45, letterSpacing 0.1em
- `emptySub` 스타일:
  - 폰트: `Noto Sans KR` 12px, `var(--cream-muted)`, fontWeight 300, marginTop 4

> `isFetching` 중에는 빈 상태를 렌더링하지 않아야 한다 (로딩 중에 "기록 없음"이 먼저 보이는 것 방지).

---

## 최종 CalendarView 레이아웃 구조

```
RollPage filterBar:
┌──────────────────────────────────────────┐
│ [ MARCH 2026 ]──────────────[ ◀  ▶  ▦ ] │
└──────────────────────────────────────────┘

RollProgressBar (기존 유지)

CalendarView:
┌──────────────────────────────────────────┐
│                          8일 기록         │ ← 개선 4
│ SUN  MON  TUE  WED  THU  FRI  SAT        │
│  1    2    3    4    5    6    7          │
│  8    9 ·  10   11   12   13   14        │
│  ...                                     │
│       ①26  27   28   29   30   31        │ ← ①=오늘(amber 원)
│                                          │
│ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │ ← 선택 시만 표시
│ 2026.03.09                               │ ← 개선 1 프리뷰
│ 봄비가 왔다                              │
│ 오후에 창밖을 보다가...                  │
│                        → 자세히 보기     │
└──────────────────────────────────────────┘
```

---

## 구현 우선순위 및 작업 순서

1. **개선 3** (filterBar lift-up + 월 헤더 이동) — 구조 변경이므로 가장 먼저 처리
2. **개선 2** (오늘 날짜 원형 강조) — 독립 변경, 간단
3. **개선 1** (프리뷰 카드) — 타입 변경 + 백엔드 response 수정 포함
4. **개선 4** (통계 한 줄) — 개선 1 완료 후 단순 추가
5. **개선 5** (탭 피드백) — 개선 1에 통합
6. **개선 6** (로딩 상태) — isFetching 연결
7. **개선 7** (빈 상태) — 마지막 마무리

---

## 디자인 규칙
- 기존 디자인 토큰 외 색상 추가 금지
- filterBar 높이(`minHeight: 38`) 변경 금지
- 프리뷰 카드는 FilmFrame 컴포넌트를 재사용하지 않음 (달력 레이아웃 전용 경량 카드)
- 기존 FrameOverlay 진입 방식 유지 (프리뷰 탭 → onFrameSelect 호출)

## 검증
- [ ] 기록 있는 날짜 탭 → 셀에 선택 강조 표시 + 아래 프리뷰 카드 슬라이드인
- [ ] 기록 없는 날짜 탭 → 프리뷰 없음, 셀 강조 없음
- [ ] 프리뷰 카드 탭 → FrameOverlay 오픈
- [ ] 오늘 날짜에 amber 원형 배경 표시
- [ ] 기록 있는 날이면서 오늘인 경우 → amber 원 + dot 모두 표시
- [ ] filterBar: 롤 뷰는 기존과 동일, 캘린더 뷰는 `MONTH YEAR + ◀ ▶ + ▦`
- [ ] ◀ ▶ 월 이동이 filterBar에서 동작 확인
- [ ] CalendarView 내부에 월 이동 헤더가 제거됐는지 확인
- [ ] 통계 `N일 기록` 텍스트가 `calendarFrames.length`와 일치 확인
- [ ] 월 이동 시 로딩 중 그리드 opacity 감소 + 이동 버튼 비활성화 확인
- [ ] 기록 없는 달: `// NO RECORDS` 메시지 표시, `isFetching` 중에는 미표시 확인
- [ ] 월 변경 시 선택 상태(`selectedDate`) 리셋 확인
- [ ] CalendarFrame API 응답에 `title`, `contentPreview` 포함 확인

## 커밋 메시지
```
ux: improve calendar view with preview card, today highlight, and contextual filterbar
```
