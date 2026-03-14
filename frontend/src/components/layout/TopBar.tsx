import { useRef, useState, useEffect } from 'react'
import { Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useUIStore } from '../../stores/uiStore'
import { useAuthStore } from '../../stores/authStore'
import { logout } from '../../api/authApi'

export default function TopBar() {
  const { activeTab, setActiveTab, setArchivedOpen } = useUIStore()
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
    <div>
      <div style={styles.topbar}>
        <div style={styles.inner}>
          <div style={styles.logo}>REEL</div>
          <div style={styles.tabs}>
            <button
              style={{
                ...styles.tab,
                color: activeTab === 'chat' ? 'var(--text-primary)' : 'var(--text-muted)',
                borderBottom: activeTab === 'chat'
                  ? '1.5px solid var(--accent-gold)'
                  : '1.5px solid transparent',
              }}
              onClick={() => setActiveTab('chat')}
            >
              ◈ 하루 현상
            </button>
            <button
              style={{
                ...styles.tab,
                color: activeTab === 'roll' ? 'var(--text-primary)' : 'var(--text-muted)',
                borderBottom: activeTab === 'roll'
                  ? '1.5px solid var(--accent-gold)'
                  : '1.5px solid transparent',
              }}
              onClick={() => setActiveTab('roll')}
            >
              ◆ 현상소
            </button>
          </div>
          <div ref={menuRef} style={styles.menuWrapper}>
            <button style={styles.settingsBtn} onClick={() => setMenuOpen((v) => !v)} aria-label="메뉴">
              <Settings size={16} />
            </button>
            {menuOpen && (
              <div style={styles.dropdown}>
                <button style={styles.dropdownItem} onClick={() => { setArchivedOpen(true); setMenuOpen(false) }}>
                  보관된 필름
                </button>
                <div style={styles.dropdownDivider} />
                <button style={styles.dropdownItem} onClick={handleLogout}>
                  로그아웃
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div style={styles.filmStrip}>
        {Array.from({ length: 40 }, (_, i) => (
          <div key={i} style={styles.filmHole} />
        ))}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  topbar: {
    flexShrink: 0,
    background: 'var(--surface-base)',
  },
  inner: {
    display: 'flex',
    alignItems: 'center',
    padding: '14px 20px 0',
  },
  logo: {
    fontFamily: "var(--font-display)",
    fontWeight: 600,
    fontStyle: 'italic',
    fontSize: 22,
    color: 'var(--text-primary)',
    letterSpacing: '0.02em',
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
    fontFamily: "var(--font-body)",
    fontSize: 'var(--text-sm)' as unknown as number,
    letterSpacing: '0.04em',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
  },
  filmStrip: {
    height: 10,
    background: 'var(--surface-base)',
    borderTop: '1px solid var(--border-default)',
    borderBottom: '1px solid var(--border-default)',
    display: 'flex',
    alignItems: 'center',
    gap: 3,
    padding: '0 8px',
    overflow: 'hidden',
    flexShrink: 0,
  },
  filmHole: {
    width: 10,
    height: 6,
    border: '1px solid var(--border-default)',
    borderRadius: 1,
    background: 'var(--surface-base)',
    flexShrink: 0,
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
  dropdownDivider: {
    height: 1,
    background: 'var(--border)',
    margin: '0 12px',
  },
  dropdownItem: {
    display: 'block',
    width: '100%',
    padding: '10px 16px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontFamily: "var(--font-mono)",
    fontSize: 10,
    letterSpacing: '0.08em',
    color: 'var(--cream-muted)',
    textAlign: 'left',
  },
}
