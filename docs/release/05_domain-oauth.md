# 도메인 + OAuth Redirect URI 갱신

## OAuth Redirect URI 갱신 (필수)

배포 후 반드시 각 OAuth 콘솔에서 redirect URI를 추가해야 로그인이 동작함.

### Google Cloud Console
1. [console.cloud.google.com](https://console.cloud.google.com) → APIs & Services → Credentials
2. OAuth 2.0 클라이언트 ID 선택
3. **승인된 리디렉션 URI** 추가:
   ```
   https://reel-m41z.onrender.com/api/auth/callback/google
   ```
4. **승인된 JavaScript 원본** 추가:
   ```
   https://reel-film.vercel.app
   ```

### Kakao Developers
1. [developers.kakao.com](https://developers.kakao.com) → 내 애플리케이션
2. **플랫폼** → 웹 사이트 도메인 추가:
   ```
   https://reel-film.vercel.app
   ```
3. **카카오 로그인** → Redirect URI 추가:
   ```
   https://reel-m41z.onrender.com/api/auth/callback/kakao
   ```

### 백엔드 환경변수 확인 (Render)
| 변수명 | 값 |
|--------|-----|
| `FRONTEND_BASE_URL` | `https://reel-film.vercel.app` |

---

## 커스텀 도메인 연결 (선택)

### Vercel 커스텀 도메인
1. Vercel 프로젝트 → Domains
2. 도메인 추가 (e.g. `reel.app`)
3. DNS 레코드 설정: CNAME → `cname.vercel-dns.com`

### Render 커스텀 도메인
1. Render 백엔드 서비스 → Settings → Custom Domain
2. 도메인 추가 (e.g. `api.reel.app`)

### 도메인 연결 후 OAuth URI 재갱신
커스텀 도메인 사용 시 위의 OAuth redirect URI를 새 도메인으로 업데이트.

## 다음 단계

→ [06_monitoring.md](./06_monitoring.md) — 기초 모니터링 설정
