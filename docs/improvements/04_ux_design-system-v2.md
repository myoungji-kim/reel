# Reel — 디자인 시스템 완전 스펙 (All-in-One)
> 이 파일 하나로 전체 UI 구현 가능. 이전 스펙 파일들은 모두 무시하고 이 파일만 사용.

---

## 0. 서비스 컨셉

Reel은 **"AI와 하루를 나누고, 감성적인 일기 한 장으로 현상하는"** 앱.
필름 카메라로 사진을 찍고 현상하듯, 하루의 기억을 대화로 남기고 일기로 현상하는 경험.

감성 키워드: `아날로그 필름` `조용한 일상` `따뜻한 기록` `서정적` `맑고 차분한`

---

## 1. 디자인 토큰

### 1-1. 컬러
```css
:root {
  /* Surface */
  --surface-base:    #F0EEE9;   /* 앱 전체 배경 — Cloud Dancer */
  --surface-card:    #ffffff;   /* AI 말풍선, 흰 카드 */
  --surface-muted:   #E4E1DA;   /* 벤토 셀, 이전기록 카드, 필름 카드 */
  --surface-inverse: #2a2620;   /* 유저 말풍선, FAB, CTA 배경 */

  /* Text */
  --text-primary:       #2a2620;
  --text-secondary:     #5a5248;
  --text-muted:         #9a9080;
  --text-placeholder:   #b8b0a4;
  --text-inverse:       #F0EEE9;
  --text-inverse-muted: #7a7060;

  /* Border */
  --border-default: rgba(42,38,32,0.12);
  --border-mid:     rgba(42,38,32,0.20);

  /* Brand */
  --gold:       #7a5c20;   /* 텍스트용 골드 — 대비 확보 */
  --gold-light: #c8a96e;   /* 장식용 골드 (컬러바, 도트) */
  --gold-pale:  #f5eed8;   /* 골드 배경 틴트 */

  /* 감정 컬러 (컬러바 전용 — 텍스트에 쓰지 말 것) */
  --emotion-joy:   #c8a96e;   /* 설렘·기쁨 */
  --emotion-warm:  #c4866a;   /* 감사·따뜻함 */
  --emotion-tired: #9a9a8e;   /* 피곤·무기력 */
  --emotion-sad:   #7a8fa6;   /* 슬픔·그리움 */
  --emotion-calm:  #8aaa8a;   /* 평온·맑음 */
}
```

### 1-2. 폰트
```css
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:ital,wght@0,400;0,600;1,400;1,600&family=Noto+Sans+KR:wght@300;400;500&family=DM+Mono:wght@300;400;500&display=swap');

/* 사용 규칙 */
/* 제목·로고·현상결과 본문 → Noto Serif KR */
/* 일반 UI·말풍선·태그·버튼 → Noto Sans KR */
/* 날짜·NEG넘버·레이블·시간 → DM Mono */
/* 한글 포함 버튼 → 'DM Mono', 'Noto Sans KR', monospace (혼합 필수) */

/* 절대 금지: Cormorant Garamond, Inter, Roboto, Pretendard, 시스템폰트 단독 */
```

### 1-3. 공통 규칙
```
- 모든 border: 0.5~1px, rgba(42,38,32,0.12~0.20)
- box-shadow: FAB 버튼 한 곳만 허용 (0 2px 10px rgba(42,38,32,0.22))
- font-weight: 300/400/500/600 만 사용 (700 금지)
- border-radius: 카드 10~14px, 말풍선 12px, 태그 8px, FAB 50%
- 굴림체·궁서체·바탕체 절대 금지
```

### 1-4. Grain 텍스처 (모든 화면 공통)
```css
/* 모든 화면 루트에 추가 — 인화지 느낌 */
.grain-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 100;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.045'/%3E%3C/svg%3E");
  background-size: 128px 128px;
  mix-blend-mode: multiply;
}
/* 부모에 position: relative 필수 */
```

