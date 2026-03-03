# 필름 보관 (Archive Frame)

## 사전 준비
- `docs/00_context_project-overview.md` 읽기
- 관련 파일:
  - `frontend/src/components/overlays/FrameOverlay.tsx`
  - `frontend/src/pages/RollPage.tsx`
  - `frontend/src/api/frameApi.ts`
  - `backend/src/main/java/com/reel/frame/entity/Frame.java`
  - `backend/src/main/java/com/reel/frame/service/FrameService.java`
  - `backend/src/main/java/com/reel/frame/controller/FrameController.java`
  - `backend/src/main/java/com/reel/frame/repository/FrameRepository.java`
  - `backend/src/main/java/com/reel/frame/dto/FrameResponse.java`

## 기능 개요
프레임을 삭제하지 않고 롤에서 보이지 않게 보관할 수 있다.
롤 번호와 진행도는 그대로 유지되며, 보관된 프레임은 언제든 복원 가능하다.

## UX 의도
필름은 버리는 게 아니라 서랍에 넣어두는 것.
보고 싶지 않은 기록을 영구 삭제 없이 조용히 치울 수 있는 경로를 제공한다.
가역적 행동이므로 확인 모달 없이 즉시 적용 + Undo 토스트 패턴 사용.

## DB 변경

`frames` 테이블에 컬럼 추가:
```sql
ALTER TABLE frames ADD COLUMN is_archived BOOLEAN NOT NULL DEFAULT FALSE;
```

- 보관 시 `true`, 복원 시 `false`
- `frame_num`은 변경하지 않음 (롤 정합성 유지)
- 롤 통계(`countByUserId`)는 archived 프레임 **포함** 카운트 유지 (frame_num 기준 롤 번호 보존)

## API 변경

### 신규 엔드포인트

#### 보관
```
PATCH /api/frames/{frameId}/archive
```
- 인증 필요 (JWT)
- Request Body: 없음
- Response:
  ```json
  { "frameId": 12 }
  ```

#### 복원
```
PATCH /api/frames/{frameId}/unarchive
```
- 인증 필요 (JWT)
- Request Body: 없음
- Response:
  ```json
  { "frameId": 12 }
  ```

### 기존 엔드포인트 변경
- `GET /api/frames` (목록 조회): `is_archived = false` 인 것만 반환
- `GET /api/frames` 아카이브 목록: `?archived=true` 쿼리 파라미터로 보관 프레임만 조회

## 구현 요청

### 백엔드

1. **`Frame` 엔티티에 `isArchived` 필드 추가**
   ```java
   @Column(name = "is_archived", nullable = false)
   private boolean isArchived = false;
   ```
   - `archive()`, `unarchive()` 메서드 추가:
     ```java
     public void archive() { this.isArchived = true; }
     public void unarchive() { this.isArchived = false; }
     ```

2. **`FrameRepository` 변경**
   - 기존 `findByUserIdOrderByCreatedAtDesc` → `is_archived = false` 조건 추가
   - 보관 목록 조회 메서드 추가:
     ```java
     List<Frame> findByUserIdAndIsArchivedTrueOrderByCreatedAtDesc(Long userId);
     ```

3. **`FrameService`에 메서드 추가**
   ```java
   public void archiveFrame(Long userId, Long frameId)
   public void unarchiveFrame(Long userId, Long frameId)
   public List<FrameResponse> getArchivedFrames(Long userId)
   ```
   - `archiveFrame` / `unarchiveFrame`: 소유자 검증 후 플래그 변경
   - `getArchivedFrames`: `is_archived = true` 목록 반환

4. **`FrameController`에 엔드포인트 추가**
   ```java
   @PatchMapping("/{frameId}/archive")
   public ResponseEntity<Map<String, Long>> archiveFrame(
     @PathVariable Long frameId,
     @AuthenticationPrincipal ...
   )

   @PatchMapping("/{frameId}/unarchive")
   public ResponseEntity<Map<String, Long>> unarchiveFrame(
     @PathVariable Long frameId,
     @AuthenticationPrincipal ...
   )

   @GetMapping("/archived")
   public ResponseEntity<ApiResponse<List<FrameResponse>>> getArchivedFrames(
     @AuthenticationPrincipal ...
   )
   ```

