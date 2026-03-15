# 필름롤 화면 — ROLL 탭 + GRID(캘린더) 탭
> 작업 파일: `frontend/src/components/frame/FilmFrame.tsx`, `frontend/src/components/frame/CalendarView.tsx`, `frontend/src/components/frame/MonthDivider.tsx`, `frontend/src/components/frame/RollDivider.tsx`

---

## ROLL 탭

### 월 헤더

```css
.month-header {
  display: flex; justify-content: space-between; align-items: center; padding: 20px 0 12px;
}
.month-title {
  font-family: 'DM Mono', monospace; font-size: 12px; font-weight: 500;
  color: var(--gold); letter-spacing: 0.14em; text-transform: uppercase;
  display: flex; align-items: center; gap: 10px;
}
.month-title::after { content: ''; display: inline-block; width: 40px; height: 1px; background: #d8d2c8; }
.month-count { font-family: 'DM Mono', monospace; font-size: 9px; color: var(--text-muted); font-style: italic; }
```

### 필름 카드

> **배경: `#E4E1DA` (--surface-muted) — 절대 어둡게 하지 말 것**

```css
/* 3열 flex 구조: [감정바 3px] [스프로킷 18px] [콘텐츠 flex:1] */
.film-card {
  background: var(--surface-muted);
  border-radius: 10px; margin-bottom: 12px; overflow: hidden; display: flex;
}

/* 감정 컬러바 */
.emotion-bar { width: 3px; flex-shrink: 0; }
.bar-joy   { background: var(--emotion-joy); }
.bar-warm  { background: var(--emotion-warm); }
.bar-tired { background: var(--emotion-tired); }
.bar-sad   { background: var(--emotion-sad); }
.bar-calm  { background: var(--emotion-calm); }

/* 스프로킷 (필름 구멍) */
.film-sprocket {
  width: 18px; flex-shrink: 0; background: var(--surface-muted);
  display: flex; flex-direction: column; justify-content: space-evenly;
  align-items: center; padding: 8px 0;
}
.film-hole {
  width: 9px; height: 7px;
  background: var(--surface-base);        /* 앱 배경색 = 구멍처럼 보임 */
  border: 1px solid rgba(42,38,32,0.15);
  border-radius: 2px; flex-shrink: 0;
}

/* 카드 내용 */
.film-card-content { flex: 1; padding: 12px 12px 10px 8px; }
.film-card-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.film-card-date { font-family: 'DM Mono', monospace; font-size: 8.5px; color: var(--gold); letter-spacing: 0.08em; }
.film-card-num  { font-family: 'DM Mono', monospace; font-size: 8.5px; color: var(--text-muted); }

.film-card-title {
  font-family: 'Noto Serif KR', serif;
  font-size: 19px; font-weight: 600; color: var(--text-primary); line-height: 1.2; margin-bottom: 6px;
}
.film-card-body {
  font-family: 'Noto Sans KR', sans-serif; font-size: 10px; font-weight: 300;
  color: var(--text-secondary); line-height: 1.75; margin-bottom: 10px;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.film-card-footer { display: flex; justify-content: space-between; align-items: center; }
.film-card-emotion { font-family: 'Noto Sans KR', sans-serif; font-size: 10px; color: var(--text-secondary); }
.film-develop-btn {
  font-family: 'DM Mono', 'Noto Sans KR', monospace; font-size: 8.5px; color: var(--gold);
  border: 1px solid rgba(122,92,32,0.35); background: transparent;
  border-radius: 6px; padding: 6px 12px; min-height: 28px; cursor: pointer; letter-spacing: 0.08em;
}
```

### 롤 구분선

```css
.roll-divider {
  display: flex; align-items: center; gap: 8px; margin: 2px 0 4px;
  font-family: 'DM Mono', monospace; font-size: 8.5px; color: var(--text-muted); letter-spacing: 0.1em;
}
.roll-divider::before, .roll-divider::after {
  content: ''; flex: 1; height: 1px; background: rgba(42,38,32,0.12);
}
```

