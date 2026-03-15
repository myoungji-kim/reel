import type React from 'react'

type Tab = 'home' | 'roll' | 'favorites' | 'profile'

interface Props {
  activeTab: Tab
  homeView: 'bento' | 'chat'
  onTabChange: (tab: Tab) => void
  onFabClick: () => void
}

export default function BottomNav({ activeTab, homeView, onTabChange, onFabClick }: Props) {
  const isHomeActive = activeTab === 'home' && homeView === 'bento'
  const c = (active: boolean) => (active ? '#2a2620' : '#9a9080')

  return (
    <div style={styles.nav}>
      <div style={styles.blur} />

      {/* 현상소 — 필름 프레임 */}
      <button
        style={styles.navItem}
        onClick={() => onTabChange('home')}
        aria-label="현상소"
      >
        <div style={styles.navIcon}>
          <svg viewBox="0 0 20 20" fill="none" width="20" height="20"
            stroke={c(isHomeActive)} strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="16" height="12" rx="1.5" />
            <rect x="2"  y="6"  width="2" height="2" rx="0.5" fill={c(isHomeActive)} stroke="none" />
            <rect x="2"  y="9"  width="2" height="2" rx="0.5" fill={c(isHomeActive)} stroke="none" />
            <rect x="2"  y="12" width="2" height="2" rx="0.5" fill={c(isHomeActive)} stroke="none" />
            <rect x="16" y="6"  width="2" height="2" rx="0.5" fill={c(isHomeActive)} stroke="none" />
            <rect x="16" y="9"  width="2" height="2" rx="0.5" fill={c(isHomeActive)} stroke="none" />
            <rect x="16" y="12" width="2" height="2" rx="0.5" fill={c(isHomeActive)} stroke="none" />
          </svg>
        </div>
        <span style={{ ...styles.navLabel, ...(isHomeActive ? styles.navLabelActive : {}) }}>현상소</span>
      </button>

      {/* 필름롤 — 롤 원형 */}
      <button
        style={styles.navItem}
        onClick={() => onTabChange('roll')}
        aria-label="필름롤"
      >
        <div style={styles.navIcon}>
          <svg viewBox="0 0 20 20" fill="none" width="20" height="20"
            stroke={c(activeTab === 'roll')} strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round">
            <circle cx="10" cy="10" r="7" />
            <circle cx="10" cy="10" r="2.5" />
            <circle cx="10" cy="4"  r="1" fill={c(activeTab === 'roll')} stroke="none" />
            <circle cx="10" cy="16" r="1" fill={c(activeTab === 'roll')} stroke="none" />
            <circle cx="4"  cy="10" r="1" fill={c(activeTab === 'roll')} stroke="none" />
            <circle cx="16" cy="10" r="1" fill={c(activeTab === 'roll')} stroke="none" />
          </svg>
        </div>
        <span style={{ ...styles.navLabel, ...(activeTab === 'roll' ? styles.navLabelActive : {}) }}>필름롤</span>
      </button>

      {/* FAB — 현상 (조리개, 기존 유지) */}
      <button
        style={styles.fab}
        onClick={onFabClick}
        aria-label="하루 현상"
      >
        <div style={styles.fabCircle}>
          <svg viewBox="0 0 20 20" fill="none" width="20" height="20"
            stroke="#F0EEE9" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="10" cy="10" r="3" />
            <path d="M3 10a7 7 0 1014 0A7 7 0 003 10z" opacity=".4" />
            <path d="M10 2v2.5M10 15.5V18M2 10h2.5M15.5 10H18" />
          </svg>
        </div>
        <span style={styles.fabLabel}>현상</span>
      </button>

      {/* 즐겨찾기 — 별 */}
      <button
        style={styles.navItem}
        onClick={() => onTabChange('favorites')}
        aria-label="즐겨찾기"
      >
        <div style={styles.navIcon}>
          <svg viewBox="0 0 20 20" fill="none" width="20" height="20"
            stroke={c(activeTab === 'favorites')} strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 2l1.5 5h5l-4 3 1.5 5-4-3-4 3 1.5-5-4-3h5z" />
          </svg>
        </div>
        <span style={{ ...styles.navLabel, ...(activeTab === 'favorites' ? styles.navLabelActive : {}) }}>즐겨찾기</span>
      </button>

      {/* 나 — 사람 (기존 유지) */}
      <button
        style={styles.navItem}
        onClick={() => onTabChange('profile')}
        aria-label="나"
      >
        <div style={styles.navIcon}>
          <svg viewBox="0 0 20 20" fill="none" width="20" height="20"
            stroke={c(activeTab === 'profile')} strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round">
            <circle cx="10" cy="7" r="3" />
            <path d="M4 17c0-3.3 2.7-6 6-6s6 2.7 6 6" />
          </svg>
        </div>
        <span style={{ ...styles.navLabel, ...(activeTab === 'profile' ? styles.navLabelActive : {}) }}>나</span>
      </button>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  nav: {
    height: 60,
    position: 'relative',
    overflow: 'visible',          // FAB이 위로 솟아오를 수 있도록
    borderTop: '1px solid rgba(42,38,32,0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: '0 8px',
    paddingBottom: 'env(safe-area-inset-bottom, 6px)',
    flexShrink: 0,
  },
  blur: {
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
    zIndex: 10,
    cursor: 'pointer',
    background: 'transparent',
    border: 'none',
    WebkitTapHighlightColor: 'transparent',
  },
  fabCircle: {
    position: 'absolute',
    top: -18,
    width: 46,
    height: 46,
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