5. **`FrameResponse`** — `isArchived` 필드 추가 (boolean)

### 프론트엔드

1. **`api/frameApi.ts`에 함수 추가**
   ```ts
   export const archiveFrame = (frameId: number) =>
     axiosInstance.patch(`/api/frames/${frameId}/archive`).then(r => r.data)

   export const unarchiveFrame = (frameId: number) =>
     axiosInstance.patch(`/api/frames/${frameId}/unarchive`).then(r => r.data)

   export const getArchivedFrames = () =>
     axiosInstance.get('/api/frames/archived').then(r => r.data)
   ```

2. **`types/frame.ts` 변경**
   - `Frame` 인터페이스에 `isArchived: boolean` 추가

3. **`FrameOverlay.tsx` 수정** (보관 버튼 추가)
   - 일반 보기 모드(editMode=false) 하단 액션 영역에 `[필름 보관]` 버튼 추가
   - 레이아웃: `[ 수정 ]` 왼쪽 정렬, `[ 필름 보관 ]` 오른쪽 정렬
   - 버튼 스타일: `var(--cream-muted)`, opacity: 0.45, fontSize: 10px — 수정 버튼보다 훨씬 약하게
   - 탭 시:
     1. `archiveFrame(frameId)` 호출
     2. 오버레이 닫기
     3. 토스트: `"필름을 보관했어요  ·  되돌리기"` (4초, 되돌리기 탭 시 `unarchiveFrame` 호출)
     4. `queryClient.invalidateQueries(['frames'])` + `invalidateQueries(['archived-frames'])`

4. **`useToast` 확장** — Undo 액션 지원
   - `showToast(message, type?, undoAction?)` 형태로 확장
   - `undoAction`이 있으면 토스트 우측에 `되돌리기` 버튼 렌더링
   - 버튼 탭 시 `undoAction()` 실행 후 토스트 즉시 닫힘

5. **`RollPage.tsx` 수정** (보관 목록 섹션 추가)
   - `useQuery(['archived-frames'], getArchivedFrames)` 구독
   - 보관된 프레임이 1개 이상일 때만 롤 목록 최하단에 섹션 렌더링:
     ```
     ──────────────────────────────
       보관된 필름 N장             ›
     ──────────────────────────────
     ```
   - 탭 시 인라인으로 목록 펼침/접기 (토글)
   - 펼친 상태: 보관된 프레임 목록 (FilmFrame 스타일 그대로, 단 opacity: 0.6)
     - 각 항목 우측에 `[복원]` 버튼
     - 복원 탭 시: `unarchiveFrame()` → 두 쿼리 invalidate → 목록에서 제거
   - 섹션 헤더 스타일: `var(--cream-muted)`, fontSize: 10px, opacity: 0.5 — 최대한 조용하게

## 디자인 규칙
- `[필름 보관]` 버튼은 의도적으로 약하게 — 주 액션(수정)보다 시각적 우선순위가 낮아야 함
- Undo 토스트는 기존 토스트 스타일 유지, `되돌리기`는 `var(--amber)` 색상 텍스트 버튼
- 보관 목록 섹션은 롤의 주 흐름을 방해하지 않도록 최하단 + muted 스타일
- 기존 디자인 토큰 이외의 색상 추가 금지

## 검증
- [ ] FrameOverlay에서 `[필름 보관]` 탭 시 롤에서 즉시 사라짐 확인
- [ ] Undo 토스트의 `되돌리기` 탭 시 롤에 다시 나타남 확인
- [ ] 보관된 프레임이 있을 때만 롤 하단 섹션 표시 확인
- [ ] 보관 섹션에서 `[복원]` 탭 시 롤에 다시 나타남 확인
- [ ] 보관 후 `is_archived = true`로 DB 저장 확인
- [ ] `frame_num`, 롤 통계(진행도, 총 프레임 수) 변화 없음 확인
- [ ] 보관된 프레임이 0개면 롤 하단 섹션 미표시 확인

## 커밋 메시지
```
feat: add archive feature to hide frames without deleting
```