### 1-5. 필름스트립 (상하단 공통)
```css
.filmstrip {
  height: 20px;
  background: var(--surface-base);
  border-top: 1px solid var(--border-default);
  border-bottom: 1px solid var(--border-default);
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 2px 4px;
  overflow: hidden;
}
.filmstrip-row { display: flex; gap: 2px; }
.film-hole {
  width: 10px; height: 6px;
  border: 1px solid var(--border-mid);
  border-radius: 1px;
  flex-shrink: 0;
}
/* 온보딩 화면: 상단 + 하단 모두 배치, 화면 끝에 딱 붙어야 함 */
/* top: 0 / bottom: 0 — 잘리거나 띄워지면 안 됨 */
```

---

## 2. 앱 구조 & 라우팅

```
App
├── 현상소 (홈)          /home
├── 필름롤               /filmroll
│   ├── ROLL 탭
│   └── GRID 탭
├── 하루 현상 (채팅)     /develop   ← FAB 진입, 탭 아님
│   └── 현상 결과        /develop/result
├── 즐겨찾기             /favorites
└── 나                   /profile
```

**FAB 진입 규칙**: 하루 현상은 router.push('/develop') — activeTab 변경 없음.
뒤로가기 시 이전 탭으로 복귀.

---

## 3. 바텀 탭바 (Glassmorphism — 전체 공통)

### 탭 구성
```
현상소 | 필름롤 | [◎ 현상 FAB] | 즐겨찾기 | 나
```

### CSS
```css
.bottom-nav {
  height: 56px;
  position: relative;
  border-top: 1px solid rgba(42,38,32,0.08);
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 8px;
  padding-bottom: env(safe-area-inset-bottom, 6px);
  flex-shrink: 0;
}
.bottom-nav::before {
  content: '';
  position: absolute; inset: 0;
  background: rgba(240,238,233,0.75);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  z-index: 0;
}
.nav-item {
  display: flex; flex-direction: column;
  align-items: center; gap: 3px;
  flex: 1; cursor: pointer;
  position: relative; z-index: 1;
  padding: 4px 0;
  -webkit-tap-highlight-color: transparent;
}
.nav-icon svg {
  width: 20px; height: 20px;
  fill: none; stroke: #9a9080;
  stroke-width: 1.5px; stroke-linecap: round; stroke-linejoin: round;
}
.nav-item.active .nav-icon svg { stroke: #2a2620; }
.nav-label {
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 9px; color: #9a9080;
}
.nav-item.active .nav-label { color: #2a2620; font-weight: 500; }

/* FAB */
.nav-fab {
  position: relative; display: flex; flex-direction: column;
  align-items: center; gap: 3px; flex: 1; z-index: 2; cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.fab-circle {
  position: absolute; top: -16px;
  width: 48px; height: 48px; border-radius: 50%;
  background: #2a2620;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 2px 10px rgba(42,38,32,0.22);
}
.fab-circle svg {
  width: 20px; height: 20px; fill: none;
  stroke: #F0EEE9; stroke-width: 1.8px; stroke-linecap: round;
}
.fab-label { margin-top: 20px; font-family: 'Noto Sans KR', sans-serif; font-size: 9px; color: #9a9080; }
```

