interface Props {
  onRedevelop: () => void
}

export default function RedevelopBanner({ onRedevelop }: Props) {
  return (
    <div style={styles.banner} onClick={onRedevelop}>
      <div style={styles.text}>
        <strong style={styles.strong}>↺ 재현상하기</strong>
        추가된 대화를 반영해 오늘 일기를 다시 정리할게요
      </div>
      <button style={styles.pill}>재현상 →</button>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  banner: {
    flexShrink: 0,
    margin: '8px 16px',
    padding: '12px 16px',
    background: 'rgba(100,120,180,0.07)',
    border: '1px dashed rgba(100,120,180,0.3)',
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    cursor: 'pointer',
    animation: 'bannerFade 0.4s ease',
  },
  text: {
    fontSize: 12,
    color: 'var(--cream-dim)',
    lineHeight: 1.5,
  },
  strong: {
    color: 'var(--cream-muted)',
    fontWeight: 500,
    display: 'block',
    marginBottom: 2,
  },
  pill: {
    flexShrink: 0,
    padding: '8px 14px',
    border: '1px solid var(--border-light)',
    cursor: 'pointer',
    background: 'var(--bg-card)',
    color: 'var(--cream-muted)',
    fontFamily: "'Space Mono', monospace",
    fontSize: 10,
    letterSpacing: '0.05em',
    borderRadius: 20,
    whiteSpace: 'nowrap',
  },
}
