# REEL

AI와 채팅으로 하루를 기록하면, 감성적인 일기(필름 프레임)로 현상해주는 앱.

---

## 로컬 실행 방법

### 1. 인프라 실행

```bash
docker-compose up -d
```

PostgreSQL (5432), Redis (6379) 가 실행됩니다.

### 2. 백엔드 실행

```bash
cd backend

# 환경변수 설정 (아래 목록 참고)
export DB_NAME=reel
export DB_USERNAME=reel
export DB_PASSWORD=reel
export JWT_SECRET=<최소 32자 이상의 랜덤 문자열>
export ANTHROPIC_API_KEY=<Anthropic API 키>
export GOOGLE_CLIENT_ID=<Google OAuth2 Client ID>
export GOOGLE_CLIENT_SECRET=<Google OAuth2 Client Secret>
export KAKAO_CLIENT_ID=<Kakao REST API 키>
export KAKAO_CLIENT_SECRET=<Kakao Client Secret>

./gradlew bootRun --args='--spring.profiles.active=local'
```

### 3. 프론트엔드 실행

```bash
cd frontend

cp .env.example .env
# .env 내용 확인 후 필요 시 수정

npm install
npm run dev
```

브라우저에서 http://localhost:5173 접속

---

## 필요한 환경변수

| 변수명 | 설명 |
|--------|------|
| `DB_NAME` | PostgreSQL 데이터베이스 이름 |
| `DB_USERNAME` | PostgreSQL 사용자명 |
| `DB_PASSWORD` | PostgreSQL 비밀번호 |
| `JWT_SECRET` | JWT 서명 키 (32자 이상 랜덤 문자열) |
| `ANTHROPIC_API_KEY` | Anthropic API 키 |
| `GOOGLE_CLIENT_ID` | Google OAuth2 클라이언트 ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth2 클라이언트 시크릿 |
| `KAKAO_CLIENT_ID` | Kakao REST API 키 |
| `KAKAO_CLIENT_SECRET` | Kakao 클라이언트 시크릿 |

### 프로덕션 추가 변수

| 변수명 | 설명 |
|--------|------|
| `DB_HOST` | PostgreSQL 호스트 |
| `DB_PORT` | PostgreSQL 포트 (기본 5432) |
| `REDIS_HOST` | Redis 호스트 |
| `REDIS_PORT` | Redis 포트 (기본 6379) |
| `FRONTEND_BASE_URL` | 프론트엔드 배포 URL (CORS 허용) |

---

## 기술 스택

- **Frontend**: React 18 + TypeScript, Vite, Zustand, TanStack Query, Axios, React Router v6, Tailwind CSS
- **Backend**: Java 21, Spring Boot 3, Spring Security 6 + OAuth2, Spring Data JPA + QueryDSL, PostgreSQL, Redis
- **AI**: Anthropic API (`claude-sonnet-4-20250514`)
