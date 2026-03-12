# 기초 모니터링

## 권장 스택 (무료 티어)

| 도구 | 용도 | 무료 한도 |
|------|------|---------|
| Sentry | 에러 트래킹 (Frontend + Backend) | 5K events/월 |
| UptimeRobot | 업타임 모니터링 | 50 monitors, 5분 간격 |
| Railway 내장 로그 | 백엔드 로그 뷰어 | 무제한 |

---

## Sentry — Frontend

### 설치
```bash
cd frontend
npm install @sentry/react
```

### `frontend/src/main.tsx` 상단에 추가
```typescript
import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: import.meta.env.MODE,
})
```

### 환경변수 추가 (Vercel)
```
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
```

---

## Sentry — Backend

### `backend/build.gradle.kts`에 의존성 추가
```kotlin
implementation("io.sentry:sentry-spring-boot-starter-jakarta:7.+")
```

### `application-prod.yml`에 추가
```yaml
sentry:
  dsn: ${SENTRY_DSN}
  traces-sample-rate: 0.1
  environment: production
```

### 환경변수 추가 (Railway)
```
SENTRY_DSN=https://xxx@sentry.io/xxx
```

---

## UptimeRobot

1. [uptimerobot.com](https://uptimerobot.com) 가입
2. "+ Add New Monitor" → HTTP(s)
3. URL: `https://reel-m41z.onrender.com/api/health`
4. Monitoring Interval: 5분
5. Alert Contact: 이메일 알림 설정

---

## 출시 검증 체크리스트

- [ ] `docker build` 성공 (backend + frontend)
- [ ] Railway 배포 → `GET /actuator/health` → `{"status":"UP"}`
- [ ] Vercel 배포 → 프론트 접속 확인
- [ ] OAuth 로그인 (Google) 동작
- [ ] OAuth 로그인 (Kakao) 동작
- [ ] 채팅 → 현상 → 롤 저장 E2E 플로우
- [ ] 월간 회고 생성 (프레임 3개 이상 계정으로)
- [ ] UptimeRobot 알림 수신 테스트
