import { useQuery } from '@tanstack/react-query'
import { getRollStats } from '../../api/frameApi'

export default function RollProgressBar() {
  const { data } = useQuery({
    queryKey: ['roll-stats'],
    queryFn: getRollStats,
    staleTime: 1000 * 60 * 5,
  })

  if (!data) return null

  const { currentRollNum, currentRollProgress, rollSize } = data
  const pct = (currentRollProgress / rollSize) * 100
  const rollLabel = String(currentRollNum).padStart(2, '0')

  return (
    <div style={styles.wrap}>
      <span style={styles.rollNum}>ROLL {rollLabel}</span>
      <div style={styles.track}>
        <div style={{ ...styles.fill, width: `${pct}%` }} />
      </div>
      <span style={styles.progress}>{currentRollProgress}<span style={styles.total}> / {rollSize}</span></span>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    height: 28,
    padding: '0 16px',
    borderBottom: '1px solid var(--border-default)',
    background: 'var(--surface-base)',
  },
  rollNum: {
    fontFamily: "var(--font-mono)",
    fontSize: 'var(--text-xs)' as unknown as number,
    color: 'var(--accent-gold)',
    letterSpacing: '0.12em',
    flexShrink: 0,
    opacity: 0.85,
  },
  track: {
    flex: 1,
    height: 2,
    background: 'var(--amber-15)',
    borderRadius: 1,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    background: 'linear-gradient(90deg, var(--amber), var(--amber-light))',
    borderRadius: 1,
    transition: 'width 0.4s ease',
  },
  progress: {
    fontFamily: "var(--font-mono)",
    fontSize: 'var(--text-xs)' as unknown as number,
    color: 'var(--accent-gold-light)',
    flexShrink: 0,
    letterSpacing: '0.04em',
  },
  total: {
    color: 'var(--text-muted)',
    opacity: 0.5,
  },
}
