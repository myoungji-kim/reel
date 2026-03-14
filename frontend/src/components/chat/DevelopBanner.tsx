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
    padding: '14px 16px',
    background: 'var(--surface-inverse)',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    cursor: 'pointer',
    animation: 'bannerFade 0.4s ease',
  },
  text: {
    fontSize: 12,
    color: 'var(--text-inverse-muted)',
    lineHeight: 1.5,
  },
  strong: {
    color: 'var(--text-inverse)',
    fontWeight: 500,
    display: 'block',
    marginBottom: 2,
  },
  pill: {
    flexShrink: 0,
    padding: '6px 14px',
    border: 'none',
    cursor: 'pointer',
    background: 'var(--text-inverse)',
    color: 'var(--text-primary)',
    fontFamily: "'DM Mono', 'Noto Sans KR', monospace",
    fontSize: 'var(--text-sm)' as unknown as number,
    letterSpacing: '0.04em',
    borderRadius: 'var(--radius-sm)',
    whiteSpace: 'nowrap',
    fontWeight: 500,
  },
}
