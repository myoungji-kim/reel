# 하루 현상 화면 (채팅) + 현상 애니메이션
> 작업 파일: `frontend/src/pages/ChatPage.tsx`, `frontend/src/components/chat/MessageBubble.tsx`, `frontend/src/components/chat/DevelopBanner.tsx`, `frontend/src/components/chat/ChatInput.tsx`

---

## 헤더

```css
.chat-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 16px 9px; border-bottom: 1px solid var(--border-default); flex-shrink: 0;
}
.chat-logo {
  font-family: 'Noto Serif KR', serif;
  font-size: 18px; font-weight: 600; font-style: italic; color: var(--text-primary);
}
.chat-date-chip {
  font-family: 'DM Mono', monospace; font-size: 9px; color: var(--text-muted);
  background: var(--surface-muted); border: 1px solid var(--border-default);
  padding: 3px 8px; border-radius: 8px;
}
```

---

## 컨텍스트 칩

```css
.context-chips { display: flex; gap: 5px; padding: 6px 16px; flex-shrink: 0; }
.chip {
  font-family: 'Noto Sans KR', sans-serif; font-size: 9px;
  color: var(--text-muted); background: var(--surface-muted);
  border: 1px solid var(--border-default); padding: 3px 8px; border-radius: 8px;
}
.chip.mood-positive { background: #e8f0e6; color: #4a7040; border-color: #c0d8b8; }
```

---

## 말풍선

```css
/* AI 말풍선 */
.bubble-ai {
  background: var(--surface-card); border: 1px solid var(--border-default);
  border-radius: 2px 12px 12px 12px;  /* 좌상단만 뾰족 */
  padding: 9px 11px; display: inline-block; max-width: 85%;
}
.bubble-ai p {
  font-family: 'Noto Sans KR', sans-serif; font-size: 11px;
  color: var(--text-secondary); line-height: 1.65;
}

/* 유저 말풍선 */
.bubble-user {
  background: var(--surface-inverse);
  border-radius: 12px 2px 12px 12px;  /* 우상단만 뾰족 */
  padding: 9px 13px; max-width: 78%;
}
.bubble-user p {
  font-family: 'Noto Sans KR', sans-serif; font-size: 11px;
  color: var(--text-inverse); line-height: 1.65;
}

.msg-time {
  font-family: 'DM Mono', monospace; font-size: 8px; color: rgba(42,38,32,0.28);
}
.msg-ai-wrapper  { display: flex; flex-direction: column; gap: 3px; }
.msg-user-wrapper{ display: flex; flex-direction: column; align-items: flex-end; gap: 3px; }
.ai-sender-name  { font-family: 'DM Mono', monospace; font-size: 8px; color: var(--text-muted); letter-spacing: 0.06em; }
```

---

## 현상하기 CTA 배너

```css
.develop-cta {
  margin: 0 14px 8px; background: var(--surface-inverse);
  border-radius: 14px; padding: 11px 14px;
  display: flex; align-items: center; justify-content: space-between; flex-shrink: 0;
}
.cta-title { font-family: 'Noto Sans KR', sans-serif; font-size: 11px; font-weight: 500; color: var(--text-inverse); }
.cta-sub   { font-family: 'Noto Sans KR', sans-serif; font-size: 9px; color: rgba(240,238,233,0.5); margin-top: 2px; font-weight: 300; }
.cta-button {
  font-family: 'DM Mono', 'Noto Sans KR', monospace;
  font-size: 10px; font-weight: 500; color: var(--text-primary);
  background: var(--surface-base); border: none; border-radius: 9px;
  padding: 7px 14px; cursor: pointer; white-space: nowrap; min-height: 34px;
}
```

---

## 입력창

```css
.chat-input-row {
  display: flex; align-items: center; gap: 8px;
  padding: 7px 14px 8px; border-top: 1px solid var(--border-default);
  background: var(--surface-base); flex-shrink: 0;
}
.chat-input {
  flex: 1; background: var(--surface-card); border: 1px solid var(--border-default);
  border-radius: 20px; padding: 9px 14px;
  font-family: 'Noto Sans KR', sans-serif; font-size: 11px; font-weight: 300;
  color: var(--text-primary); outline: none;
}
.chat-input::placeholder { color: var(--text-placeholder); }
.send-button {
  width: 36px; height: 36px; border-radius: 50%;
  background: var(--surface-inverse); border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
```

---

## 현상 애니메이션 (스캔라인)

```css
/* 현상 버튼 클릭 시 위→아래 스캔 라인 */
.scan-overlay {
  position: absolute; inset: 0;
  pointer-events: none; z-index: 30; overflow: hidden; opacity: 0;
}
.scan-line {
  position: absolute; left: 0; right: 0; height: 3px; top: -3px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(200,169,110,0.85) 30%,
    rgba(255,230,160,1) 50%,
    rgba(200,169,110,0.85) 70%,
    transparent
  );
}
.scan-wash {
  position: absolute; inset: 0;
  background: linear-gradient(180deg, rgba(240,238,233,0.97) 0%, rgba(240,238,233,0) 100%);
  transform: translateY(-100%);
}
```

**JS 순서**: `scan-overlay` opacity 1 → scanLine top 0~100% 이동 → 결과 화면 노출
