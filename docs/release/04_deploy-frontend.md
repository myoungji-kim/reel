# 프론트엔드 배포 — Vercel

## 권장 플랫폼: Vercel

Vite/React 최적화, GitHub 연동 자동 배포, 무료 티어 충분.

## 절차

### 1. Vercel 프로젝트 생성
1. [vercel.com](https://vercel.com) → New Project
2. GitHub 저장소 연결 → `reel`
3. **Root Directory**: `frontend`
4. Framework Preset: **Vite**

### 2. 빌드 설정

| 항목 | 값 |
|------|-----|
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm ci` |

### 3. 환경변수

| 변수명 | 값 |
|--------|-----|
| `VITE_API_BASE_URL` | `https://your-backend.onrender.com` |

### 4. SPA 라우팅

`frontend/vercel.json` 이미 설정됨:
```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

### 5. 배포 확인

1. Vercel 대시보드에서 배포 상태 확인
2. 배포 URL 접속 → 로그인 페이지 표시 확인
3. 다음 단계(OAuth redirect URI)를 완료한 후 로그인 테스트

## 다음 단계

→ [05_domain-oauth.md](./05_domain-oauth.md) — OAuth redirect URI 갱신
