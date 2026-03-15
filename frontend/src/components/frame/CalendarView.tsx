import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getCalendarFrames, checkRetrospectiveAvailable, createRetrospective } from '../../api/frameApi'
import { getMoodBarColor } from '../../utils/moodTone'
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

const DOW_SHORT = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

/** calendarFrames 에서 이 달의 최장 연속 기록일 수 계산 */
function computeLongestStreak(frames: CalendarFrame[]): number {
  if (frames.length === 0) return 0
  const dates = frames.map(f => f.date).sort()
  let max = 1
  let cur = 1
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1])
    const curr = new Date(dates[i])
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
    if (diff === 1) { cur++; max = Math.max(max, cur) }
    else cur = 1
  }
  return max
}

/** "YYYY-MM-DD" → "YYYY.MM.DD — DOW" */
function formatPreviewDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const dow = DOW_SHORT[d.getDay()]
  return `${yyyy}.${mm}.${dd} — ${dow}`
}

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

  useEffect(() => {
    setSelectedDate(null)
  }, [year, month])

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
  const streak = computeLongestStreak(regularFrames)

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
    const cf = frameByDate.get(dateStr)
    if (!cf) { setSelectedDate(null); return }
    setSelectedDate(prev => (prev === dateStr ? null : dateStr))
  }

  const selectedCf = selectedDate ? frameByDate.get(selectedDate) : undefined

  // 회고 섹션 구분선
  const retroSectionDivider = (
    <div style={styles.retroDivider}>
      <div style={styles.retroDividerLine} />
      <span style={styles.retroDividerLabel}>월간 회고</span>
      <div style={styles.retroDividerLine} />
    </div>
  )

  return (
    <div style={styles.container}>

      {/* 월 네비게이션 */}
      <div style={styles.calNav}>
        <button style={styles.calNavArrow} onClick={handlePrevMonth} aria-label="이전 달">‹</button>
        <span style={styles.calMonthTitle}>{MONTH_NAMES[month - 1]} {year}</span>
        <button
          style={{ ...styles.calNavArrow, opacity: isCurrentMonth ? 0.3 : 1, cursor: isCurrentMonth ? 'default' : 'pointer' }}
          onClick={handleNextMonth}
          aria-label="다음 달"
          disabled={isCurrentMonth}
        >›</button>
      </div>

      {/* 통계 칩 */}
      <div style={styles.calStatRow}>
        {regularFrames.length === 0 ? (
          <>
            <span style={styles.statChip}>0 frames</span>
            <span style={styles.statChip}>이번 달 기록 없음</span>
          </>
        ) : (
          <>
            <span style={{ ...styles.statChip, ...styles.statChipActive }}>{regularFrames.length} frames</span>
            {streak >= 2 && (
              <span style={{ ...styles.statChip, ...styles.statChipStreak }}>연속 {streak}일</span>
            )}
          </>
        )}
      </div>

      {/* 요일 헤더 + 날짜 그리드 */}
      <div style={{ ...styles.grid, opacity: isFetching ? 0.35 : 1, transition: 'opacity 0.2s' }}>
        {WEEKDAYS.map((day, i) => (
          <div
            key={day}
            style={{
              ...styles.dowCell,
              color: i === 0 ? 'var(--emotion-warm)' : i === 6 ? 'var(--emotion-sad)' : 'var(--text-muted)',
            }}
          >
            {day}
          </div>
        ))}

        {cells.map((day, idx) => {
          if (day === null) return <div key={`empty-${idx}`} style={styles.dayCell} />

          const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const cf = frameByDate.get(dateStr)
          const isToday = dateStr === todayStr
          const isFuture = dateStr > todayStr
          const hasRecord = !!cf
          const isSelected = dateStr === selectedDate
          const isPressed = dateStr === pressedDate
          const dow = idx % 7  // 0=SUN, 6=SAT
          const isSun = dow === 0
          const isSat = dow === 6

          // 날짜 숫자 색상
          let numColor = 'var(--text-secondary)'
          if (isToday) numColor = 'var(--gold-pale)'
          else if (hasRecord) numColor = 'var(--gold)'
          else if (isFuture && isSun) numColor = '#e4c8b8'
          else if (isFuture && isSat) numColor = '#b8c8d8'
          else if (isFuture) numColor = '#c8c0b4'
          else if (isSun) numColor = 'var(--emotion-warm)'
          else if (isSat) numColor = 'var(--emotion-sad)'

          // 날짜 원 배경
          let circleBackground = 'transparent'
          if (isToday) circleBackground = 'var(--gold)'
          else if (isSelected && hasRecord) circleBackground = 'rgba(122,92,32,0.14)'
          else if (hasRecord) circleBackground = 'var(--gold-pale)'

          return (
            <div
              key={dateStr}
              style={{
                ...styles.dayCell,
                cursor: isFuture ? 'default' : 'pointer',
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
              <div
                style={{
                  ...styles.dayNum,
                  background: circleBackground,
                  color: numColor,
                  fontWeight: isToday || hasRecord ? 500 : 400,
                }}
              >
                {day}
              </div>
              {hasRecord && (
                <span
                  style={{
                    ...styles.emotionDot,
                    background: getMoodBarColor(cf.mood),
                    opacity: isToday ? 0.7 : 1,
                  }}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* 날짜 탭 시 프리뷰 */}
      {selectedDate && selectedCf && (
        <div style={styles.recordPreview}>
          <div style={styles.previewDate}>{formatPreviewDate(selectedDate)}</div>
          <div style={styles.previewTitle}>{selectedCf.title}</div>
          {selectedCf.contentPreview && (
            <div style={styles.previewBody}>{selectedCf.contentPreview}</div>
          )}
          <div style={styles.previewFooter}>
            <span style={styles.previewEmotion}>
              {selectedCf.mood && (
                <>
                  <span style={{ ...styles.previewEmotionDot, background: getMoodBarColor(selectedCf.mood) }} />
                  {selectedCf.mood}
                </>
              )}
            </span>
            <button style={styles.previewBtn} onClick={() => onFrameSelect(selectedCf.frameId)}>
              ◆ 현상 보기
            </button>
          </div>
        </div>
      )}

      {/* 빈 달 — NO RECORDS */}
      {!isFetching && regularFrames.length === 0 && !retrospectiveCf && (
        <div style={styles.noRecords}>
          <div style={styles.noRecordsLabel}>// NO RECORDS</div>
          <div style={styles.noRecordsSub}>이 달에 현상된 프레임이 없어요</div>
        </div>
      )}

      {/* 월간 회고 섹션 — 날짜 미선택 + 현재 달 아닐 때만 표시 */}
      {!isFetching && !selectedDate && !isCurrentMonth && (() => {
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

        if (!retroAvail || retroAvail.frameCount === 0) return null

        if (retroAvail.frameCount < 3) {
          return (
            <div style={styles.retroSection}>
              {retroSectionDivider}
              <p style={styles.retroHint}>기록이 조금 더 쌓이면 이 달의 회고를 만들 수 있어요</p>
            </div>
          )
        }

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
  // ── 컨테이너 ──────────────────────────────────
  container: {
    margin: '0 14px 14px',
    background: 'var(--surface-muted)',
    borderRadius: 12,
    overflow: 'hidden',
    padding: '14px 14px 16px',
  },

  // ── 월 네비게이션 ──────────────────────────────
  calNav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  calNavArrow: {
    width: 24,
    height: 24,
    borderRadius: '50%',
    background: 'transparent',
    border: '1px solid rgba(42,38,32,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: 14,
    color: 'var(--gold)',
    lineHeight: 1,
    padding: 0,
  },
  calMonthTitle: {
    fontFamily: "var(--font-mono)",
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--gold)',
    letterSpacing: '0.14em',
    textTransform: 'uppercase' as const,
  },

  // ── 통계 칩 ───────────────────────────────────
  calStatRow: {
    display: 'flex',
    gap: 6,
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 10,
    borderBottom: '1px solid var(--border-default)',
  },
  statChip: {
    fontFamily: "var(--font-mono)",
    fontSize: 8,
    color: 'var(--text-muted)',
    background: 'var(--surface-base)',
    border: '1px solid var(--border-default)',
    borderRadius: 8,
    padding: '3px 8px',
    letterSpacing: '0.06em',
  },
  statChipActive: {
    color: 'var(--gold)',
    background: 'var(--gold-pale)',
    borderColor: 'var(--gold-light)',
  },
  statChipStreak: {
    color: 'var(--text-secondary)',
    background: 'var(--surface-base)',
    borderColor: 'var(--border-default)',
  },

  // ── 요일 헤더 + 날짜 그리드 ───────────────────
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '2px 0',
  },
  dowCell: {
    fontFamily: "var(--font-mono)",
    fontSize: 7.5,
    textAlign: 'center' as const,
    letterSpacing: '0.06em',
    padding: '2px 0 6px',
  },
  dayCell: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: '3px 0',
    position: 'relative' as const,
  },
  dayNum: {
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    width: 28,
    height: 28,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    transition: 'background 0.15s',
    flexShrink: 0,
    lineHeight: 1,
  },
  emotionDot: {
    width: 4,
    height: 4,
    borderRadius: '50%',
    marginTop: 2,
    flexShrink: 0,
  },

  // ── 날짜 탭 프리뷰 ────────────────────────────
  recordPreview: {
    marginTop: 10,
    borderTop: '1px solid var(--border-default)',
    paddingTop: 10,
  },
  previewDate: {
    fontFamily: "var(--font-mono)",
    fontSize: 8,
    color: 'var(--gold)',
    letterSpacing: '0.08em',
    marginBottom: 4,
  },
  previewTitle: {
    fontFamily: "var(--font-display)",
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--text-primary)',
    marginBottom: 4,
    lineHeight: 1.3,
  },
  previewBody: {
    fontFamily: "var(--font-body)",
    fontSize: 9,
    fontWeight: 300,
    color: 'var(--text-secondary)',
    lineHeight: 1.6,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden',
    marginBottom: 8,
  },
  previewFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewEmotion: {
    fontFamily: "var(--font-body)",
    fontSize: 9,
    color: 'var(--text-secondary)',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  previewEmotionDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    flexShrink: 0,
  },
  previewBtn: {
    fontFamily: "var(--font-mono)",
    fontSize: 8,
    color: 'var(--gold)',
    border: '1px solid var(--gold-light)',
    background: 'transparent',
    borderRadius: 5,
    padding: '4px 10px',
    cursor: 'pointer',
    letterSpacing: '0.05em',
    whiteSpace: 'nowrap' as const,
  },

  // ── NO RECORDS 빈 상태 ────────────────────────
  noRecords: {
    textAlign: 'center' as const,
    padding: '20px 0 8px',
    borderTop: '1px solid var(--border-default)',
    marginTop: 8,
  },
  noRecordsLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: 10,
    color: 'var(--text-placeholder)',
    letterSpacing: '0.12em',
    marginBottom: 6,
  },
  noRecordsSub: {
    fontFamily: "var(--font-body)",
    fontSize: 9.5,
    fontWeight: 300,
    color: 'var(--text-muted)',
  },

  // ── 월간 회고 섹션 ────────────────────────────
  retroSection: {
    marginTop: 20,
    padding: '0 2px',
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
    background: 'var(--border-default)',
  },
  retroDividerLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: 9,
    color: '#8aaa8a',
    letterSpacing: '0.12em',
    flexShrink: 0,
  },
  retroCard: {
    padding: '14px 16px',
    border: '1px solid rgba(122,158,138,0.35)',
    background: 'rgba(138,170,138,0.06)',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 8,
    borderRadius: 8,
  },
  retroCardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  retroCardBadge: {
    fontFamily: "var(--font-mono)",
    fontSize: 9,
    color: '#5a8a5a',
    letterSpacing: '0.1em',
  },
  retroCardArrow: {
    fontFamily: "var(--font-mono)",
    fontSize: 9,
    color: '#7a9a7a',
    letterSpacing: '0.06em',
    opacity: 0.6,
  },
  retroCardTitle: {
    fontFamily: "var(--font-display)",
    fontSize: 15,
    color: 'var(--text-primary)',
    fontWeight: 400,
    lineHeight: 1.4,
  },
  retroCardContent: {
    fontFamily: "var(--font-display)",
    fontSize: 12,
    color: 'var(--text-secondary)',
    lineHeight: 1.8,
    fontWeight: 300,
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden',
  },
  retroHint: {
    fontFamily: "var(--font-body)",
    fontSize: 11,
    color: 'var(--text-muted)',
    fontWeight: 300,
    textAlign: 'center' as const,
    padding: '8px 0 4px',
    lineHeight: 1.6,
  },
  retroCta: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    width: '100%',
    height: 38,
    background: 'var(--surface-base)',
    border: '1px solid var(--gold-light)',
    borderRadius: 6,
    padding: '0 12px',
    cursor: 'pointer',
    textAlign: 'left' as const,
  },
  retroCtaDiamond: {
    fontFamily: "var(--font-mono)",
    fontSize: 9,
    color: 'var(--gold)',
    flexShrink: 0,
  },
  retroCtaLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    color: 'var(--gold)',
    letterSpacing: '0.08em',
    flex: 1,
  },
  retroCtaBlink: {
    animation: 'devBlink 1s ease-in-out infinite',
  },
  retroCtaArrow: {
    fontFamily: "var(--font-mono)",
    fontSize: 12,
    color: 'var(--gold)',
    opacity: 0.6,
    flexShrink: 0,
  },
}
