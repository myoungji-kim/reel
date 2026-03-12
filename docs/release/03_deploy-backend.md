# 백엔드 배포 — Render + Upstash

## 플랫폼 구성 (완전 무료)

| 서비스 | 플랫폼 | 비고 |
|--------|--------|------|
| Spring Boot | Render | 무료 (15분 비활성 시 슬립) |
| PostgreSQL | Render | 무료 (90일, 이후 $7/월) |
| Redis | Upstash | 무료 티어 (10K req/일) |

## 절차

### 1. Upstash Redis 생성
1. [upstash.com](https://upstash.com) → GitHub 로그인
2. **Create Database** → Redis 선택
3. Region: `ap-northeast-1` (도쿄)
4. 생성 후 **Endpoint**, **Port**, **Password** 복사해두기

### 2. Render PostgreSQL 생성
1. [render.com](https://render.com) → GitHub 로그인
2. **New** → **PostgreSQL**
3. Plan: **Free** → 생성
4. 생성 후 **Hostname**, **Port**, **Database**, **Username**, **Password** 복사해두기

### 3. Render Web Service 생성 (백엔드)
1. **New** → **Web Service**
2. `reel` 저장소 연결
3. 설정:
   - **Root Directory**: `backend`
   - **Runtime**: Docker
   - **Plan**: Free

### 4. 환경변수 설정

Web Service → **Environment** 탭에 입력:

| 변수명 | 값 |
|--------|-----|
| `SPRING_PROFILES_ACTIVE` | `prod` |
| `DB_HOST` | Render PostgreSQL Hostname |
| `DB_PORT` | `5432` |
| `DB_NAME` | Render PostgreSQL Database명 |
| `DB_USERNAME` | Render PostgreSQL Username |
| `DB_PASSWORD` | Render PostgreSQL Password |
| `REDIS_HOST` | Upstash Endpoint |
| `REDIS_PORT` | Upstash Port |
| `REDIS_PASSWORD` | Upstash Password |
| `JWT_SECRET` | 32자 이상 랜덤 문자열 |
| `ANTHROPIC_API_KEY` | Anthropic API 키 |
| `GOOGLE_CLIENT_ID` | Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Google Cloud Console |
| `KAKAO_CLIENT_ID` | Kakao Developers |
| `KAKAO_CLIENT_SECRET` | Kakao Developers |
| `FRONTEND_BASE_URL` | `https://reel-film.vercel.app` |

### 5. Redis 패스워드 설정 확인

Upstash는 패스워드 인증이 필요하므로 `application-prod.yml`에 Redis password 설정 확인:

```yaml
spring:
  data:
    redis:
      host: ${REDIS_HOST}
      port: ${REDIS_PORT}
      password: ${REDIS_PASSWORD}
```

### 6. 배포 확인

배포 후 Render 제공 URL로 헬스체크:
```
GET https://your-backend.onrender.com/api/auth/health
```

또는 Spring Actuator 사용 시 `build.gradle.kts`에 추가:
```kotlin
implementation("org.springframework.boot:spring-boot-starter-actuator")
```
```
GET https://your-backend.onrender.com/actuator/health
→ {"status":"UP"}
```

### 7. 파일 업로드 경로

현재 `upload.path=uploads` (로컬 파일시스템). Render는 재배포 시 파일이 사라지므로 추후 S3 교체 권장.
임시 방편: Render Disk 마운트 (`/app/uploads`, 무료 플랜 미지원 → 유료 필요)

→ S3 교체 가이드: [07_s3-file-upload.md](./07_s3-file-upload.md)

## 다음 단계

→ [04_deploy-frontend.md](./04_deploy-frontend.md) — Vercel 프론트엔드 배포
