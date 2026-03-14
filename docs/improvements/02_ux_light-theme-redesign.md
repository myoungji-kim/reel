# 라이트 테마 디자인 리뉴얼 (Light Theme Redesign)

## 배경

현재 앱은 암실(darkroom) 미학의 다크 테마로 구현되어 있다.
더 현대적이고 밝은 크림/웜 라이트 테마로 전면 리디자인한다.

**변경 범위: 프론트엔드 전용. 백엔드 변경 없음.**

---

## 전략: Alias 방식으로 최소 변경

컴포넌트 전체를 수정하는 대신 **`tokens.css`에서 구 변수명이 새 값을 가리키도록** alias를 유지한다.
단, 하드코딩된 색상값(`#131008`, `#1e1a0f` 등)이 박힌 컴포넌트는 직접 수정한다.

---

## 관련 파일

- `frontend/src/styles/tokens.css` ← 핵심 변경
- `frontend/src/styles/index.css` ← 폰트 import, body 스타일 변경
- `frontend/src/components/layout/TopBar.tsx` ← 로고 폰트
- `frontend/src/components/frame/FilmFrame.tsx` ← 필름 카드 하드코딩 색상
- `frontend/src/components/chat/MessageBubble.tsx` ← 말풍선 하드코딩 색상
- `frontend/src/components/chat/ChatInput.tsx` ← 입력창
- `frontend/src/components/chat/DevelopBanner.tsx` ← CTA 배너
- `frontend/src/components/overlays/DevelopingOverlay.tsx` ← 현상 오버레이
- `frontend/src/pages/LoginPage.tsx` ← 로그인 페이지

---

## Step 1. `tokens.css` 전면 교체

아래 내용으로 `frontend/src/styles/tokens.css`를 **완전히 교체**한다.

```css
:root {
  /* ─────────────────────────────
     SURFACE (배경 계층) — 신규 변수
  ───────────────────────────── */
  --surface-base:       #f5f2ed;
  --surface-card:       #ffffff;
  --surface-muted:      #ede9e2;
  --surface-inverse:    #1a1814;

  /* ─────────────────────────────
     TEXT (텍스트 계층) — 신규 변수
  ───────────────────────────── */
  --text-primary:       #1a1814;
  --text-secondary:     #3a3530;
  --text-muted:         #7a6e5e;
  --text-placeholder:   #b0a898;
  --text-inverse:       #e8e2d8;
  --text-inverse-muted: #7a7060;

  /* ─────────────────────────────
     BORDER (선) — 신규 변수
  ───────────────────────────── */
  --border-default:     #e4dfd6;
  --border-muted:       #2a2318;

  /* ─────────────────────────────
     ACCENT (브랜드 포인트) — 신규 변수
  ───────────────────────────── */
  --accent-gold:        #c8a96e;
  --accent-gold-light:  #e8c87a;   /* 라이트 배경에서 가독성을 위해 원안보다 살짝 어둡게 조정 */
  --accent-green-bg:    #e8f0e6;
  --accent-green-text:  #4a7040;

  /* ─────────────────────────────
     TYPOGRAPHY — 신규 변수
  ───────────────────────────── */
  --font-display: 'Cormorant Garamond', serif;
  --font-mono:    'DM Mono', monospace;
  --font-body:    'Noto Sans KR', sans-serif;

  /* ─────────────────────────────
     RADIUS — 신규 변수
  ───────────────────────────── */
  --radius-sm:    8px;
  --radius-md:    12px;
  --radius-lg:    14px;
  --radius-full:  9999px;

  /* ─────────────────────────────
     SHADOW — 신규 변수
  ───────────────────────────── */
  --shadow-fab: 0 2px 10px rgba(0, 0, 0, 0.15);

  /* ─────────────────────────────
     LEGACY ALIASES
     구 컴포넌트 코드와의 호환성 유지.
     기존 var(--bg), var(--amber) 등이 새 값을 참조한다.
  ───────────────────────────── */

  /* 배경 */
  --bg:          var(--surface-base);
  --bg-mid:      var(--surface-muted);
  --bg-card:     var(--surface-card);

  /* 테두리 */
  --border:       var(--border-default);
  --border-light: #d4cfc6;   /* surface-card보다 살짝 어두운 중간 보더 */

  /* 앰버 (accent-gold 계열로 리맵) */
  --amber:        var(--accent-gold);
  --amber-light:  var(--accent-gold-light);
  --amber-pale:   #f0dfa0;

  /* 앰버 알파 변형 — accent-gold RGB(200,169,110) 기반으로 재산출 */
  --amber-07:  rgba(200, 169, 110, 0.07);
  --amber-15:  rgba(200, 169, 110, 0.15);
  --amber-20:  rgba(200, 169, 110, 0.20);
  --amber-25:  rgba(200, 169, 110, 0.25);
  --amber-30:  rgba(200, 169, 110, 0.30);
  --amber-35:  rgba(200, 169, 110, 0.35);

  /* 텍스트 */
  --cream:       var(--text-primary);
  --cream-dim:   var(--text-secondary);
  --cream-muted: var(--text-muted);

  /* 기타 */
  --fade-green:  var(--accent-green-text);
  --error:       #c0624a;
  --error-border: rgba(192, 98, 74, 0.4);

  --redevelop-bg:     rgba(100, 120, 180, 0.07);
  --redevelop-border: rgba(100, 120, 180, 0.3);

  /* 오버레이 — 라이트 테마에서도 오버레이는 어둡게 유지 */
  --overlay-bg:  rgba(10, 8, 5, 0.96);
  --overlay-dim: rgba(10, 8, 5, 0.75);

  /* 필름 */
  --film-tint:          rgba(245, 242, 237, 0.02);
  --film-grain-opacity: 0.20;   /* 라이트 배경 위에서는 그레인 약하게 */
}
```

