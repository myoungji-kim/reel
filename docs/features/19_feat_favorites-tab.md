# 즐겨찾기 탭 — 북마크 프레임 전용 화면

> 작성 기준: 2026-03-15
> 관련 파일: `BottomNav.tsx`, `uiStore.ts`, `RollPage.tsx`, `frameStore.ts`

---

## 1. 기획 배경 및 목적

### 현재 문제

현재 북마크 기능은 **RollPage 내부 토글 버튼**으로 숨어있다.

```
현상소(Roll) → 우측 상단 북마크 아이콘 클릭 → 필터 ON/OFF
```

- 진입 경로가 불명확해 실사용률이 낮다.
- "내가 아꼈던 프레임"을 빠르게 꺼내보려면 Roll 탭을 거쳐야 한다.
- BottomNav에 즐겨찾기 탭이 있지만 placeholder 상태라 신뢰감을 저해한다.

### 목표

> **"소장하고 싶은 하루들을 한 곳에"** — 북마크 프레임을 별도 전용 탭으로 격상해
> 사용자가 중요한 기억에 빠르게 접근할 수 있도록 한다.

---

## 2. 사용자 시나리오

```
① 프레임 상세보기(FrameOverlay)에서 북마크 아이콘 탭
② 하단 내비 "즐겨찾기" 탭 진입
③ 북마크한 프레임 목록을 날짜 최신순으로 확인
④ 프레임 탭 → FrameOverlay에서 내용 확인 / 북마크 해제
```

---

## 3. 화면 설계

### 3-1. 탭 전환 방식

- BottomNav의 즐겨찾기 아이콘 탭 → `activeTab = 'favorites'`
- `uiStore`의 Tab 타입에 `'favorites'` 추가
- `HomePage`에서 `activeTab === 'favorites'` 분기 처리

```
chat → ChatPage
roll → RollPage
favorites → FavoritesPage (신규)
```

### 3-2. FavoritesPage 레이아웃

```
┌─────────────────────────────┐
│  [헤더]                      │
│  즐겨찾기          n개       │
├─────────────────────────────┤
│                              │
│  ┌─ FilmFrame 카드 ────────┐ │
│  │ 2026.03.14 — FRI  #08  │ │
│  │ 오늘의 한 장면          │ │
│  │ 본문 미리보기...        │ │
│  └────────────────────────┘ │
│                              │
│  ┌─ FilmFrame 카드 ────────┐ │
│  │ ...                    │ │
│  └────────────────────────┘ │
│                              │
│  (북마크 없을 때 Empty State) │
└─────────────────────────────┘
```

### 3-3. 헤더 스펙

```css
.favorites-header {
  padding: 14px 20px 10px;
  border-bottom: 1px solid var(--border-default);
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}
.favorites-title {
  font-family: 'Noto Serif KR', serif;
  font-size: 20px; font-weight: 600; font-style: italic;
  color: var(--text-primary);
}
.favorites-count {
  font-family: 'DM Mono', monospace;
  font-size: 9px; color: var(--text-muted);
  letter-spacing: 0.1em;
}
```

### 3-4. Empty State (북마크 없을 때)

```
◈

아직 즐겨찾기한 프레임이 없어요

현상된 일기에서 북마크 아이콘을 탭하면
여기에 모아볼 수 있어요.
```

```css
.empty-icon   { font-size: 24px; color: var(--text-placeholder); margin-bottom: 12px; }
.empty-title  { font-family: 'Noto Sans KR'; font-size: 13px; color: var(--text-muted); font-weight: 300; }
.empty-desc   { font-family: 'Noto Sans KR'; font-size: 11px; color: var(--text-placeholder); font-weight: 300; margin-top: 6px; line-height: 1.7; text-align: center; }
```

---

## 4. 데이터 전략

### 옵션 A: 클라이언트 필터링 (권장)

`frameStore`에 이미 전체 frames가 로드되어 있으므로,
`frames.filter(f => f.isBookmarked)` 로 즉시 사용 가능.

- 장점: 별도 API 불필요, 네트워크 비용 0
- 단점: frameStore 로드 전 진입 시 빈 화면 (일시적)

### 옵션 B: 전용 API (확장성)

```
GET /api/frames?bookmarked=true&page=0&size=50
```

- 장점: 프레임 수가 많아져도 정확한 데이터
- 단점: 별도 엔드포인트 구현 필요

**→ 현재 단계에서는 옵션 A(클라이언트 필터링)로 구현, 추후 옵션 B로 마이그레이션 여지 둠**

---

## 5. RollPage 변경사항

- 기존 북마크 토글 버튼(우측 상단 `Bookmark` 아이콘) 제거
- 기존 `activeFilter === 'bookmark'` 분기 및 필터 칩 제거
- `type Filter = 'all' | 'bookmark'` → `type Filter = 'all'` (단순화)

> 북마크 기능이 전용 탭으로 이관되므로 RollPage는 "전체 프레임 목록" 역할에만 집중

---

## 6. BottomNav 변경사항

- 즐겨찾기 버튼에 `onClick={() => onTabChange('favorites')}` 연결
- active 상태 스타일 적용 (현재 placeholder라 active 처리 없음)

---

## 7. 구현 순서

```
1. uiStore.ts — Tab 타입에 'favorites' 추가
2. BottomNav.tsx — 즐겨찾기 탭 onClick 연결 + active 스타일
3. FavoritesPage.tsx — 신규 생성
4. HomePage.tsx — 'favorites' 탭 분기 추가
5. RollPage.tsx — 북마크 필터 관련 코드 제거
```

---

## 8. 디자인 원칙

- FilmFrame 카드 동일하게 사용 (일관된 시각 언어)
- 별도 탭이므로 월별 그룹핑은 **선택** (북마크 수가 적을 경우 단순 목록이 더 직관적)
  - 북마크 수 ≥ 10이면 월별 그룹핑, < 10이면 단순 목록 (혹은 항상 단순 목록)
- 정렬: 북마크 추가 시점이 아닌 **일기 작성일 최신순** (사용자가 기억을 시간 순으로 인식하기 때문)

---

## 9. 미결정 사항

| 항목 | 결정 |
|---|---|
| 월별 그룹핑 | **10개 미만이면 생략** (단순 목록), 10개 이상이면 월별 그룹핑 |
| 정렬 기준 | **일기 작성일 최신순** |
| 빈 화면 CTA | **안내 텍스트만** (별도 버튼 없음) |
