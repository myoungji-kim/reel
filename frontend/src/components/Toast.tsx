import { useToastStore } from '../stores/toastStore'

export default function Toast() {
  const { message, type, visible, hide } = useToastStore()

  const isError = type === 'error'

  return (
    <div
      style={{
        ...styles.toast,
        opacity: visible ? 1 : 0,
        transform: visible
          ? 'translate(-50%, -50%) scale(1)'
          : 'translate(-50%, -50%) scale(0.88)',
        pointerEvents: visible ? 'all' : 'none',
        borderColor: isError ? 'rgba(192,98,74,0.4)' : 'rgba(122,158,138,0.35)',
        transition: visible
          ? 'opacity 0.22s cubic-bezier(0.34,1.56,0.64,1), transform 0.22s cubic-bezier(0.34,1.56,0.64,1)'
          : 'opacity 0.18s ease-in, transform 0.18s ease-in',
      }}
    >
      <span
        style={{
          ...styles.icon,
          color: isError ? '#c0624a' : 'var(--fade-green)',
        }}
      >
        ◆
      </span>
      <span style={styles.message}>{message}</span>
      {isError && (
        <button style={styles.closeBtn} onClick={hide}>
          ✕
        </button>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  toast: {
    position: 'fixed',
    top: '38%',
    left: '50%',
    zIndex: 9000,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: 'rgba(26,21,16,0.92)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid',
    borderRadius: 10,
    padding: '12px 18px',
    minWidth: 160,
    maxWidth: 280,
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
  },
  icon: {
    fontSize: 10,
    flexShrink: 0,
    lineHeight: 1,
  },
  message: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 11,
    color: 'var(--cream-dim)',
    letterSpacing: '0.04em',
    lineHeight: 1.5,
    flex: 1,
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--cream-muted)',
    fontSize: 10,
    cursor: 'pointer',
    padding: '0 0 0 4px',
    flexShrink: 0,
    lineHeight: 1,
    opacity: 0.7,
  },
}