---

## Step 2. `index.css` 폰트 import 변경

`frontend/src/styles/index.css` 상단의 Google Fonts import 줄을 교체한다.

```css
/* Before */
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=VT323&family=Noto+Sans+KR:wght@300;400;500&family=Noto+Serif+KR:wght@300;400&family=Space+Mono:wght@400;700&display=swap');

/* After */
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Mono:wght@400;500&family=Noto+Sans+KR:wght@300;400;500&family=Noto+Serif+KR:wght@300;400&display=swap');
```

그리고 `body` 스타일의 `color`를 수정한다.

```css
/* Before */
body {
  background: var(--bg);
  font-family: 'Noto Sans KR', sans-serif;
  color: var(--cream);
}

/* After */
body {
  background: var(--surface-base);
  font-family: var(--font-body);
  color: var(--text-primary);
}
```

스크롤바도 라이트 테마에 맞게 수정한다.

```css
/* Before */
::-webkit-scrollbar-thumb {
  background: var(--border-light);
  border-radius: 2px;
}

/* After */
::-webkit-scrollbar-thumb {
  background: var(--border-default);
  border-radius: 2px;
}
```

`devFlash` 애니메이션의 다크 배경값을 교체한다.

```css
/* Before */
@keyframes devFlash {
  0%, 100% { opacity: 0.2; background: var(--bg-mid); }
  50%       { opacity: 1;   background: rgba(212, 130, 42, 0.15); }
}

/* After */
@keyframes devFlash {
  0%, 100% { opacity: 0.2; background: var(--surface-muted); }
  50%       { opacity: 1;   background: rgba(200, 169, 110, 0.15); }
}
```

---

## Step 3. `TopBar.tsx` — 로고 폰트 교체

```tsx
/* Before */
logo: {
  fontFamily: "'Bebas Neue', sans-serif",
  fontSize: 26,
  color: 'var(--amber-pale)',
  ...
}

/* After */
logo: {
  fontFamily: "var(--font-display)",
  fontWeight: 600,
  fontStyle: 'italic',
  fontSize: 28,
  color: 'var(--text-primary)',
  letterSpacing: '0.04em',
  ...
}
```

