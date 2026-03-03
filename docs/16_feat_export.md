# 카드 내보내기 (Export)

## 사전 준비
- `docs/00_context_project-overview.md` 읽기
- 관련 파일:
  - `frontend/src/components/FrameOverlay.tsx`
  - `frontend/src/components/FilmFrame.tsx`
  - `frontend/package.json`

## 기능 개요
FrameOverlay에서 현재 보고 있는 필름 카드를 이미지 파일로 내보낸다.

## UX 의도
마음에 드는 일기를 친구에게 공유하거나 배경화면으로 저장하고 싶을 때.
앱 안에서 찍은 "한 컷"이 SNS에서도 필름 카드로 보이는 경험 — REEL의 미학을 바깥으로 꺼내는 것.

## DB 변경
없음.

## API 변경
없음. 프론트엔드만 변경.

## 구현 요청

### 백엔드
없음.

### 프론트엔드

1. **패키지 추가**
   ```bash
   npm install html2canvas
   ```
   - 또는 `dom-to-image-more` 사용 가능 (더 나은 CSS 지원 시)
   - 선택 기준: 기존 `package.json` 확인 후 이미 설치된 것 있으면 그것 사용

2. **`utils/exportFrame.ts` 신규 생성**
   ```ts
   export async function exportFrameAsImage(element: HTMLElement, filename: string): Promise<void>
   ```
   - `html2canvas(element, { scale: 2, useCORS: true })` 호출 (고해상도 2x)
   - 캔버스를 PNG Blob으로 변환
   - **Web Share API 지원 여부 확인** (`navigator.share && navigator.canShare`)
     - 지원 시: `navigator.share({ files: [File], title: filename })` 호출
     - 미지원 시: `<a download>` 링크 생성 후 클릭하여 다운로드
   - 워터마크: 캔버스 우하단에 `"REEL"` 텍스트 오버레이 추가 (canvas 2D context로 직접 그리기)
     - 폰트: `12px monospace`, 색상: `rgba(255,255,255,0.4)`, 위치: 우하단 8px 여백

3. **`FrameOverlay.tsx` 수정**
   - 오버레이 하단 버튼 영역에 "카드로 저장" 버튼 추가
   - 버튼 탭 시 캡처 대상 ref를 `exportFrameAsImage`에 전달
   - 캡처 중에는 버튼 비활성화 + 로딩 텍스트 ("저장 중...")
   - 캡처 대상 엘리먼트: 필름 카드 DOM (`FilmFrame` 컴포넌트의 루트 또는 오버레이 내 카드 영역)
   - **캡처 시 제외할 요소**: 버튼들, 닫기 X 버튼 (CSS `data-export-exclude` 속성으로 표시 후 캡처 전 임시 숨김)

4. **캡처 영역 설정**
   - 캡처 대상: `FrameOverlay` 내의 카드 콘텐츠 영역 (전체 오버레이가 아닌 카드만)
   - `ref`를 해당 영역에 연결
   - 캡처 전 스크롤 위치 및 transforms 주의 (`scrollY` 보정 필요할 수 있음)

## 디자인 규칙
- "카드로 저장" 버튼: 기존 오버레이 하단 버튼과 동일한 스타일
- 워터마크는 최소화 — 텍스트 가독성이나 이미지 감성을 해치지 않을 불투명도(40% 이하)
- 캡처 결과물이 앱 내 카드와 최대한 동일하게 보일 것 (scale: 2로 선명도 유지)
- 기존 디자인 토큰 변경 없음

## 검증
- [ ] "카드로 저장" 버튼 탭 시 이미지 다운로드 또는 공유 시트 열림 확인
- [ ] 내보낸 이미지에 필름 카드 디자인이 정확히 반영됐는지 확인
- [ ] 이미지 우하단에 "REEL" 워터마크 표시 확인
- [ ] 버튼, 닫기 아이콘 등 UI 요소가 캡처에서 제외됐는지 확인
- [ ] 모바일(iOS/Android)에서 Web Share API 동작 확인
- [ ] 데스크톱에서 파일 다운로드 동작 확인
- [ ] 사진이 포함된 프레임 캡처 시 이미지 정상 포함 확인 (CORS 이슈 없는지)

## 커밋 메시지
```
feat: add export-as-image feature to FrameOverlay using html2canvas
```
