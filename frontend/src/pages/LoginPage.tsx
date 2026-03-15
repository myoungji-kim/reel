import { useEffect } from 'react'
import { useToast } from '../hooks/useToast'

const API_BASE = import.meta.env.VITE_API_BASE_URL as string

export default function LoginPage() {
  const { showToast } = useToast()

  useEffect(() => {
    const flash = localStorage.getItem('reel_flash')
    if (flash) {
      localStorage.removeItem('reel_flash')
      showToast(flash)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogin = (provider: 'google' | 'kakao') => {
    window.location.href = `${API_BASE}/api/auth/login/${provider}`
  }

  return (
    <div style={styles.root}>
      {/* 상단 필름 퍼포레이션 */}
      <div style={styles.filmStripTop}>
        {Array.from({ length: 60 }).map((_, i) => (
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
      <div style={styles.filmStripBottom}>
        {Array.from({ length: 60 }).map((_, i) => (
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
    height: '100dvh',
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--bg)',
  },
  filmStripTop: {
    flexShrink: 0,
    height: 'calc(20px + env(safe-area-inset-top))',
    paddingTop: 'env(safe-area-inset-top)',
    paddingLeft: 8,
    paddingRight: 8,
    paddingBottom: 4,
    background: '#2c2418',
    borderBottom: '1px solid #3a3028',
    display: 'flex',
    alignItems: 'flex-end',
    gap: 6,
    overflow: 'hidden',
  },
  filmStripBottom: {
    flexShrink: 0,
    height: 'calc(20px + env(safe-area-inset-bottom))',
    paddingBottom: 'env(safe-area-inset-bottom)',
    paddingLeft: 8,
    paddingRight: 8,
    paddingTop: 4,
    background: '#2c2418',
    borderTop: '1px solid #3a3028',
    display: 'flex',
    alignItems: 'flex-start',
    gap: 6,
    overflow: 'hidden',
  },
  hole: {
    width: 10,
    height: 7,
    borderRadius: 1,
    background: '#f5f2ed',
    border: '1px solid #3a3028',
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
    fontFamily: "var(--font-display)",
    fontWeight: 600,
    fontStyle: 'italic',
    fontSize: 80,
    color: 'var(--text-primary)',
    letterSpacing: '0.04em',
    lineHeight: 1,
    marginBottom: 10,
  },
  tagline: {
    fontFamily: "var(--font-display)",
    fontStyle: 'italic',
    fontSize: 16,
    color: 'var(--text-secondary)',
    fontWeight: 300,
    marginBottom: 24,
    letterSpacing: '0.04em',
  },
  desc: {
    fontFamily: "var(--font-body)",
    fontSize: 13,
    color: 'var(--text-muted)',
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
    background: 'var(--surface-card)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)',
    fontFamily: "var(--font-mono)",
    fontSize: 12,
    letterSpacing: '0.04em',
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
    background: '#c8a96e',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    color: '#1a1814',
    fontFamily: "var(--font-mono)",
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: '0.04em',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    transition: 'opacity 0.2s',
  },
  btnIcon: {
    fontFamily: "var(--font-mono)",
    fontSize: 14,
    fontWeight: 600,
    lineHeight: 1,
  },
}
