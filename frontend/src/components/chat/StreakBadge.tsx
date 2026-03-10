import { useQuery } from '@tanstack/react-query'
import { getStreak } from '../../api/userApi'

export default function StreakBadge() {
  const { data } = useQuery({
    queryKey: ['streak'],
    queryFn: getStreak,
    staleTime: 60_000,
  })

  if (!data || data.streakCount === 0) return null

  const recorded = data.recordedToday

  return (
    <div style={styles.wrap}>
      <span style={{ ...styles.text, color: recorded ? 'var(--amber)' : 'var(--cream-muted)' }}>
        {recorded
          ? `◆ ${data.streakCount}일 연속 기록 완료`
          : `◇ 오늘 기록하면 ${data.streakCount + 1}일 연속`}
      </span>
    </div>
  )
}

const styles: React.CSSProperties | Record<string, React.CSSProperties> = {
  wrap: {
    display: 'flex',
    alignItems: 'center',
    padding: '0 20px',
    height: 32,
    flexShrink: 0,
  },
  text: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 11,
    letterSpacing: '0.06em',
  },
}
