import { useUIStore } from '../../stores/uiStore'

export default function TopBar() {
  const { activeTab, setActiveTab } = useUIStore()

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
}
