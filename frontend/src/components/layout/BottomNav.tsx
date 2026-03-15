import type React from 'react'

type Tab = 'home' | 'roll' | 'favorites'

interface Props {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
  onFabClick: () => void
}

export default function BottomNav({ activeTab, onTabChange, onFabClick }: Props) {
  return (
    <div style={styles.nav}>
      <div style={styles.blur} />

      {/* 현상소 — 홈 벤토 */}
      <button
        style={{ ...styles.navItem, ...(activeTab === 'home' ? styles.navItemActive : {}) }}
        onClick={() => onTabChange('home')}
        aria-label="현상소"
      >
        <div style={styles.navIcon}>
          <svg viewBox="0 0 20 20" style={activeTab === 'home' ? iconActiveStyle : iconStyle}>
            <path d="M3 9.5L10 3l7 6.5V17a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
          </svg>
        </div>
        <span style={{ ...styles.navLabel, ...(activeTab === 'home' ? styles.navLabelActive : {}) }}>현상소</span>
      </button>

      {/* 필름롤 — 현상된 프레임 목록 */}
      <button
        style={{ ...styles.navItem, ...(activeTab === 'roll' ? styles.navItemActive : {}) }}
        onClick={() => onTabChange('roll')}
        aria-label="필름롤"
      >
        <div style={styles.navIcon}>
          <svg viewBox="0 0 20 20" style={activeTab === 'roll' ? iconActiveStyle : iconStyle}>
            <rect x="3" y="4" width="14" height="13" rx="2" />
            <path d="M7 4V2M13 4V2M3 8h14" />
          </svg>
        </div>
        <span style={{ ...styles.navLabel, ...(activeTab === 'roll' ? styles.navLabelActive : {}) }}>필름롤</span>
      </button>

      {/* FAB — 현상 */}
      <button
        style={styles.fab}
        onClick={onFabClick}
        aria-label="하루 현상"
      >
        <div style={styles.fabCircle}>
          <svg viewBox="0 0 20 20" style={fabIconStyle}>
            <circle cx="10" cy="10" r="3" />
            <path d="M3 10a7 7 0 1014 0A7 7 0 003 10z" opacity=".4" />
            <path d="M10 2v2.5M10 15.5V18M2 10h2.5M15.5 10H18" />
          </svg>
        </div>
        <span style={styles.fabLabel}>현상</span>
      </button>

      {/* 즐겨찾기 */}
      <button
        style={{ ...styles.navItem, ...(activeTab === 'favorites' ? styles.navItemActive : {}) }}
        onClick={() => onTabChange('favorites')}
        aria-label="즐겨찾기"
      >
        <div style={styles.navIcon}>
          <svg viewBox="0 0 20 20" style={activeTab === 'favorites' ? iconActiveStyle : iconStyle}>
            <path d="M5 3h10a1 1 0 011 1v13l-6-3-6 3V4a1 1 0 011-1z" />
          </svg>
        </div>
        <span style={{ ...styles.navLabel, ...(activeTab === 'favorites' ? styles.navLabelActive : {}) }}>즐겨찾기</span>
      </button>

      {/* 나 — placeholder */}
      <button style={styles.navItem} aria-label="나">
        <div style={styles.navIcon}>
          <svg viewBox="0 0 20 20" style={iconStyle}>
            <circle cx="10" cy="7" r="3" />
            <path d="M4 17c0-3.3 2.7-6 6-6s6 2.7 6 6" />
          </svg>
        </div>
        <span style={styles.navLabel}>나</span>
      </button>
    </div>
  )
}

const iconStyle = {
  width: 20,
  height: 20,
  fill: 'none',
  stroke: '#9a9080',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

const iconActiveStyle = {
  ...iconStyle,
  stroke: '#2a2620',
}

const fabIconStyle = {
  width: 20,
  height: 20,
  fill: 'none',
  stroke: '#F0EEE9',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
}

const styles: Record<string, React.CSSProperties> = {
  nav: {
    height: 56,
    position: 'relative',
    borderTop: '1px solid rgba(42,38,32,0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: '0 8px',
    paddingBottom: 'env(safe-area-inset-bottom, 6px)',
    flexShrink: 0,
  },
  blur: {
    content: '""',
    position: 'absolute',
    inset: 0,
    background: 'rgba(240,238,233,0.75)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    zIndex: 0,
  },
  navItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 3,
    flex: 1,
    cursor: 'pointer',
    position: 'relative',
    zIndex: 1,
    padding: '4px 0',
    background: 'transparent',
    border: 'none',
    WebkitTapHighlightColor: 'transparent',
  },
  navItemActive: {},
  navIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLabel: {
    fontFamily: "'Noto Sans KR', sans-serif",
    fontSize: 9,
    color: '#9a9080',
    lineHeight: 1,
  },
  navLabelActive: {
    color: '#2a2620',
    fontWeight: 500,
  },
  fab: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 3,
    flex: 1,
    zIndex: 2,
    cursor: 'pointer',
    background: 'transparent',
    border: 'none',
    WebkitTapHighlightColor: 'transparent',
  },
  fabCircle: {
    position: 'absolute',
    top: -16,
    width: 48,
    height: 48,
    borderRadius: '50%',
    background: '#2a2620',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 10px rgba(42,38,32,0.22)',
  },
  fabLabel: {
    marginTop: 20,
    fontFamily: "'Noto Sans KR', sans-serif",
    fontSize: 9,
    color: '#9a9080',
    lineHeight: 1,
    position: 'relative',
    zIndex: 1,
  },
}
