# 필름롤 화면 UX 개선 스펙
> 현재 구현된 화면 기준 보완 사항
> `04_ux_design-system-v2.md`, `04_5_filmroll.md` 와 함께 사용

---

## 0. 개선 목표 요약

| # | 항목 | 우선순위 |
|---|---|---|
| 1 | 날짜 스트립 — 오늘 날짜 중앙 스크롤 | 🔴 높음 |
| 2 | 필름 카드 — 감정 컬러바 적용 | 🔴 높음 |
| 3 | 날짜 스트립 — 감정 도트 표시 | 🟡 중간 |
| 4 | MARCH 탭 — 클릭 어포던스 강화 | 🟡 중간 |
| 5 | 카드 밀도 — 간격 축소 | 🟡 중간 |
| 6 | 빠른 현상 버튼 — 아웃라인 스타일 | 🟡 중간 |
| 7 | 검색 아이콘 위치 이동 | 🟢 낮음 |
| 8 | 롤 진행 바 시각화 강화 | 🟢 낮음 |

---

## 1. 날짜 스트립 — 오늘 날짜 중앙 스크롤

### 문제
초기 진입 시 스트립이 22~31일을 보여줌 → 오늘(15일)이 안 보임.
스트립의 존재 이유가 희미해짐.

### 수정
```jsx
// DateStrip 컴포넌트 마운트 시 오늘 날짜로 스크롤
const stripRef = useRef(null)
const todayRef = useRef(null)

useEffect(() => {
  if (todayRef.current && stripRef.current) {
    const strip = stripRef.current
    const today = todayRef.current
    const stripCenter = strip.offsetWidth / 2
    const todayOffset = today.offsetLeft + today.offsetWidth / 2
    strip.scrollLeft = todayOffset - stripCenter
  }
}, [currentMonth])

// DateItem에서 오늘 날짜에 ref 연결
<div
  ref={day.isToday ? todayRef : null}
  className={`date-item ${day.isToday ? 'today' : ''} ...`}
>
```

**변경 포인트:**
- `currentMonth` 변경 시마다 스크롤 재계산
- 오늘이 없는 달(과거 월)은 1일 기준으로 fallback 처리 권장

---

## 2. 필름 카드 — 감정 컬러바 적용

### 문제
현재 모든 카드가 동일한 색 → 감정 구분 불가.

### 수정
카드 구조: `.emotion-bar` (3px) + `.film-sprocket` + `.film-card-content` + `.film-sprocket`

```jsx
const EMOTION_COLOR: Record<string, string> = {
  '설렘': '#c8a96e', '기쁨': '#c8a96e',
  '감사': '#c4866a',
  '피곤': '#9a9a8e', '무기력': '#9a9a8e',
  '슬픔': '#7a8fa6', '외로움': '#7a8fa6',
  '평온': '#8aaa8a',
}

// FilmCard 컴포넌트
<div className="film-card">
  {/* 감정 컬러바 — 반드시 포함 */}
  <div
    className="emotion-bar"
    style={{ background: EMOTION_COLOR[record.mood] ?? '#c8c0b4' }}
  />
  <div className="film-sprocket">...</div>
  <div className="film-card-content">...</div>
  <div className="film-sprocket">...</div>
</div>
```

```css
.emotion-bar {
  width: 3px;
  flex-shrink: 0;
  /* background는 인라인으로 감정 컬러 지정 */
}
```

---

## 3. 날짜 스트립 — 감정 도트 표시

### 문제
모든 날짜 셀이 동일하게 보임 → "이 날 기록했는지" 스트립에서 파악 불가.

### 수정
```jsx
// DateItem — 기록 있는 날 감정 도트 추가
function DateItem({ day, record, isSelected, onClick }) {
  return (
    <div className={`date-item ${...}`} onClick={onClick}>
      <span className="date-dow">{day.dow}</span>
      <div className="date-num">{day.date}</div>

      {/* 감정 도트 — 기록 있는 날만 */}
      <div
        className="date-dot"
        style={{
          background: record
            ? (EMOTION_COLOR[record.mood] ?? '#c8c0b4')
            : 'transparent'
        }}
      />
    </div>
  )
}
```

```css
.date-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 2px;
  /* background는 인라인으로 지정 */
}
```

---

## 4. MARCH 탭 — 클릭 어포던스 강화

### 문제
`MARCH 2026 ▾` 가 버튼인지 텍스트인지 모호함.

