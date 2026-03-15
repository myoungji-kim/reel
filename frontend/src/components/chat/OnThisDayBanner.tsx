import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getOnThisDay, getFrame } from '../../api/frameApi'
import FrameOverlay from '../frame/FrameOverlay'
import type { Frame } from '../../types/frame'

export default function OnThisDayBanner() {
  const [openFrame, setOpenFrame] = useState<Frame | null>(null)
  const [isOverlayOpen, setIsOverlayOpen] = useState(false)

  const { data: items = [] } = useQuery({
    queryKey: ['on-this-day'],
    queryFn: getOnThisDay,
    staleTime: 1000 * 60 * 10,
  })

  const handleClick = async (frameId: number) => {
    const { data } = await getFrame(frameId)
    setOpenFrame(data.data)
    setIsOverlayOpen(true)
  }

  if (items.length === 0) return null

  return (
    <>
      <div style={styles.wrapper}>
        {items.map((item) => (
          <button
            key={item.frameId}
            style={styles.chip}
            onClick={() => handleClick(item.frameId)}
            onMouseDown={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.7' }}
            onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}
            onTouchStart={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.7' }}
            onTouchEnd={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}
          >
            <span style={styles.icon}>◆</span>
            <span style={styles.label}>
              {item.yearsAgo}년 전 오늘&nbsp;&nbsp;
              <span style={styles.frameRef}>#{item.frameNum}</span>
              &nbsp;·&nbsp;
              {item.title}
            </span>
          </button>
        ))}
      </div>

      <FrameOverlay
        isOpen={isOverlayOpen}
        frame={openFrame}
        onClose={() => { setIsOverlayOpen(false); setOpenFrame(null) }}
      />
    </>
  )
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    flexShrink: 0,
    display: 'flex',
    overflowX: 'auto',
    scrollbarWidth: 'none',
    borderBottom: '1px solid var(--border)',
    background: 'var(--bg-card)',
  },
  chip: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    height: 36,
    padding: '0 16px',
    background: 'transparent',
    border: 'none',
    borderRight: '1px solid var(--border)',
    cursor: 'pointer',
    transition: 'opacity 0.15s',
    whiteSpace: 'nowrap',
    maxWidth: 280,
  },
  icon: {
    fontSize: 10,
    color: 'var(--amber)',
    flexShrink: 0,
  },
  label: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 10,
    color: 'var(--cream-muted)',
    letterSpacing: '0.04em',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  frameRef: {
    color: '#c8a96e',
    opacity: 0.7,
  },
}
