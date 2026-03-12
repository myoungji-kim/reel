# 프레임 검색 (Search)

## 사전 준비
- `docs/00_context_project-overview.md` 읽기
- 관련 파일:
  - `frontend/src/pages/RollPage.tsx`
  - `frontend/src/api/axiosInstance.ts`
  - `backend/src/main/java/com/reel/frame/FrameRepository.java`
  - `backend/src/main/java/com/reel/frame/FrameController.java`
  - `backend/src/main/java/com/reel/frame/FrameService.java`
  - `backend/src/main/java/com/reel/frame/dto/FrameListResponse.java` (또는 기존 목록 응답 DTO)

## 기능 개요
필름 롤 페이지에서 프레임 제목과 내용을 키워드로 검색하여 해당 프레임들만 필터링해 보여준다.

## UX 의도
기록이 쌓일수록 "그때 그 얘기 어디 있었지?"가 필요해진다.
검색창은 평소에는 숨어 있다가, 검색 아이콘을 탭했을 때만 나타나 타임라인을 방해하지 않는다.

## DB 변경
없음. 기존 `frames` 테이블의 `title`, `content` 컬럼 사용.

## API 변경

### 신규 엔드포인트
```
GET /api/frames/search?q={keyword}&page={page}&size={size}
```
- 인증 필요 (JWT)
- 쿼리 파라미터:
  - `q`: 검색 키워드 (필수, 1자 이상)
  - `page`: 페이지 번호 (기본값 0)
  - `size`: 페이지당 개수 (기본값 20)
- 응답: 기존 프레임 목록 응답 DTO와 동일한 형태 (페이지네이션 포함)
  ```json
  {
    "content": [ { "frameId": 5, "frameNum": 5, "title": "...", "mood": "...", "frameDate": "..." } ],
    "totalElements": 3,
    "totalPages": 1,
    "number": 0
  }
  ```

## 구현 요청

### 백엔드

1. **`FrameRepository`에 검색 메서드 추가**
   ```java
   @Query("SELECT f FROM Frame f WHERE f.user.id = :userId AND (LOWER(f.title) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(f.content) LIKE LOWER(CONCAT('%', :q, '%'))) ORDER BY f.frameDate DESC, f.createdAt DESC")
   Page<Frame> searchByKeyword(@Param("userId") Long userId, @Param("q") String q, Pageable pageable);
   ```
   - PostgreSQL 사용 시 `ILIKE` 선호하지만 JPQL 호환을 위해 `LOWER + LIKE` 조합 사용
   - Native Query로 전환 시 `ILIKE %:q%` 사용 가능

2. **`FrameService`에 메서드 추가**
   ```java
   public Page<FrameListResponse> searchFrames(Long userId, String q, Pageable pageable)
   ```
   - `q`가 blank이면 빈 Page 반환

3. **`FrameController`에 엔드포인트 추가**
   ```java
   @GetMapping("/search")
   public ResponseEntity<Page<FrameListResponse>> searchFrames(
     @RequestParam String q,
     @PageableDefault(size = 20) Pageable pageable,
     @AuthenticationPrincipal ...
   )
   ```

### 프론트엔드

1. **`api/frameApi.ts`에 함수 추가**
   ```ts
   export const searchFrames = (q: string, page = 0) =>
     axiosInstance.get('/api/frames/search', { params: { q, page, size: 20 } }).then(r => r.data)
   ```

2. **`RollPage.tsx` 수정**
   - 헤더 우측에 검색 아이콘(🔍 또는 SVG) 버튼 추가
   - 아이콘 탭 시 검색 입력창 토글 (슬라이드 다운 애니메이션)
   - 검색창 열리면 자동 포커스
   - 검색 입력 시 `useQuery(['frameSearch', q], () => searchFrames(q))` 로 검색
   - 디바운스 300ms 적용 (불필요한 API 호출 방지)

3. **검색 상태에 따른 목록 분기**
   - 검색어가 비어있으면 → 기존 프레임 목록 표시
   - 검색어 있으면 → 검색 결과 목록으로 대체 (기존 목록 숨김)
   - 검색 결과 없을 때: 빈 상태 메시지 `"'키워드'에 대한 프레임이 없습니다"`

4. **검색창 UI 스타일**
   - 배경 `var(--color-surface-2)`, border `1px solid var(--color-border)`
   - 폰트 `var(--font-sans)`, 높이 ~40px, 좌우 패딩 12px
   - X 버튼으로 검색 초기화 및 창 닫기

## 디자인 규칙
- 검색창은 기본 숨김 상태 — 타임라인 UX를 방해하지 않음
- 기존 디자인 토큰만 사용, 새 색상 변수 추가 금지
- 검색 결과도 기존 `FilmFrame` 컴포넌트 그대로 사용
- 입력 중에는 로딩 스피너 대신 디바운스로 자연스럽게 처리

## 검증
- [ ] 검색 아이콘 탭 시 입력창 토글 확인
- [ ] 키워드 입력 시 제목/내용에 포함된 프레임만 표시 확인
- [ ] 대소문자 구분 없이 검색되는지 확인
- [ ] 검색 결과 없을 때 빈 상태 메시지 표시 확인
- [ ] X 버튼으로 검색 초기화 시 기존 목록 복원 확인
- [ ] 디바운스 동작 확인 (입력 중 과도한 API 호출 없음)

## 커밋 메시지
```
feat: add keyword search for film frames in RollPage
```
