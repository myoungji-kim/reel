import type React from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { getFrames, getFrame, searchFrames } from '../api/frameApi'
import { getRolls } from '../api/rollApi'
import { useFrameStore } from '../stores/frameStore'
import { useUIStore } from '../stores/uiStore'
import { useToast } from '../hooks/useToast'
import FilmFrame from '../components/frame/FilmFrame'
import FrameOverlay from '../components/frame/FrameOverlay'
import MonthDivider from '../components/frame/MonthDivider'
import RollDivider from '../components/frame/RollDivider'
import RetrospectiveBanner from '../components/frame/RetrospectiveBanner'
import DateStripSection, { useCalendarFrame } from '../components/frame/DateStripSection'
import type { Frame, CalendarFrame } from '../types/frame'
import { formatChatDate } from '../utils/dateFormat'
import { getMoodBarColor } from '../utils/moodTone'

// YYYY-MM → "MARCH 2026"
function toMonthLabel(yearMonth: string): string {
  const [year, month] = yearMonth.split('-').map(Number)
  return new Date(year, month - 1, 1).toLocaleString('en-US', { month: 'long' }).toUpperCase() + ' ' + year
}

// frames → { "2026-03": [Frame, ...], ... } 최신순 유지
function groupByMonth(frames: Frame[]): Map<string, Frame[]> {
  const map = new Map<string, Frame[]>()
  for (const frame of frames) {
    const key = frame.date.slice(0, 7)
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(frame)
  }
  return map
}

// ─── SelectedPreviewCard ──────────────────────────────────────────────────────

function SelectedPreviewCard({
  cf,
  onOpen,
  onClose,
}: {
  cf: CalendarFrame
  onOpen: () => void
  onClose: () => void
}) {
  return (
    <div style={previewStyles.card} onClick={onOpen}>
      <div style={previewStyles.top}>
        <span style={previewStyles.frameNum}>FR.{String(cf.frameId).padStart(2, '0')}</span>
        <span style={previewStyles.date}>{formatChatDate(new Date(cf.date))}</span>
        <div style={{ flex: 1 }} />
        {cf.mood && (
          <div style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: getMoodBarColor(cf.mood),
            flexShrink: 0,
          }} />
        )}
        <button
          style={previewStyles.closeBtn}
          onClick={e => { e.stopPropagation(); onClose() }}
          aria-label="선택 해제"
        >
          ×
        </button>
      </div>
      <div style={previewStyles.title}>{cf.title}</div>
      {cf.contentPreview && (
        <div style={previewStyles.preview}>{cf.contentPreview}</div>
      )}
    </div>
  )
}

const previewStyles: Record<string, React.CSSProperties> = {
  card: {
    margin: '8px 16px 0',
    background: 'var(--gold-pale)',
    border: '1px solid var(--gold)',
    borderRadius: 10,
    padding: '10px 12px',
    cursor: 'pointer',
    WebkitTapHighlightColor: 'transparent',
  },
  top: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  frameNum: {
    fontFamily: "var(--font-mono)",
    fontSize: 8,
    color: 'var(--gold)',
    letterSpacing: '0.08em',
    flexShrink: 0,
  },
  date: {
    fontFamily: "var(--font-mono)",
    fontSize: 8,
    color: 'var(--text-muted)',
    letterSpacing: '0.06em',
  },
  title: {
    fontFamily: "var(--font-display)",
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--text-primary)',
    lineHeight: 1.3,
  },
  preview: {
    fontFamily: "var(--font-body)",
    fontSize: 10,
    color: 'var(--text-secondary)',
    lineHeight: 1.6,
    fontWeight: 300,
    marginTop: 4,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontFamily: "var(--font-mono)",
    fontSize: 14,
    color: 'var(--text-muted)',
    padding: '0 2px',
    lineHeight: 1,
    flexShrink: 0,
  },
}

// ─── RollPage ─────────────────────────────────────────────────────────────────

