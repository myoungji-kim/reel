# Phase 6 — 마무리 & 공통 처리

## 사전 준비

`docs/00_context_project-overview.md` 를 읽고 컨텍스트를 확인해줘.
Phase 1~5가 완료된 상태야. 이번이 마지막 단계야.

---

## 요청사항

### 백엔드

1. `ErrorCode` enum 완성
   ```
   UNAUTHORIZED, TOKEN_EXPIRED, TOKEN_INVALID
   USER_NOT_FOUND
   SESSION_NOT_FOUND, ALREADY_DEVELOPED
   FRAME_NOT_FOUND
   AI_RESPONSE_ERROR, AI_PARSE_ERROR
   INTERNAL_SERVER_ERROR
   ```

2. `GlobalExceptionHandler` 완성
    - 각 `ErrorCode`에 맞는 HTTP 상태코드 매핑
    - 모든 예외를 `ApiResponse` 형태로 통일 반환
    - `AnthropicClient` 타임아웃 / 파싱 실패 예외 처리 포함

3. `AiConfig`
    - Anthropic API 호출 타임아웃 30초 설정
    - `RestTemplate` or `WebClient` 빈 등록

4. 전체 코드 점검
    - 누락된 `@Transactional` 확인
    - N+1 쿼리 발생 가능한 부분 확인 및 `@EntityGraph` or fetch join 적용
    - 불필요한 `System.out.println` 제거, 로깅 `@Slf4j`로 통일

### 프론트엔드

1. React Query 글로벌 에러 핸들러 (`QueryClient` 설정)
    - 401 → `authStore` 초기화 후 `/` 로 이동
    - 그 외 → 간단한 에러 토스트 표시 (커스텀 훅 `useToast` 로 구현)

2. 로딩 UX 통일
    - 채팅 메시지 전송 중: `ChatInput` 비활성화 + `TypingIndicator` 표시
    - 현상 중: `DevelopingOverlay` 표시
    - 프레임 목록 로딩 중: `FilmFrame` 스켈레톤 3개 표시

3. 전체 코드 점검
    - `any` 타입 전체 제거
    - 불필요한 `console.log` 제거
    - 컴포넌트 props 타입 누락 확인

4. `.env.example` 최종 확인
   ```
   VITE_API_BASE_URL=http://localhost:8080
   ```

5. `README.md` 최종 업데이트
    - 프로젝트 소개
    - 로컬 실행 방법:
      ```bash
      # 1. 인프라 실행
      docker-compose up -d
 
      # 2. 백엔드 실행
      cd backend && ./gradlew bootRun --args='--spring.profiles.active=local'
 
      # 3. 프론트엔드 실행
      cd frontend && npm install && npm run dev
      ```
    - 필요한 환경변수 목록 (백엔드 / 프론트엔드 구분)

---

## 완료 후 보여줄 것

1. 전체 구현 완료 요약 (Phase별)
2. 로컬 실행 커맨드
3. 추가로 고려하면 좋을 사항 (배포, 모니터링, 테스트 등)

마지막으로 아래 커밋 메시지로 커밋해줘:
```
chore: cleanup and production readiness

- ErrorCode / GlobalExceptionHandler 완성
- React Query 글로벌 에러 핸들러 추가
- 로딩 UX 통일 (스켈레톤, 인디케이터)
- any 타입 제거 및 console.log 정리
- README 최종 업데이트
```
