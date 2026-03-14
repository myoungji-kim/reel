export default function TypingIndicator() {
  return (
    <div style={styles.wrap}>
      <div style={styles.avatar}><div style={styles.avatarRing} /></div>
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
    width: 32,
    height: 32,
    borderRadius: '50%',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--surface-inverse)',
    marginTop: 2,
  },
  avatarRing: {
    width: 14,
    height: 14,
    borderRadius: '50%',
    border: '1.5px solid var(--accent-gold)',
  },
  bubble: {
    padding: '10px 14px',
    borderRadius: '2px var(--radius-md) var(--radius-md) var(--radius-md)',
    background: 'var(--surface-card)',
    border: '1px solid var(--border-default)',
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
    background: 'var(--accent-gold)',
    opacity: 0.4,
    // typingBounce 애니메이션은 index.css에 정의됨
    animation: 'typingBounce 1.2s ease-in-out infinite',
  },
}
