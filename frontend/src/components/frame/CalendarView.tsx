import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getCalendarFrames } from '../../api/frameApi'
import { getMoodDotColor } from '../../utils/moodTone'
import type { CalendarFrame } from '../../types/frame'

interface CalendarViewProps {
  onFrameSelect: (frameId: number) => void
}

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

const MONTH_NAMES = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
]

export default function CalendarView({ onFrameSelect }: CalendarViewProps) {
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [pressedDate, setPressedDate] = useState<string | null>(null)

  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth() + 1

  const handlePrevMonth = () => {
    setSelectedDate(null)
    if (month === 1) { setYear(y => y - 1); setMonth(12) }
    else setMonth(m => m - 1)
  }

  const handleNextMonth = () => {
    if (isCurrentMonth) return
    setSelectedDate(null)
    if (month === 12) { setYear(y => y + 1); setMonth(1) }
    else setMonth(m => m + 1)
  }

  // month 변경 시 선택 초기화
  useEffect(() => {
    setSelectedDate(null)
  }, [year, month])

  // 개선6: isFetching으로 로딩 상태 표현
  const { data: calendarFrames = [], isFetching } = useQuery({
    queryKey: ['calendarFrames', year, month],
    queryFn: () => getCalendarFrames(year, month),
    staleTime: 1000 * 60,
  })

  const frameByDate = new Map<string, CalendarFrame>()
  for (const cf of calendarFrames) {
    frameByDate.set(cf.date, cf)
  }

  // 달력 셀 배열
  const firstDay = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const handleDayClick = (day: number) => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    if (dateStr > todayStr) return
    setSelectedDate(prev => (prev === dateStr ? null : dateStr))
  }

  // 개선1: 선택된 날짜의 프레임 미리보기
  const selectedCf = selectedDate ? frameByDate.get(selectedDate) : undefined

  return (
    <div style={styles.container}>
      {/* 월 네비게이션 헤더 */}
      <div style={styles.header}>
        <button style={styles.navBtn} onClick={handlePrevMonth} aria-label="이전 달">◀</button>
        <span style={styles.monthLabel}>{MONTH_NAMES[month - 1]} {year}</span>
        <button
          style={{ ...styles.navBtn, opacity: isCurrentMonth ? 0.2 : 0.7, cursor: isCurrentMonth ? 'default' : 'pointer' }}
          onClick={handleNextMonth}
          aria-label="다음 달"
          disabled={isCurrentMonth}
        >▶</button>
      </div>

      {/* 개선4: 월간 통계 */}
      <div style={styles.statsRow}>
        <span style={styles.statsText}>{calendarFrames.length}일 기록</span>
      </div>

      {/* 개선6: 로딩 중 그리드 흐리게 */}
      <div style={{ ...styles.grid, opacity: isFetching ? 0.35 : 1, transition: 'opacity 0.2s' }}>
        {WEEKDAYS.map(day => (
          <div key={day} style={styles.weekdayCell}>{day}</div>
        ))}

        {cells.map((day, idx) => {
          if (day === null) return <div key={`empty-${idx}`} style={styles.cell} />

          const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const cf = frameByDate.get(dateStr)
          const isToday = dateStr === todayStr
          const isFuture = dateStr > todayStr
          const hasRecord = !!cf
          const isSelected = dateStr === selectedDate
          const isPressed = dateStr === pressedDate

          return (
            <div
              key={dateStr}
              style={{
                ...styles.cell,
                cursor: isFuture ? 'default' : 'pointer',
                opacity: isFuture ? 0.2 : 1,
                // 개선5: 탭 피드백
                transform: isPressed ? 'scale(0.90)' : 'scale(1)',
                transition: 'transform 0.1s',
              }}
              onClick={() => handleDayClick(day)}
              onMouseDown={() => !isFuture && setPressedDate(dateStr)}
              onMouseUp={() => setPressedDate(null)}
              onMouseLeave={() => setPressedDate(null)}
              onTouchStart={() => !isFuture && setPressedDate(dateStr)}
              onTouchEnd={() => setPressedDate(null)}
            >
              {/* 개선2: 오늘 날짜 앰버 원형 / 개선1: 선택된 날짜 반투명 원형 */}
              <div
                style={{
                  ...styles.dayCircle,
                  background: isToday
                    ? 'var(--amber)'
                    : isSelected
                    ? 'rgba(212,130,42,0.18)'
                    : 'transparent',
                }}
              >
                <span
                  style={{
                    ...styles.dayNum,
                    color: isToday ? 'var(--bg)' : hasRecord ? 'var(--cream)' : 'var(--cream-muted)',
                    opacity: !hasRecord && !isToday ? 0.4 : 1,
                    fontWeight: isToday ? 700 : 400,
                  }}
                >
                  {day}
                </span>
              </div>
              {hasRecord && !isToday && (
                <span
                  style={{
                    ...styles.dot,
                    background: getMoodDotColor(cf.mood),
                  }}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* 개선1: 날짜 선택 시 프레임 미리보기 카드 */}
      {selectedDate && selectedCf && (
        <div style={styles.previewCard} onClick={() => onFrameSelect(selectedCf.frameId)}>
          <div style={styles.previewBody}>
            <div style={styles.previewText}>
              <span style={styles.previewDate}>{selectedDate}</span>
              <span style={styles.previewTitle}>{selectedCf.title}</span>
              {selectedCf.contentPreview && (
                <span style={styles.previewContent}>{selectedCf.contentPreview}</span>
              )}
            </div>
            {selectedCf.thumbnailUrl && (
              <img
                src={selectedCf.thumbnailUrl}
                alt=""
                style={styles.previewThumb}
              />
            )}
          </div>
          <span style={styles.previewArrow}>전체 보기 →</span>
        </div>
      )}

      {/* 개선7: 빈 상태 */}
      {!isFetching && calendarFrames.length === 0 && (
        <div style={styles.emptyState}>
          <p style={styles.emptyText}>// NO RECORDS</p>
          <p style={styles.emptySub}>이 달에 현상된 프레임이 없어요</p>
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    margin: '12px 16px 0',
    padding: '12px 8px 16px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 4px 12px',
  },
  monthLabel: {
    fontFamily: "'Bebas Neue', cursive",
    fontSize: 18,
    color: 'var(--cream)',
    letterSpacing: '0.1em',
  },
  navBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontFamily: "'Space Mono', monospace",
    fontSize: 10,
    color: 'var(--cream-muted)',
    opacity: 0.7,
    padding: '4px 8px',
    lineHeight: 1,
  },
  statsRow: {
    padding: '0 4px 8px',
  },
  statsText: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 9,
    color: 'var(--amber)',
    letterSpacing: '0.08em',
    opacity: 0.75,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
  },
  weekdayCell: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 9,
    color: 'var(--cream-muted)',
    letterSpacing: '0.05em',
    textAlign: 'center',
    padding: '4px 0 8px',
    opacity: 0.5,
  },
  cell: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    gap: 3,
  },
  dayCircle: {
    width: 26,
    height: 26,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  dayNum: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 11,
    lineHeight: 1,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: '50%',
    flexShrink: 0,
  },
  previewCard: {
    margin: '12px 4px 0',
    padding: '12px 14px',
    border: '1px solid var(--amber-35)',
    background: 'rgba(212,130,42,0.05)',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  previewBody: {
    display: 'flex',
    gap: 12,
    alignItems: 'flex-start',
  },
  previewText: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
    minWidth: 0,
  },
  previewDate: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 9,
    color: 'var(--cream-muted)',
    letterSpacing: '0.06em',
    opacity: 0.6,
  },
  previewTitle: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 12,
    color: 'var(--cream)',
    letterSpacing: '0.04em',
  },
  previewContent: {
    fontFamily: "'Noto Sans KR', sans-serif",
    fontSize: 12,
    color: 'var(--cream-muted)',
    fontWeight: 300,
    lineHeight: 1.6,
    opacity: 0.8,
    wordBreak: 'keep-all' as const,
  },
  previewThumb: {
    width: 80,
    height: 80,
    objectFit: 'cover' as const,
    flexShrink: 0,
    border: '1px solid var(--border)',
    filter: 'sepia(0.3) brightness(0.85)',
  },
  previewArrow: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 9,
    color: 'var(--amber)',
    letterSpacing: '0.06em',
    opacity: 0.7,
    alignSelf: 'flex-end',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    padding: '32px 0 16px',
  },
  emptyText: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 12,
    color: 'var(--amber)',
    letterSpacing: '0.1em',
  },
  emptySub: {
    fontFamily: "'Noto Sans KR', sans-serif",
    fontSize: 12,
    color: 'var(--cream-muted)',
    fontWeight: 300,
  },
}