### HTML
```html
<nav class="bottom-nav">
  <div class="nav-item active" data-tab="home">
    <div class="nav-icon">
      <svg viewBox="0 0 20 20"><path d="M3 9.5L10 3l7 6.5V17a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/></svg>
    </div>
    <span class="nav-label">현상소</span>
  </div>
  <div class="nav-item" data-tab="filmroll">
    <div class="nav-icon">
      <svg viewBox="0 0 20 20"><rect x="3" y="4" width="14" height="13" rx="2"/><path d="M7 4V2M13 4V2M3 8h14"/></svg>
    </div>
    <span class="nav-label">필름롤</span>
  </div>
  <div class="nav-fab" data-action="develop">
    <div class="fab-circle">
      <svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="3"/><path d="M3 10a7 7 0 1014 0A7 7 0 003 10z" opacity=".4"/><path d="M10 2v2.5M10 15.5V18M2 10h2.5M15.5 10H18"/></svg>
    </div>
    <span class="fab-label">현상</span>
  </div>
  <div class="nav-item" data-tab="favorites">
    <div class="nav-icon">
      <svg viewBox="0 0 20 20"><path d="M5 3h10a1 1 0 011 1v13l-6-3-6 3V4a1 1 0 011-1z"/></svg>
    </div>
    <span class="nav-label">즐겨찾기</span>
  </div>
  <div class="nav-item" data-tab="profile">
    <div class="nav-icon">
      <svg viewBox="0 0 20 20"><circle cx="10" cy="7" r="3"/><path d="M4 17c0-3.3 2.7-6 6-6s6 2.7 6 6"/></svg>
    </div>
    <span class="nav-label">나</span>
  </div>
</nav>
```

### 화면별 활성 탭
| 화면 | 활성 탭 |
|---|---|
| 현상소 | 현상소 |
| 필름롤 ROLL/GRID | 필름롤 |
| 하루 현상·현상 결과 | 이전 탭 유지 (FAB만 강조) |
| 즐겨찾기 | 즐겨찾기 |
| 나 | 나 |

---

## 4. 홈 화면 (벤토 그리드)

### CSS
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

/* 벤토 그리드 — 반드시 CSS Grid로 구현 (flex 금지) */
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

/* Streak 도트 */
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

/* Mood Flow 바 차트 */
.mood-bars { display: flex; gap: 4px; align-items: flex-end; height: 28px; margin-top: 8px; }
.mood-bar { width: 10px; border-radius: 3px 3px 0 0; flex-shrink: 0; }
.mood-bar.empty { background: var(--border-default); height: 6px; }

/* 이전 기록 */
.prev-record-card {
  margin: 0 16px 8px; background: var(--surface-muted);
  border-radius: 12px; padding: 11px 14px;
  display: flex; align-items: center; justify-content: space-between;
  border: 1px solid var(--border-default); cursor: pointer;
}
.prev-title { font-family: 'Noto Sans KR', sans-serif; font-size: 11px; font-weight: 500; color: var(--text-primary); }
.prev-date  { font-family: 'DM Mono', monospace; font-size: 8px; color: var(--text-muted); margin-top: 2px; }
```

### 벤토 셀 구성
```html
<div class="bento-grid">
  <!-- STREAK: tall + dark -->
  <div class="bento-cell tall dark">
    <div class="grain-overlay"></div>
    <div class="bento-label">STREAK</div>
    <div class="bento-value">14일</div>
    <div class="bento-sub">연속 기록 중</div>
    <div class="streak-dots">
      <div class="s-dot joy"></div>
      <div class="s-dot warm"></div>
      <div class="s-dot calm"></div>
      <div class="s-dot joy"></div>
      <div class="s-dot tired"></div>
      <div class="s-dot"></div>
      <div class="s-dot"></div>
    </div>
  </div>
  <!-- TODAY: gold -->
  <div class="bento-cell gold">
    <div class="grain-overlay"></div>
    <div class="bento-label">TODAY</div>
    <div class="bento-value">설렘</div>
    <div class="bento-sub">오늘의 감정</div>
  </div>
  <!-- THIS MONTH: 기본 -->
  <div class="bento-cell">
    <div class="grain-overlay"></div>
    <div class="bento-label">THIS MONTH</div>
    <div class="bento-value">8</div>
    <div class="bento-sub">frames</div>
  </div>
  <!-- MOOD FLOW: wide -->
  <div class="bento-cell wide">
    <div class="grain-overlay"></div>
    <div class="bento-label">MOOD FLOW</div>
    <div class="mood-bars">
      <div class="mood-bar" style="height:10px;background:var(--emotion-tired);"></div>
      <div class="mood-bar" style="height:16px;background:var(--emotion-warm);"></div>
      <div class="mood-bar" style="height:8px;background:var(--emotion-sad);"></div>
      <div class="mood-bar" style="height:22px;background:var(--emotion-joy);"></div>
      <div class="mood-bar" style="height:14px;background:var(--emotion-calm);"></div>
      <div class="mood-bar" style="height:18px;background:var(--emotion-joy);"></div>
      <div class="mood-bar empty"></div>
    </div>
  </div>
