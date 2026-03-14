# CSS 스펙 정밀 적용 (CSS Spec Refinement)

## 배경

`02_ux_light-theme-redesign.md` 기준으로 라이트 테마가 구현된 상태에서,
확정된 CSS Implementation Spec에 맞춰 세부 수치·컴포넌트 구조를 정밀 교정한다.

**백엔드 변경 없음. 프론트엔드 전용이다.**

---

## 핵심 원칙 (구현 중 절대 어기지 말 것)

1. 배경은 순수 흰색이 아니다 → `#f5f2ed` 유지
2. 카드/말풍선만 흰색 → `#ffffff`
3. 검정은 순수 검정이 아니다 → `#1a1814`
4. 모든 border는 0.5~1px, 색은 `#e4dfd6`
5. **box-shadow 사용 금지** → FAB 버튼 한 곳만 예외
6. 폰트 굵기: body/mono는 400·500까지만, Cormorant Garamond(display)는 600까지 허용
7. 제목/로고는 반드시 Cormorant Garamond italic

---

## 관련 파일

- `frontend/src/styles/tokens.css`
- `frontend/src/styles/index.css`
- `frontend/src/components/layout/TopBar.tsx`
- `frontend/src/components/chat/MessageBubble.tsx`
- `frontend/src/components/chat/TypingIndicator.tsx`
- `frontend/src/components/chat/ChatInput.tsx`
- `frontend/src/components/chat/DevelopBanner.tsx`
- `frontend/src/components/frame/FilmFrame.tsx`
- `frontend/src/components/frame/MonthDivider.tsx`
- `frontend/src/components/frame/RollProgressBar.tsx`

---

## Step 1. `tokens.css` — 변수 스케일 추가

기존 변수는 유지하고 아래 세 블록을 `:root`에 추가한다.

```css
/* FONT SIZES */
--text-xs:   7px;
--text-sm:   8.5px;
--text-base: 10px;
--text-md:   12px;
--text-lg:   15px;
--text-xl:   18px;
--text-2xl:  22px;

/* SPACING */
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;

/* RADIUS — pill 추가 (radius-full alias) */
--radius-pill: 9999px;
```

`--accent-gold-light` 값도 스펙에 맞게 교정한다.
```css
/* Before */
--accent-gold-light: #e8c87a;

/* After */
--accent-gold-light: #ffe6a0;
```

---

## Step 2. `index.css` — 폰트 import 교정

```css
/* Before */
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=DM+Mono:wght@400;500&...');

/* After */
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Mono:wght@300;400;500&family=Noto+Sans+KR:wght@300;400;500&display=swap');
```

변경 내용:
- Cormorant Garamond: 300 weight 제거, 500 weight 추가
- DM Mono: 300 weight 추가

---

## Step 3. `TopBar.tsx` — 로고 크기·탭 폰트·필름스트립

### 3-1. 로고 크기 조정

```tsx
/* Before */
logo: {
  fontFamily: "var(--font-display)",
  fontWeight: 600,
  fontStyle: 'italic',
  fontSize: 28,
  ...
}

/* After */
logo: {
  fontFamily: "var(--font-display)",
  fontWeight: 600,
  fontStyle: 'italic',
  fontSize: 22,
  letterSpacing: '0.02em',
  ...
}
```

### 3-2. 탭 폰트 변경 — font-mono → font-body

```tsx
/* Before: fontFamily: "var(--font-mono)", fontSize: 10 */
/* After:  fontFamily: "var(--font-body)", fontSize: 'var(--text-sm)' */

/* 탭 active border-bottom 색상 */
/* Before: '2px solid var(--amber)' */
/* After:  '1.5px solid var(--accent-gold)' */
```

### 3-3. topbar borderBottom 제거 + 필름스트립 컴포넌트 추가

현재: topbar에 `borderBottom: '1px solid var(--border)'`
변경: topbar에서 `borderBottom` 제거, 대신 바로 아래에 `.FilmStrip` 인라인 컴포넌트 추가

