# 도메인 + OAuth Redirect URI 갱신

## OAuth Redirect URI 갱신 (필수)

배포 후 반드시 각 OAuth 콘솔에서 redirect URI를 추가해야 로그인이 동작함.

### Google Cloud Console
1. [console.cloud.google.com](https://console.cloud.google.com) → APIs & Services → Credentials
2. OAuth 2.0 클라이언트 ID 선택
3. "승인된 리디렉션 URI" 추가:
   ```
   https://your-backend.railway.app/login/oauth2/code/google
   ```

### Kakao Developers
1. [developers.kakao.com](https://developers.kakao.com) → 내 애플리케이션
2. 플랫폼 → 웹 사이트 도메인 추가:
   ```
   https://your-frontend.vercel.app
   ```
3. 카카오 로그인 → Redirect URI 추가:
   ```
   https://your-backend.railway.app/login/oauth2/code/kakao
   ```

### 백엔드 환경변수 갱신
- `FRONTEND_BASE_URL`: Vercel 실제 URL로 갱신

## 커스텀 도메인 연결 (선택)

### Vercel 커스텀 도메인
1. Vercel 프로젝트 → Settings → Domains
2. 도메인 추가 (e.g. `reel.app`)
3. DNS 레코드 설정: CNAME → `cname.vercel-dns.com`

### Railway 커스텀 도메인
1. Railway 백엔드 서비스 → Settings → Networking
2. Custom Domain 추가 (e.g. `api.reel.app`)

### 도메인 연결 후 OAuth URI 재갱신
커스텀 도메인 사용 시 위의 OAuth redirect URI를 새 도메인으로 업데이트.

## 다음 단계

→ [06_monitoring.md](./06_monitoring.md) — 기초 모니터링 설정