</div>
```

---

## 5. 하루 현상 화면 (채팅)

### CSS
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

/* 컨텍스트 칩 */
.context-chips { display: flex; gap: 5px; padding: 6px 16px; flex-shrink: 0; }
.chip {
  font-family: 'Noto Sans KR', sans-serif; font-size: 9px;
  color: var(--text-muted); background: var(--surface-muted);
  border: 1px solid var(--border-default); padding: 3px 8px; border-radius: 8px;
}
.chip.mood-positive { background: #e8f0e6; color: #4a7040; border-color: #c0d8b8; }

/* 메시지 영역 */
.chat-messages {
  flex: 1; overflow-y: auto; padding: 10px 14px;
  display: flex; flex-direction: column; gap: 10px; scrollbar-width: none;
}

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

/* 현상하기 CTA 배너 */
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

/* 입력창 */
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

## 6. 필름롤 화면 (ROLL 탭)

### CSS
```css
.filmroll-screen { background: var(--surface-base); padding: 0 16px; }

/* 월 헤더 */
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

/* 필름 카드 — 3열 flex 구조 */
.film-card {
  background: var(--surface-muted);  /* #E4E1DA — 절대 어둡게 하지 말 것 */
  border-radius: 10px; margin-bottom: 12px; overflow: hidden; display: flex;
}
.emotion-bar { width: 3px; flex-shrink: 0; }  /* 감정 컬러바 — 배경은 감정 클래스로 */
.bar-joy   { background: var(--emotion-joy); }
.bar-warm  { background: var(--emotion-warm); }
.bar-tired { background: var(--emotion-tired); }
.bar-sad   { background: var(--emotion-sad); }
.bar-calm  { background: var(--emotion-calm); }

.film-sprocket {
  width: 18px; flex-shrink: 0; background: var(--surface-muted);
  display: flex; flex-direction: column; justify-content: space-evenly;
  align-items: center; padding: 8px 0;
}
.film-hole {
  width: 9px; height: 7px;
  background: var(--surface-base);        /* 앱 배경색 = 구멍처럼 보임 */
  border: 1px solid rgba(42,38,32,0.15);  /* 대비 강화 */
  border-radius: 2px; flex-shrink: 0;
}
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

/* 롤 구분선 */
.roll-divider {
  display: flex; align-items: center; gap: 8px; margin: 2px 0 4px;
  font-family: 'DM Mono', monospace; font-size: 8.5px; color: var(--text-muted); letter-spacing: 0.1em;
}
.roll-divider::before, .roll-divider::after { content: ''; flex: 1; height: 1px; background: rgba(42,38,32,0.12); }
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

## 7. 캘린더 화면 (GRID 탭)

### CSS
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
.cal-month-title { font-family: 'DM Mono', monospace; font-size: 13px; font-weight: 500; color: var(--gold); letter-spacing: 0.14em; text-transform: uppercase; }

.cal-stat-row { display: flex; gap: 6px; align-items: center; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid rgba(42,38,32,0.12); }
.stat-chip { font-family: 'DM Mono', monospace; font-size: 8px; color: var(--text-muted); background: var(--surface-base); border: 1px solid rgba(42,38,32,0.12); border-radius: 8px; padding: 3px 8px; }
.stat-chip.active { color: var(--gold); background: var(--gold-pale); border-color: var(--gold-light); }