탭 버튼 폰트도 교체한다.

```tsx
/* Before: fontFamily: "'Space Mono', monospace" */
/* After:  fontFamily: "var(--font-mono)" */
```

드롭다운 아이템 폰트도 동일하게 교체한다.

---

## Step 4. `FilmFrame.tsx` — 하드코딩 색상 교체

필름 카드는 브랜드 요소로 **다크 배경을 유지**한다 (라이트 앱 위에 필름 네거티브처럼 배치).
단, 카드 외곽 테두리는 라이트 테마의 보더 색상으로 조정한다.

### 4-1. `outer` 스타일

```tsx
/* Before */
outer: {
  background: '#0f0c08',
  border: '1.5px solid var(--border)',
  ...
}

/* After */
outer: {
  background: '#0f0c08',
  border: '1.5px solid rgba(200, 169, 110, 0.25)',   /* 라이트 앱 위에서 카드 테두리 */
  ...
}
```

### 4-2. `body` 스타일

변경 없음 — 필름 카드 내부 배경(어두운 그라디언트)은 유지한다.

### 4-3. skeleton 배경

shimmer 애니메이션의 배경 gradient는 필름 카드이므로 변경 없음.

### 4-4. `perf` (퍼포레이션)

```tsx
/* Before */
perf: {
  background: 'var(--bg)',   /* --bg가 이제 #f5f2ed를 가리킴 → 라이트 색이 되어버림 */
  ...
}

/* After */
perf: {
  background: '#131008',   /* 필름 카드 내부이므로 다크 고정 */
  ...
}
```

### 4-5. `perfs` (퍼포레이션 사이드바)

```tsx
/* Before: background: '#0a0806' */
/* After:  background: '#0a0806' (변경 없음) */
```

### 4-6. `dateLabel`, `frameNumInline`

필름 카드 내부 텍스트는 다크 배경 위 크림색이므로 변경 없음.
(카드 내부에서는 `--cream-*` 변수가 현재 `--text-*`로 alias되는데,
카드 내부 텍스트는 **하드코딩**으로 교체해서 라이트 alias의 영향을 받지 않도록 한다.)

```tsx
/* dateLabel */
color: '#e8c87a',   /* 구 --amber-light */
opacity: 0.7,

/* frameNumInline */
color: '#9a8a70',   /* 구 --cream-muted */
opacity: 0.55,

/* title */
color: '#f2e8d0',   /* 구 --cream */

/* preview */
color: '#c8b898',   /* 구 --cream-dim */

/* metaRight 내 북마크 아이콘 */
/* Bookmark 아이콘: style={{ color: '#c8a96e', opacity: 0.9 }} */

/* mood */
color: '#9a8a70',

/* statusDone */
color: '#7a9e8a',

/* statusQuick */
color: '#e8c87a',
```

### 4-7. `outerBookmarked` (개선 1에서 추가된 스타일)

```tsx
/* 변경 없음 — rgba(196, 160, 80, 0.55) */
```

---

## Step 5. `MessageBubble.tsx` — 말풍선

### 5-1. 유저 말풍선

라이트 테마에서 유저 말풍선은 `--surface-inverse`(다크)를 배경으로 사용한다.

```tsx
/* Before */
bubbleUser: {
  background: 'var(--amber-15)',
  border: '1px solid var(--amber-25)',
  color: 'var(--cream)',
  borderRadius: '16px 4px 16px 16px',
  ...
}

/* After */
bubbleUser: {
  background: 'var(--surface-inverse)',
  border: 'none',
  color: 'var(--text-inverse)',
  borderRadius: '16px 4px 16px 16px',
  ...
}
```

### 5-2. AI 말풍선

