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
        <span style={styles.text}>
          {label}
          <span style={styles.textLine} />
        </span>
        <span style={styles.count}>{count} frame{count !== 1 ? 's' : ''}</span>
      </div>
      <RetrospectiveBanner year={year} month={month} />
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '20px 0 12px',
  },
  wrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  text: {
    fontFamily: "var(--font-mono)",
    fontSize: 12,
    fontWeight: 500,
    color: 'var(--accent-gold)',
    letterSpacing: '0.14em',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  textLine: {
    display: 'inline-block',
    width: 40,
    height: 1,
    background: '#d8d2c8',
    flexShrink: 0,
  },
  count: {
    fontFamily: "var(--font-mono)",
    fontSize: 9,
    color: 'var(--text-placeholder)',
    fontStyle: 'italic',
  },
}
