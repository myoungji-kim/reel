import { useEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getFrames, searchFrames, getArchivedFrames, unarchiveFrame } from '../api/frameApi'
import { useFrameStore } from '../stores/frameStore'
import { useUIStore } from '../stores/uiStore'
import { useToast } from '../hooks/useToast'
import FilmFrame from '../components/frame/FilmFrame'
import FrameOverlay from '../components/frame/FrameOverlay'
import MonthDivider from '../components/frame/MonthDivider'
import RollProgressBar from '../components/frame/RollProgressBar'
import RollDivider from '../components/frame/RollDivider'
import type { Frame } from '../types/frame'

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
  const { frames, setFrames, restoreFrame } = useFrameStore()
  const { isFrameDetailOpen, setFrameDetailOpen, setQuickNoteOpen } = useUIStore()
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

  // 보관된 필름
  const [isArchivedOpen, setIsArchivedOpen] = useState(false)

  // 북마크 필터
  const [isBookmarkFilter, setIsBookmarkFilter] = useState(false)

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

  const { data: searchResults = [] } = useQuery({
    queryKey: ['frame-search', debouncedQ],
    queryFn: () => searchFrames(debouncedQ),
    enabled: debouncedQ.length > 0,
    staleTime: 1000 * 30,
  })

  const { data: archivedFrames = [] } = useQuery({
    queryKey: ['archived-frames'],
    queryFn: getArchivedFrames,
    staleTime: 1000 * 60,
  })

  const handleUnarchive = async (frame: Frame) => {
    try {
      await unarchiveFrame(frame.id)
      restoreFrame({ ...frame, isArchived: false })
      queryClient.invalidateQueries({ queryKey: ['archived-frames'] })
      showToast('복원됐어요.')
    } catch {
      showToast('복원에 실패했어요.', 'error')
    }
  }

  const handleSearchToggle = () => {
    if (isSearchOpen) {
      setIsSearchOpen(false)
      setInputValue('')
      setDebouncedQ('')
    } else {
      setIsSearchOpen(true)
    }
  }

  const handleFrameClick = (frame: Frame) => {
    setSelectedFrameId(frame.id)
    setFrameDetailOpen(true)
  }

  const isSearching = debouncedQ.length > 0
  const filteredSearchResults = isBookmarkFilter ? searchResults.filter((f) => f.isBookmarked) : searchResults
  const displayFrames = isBookmarkFilter ? frames.filter((f) => f.isBookmarked) : frames
  const grouped = groupByMonth(displayFrames)

  return (
    <div style={styles.view}>
      {/* 헤더: 검색 비활성 = 라벨+검색아이콘 / 검색 활성 = 인라인 검색창 */}
      <div style={styles.header}>
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
            <span style={styles.headerLabel}>FILM ROLL</span>
            <div style={styles.headerActions}>
              <button style={styles.quickNoteBtn} onClick={() => setQuickNoteOpen(true)}>
                ✦ 빠른 현상
              </button>
              <button style={styles.searchBtn} onClick={handleSearchToggle} aria-label="검색">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="5.5" cy="5.5" r="4" stroke="var(--cream-muted)" strokeWidth="1.4" />
                  <line x1="8.5" y1="8.5" x2="12.5" y2="12.5" stroke="var(--cream-muted)" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </>
        )}
      </div>

      {/* 필터 탭바 */}
      <div style={styles.filterBar}>
        <button
          style={{
            ...styles.filterTab,
            color: !isBookmarkFilter ? 'var(--amber-light)' : 'var(--cream-muted)',
            borderBottom: !isBookmarkFilter ? '2px solid var(--amber)' : '2px solid transparent',
            opacity: !isBookmarkFilter ? 1 : 0.45,
          }}
          onClick={() => setIsBookmarkFilter(false)}
        >
          ALL
        </button>
        <button
          style={{
            ...styles.filterTab,
            color: isBookmarkFilter ? 'var(--amber-light)' : 'var(--cream-muted)',
            borderBottom: isBookmarkFilter ? '2px solid var(--amber)' : '2px solid transparent',
            opacity: isBookmarkFilter ? 1 : 0.45,
          }}
          onClick={() => setIsBookmarkFilter(true)}
        >
          ★
        </button>
      </div>

      <RollProgressBar />

      <div style={styles.list}>
        {isSearching ? (
          // 검색 결과 (북마크 필터 적용)
          filteredSearchResults.length === 0 ? (
            <div style={styles.empty}>
              <p style={styles.emptyText}>// NO RESULTS</p>
              <p style={styles.emptySub}>'{debouncedQ}'에 대한 프레임이 없습니다</p>
            </div>
          ) : (
            filteredSearchResults.map((frame) => (
              <FilmFrame
                key={frame.id}
                frame={frame}
                onClick={() => handleFrameClick(frame)}
              />
            ))
          )
        ) : loading ? (
          [0, 1, 2].map((i) => (
            <FilmFrame key={i} frame={{} as Frame} onClick={() => {}} skeleton />
          ))
        ) : isBookmarkFilter && displayFrames.length === 0 ? (
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
          Array.from(grouped.entries()).map(([yearMonth, monthFrames]) => (
            <div key={yearMonth}>
              <MonthDivider
                label={toMonthLabel(yearMonth)}
                count={monthFrames.length}
              />
              {monthFrames.map((frame) => (
                <div key={frame.id}>
                  <FilmFrame
                    frame={frame}
                    onClick={() => handleFrameClick(frame)}
                  />
                  {frame.frameNum % 24 === 0 && (
                    <RollDivider rollNum={Math.ceil(frame.frameNum / 24)} />
                  )}
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {/* 보관된 필름 섹션 */}
      {archivedFrames.length > 0 && (
        <div style={styles.archivedSection}>
          <button
            style={styles.archivedToggle}
            onClick={() => setIsArchivedOpen((v) => !v)}
          >
            보관된 필름 {archivedFrames.length}장
            <span style={styles.archivedChevron}>{isArchivedOpen ? '∧' : '›'}</span>
          </button>
          {isArchivedOpen && (
            <div style={styles.archivedList}>
              {archivedFrames.map((frame) => (
                <div key={frame.id} style={styles.archivedItem}>
                  <span style={styles.archivedTitle}>
                    ♦{String(frame.frameNum).padStart(2, '0')}　{frame.title}
                  </span>
                  <button
                    style={styles.restoreBtn}
                    onClick={() => handleUnarchive(frame)}
                  >
                    복원
                  </button>
                </div>
              ))}
            </div>
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
  header: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 16px',
    borderBottom: '1px solid var(--border)',
  },
  headerLabel: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 10,
    color: 'var(--amber)',
    letterSpacing: '0.15em',
    opacity: 0.6,
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
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
  },
  searchBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBar: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'stretch',
    borderBottom: '1px solid var(--border)',
    background: 'var(--bg)',
    padding: '0 4px',
  },
  filterTab: {
    padding: '8px 16px 10px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontFamily: "'Space Mono', monospace",
    fontSize: 10,
    letterSpacing: '0.08em',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    whiteSpace: 'nowrap' as const,
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
    padding: '4px',
    flexShrink: 0,
    opacity: 0.7,
  },
  list: {
    flex: 1,
    overflowY: 'auto',
    padding: '12px 16px 80px',
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
  archivedSection: {
    flexShrink: 0,
    borderTop: '1px solid var(--border)',
  },
  archivedToggle: {
    width: '100%',
    padding: '10px 16px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontFamily: "'Space Mono', monospace",
    fontSize: 10,
    color: 'var(--cream-muted)',
    letterSpacing: '0.08em',
    opacity: 0.5,
  },
  archivedChevron: {
    fontSize: 12,
    lineHeight: 1,
  },
  archivedList: {
    borderTop: '1px solid var(--border)',
    paddingBottom: 8,
  },
  archivedItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 16px',
  },
  archivedTitle: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 10,
    color: 'var(--cream-muted)',
    opacity: 0.5,
    letterSpacing: '0.04em',
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  restoreBtn: {
    background: 'transparent',
    border: '1px solid var(--border-light)',
    color: 'var(--cream-muted)',
    fontFamily: "'Space Mono', monospace",
    fontSize: 10,
    letterSpacing: '0.06em',
    padding: '3px 8px',
    borderRadius: 2,
    cursor: 'pointer',
    flexShrink: 0,
    marginLeft: 8,
    opacity: 0.6,
  },
}
