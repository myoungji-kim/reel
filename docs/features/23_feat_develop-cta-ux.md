# Reel — 현상하기 CTA UX 개선 스펙
> 기존 하단 고정 배너 방식 → AI 말풍선 기반 3단계 점진적 노출로 교체

---

## 0. 핵심 컨셉

**버튼을 찾는 게 아니라 AI가 먼저 제안한다.**

사용자가 CTA 버튼을 찾아 누르는 구조 대신,
AI가 대화 흐름을 읽고 자연스럽게 마무리를 제안하는 구조.

---

## 1. 3단계 플로우

```
1단계 (항상)     → 입력창 왼쪽 현상 아이콘 — 조용하게 상시 노출
2단계 (4턴 이상) → AI가 하루 요약 + 현상 제안 말풍선
3단계 (재제안)   → "더 얘기할게요" 후 추가 대화, AI가 새 내용 반영해 재제안
```

---

## 2. 단계별 상세

### 2-1. 1단계 — 현상 아이콘 (상시)

```jsx
// 입력창 왼쪽에 항상 노출
// 대화 중: 회색 (조용)
// 2단계 이후: 골드 테두리+배경 (은근히 강조)

<div className={`develop-icon ${isReady ? 'active' : ''}`}
  onClick={() => navigate('/develop/result')}>
  <svg>...</svg>
</div>
```

```css
.develop-icon {
  width: 32px; height: 32px;
  border-radius: 50%;
  border: 1px solid rgba(42,38,32,0.15);
  background: transparent;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}
.develop-icon.active {
  border-color: rgba(200,169,110,0.6);
  background: #fdf8ee;
}
.develop-icon svg {
  width: 14px; height: 14px;
  fill: none; stroke: #b0a898;
  stroke-width: 1.5; stroke-linecap: round;
}
.develop-icon.active svg { stroke: #7a5c20; }
```

### 2-2. 2단계 — AI 제안 말풍선 (4턴 이상)

```
트리거 조건:
- 사용자 메시지 4턴 이상 AND
- AI가 마무리 흐름 감지 (감사·회고·마무리 표현 감지)
또는
- 사용자 메시지 6턴 이상 (무조건)
```

```jsx
// AI 응답 마지막에 제안 말풍선 추가
// 일반 AI 말풍선과 같은 구조 — 단 배경/테두리만 다름

<div className="bai-suggest">
  <p className="suggest-summary">
    {aiGeneratedSummary}
    {/* AI가 오늘 대화를 1~2줄로 요약한 텍스트 */}
    {/* 예: "앱 개발하고 기분 좋았던 오늘의 이야기," */}
    {/* "일기 한 장으로 남겨볼까요?" */}
  </p>
  <div className="suggest-btns">
    <button className="sbtn-develop" onClick={handleDevelop}>
      ◆ 현상하기
    </button>
    <button className="sbtn-more" onClick={handleMore}>
      더 얘기할게요
    </button>
  </div>
</div>
```

### 2-3. 3단계 — 재제안

```
트리거: "더 얘기할게요" 클릭 후 추가 2턴
재제안 시: AI가 추가된 내용을 반영해 새 요약 + 제안
최대 재제안: 제한 없음 (사용자가 원하면 계속 대화 가능)
```

---

## 3. CSS

```css
/* ── 제안 말풍선 ── */
.bai-suggest {
  background: #fdf8ee;
  border: 1px solid rgba(200,169,110,0.4);
  border-radius: 2px 12px 12px 12px;   /* 일반 AI 말풍선과 동일 구조 */
  padding: 12px 12px 10px;
  display: inline-block;
  max-width: 90%;
}

.suggest-summary {
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 13px;                      /* 일반 말풍선과 동일 크기 */
  font-weight: 400;
  color: #3a3020;                       /* 충분히 어두운 브라운 */
  line-height: 1.65;
  margin-bottom: 10px;
}

/* 버튼 그룹 */
.suggest-btns {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 현상하기 — 작고 절제된 다크 버튼 */
.sbtn-develop {
  font-family: 'DM Mono', 'Noto Sans KR', monospace;
  font-size: 11px;
  font-weight: 500;
  color: #ede8e2;                       /* 크림 화이트 */
  background: #2a2620;                  /* 다크 배경 */
  border: none;
  border-radius: 8px;
  padding: 7px 14px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  letter-spacing: 0.02em;
  line-height: 1;
}

.sbtn-develop .diamond {
  color: #c8a96e;                       /* 골드 다이아몬드 */
  font-size: 10px;
}

/* 더 얘기할게요 — 텍스트 버튼 */
.sbtn-more {
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 11px;
  color: #7a6e5e;                       /* 대비율 4.6:1 */
  background: transparent;
  border: none;
  padding: 7px 0;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
  text-decoration-color: rgba(122,110,94,0.35);
  line-height: 1;
}
```

---

## 4. 입력창 placeholder 변화

```jsx
const getPlaceholder = (stage) => {
  if (stage === 1) return '오늘 있었던 일, 기분... 뭐든요'
  if (stage >= 2) return '더 하고 싶은 말이 있으면...'
}
```

---

## 5. 기존 하단 배너 제거

```jsx
// 제거 대상
// <div className="develop-cta">...</div>
// → 이 컴포넌트 전체 삭제

// 대신 AI 말풍선 방식으로 교체
// ChatMessage 컴포넌트에서
// message.type === 'suggest' 일 때 bai-suggest 렌더링
```

---

## 6. AI 프롬프트 추가 (백엔드)

```
시스템 프롬프트에 추가:

사용자와 4번 이상 대화했고, 하루 이야기가 어느 정도
마무리되는 흐름이 감지되면 아래 형식으로 응답해줘.

[일반 대화 응답]

---SUGGEST---
[오늘 대화 내용을 1~2문장으로 따뜻하게 요약]
일기 한 장으로 남겨볼까요?

프론트엔드에서 ---SUGGEST--- 구분자로 파싱해서
suggest 타입 말풍선으로 렌더링.
```

---

## 7. 대비율 검증

| 요소 | 배경 | 텍스트 | 대비율 |
|---|---|---|---|
| suggest-summary | `#fdf8ee` | `#3a3020` | 10.2:1 ✅ |
| 현상하기 버튼 텍스트 | `#2a2620` | `#ede8e2` | 13.0:1 ✅ |
| 현상하기 다이아몬드 | `#2a2620` | `#c8a96e` | 4.8:1 ✅ |
| 더 얘기할게요 | `#fdf8ee` | `#7a6e5e` | 4.6:1 ✅ |

---

## 8. 체크리스트

```
[ ] 기존 하단 develop-cta 배너 컴포넌트 제거되었는가?
[ ] 입력창 왼쪽에 develop-icon 버튼이 항상 노출되는가?
[ ] 4턴 이상 시 AI 응답에 suggest 타입이 추가되는가?
[ ] bai-suggest 배경이 #fdf8ee 인가?
[ ] sbtn-develop 배경이 #2a2620, 텍스트가 #ede8e2 인가?
[ ] sbtn-more 텍스트가 #7a6e5e (언더라인) 인가?
[ ] "더 얘기할게요" 클릭 시 대화가 계속되는가?
[ ] 추가 2턴 후 새 내용 반영해 재제안되는가?
[ ] 2단계 이후 develop-icon이 골드 테두리로 변경되는가?
[ ] 입력창 placeholder가 단계별로 변경되는가?
[ ] suggest-summary가 AI가 생성한 오늘 요약 텍스트인가?
```
