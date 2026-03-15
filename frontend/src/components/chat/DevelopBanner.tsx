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
    margin: '0 14px 8px',
    padding: '11px 14px',
    background: 'var(--surface-inverse)',
    border: 'none',
    borderRadius: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    cursor: 'pointer',
    animation: 'bannerFade 0.4s ease',
  },
  text: {
    fontFamily: "'Noto Sans KR', sans-serif",
    fontSize: 9,
    color: 'rgba(240,238,233,0.5)',
    lineHeight: 1.5,
    fontWeight: 300,
  },
  strong: {
    fontFamily: "'Noto Sans KR', sans-serif",
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--text-inverse)',
    display: 'block',
    marginBottom: 2,
  },
  pill: {
    flexShrink: 0,
    padding: '7px 14px',
    border: 'none',
    cursor: 'pointer',
    background: 'var(--surface-base)',
    color: 'var(--text-primary)',
    fontFamily: "'DM Mono', 'Noto Sans KR', monospace",
    fontSize: 10,
    letterSpacing: '0.04em',
    borderRadius: 9,
    whiteSpace: 'nowrap',
    fontWeight: 500,
    minHeight: 34,
  },
}
