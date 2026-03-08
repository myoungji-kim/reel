import { useState } from 'react'
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
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1) // 1-based

  const { data: calendarFrames = [] } = useQuery({
    queryKey: ['calendarFrames', year, month],
    queryFn: () => getCalendarFrames(year, month),
    staleTime: 1000 * 60,
  })

  // date → CalendarFrame 맵
  const frameByDate = new Map<string, CalendarFrame>()
  for (const cf of calendarFrames) {
    frameByDate.set(cf.date, cf)
  }

  // 달력 날짜 배열 생성
  const firstDay = new Date(year, month - 1, 1).getDay() // 0=Sun
  const daysInMonth = new Date(year, month, 0).getDate()
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  // 6행 고정을 위해 뒷부분 null 패딩
  while (cells.length % 7 !== 0) cells.push(null)

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth() + 1
  const isFutureMonth =
    year > today.getFullYear() ||
    (year === today.getFullYear() && month > today.getMonth() + 1)

  const handlePrevMonth = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12) }
    else setMonth(m => m - 1)
  }

  const handleNextMonth = () => {
    if (isFutureMonth) return
    // 현재 월이면 다음달로 이동 불가 (오늘 기준)
    if (isCurrentMonth) return
    if (month === 12) { setYear(y => y + 1); setMonth(1) }
    else setMonth(m => m + 1)
  }

  const handleDayClick = (day: number) => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const cf = frameByDate.get(dateStr)
    if (cf) onFrameSelect(cf.frameId)
  }

  return (
    <div style={styles.container}>
      {/* 월 이동 헤더 */}
      <div style={styles.header}>
        <button style={styles.navBtn} onClick={handlePrevMonth} aria-label="이전 달">
          ◀
        </button>
        <span style={styles.monthLabel}>
          {MONTH_NAMES[month - 1]} {year}
        </span>
        <button
          style={{
            ...styles.navBtn,
            opacity: isCurrentMonth ? 0.2 : 0.7,
            cursor: isCurrentMonth ? 'default' : 'pointer',
          }}
          onClick={handleNextMonth}
          aria-label="다음 달"
          disabled={isCurrentMonth}
        >
          ▶
        </button>
      </div>

      {/* 요일 헤더 */}
      <div style={styles.grid}>
        {WEEKDAYS.map(day => (
          <div key={day} style={styles.weekdayCell}>
            {day}
          </div>
        ))}

        {/* 날짜 셀 */}
        {cells.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} style={styles.cell} />
          }

          const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const cf = frameByDate.get(dateStr)
          const isToday = dateStr === todayStr
          const isFuture = dateStr > todayStr
          const hasRecord = !!cf

          return (
            <div
              key={dateStr}
              style={{
                ...styles.cell,
                cursor: hasRecord ? 'pointer' : 'default',
                opacity: isFuture ? 0.2 : 1,
              }}
              onClick={() => !isFuture && handleDayClick(day)}
            >
              <span
                style={{
                  ...styles.dayNum,
                  color: isToday ? 'var(--amber)' : hasRecord ? 'var(--cream)' : 'var(--cream-muted)',
                  opacity: !hasRecord && !isToday ? 0.4 : 1,
                  fontWeight: isToday ? 700 : 400,
                }}
              >
                {day}
              </span>
              {hasRecord && (
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
    marginBottom: 12,
    padding: '0 4px',
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
}