### 감정 컬러 매핑

| 감정 키워드 | 클래스 | 색상 |
|---|---|---|
| 설렘, 기쁨, 행복 | `bar-joy` | `#c8a96e` |
| 감사, 따뜻함, 사랑 | `bar-warm` | `#c4866a` |
| 피곤, 무기력, 지침 | `bar-tired` | `#9a9a8e` |
| 슬픔, 외로움, 우울 | `bar-sad` | `#7a8fa6` |
| 평온, 맑음, 차분 | `bar-calm` | `#8aaa8a` |

---

## GRID 탭 (캘린더)

### 캘린더 카드

```css
.calendar-card {
  margin: 0 14px 14px; background: var(--surface-muted);
  border-radius: 12px; overflow: hidden; padding: 14px 14px 16px;
}
.cal-nav { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.cal-nav-arrow {
  width: 24px; height: 24px; border-radius: 50%; background: transparent;
  border: 1px solid rgba(42,38,32,0.2); display: flex; align-items: center; justify-content: center;
  cursor: pointer; font-size: 12px; color: var(--gold);
}
.cal-month-title {
  font-family: 'DM Mono', monospace; font-size: 13px; font-weight: 500;
  color: var(--gold); letter-spacing: 0.14em; text-transform: uppercase;
}
```

### 통계 칩

```css
.cal-stat-row { display: flex; gap: 6px; align-items: center; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid rgba(42,38,32,0.12); }
.stat-chip {
  font-family: 'DM Mono', monospace; font-size: 8px; color: var(--text-muted);
  background: var(--surface-base); border: 1px solid rgba(42,38,32,0.12);
  border-radius: 8px; padding: 3px 8px;
}
.stat-chip.active { color: var(--gold); background: var(--gold-pale); border-color: var(--gold-light); }
```

### 날짜 그리드

```css
.dow-row { display: grid; grid-template-columns: repeat(7, 1fr); margin-bottom: 4px; }
.dow-cell {
  font-family: 'DM Mono', monospace; font-size: 7.5px; color: var(--text-muted);
  text-align: center; letter-spacing: 0.06em; padding: 2px 0 6px;
}
.dow-cell.sun { color: #c4866a; }
.dow-cell.sat { color: #7a8fa6; }

.dates-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px 0; }
.day-cell { display: flex; flex-direction: column; align-items: center; padding: 3px 0; cursor: pointer; }
.day-num {
  font-family: 'DM Mono', monospace; font-size: 11px; color: var(--text-secondary);
  width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 50%;
}

.day-cell.today      .day-num { background: var(--gold); color: var(--gold-pale); font-weight: 500; }
.day-cell.has-record .day-num { background: var(--gold-pale); color: var(--gold); font-weight: 500; }
.day-cell.future     .day-num { color: #c8c0b4; }
.day-cell.sun        .day-num { color: #c4866a; }
.day-cell.sat        .day-num { color: #7a8fa6; }
.day-cell.empty { pointer-events: none; }

.emotion-dot { width: 4px; height: 4px; border-radius: 50%; margin-top: 2px; flex-shrink: 0; }
```

### 날짜 선택 시 하단 프리뷰

```css
.record-preview { margin-top: 10px; border-top: 1px solid rgba(42,38,32,0.12); padding-top: 10px; }
.preview-date  { font-family: 'DM Mono', monospace; font-size: 8px; color: var(--gold); letter-spacing: 0.08em; margin-bottom: 4px; }
.preview-title { font-family: 'Noto Serif KR', serif; font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 4px; line-height: 1.3; }
.preview-body  { font-family: 'Noto Sans KR', sans-serif; font-size: 9px; font-weight: 300; color: var(--text-secondary); line-height: 1.6; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 8px; }
.preview-btn   { font-family: 'DM Mono', 'Noto Sans KR', monospace; font-size: 8px; color: var(--gold); border: 1px solid var(--gold-light); background: transparent; border-radius: 5px; padding: 4px 10px; cursor: pointer; }
```
