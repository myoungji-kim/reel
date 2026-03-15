# REEL 프로젝트 컨텍스트

## 서비스 개요

**REEL**은 AI와 채팅으로 하루를 대화하면, 그 내용을 AI가 감성적인 일기(필름 프레임)로 현상해주는 앱이다.

핵심 플로우:
1. 사용자가 오늘 있었던 일을 AI와 채팅
2. 대화가 3개 이상 쌓이면 "현상하기" 버튼 활성화
3. Anthropic API가 대화를 일기 형태로 요약 생성
4. 사용자가 미리보기에서 수정 후 저장
5. 필름 롤(타임라인)에 프레임으로 누적 저장

---

## 기술 스택

### 프론트엔드
- React 18 + TypeScript
- Vite
- Zustand (상태관리)
- TanStack Query (서버 상태)
- Axios (API 통신)
- React Router v6
- Tailwind CSS + CSS Variables (기존 디자인 토큰 유지)

### 백엔드
- Java 21 + Spring Boot 3.x
- Spring Security 6 + OAuth2 (Google, Kakao)
- Spring Data JPA + QueryDSL
- PostgreSQL
- Redis (Refresh Token 저장)
- Gradle Kotlin DSL

### 인증
- Google + Kakao OAuth2 소셜 로그인
- JWT: Access Token 30분 / Refresh Token 14일
- Refresh Token Rotation, httpOnly 쿠키

### AI
- Anthropic API
- 모델: `claude-sonnet-4-20250514`
- API 키: 환경변수 `ANTHROPIC_API_KEY`

---

## 전체 공통 규칙

- 프로토타입(`docs/prototype_reel.html`)의 **모든 애니메이션, 색상, 폰트, 레이아웃을 픽셀 단위로 동일하게** 유지할 것
- 특히 필름 퍼포레이션 애니메이션 속도 `40s linear infinite` 변경 금지
- `any` 타입 사용 금지
- 환경변수는 절대 하드코딩 금지
- 각 Phase가 끝나면 반드시 멈추고 확인을 기다릴 것
- Phase 1(설계)은 코드 없이 텍스트로만 보여줄 것

---

## 디자인 토큰 (변경 금지)

```css
--bg: #131008; --bg-mid: #1a1510; --bg-card: #1e1a0f;
--border: #2e2518; --border-light: #3d3220;
--amber: #d4822a; --amber-light: #e8a94a; --amber-pale: #f0c878;
--cream: #f2e8d0; --cream-dim: #c8b898; --cream-muted: #8a7a60;
--fade-green: #7a9e8a;
```

사용 폰트: Bebas Neue, VT323, Noto Sans KR, Noto Serif KR, Space Mono