### 수정
```css
/* 기존 */
.month-tab-btn {
  background: transparent;
  border: none;
}

/* 개선 — 배경 + 패딩으로 버튼임을 표시 */
.month-tab-btn {
  background: #E4E1DA;
  border: 1px solid rgba(42,38,32,0.12);
  border-radius: 8px;
  padding: 4px 10px 4px 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: background 0.15s;
}

.month-tab-btn:active {
  background: #d8d4cc;
}

.month-tab-btn .chevron {
  font-size: 10px;
  color: #7a5c20;
  transition: transform 0.2s;
}

.month-tab-btn.open .chevron {
  transform: rotate(180deg);
}
```

---

## 5. 카드 밀도 — 간격 축소

### 문제
카드 간격이 넓어 스크롤이 많이 필요함.

### 수정
```css
/* 카드 내부 패딩 */
.film-card-content {
  padding: 10px 10px 8px 7px;  /* 기존 12px 12px 10px 8px */
}

/* 카드 간격 */
.film-card {
  margin-bottom: 8px;  /* 기존 12px */
}

/* 월 헤더 여백 */
.month-header {
  padding: 16px 0 8px;  /* 기존 20px 0 12px */
}

/* 카드 제목 */
.film-card-title {
  font-size: 17px;      /* 기존 19px */
  margin-bottom: 5px;
}

/* 카드 본문 */
.film-card-body {
  font-size: 10px;
  line-height: 1.65;    /* 기존 1.75 */
  margin-bottom: 8px;   /* 기존 10px */
}
```

---

## 6. 빠른 현상 버튼 — 아웃라인 스타일

### 문제
검정 배경 버튼이 월 헤더 골드와 시선 경쟁.

### 수정
```css
/* 기존 — 검정 배경 */
.quick-develop-btn {
  background: #2a2620;
  color: #ede8e2;
}

/* 개선 — 아웃라인 */
.quick-develop-btn {
  background: transparent;
  color: #7a5c20;
  border: 1px solid rgba(122,92,32,0.4);
  border-radius: 8px;
  font-family: 'DM Mono', 'Noto Sans KR', monospace;
  font-size: 10px;
  padding: 5px 12px;
  cursor: pointer;
  letter-spacing: 0.04em;
  white-space: nowrap;
}

.quick-develop-btn:active {
  background: rgba(122,92,32,0.06);
}
```

---

## 7. 검색 아이콘 위치 이동

### 문제
`🔍` 가 ROLL 02 인디케이터 옆에 있어 맥락 혼란.
("이 롤에서만 검색?" → 실제로는 전체 기록 검색)

### 수정
```jsx
// 기존: [ROLL 02 ── 1/24] [🔍] [◆ 빠른 현상]
// 개선: [ROLL 02 ── 1/24]      [🔍] [◆ 빠른 현상]
//        롤 인디케이터 행         스트립 헤더 우측으로 이동

<div className="strip-header">
  <button className="month-tab-btn">
    MARCH 2026 <span className="chevron">▾</span>
  </button>
  <div className="strip-actions">
    <button className="icon-btn">
      <SearchIcon />  {/* 롤 인디케이터에서 이쪽으로 이동 */}
    </button>
    <button className="quick-develop-btn">◆ 빠른 현상</button>
  </div>
</div>
```

---

## 8. 롤 진행 바 시각화 강화

### 문제
진행 바가 너무 얇고 색이 약함.

### 수정
```css
.roll-progress-track {
  flex: 1;
  height: 3px;           /* 기존 1px */
  background: rgba(42,38,32,0.1);
  border-radius: 2px;
  overflow: hidden;
  margin: 0 8px;
}

.roll-progress-fill {
  height: 100%;
  background: #7a5c20;
  border-radius: 2px;
  /* width: (currentFrame / 24 * 100)% */
}

.roll-progress-text {
  font-family: 'DM Mono', monospace;
  font-size: 9px;
  color: #b0a898;
  white-space: nowrap;
}
```

---

## 9. 체크리스트

```
[ ] 초기 진입 시 날짜 스트립이 오늘 날짜를 중앙에 보여주는가?
[ ] 월 변경 시에도 스트립이 해당 월 오늘/1일로 스크롤되는가?
[ ] 모든 필름 카드 좌측에 3px 감정 컬러바가 있는가?
[ ] 감정 없는 카드는 컬러바가 #c8c0b4 (중성 회색)인가?
[ ] 기록 있는 날짜에 스트립 도트가 표시되는가?
[ ] 기록 없는 날짜 도트가 투명(보이지 않음)인가?
[ ] MARCH 탭 버튼에 배경과 테두리가 있어 버튼임이 명확한가?
[ ] 카드 margin-bottom이 8px인가?
[ ] 카드 내부 패딩이 줄었는가?
[ ] 빠른 현상 버튼이 아웃라인 스타일(배경 없음)인가?
[ ] 검색 아이콘이 스트립 헤더 우측으로 이동했는가?
[ ] 롤 진행 바 높이가 3px이고 골드 색상인가?
```
