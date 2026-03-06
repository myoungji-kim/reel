import { Aperture } from 'lucide-react'

export default function TypingIndicator() {
  return (
    <div style={styles.wrap}>
      <div style={styles.avatar}><Aperture size={14} /></div>
      <div style={styles.bubble}>
        <div style={styles.dotWrap}>
          <span style={{ ...styles.dot, animationDelay: '0s' }} />
          <span style={{ ...styles.dot, animationDelay: '0.2s' }} />
          <span style={{ ...styles.dot, animationDelay: '0.4s' }} />
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    display: 'flex',
    gap: 8,
    maxWidth: '85%',
    alignSelf: 'flex-start',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, var(--amber), #8a5a1a)',
    color: 'var(--bg)',
    marginTop: 2,
  },
  bubble: {
    padding: '10px 14px',
    borderRadius: '4px 16px 16px 16px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border-light)',
  },
  dotWrap: {
    display: 'flex',
    gap: 4,
    alignItems: 'center',
  },
  dot: {
    display: 'inline-block',
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: 'var(--amber)',
    opacity: 0.4,
    // typingBounce 애니메이션은 index.css에 정의됨
    animation: 'typingBounce 1.2s ease-in-out infinite',
  },
}
