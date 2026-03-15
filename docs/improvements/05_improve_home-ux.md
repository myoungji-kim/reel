# 현상소 홈 UX 개선 스펙
> 기존 벤토 그리드 구조는 유지하면서 가독성·직관성 개선
> `04_3_home-bento.md` 에서 변경되는 부분만 기술
> `04_ux_design-system-v2.md` 색상/폰트 기준 적용

---

## 0. 개선 목표

| 문제 | 개선 |
|---|---|
| 레이블이 작고 약해서 셀 의미 파악 어려움 | 한글 보조 텍스트 추가, 레이블 위계 강화 |
| 오늘 감정 셀에 "오늘"이라는 맥락 없음 | 감정이 먼저, 날짜는 보조로 위계 변경 |
| MOOD FLOW가 뭔지 모름 (축·기간 없음) | 기간·요일 축·감정 범례 추가 |
| 최근 기록 카드가 단조로움 | 감정 컬러바 + 감정 텍스트 추가 |
| 헤더에 로고 중복 | 월/날짜 정보 헤더로 교체 |
| 우상단 ⚙ 아이콘 | 제거 (나 페이지로 통합) |

---

## 1. 헤더 변경

```jsx
// 변경 전: 로고 "reel" 반복 + ⚙ 아이콘
// 변경 후: 월/제목/날짜 정보 + [+] 버튼

function HomeHeader({ month, date, dayOfWeek, onPlusClick }) {
  return (
    <div className="home-header">
      <div>
        <div className="home-month">{month}</div>
        {/* 예: "MARCH 2026" */}
        <div className="home-title">오늘의 일기</div>
        <div className="home-sub">{dayOfWeek}, {date}</div>
        {/* 예: "Sunday, 15" */}
      </div>
      <button className="home-plus-btn" onClick={onPlusClick}>
        {/* + 아이콘 — navigate('/develop') */}
      </button>
    </div>
  )
}
```

```css
/* 헤더 추가/수정 CSS */
.home-month {
  font-family: 'DM Mono', monospace;
  font-size: 9px;
  color: #9a9080;
  letter-spacing: 0.12em;
  margin-bottom: 3px;
}
.home-title {
  font-family: 'Noto Serif KR', serif;
  font-size: 22px;
  font-weight: 600;
  color: #2a2620;
  line-height: 1.1;
}
.home-sub {
  font-size: 9px;
  color: #9a9080;
  margin-top: 2px;
  font-weight: 300;
}
```

**변경 포인트:**
- 로고 `"reel"` 중복 제거
- 우상단 ⚙ 아이콘 제거
- `"MARCH 2026 / 오늘의 일기 / Sunday, 15"` 형태로 교체

---

## 2. 벤토 셀 개선

### 2-1. STREAK 셀 (dark · tall)

```jsx
// 변경 전: STREAK 영문 레이블 + 숫자만
// 변경 후: 한글 레이블 + 보조 문구 + 기간 축 텍스트

function StreakCell({ count, recentDays }) {
  return (
    <div className="bento-cell tall dark">
      <div className="grain-overlay" />

      {/* 변경: 한글 컨텍스트 레이블 */}
      <div className="cell-ctx">연속 기록</div>

      <div className="bento-value">{count}일</div>

      {/* 변경: 한글 보조 텍스트 */}
      <div className="cell-sub-kr">
        {count > 0 ? '오늘도 기록했어요' : '오늘 기록을 시작해요'}
      </div>

      {/* 감정 도트 */}
      <div className="streak-dots">
        {recentDays.map((mood, i) => (
          <div key={i} className={`s-dot ${mood ?? ''}`} />
        ))}
      </div>

      {/* 변경: 도트 기간 설명 */}
      <div className="cell-period">최근 7일</div>
    </div>
  )
}
```

```css
/* STREAK 셀 추가 CSS */
.cell-ctx {
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 9px;
  font-weight: 500;
  color: #9a9080;
  margin-bottom: 5px;
}
.cell-sub-kr {
  font-size: 9px;
  color: rgba(240, 238, 233, 0.45);
  margin-top: 4px;
  font-weight: 300;
  line-height: 1.4;
}
.cell-period {
  font-family: 'DM Mono', monospace;
  font-size: 7px;
  color: rgba(240, 238, 233, 0.3);
  margin-top: 6px;
  letter-spacing: 0.06em;
}
/* dark 셀 기준 — 라이트 셀은 색상만 조정 */
```

