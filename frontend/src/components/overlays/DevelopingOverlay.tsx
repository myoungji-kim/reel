import { useEffect, useRef } from 'react'

interface Props {
  isOpen: boolean
}

const FRAMES = [0, 0.1, 0.2, 0.3, 0.4]

export default function DevelopingOverlay({ isOpen }: Props) {
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen || !barRef.current) return
    // 진행바 리셋 후 2.2s 애니메이션 시작
    barRef.current.style.width = '0%'
    const id = setTimeout(() => {
      if (barRef.current) barRef.current.style.width = '100%'
    }, 50)
    return () => clearTimeout(id)
  }, [isOpen])

  return (
    <div
      style={{
        ...styles.overlay,
        opacity: isOpen ? 1 : 0,
        pointerEvents: isOpen ? 'all' : 'none',
      }}
    >
      {/* 필름 5장 */}
      <div style={styles.filmStrip}>
        {FRAMES.map((delay, i) => (
          <div
            key={i}
            style={{
              ...styles.devFrame,
              animationDelay: `${delay}s`,
            }}
          />
        ))}
      </div>

      <div style={styles.devText}>// DEVELOPING...</div>
      <div style={styles.devSubtext}>AI가 오늘 하루를 현상하는 중이에요</div>

      {/* 진행바 */}
      <div style={styles.progress}>
        <div ref={barRef} style={styles.progressBar} />
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 300,
    background: 'var(--bg)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    transition: 'opacity 0.3s',
  },
  filmStrip: {
    display: 'flex',
    gap: 3,
  },
  devFrame: {
    width: 32,
    height: 42,
    border: '1.5px solid var(--border)',
    borderRadius: 2,
    background: 'var(--bg-mid)',
    // devFlash 애니메이션은 index.css에 정의됨
    animation: 'devFlash 0.5s ease-in-out infinite',
  },
  devText: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 12,
    color: 'var(--amber)',
    letterSpacing: '0.1em',
    // devBlink 애니메이션은 index.css에 정의됨
    animation: 'devBlink 1s ease-in-out infinite',
  },
  devSubtext: {
    fontSize: 12,
    color: 'var(--cream-muted)',
    fontWeight: 300,
  },
  progress: {
    width: 160,
    height: 2,
    background: 'var(--border)',
    borderRadius: 1,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    width: '0%',
    background: 'linear-gradient(90deg, var(--amber), var(--amber-pale))',
    borderRadius: 1,
    transition: 'width 2.2s linear',
  },
}
