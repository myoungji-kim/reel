import { useToastStore } from '../stores/toastStore'

export default function Toast() {
  const { message, visible } = useToastStore()

  return (
    <div
      style={{
        ...styles.toast,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(8px)',
        pointerEvents: visible ? 'all' : 'none',
      }}
    >
      {message}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  toast: {
    position: 'fixed',
    bottom: 32,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 500,
    background: 'var(--bg-card)',
    border: '1px solid var(--border-light)',
    borderRadius: 8,
    padding: '10px 18px',
    fontFamily: "'Space Mono', monospace",
    fontSize: 11,
    color: 'var(--cream-dim)',
    letterSpacing: '0.04em',
    whiteSpace: 'nowrap',
    transition: 'opacity 0.25s, transform 0.25s',
    boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
  },
}
