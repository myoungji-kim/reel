interface Props {
  label: string
  count: number
}

export default function MonthDivider({ label, count }: Props) {
  return (
    <div style={styles.wrap}>
      <span style={styles.text}>{label}</span>
      <div style={styles.line} />
      <span style={styles.count}>{count} frame{count !== 1 ? 's' : ''}</span>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    margin: '16px 0 12px',
  },
  text: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 18,
    color: 'var(--amber)',
    letterSpacing: '0.1em',
  },
  line: {
    flex: 1,
    height: 1,
    background: 'linear-gradient(90deg, rgba(212,130,42,0.25), transparent)',
  },
  count: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 9,
    color: 'var(--cream-muted)',
  },
}