```tsx
/* TopBar 반환 구조 */
return (
  <div>
    <div style={styles.topbar}>
      {/* 기존 내용 그대로 */}
    </div>
    {/* 필름스트립 라인 */}
    <div style={styles.filmStrip}>
      {Array.from({ length: 40 }, (_, i) => (
        <div key={i} style={styles.filmHole} />
      ))}
    </div>
  </div>
)

/* 추가 스타일 */
filmStrip: {
  height: 10,
  background: 'var(--surface-base)',
  borderTop: '1px solid var(--border-default)',
  borderBottom: '1px solid var(--border-default)',
  display: 'flex',
  alignItems: 'center',
  gap: 3,
  padding: '0 8px',
  overflow: 'hidden',
  flexShrink: 0,
},
filmHole: {
  width: 10,
  height: 6,
  border: '1px solid var(--border-default)',
  borderRadius: 1,
  background: 'var(--surface-base)',
  flexShrink: 0,
},
```

---

## Step 4. `MessageBubble.tsx` — 아바타·말풍선 radius·타임스탬프

### 4-1. AI 아바타 — Aperture 아이콘 → 골드 링

```tsx
/* Before: lucide Aperture 아이콘 */
<div style={styles.avatar}><Aperture size={14} /></div>

/* After: 다크 원 + 내부 골드 링 */
<div style={styles.avatar}>
  <div style={styles.avatarRing} />
</div>

/* 스타일 */
avatar: {
  width: 32,
  height: 32,
  borderRadius: '50%',
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'var(--surface-inverse)',
  marginTop: 2,
},
avatarRing: {
  width: 14,
  height: 14,
  borderRadius: '50%',
  border: '1.5px solid var(--accent-gold)',
},
```

`import { Aperture } from 'lucide-react'` 삭제.

### 4-2. 말풍선 border-radius 교정

```tsx
/* AI 말풍선 */
/* Before: borderRadius: '4px 16px 16px 16px' */
/* After:  borderRadius: '2px var(--radius-md) var(--radius-md) var(--radius-md)' */

/* 유저 말풍선 */
/* Before: borderRadius: '16px 4px 16px 16px' */
/* After:  borderRadius: 'var(--radius-md) 2px var(--radius-md) var(--radius-md)' */
```

### 4-3. 타임스탬프 — AI는 아바타 폭만큼 들여쓰기

```tsx
/* AI 타임스탬프 */
time: {
  fontFamily: "var(--font-mono)",
  fontSize: 'var(--text-xs)',   /* 7px */
  color: 'var(--text-placeholder)',
  marginTop: 4,
  paddingLeft: 40,              /* 아바타(32px) + gap(8px) */
},

/* 유저 타임스탬프 */
timeUser: {
  fontFamily: "var(--font-mono)",
  fontSize: 'var(--text-xs)',
  color: 'var(--text-placeholder)',
  marginTop: 4,
  textAlign: 'right',
},
```

현재 코드는 `{ ...styles.time, textAlign: 'right' }` 방식으로 유저 시간을 처리하고 있다.
AI 시간에 `paddingLeft: 40`을 추가하고, 유저 시간 스타일을 분리한다.

---

## Step 5. `TypingIndicator.tsx` — 아바타 통일

MessageBubble과 동일하게 교체한다.

```tsx
/* Before: Aperture 아이콘 */
/* After: 다크 원 + 골드 링 */

avatar: {
  width: 32,
  height: 32,
  borderRadius: '50%',
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'var(--surface-inverse)',
  marginTop: 2,
},
avatarRing: {
  width: 14,
  height: 14,
  borderRadius: '50%',
  border: '1.5px solid var(--accent-gold)',
},

/* 버블 radius */
/* Before: '4px 16px 16px 16px' */
/* After:  '2px var(--radius-md) var(--radius-md) var(--radius-md)' */

/* 버블 배경 */
/* Before: 'var(--bg-card)', border: '1px solid var(--border-light)' */
/* After:  'var(--surface-card)', border: '1px solid var(--border-default)' */

/* dot 색상 */
/* Before: 'var(--amber)' */
/* After:  'var(--accent-gold)' */
```

`import { Aperture } from 'lucide-react'` 삭제.

---

## Step 6. `ChatInput.tsx` — 입력창 배경 + 전송 버튼 아이콘

### 6-1. 입력창 배경

```tsx
/* Before: background: 'var(--surface-muted)' */
/* After:  background: 'var(--surface-card)'  — 흰색 */
```

### 6-2. 전송 버튼 — 골드 아이콘 → 화이트 아이콘

