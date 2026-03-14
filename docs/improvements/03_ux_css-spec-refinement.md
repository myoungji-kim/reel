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
6. 폰트 굵기: body/mono는 400·500까지만, display(Noto Serif KR)는 600까지 허용
7. **한글 포함 텍스트에 DM Mono / Cormorant 단독 사용 금지**
   - 한글 제목 → `'Noto Serif KR', serif`
   - 한글 포함 버튼 → `'DM Mono', 'Noto Sans KR', monospace`
8. **감정 컬러바 색상은 대비 기준 미적용 (장식 요소)** — 변경 금지

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

## Step 1. `tokens.css` — 변수 스케일 추가 + 색상 교정

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

대비율 AA 기준을 충족하도록 색상을 교정한다.

```css
/* --accent-gold: WCAG AA 대비율 5.2:1 달성 */
--accent-gold: #7a5c20;         /* Before: #c8a96e */

/* --text-muted: WCAG AA 대비율 5.8:1 달성 */
--text-muted: #5a5048;          /* Before: #7a6e5e */

/* --font-display: 한글 지원 Noto Serif KR */
--font-display: 'Noto Serif KR', serif;   /* Before: 'Cormorant Garamond', serif */

/* --accent-gold-light 교정 */
--accent-gold-light: #ffe6a0;   /* Before: #e8c87a */
```

> ⚠️ 감정 컬러바(`getMoodBarColor`)의 하드코딩된 색상은 장식 요소이므로 변경 금지.

---

## Step 2. `index.css` — 폰트 import 교정

```css
/* Before */
@import url('...Cormorant+Garamond...');

/* After — Cormorant Garamond 제거, Noto Serif KR 추가 */
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;600&family=DM+Mono:wght@300;400;500&family=Noto+Sans+KR:wght@300;400;500&display=swap');
```

### 폰트 사용 규칙

| 텍스트 종류 | font-family |
|---|---|
| 영문·숫자만 (날짜, 넘버, 월헤더, 시간) | `'DM Mono', monospace` |
| 한글 제목, 본문 입력 필드 | `'Noto Serif KR', serif` |
| 한글 포함 버튼, 태그 | `'DM Mono', 'Noto Sans KR', monospace` |
| 말풍선, 카드 본문, 일반 body | `'Noto Sans KR', sans-serif` |

> ⚠️ 한글 텍스트에 DM Mono 단독 사용 시 궁서체/굴림체로 fallback됨 — 반드시 Noto Sans KR 혼합.

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

## Step 8. `FilmFrame.tsx` — 카드 배경·감정컬러바·타이포그래피

### 핵심 원칙
- 카드 배경은 항상 `var(--surface-muted)` `#ede8e2` 고정. 감정에 따라 절대 바뀌지 않음.
- 감정은 좌측 **3px 컬러바** 하나로만 표현.

### 8-1. 카드 구조 (좌→우 순서)

```
[emotionBar 3px] + [perfs 18px] + [body flex:1] + [perfs 18px]
```

```tsx
outer: {
  background: 'var(--surface-muted)',
  border: '1px solid var(--border-default)',
  borderRadius: 10,
  display: 'flex',
  overflow: 'hidden',
},

emotionBar: {
  width: 3,
  flexShrink: 0,
  /* background는 getMoodBarColor(frame.mood) 로 인라인 설정 */
},

perfs: {
  width: 18,
  background: 'var(--surface-muted)',
  padding: '8px 0',
  justifyContent: 'space-evenly',
},

perf: {
  width: 9,
  height: 7,
  borderRadius: 2,
  background: 'var(--surface-base)',    /* 구멍 = 앱 배경색 */
  border: '1px solid #ddd8d0',          /* 대비 강화 필수 */
},

body: {
  flex: 1,
  padding: '12px 12px 10px 8px',
  background: 'var(--surface-muted)',
},
```

### 8-2. 감정 컬러 시스템 (`moodTone.ts`)