### 2-2. TODAY 셀 (gold) — 위계 변경

```jsx
// 변경 전: 날짜(MAR 15) → 요일 → 감정 순서
// 변경 후: 컨텍스트 → 감정(크게) → 날짜(보조) 순서

const MOOD_COLOR = {
  joy: '#c8a96e', warm: '#c4866a', tired: '#9a9a8e',
  sad: '#7a8fa6', calm: '#8aaa8a'
}
const MOOD_LABEL = {
  joy: '설렘', warm: '감사', tired: '피곤', sad: '슬픔', calm: '평온'
}

function TodayCell({ mood, hasRecord, date, dayOfWeek }) {
  return (
    <div className="bento-cell gold">
      <div className="grain-overlay" />

      {/* 변경: 감정 컬러 도트 + 컨텍스트 레이블 */}
      <div className="cell-ctx today-ctx">
        <span
          className="ctx-dot"
          style={{ background: mood ? MOOD_COLOR[mood] : '#c8c0b4' }}
        />
        오늘 감정
      </div>

      {/* 변경: 감정이 가장 크게 — 숫자 아님 */}
      <div className="today-mood-val">
        {hasRecord && mood ? MOOD_LABEL[mood] : '—'}
      </div>

      {/* 변경: 날짜는 보조 */}
      <div className="today-date-sub">{date}</div>

      <div className="today-status">
        {hasRecord ? '기록 완료' : '아직 기록 전'}
      </div>
    </div>
  )
}
```

```css
/* TODAY 셀 추가 CSS */
.today-ctx {
  color: #c8a96e;
  display: flex;
  align-items: center;
  gap: 4px;
}
.ctx-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}
.today-mood-val {
  font-family: 'Noto Serif KR', serif;
  font-size: 18px;
  font-weight: 600;
  color: #7a5c20;
  line-height: 1;
  margin-bottom: 3px;
}
.today-date-sub {
  font-family: 'DM Mono', monospace;
  font-size: 9px;
  color: #c8a96e;
  letter-spacing: 0.06em;
  margin-bottom: 2px;
}
.today-status {
  font-size: 8px;
  color: #9a8060;
  font-weight: 300;
}
```

**변경 포인트:**
- 날짜 → 감정 → 날짜(보조) 위계로 변경
- 감정 컬러 도트 추가
- `"기록 완료 / 아직 기록 전"` 상태 텍스트 추가
- 기록 없을 때 `"—"` + `"아직 기록 전"` 표시

### 2-3. THIS MONTH 셀 — 한글 보조 추가

```jsx
// 변경 전: "THIS MONTH" 영문 레이블 + 숫자만
// 변경 후: "이번 달 기록" 한글 레이블 + "프레임" + 월 표기

function MonthCell({ frameCount, month }) {
  return (
    <div className="bento-cell">
      <div className="grain-overlay" />

      {/* 변경: 한글 레이블 */}
      <div className="cell-ctx">이번 달 기록</div>

      <div className="bento-value">{frameCount}</div>

      <div className="cell-sub-kr">
        프레임
        <div style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: '7.5px',
          color: '#c8c0b4',
          marginTop: '2px'
        }}>
          {month}  {/* "MAR 2026" */}
        </div>
      </div>
    </div>
  )
}
```

---

## 3. 감정 흐름 (MOOD FLOW) 개선