Send 아이콘 색상을 변경한다. lucide `Send`의 경우 부모 color를 따르므로:

```tsx
/* sendBtn에 color 추가 */
sendBtn: {
  ...
  background: 'var(--surface-inverse)',
  color: 'var(--surface-base)',   /* 화이트에 가까운 크림 화살표 */
  ...
}
```

---

## Step 7. `DevelopBanner.tsx` — CTA 버튼 색상 반전

현재: 다크 배너 + 골드 텍스트 버튼
스펙: 다크 배너 + **크림 배경 + 다크 텍스트** 버튼

```tsx
/* Before */
pill: {
  background: 'var(--accent-gold)',
  color: 'var(--surface-inverse)',
  ...
}

/* After */
pill: {
  background: 'var(--text-inverse)',   /* #e8e2d8 크림색 */
  color: 'var(--text-primary)',         /* #1a1814 다크 */
  fontFamily: "var(--font-mono)",
  fontSize: 'var(--text-sm)',
  fontWeight: 500,
  border: 'none',
  borderRadius: 'var(--radius-sm)',
  padding: '6px 14px',
  whiteSpace: 'nowrap',
  cursor: 'pointer',
  letterSpacing: '0.05em',
}
```

---

## Step 8. `FilmFrame.tsx` — 카드 배경·타이포그래피 교정

### 8-1. 카드 배경색 변경

카드는 `outer` + `body` + `perfs` 세 레이어로 구성된다.
세 레이어를 모두 동일한 따뜻한 다크브라운 계열로 통일해야 한다.
`body`에 gradient를 쓰면 실제 렌더링에서 너무 어둡게 보이므로 단색 사용.

```tsx
outer: {
  background: '#2c2820',   /* 따뜻한 다크브라운 — 스펙 기준값 */
  ...
}

perfs: {
  background: '#221e18',   /* outer보다 약간 어둡게 — 퍼포레이션 영역 강조 */
  borderRight: '1px solid #3a3228',
  ...
}

perfsRight: {
  borderLeft: '1px solid #3a3228',
  ...
}

perf: {  /* 구멍 = 앱 배경색 */
  background: 'var(--surface-base)',   /* #f5f2ed */
  border: '1px solid #3a3228',
}

body: {
  background: '#2c2820',   /* gradient 금지 — 어두워 보임 */
  ...
}
```

> ⚠️ `#0f0c08`, `#161209`, `linear-gradient(#1e1a0f, #161209)` 사용 금지.
> ⚠️ `#4b4a46` 같은 무채색 회색도 금지.

### 8-2. 카드 내부 텍스트 폰트 교정

```tsx
/* 날짜 레이블 — DM Mono, --text-xs (7px) */
dateLabel: {
  fontFamily: "'DM Mono', monospace",
  fontSize: 'var(--text-xs)',   /* 7px */
  color: '#e8c87a',
  opacity: 0.7,
  letterSpacing: '0.1em',
},

/* 제목 — Cormorant Garamond, 20px */
title: {
  fontFamily: "'Cormorant Garamond', 'Noto Serif KR', serif",
  fontSize: 20,
  color: '#e8e2d0',           /* 따뜻한 크림 화이트 */
  fontWeight: 400,
  lineHeight: 1.35,
  marginBottom: 6,
},

/* 본문 미리보기 */
preview: {
  fontSize: 'var(--text-base)',   /* 10px */
  color: '#a09070',
  lineHeight: 1.7,
  fontWeight: 300,
  ...
},

/* 무드 텍스트 */
mood: {
  fontSize: 'var(--text-sm)',   /* 8.5px */
  color: '#b0a080',
  ...
},
```

### 8-3. 색상 대조표 (카드 내부)

```
배경     #2c2820  ████  따뜻한 다크브라운
제목     #e8e2d0  ████  크림 화이트
날짜     #c8a96e  ████  골드 (브랜드 포인트)
본문     #a09070  ████  따뜻한 중간 브라운
서브     #6b5a3e  ████  어두운 골드브라운
테두리   #3a3228  ████  다크 골드브라운
```

---

## Step 9. `MonthDivider.tsx` — 폰트 전면 교체

