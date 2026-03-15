# 현상 결과 화면 (일기 뷰)
> 작업 파일: `frontend/src/components/overlays/PreviewOverlay.tsx`, `frontend/src/components/frame/FrameOverlay.tsx`

---

## CSS

```css
.result-screen { background: var(--surface-base); padding: 16px; position: relative; }

/* NEG 넘버 행 (상단) */
.result-neg {
  font-family: 'DM Mono', monospace; font-size: 7.5px; color: var(--text-muted);
  letter-spacing: 0.12em; display: flex; justify-content: space-between; margin-bottom: 12px;
}

/* 제목 */
.result-title {
  font-family: 'Noto Serif KR', serif;
  font-size: 22px; font-weight: 600; color: var(--text-primary); line-height: 1.3; margin-bottom: 6px;
}

/* 날짜 */
.result-date {
  font-family: 'Noto Sans KR', sans-serif; font-size: 9px; color: var(--text-muted); margin-bottom: 10px;
}

/* 감정 태그 */
.result-tags  { display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 12px; }
.result-tag   {
  font-family: 'Noto Sans KR', sans-serif; font-size: 8px; color: var(--text-muted);
  background: var(--surface-muted); padding: 3px 9px; border-radius: 8px;
}

/* 구분선 */
.result-divider { height: 1px; background: var(--border-default); margin-bottom: 12px; }

/* 본문 */
.result-body  {
  font-family: 'Noto Serif KR', serif; font-style: italic;
  font-size: 13px; color: var(--text-secondary); line-height: 2;
}

/* NEG 넘버 (하단) */
.result-neg-num {
  font-family: 'DM Mono', monospace; font-size: 8px; color: var(--text-muted); letter-spacing: 0.1em;
}
```

---

## 구현 주의사항

- 본문 폰트는 반드시 `Noto Serif KR` italic
- NEG 넘버 형식: `REEL-{YYYY}-{frameNum:03d}` (예: `REEL-2026-042`)
- 배경은 `var(--surface-base)` (`#F0EEE9`) — 흰색 금지
- 감정 컬러는 태그가 아닌 **컬러바(`emotion-bar`)로만 표현**
