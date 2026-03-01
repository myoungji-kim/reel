// 필름 퍼포레이션 스크롤 바 — 애니메이션 속도 40s linear infinite 변경 금지
const HOLE_COUNT = 50

export default function FilmBar() {
  const holes = Array.from({ length: HOLE_COUNT }, (_, i) => (
    <div key={i} style={styles.hole} />
  ))

  return (
    <div style={styles.bar}>
      {/* 두 세트를 이어붙여 무한 루프 */}
      <div style={styles.anim}>
        {holes}
        {holes}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  bar: {
    height: 16,
    background: 'var(--bg)',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  anim: {
    display: 'flex',
    gap: 0,
    // filmScroll 키프레임은 index.css에 정의됨 — 40s 변경 금지
    animation: 'filmScroll 40s linear infinite',
    whiteSpace: 'nowrap',
  },
  hole: {
    width: 12,
    height: 8,
    borderRadius: 1,
    background: 'var(--bg-mid)',
    border: '1px solid var(--border-light)',
    margin: '0 6px',
    display: 'inline-block',
    flexShrink: 0,
  },
}
