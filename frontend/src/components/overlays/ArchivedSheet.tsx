import { useState } from 'react'
import { X } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getArchivedFrames, unarchiveFrame } from '../../api/frameApi'
import { useFrameStore } from '../../stores/frameStore'
import { useToast } from '../../hooks/useToast'
import OverlaySheet from './OverlaySheet'
import FilmFrame from '../frame/FilmFrame'
import FrameOverlay from '../frame/FrameOverlay'
import type { Frame } from '../../types/frame'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function ArchivedSheet({ isOpen, onClose }: Props) {
  const [selectedFrame, setSelectedFrame] = useState<Frame | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const { restoreFrame } = useFrameStore()
  const { showToast } = useToast()
  const queryClient = useQueryClient()

  const { data: archivedFrames = [] } = useQuery({
    queryKey: ['archived-frames'],
    queryFn: getArchivedFrames,
    staleTime: 1000 * 60,
    enabled: isOpen,
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

  return (
    <>
      <OverlaySheet isOpen={isOpen} zIndex={300} onBackdropClick={onClose}>
        {/* 헤더 */}
        <div style={styles.header}>
          <div style={styles.handle} />
          <div style={styles.titleRow}>
            <span style={styles.title}>보관된 필름</span>
            <button style={styles.closeBtn} onClick={onClose} aria-label="닫기">
              <X size={14} />
            </button>
          </div>
        </div>

        {/* 목록 */}
        <div style={styles.list}>
          {archivedFrames.length === 0 ? (
            <div style={styles.empty}>
              <p style={styles.emptyText}>// EMPTY</p>
              <p style={styles.emptySub}>보관된 필름이 없어요</p>
            </div>
          ) : (
            archivedFrames.map((frame) => (
              <FilmFrame
                key={frame.id}
                frame={frame}
                onClick={() => { setSelectedFrame(frame); setIsDetailOpen(true) }}
              />
            ))
          )}
        </div>
      </OverlaySheet>

      <FrameOverlay
        isOpen={isDetailOpen}
        frame={selectedFrame}
        onClose={() => { setIsDetailOpen(false); setSelectedFrame(null) }}
        onUnarchive={handleUnarchive}
      />
    </>
  )
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    flexShrink: 0,
    padding: '16px 20px 12px',
    borderBottom: '1px solid var(--border)',
  },
  handle: {
    width: 36,
    height: 3,
    background: 'var(--border-light)',
    borderRadius: 2,
    margin: '0 auto 16px',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 10,
    color: 'var(--cream-muted)',
    letterSpacing: '0.12em',
    opacity: 0.7,
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--cream-muted)',
    padding: '4px',
    opacity: 0.6,
    display: 'flex',
    alignItems: 'center',
  },
  list: {
    flex: 1,
    overflowY: 'auto',
    padding: '12px 16px 32px',
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 60,
  },
  emptyText: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 12,
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