```tsx
/* Before */
bubbleAi: {
  background: 'var(--bg-card)',
  border: '1px solid var(--border-light)',
  color: 'var(--cream-dim)',
  ...
}

/* After */
bubbleAi: {
  background: 'var(--surface-card)',
  border: '1px solid var(--border-default)',
  color: 'var(--text-secondary)',
  ...
}
```

### 5-3. 아바타

```tsx
/* Before: background: 'linear-gradient(135deg, var(--amber), #8a5a1a)', color: 'var(--bg)' */
/* After:  background: 'var(--surface-inverse)', color: 'var(--accent-gold)' */
```

### 5-4. 타임스탬프

```tsx
/* Before: fontFamily: "'Space Mono', monospace" */
/* After:  fontFamily: "var(--font-mono)" */
```

---

## Step 6. `ChatInput.tsx` — 입력창

### 6-1. 컨테이너

```tsx
/* Before: borderTop: '1px solid var(--border)', background: 'var(--bg)' */
/* After:  borderTop: '1px solid var(--border-default)', background: 'var(--surface-base)' */
```

### 6-2. textarea

```tsx
/* Before */
input: {
  background: 'var(--bg-card)',
  border: '1px solid var(--border-light)',
  color: 'var(--cream)',
  borderRadius: 20,
  ...
}

/* After */
input: {
  background: 'var(--surface-muted)',
  border: '1px solid var(--border-default)',
  color: 'var(--text-primary)',
  borderRadius: 'var(--radius-full)',
  ...
}
```

placeholder 색상은 `::placeholder` CSS로 별도 처리하거나 `input` 스타일 객체에 추가 불가 → `index.css`에 아래를 추가한다.

```css
textarea::placeholder,
input::placeholder {
  color: var(--text-placeholder);
}
```

### 6-3. 전송 버튼

```tsx
/* Before: background: 'linear-gradient(135deg, var(--amber-light), var(--amber))' */
/* After:  background: 'var(--surface-inverse)', boxShadow: 'var(--shadow-fab)' */
/* color: var(--accent-gold) → Send 아이콘 색상 */
```

---

## Step 7. `DevelopBanner.tsx` — CTA 배너

```tsx
/* Before */
banner: {
  background: 'var(--amber-07)',
  border: '1px dashed var(--amber-30)',
}

/* After */
banner: {
  background: 'var(--surface-inverse)',
  border: 'none',
  borderRadius: 'var(--radius-md)',
}

/* Before: text color: 'var(--cream-dim)' */
/* After:  text color: 'var(--text-inverse-muted)' */

/* Before: strong color: 'var(--amber-light)' */
/* After:  strong color: 'var(--text-inverse)' */

/* Before: pill background: 'linear-gradient(135deg, var(--amber-light), var(--amber))' */
/* After:  pill background: 'var(--accent-gold)', color: 'var(--surface-inverse)' */
```

---

## Step 8. `Space Mono` → `DM Mono` 전역 교체

아래 컴포넌트들에서 `"'Space Mono', monospace"` → `"var(--font-mono)"` 로 교체한다.
각 파일에서 일괄 replace 하면 된다.

- `frontend/src/pages/RollPage.tsx`
- `frontend/src/components/frame/FilmFrame.tsx` — **단, 필름 카드 내부는 Space Mono 유지** (필름 미학 요소)
- `frontend/src/components/frame/FrameOverlay.tsx`
- `frontend/src/components/frame/RollDivider.tsx`
- `frontend/src/components/frame/MonthDivider.tsx`
- `frontend/src/components/frame/RollProgressBar.tsx`
- `frontend/src/components/chat/TypingIndicator.tsx`
- `frontend/src/components/overlays/*.tsx`

필름 카드(`FilmFrame.tsx`) 내부의 NEG 넘버링, 날짜 텍스트는 Space Mono 유지 → 필름 네거티브 감성 보존.

---

