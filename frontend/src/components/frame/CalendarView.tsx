import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getCalendarFrames, checkRetrospectiveAvailable, createRetrospective } from '../../api/frameApi'
import { getMoodDotColor } from '../../utils/moodTone'
import type { CalendarFrame } from '../../types/frame'
import { useToast } from '../../hooks/useToast'

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
  const [isGenerating, setIsGenerating] = useState(false)

  const queryClient = useQueryClient()
  const { showToast } = useToast()

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

  const { data: retroAvail } = useQuery({
    queryKey: ['retrospectiveAvailable', year, month],
    queryFn: () => checkRetrospectiveAvailable(year, month),
    enabled: !isCurrentMonth,
    staleTime: 1000 * 60 * 5,
  })

  const handleGenerate = async () => {
    if (isGenerating) return
    setIsGenerating(true)
    try {
      await createRetrospective(year, month)
      queryClient.invalidateQueries({ queryKey: ['calendarFrames', year, month] })
      queryClient.invalidateQueries({ queryKey: ['retrospectiveAvailable', year, month] })
      queryClient.invalidateQueries({ queryKey: ['frames'] })
      showToast('회고가 생성됐어요')
    } catch {
      showToast('회고 생성에 실패했어요.', 'error')
    } finally {
      setIsGenerating(false)
    }
  }

  const retrospectiveCf = calendarFrames.find(cf => cf.frameType === 'RETROSPECTIVE')
  const regularFrames = calendarFrames.filter(cf => cf.frameType !== 'RETROSPECTIVE')

  const retroSectionDivider = (
    <div style={styles.retroDivider}>
      <div style={styles.retroDividerLine} />
      <span style={styles.retroDividerLabel}>월간 회고</span>
      <div style={styles.retroDividerLine} />
    </div>
  )

  const frameByDate = new Map<string, CalendarFrame>()
  for (const cf of regularFrames) {
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

      {/* 빈 상태 */}
      {!isFetching && regularFrames.length === 0 && !retrospectiveCf && (
        <div style={styles.emptyState}>
          <p style={styles.emptyText}>// NO RECORDS</p>
          <p style={styles.emptySub}>이 달에 현상된 프레임이 없어요</p>
        </div>
      )}

      {/* 월간 회고 섹션 — 날짜 미선택 + 현재 달 아닐 때만 표시 */}
      {!isFetching && !selectedDate && !isCurrentMonth && (() => {
        // 생성 완료
        if (retrospectiveCf) {
          return (
            <div style={styles.retroSection}>
              {retroSectionDivider}
              <div style={styles.retroCard} onClick={() => onFrameSelect(retrospectiveCf.frameId)}>
                <div style={styles.retroCardHeader}>
                  <span style={styles.retroCardBadge}>◆ 월간 회고</span>
                  <span style={styles.retroCardArrow}>전체 보기 →</span>
                </div>
                <div style={styles.retroCardTitle}>{retrospectiveCf.title}</div>
                {retrospectiveCf.contentPreview && (
                  <div style={styles.retroCardContent}>{retrospectiveCf.contentPreview}</div>
                )}
              </div>
            </div>
          )
        }

        // 기록 0개 → 섹션 숨김
        if (!retroAvail || retroAvail.frameCount === 0) return null

        // 기록 1~2개 → 조용한 안내
        if (retroAvail.frameCount < 3) {
          return (
            <div style={styles.retroSection}>
              {retroSectionDivider}
              <p style={styles.retroHint}>기록이 조금 더 쌓이면 이 달의 회고를 만들 수 있어요</p>
            </div>
          )
        }

        // 기록 ≥ 3 + 미생성 → CTA
        return (
          <div style={styles.retroSection}>
            {retroSectionDivider}
            <button style={styles.retroCta} onClick={handleGenerate} disabled={isGenerating}>
              <span style={styles.retroCtaDiamond}>◆</span>
              <span style={{ ...styles.retroCtaLabel, ...(isGenerating ? styles.retroCtaBlink : {}) }}>
                {isGenerating ? '현상 중...' : `${MONTH_NAMES[month - 1]} 회고 생성하기`}
              </span>
              {!isGenerating && <span style={styles.retroCtaArrow}>→</span>}
            </button>
          </div>
        )
      })()}
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
  retroSection: {
    marginTop: 20,
    padding: '0 4px',
  },
  retroDivider: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  retroDividerLine: {
    flex: 1,
    height: 1,
    background: 'linear-gradient(90deg, transparent, rgba(122,158,138,0.3))',
  },
  retroDividerLabel: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 9,
    color: 'var(--fade-green)',
    letterSpacing: '0.12em',
    opacity: 0.7,
    flexShrink: 0,
  },
  retroCard: {
    padding: '14px 16px',
    border: '1px solid rgba(122,158,138,0.35)',
    background: 'rgba(122,158,138,0.05)',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    borderRadius: 2,
  },
  retroCardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  retroCardBadge: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 9,
    color: 'var(--fade-green)',
    letterSpacing: '0.1em',
    opacity: 0.8,
  },
  retroCardArrow: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 9,
    color: 'var(--fade-green)',
    opacity: 0.5,
    letterSpacing: '0.06em',
  },
  retroCardTitle: {
    fontFamily: "'Noto Serif KR', serif",
    fontSize: 15,
    color: 'var(--cream)',
    fontWeight: 400,
    lineHeight: 1.4,
  },
  retroCardContent: {
    fontFamily: "'Noto Serif KR', serif",
    fontSize: 12,
    color: 'var(--cream-muted)',
    lineHeight: 1.8,
    fontWeight: 300,
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  retroHint: {
    fontFamily: "'Noto Sans KR', sans-serif",
    fontSize: 11,
    color: 'var(--cream-muted)',
    fontWeight: 300,
    textAlign: 'center' as const,
    opacity: 0.45,
    padding: '8px 0 4px',
    lineHeight: 1.6,
  },
  retroCta: {
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
    textAlign: 'left' as const,
  },
  retroCtaDiamond: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 9,
    color: 'var(--amber-light)',
    flexShrink: 0,
  },
  retroCtaLabel: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 11,
    color: 'var(--amber-light)',
    letterSpacing: '0.08em',
    flex: 1,
  },
  retroCtaBlink: {
    animation: 'devBlink 1s ease-in-out infinite',
  },
  retroCtaArrow: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 12,
    color: 'var(--amber-light)',
    opacity: 0.6,
    flexShrink: 0,
  },
}