```jsx
// 변경 전: "MOOD FLOW" 레이블 + 막대만
// 변경 후: 한글 제목 + "최근 7일" + 요일 축 + 감정 범례

const MOOD_COLOR = {
  joy: '#c8a96e', warm: '#c4866a', tired: '#9a9a8e',
  sad: '#7a8fa6', calm: '#8aaa8a'
}
const MOOD_LEGEND = [
  { mood: 'joy',   label: '설렘' },
  { mood: 'warm',  label: '감사' },
  { mood: 'tired', label: '피곤' },
  { mood: 'sad',   label: '슬픔' },
  { mood: 'calm',  label: '평온' },
]
const DOW_KR = ['일', '월', '화', '수', '목', '금', '토']

function MoodFlowCell({ days }) {
  // days: 오늘 포함 최근 7일, 오래된 순
  // [{ date, mood, intensity, dayOfWeek }]

  const getBarHeight = (mood, intensity) => {
    if (!mood) return 4
    return 6 + (intensity - 1) * 4  // 6~22px
  }

  return (
    <div className="bento-cell wide mood-flow-cell">
      <div className="grain-overlay" />

      {/* 변경: 헤더에 기간 표시 */}
      <div className="flow-header">
        <span className="flow-title">감정 흐름</span>
        <span className="flow-period">최근 7일</span>
      </div>

      {/* 막대 차트 */}
      <div className="mood-bars">
        {days.map((day, i) => (
          <div
            key={i}
            className={`mood-bar ${!day.mood ? 'empty' : ''}`}
            style={{
              height: `${getBarHeight(day.mood, day.intensity)}px`,
              background: day.mood ? MOOD_COLOR[day.mood] : undefined
            }}
          />
        ))}
      </div>

      {/* 변경: 요일 축 */}
      <div className="dow-axis">
        {days.map((day, i) => (
          <span
            key={i}
            className="dow-label"
            style={{
              color: day.dayOfWeek === 0 ? '#c4866a'
                   : day.dayOfWeek === 6 ? '#7a8fa6'
                   : '#b0a898'
            }}
          >
            {DOW_KR[day.dayOfWeek]}
          </span>
        ))}
      </div>

      {/* 변경: 감정 범례 */}
      <div className="mood-legend">
        {MOOD_LEGEND.map(({ mood, label }) => (
          <div key={mood} className="legend-item">
            <span className="legend-dot" style={{ background: MOOD_COLOR[mood] }} />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
```

```css
/* MOOD FLOW 셀 추가 CSS */
.mood-flow-cell {
  padding: 11px 12px;
}
.flow-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.flow-title {
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 10px;
  font-weight: 500;
  color: #5a5248;
}
.flow-period {
  font-family: 'DM Mono', monospace;
  font-size: 7.5px;
  color: #b0a898;
  letter-spacing: 0.05em;
}
.dow-axis {
  display: flex;
  gap: 4px;
  margin-top: 4px;
}
.dow-label {
  width: 10px;
  font-family: 'DM Mono', monospace;
  font-size: 7px;
  text-align: center;
}
.mood-legend {
  display: flex;
  gap: 7px;
  flex-wrap: wrap;
  margin-top: 8px;
  padding-top: 7px;
  border-top: 1px solid rgba(42, 38, 32, 0.08);
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 7px;
  color: #9a9080;
}
.legend-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  flex-shrink: 0;
}
```

**변경 포인트:**
- `"MOOD FLOW"` → `"감정 흐름"` (한글)
- 우측에 `"최근 7일"` 기간 표시 추가
- 막대 아래 요일 축(일~토) 추가
- 일요일 `#c4866a`, 토요일 `#7a8fa6` 색상 구분
- 하단에 감정 범례 5개 추가
- 기록 없는 날 막대 높이 4px 회색 최소 표시

---

## 4. 최근 기록 카드 개선

```jsx
// 변경 전: 제목 + 날짜만, 배경 단색
// 변경 후: 감정 컬러바(3px) + 감정 텍스트 + "전체 보기" 링크

function PrevRecordList({ records, onRecordClick, onViewAll }) {
  return (
    <>
      {/* 변경: 섹션 헤더에 "전체 보기" 추가 */}
      <div className="rec-section-header">
        <span className="rec-section-label">최근 기록</span>
        <button className="rec-view-all" onClick={onViewAll}>
          전체 보기 ›
          {/* → navigate('/filmroll') */}
        </button>
      </div>

      {records.map(record => (
        <PrevRecordCard
          key={record.id}
          record={record}
          onClick={() => onRecordClick(record.id)}
        />
      ))}
    </>
  )
}

const MOOD_COLOR = {
  joy: '#c8a96e', warm: '#c4866a', tired: '#9a9a8e',
  sad: '#7a8fa6', calm: '#8aaa8a'
}
const MOOD_LABEL = {
  joy: '설렘', warm: '감사', tired: '피곤', sad: '슬픔', calm: '평온'
}
const MOOD_EMOJI = {
  joy: '✦', warm: '🤍', tired: '😮‍💨', sad: '🩵', calm: '🌿'
}

function PrevRecordCard({ record, onClick }) {
  return (
    <div className="prev-record-card" onClick={onClick}>

      {/* 변경: 감정 컬러바 */}
      <div
        className="rec-emotion-bar"
        style={{ background: MOOD_COLOR[record.mood] ?? '#c8c0b4' }}
      />

      <div className="rec-body">
        <div className="rec-title">{record.title}</div>
        <div className="rec-meta">
          <span>{record.date}</span>
          <span>#{record.frameNumber}</span>
        </div>
        {/* 변경: 감정 텍스트 */}
        <div className="rec-mood-text">
          {MOOD_EMOJI[record.mood]} {MOOD_LABEL[record.mood]}
        </div>
      </div>

      <span className="rec-arrow">›</span>
    </div>
  )
}
```

