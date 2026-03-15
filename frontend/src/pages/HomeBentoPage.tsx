import type React from 'react'
import { useQuery } from '@tanstack/react-query'
import { getHomeSummary } from '../api/homeApi'
import { useUIStore } from '../stores/uiStore'
import type { HomeSummaryResponse } from '../api/homeApi'
import { getMoodBarColor } from '../utils/moodTone'
import { formatChatDate } from '../utils/dateFormat'

interface Props {
  onFrameClick: (id: number) => void
  onPlusClick: () => void
  onChatClick: () => void
}

export default function HomeBentoPage({ onFrameClick, onPlusClick }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ['home-summary'],
    queryFn: getHomeSummary,
    staleTime: 1000 * 60,
  })

  return (
    <div style={styles.page}>
      <HomeHeader today={data?.today ?? null} onPlusClick={onPlusClick} />
      <div style={styles.scroll}>
        {isLoading ? (
          <BentoSkeleton />
        ) : data ? (
          <BentoContent data={data} onFrameClick={onFrameClick} />
        ) : null}
      </div>
    </div>
  )
}

// ─── Header ──────────────────────────────────────────────────────────────────

function HomeHeader({
  today,
  onPlusClick,
}: {
  today: HomeSummaryResponse['today'] | null
  onPlusClick: () => void
}) {
  const now = today ? new Date(today.date) : new Date()
  const monthLabel = now
    .toLocaleString('en-US', { month: 'long' })
    .toUpperCase() + ' ' + now.getFullYear()
  const dayNum = now.getDate()
  const dow = today
    ? today.dayOfWeek.charAt(0) + today.dayOfWeek.slice(1).toLowerCase()
    : now.toLocaleString('en-US', { weekday: 'long' })

  return (
    <div style={styles.header}>
      <div>
        <div style={styles.headerMonth}>{monthLabel}</div>
        <div style={styles.headerTitle}>오늘의 일기</div>
        <div style={styles.headerSub}>{dow}, {dayNum}</div>
      </div>
      <button style={styles.plusBtn} onClick={onPlusClick} aria-label="빠른 현상">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 2v12M2 8h12" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}

// ─── Bento Content ───────────────────────────────────────────────────────────

function BentoContent({
  data,
  onFrameClick,
}: {
  data: HomeSummaryResponse
  onFrameClick: (id: number) => void
}) {
  const { today, streak, monthStats, recentFrames } = data

  return (
    <>
      <div style={styles.grid}>
        <StreakCell count={streak.count} recentDays={streak.recentDays} />
        <TodayCell today={today} />
        <MonthCell monthStats={monthStats} />
        <MoodFlowCell recentDays={streak.recentDays} />
      </div>

      {recentFrames.length > 0 && (
        <PrevRecordList frames={recentFrames} onFrameClick={onFrameClick} />
      )}
    </>
  )
}

// ─── StreakCell ───────────────────────────────────────────────────────────────

function StreakCell({
  count,
  recentDays,
}: {
  count: number
  recentDays: HomeSummaryResponse['streak']['recentDays']
}) {
  return (
    <div style={styles.streakCell}>
      <div>
        <div style={styles.cellCtx}>연속 기록</div>
        <div style={styles.streakTop}>
          <span style={styles.streakCount}>{count}</span>
          <span style={styles.streakUnit}>일</span>
        </div>
        <div style={styles.cellSubKr}>
          {count > 0 ? '오늘도 기록했어요' : '오늘 기록을 시작해요'}
        </div>
      </div>
      <div>
        <div style={styles.dotsRow}>
          {recentDays.map((day, i) => (
            <div
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                flexShrink: 0,
                background: day.mood
                  ? getMoodBarColor(day.mood)
                  : 'rgba(240,238,233,0.2)',
                border: day.mood ? 'none' : '1px solid rgba(240,238,233,0.3)',
              }}
            />
          ))}
        </div>
        <div style={styles.cellPeriod}>최근 7일</div>
      </div>
    </div>
  )
}

// ─── TodayCell ────────────────────────────────────────────────────────────────

const MOOD_LABEL: Record<string, string> = {
  '기쁨': '기쁨', '설렘': '설렘', '평온': '평온',
  '감사': '감사', '슬픔': '슬픔', '외로움': '외로움',
  '피곤': '피곤', '무기력': '무기력',
}

