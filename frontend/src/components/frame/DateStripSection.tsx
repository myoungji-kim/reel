import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getCalendarFrames, getRollStats } from '../../api/frameApi'
import { getMoodBarColor } from '../../utils/moodTone'
import type { CalendarFrame } from '../../types/frame'

const MONTH_LONG = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
]
const MONTH_SHORT = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']

interface DayInfo {
  date: string      // "2026-03-12"
  day: number
  dayOfWeek: string // "MON"
  isToday: boolean
  isFuture: boolean
}

function generateDays(year: number, month: number): DayInfo[] {
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const daysInMonth = new Date(year, month, 0).getDate()
  const DOW = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
  return Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1
    const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const d = new Date(year, month - 1, day)
    return { date, day, dayOfWeek: DOW[d.getDay()], isToday: date === todayStr, isFuture: date > todayStr }
  })
}

// ─── DateItem ────────────────────────────────────────────────────────────────

function DateItem({
  info,
  isSelected,
  isActive,
  cf,
  onClick,
}: {
  info: DayInfo
  isSelected: boolean
  isActive: boolean
  cf: CalendarFrame | undefined
  onClick: () => void
}) {
  const dotColor = cf ? getMoodBarColor(cf.mood) : 'transparent'
  const isSun = info.dayOfWeek === 'SUN'
  const isSat = info.dayOfWeek === 'SAT'

  return (
    <div
      data-today={info.isToday ? 'true' : undefined}
      data-date={info.date}
      onClick={info.isFuture ? undefined : onClick}
      style={{
        ...itemStyles.wrap,
        opacity: info.isFuture ? 0.3 : 1,
        cursor: info.isFuture ? 'default' : 'pointer',
        background: isSelected ? '#2a2620' : info.isToday ? 'var(--gold-pale)' : 'transparent',
        borderRadius: 8,
        borderBottom: isActive && !isSelected ? '2px solid var(--gold)' : '2px solid transparent',
      }}
    >
      <span style={{
        ...itemStyles.dow,
        color: isSun ? 'var(--emotion-warm)' : isSat ? 'var(--emotion-sad)' : 'var(--text-placeholder)',
      }}>
        {info.dayOfWeek}
      </span>
      <span style={{
        ...itemStyles.num,
        color: isSelected ? '#F0EEE9' : isActive ? 'var(--gold)' : info.isToday ? 'var(--text-primary)' : 'var(--text-secondary)',
        fontWeight: info.isToday || isSelected || isActive ? 600 : 400,
      }}>
        {info.day}
      </span>
      <div style={{
        ...itemStyles.dot,
        background: isSelected && cf ? '#F0EEE9' : dotColor,
        opacity: cf ? 1 : 0,
      }} />
    </div>
  )
}

const itemStyles: Record<string, React.CSSProperties> = {
  wrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 3,
    padding: '6px 5px 5px',
    minWidth: 38,
    flexShrink: 0,
    WebkitTapHighlightColor: 'transparent',
    transition: 'background 0.15s',
  },
  dow: {
    fontFamily: "var(--font-mono)",
    fontSize: 7,
    letterSpacing: '0.06em',
    lineHeight: 1,
  },
  num: {
    fontFamily: "var(--font-mono)",
    fontSize: 15,
    lineHeight: 1,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: '50%',
  },
}

// ─── MonthPickerSheet ─────────────────────────────────────────────────────────