.dow-row { display: grid; grid-template-columns: repeat(7, 1fr); margin-bottom: 4px; }
.dow-cell { font-family: 'DM Mono', monospace; font-size: 7.5px; color: var(--text-muted); text-align: center; letter-spacing: 0.06em; padding: 2px 0 6px; }
.dow-cell.sun { color: #c4866a; }
.dow-cell.sat { color: #7a8fa6; }

.dates-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px 0; }
.day-cell { display: flex; flex-direction: column; align-items: center; padding: 3px 0; cursor: pointer; }
.day-num { font-family: 'DM Mono', monospace; font-size: 11px; color: var(--text-secondary); width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 50%; }

.day-cell.today      .day-num { background: var(--gold); color: var(--gold-pale); font-weight: 500; }
.day-cell.has-record .day-num { background: var(--gold-pale); color: var(--gold); font-weight: 500; }
.day-cell.future     .day-num { color: #c8c0b4; }
.day-cell.sun        .day-num { color: #c4866a; }
.day-cell.sat        .day-num { color: #7a8fa6; }
.day-cell.sun.future .day-num { color: #e4c8b8; }
.day-cell.sat.future .day-num { color: #b8c8d8; }
.day-cell.empty { pointer-events: none; }

.emotion-dot { width: 4px; height: 4px; border-radius: 50%; margin-top: 2px; flex-shrink: 0; }

/* 날짜 탭 시 하단 프리뷰 */
.record-preview { margin-top: 10px; border-top: 1px solid rgba(42,38,32,0.12); padding-top: 10px; }
.preview-date  { font-family: 'DM Mono', monospace; font-size: 8px; color: var(--gold); letter-spacing: 0.08em; margin-bottom: 4px; }
.preview-title { font-family: 'Noto Serif KR', serif; font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 4px; line-height: 1.3; }
.preview-body  { font-family: 'Noto Sans KR', sans-serif; font-size: 9px; font-weight: 300; color: var(--text-secondary); line-height: 1.6; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 8px; }
.preview-btn   { font-family: 'DM Mono', 'Noto Sans KR', monospace; font-size: 8px; color: var(--gold); border: 1px solid var(--gold-light); background: transparent; border-radius: 5px; padding: 4px 10px; cursor: pointer; }
```

---

## 8. 현상 결과 화면 (일기 뷰)

```css
.result-screen { background: var(--surface-base); padding: 16px; position: relative; }

.result-neg {
  font-family: 'DM Mono', monospace; font-size: 7.5px; color: var(--text-muted);
  letter-spacing: 0.12em; display: flex; justify-content: space-between; margin-bottom: 12px;
}
.result-title { font-family: 'Noto Serif KR', serif; font-size: 22px; font-weight: 600; color: var(--text-primary); line-height: 1.3; margin-bottom: 6px; }
.result-date  { font-family: 'Noto Sans KR', sans-serif; font-size: 9px; color: var(--text-muted); margin-bottom: 10px; }
.result-tags  { display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 12px; }
.result-tag   { font-family: 'Noto Sans KR', sans-serif; font-size: 8px; color: var(--text-muted); background: var(--surface-muted); padding: 3px 9px; border-radius: 8px; }
.result-divider { height: 1px; background: var(--border-default); margin-bottom: 12px; }
.result-body  { font-family: 'Noto Serif KR', serif; font-style: italic; font-size: 13px; color: var(--text-secondary); line-height: 2; }
.result-neg-num { font-family: 'DM Mono', monospace; font-size: 8px; color: var(--text-muted); letter-spacing: 0.1em; }
```

---

## 9. 현상 애니메이션

```css
/* 현상 버튼 클릭 시 위→아래 스캔 라인 */
.scan-overlay { position: absolute; inset: 0; pointer-events: none; z-index: 30; overflow: hidden; opacity: 0; }
.scan-line {
  position: absolute; left: 0; right: 0; height: 3px; top: -3px;
  background: linear-gradient(90deg, transparent, rgba(200,169,110,0.85) 30%, rgba(255,230,160,1) 50%, rgba(200,169,110,0.85) 70%, transparent);
}
.scan-wash { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(240,238,233,0.97) 0%, rgba(240,238,233,0) 100%); transform: translateY(-100%); }

/* JS: scan-overlay opacity 1 → scanLine top 0~100% → 결과 화면 노출 */
```

---

## 10. 대비율 검증표

| 요소 | 배경 | 텍스트 | 대비율 | 기준 |
|---|---|---|---|---|
| 월 헤더·날짜 | `#E4E1DA` | `#7a5c20` | 5.2:1 | ✅ AA |
| 카드 제목 | `#E4E1DA` | `#2a2620` | 12.8:1 | ✅ AA |
| 카드 본문 | `#E4E1DA` | `#5a5248` | 5.8:1 | ✅ AA |
| 앱배경 위 월헤더 | `#F0EEE9` | `#7a5c20` | 5.0:1 | ✅ AA |
| 감정 컬러바 | — | — | 장식요소 | 기준 없음 |

---

## 11. 전체 체크리스트

```
[ ] 배경이 #F0EEE9 인가? (#fff, #f5f5f5 금지)
[ ] 카드/벤토셀 배경이 #E4E1DA 인가?
[ ] 모든 검정이 #2a2620 인가? (#000, #111 금지)
[ ] 골드 텍스트가 #7a5c20 인가? (#c8a96e는 장식 전용)
[ ] 제목이 Noto Serif KR 600 인가?
[ ] 본문이 Noto Sans KR 400/300 인가?
[ ] 레이블·날짜가 DM Mono 인가?
[ ] 한글 포함 버튼이 'DM Mono', 'Noto Sans KR' 혼합인가?
[ ] 굴림체·궁서체·바탕체가 없는가?
[ ] 모든 화면에 .grain-overlay가 있는가?
[ ] 바텀 내비에 backdrop-filter: blur(16px) 있는가?
[ ] FAB이 탭바 위로 16px 솟아있는가?
[ ] FAB 클릭이 탭 전환이 아닌 router.push인가?
[ ] 하루 현상에서 뒤로가기 시 이전 탭으로 복귀되는가?
[ ] safe-area-inset-bottom 처리가 있는가?
[ ] AI 말풍선 좌상단 radius가 2px인가?
[ ] 유저 말풍선 우상단 radius가 2px인가?
[ ] 필름 카드 배경이 #E4E1DA (밝은 베이지)인가? (어두운 색 금지)
[ ] 감정 컬러가 .emotion-bar 에만 적용되는가?
[ ] 오늘 날짜 원이 #7a5c20 인가? (보라색 금지)
[ ] 벤토 그리드가 CSS Grid로 구현되었는가? (flex 금지)
[ ] 온보딩 필름스트립이 위아래 끝에 딱 붙어있는가?
[ ] box-shadow가 FAB 버튼 외에 없는가?
[ ] font-weight가 300/400/500/600 만 사용되는가?
```

---

## 12. Claude Code 전달 프롬프트

```
reel-design-system-complete.md 파일을 참고해서
Reel 앱의 전체 UI를 구현해줘.

작업 순서:
1. 글로벌 CSS에 1번 섹션 토큰 전체 적용
2. 3번 섹션으로 바텀 탭바 구현 (glassmorphism + FAB)
3. 4번 섹션으로 홈(벤토 그리드) 화면 구현
4. 5번 섹션으로 하루 현상(채팅) 화면 구현
5. 6번 섹션으로 필름롤 ROLL 탭 구현
6. 7번 섹션으로 캘린더 GRID 탭 구현
7. 8번 섹션으로 현상 결과 화면 구현
8. 모든 화면에 grain-overlay 추가
9. 11번 체크리스트 전체 확인 후 결과 보고

핵심 주의사항:
- 배경색 #F0EEE9 고정 (흰색 절대 금지)
- 벤토 그리드는 CSS Grid로만 구현 (flex 금지)
- 바텀 내비 glassmorphism은 backdrop-filter로 구현
- FAB 클릭은 탭 전환 아님 — router.push('/develop')
- 한글 포함 요소에 DM Mono 단독 사용 금지
- Pretendard / Cormorant Garamond 사용 금지
```
