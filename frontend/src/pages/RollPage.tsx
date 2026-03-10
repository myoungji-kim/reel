import { useEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getFrames, searchFrames } from '../api/frameApi'
import { getRolls } from '../api/rollApi'
import { useFrameStore } from '../stores/frameStore'
import { useUIStore } from '../stores/uiStore'
import { useToast } from '../hooks/useToast'
import FilmFrame from '../components/frame/FilmFrame'
import FrameOverlay from '../components/frame/FrameOverlay'
import MonthDivider from '../components/frame/MonthDivider'
import RollProgressBar from '../components/frame/RollProgressBar'
import RollDivider from '../components/frame/RollDivider'
import CalendarView from '../components/frame/CalendarView'
import type { Frame } from '../types/frame'

type Filter = 'all' | 'bookmark'
type ViewMode = 'roll' | 'calendar'

// YYYY-MM → "MARCH 2026" 형태
function toMonthLabel(yearMonth: string): string {
  const [year, month] = yearMonth.split('-').map(Number)
  const d = new Date(year, month - 1, 1)
  return d.toLocaleString('en-US', { month: 'long' }).toUpperCase() + ' ' + year
}

// frames → { "2026-03": [Frame, ...], ... }
function groupByMonth(frames: Frame[]): Map<string, Frame[]> {
  const map = new Map<string, Frame[]>()
  for (const frame of frames) {
    const key = frame.date.slice(0, 7)
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(frame)
  }
  return map
}

