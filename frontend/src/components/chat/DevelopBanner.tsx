interface Props {
  onDevelop: () => void
}

export default function DevelopBanner({ onDevelop }: Props) {
  return (
    <div style={styles.banner} onClick={onDevelop}>
      <div style={styles.text}>
        <strong style={styles.strong}>◈ 오늘 일기로 현상하기</strong>
        대화 내용을 AI가 필름 한 장으로 정리해드릴게요
      </div>
      <button style={styles.pill}>현상하기 →</button>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  banner: {
    flexShrink: 0,
    margin: '8px 16px',
    padding: '12px 16px',
    background: 'var(--amber-07)',
    border: '1px dashed var(--amber-30)',
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    cursor: 'pointer',
    // bannerFade 애니메이션은 index.css에 정의됨
    animation: 'bannerFade 0.4s ease',
  },
  text: {
    fontSize: 12,
    color: 'var(--cream-dim)',
    lineHeight: 1.5,
  },
  strong: {
    color: 'var(--amber-light)',
    fontWeight: 500,
    display: 'block',
    marginBottom: 2,
  },
  pill: {
    flexShrink: 0,
    padding: '8px 14px',
    border: 'none',
    cursor: 'pointer',
    background: 'linear-gradient(135deg, var(--amber-light), var(--amber))',
    color: 'var(--bg)',
    fontFamily: "'Space Mono', monospace",
    fontSize: 10,
    letterSpacing: '0.05em',
    borderRadius: 20,
    whiteSpace: 'nowrap',
    boxShadow: '0 2px 8px var(--amber-30)',
  },
}
