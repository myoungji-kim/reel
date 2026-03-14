# 북마크 필터 UX 개선 (Bookmark Filter UX Improvement)

## 배경

`docs/features/14_feat_bookmark.md` 기준으로 북마크 기능이 구현된 상태다.
UX 검토를 통해 아래 4가지 문제가 발견됐고, 이를 개선한다.
**백엔드 변경 없음. 프론트엔드 전용 개선이다.**

---

## 관련 파일

- `frontend/src/pages/RollPage.tsx`
- `frontend/src/components/frame/FilmFrame.tsx`
- `frontend/src/components/frame/FrameOverlay.tsx`
- `frontend/src/components/common/FilmPhoto.tsx`
- `frontend/src/styles/tokens.css` (디자인 토큰 — 값 변경 금지)

---

## 문제 진단

### 문제 1. 아이콘이 3군데에서 모두 다르다 (일관성 파괴)

| 위치 | 현재 | 문제 |
|------|------|------|
| `RollPage.tsx` 필터 버튼 | 유니코드 `★` 텍스트, 12px | 버튼처럼 안 보임 |
| `FilmFrame.tsx` 카드 내 표시 | 유니코드 `★` 텍스트, 10px | 너무 작아 인식 불가 |
| `FrameOverlay.tsx` 북마크 버튼 | lucide `Bookmark` / `BookmarkCheck` | 유일하게 명확함 |

같은 "북마크"라는 개념을 세 가지 다른 방식으로 표현하고 있어, 사용자가 같은 기능임을 인지하기 어렵다.

### 문제 2. 필터 버튼이 버튼처럼 안 보인다 (어포던스 부재)

- 배경, 테두리, 시각적 컨테이너 없이 `★` 문자 한 글자만 존재
- 옆에 있는 검색 버튼(SVG 아이콘)과 `✦ 빠른 현상`(텍스트+테두리)과 시각적 위계가 뒤섞임
- "이걸 누르면 필터된다"는 어포던스(affordance)가 없음

### 문제 3. 필터 활성 상태를 모르고 지나칠 수 있다 (상태 비가시성)

- 활성화 시 `color: amber` + `opacity: 1` 변경이 전부
- 스크롤하면 필터바가 시야에서 사라지는데 "지금 필터링 중"이라는 컨텍스트를 잃어버림
- 결과가 있을 때는 아무 안내도 없고 빈 결과일 때만 `// NO BOOKMARKS` 텍스트가 나옴

### 문제 4. 카드의 북마크 표시가 너무 약하다 (시각적 차별화 미흡)

- `FilmFrame.tsx`의 `★`: 10px, opacity 0.8
- 날짜/프레임 번호 텍스트와 나란히 있어 거의 인식되지 않음
- 북마크된 프레임과 아닌 프레임의 시각적 차이가 미미함

---

## 개선 사항

> 우선순위 순서로 구현한다. 각 개선은 독립적으로 완결된다.

---

### 개선 1 🔴 아이콘 통일 — `★` 텍스트 → lucide Bookmark 아이콘

**대상 파일:** `RollPage.tsx`, `FilmFrame.tsx`

#### RollPage.tsx 필터 버튼

`★` 텍스트를 제거하고 lucide `Bookmark` / `BookmarkCheck`로 교체한다.

- 비활성 상태: `<Bookmark size={14} />`, color `var(--cream-muted)`, opacity 0.45
- 활성 상태: `<BookmarkCheck size={14} />`, color `var(--amber)`, opacity 1

`FrameOverlay.tsx`가 이미 이 패턴을 사용하고 있으므로 그대로 따른다.

```tsx
// Before
★

// After
{activeFilter === 'bookmark'
  ? <BookmarkCheck size={14} />
  : <Bookmark size={14} />}
```

#### FilmFrame.tsx 카드 내 북마크 표시

`★` 텍스트를 제거하고 lucide `Bookmark`로 교체한다.

- size: 10
- color: `var(--amber)`
- opacity: 0.9
- `fill="currentColor"` 속성 추가해 채워진 형태로 표시 (이미 북마크된 상태이므로)

```tsx
// Before
{frame.isBookmarked && <span style={styles.bookmarkIcon}>★</span>}

// After
{frame.isBookmarked && (
  <Bookmark
    size={10}
    style={{ color: 'var(--amber)', opacity: 0.9, flexShrink: 0 }}
    fill="currentColor"
  />
)}
```

**검증:**
- [ ] 세 곳(필터 버튼 비활성/활성, 카드 내 표시)에서 동일한 아이콘 계열이 사용됨
- [ ] 기존 레이아웃 깨짐 없음

---

### 개선 2 🔴 필터 활성 상태 칩(pill) 표시

**대상 파일:** `RollPage.tsx`

필터가 활성화됐을 때 필터바 바로 아래에 상태 칩을 노출한다.
스크롤 시에도 사용자가 "현재 북마크만 보는 중"임을 인지할 수 있다.

#### 동작 규칙

- `activeFilter === 'bookmark'`일 때만 렌더링
- 칩 내 `×` 버튼 클릭 시 `setActiveFilter('all')` 호출 → 필터 해제
- 칩은 필터바와 프레임 목록 사이에 위치 (RollProgressBar 위)

#### 마크업 구조

```tsx
{activeFilter === 'bookmark' && (
  <div style={styles.filterChip}>
    <BookmarkCheck size={11} style={{ color: 'var(--amber)' }} fill="currentColor" />
    <span style={styles.filterChipText}>북마크만 보는 중</span>
    <button
      style={styles.filterChipClose}
      onClick={() => setActiveFilter('all')}
      aria-label="북마크 필터 해제"
    >
      <X size={10} />
    </button>
  </div>
)}
```