```tsx
/* Before: Bebas Neue, fontSize: 18, color: amber */
/* After: DM Mono, fontSize: var(--text-md), color: accent-gold */

text: {
  fontFamily: "var(--font-mono)",
  fontSize: 'var(--text-md)',   /* 12px */
  fontWeight: 500,
  color: 'var(--accent-gold)',
  letterSpacing: '0.1em',
},

/* count */
/* Before: Space Mono, fontSize: 10, cream-muted */
/* After:  font-mono, --text-xs, text-placeholder */
count: {
  fontFamily: "var(--font-mono)",
  fontSize: 'var(--text-xs)',   /* 7px */
  color: 'var(--text-placeholder)',
},

/* 구분선 */
/* Before: linear-gradient(90deg, var(--amber-25), transparent) */
/* After:  linear-gradient(90deg, var(--accent-gold), transparent) */
/* opacity: 0.25 */
line: {
  flex: 1,
  height: 1,
  background: 'linear-gradient(90deg, rgba(200,169,110,0.3), transparent)',
},
```

---

## Step 10. `RollProgressBar.tsx` — 배경·폰트 교정

```tsx
/* 배경 */
/* Before: 'var(--bg-card)' → 흰색 */
/* After:  'var(--surface-base)' → 크림 오프화이트 */
wrap: {
  ...
  background: 'var(--surface-base)',
  borderBottom: '1px solid var(--border-default)',
  ...
},

/* 폰트 */
/* Before: "'Space Mono', monospace", fontSize: 9 */
/* After:  "var(--font-mono)", fontSize: 'var(--text-xs)' */

rollNum: {
  fontFamily: "var(--font-mono)",
  fontSize: 'var(--text-xs)',
  color: 'var(--accent-gold)',
  letterSpacing: '0.12em',
  flexShrink: 0,
  opacity: 0.85,
},

progress: {
  fontFamily: "var(--font-mono)",
  fontSize: 'var(--text-xs)',
  color: 'var(--accent-gold-light)',
  flexShrink: 0,
  letterSpacing: '0.04em',
},

total: {
  color: 'var(--text-muted)',
  opacity: 0.5,
},
```

---

## 전체 체크리스트

구현 완료 후 아래 항목을 직접 확인한다.

```
[ ] 배경이 순수 흰색(#fff)이 아닌 #f5f2ed 인가?
[ ] 제목/로고가 Cormorant Garamond italic 22px 인가?
[ ] 탭 폰트가 Noto Sans KR (font-body) 인가? (DM Mono 아님)
[ ] 탭 active border-bottom이 1.5px solid accent-gold 인가?
[ ] TopBar 하단에 10px 높이 필름스트립(구멍 포함)이 있는가?
[ ] AI 아바타가 다크 원 + 골드 링 구조인가? (Aperture 아이콘 없음)
[ ] AI 말풍선 border-radius 좌상단만 2px 인가?
[ ] 유저 말풍선 border-radius 우상단만 2px 인가?
[ ] AI 타임스탬프에 paddingLeft: 40px 들여쓰기가 있는가?
[ ] 타임스탬프 폰트 사이즈가 7px (--text-xs) 인가?
[ ] 입력창 배경이 흰색(surface-card) 인가? (surface-muted 아님)
[ ] 전송 버튼 아이콘이 크림/화이트색 인가? (골드 아님)
[ ] DevelopBanner 버튼이 크림 배경(#e8e2d8) + 다크 텍스트 인가?
[ ] FilmFrame outer·body 배경이 #2c2820 인가? (gradient, #0f0c08, 회색 절대 금지)
[ ] 카드 제목 폰트가 Cormorant Garamond 20px 인가?
[ ] MonthDivider 텍스트가 DM Mono + accent-gold 인가? (Bebas Neue 아님)
[ ] RollProgressBar 배경이 surface-base(#f5f2ed) 인가?
[ ] tokens.css에 --text-xs ~ --text-2xl 변수가 선언됐는가?
[ ] tokens.css에 --space-1 ~ --space-6 변수가 선언됐는가?
[ ] box-shadow가 FAB 버튼 외에 쓰이지 않는가?
[ ] font-weight 600이 Cormorant Garamond 외에 쓰이지 않는가?
```

---

## 커밋 메시지

```
style: apply css spec refinement — typography scale, avatar redesign, film card warmth
```
