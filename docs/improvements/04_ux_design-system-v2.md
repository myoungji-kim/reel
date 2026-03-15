# Reel 디자인 시스템 v2 — 인덱스
> 이 파일은 목차입니다. 각 작업은 하위 파일을 참고하세요.

| 파일 | 내용 | 작업 대상 |
|---|---|---|
| [04_1_design-tokens.md](./04_1_design-tokens.md) | 컬러·폰트·Grain·필름스트립 | `tokens.css`, `index.css` |
| [04_2_bottom-nav.md](./04_2_bottom-nav.md) | 바텀 탭바 + FAB | `BottomNav.tsx` (신규) |
| [04_3_home-bento.md](./04_3_home-bento.md) | 홈 화면 벤토 그리드 | `HomePage.tsx` |
| [04_4_chat-develop.md](./04_4_chat-develop.md) | 하루 현상 채팅 + 현상 애니메이션 | `ChatPage.tsx`, `MessageBubble.tsx` |
| [04_5_filmroll.md](./04_5_filmroll.md) | ROLL 탭 + GRID(캘린더) 탭 | `FilmFrame.tsx`, `CalendarView.tsx` |
| [04_6_result-view.md](./04_6_result-view.md) | 현상 결과 화면 | `PreviewOverlay.tsx`, `FrameOverlay.tsx` |
| [04_7_checklist.md](./04_7_checklist.md) | 전체 구현 체크리스트 | 검수용 |

## 작업 순서 (권장)

1. `04_1` 토큰 먼저 적용 → 앱 전체 컬러 기반 변경
2. `04_5` 필름롤 카드 수정 → 가장 자주 보이는 화면
3. `04_4` 채팅 말풍선 수정
4. `04_2` 바텀 내비 구조 변경 → 영향 범위 큼
5. `04_3` 홈 벤토 그리드
6. `04_6` 현상 결과 화면
7. `04_7` 체크리스트 전체 확인
