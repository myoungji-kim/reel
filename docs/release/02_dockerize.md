# Dockerize

## 파일 위치

| 파일 | 경로 |
|------|------|
| Backend Dockerfile | `backend/Dockerfile` |
| Frontend Dockerfile | `frontend/Dockerfile` |
| Frontend nginx 설정 | `frontend/nginx.conf` |
| 프로덕션 compose (참고용) | `docker-compose.prod.yml` |

## 로컬 빌드 검증

```bash
# Backend 빌드
cd backend
docker build -t reel-backend .

# Frontend 빌드
cd frontend
docker build --build-arg VITE_API_BASE_URL=http://localhost:8080 -t reel-frontend .

# 통합 실행 (프로덕션 compose)
cd ..
cp .env.example .env   # 환경변수 설정
docker-compose -f docker-compose.prod.yml up
```

## `.env.example`

```env
DB_NAME=reel
DB_USERNAME=reel
DB_PASSWORD=yourpassword
JWT_SECRET=your-jwt-secret-min-32-chars
ANTHROPIC_API_KEY=your-api-key
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
KAKAO_CLIENT_ID=
KAKAO_CLIENT_SECRET=
FRONTEND_BASE_URL=http://localhost
VITE_API_BASE_URL=http://localhost:8080
```

## 다음 단계

→ [03_deploy-backend.md](./03_deploy-backend.md) — Railway 백엔드 배포
