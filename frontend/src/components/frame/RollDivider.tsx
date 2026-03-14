interface Props {
  rollNum: number
  title?: string | null
  onEditTitle: () => void
}

export default function RollDivider({ rollNum, title, onEditTitle }: Props) {
  const label = String(rollNum).padStart(2, '0')
  const displayText = title ? `— ${title} —` : `— ROLL ${label} 완성 —`

  return (
    <div style={styles.wrap}>
      <div style={styles.line} />
      <div style={styles.center}>
        <span style={styles.text}>{displayText}</span>
        <button style={styles.editBtn} onClick={onEditTitle} aria-label="롤 이름 편집">✎</button>
      </div>
      <div style={styles.line} />
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    margin: '20px 0 8px',
  },
  line: {
    flex: 1,
    height: 1,
    background: 'var(--amber-20)',
  },
  center: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
  },
  text: {
    fontFamily: "var(--font-mono)",
    fontSize: 10,
    color: 'var(--amber)',
    opacity: 0.6,
    letterSpacing: '0.1em',
    whiteSpace: 'nowrap' as const,
  },
  editBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontFamily: "var(--font-mono)",
    fontSize: 8,
    color: 'var(--cream-muted)',
    opacity: 0.4,
    padding: '2px 2px',
    lineHeight: 1,
  },
}