function TodayCell({ today }: { today: HomeSummaryResponse['today'] }) {
  const date = new Date(today.date)
  const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase()
  const day = date.getDate()
  const moodColor = today.mood ? getMoodBarColor(today.mood) : '#c8c0b4'
  const moodLabel = today.mood ? (MOOD_LABEL[today.mood] ?? today.mood) : null

  return (
    <div style={styles.todayCell}>
      <div style={styles.todayCtx}>
        <span style={{ ...styles.ctxDot, background: moodColor }} />
        오늘 감정
      </div>
      <div style={styles.todayMoodVal}>
        {today.hasRecord && moodLabel ? moodLabel : '—'}
      </div>
      <div style={styles.todayDateSub}>{month} {day}</div>
      <div style={styles.todayStatus}>
        {today.hasRecord ? '기록 완료' : '아직 기록 전'}
      </div>
    </div>
  )
}

// ─── MonthCell ────────────────────────────────────────────────────────────────

function MonthCell({ monthStats }: { monthStats: HomeSummaryResponse['monthStats'] }) {
  const monthName = new Date(monthStats.year, monthStats.month - 1, 1)
    .toLocaleString('en-US', { month: 'short' })
    .toUpperCase()

  return (
    <div style={styles.monthCell}>
      <div style={styles.cellCtxLight}>이번 달 기록</div>
      <div style={styles.monthTop}>
        <span style={styles.monthCount}>{monthStats.frameCount}</span>
      </div>
      <div style={styles.monthSub}>
        <span style={styles.monthUnit}>프레임</span>
        <span style={styles.monthPeriod}>{monthName} {monthStats.year}</span>
      </div>
    </div>
  )
}

// ─── MoodFlowCell ─────────────────────────────────────────────────────────────

const DOW_KR = ['일', '월', '화', '수', '목', '금', '토']

const MOOD_LEGEND = [
  { mood: '설렘',   color: '#c8a96e' },
  { mood: '감사',   color: '#c4866a' },
  { mood: '피곤',   color: '#9a9a8e' },
  { mood: '슬픔',   color: '#7a8fa6' },
  { mood: '평온',   color: '#8aaa8a' },
]