export default function RollPage() {
  const { frames, setFrames } = useFrameStore()
  const { isFrameDetailOpen, setFrameDetailOpen, setQuickNoteOpen, setRollTitleOpen, setPendingRollNum } = useUIStore()
  const { showToast } = useToast()
  const queryClient = useQueryClient()
  const [loading, setLoading] = useState(true)
  const [selectedFrameId, setSelectedFrameId] = useState<number | null>(null)
  const selectedFrame = frames.find((f) => f.id === selectedFrameId) ?? null

  // 검색
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [debouncedQ, setDebouncedQ] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)

  // 필터
  const [activeFilter, setActiveFilter] = useState<Filter>('all')

  // 뷰 전환
  const [viewMode, setViewMode] = useState<ViewMode>('roll')


  useEffect(() => {
    getFrames(0, 20)
      .then(({ data }) => setFrames(data.data.content))
      .catch(() => showToast('목록을 불러오지 못했어요.', 'error'))
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // 디바운스 300ms
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQ(inputValue.trim()), 300)
    return () => clearTimeout(timer)
  }, [inputValue])

  // 검색창 열릴 때 자동 포커스
  useEffect(() => {
    if (isSearchOpen) searchInputRef.current?.focus()
  }, [isSearchOpen])

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

  const handleSearchToggle = () => {
    if (isSearchOpen) {
      setIsSearchOpen(false)
      setInputValue('')
      setDebouncedQ('')
    } else {
      setIsSearchOpen(true)
    }
  }

  const handleTabSelect = (tab: 'roll' | 'calendar') => {
    setViewMode(tab)
    if (tab === 'calendar' && isSearchOpen) {
      setIsSearchOpen(false)
      setInputValue('')
      setDebouncedQ('')
    }
  }

  const handleFrameClick = (frame: Frame) => {
    setSelectedFrameId(frame.id)
    setFrameDetailOpen(true)
  }

  const isSearching = debouncedQ.length > 0
  const displayFrames = activeFilter === 'bookmark' ? frames.filter((f) => f.isBookmarked) : frames
  const grouped = groupByMonth(displayFrames)

  return (
    <div style={styles.view}>
      {/* 필터바: 검색 비활성 = 탭+액션 / 검색 활성 = 인라인 검색창 */}
      <div style={styles.filterBar}>
        {isSearchOpen ? (
          <>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, opacity: 0.5 }}>
              <circle cx="5.5" cy="5.5" r="4" stroke="var(--cream-muted)" strokeWidth="1.4" />
              <line x1="8.5" y1="8.5" x2="12.5" y2="12.5" stroke="var(--cream-muted)" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <input
              ref={searchInputRef}
              style={styles.searchInput}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="제목 또는 내용으로 검색"
            />
            <button style={styles.cancelBtn} onClick={handleSearchToggle}>
              취소
            </button>
          </>
        ) : (
          <>
            {/* 뷰 전환 탭: ROLL / GRID */}
            {(['roll', 'calendar'] as const).map((tab) => (
              <button
                key={tab}
                style={{
                  ...styles.filterTab,
                  color: viewMode === tab ? 'var(--amber-light)' : 'var(--cream-muted)',
                  borderBottom: viewMode === tab ? '2px solid var(--amber)' : '2px solid transparent',
                  opacity: viewMode === tab ? 1 : 0.45,
                }}
                onClick={() => handleTabSelect(tab)}
              >
                {tab === 'roll' ? 'ROLL' : 'GRID'}
              </button>
            ))}
            <div style={styles.filterActions}>
              {viewMode === 'roll' && (
                <>
                  {/* ★ 북마크 필터 토글 */}
                  <button
                    style={{
                      ...styles.bookmarkBtn,
                      color: activeFilter === 'bookmark' ? 'var(--amber)' : 'var(--cream-muted)',
                      opacity: activeFilter === 'bookmark' ? 1 : 0.45,
                    }}
                    onClick={() => setActiveFilter(f => f === 'bookmark' ? 'all' : 'bookmark')}
                    aria-label="북마크 필터"
                  >
                    ★
                  </button>
                  <button style={styles.searchBtn} onClick={handleSearchToggle} aria-label="검색">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <circle cx="5.5" cy="5.5" r="4" stroke="var(--cream-muted)" strokeWidth="1.4" />
                      <line x1="8.5" y1="8.5" x2="12.5" y2="12.5" stroke="var(--cream-muted)" strokeWidth="1.4" strokeLinecap="round" />
                    </svg>
                  </button>
                  <button style={styles.quickNoteBtn} onClick={() => setQuickNoteOpen(true)}>
                    ✦ 빠른 현상
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>

      <RollProgressBar />

      {viewMode === 'calendar' ? (
        <div style={styles.calendarWrapper}>
          <CalendarView
            onFrameSelect={(frameId) => {
              setSelectedFrameId(frameId)
              setFrameDetailOpen(true)
            }}
          />
        </div>
      ) : (
        <div style={styles.list}>
          {isSearching ? (
            searchResults.length === 0 ? (
              <div style={styles.empty}>
                <p style={styles.emptyText}>// NO RESULTS</p>
                <p style={styles.emptySub}>'{debouncedQ}'에 대한 프레임이 없습니다</p>
              </div>
            ) : (
              searchResults.map((frame) => (
                <FilmFrame key={frame.id} frame={frame} onClick={() => handleFrameClick(frame)} />
              ))
            )
          ) : loading ? (
            [0, 1, 2].map((i) => (
              <FilmFrame key={i} frame={{} as Frame} onClick={() => {}} skeleton />
            ))
          ) : activeFilter === 'bookmark' && displayFrames.length === 0 ? (
            <div style={styles.empty}>
              <p style={styles.emptyText}>// NO BOOKMARKS</p>
              <p style={styles.emptySub}>즐겨찾기한 프레임이 없어요</p>
            </div>
          ) : frames.length === 0 ? (
            <div style={styles.empty}>
              <p style={styles.emptyText}>// FILM ROLL EMPTY</p>
              <p style={styles.emptySub}>현상된 일기가 여기에 쌓여요</p>
            </div>
          ) : (
            Array.from(grouped.entries()).map(([yearMonth, monthFrames]) => {
              const [ym_year, ym_month] = yearMonth.split('-').map(Number)
              return (
              <div key={yearMonth}>
                <MonthDivider label={toMonthLabel(yearMonth)} count={monthFrames.length} year={ym_year} month={ym_month} />
                {monthFrames.map((frame) => (
                  <div key={frame.id}>
                    <FilmFrame frame={frame} onClick={() => handleFrameClick(frame)} />
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
            )})
          )}
        </div>
      )}

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
    position: 'relative',
  },
  filterBar: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'stretch',
    borderBottom: '1px solid var(--border)',
    background: 'var(--bg)',
    padding: '0 4px',
    minHeight: 38,
  },
  filterTab: {
    padding: '8px 14px 10px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontFamily: "'Space Mono', monospace",
    fontSize: 10,
    letterSpacing: '0.08em',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    whiteSpace: 'nowrap' as const,
  },
  filterActions: {
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    paddingRight: 4,
  },
  bookmarkBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontFamily: "'Space Mono', monospace",
    fontSize: 12,
    padding: '4px 6px',
    lineHeight: 1,
    transition: 'color 0.15s, opacity 0.15s',
  },
  searchBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '4px 6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickNoteBtn: {
    background: 'transparent',
    border: '1px solid var(--amber-35)',
    cursor: 'pointer',
    fontFamily: "'Space Mono', monospace",
    fontSize: 10,
    color: 'var(--amber)',
    letterSpacing: '0.08em',
    padding: '4px 10px',
    borderRadius: 2,
    alignSelf: 'center',
  },
  searchInput: {
    flex: 1,
    height: '100%',
    background: 'transparent',
    border: 'none',
    outline: 'none',
    fontFamily: "'Noto Sans KR', sans-serif",
    fontSize: 13,
    color: 'var(--cream)',
    letterSpacing: '0.02em',
    padding: '0 8px',
  },
  cancelBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontFamily: "'Space Mono', monospace",
    fontSize: 10,
    color: 'var(--cream-muted)',
    letterSpacing: '0.06em',
    padding: '4px 8px',
    flexShrink: 0,
    opacity: 0.7,
  },
  list: {
    flex: 1,
    overflowY: 'auto',
    padding: '12px 16px 80px',
  },
  calendarWrapper: {
    flex: 1,
    overflowY: 'auto',
    paddingBottom: 80,
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
    fontFamily: "'Space Mono', monospace",
    fontSize: 13,
    color: 'var(--amber)',
    letterSpacing: '0.1em',
  },
  emptySub: {
    fontFamily: "'Noto Sans KR', sans-serif",
    fontSize: 13,
    color: 'var(--cream-muted)',
    fontWeight: 300,
  },
}
