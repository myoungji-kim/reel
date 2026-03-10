import RetrospectiveBanner from './RetrospectiveBanner'

interface Props {
  label: string
  count: number
  year: number
  month: number
}

export default function MonthDivider({ label, count, year, month }: Props) {
  return (
    <div style={styles.container}>
      <div style={styles.wrap}>
        <span style={styles.text}>{label}</span>
        <div style={styles.line} />
        <span style={styles.count}>{count} frame{count !== 1 ? 's' : ''}</span>
      </div>
      <RetrospectiveBanner year={year} month={month} />
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    margin: '16px 0 12px',
  },
  wrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
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
    background: 'linear-gradient(90deg, var(--amber-25), transparent)',
  },
  count: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 10,
    color: 'var(--cream-muted)',
  },
}
