import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUIStore } from '../../stores/uiStore'
import { useAuthStore } from '../../stores/authStore'
import { logout } from '../../api/authApi'

export default function TopBar() {
  const { activeTab, setActiveTab } = useUIStore()
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
    } finally {
      clearAuth()
      navigate('/', { replace: true })
    }
  }

  return (
    <div style={styles.topbar}>
      <div style={styles.inner}>
        <div style={styles.logo}>REEL</div>
        <div style={styles.tabs}>
          <button
            style={{
              ...styles.tab,
              color: activeTab === 'chat' ? 'var(--amber-light)' : 'var(--cream-muted)',
              borderBottom: activeTab === 'chat'
                ? '2px solid var(--amber)'
                : '2px solid transparent',
            }}
            onClick={() => setActiveTab('chat')}
          >
            ◈ 오늘의 현장
          </button>
          <button
            style={{
              ...styles.tab,
              color: activeTab === 'roll' ? 'var(--amber-light)' : 'var(--cream-muted)',
              borderBottom: activeTab === 'roll'
                ? '2px solid var(--amber)'
                : '2px solid transparent',
            }}
            onClick={() => setActiveTab('roll')}
          >
            ◆ 필름 롤
          </button>
        </div>
        <div ref={menuRef} style={styles.menuWrapper}>
          <button style={styles.settingsBtn} onClick={() => setMenuOpen((v) => !v)}>
            ⚙
          </button>
          {menuOpen && (
            <div style={styles.dropdown}>
              <button style={styles.dropdownItem} onClick={handleLogout}>
                로그아웃
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  topbar: {
    flexShrink: 0,
    background: 'var(--bg)',
    borderBottom: '1px solid var(--border)',
  },
  inner: {
    display: 'flex',
    alignItems: 'center',
    padding: '14px 20px 0',
  },
  logo: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 26,
    color: 'var(--amber-pale)',
    letterSpacing: '0.08em',
    marginRight: 16,
    lineHeight: 1,
  },
  tabs: {
    display: 'flex',
    flex: 1,
  },
  tab: {
    padding: '8px 16px 12px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontFamily: "'Space Mono', monospace",
    fontSize: 10,
    letterSpacing: '0.08em',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
  },
  menuWrapper: {
    position: 'relative',
    paddingBottom: 12,
  },
  settingsBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: 16,
    color: 'var(--cream-muted)',
    padding: '0 4px',
    lineHeight: 1,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    minWidth: 120,
    zIndex: 100,
  },
  dropdownItem: {
    display: 'block',
    width: '100%',
    padding: '10px 16px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontFamily: "'Space Mono', monospace",
    fontSize: 10,
    letterSpacing: '0.08em',
    color: 'var(--cream-muted)',
    textAlign: 'left',
  },
}
