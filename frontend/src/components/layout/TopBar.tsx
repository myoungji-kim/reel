import { useRef, useState, useEffect } from 'react'
import { Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useUIStore } from '../../stores/uiStore'
import { useAuthStore } from '../../stores/authStore'
import { logout } from '../../api/authApi'

export default function TopBar() {
  const { setArchivedOpen } = useUIStore()
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
          <div style={styles.logo}>reel</div>
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
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  topbar: {
    flexShrink: 0,
    background: 'var(--surface-base)',
    borderBottom: '1px solid var(--border-default)',
  },
  inner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
  },
  logo: {
    fontFamily: "var(--font-display)",
    fontWeight: 600,
    fontStyle: 'italic',
    fontSize: 20,
    color: 'var(--text-primary)',
    lineHeight: 1,
  },
  menuWrapper: {
    position: 'relative',
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