function MoodFlowCell({
  recentDays,
}: {
  recentDays: HomeSummaryResponse['streak']['recentDays']
}) {
  return (
    <div style={styles.moodFlowCell}>
      <div style={styles.flowHeader}>
        <span style={styles.flowTitle}>감정 흐름</span>
        <span style={styles.flowPeriod}>최근 7일</span>
      </div>

      <div style={styles.barsRow}>
        {recentDays.map((day, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: day.mood ? 40 : 6,
              borderRadius: '4px 4px 0 0',
              background: day.mood ? getMoodBarColor(day.mood) : 'rgba(42,38,32,0.08)',
              alignSelf: 'flex-end',
              transition: 'height 0.3s ease',
            }}
          />
        ))}
      </div>

      <div style={styles.dowAxis}>
        {recentDays.map((day, i) => {
          const dow = new Date(day.date).getDay()
          return (
            <span
              key={i}
              style={{
                ...styles.dowLabel,
                color: dow === 0 ? '#c4866a' : dow === 6 ? '#7a8fa6' : '#b0a898',
              }}
            >
              {DOW_KR[dow]}
            </span>
          )
        })}
      </div>

      <div style={styles.moodLegend}>
        {MOOD_LEGEND.map(({ mood, color }) => (
          <div key={mood} style={styles.legendItem}>
            <span style={{ ...styles.legendDot, background: color }} />
            <span>{mood}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── PrevRecordList ───────────────────────────────────────────────────────────

const MOOD_EMOJI: Record<string, string> = {
  '기쁨': '✦', '설렘': '✦',
  '감사': '🤍',
  '피곤': '😮‍💨', '무기력': '😮‍💨',
  '슬픔': '🌧', '외로움': '🌙',
  '평온': '🌿',
}

function PrevRecordList({
  frames,
  onFrameClick,
}: {
  frames: HomeSummaryResponse['recentFrames']
  onFrameClick: (id: number) => void
}) {
  const setActiveTab = useUIStore((s) => s.setActiveTab)

  return (
    <div style={{ marginTop: 16 }}>
      <div style={styles.recSectionHeader}>
        <span style={styles.recSectionLabel}>최근 기록</span>
        <button style={styles.recViewAll} onClick={() => setActiveTab('roll')}>
          전체 보기 ›
        </button>
      </div>
      {frames.map((frame) => (
        <PrevRecordCard
          key={frame.id}
          frame={frame}
          onClick={() => onFrameClick(frame.id)}
        />
      ))}
    </div>
  )
}

function PrevRecordCard({
  frame,
  onClick,
}: {
  frame: HomeSummaryResponse['recentFrames'][number]
  onClick: () => void
}) {
  const barColor = frame.mood ? getMoodBarColor(frame.mood) : '#c8c0b4'
  const emoji = frame.mood ? (MOOD_EMOJI[frame.mood] ?? '') : ''
  const label = frame.mood ? (MOOD_LABEL[frame.mood] ?? frame.mood) : ''

  return (
    <div style={styles.card} onClick={onClick}>
      <div style={{ ...styles.recEmotionBar, background: barColor }} />
      <div style={styles.recBody}>
        <div style={styles.cardTitle}>{frame.title}</div>
        <div style={styles.cardMeta}>
          <span style={styles.cardDate}>{formatChatDate(new Date(frame.date))}</span>
          <span style={styles.cardNum}>#{String(frame.frameNum).padStart(2, '0')}</span>
        </div>
        {frame.mood && (
          <div style={styles.recMoodText}>{emoji} {label}</div>
        )}
      </div>
      <span style={styles.cardArrow}>›</span>
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function BentoSkeleton() {
  return (
    <div style={styles.grid}>
      <div style={{ ...styles.streakCell, ...styles.skeleton }} />
      <div style={{ ...styles.todayCell, ...styles.skeleton }} />
      <div style={{ ...styles.monthCell, ...styles.skeleton }} />
      <div style={{ ...styles.moodFlowCell, ...styles.skeleton }} />
    </div>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  page: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: '14px 20px 10px',
    borderBottom: '1px solid var(--border-default)',
  },
  headerMonth: {
    fontFamily: "var(--font-mono)",
    fontSize: 9,
    color: '#9a9080',
    letterSpacing: '0.12em',
    marginBottom: 3,
  },
  headerTitle: {
    fontFamily: "var(--font-serif)",
    fontSize: 22,
    fontWeight: 600,
    color: '#6b6258',
    lineHeight: 1.1,
  },
  headerSub: {
    fontFamily: "var(--font-body)",
    fontSize: 9,
    color: '#9a9080',
    marginTop: 2,
    fontWeight: 300,
  },
  plusBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '4px 6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    WebkitTapHighlightColor: 'transparent',
    marginTop: 4,
  },
  scroll: {
    flex: 1,
    overflowY: 'auto',
    paddingBottom: 80,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
    padding: '16px 16px 0',
  },
  // ─── StreakCell ───
  streakCell: {
    gridRow: 'span 2',
    background: '#2a2620',
    borderRadius: 16,
    padding: '18px 16px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: 170,
  },
  cellCtx: {
    fontFamily: "var(--font-body)",
    fontSize: 9,
    fontWeight: 500,
    color: '#9a9080',
    marginBottom: 5,
  },
  cellCtxLight: {
    fontFamily: "var(--font-body)",
    fontSize: 9,
    fontWeight: 500,
    color: 'var(--text-muted)',
    marginBottom: 5,
  },
  streakTop: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 4,
  },
  streakCount: {
    fontFamily: "var(--font-mono)",
    fontSize: 40,
    fontWeight: 500,
    color: 'var(--gold)',
    lineHeight: 1,
  },
  streakUnit: {
    fontFamily: "var(--font-mono)",
    fontSize: 14,
    color: 'rgba(240,238,233,0.6)',
  },
  cellSubKr: {
    fontSize: 9,
    color: 'rgba(240,238,233,0.45)',
    marginTop: 4,
    fontWeight: 300,
    lineHeight: 1.4,
  },
  dotsRow: {
    display: 'flex',
    gap: 5,
    flexWrap: 'wrap',
  },
  cellPeriod: {
    fontFamily: "var(--font-mono)",
    fontSize: 7,
    color: 'rgba(240,238,233,0.3)',
    marginTop: 6,
    letterSpacing: '0.06em',
  },
  // ─── TodayCell ───
  todayCell: {
    background: 'var(--gold-pale)',
    borderRadius: 16,
    padding: '14px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  todayCtx: {
    fontSize: 9,
    color: '#c8a96e',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontWeight: 500,
    marginBottom: 2,
  },
  ctxDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    flexShrink: 0,
    display: 'inline-block',
  },
  todayMoodVal: {
    fontFamily: "var(--font-serif)",
    fontSize: 18,
    fontWeight: 600,
    color: '#7a5c20',
    lineHeight: 1,
    marginBottom: 3,
  },
  todayDateSub: {
    fontFamily: "var(--font-mono)",
    fontSize: 9,
    color: '#c8a96e',
    letterSpacing: '0.06em',
    marginBottom: 2,
  },
  todayStatus: {
    fontSize: 8,
    color: '#9a8060',
    fontWeight: 300,
  },
  // ─── MonthCell ───
  monthCell: {
    background: 'var(--surface-muted)',
    borderRadius: 16,
    padding: '14px 14px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    border: '1px solid var(--border-default)',
  },
  monthTop: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 4,
  },
  monthCount: {
    fontFamily: "var(--font-mono)",
    fontSize: 28,
    fontWeight: 500,
    color: 'var(--text-primary)',
    lineHeight: 1,
  },
  monthSub: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    marginTop: 4,
  },
  monthUnit: {
    fontFamily: "var(--font-mono)",
    fontSize: 9,
    color: 'var(--text-muted)',
  },
  monthPeriod: {
    fontFamily: "var(--font-mono)",
    fontSize: 7.5,
    color: '#c8c0b4',
  },
  // ─── MoodFlowCell ───
  moodFlowCell: {
    gridColumn: 'span 2',
    background: 'var(--surface-muted)',
    borderRadius: 16,
    padding: '14px 14px 12px',
    border: '1px solid var(--border-default)',
    display: 'flex',
    flexDirection: 'column',
  },
  flowHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  flowTitle: {
    fontFamily: "var(--font-body)",
    fontSize: 11,
    fontWeight: 500,
    color: '#5a5248',
  },
  flowPeriod: {
    fontFamily: "var(--font-mono)",
    fontSize: 8,
    color: '#b0a898',
    letterSpacing: '0.05em',
  },
  barsRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 5,
    height: 44,
  },
  dowAxis: {
    display: 'flex',
    gap: 5,
    marginTop: 5,
  },
  dowLabel: {
    flex: 1,
    fontFamily: "var(--font-mono)",
    fontSize: 8,
    textAlign: 'center',
  },
  moodLegend: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
    marginTop: 10,
    paddingTop: 8,
    borderTop: '1px solid rgba(42,38,32,0.08)',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 8,
    color: '#9a9080',
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    flexShrink: 0,
    display: 'inline-block',
  },
  // ─── PrevRecordList ───
  recSectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 16px 8px',
  },
  recSectionLabel: {
    fontFamily: "var(--font-body)",
    fontSize: 11,
    fontWeight: 500,
    color: '#5a5248',
  },
  recViewAll: {
    fontFamily: "var(--font-mono)",
    fontSize: 8.5,
    color: '#b0a898',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
  },
  card: {
    margin: '0 16px 7px',
    background: '#E4E1DA',
    borderRadius: 10,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'stretch',
    border: '1px solid rgba(42,38,32,0.08)',
    cursor: 'pointer',
    WebkitTapHighlightColor: 'transparent',
  },
  recEmotionBar: {
    width: 3,
    flexShrink: 0,
  },
  recBody: {
    flex: 1,
    padding: '9px 10px',
  },
  cardTitle: {
    fontFamily: "var(--font-serif)",
    fontSize: 12,
    fontWeight: 600,
    color: '#6b6258',
    marginBottom: 3,
    lineHeight: 1.2,
  },
  cardMeta: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
  },
  cardDate: {
    fontFamily: "var(--font-mono)",
    fontSize: 7.5,
    color: '#b0a898',
  },
  cardNum: {
    fontFamily: "var(--font-mono)",
    fontSize: 7.5,
    color: '#b0a898',
  },
  recMoodText: {
    fontSize: 8.5,
    color: '#7a6e5e',
    marginTop: 3,
  },
  cardArrow: {
    padding: '0 12px',
    display: 'flex',
    alignItems: 'center',
    fontSize: 12,
    color: '#c8c0b4',
    flexShrink: 0,
  },
  // ─── Skeleton ───
  skeleton: {
    background: 'var(--surface-muted)',
    animation: 'pulse 1.5s ease-in-out infinite',
  },
}
