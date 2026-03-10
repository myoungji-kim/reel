import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { checkRetrospectiveAvailable, createRetrospective } from '../../api/frameApi'
import { useToast } from '../../hooks/useToast'

interface Props {
  year: number
  month: number
}

const MONTH_NAMES = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
]

export default function RetrospectiveBanner({ year, month }: Props) {
  const [isGenerating, setIsGenerating] = useState(false)
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  const { data } = useQuery({
    queryKey: ['retrospectiveAvailable', year, month],
    queryFn: () => checkRetrospectiveAvailable(year, month),
    staleTime: 1000 * 60 * 5,
  })

  if (!data?.available) return null

  const monthName = MONTH_NAMES[month - 1]

  const handleGenerate = async () => {
    if (isGenerating) return
    setIsGenerating(true)
    try {
      await createRetrospective(year, month)
      queryClient.invalidateQueries({ queryKey: ['frames'] })
      queryClient.invalidateQueries({ queryKey: ['retrospectiveAvailable', year, month] })
      showToast('회고가 생성됐어요')
    } catch {
      showToast('회고 생성에 실패했어요.', 'error')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <button style={styles.banner} onClick={handleGenerate} disabled={isGenerating}>
      <span style={styles.diamond}>◆</span>
      <span style={{ ...styles.label, ...(isGenerating ? styles.labelBlink : {}) }}>
        {isGenerating ? '현상 중...' : `${monthName} 회고 생성하기`}
      </span>
      {!isGenerating && <span style={styles.arrow}>→</span>}
    </button>
  )
}

const styles: Record<string, React.CSSProperties> = {
  banner: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    width: '100%',
    height: 38,
    background: 'var(--bg-card)',
    border: '1px solid var(--border-light)',
    borderRadius: 3,
    padding: '0 12px',
    cursor: 'pointer',
    marginBottom: 10,
    textAlign: 'left',
  },
  diamond: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 9,
    color: 'var(--amber-light)',
    flexShrink: 0,
  },
  label: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 11,
    color: 'var(--amber-light)',
    letterSpacing: '0.08em',
    flex: 1,
  },
  labelBlink: {
    animation: 'devBlink 1s ease-in-out infinite',
  },
  arrow: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 12,
    color: 'var(--amber-light)',
    opacity: 0.6,
    flexShrink: 0,
  },
}
