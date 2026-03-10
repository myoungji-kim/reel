# 백엔드 배포 — Railway

## 권장 플랫폼: Railway

PostgreSQL + Redis + Spring Boot를 단일 플랫폼에서 관리. 무료 티어(Hobby) $5/월.

## 절차

### 1. Railway 프로젝트 생성
1. [railway.app](https://railway.app) 접속 → New Project
2. "Deploy from GitHub repo" → `reel` 저장소 선택
3. Root Directory: `backend`

### 2. 데이터베이스 추가
- "+ New" → PostgreSQL 플러그인 추가 → `DATABASE_URL` 자동 주입
- "+ New" → Redis 플러그인 추가 → `REDIS_URL` 자동 주입

### 3. 환경변수 설정

| 변수명 | 값 |
|--------|-----|
| `SPRING_PROFILES_ACTIVE` | `prod` |
| `DB_HOST` | Railway PostgreSQL 호스트 |
| `DB_PORT` | `5432` |
| `DB_NAME` | Railway PostgreSQL DB명 |
| `DB_USERNAME` | Railway PostgreSQL 유저 |
| `DB_PASSWORD` | Railway PostgreSQL 패스워드 |
| `REDIS_HOST` | Railway Redis 호스트 |
| `REDIS_PORT` | `6379` |
| `JWT_SECRET` | 32자 이상 랜덤 문자열 |
| `ANTHROPIC_API_KEY` | Groq 또는 Anthropic API 키 |
| `GOOGLE_CLIENT_ID` | Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Google Cloud Console |
| `KAKAO_CLIENT_ID` | Kakao Developers |
| `KAKAO_CLIENT_SECRET` | Kakao Developers |
| `FRONTEND_BASE_URL` | Vercel 배포 URL (e.g. `https://reel.vercel.app`) |

> Railway PostgreSQL 연결 정보는 서비스 탭 → Variables에서 확인

### 4. 헬스체크 확인

Spring Actuator가 필요하다면 `build.gradle.kts`에 추가:
```kotlin
implementation("org.springframework.boot:spring-boot-starter-actuator")
```

배포 후: `GET https://your-backend.railway.app/actuator/health` → `{"status":"UP"}`

### 5. 파일 업로드 경로

현재 `upload.path=uploads` (로컬 파일시스템). 프로덕션에서는 S3 또는 Railway Volume으로 교체 권장.
임시 방편: Railway Volume 마운트 `/app/uploads`

## 다음 단계

→ [04_deploy-frontend.md](./04_deploy-frontend.md) — Vercel 프론트엔드 배포
