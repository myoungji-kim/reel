# REEL

AI와 채팅으로 하루를 기록하면, 감성적인 일기(필름 프레임)로 현상해주는 앱.

---

## 사전 요구사항

### Java 21

```bash
# Ubuntu / WSL
sudo apt update
sudo apt install -y openjdk-21-jdk
java -version  # openjdk 21 확인
```

```bash
# macOS (Homebrew)
brew install openjdk@21
java -version
```

### Node.js 18+

```bash
# Ubuntu / WSL
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v  # v20.x 확인
```

```bash
# macOS
brew install node
```

### Docker & Docker Compose

- [Docker Desktop 설치](https://www.docker.com/products/docker-desktop/)
- WSL 사용 시 Docker Desktop → Settings → Resources → WSL Integration 활성화

---

## 로컬 실행 방법

### 1. 인프라 실행

```bash
docker-compose up -d
```

PostgreSQL (5432), Redis (6379) 가 실행됩니다.

### 2. 환경변수 설정

```bash
cd backend
cp .env.example .env  # 파일이 없으면 직접 생성
```

`backend/.env` 파일을 열어 실제 값으로 채워줘:

```
DB_NAME=reel
DB_USERNAME=reel
DB_PASSWORD=reel
JWT_SECRET=<최소 32자 이상의 랜덤 문자열>
ANTHROPIC_API_KEY=<Anthropic API 키>
GOOGLE_CLIENT_ID=<Google OAuth2 Client ID>
GOOGLE_CLIENT_SECRET=<Google OAuth2 Client Secret>
KAKAO_CLIENT_ID=<Kakao REST API 키>
KAKAO_CLIENT_SECRET=<Kakao Client Secret>
```

> `.env` 파일은 `.gitignore`에 포함되어 있어 커밋되지 않습니다.

### 3. 백엔드 실행

**방법 A: Gradle**

```bash
cd backend
./gradlew bootRun --args='--spring.profiles.active=local'
```

**방법 B: IntelliJ IDEA GUI 실행**

IntelliJ에서 `ReelApplication`을 직접 실행할 경우 `.env` 파일이 자동으로 로드되지 않습니다.
[EnvFile 플러그인](https://plugins.jetbrains.com/plugin/7861-envfile)을 설치한 후 아래와 같이 설정하세요:

1. 상단 실행 버튼 옆 드롭다운 → **Edit Configurations...**
2. `ReelApplication` 선택
3. **EnvFile 탭** → `+` 버튼 클릭 → `backend/.env` 파일 선택
4. **Enable EnvFile** 체크 후 저장

`http://localhost:8080` 에서 실행됩니다.

### 4. 프론트엔드 실행

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

브라우저에서 http://localhost:5173 접속

---

## 필요한 환경변수

### 백엔드

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

### 백엔드 (프로덕션 추가)

| 변수명 | 설명 |
|--------|------|
| `DB_HOST` | PostgreSQL 호스트 |
| `DB_PORT` | PostgreSQL 포트 (기본 5432) |
| `REDIS_HOST` | Redis 호스트 |
| `REDIS_PORT` | Redis 포트 (기본 6379) |
| `FRONTEND_BASE_URL` | 프론트엔드 배포 URL (CORS 허용) |

### 프론트엔드

| 변수명 | 설명 |
|--------|------|
| `VITE_API_BASE_URL` | 백엔드 API 베이스 URL (기본 `http://localhost:8080`) |

---

## 기술 스택

- **Frontend**: React 18 + TypeScript, Vite, Zustand, TanStack Query, Axios, React Router v6, Tailwind CSS
- **Backend**: Java 21, Spring Boot 3, Spring Security 6 + OAuth2, Spring Data JPA + QueryDSL, PostgreSQL, Redis
- **AI**: Anthropic API (`claude-sonnet-4-20250514`)
