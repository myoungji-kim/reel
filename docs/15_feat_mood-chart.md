# 기분 차트 (Mood Chart)

## 사전 준비
- `docs/00_context_project-overview.md` 읽기
- 관련 파일:
  - `frontend/src/pages/RollPage.tsx`
  - `frontend/src/components/frame/RollProgressBar.tsx`
  - `frontend/src/utils/moodTone.ts`
  - `frontend/src/stores/frameStore.ts`
  - `frontend/src/api/frameApi.ts`

## 기능 개요
롤 단위로 24개 프레임의 기분 분포를 시각화한다.
필름 스트립 형태로 각 칸에 mood 색상을 채워 보여주고,
하단에 mood별 빈도를 정리한다.

## UX 의도
"내가 요즘 어떤 감정으로 살고 있나"를 한눈에 알 수 있는 뷰.
롤이 완성되면 24컷의 감정이 한 장의 필름처럼 펼쳐진다.
진행 중인 롤도 지금까지 쌓인 기분을 실시간으로 확인할 수 있다.

## DB 변경
없음. 기존 `frames.mood` 컬럼 활용.

## API 변경
없음. 프론트엔드에서 이미 보유한 frames 데이터로 계산.

## 구현 요청

### 프론트엔드

1. **`MoodChart` 컴포넌트 신규 생성** (`frontend/src/components/frame/MoodChart.tsx`)

   **Props:**
   ```ts
   interface Props {
     frames: Frame[]   // 해당 롤의 프레임 목록 (최대 24개)
     rollSize?: number // 기본값 24
   }
   ```

   **표시 구성 (위→아래):**

   **(A) 필름 스트립 도트**
   - 24칸을 한 줄로 나열
   - 프레임이 있는 칸: `getMoodTintColor(frame.mood)`로 채운 원형 dot (지름 10px)
   - 아직 없는 칸: `rgba(255,255,255,0.08)` dim dot
   - dot 사이 간격 4px, 전체 가로 스크롤 없이 wrap 허용

   **(B) mood 빈도 요약**
   - 기록된 mood별 카운트를 내림차순으로 나열
   - 표시 형식: `🌿 평온  5` `😊 기쁨  4` ...
   - mood가 없는 항목은 표시 안 함
   - 폰트: `Space Mono`, 9px, `var(--cream-muted)`

   **스타일 규칙:**
   - 배경: `var(--bg-card)`
   - 상단 구분선: `1px solid var(--border)`
   - 패딩: 12px 16px
   - 새 색상 추가 금지 — `getMoodTintColor()`의 기존 rgba 값만 사용

2. **`RollPage.tsx` 수정**
   - `RollProgressBar` 아래에 `<MoodChart />` 삽입
   - 현재 롤의 프레임만 필터링해서 전달:
     ```ts
     // roll-stats의 currentRollNum 기준으로 해당 롤 프레임 필터
     const rollFrames = frames.filter(f =>
       Math.ceil(f.frameNum / 24) === currentRollNum
     )
     ```
   - `useQuery(['roll-stats'])` 결과를 `RollProgressBar`와 공유하여 중복 요청 없게

   > **참고:** `useQuery`는 같은 `queryKey`면 캐시를 공유하므로, `RollPage`에서 한 번만 선언하고 두 컴포넌트에 props로 넘기는 것도 가능

3. **`MOOD_OPTIONS` 순서 활용**
   - mood 빈도 정렬 시 `MOOD_OPTIONS` 배열 순서 기준 정렬 (`utils/moodTone.ts` 참조)

## 디자인 규칙
- 차트 높이는 최소화 — 프레임 목록이 주인공, 차트는 보조
- dot는 크지 않게 (지름 10px), 줄 넘김 허용
- 완성된 롤: 24개 dot 전부 채워진 상태로 표시
- 진행 중 롤: 기록된 만큼만 색상, 나머지 dim
- 기분 미입력 프레임은 dot 색상 없이 dim 처리

## 검증
- [ ] 현재 진행 롤의 기분 dot가 정확히 표시되는지 확인
- [ ] 기분 없는 프레임이 dim dot로 표시되는지 확인
- [ ] mood 빈도 요약이 내림차순으로 정렬되는지 확인
- [ ] 프레임이 0개일 때 (신규 유저) 빈 dot 24개만 표시되는지 확인
- [ ] `roll-stats` API 중복 호출 없는지 확인 (쿼리 캐시 공유)

## 커밋 메시지
```
feat: add mood chart to RollPage
```
