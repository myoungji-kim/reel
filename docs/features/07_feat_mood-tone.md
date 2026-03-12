# 무드 기반 필름 톤 (Mood Tone)

## 사전 준비
- `docs/00_context_project-overview.md` 읽기
- 관련 파일:
  - `frontend/src/components/FilmFrame.tsx`
  - `frontend/src/components/FrameOverlay.tsx`
  - `frontend/src/styles/tokens.css`
  - `frontend/src/styles/index.css`
  - `backend/src/main/java/com/reel/frame/Frame.java`

## 기능 개요
저장된 프레임의 `mood` 값에 따라 필름 카드의 색조(tone)를 자동으로 변경하여, 그날의 감정이 시각적으로 드러나게 한다.

## UX 의도
같은 필름 레이아웃이어도 그날의 무드에 따라 색감이 달라지면, 타임라인을 훑을 때 감정의 흐름이 느껴진다.
필터를 쓰는 것처럼 기억에 감정 온도가 입혀지는 경험.

## DB 변경
없음. `Frame.mood` 필드 이미 존재.

## API 변경
없음.

## 구현 요청

### 백엔드
- 없음.

### 프론트엔드

1. **`frontend/src/utils/moodTone.ts` 신규 생성**
   - mood 문자열 → CSS 변수 오버라이드 객체를 반환하는 함수 `getMoodToneStyle(mood: string | null): React.CSSProperties`
   - 매핑 규칙:
     - `기쁨` / `설렘` → amber 계열: `--film-tint: rgba(251,191,36,0.12)`, `--film-grain-opacity: 0.4`
     - `슬픔` / `외로움` → 청회색 계열: `--film-tint: rgba(96,125,139,0.18)`, `--film-grain-opacity: 0.55`
     - `평온` / `감사` → 연녹 계열: `--film-tint: rgba(134,171,141,0.12)`, `--film-grain-opacity: 0.35`
     - `피곤` / `무기력` → 어두운 sepia: `--film-tint: rgba(80,60,40,0.22)`, `--film-grain-opacity: 0.65`
     - `null` / 그 외 → 빈 객체 반환 (현재 스타일 유지)

2. **`FilmFrame.tsx` 수정**
   - `getMoodToneStyle(frame.mood)` 결과를 카드 루트 엘리먼트의 `style` prop에 스프레드
   - 카드 배경 그래디언트 영역에 `--film-tint` CSS 변수를 `background` 또는 `::after` 오버레이로 적용
   - `--film-grain-opacity` 변수로 grain 레이어 불투명도 제어

3. **`FrameOverlay.tsx` 수정**
   - 오버레이 배경에도 동일한 `getMoodToneStyle` 적용
   - 오버레이 헤더 배경색이 mood tone과 어우러지도록 동일 변수 사용

4. **`tokens.css` 에 변수 기본값 추가**
   - `--film-tint: rgba(0,0,0,0)` (기본값, 투명)
   - `--film-grain-opacity: 0.45` (기존 기본값 유지)
   - **기존 값 변경 금지**, 기본값 선언만 추가

## 디자인 규칙
- 기존 디자인 토큰(`tokens.css`) 값 변경 금지
- 프로토타입 스타일(폰트, 레이아웃, 퍼포레이션 애니메이션) 유지
- tone은 미묘하게 — 색조는 느껴지되 텍스트 가독성 저하 없을 것
- mood가 null이면 현재 디자인과 완전히 동일해야 함

## 검증
- [ ] mood가 `기쁨`인 프레임 → amber 빛 필름 카드 확인
- [ ] mood가 `슬픔`인 프레임 → 청회색 톤 확인
- [ ] mood가 null인 프레임 → 기존 스타일과 동일 확인
- [ ] FrameOverlay 열었을 때 동일한 tone 적용 확인
- [ ] FilmRoll 타임라인에서 여러 mood가 섞였을 때 각각 다른 색조 확인
- [ ] tokens.css 기존 값이 변경되지 않았는지 확인

## 커밋 메시지
```
feat: apply mood-based film tone to FilmFrame and FrameOverlay
```