function MonthPickerSheet({
  isOpen,
  currentMonth,
  onMonthSelect,
  onClose,
  availableYears,
  recordMonthSet,
}: {
  isOpen: boolean
  currentMonth: { year: number; month: number }
  onMonthSelect: (year: number, month: number) => void
  onClose: () => void
  availableYears: number[]
  recordMonthSet: Set<string>
}) {
  const today = new Date()
  const [tempYear, setTempYear] = useState(currentMonth.year)

  useEffect(() => {
    if (isOpen) setTempYear(currentMonth.year)
  }, [isOpen, currentMonth.year])

  const isFutureMonth = (y: number, m: number) =>
    y > today.getFullYear() || (y === today.getFullYear() && m > today.getMonth() + 1)

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 300,
        background: 'rgba(42,38,32,0.4)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'center',
        opacity: isOpen ? 1 : 0,
        pointerEvents: isOpen ? 'all' : 'none',
        transition: 'opacity 0.2s',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 440,
          background: 'var(--surface-base)',
          borderRadius: '18px 18px 0 0',
          border: '1px solid var(--border-default)',
          borderBottom: 'none',
          padding: '14px 16px 32px',
          transform: isOpen ? 'translateY(0)' : 'translateY(60px)',
          transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* 핸들 */}
        <div style={sheetStyles.handle} />
        <div style={sheetStyles.title}>YEAR · MONTH</div>

        {/* 연도 칩 */}
        <div style={sheetStyles.yearRow}>
          {availableYears.map(y => (
            <button
              key={y}
              style={{
                ...sheetStyles.yearChip,
                ...(tempYear === y ? sheetStyles.yearChipActive : {}),
              }}
              onClick={() => setTempYear(y)}
            >
              {y}
            </button>
          ))}
        </div>

        {/* 월 그리드 */}
        <div style={sheetStyles.monthGrid}>
          {MONTH_SHORT.map((m, i) => {
            const monthNum = i + 1
            const key = `${tempYear}-${String(monthNum).padStart(2, '0')}`
            const hasRec = recordMonthSet.has(key)
            const isActive = currentMonth.year === tempYear && currentMonth.month === monthNum
            const isFuture = isFutureMonth(tempYear, monthNum)
            return (
              <button
                key={m}
                disabled={isFuture}
                onClick={() => !isFuture && onMonthSelect(tempYear, monthNum)}
                style={{
                  ...sheetStyles.monthChip,
                  ...(isActive ? sheetStyles.monthChipActive : {}),
                  ...(hasRec && !isActive ? sheetStyles.monthChipHasRec : {}),
                  ...(isFuture ? sheetStyles.monthChipFuture : {}),
                  position: 'relative',
                }}
              >
                {m}
                {hasRec && (
                  <div style={{
                    position: 'absolute',
                    bottom: 4,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 3,
                    height: 3,
                    borderRadius: '50%',
                    background: isActive ? 'var(--gold-pale)' : 'var(--gold)',
                  }} />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

const sheetStyles: Record<string, React.CSSProperties> = {
  handle: {
    width: 32,
    height: 3,
    background: 'var(--border-mid)',
    borderRadius: 2,
    margin: '0 auto 14px',
  },
  title: {
    fontFamily: "var(--font-mono)",
    fontSize: 9,
    color: 'var(--text-placeholder)',
    letterSpacing: '0.12em',
    marginBottom: 12,
  },
  yearRow: {
    display: 'flex',
    gap: 6,
    marginBottom: 14,
    flexWrap: 'wrap',
  },
  yearChip: {
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    padding: '5px 14px',
    borderRadius: 8,
    cursor: 'pointer',
    border: '1px solid var(--border-default)',
    color: 'var(--text-muted)',
    background: 'transparent',
  },
  yearChipActive: {
    background: '#2a2620',
    color: '#F0EEE9',
    borderColor: '#2a2620',
  },
  monthGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 6,
  },
  monthChip: {
    fontFamily: "var(--font-mono)",
    fontSize: 10,
    padding: '10px 4px',
    borderRadius: 8,
    cursor: 'pointer',
    textAlign: 'center',
    border: '1px solid var(--border-default)',
    color: 'var(--text-secondary)',
    background: 'transparent',
    paddingBottom: 14,
  },
  monthChipActive: {
    background: 'var(--gold)',
    color: 'var(--gold-pale)',
    borderColor: 'var(--gold)',
  },
  monthChipHasRec: {
    borderColor: 'var(--gold)',
  },
  monthChipFuture: {
    color: 'var(--text-placeholder)',
    borderColor: 'var(--border-default)',
    opacity: 0.4,
    cursor: 'default',
  },
}

// ─── DateStripSection (main export) ──────────────────────────────────────────

interface Props {
  currentMonth: { year: number; month: number }
  onMonthChange: (m: { year: number; month: number }) => void
  selectedDate: string | null
  onDateSelect: (date: string | null) => void
  activeDate?: string | null
  onSearchClick: () => void
  onQuickNote: () => void
  availableYears: number[]
  recordMonthSet: Set<string>
}

export default function DateStripSection({
  currentMonth,
  onMonthChange,
  selectedDate,
  onDateSelect,
  activeDate,
  onSearchClick,
  onQuickNote,
  availableYears,
  recordMonthSet,
}: Props) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const stripRef = useRef<HTMLDivElement>(null)

  const { data: calendarFrames = [] } = useQuery({
    queryKey: ['calendarFrames', currentMonth.year, currentMonth.month],
    queryFn: () => getCalendarFrames(currentMonth.year, currentMonth.month),
    staleTime: 1000 * 60,
  })

  const { data: rollStats } = useQuery({
    queryKey: ['roll-stats'],
    queryFn: getRollStats,
    staleTime: 1000 * 60 * 5,
  })

  // 날짜 → CalendarFrame 맵
  const frameByDate = new Map<string, CalendarFrame>()
  for (const cf of calendarFrames) {
    if (cf.frameType !== 'RETROSPECTIVE') frameByDate.set(cf.date, cf)
  }

  const days = generateDays(currentMonth.year, currentMonth.month)

  // 월 변경 시: 오늘 날짜 중앙 스크롤 (또는 맨 앞)
  useEffect(() => {
    if (!stripRef.current) return
    const strip = stripRef.current
    const todayEl = strip.querySelector('[data-today="true"]') as HTMLElement | null
    if (todayEl) {
      strip.scrollLeft = todayEl.offsetLeft - strip.clientWidth / 2 + todayEl.offsetWidth / 2
    } else {
      strip.scrollLeft = 0
    }
  }, [currentMonth])

  // activeDate 변경 시: 해당 날짜 셀을 스트립 중앙으로 스크롤
  useEffect(() => {
    if (!activeDate || !stripRef.current) return
    const strip = stripRef.current
    const el = strip.querySelector(`[data-date="${activeDate}"]`) as HTMLElement | null
    if (!el) return
    strip.scrollTo({
      left: el.offsetLeft - strip.clientWidth / 2 + el.offsetWidth / 2,
      behavior: 'smooth',
    })
  }, [activeDate])

  const handleDateClick = (date: string) => {
    onDateSelect(selectedDate === date ? null : date)
  }

  const monthLabel = `${MONTH_LONG[currentMonth.month - 1]} ${currentMonth.year}`

  return (
    <div style={sectionStyles.wrap}>
      {/* 헤더: 월 탭 + 액션 */}
      <div style={sectionStyles.header}>
        <button
          style={sectionStyles.monthBtn}
          onClick={() => setSheetOpen(true)}
        >
          {monthLabel}
          <span style={{ fontSize: 9, color: 'var(--gold)', marginLeft: 4 }}>▾</span>
        </button>

        <div style={sectionStyles.headerRight}>
          <button style={sectionStyles.iconBtn} onClick={onSearchClick} aria-label="검색">
            <svg width="15" height="15" viewBox="0 0 13 13" fill="none">
              <circle cx="5" cy="5" r="3.5" stroke="var(--text-muted)" strokeWidth="1.3" />
              <line x1="7.8" y1="7.8" x2="11.5" y2="11.5" stroke="var(--text-muted)" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          </button>
          <button style={sectionStyles.quickBtn} onClick={onQuickNote}>
            ✦ 빠른 현상
          </button>
        </div>
      </div>

      {/* 롤 진행 바 */}
      {rollStats && (
        <div style={sectionStyles.rollRow}>
          <span style={sectionStyles.rollNum}>
            ROLL {String(rollStats.currentRollNum).padStart(2, '0')}
          </span>
          <div style={sectionStyles.rollTrack}>
            <div style={{
              ...sectionStyles.rollFill,
              width: `${(rollStats.currentRollProgress / rollStats.rollSize) * 100}%`,
            }} />
          </div>
          <span style={sectionStyles.rollText}>
            {rollStats.currentRollProgress}/{rollStats.rollSize}
          </span>
        </div>
      )}

      {/* 날짜 스트립 */}
      <div ref={stripRef} style={sectionStyles.strip}>
        {days.map(info => (
          <DateItem
            key={info.date}
            info={info}
            isSelected={selectedDate === info.date}
            isActive={!selectedDate && activeDate === info.date}
            cf={frameByDate.get(info.date)}
            onClick={() => handleDateClick(info.date)}
          />
        ))}
      </div>

      {/* 바텀시트 */}
      <MonthPickerSheet
        isOpen={sheetOpen}
        currentMonth={currentMonth}
        onMonthSelect={(y, m) => { onMonthChange({ year: y, month: m }); setSheetOpen(false) }}
        onClose={() => setSheetOpen(false)}
        availableYears={availableYears}
        recordMonthSet={recordMonthSet}
      />
    </div>
  )
}

// 현재 월에서 선택된 날짜의 CalendarFrame 반환 (SelectedPreviewCard용)
export function useCalendarFrame(year: number, month: number, date: string | null) {
  const { data: calendarFrames = [] } = useQuery({
    queryKey: ['calendarFrames', year, month],
    queryFn: () => getCalendarFrames(year, month),
    staleTime: 1000 * 60,
    enabled: date !== null,
  })
  if (!date) return undefined
  return calendarFrames.find(cf => cf.date === date && cf.frameType !== 'RETROSPECTIVE')
}

const sectionStyles: Record<string, React.CSSProperties> = {
  wrap: {
    flexShrink: 0,
    borderBottom: '1px solid var(--border-default)',
    background: 'var(--surface-base)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px 8px',
  },
  monthBtn: {
    fontFamily: "var(--font-mono)",
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--gold)',
    letterSpacing: '0.1em',
    background: 'var(--surface-muted)',
    border: '1px solid rgba(42,38,32,0.12)',
    borderRadius: 8,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: '4px 10px 4px 8px',
    WebkitTapHighlightColor: 'transparent',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  rollRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '0 16px 6px',
    gap: 8,
  },
  rollNum: {
    fontFamily: "var(--font-mono)",
    fontSize: 9,
    color: '#c8a96e',
    letterSpacing: '0.08em',
    flexShrink: 0,
    background: 'rgba(200,169,110,0.1)',
    padding: '2px 6px',
    borderRadius: 4,
  },
  rollTrack: {
    flex: 1,
    height: 3,
    background: 'rgba(42,38,32,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  rollFill: {
    height: '100%',
    background: '#7a5c20',
    borderRadius: 2,
    transition: 'width 0.4s ease',
  },
  rollText: {
    fontFamily: "var(--font-mono)",
    fontSize: 9,
    color: 'var(--text-muted)',
    whiteSpace: 'nowrap' as const,
    flexShrink: 0,
  },
  iconBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '4px 6px',
    display: 'flex',
    alignItems: 'center',
    WebkitTapHighlightColor: 'transparent',
  },
  quickBtn: {
    background: 'transparent',
    border: '1px solid rgba(122,92,32,0.4)',
    cursor: 'pointer',
    fontFamily: "var(--font-mono)",
    fontSize: 10,
    color: '#7a5c20',
    letterSpacing: '0.04em',
    padding: '5px 10px',
    borderRadius: 6,
    whiteSpace: 'nowrap' as const,
    WebkitTapHighlightColor: 'transparent',
  },
  strip: {
    display: 'flex',
    overflowX: 'auto',
    padding: '6px 12px 10px',
    gap: 4,
    scrollbarWidth: 'none' as const,
    msOverflowStyle: 'none' as const,
  },
}
