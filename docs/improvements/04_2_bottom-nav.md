# 바텀 탭바 (Glassmorphism + FAB)
> 작업 파일: `frontend/src/components/layout/BottomNav.tsx` (신규), `frontend/src/pages/HomePage.tsx`

---

## 탭 구성

```
현상소 | 필름롤 | [◎ 현상 FAB] | 즐겨찾기 | 나
```

**FAB 진입 규칙**: 하루 현상은 `router.push('/develop')` — activeTab 변경 없음.
뒤로가기 시 이전 탭으로 복귀.

---

## CSS

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

---

## 아이콘 SVG

```html
<!-- 현상소 (홈) -->
<svg viewBox="0 0 20 20"><path d="M3 9.5L10 3l7 6.5V17a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/></svg>

<!-- 필름롤 -->
<svg viewBox="0 0 20 20"><rect x="3" y="4" width="14" height="13" rx="2"/><path d="M7 4V2M13 4V2M3 8h14"/></svg>

<!-- FAB (현상) -->
<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="3"/><path d="M3 10a7 7 0 1014 0A7 7 0 003 10z" opacity=".4"/><path d="M10 2v2.5M10 15.5V18M2 10h2.5M15.5 10H18"/></svg>

<!-- 즐겨찾기 -->
<svg viewBox="0 0 20 20"><path d="M5 3h10a1 1 0 011 1v13l-6-3-6 3V4a1 1 0 011-1z"/></svg>

<!-- 나 (프로필) -->
<svg viewBox="0 0 20 20"><circle cx="10" cy="7" r="3"/><path d="M4 17c0-3.3 2.7-6 6-6s6 2.7 6 6"/></svg>
```

---

## 화면별 활성 탭

| 화면 | 활성 탭 |
|---|---|
| 현상소 | 현상소 |
| 필름롤 ROLL/GRID | 필름롤 |
| 하루 현상·현상 결과 | 이전 탭 유지 (FAB만 강조) |
| 즐겨찾기 | 즐겨찾기 |
| 나 | 나 |

---

## 구현 주의사항

- FAB 클릭 → `router.push('/develop')`, `activeTab` 변경 **없음**
- `backdrop-filter: blur(16px)` 필수 (글래스모피즘)
- FAB이 탭바 위로 **16px 솟아있어야** 함 (`top: -16px`)
- `safe-area-inset-bottom` 처리 필수 (아이폰 홈바 영역)
- `box-shadow`는 FAB `.fab-circle`에만 허용
