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
  const dots = Array.from({ length: rollSize }, (_, i) => i < currentRollProgress ? '●' : '○').join('')
  const rollLabel = String(currentRollNum).padStart(2, '0')

  return (
    <div style={styles.wrap}>
      <span style={styles.rollNum}>ROLL {rollLabel}</span>
      <span style={styles.dots}>{dots}</span>
      <span style={styles.progress}>{currentRollProgress} / {rollSize}</span>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    height: 32,
    padding: '0 16px',
    borderBottom: '1px solid var(--border)',
    background: 'var(--bg-card)',
  },
  rollNum: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 10,
    color: 'var(--amber)',
    letterSpacing: '0.1em',
    flexShrink: 0,
  },
  dots: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 10,
    color: 'var(--cream-muted)',
    letterSpacing: '0.05em',
    flex: 1,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'clip',
  },
  progress: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 10,
    color: 'var(--cream-muted)',
    flexShrink: 0,
    opacity: 0.6,
  },
}
