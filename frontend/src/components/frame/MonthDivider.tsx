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
    fontFamily: "var(--font-mono)",
    fontSize: 'var(--text-md)' as unknown as number,
    fontWeight: 500,
    color: 'var(--accent-gold)',
    letterSpacing: '0.1em',
  },
  line: {
    flex: 1,
    height: 1,
    background: 'linear-gradient(90deg, rgba(200,169,110,0.3), transparent)',
  },
  count: {
    fontFamily: "var(--font-mono)",
    fontSize: 'var(--text-xs)' as unknown as number,
    color: 'var(--text-placeholder)',
  },
}