```ts
export function getMoodBarColor(mood: string | null | undefined): string {
  switch (mood) {
    case '기쁨': case '설렘':   return '#c8a96e'  // 골드 — 브랜드 컬러
    case '감사':                 return '#c4866a'  // 테라코타
    case '피곤': case '무기력': return '#9a9a8e'  // 모스그레이
    case '슬픔': case '외로움': return '#7a8fa6'  // 스틸블루
    case '평온':                 return '#8aaa8a'  // 세이지그린
    default:                     return 'transparent'
  }
}
```

### 8-3. 카드 내부 텍스트

```tsx
/* 날짜 — 왼쪽, 프레임넘버 — 오른쪽 (space-between) */
metaRow: { justifyContent: 'space-between' }
dateLabel:      { fontSize: 8.5, color: 'var(--accent-gold)' }
frameNumInline: { fontSize: 8.5, color: 'var(--text-placeholder)' }

title: {
  fontFamily: "var(--font-display)",
  fontSize: 19,
  fontWeight: 600,
  color: 'var(--text-primary)',
  lineHeight: 1.2,
  letterSpacing: '-0.01em',
}

preview: {
  fontSize: 10,
  color: 'var(--text-muted)',
  lineHeight: 1.75,
  fontWeight: 300,
}

/* status 버튼 — 아웃라인 스타일 */
status: {
  fontSize: 8.5,
  padding: '6px 12px',
  minHeight: 28,
  border: '1px solid #d8cdb0',
  background: 'transparent',
  color: 'var(--accent-gold)',
}
```

### 8-4. 색상 대조표 (확정)

```
앱 배경   #f5f2ed  ████  --surface-base
카드 배경  #ede8e2  ████  --surface-muted
구멍      #f5f2ed  ████  --surface-base + border #ddd8d0
날짜      #c8a96e  ████  --accent-gold
제목      #1a1814  ████  --text-primary
본문      #7a6e5e  ████  --text-muted
서브넘    #b0a898  ████  --text-placeholder
감정-설렘  #c8a96e  ████  골드
감정-감사  #c4866a  ████  테라코타
감정-피곤  #9a9a8e  ████  모스그레이
감정-슬픔  #7a8fa6  ████  스틸블루
감정-평온  #8aaa8a  ████  세이지그린
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
— 색상 —
[ ] --accent-gold가 #7a5c20 인가? (#c8a96e 이면 교체)
[ ] --text-muted가 #5a5048 인가? (#7a6e5e 이면 교체)
[ ] 감정 컬러바(getMoodBarColor)의 #c8a96e, #c4866a 등은 변경되지 않았는가?

— 폰트 —
[ ] @import에 Cormorant Garamond가 없는가?
[ ] @import에 Noto Serif KR이 있는가?
[ ] --font-display가 'Noto Serif KR' 인가?
[ ] 카드 제목 font-family가 var(--font-display) → Noto Serif KR 인가?
[ ] 한글 포함 버튼이 'DM Mono', 'Noto Sans KR' 혼합인가?
[ ] 굴림체·궁서체·바탕체가 화면 어디에도 보이지 않는가?

— 카드 구조 —
[ ] 배경이 #f5f2ed (surface-base) 인가?
[ ] 탭 폰트가 Noto Sans KR (font-body) 인가?
[ ] TopBar 하단에 10px 높이 필름스트립이 있는가?
[ ] AI 아바타가 다크 원 + 골드 링 구조인가?
[ ] 카드 배경이 surface-muted(#ede8e2) 로 고정인가? (감정에 따라 달라지면 안 됨)
[ ] 감정이 3px emotionBar 하나로만 표현되는가?
[ ] .perf에 border: 1px solid #ddd8d0 이 있는가?
[ ] metaRow가 space-between (날짜 왼쪽, 넘버 오른쪽) 인가?
[ ] 제목이 Noto Serif KR 19px/600 인가?
[ ] status 버튼 min-height 28px, 아웃라인 스타일인가?
[ ] MonthDivider 텍스트가 DM Mono + accent-gold 인가?
[ ] RollProgressBar 배경이 surface-base(#f5f2ed) 인가?
[ ] tokens.css에 --text-xs ~ --text-2xl 변수가 선언됐는가?
[ ] box-shadow가 FAB 버튼 외에 쓰이지 않는가?
```

---

## 커밋 메시지

```
style: apply css spec refinement — typography scale, avatar redesign, film card warmth
```
