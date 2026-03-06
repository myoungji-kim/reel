interface Props {
  rollNum: number
}

export default function RollDivider({ rollNum }: Props) {
  const label = String(rollNum).padStart(2, '0')
  return (
    <div style={styles.wrap}>
      <div style={styles.line} />
      <span style={styles.text}>— ROLL {label} 완성 —</span>
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
  text: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 10,
    color: 'var(--amber)',
    opacity: 0.6,
    letterSpacing: '0.1em',
    whiteSpace: 'nowrap',
  },
}
