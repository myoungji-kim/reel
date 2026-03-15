# 홈 화면 — 벤토 그리드
> 작업 파일: `frontend/src/pages/HomePage.tsx` (또는 별도 HomeScreen 컴포넌트)

---

## 헤더

```css
.home-header {
  display: flex; justify-content: space-between; align-items: flex-start;
  padding: 12px 16px 10px;
}
.home-month {
  font-family: 'DM Mono', monospace; font-size: 9px;
  color: var(--text-muted); letter-spacing: 0.12em; margin-bottom: 3px;
}
.home-title {
  font-family: 'Noto Serif KR', serif;
  font-size: 24px; font-weight: 600; color: var(--text-primary); line-height: 1.1;
}
.home-sub {
  font-family: 'Noto Sans KR', sans-serif; font-size: 9px;
  color: var(--text-muted); margin-top: 2px; font-weight: 300;
}
.home-plus-btn {
  width: 32px; height: 32px; border-radius: 50%;
  background: var(--surface-inverse); border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
```

---

## 벤토 그리드

> **반드시 CSS Grid로 구현 (flex 금지)**

```css
.bento-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding: 0 16px;
  margin-bottom: 16px;
}
.bento-cell {
  background: var(--surface-muted);
  border-radius: 14px; padding: 12px 12px 10px;
  position: relative; overflow: hidden;
  border: 1px solid var(--border-default);
}
.bento-cell.tall  { grid-row: span 2; }
.bento-cell.wide  { grid-column: span 2; }
.bento-cell.dark  { background: var(--surface-inverse); border-color: transparent; }
.bento-cell.gold  { background: var(--gold-pale); border-color: rgba(200,169,110,0.3); }

.bento-label {
  font-family: 'DM Mono', monospace; font-size: 8px;
  color: var(--text-muted); letter-spacing: 0.1em; margin-bottom: 5px;
}
.bento-cell.dark .bento-label { color: rgba(240,238,233,0.45); }

.bento-value {
  font-family: 'Noto Serif KR', serif;
  font-size: 22px; font-weight: 600; color: var(--text-primary); line-height: 1.1;
}
.bento-cell.dark .bento-value { color: var(--text-inverse); }
.bento-cell.gold .bento-value { color: var(--gold); font-size: 16px; }

.bento-sub {
  font-family: 'Noto Sans KR', sans-serif; font-size: 9px;
  color: var(--text-muted); margin-top: 3px; font-weight: 300;
}
.bento-cell.dark .bento-sub { color: rgba(240,238,233,0.5); }
```

---

## Streak 도트

```css
.streak-dots { display: flex; gap: 4px; margin-top: 10px; flex-wrap: wrap; }
.s-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: rgba(240,238,233,0.2); border: 1px solid rgba(240,238,233,0.3);
}
.s-dot.joy   { background: var(--emotion-joy);   border-color: var(--emotion-joy); }
.s-dot.warm  { background: var(--emotion-warm);  border-color: var(--emotion-warm); }
.s-dot.tired { background: var(--emotion-tired); border-color: var(--emotion-tired); }
.s-dot.sad   { background: var(--emotion-sad);   border-color: var(--emotion-sad); }
.s-dot.calm  { background: var(--emotion-calm);  border-color: var(--emotion-calm); }
```

---

## Mood Flow 바 차트

```css
.mood-bars { display: flex; gap: 4px; align-items: flex-end; height: 28px; margin-top: 8px; }
.mood-bar { width: 10px; border-radius: 3px 3px 0 0; flex-shrink: 0; }
.mood-bar.empty { background: var(--border-default); height: 6px; }
```

---

## 이전 기록 카드

```css
.prev-record-card {
  margin: 0 16px 8px; background: var(--surface-muted);
  border-radius: 12px; padding: 11px 14px;
  display: flex; align-items: center; justify-content: space-between;
  border: 1px solid var(--border-default); cursor: pointer;
}
.prev-title { font-family: 'Noto Sans KR', sans-serif; font-size: 11px; font-weight: 500; color: var(--text-primary); }
.prev-date  { font-family: 'DM Mono', monospace; font-size: 8px; color: var(--text-muted); margin-top: 2px; }
```

---

## 벤토 셀 구성 (레이아웃)

```
┌─────────────┬─────────────┐
│  STREAK     │   TODAY     │
│  tall dark  │   gold      │
│             ├─────────────┤
│             │ THIS MONTH  │
├─────────────┴─────────────┤
│       MOOD FLOW (wide)    │
└───────────────────────────┘
```

각 셀마다 `grain-overlay` div 포함 필수.
