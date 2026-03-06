import type { ReactNode, CSSProperties } from 'react'

interface Props {
  isOpen: boolean
  zIndex?: number
  maxHeight?: string
  borderRadius?: string
  sheetStyle?: CSSProperties
  onBackdropClick?: () => void
  children: ReactNode
}

export default function OverlaySheet({
  isOpen,
  zIndex = 400,
  maxHeight = '92vh',
  borderRadius = '20px 20px 0 0',
  sheetStyle,
  onBackdropClick,
  children,
}: Props) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex,
        background: 'var(--overlay-bg)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        transition: 'opacity 0.25s',
        opacity: isOpen ? 1 : 0,
        pointerEvents: isOpen ? 'all' : 'none',
      }}
      onClick={onBackdropClick}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 440,
          background: 'var(--bg-mid)',
          border: '1.5px solid var(--border)',
          borderBottom: 'none',
          borderRadius,
          display: 'flex',
          flexDirection: 'column',
          maxHeight,
          transform: isOpen ? 'translateY(0)' : 'translateY(60px)',
          transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)',
          ...sheetStyle,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}
