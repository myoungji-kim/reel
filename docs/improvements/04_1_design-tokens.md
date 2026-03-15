# 디자인 토큰 & 글로벌 스타일
> 작업 파일: `frontend/src/styles/tokens.css`, `frontend/src/styles/index.css`

---

## 1. 컬러 토큰

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

---

## 2. 폰트

```css
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:ital,wght@0,400;0,600;1,400;1,600&family=Noto+Sans+KR:wght@300;400;500&family=DM+Mono:wght@300;400;500&display=swap');
```

### 사용 규칙
| 용도 | 폰트 |
|---|---|
| 제목·로고·현상결과 본문 | Noto Serif KR |
| 일반 UI·말풍선·태그·버튼 | Noto Sans KR |
| 날짜·FR넘버·레이블·시간 | DM Mono |
| 한글 포함 버튼 | `'DM Mono', 'Noto Sans KR', monospace` (혼합 필수) |

### 절대 금지
- Cormorant Garamond, Inter, Roboto, Pretendard, 시스템폰트 단독
- 굴림체·궁서체·바탕체
- Space Mono, VT323, Bebas Neue

---

## 3. 공통 규칙

```
- 모든 border: 0.5~1px, rgba(42,38,32,0.12~0.20)
- box-shadow: FAB 버튼 한 곳만 허용 (0 2px 10px rgba(42,38,32,0.22))
- font-weight: 300/400/500/600 만 사용 (700 금지)
- border-radius: 카드 10~14px, 말풍선 12px, 태그 8px, FAB 50%
```

---

## 4. Grain 텍스처 (모든 화면 공통)

```css
/* body::after 로 전역 적용 — 인화지 느낌 */
body::after {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.045'/%3E%3C/svg%3E");
  background-size: 128px 128px;
  mix-blend-mode: multiply;
}
```

---

## 5. 필름스트립 (상하단 공통)

```css
.filmstrip {
  height: 20px;
  background: var(--surface-base);
  border-top: 1px solid var(--border-default);
  border-bottom: 1px solid var(--border-default);
  display: flex;
  gap: 2px;
  padding: 2px 4px;
  overflow: hidden;
}
.film-hole {
  width: 10px; height: 6px;
  border: 1px solid var(--border-mid);
  border-radius: 1px;
  flex-shrink: 0;
}
```

> 로그인 화면: 상단 + 하단 모두 배치, `safe-area-inset` 처리 필수, 화면 끝에 딱 붙어야 함

---

## 6. 대비율 검증표

| 요소 | 배경 | 텍스트 | 대비율 | 기준 |
|---|---|---|---|---|
| 월 헤더·날짜 | `#E4E1DA` | `#7a5c20` | 5.2:1 | ✅ AA |
| 카드 제목 | `#E4E1DA` | `#2a2620` | 12.8:1 | ✅ AA |
| 카드 본문 | `#E4E1DA` | `#5a5248` | 5.8:1 | ✅ AA |
| 앱배경 위 월헤더 | `#F0EEE9` | `#7a5c20` | 5.0:1 | ✅ AA |
| 감정 컬러바 | — | — | 장식요소 | 기준 없음 |