export default function RollPage() {
  const today = new Date()
  const { frames, setFrames } = useFrameStore()
  const { isFrameDetailOpen, setFrameDetailOpen, setQuickNoteOpen, setRollTitleOpen, setPendingRollNum } = useUIStore()
  const { showToast } = useToast()
  const listRef = useRef<HTMLDivElement>(null)
  const frameRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const isProgrammaticScroll = useRef(false)
  const scrollRafRef = useRef<number | null>(null)

  const [loading, setLoading] = useState(true)
  const [selectedFrame, setSelectedFrame] = useState<Frame | null>(null)

  // 날짜 스트립 상태
  const [currentMonth, setCurrentMonth] = useState({ year: today.getFullYear(), month: today.getMonth() + 1 })
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [activeScrollDate, setActiveScrollDate] = useState<string | null>(null)

  // 검색
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [debouncedQ, setDebouncedQ] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    getFrames(0, 200)
      .then(({ data }) => setFrames(data.data.content))
      .catch(() => showToast('목록을 불러오지 못했어요.', 'error'))
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQ(inputValue.trim()), 300)
    return () => clearTimeout(timer)
  }, [inputValue])

  useEffect(() => {
    if (isSearchOpen) searchInputRef.current?.focus()
  }, [isSearchOpen])

  // 월 변경 시 선택 해제
  useEffect(() => {
    setSelectedDate(null)
  }, [currentMonth])

  const { data: rolls = [] } = useQuery({
    queryKey: ['rolls'],
    queryFn: getRolls,
    staleTime: 1000 * 60 * 5,
  })
  const rollTitleMap = new Map(rolls.map(r => [r.rollNum, r.title]))

  const { data: searchResults = [] } = useQuery({
    queryKey: ['frame-search', debouncedQ],
    queryFn: () => searchFrames(debouncedQ),
    enabled: debouncedQ.length > 0,
    staleTime: 1000 * 30,
  })

  // 바텀시트용 집계
  const availableYears = useMemo(
    () => [...new Set(frames.map(f => new Date(f.date).getFullYear()))].sort(),
    [frames]
  )
  // 현재 연도가 없으면 추가
  const yearsWithCurrent = useMemo(
    () => availableYears.includes(today.getFullYear())
      ? availableYears
      : [...availableYears, today.getFullYear()].sort(),
    [availableYears]
  )
  const recordMonthSet = useMemo(
    () => new Set(frames.map(f => f.date.slice(0, 7))),
    [frames]
  )

  const handleSearchToggle = () => {
    if (isSearchOpen) {
      setIsSearchOpen(false)
      setInputValue('')
      setDebouncedQ('')
    } else {
      setIsSearchOpen(true)
    }
  }

  const handleFrameClick = async (frame: Frame) => {
    setSelectedFrame(frame)
    setFrameDetailOpen(true)
  }

  const handleDateSelect = (date: string | null) => {
    setSelectedDate(date)
    if (date) {
      isProgrammaticScroll.current = true
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const el = frameRefs.current[date]
          const list = listRef.current
          if (!el || !list) return
          const listRect = list.getBoundingClientRect()
          const elRect = el.getBoundingClientRect()
          const targetScroll = list.scrollTop + (elRect.top - listRect.top) - 16
          list.scrollTo({ top: Math.max(0, targetScroll), behavior: 'smooth' })
          setTimeout(() => { isProgrammaticScroll.current = false }, 600)
        })
      })
    }
  }

  const handleListScroll = () => {
    if (isProgrammaticScroll.current) return
    if (scrollRafRef.current) cancelAnimationFrame(scrollRafRef.current)
    scrollRafRef.current = requestAnimationFrame(() => {
      scrollRafRef.current = null
      const list = listRef.current
      if (!list) return
      const listTop = list.getBoundingClientRect().top

      let bestDate: string | null = null
      let bestDist = Infinity

      for (const [date, el] of Object.entries(frameRefs.current)) {
        if (!el) continue
        const elTop = el.getBoundingClientRect().top - listTop
        // 리스트 상단 기준으로 가장 가까운 프레임 (위 아래 모두 고려)
        const dist = Math.abs(elTop)
        if (dist < bestDist) {
          bestDist = dist
          bestDate = date
        }
      }

      if (bestDate && bestDate !== activeScrollDate) {
        setActiveScrollDate(bestDate)
        const [y, m] = bestDate.split('-').map(Number)
        setCurrentMonth(prev => prev.year !== y || prev.month !== m ? { year: y, month: m } : prev)
      }
    })
  }

  // 선택된 날짜의 CalendarFrame
  const selectedCf = useCalendarFrame(currentMonth.year, currentMonth.month, selectedDate)

  const handlePreviewOpen = async () => {
    if (!selectedCf) return
    try {
      const { data } = await getFrame(selectedCf.frameId)
      setSelectedFrame(data.data)
      setFrameDetailOpen(true)
    } catch {
      showToast('프레임을 불러오지 못했어요.', 'error')
    }
  }

  const isSearching = debouncedQ.length > 0
  const grouped = groupByMonth(frames)

  // 이번 달 회고 배너용
  const isCurrentMonth = currentMonth.year === today.getFullYear() && currentMonth.month === today.getMonth() + 1

  return (
    <div style={styles.view}>
      {/* 날짜 스트립 */}
      <DateStripSection
        currentMonth={currentMonth}
        onMonthChange={setCurrentMonth}
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
        activeDate={activeScrollDate}
        onSearchClick={handleSearchToggle}
        onQuickNote={() => setQuickNoteOpen(true)}
        availableYears={yearsWithCurrent}
        recordMonthSet={recordMonthSet}
      />

      {/* 검색창 (활성 시) */}
      {isSearchOpen && (
        <div style={styles.searchBar}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ flexShrink: 0, opacity: 0.45 }}>
            <circle cx="5" cy="5" r="3.5" stroke="var(--text-muted)" strokeWidth="1.3" />
            <line x1="7.8" y1="7.8" x2="11.5" y2="11.5" stroke="var(--text-muted)" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          <input
            ref={searchInputRef}
            style={styles.searchInput}
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder="제목 또는 내용으로 검색"
          />
          <button style={styles.cancelBtn} onClick={handleSearchToggle}>취소</button>
        </div>
      )}

      {/* 리스트 영역 */}
      <div ref={listRef} style={styles.list} onScroll={handleListScroll}>
        {isSearching ? (
          searchResults.length === 0 ? (
            <div style={styles.empty}>
              <p style={styles.emptyText}>// NO RESULTS</p>
              <p style={styles.emptySub}>'{debouncedQ}'에 대한 프레임이 없습니다</p>
            </div>
          ) : (
            searchResults.map(frame => (
              <FilmFrame key={frame.id} frame={frame} onClick={() => handleFrameClick(frame)} />
            ))
          )
        ) : loading ? (
          [0, 1, 2].map(i => (
            <FilmFrame key={i} frame={{} as Frame} onClick={() => {}} skeleton />
          ))
        ) : frames.length === 0 ? (
          <div style={styles.empty}>
            <p style={styles.emptyText}>// FILM ROLL EMPTY</p>
            <p style={styles.emptySub}>현상된 일기가 여기에 쌓여요</p>
          </div>
        ) : (
          <>
            {/* 선택된 날짜 프리뷰 카드 */}
            {selectedCf && (
              <SelectedPreviewCard
                cf={selectedCf}
                onOpen={handlePreviewOpen}
                onClose={() => setSelectedDate(null)}
              />
            )}

            {/* 월간 회고 배너 (이전 달만) */}
            {!isCurrentMonth && (
              <div style={{ padding: '8px 16px 0' }}>
                <RetrospectiveBanner
                  year={currentMonth.year}
                  month={currentMonth.month}
                />
              </div>
            )}

            {Array.from(grouped.entries()).map(([yearMonth, monthFrames]) => {
              const [ym_year, ym_month] = yearMonth.split('-').map(Number)
              return (
                <div key={yearMonth}>
                  <MonthDivider label={toMonthLabel(yearMonth)} count={monthFrames.length} year={ym_year} month={ym_month} />
                  {monthFrames.map(frame => (
                    <div
                      key={frame.id}
                      ref={el => { frameRefs.current[frame.date] = el }}
                    >
                      <FilmFrame
                        frame={frame}
                        onClick={() => handleFrameClick(frame)}
                        isHighlighted={frame.date === selectedDate}
                      />
                      {frame.frameNum % 24 === 0 && (() => {
                        const rn = Math.ceil(frame.frameNum / 24)
                        return (
                          <RollDivider
                            rollNum={rn}
                            title={rollTitleMap.get(rn) ?? null}
                            onEditTitle={() => {
                              setPendingRollNum(rn)
                              setRollTitleOpen(true)
                            }}
                          />
                        )
                      })()}
                    </div>
                  ))}
                </div>
              )
            })}
          </>
        )}
      </div>

      <FrameOverlay
        isOpen={isFrameDetailOpen}
        frame={selectedFrame}
        onClose={() => setFrameDetailOpen(false)}
      />
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  view: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  searchBar: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '0 12px',
    height: 38,
    borderBottom: '1px solid var(--border-default)',
    background: 'var(--surface-base)',
  },
  searchInput: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    fontFamily: "var(--font-body)",
    fontSize: 13,
    color: 'var(--text-primary)',
    letterSpacing: '0.02em',
  },
  cancelBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontFamily: "var(--font-mono)",
    fontSize: 10,
    color: 'var(--text-muted)',
    letterSpacing: '0.06em',
    padding: '4px 4px',
    flexShrink: 0,
  },
  list: {
    flex: 1,
    overflowY: 'auto',
    padding: '4px 16px 80px',
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 80,
  },
  emptyText: {
    fontFamily: "var(--font-mono)",
    fontSize: 13,
    color: 'var(--gold)',
    letterSpacing: '0.1em',
  },
  emptySub: {
    fontFamily: "var(--font-body)",
    fontSize: 13,
    color: 'var(--text-muted)',
    fontWeight: 300,
  },
}
