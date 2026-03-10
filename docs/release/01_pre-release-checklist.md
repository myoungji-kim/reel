# Pre-Release Checklist

## Backend

| 항목 | 상태 | 비고 |
|------|------|------|
| `GlobalExceptionHandler` | ✅ 완료 | `common/exception/GlobalExceptionHandler.java` |
| `AiConfig` WebClient timeout 30s | ✅ 완료 | `config/AiConfig.java` |
| `ddl-auto: validate` (prod) | ✅ 완료 | `application.yml` 기본값 |
| `@Slf4j` 로깅 적용 | ✅ 완료 | 전체 서비스 레이어 |
| `Dockerfile` | ✅ 완료 | `backend/Dockerfile` |

## Frontend

| 항목 | 상태 | 비고 |
|------|------|------|
| QueryClient 글로벌 에러 핸들러 (401→logout, else→toast) | ✅ 완료 | `main.tsx` |
| `console.log` 제거 | ✅ 완료 | 전체 제거 확인됨 |
| `ErrorBoundary` 컴포넌트 | ✅ 완료 | `components/ErrorBoundary.tsx` |
| favicon | ✅ 완료 | `public/favicon.svg` |
| `Dockerfile` | ✅ 완료 | `frontend/Dockerfile` |
| `nginx.conf` | ✅ 완료 | `frontend/nginx.conf` (SPA fallback) |
| `vercel.json` | ✅ 완료 | `frontend/vercel.json` (SPA rewrites) |

## AI 모델 주의사항

현재 `application.yml`에 `anthropic.model=llama-3.3-70b-versatile` (Groq API 사용 중).
- Groq 유지 시: `ANTHROPIC_API_KEY` 환경변수명을 `GROQ_API_KEY`로 변경 권장
- Anthropic으로 교체 시: `api-url`을 `https://api.anthropic.com` 으로, 모델을 `claude-sonnet-4-20250514`로 변경

## 다음 단계

→ [02_dockerize.md](./02_dockerize.md) — Docker 빌드 검증