```css
/* 최근 기록 추가 CSS */
.rec-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 16px 8px;
}
.rec-section-label {
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 11px;
  font-weight: 500;
  color: #5a5248;
}
.rec-view-all {
  font-family: 'DM Mono', monospace;
  font-size: 8.5px;
  color: #b0a898;
  background: transparent;
  border: none;
  cursor: pointer;
}
.prev-record-card {
  margin: 0 16px 7px;
  background: #E4E1DA;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  align-items: stretch;
  border: 1px solid rgba(42, 38, 32, 0.08);
  cursor: pointer;
}
.rec-emotion-bar {
  width: 3px;
  flex-shrink: 0;
}
.rec-body {
  flex: 1;
  padding: 9px 10px;
}
.rec-title {
  font-family: 'Noto Serif KR', serif;
  font-size: 12px;
  font-weight: 600;
  color: #2a2620;
  margin-bottom: 3px;
  line-height: 1.2;
}
.rec-meta {
  font-family: 'DM Mono', monospace;
  font-size: 7.5px;
  color: #b0a898;
  display: flex;
  gap: 8px;
}
.rec-mood-text {
  font-size: 8.5px;
  color: #7a6e5e;
  margin-top: 3px;
}
.rec-arrow {
  padding: 0 12px;
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #c8c0b4;
}
```

---

## 5. 전체 변경 요약

```
[헤더]
- 로고 "reel" 중복 제거
- 우상단 ⚙ 아이콘 제거
- "MARCH 2026 / 오늘의 일기 / Sunday, 15" 형태로 교체

[STREAK 셀]
- "STREAK" → "연속 기록" (한글)
- "오늘도 기록했어요" 보조 문구 추가
- 도트 아래 "최근 7일" 기간 설명 추가

[TODAY 셀]
- 날짜 → 감정 → 날짜(보조) 위계로 변경
- 감정 컬러 도트 추가
- "기록 완료 / 아직 기록 전" 상태 텍스트 추가

[THIS MONTH 셀]
- "THIS MONTH" → "이번 달 기록" (한글)
- "frames" + 월 표기 추가

[MOOD FLOW]
- "MOOD FLOW" → "감정 흐름" (한글)
- 우측에 "최근 7일" 기간 표시 추가
- 막대 아래 요일 축(일~토) 추가
- 하단에 감정 범례 5개 추가

[최근 기록]
- 좌측 3px 감정 컬러바 추가
- 감정 이모지 + 텍스트 추가
- 섹션 헤더에 "전체 보기 ›" → navigate('/filmroll')
```

---

## 6. 체크리스트

```
[ ] 헤더에 "MARCH 2026 / 오늘의 일기 / Sunday, 15" 형태로 표시되는가?
[ ] 우상단 ⚙ 아이콘이 제거되었는가?
[ ] STREAK 셀에 "연속 기록" 한글 레이블이 있는가?
[ ] STREAK 셀에 "오늘도 기록했어요" 보조 문구가 있는가?
[ ] STREAK 셀 도트 아래 "최근 7일" 텍스트가 있는가?
[ ] TODAY 셀에서 감정이 날짜보다 크게 표시되는가?
[ ] TODAY 셀에 감정 컬러 도트가 있는가?
[ ] TODAY 셀에 "기록 완료 / 아직 기록 전" 상태 텍스트가 있는가?
[ ] THIS MONTH 셀에 "이번 달 기록" 한글 레이블이 있는가?
[ ] 감정 흐름 셀에 "최근 7일" 기간이 표시되는가?
[ ] 감정 흐름 셀에 요일 축(일~토)이 있는가?
[ ] 감정 흐름 셀에 감정 범례 5개가 있는가?
[ ] 최근 기록 카드에 3px 감정 컬러바가 있는가?
[ ] 최근 기록 카드에 감정 텍스트가 있는가?
[ ] "전체 보기 ›" 클릭 시 /filmroll 로 이동하는가?
[ ] 기록 없는 날 MOOD FLOW 막대가 회색 최소 높이로 표시되는가?
[ ] 오늘 기록 없을 때 TODAY 셀이 "—" + "아직 기록 전" 으로 표시되는가?
```