## Step 9. `Noto Serif KR` → `Cormorant Garamond` 교체 여부 결정

현재 `Noto Serif KR`은 `FilmFrame.tsx`의 제목 텍스트(`--font-display`), `FrameOverlay.tsx`에서 사용된다.
`Cormorant Garamond`는 라틴 문자 전용이므로 한국어 글자는 폴백(`Noto Serif KR`)으로 처리된다.

영문 제목이 주로 표시될 경우: `var(--font-display)` 사용
한국어 제목이 주: `'Noto Serif KR', serif` 유지

**권장:** 모든 serif 텍스트를 `'Cormorant Garamond', 'Noto Serif KR', serif`로 변경해 영문은 Cormorant, 한국어는 Noto Serif로 자동 폴백.

```tsx
fontFamily: "'Cormorant Garamond', 'Noto Serif KR', serif"
```

적용 대상:
- `FilmFrame.tsx` → `title`, `titleRetro`
- `FrameOverlay.tsx` → 제목 텍스트 영역

---

## 검증 체크리스트

### 시각적 검증

- [ ] 앱 전체 배경이 크림/웜 라이트 (`#f5f2ed`)로 변경됨
- [ ] 로고 "REEL"이 Cormorant Garamond italic 폰트로 표시됨
- [ ] 유저 말풍선이 다크 인버스 배경(`#1a1814`) + 크림 텍스트로 표시됨
- [ ] AI 말풍선이 화이트 카드 배경 + 어두운 텍스트로 표시됨
- [ ] 채팅 입력창이 뮤트 크림 배경 + 둥근 모서리로 표시됨
- [ ] 전송 버튼이 다크 원형 버튼으로 표시됨
- [ ] DevelopBanner가 다크 CTA 박스로 표시됨
- [ ] 필름 카드(FilmFrame)가 다크 배경을 유지하며 라이트 앱 위에 배치됨
- [ ] 필름 카드 퍼포레이션 구멍이 어두운 색으로 유지됨 (라이트 색 아님)
- [ ] 탭 바(TopBar) 배경이 크림색, 텍스트가 어두운 색으로 표시됨
- [ ] RollPage 필터바의 텍스트/버튼이 라이트 배경에서 가독성 있게 표시됨

### 기능 검증

- [ ] 북마크 활성 칩 `border`/`color` 가독성 확인
- [ ] `focus-visible` outline이 `--accent-gold` 색상으로 표시됨
- [ ] 스크롤바 색상이 라이트 테마와 어울림
- [ ] 오버레이(FrameOverlay, ArchivedSheet 등)가 여전히 다크 배경으로 표시됨
- [ ] 오버레이 내부 텍스트 가독성 확인 (다크 배경 + 텍스트 alias 변경으로 인한 색 반전 여부)

### ⚠️ 주의: 오버레이 내부 텍스트 색상 역전 가능성

`--cream` → `--text-primary`(#1a1814 다크) alias로 인해,
다크 오버레이 내부에서 `var(--cream)` 또는 `var(--text-primary)` 를 쓰는 요소가
**배경과 텍스트 모두 어두워지는 역전 현상**이 발생할 수 있다.

해결 방법: 오버레이 컴포넌트(`FrameOverlay.tsx`, `ArchivedSheet.tsx`, `QuickNoteSheet.tsx` 등)의
텍스트 색상을 `var(--text-inverse)` 또는 하드코딩(`#f2e8d0`, `#c8b898`)으로 명시한다.

**구체적으로 확인해야 할 파일:**
- `frontend/src/components/frame/FrameOverlay.tsx`
- `frontend/src/components/overlays/ArchivedSheet.tsx`
- `frontend/src/components/overlays/QuickNoteSheet.tsx`
- `frontend/src/components/overlays/PreviewOverlay.tsx`
- `frontend/src/pages/LoginPage.tsx`

---

## 커밋 메시지

```
redesign: migrate to warm light theme with updated design tokens and typography
```