#### 스타일

```ts
filterChip: {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 5,
  alignSelf: 'flex-start',
  marginLeft: 16,
  marginBottom: 8,
  padding: '3px 8px 3px 7px',
  background: 'rgba(196, 160, 80, 0.10)',
  border: '1px solid rgba(196, 160, 80, 0.30)',
  borderRadius: 12,
},
filterChipText: {
  fontFamily: "'Space Mono', monospace",
  fontSize: 10,
  color: 'var(--amber-light)',
  letterSpacing: '0.04em',
},
filterChipClose: {
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  padding: 0,
  display: 'flex',
  alignItems: 'center',
  color: 'var(--cream-muted)',
  opacity: 0.6,
},
```

**검증:**
- [ ] 필터 활성화 시 칩이 즉시 나타남
- [ ] 칩의 `×` 클릭 시 필터 해제되고 칩이 사라짐
- [ ] 필터 버튼 클릭으로 해제 시에도 칩이 사라짐
- [ ] 필터 비활성 상태에서 칩이 보이지 않음

---

### 개선 3 🟡 북마크 카드 — 왼쪽 amber 세로 바 추가

**대상 파일:** `FilmFrame.tsx`

10px 아이콘만으로는 북마크된 카드와 아닌 카드의 시각적 차별화가 부족하다.
카드 왼쪽 가장자리에 amber 세로 바(3px)를 추가해 "이 프레임은 표시됨"을 스캔 가능하게 만든다.

필름 스트립 미학을 해치지 않는 최소 변경이어야 한다.

#### 구현

`FilmFrame.tsx`의 `outer` 스타일(카드 컨테이너)에 조건부로 `borderLeft`를 추가한다.

```tsx
// outer div의 style에 조건부 추가
<div
  style={{
    ...styles.outer,
    ...(isRetro ? styles.outerRetro : {}),
    ...(frame.isBookmarked ? styles.outerBookmarked : {}),
  }}
>
```

```ts
outerBookmarked: {
  borderLeft: '3px solid rgba(196, 160, 80, 0.55)',
},
```

- 비북마크 카드의 기존 border는 변경하지 않는다.
- 두께 3px, 투명도 0.55로 은은하게 — 카드 디자인을 지배하지 않는다.
- `isRetro` 프레임에도 동일하게 적용한다.

**검증:**
- [ ] 북마크된 카드 왼쪽에 amber 바가 표시됨
- [ ] 북마크 해제 후 새로고침 시 바가 사라짐
- [ ] 비북마크 카드의 스타일 변화 없음
- [ ] 카드 전체 레이아웃(너비, 정렬) 깨짐 없음

---

### 개선 4 🟢 필터/액션 버튼 영역 시각적 분리

**대상 파일:** `RollPage.tsx`

현재 `filterActions` 영역에 `★(북마크 필터)` / `🔍(검색)` / `✦ 빠른 현상` 세 버튼이 나란히 붙어있다.
북마크 필터는 **뷰 제어**이고 검색·빠른 현상은 **액션**으로 성격이 다르다.

북마크 필터 버튼과 나머지 사이에 세퍼레이터를 추가해 역할을 구분한다.

#### 구현

```tsx
<div style={styles.filterActions}>
  {viewMode === 'roll' && (
    <>
      {/* 뷰 제어 영역 */}
      <button
        style={{
          ...styles.bookmarkBtn,
          color: activeFilter === 'bookmark' ? 'var(--amber)' : 'var(--cream-muted)',
          opacity: activeFilter === 'bookmark' ? 1 : 0.45,
        }}
        onClick={() => setActiveFilter(f => f === 'bookmark' ? 'all' : 'bookmark')}
        aria-label="북마크 필터"
      >
        {activeFilter === 'bookmark'
          ? <BookmarkCheck size={14} />
          : <Bookmark size={14} />}
      </button>

      {/* 구분선 */}
      <div style={styles.actionDivider} />

      {/* 액션 영역 */}
      <button style={styles.searchBtn} onClick={handleSearchToggle} aria-label="검색">
        {/* 기존 검색 SVG */}
      </button>
      <button style={styles.quickNoteBtn} onClick={() => setQuickNoteOpen(true)}>
        ✦ 빠른 현상
      </button>
    </>
  )}
</div>
```

```ts
actionDivider: {
  width: 1,
  height: 12,
  background: 'var(--cream-muted)',
  opacity: 0.2,
  marginInline: 2,
},
```

**검증:**
- [ ] 북마크 필터 버튼과 검색 버튼 사이에 세퍼레이터가 표시됨
- [ ] 세퍼레이터가 기존 버튼들의 정렬에 영향을 주지 않음
- [ ] 검색 모드 진입 시 세퍼레이터가 함께 사라짐

---

## 전체 검증 체크리스트

- [ ] 개선 1: 세 위치 모두 lucide Bookmark 계열 아이콘으로 통일됨
- [ ] 개선 2: 필터 활성 시 칩 표시 / 칩 `×` 클릭으로 해제 가능
- [ ] 개선 3: 북마크 카드 좌측 amber 바 표시 (비북마크 카드 영향 없음)
- [ ] 개선 4: 필터 버튼과 액션 버튼 사이 세퍼레이터 표시
- [ ] `tokens.css` 디자인 토큰 값 변경 없음
- [ ] 새 색상 변수 추가 없음 (`var(--amber)`, `var(--amber-light)`, `var(--cream-muted)` 기존 토큰만 사용)
- [ ] 기존 `FrameOverlay.tsx` 북마크 버튼 동작 영향 없음

## 커밋 메시지

```
improve: enhance bookmark filter UX with icon consistency and active state visibility
```
