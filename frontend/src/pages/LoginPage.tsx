const API_BASE = import.meta.env.VITE_API_BASE_URL as string

export default function LoginPage() {
  const handleLogin = (provider: 'google' | 'kakao') => {
    window.location.href = `${API_BASE}/api/auth/login/${provider}`
  }

  return (
    <div style={styles.root}>
      {/* 필름 퍼포레이션 */}
      <div style={styles.filmStrip}>
        {Array.from({ length: 24 }).map((_, i) => (
          <div key={i} style={styles.hole} />
        ))}
      </div>

      <div style={styles.content}>
        {/* 로고 */}
        <div style={styles.logo}>REEL</div>
        <p style={styles.tagline}>하루를 현상하다</p>
        <p style={styles.desc}>
          AI와 오늘 하루를 나누면,
          <br />
          감성적인 일기 한 장으로 현상해드릴게요.
        </p>

        {/* 로그인 버튼 */}
        <div style={styles.btnGroup}>
          <button style={styles.btnGoogle} onClick={() => handleLogin('google')}>
            <span style={styles.btnIcon}>G</span>
            Google로 계속하기
          </button>
          <button style={styles.btnKakao} onClick={() => handleLogin('kakao')}>
            <span style={styles.btnIcon}>K</span>
            Kakao로 계속하기
          </button>
        </div>
      </div>

      {/* 하단 필름 퍼포레이션 */}
      <div style={styles.filmStrip}>
        {Array.from({ length: 24 }).map((_, i) => (
          <div key={i} style={styles.hole} />
        ))}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    maxWidth: 440,
    margin: '0 auto',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--bg)',
    overflow: 'hidden',
  },
  filmStrip: {
    flexShrink: 0,
    height: 20,
    background: 'var(--bg-mid)',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    padding: '0 8px',
    gap: 6,
    overflow: 'hidden',
  },
  hole: {
    width: 10,
    height: 7,
    borderRadius: 1,
    background: 'var(--bg)',
    border: '1px solid var(--border-light)',
    flexShrink: 0,
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 32px',
    gap: 0,
  },
  logo: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 72,
    color: 'var(--amber-pale)',
    letterSpacing: '0.1em',
    lineHeight: 1,
    marginBottom: 10,
  },
  tagline: {
    fontFamily: "'Noto Serif KR', serif",
    fontSize: 15,
    color: 'var(--cream-dim)',
    fontWeight: 300,
    marginBottom: 24,
    letterSpacing: '0.05em',
  },
  desc: {
    fontFamily: "'Noto Sans KR', sans-serif",
    fontSize: 13,
    color: 'var(--cream-muted)',
    fontWeight: 300,
    textAlign: 'center',
    lineHeight: 1.8,
    marginBottom: 48,
  },
  btnGroup: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  btnGoogle: {
    width: '100%',
    padding: '14px 20px',
    background: 'rgba(242,232,208,0.06)',
    border: '1px solid var(--border-light)',
    borderRadius: 10,
    color: 'var(--cream)',
    fontFamily: "'Space Mono', monospace",
    fontSize: 12,
    letterSpacing: '0.06em',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    transition: 'background 0.2s',
  },
  btnKakao: {
    width: '100%',
    padding: '14px 20px',
    background: 'linear-gradient(135deg, var(--amber-light), var(--amber))',
    border: 'none',
    borderRadius: 10,
    color: 'var(--bg)',
    fontFamily: "'Space Mono', monospace",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.06em',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    boxShadow: '0 3px 12px var(--amber-35)',
    transition: 'opacity 0.2s',
  },
  btnIcon: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 16,
    lineHeight: 1,
  },
}
