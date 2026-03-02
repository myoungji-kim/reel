# 즐겨찾기 (Bookmark)

## 사전 준비
- `docs/00_context_project-overview.md` 읽기
- 관련 파일:
  - `frontend/src/pages/RollPage.tsx`
  - `frontend/src/components/FrameOverlay.tsx`
  - `frontend/src/components/FilmFrame.tsx`
  - `frontend/src/stores/frameStore.ts` (또는 TanStack Query 사용 시 `api/frameApi.ts`)
  - `frontend/src/api/axiosInstance.ts`
  - `backend/src/main/java/com/reel/frame/Frame.java`
  - `backend/src/main/java/com/reel/frame/FrameController.java`
  - `backend/src/main/java/com/reel/frame/FrameService.java`

## 기능 개요
특별히 간직하고 싶은 프레임에 북마크(★)를 달아두고, 롤 페이지에서 북마크된 프레임만 모아볼 수 있다.

## UX 의도
수십 개의 프레임이 쌓이면 "그때 그 날"을 다시 찾기가 어려워진다.
"나중에 다시 보고 싶은 프레임"을 표시해두면, 일상 기록이 작은 앨범이 된다.
검색보다 더 직관적인 방식으로 소중한 기억을 모아두는 경험.

## DB 변경

### `frames` 테이블에 컬럼 추가
```sql
ALTER TABLE frames ADD COLUMN is_bookmarked BOOLEAN NOT NULL DEFAULT FALSE;
```

## API 변경

### 신규 엔드포인트
```
PUT /api/frames/{frameId}/bookmark
```
- 인증 필요 (JWT)
- Request Body: 없음 (토글 방식)
- Response:
  ```json
  {
    "frameId": 5,
    "isBookmarked": true
  }
  ```
- 현재 상태의 반대로 전환 (true → false, false → true)

### 기존 엔드포인트 변경
- `GET /api/frames` (목록 조회): 응답 DTO에 `isBookmarked` 필드 추가
- `GET /api/frames/{frameId}` (단건 조회): 응답 DTO에 `isBookmarked` 필드 추가

## 구현 요청

### 백엔드

1. **`Frame` 엔티티에 필드 추가**
   ```java
   @Column(name = "is_bookmarked", nullable = false)
   private boolean isBookmarked = false;
   ```

2. **`FrameService`에 토글 메서드 추가**
   ```java
   public BookmarkResponse toggleBookmark(Long userId, Long frameId) {
     Frame frame = frameRepository.findByIdAndUserId(frameId, userId)
       .orElseThrow(() -> new NotFoundException("Frame not found"));
     frame.setIsBookmarked(!frame.isBookmarked());
     frameRepository.save(frame);
     return new BookmarkResponse(frameId, frame.isBookmarked());
   }
   ```

3. **`FrameController`에 엔드포인트 추가**
   ```java
   @PutMapping("/{frameId}/bookmark")
   public ResponseEntity<BookmarkResponse> toggleBookmark(
     @PathVariable Long frameId,
     @AuthenticationPrincipal ...
   )
   ```

4. **기존 목록/단건 조회 DTO에 `isBookmarked` 필드 추가**

5. **`BookmarkResponse` DTO 신규 생성**
   - 필드: `frameId`, `isBookmarked`

### 프론트엔드

1. **`api/frameApi.ts`에 함수 추가**
   ```ts
   export const toggleBookmark = (frameId: number) =>
     axiosInstance.put<BookmarkResponse>(`/api/frames/${frameId}/bookmark`).then(r => r.data)
   ```

2. **`FrameOverlay.tsx` 수정**
   - 오버레이 헤더 우측에 ★/☆ 토글 버튼 추가
   - `frame.isBookmarked`에 따라 ★(활성) / ☆(비활성) 표시
   - 탭 시 `toggleBookmark(frameId)` 호출
   - 낙관적 업데이트(Optimistic Update): 즉시 UI 반영 후 API 응답으로 검증
   - 실패 시 이전 상태로 롤백

3. **`RollPage.tsx` 수정**
   - 헤더 영역(또는 검색 아이콘 옆)에 ★ 필터 토글 버튼 추가
   - 활성화 시 북마크된 프레임만 표시
   - `isBookmarkFilter` 로컬 상태(`useState`) 관리
   - 활성화 상태에서는 버튼 강조 표시 (색상 변경 또는 underline)
   - 기존 프레임 목록 필터링: 클라이언트 사이드 (`frame.isBookmarked === true`만)

4. **`FilmFrame.tsx` 수정** (선택적)
   - `isBookmarked === true`인 프레임에 작은 ★ 아이콘을 카드 우상단에 표시
   - 아이콘 크기: 12px 이하, 색상: `var(--color-accent)` 또는 amber 계열
   - 너무 눈에 띄지 않게 (카드 디자인 방해 금지)

5. **타입 업데이트**
   - 기존 `FrameListItem`, `FrameDetail` 타입에 `isBookmarked: boolean` 필드 추가

## 디자인 규칙
- ★/☆ 아이콘: 유니코드 문자 또는 SVG (새 라이브러리 추가 금지)
- 기존 디자인 토큰 외 색상 추가 금지
- 북마크 필터 활성화 시 기존 레이아웃 구조 유지 (갑작스러운 리렌더 최소화)
- 프레임 카드의 ★ 아이콘은 선택적 구현 — 카드 디자인 방해 시 생략

## 검증
- [ ] FrameOverlay에서 ★ 탭 시 즉시 UI 변경 확인 (낙관적 업데이트)
- [ ] `PUT /api/frames/{id}/bookmark` 응답 확인 후 최종 상태 반영
- [ ] 북마크 후 페이지 새로고침해도 ★ 상태 유지 (DB 저장) 확인
- [ ] RollPage의 ★ 필터 탭 시 북마크된 프레임만 표시 확인
- [ ] 북마크 0개일 때 필터 활성화 시 빈 상태 메시지 확인
- [ ] 다른 사용자의 프레임에 북마크 요청 시 403 응답 확인

## 커밋 메시지
```
feat: add bookmark feature to frames with filter in RollPage
```
