import { MOOD_OPTIONS, getMoodTintColor } from '../utils/moodTone'

interface Props {
  value: string | null
  onChange: (mood: string) => void
}

export default function MoodChipSelector({ value, onChange }: Props) {
  return (
    <div style={styles.row}>
      {MOOD_OPTIONS.map((opt) => {
        const selected = value === opt.value
        const tint = getMoodTintColor(opt.value)
        return (
          <button
            key={opt.value}
            style={{
              ...styles.chip,
              background: selected ? tint : 'rgba(255,255,255,0.02)',
              border: selected
                ? `1px solid ${tint.replace(/[\d.]+\)$/, '0.7)')}`
                : '1px solid var(--border-light)',
              color: selected ? 'var(--cream)' : 'var(--cream-muted)',
            }}
            onClick={() => onChange(opt.value)}
            type="button"
          >
            <span style={styles.emoji}>{opt.emoji}</span>
            <span style={styles.label}>{opt.value}</span>
          </button>
        )
      })}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  row: {
    display: 'flex',
    gap: 6,
    overflowX: 'auto',
    paddingBottom: 2,
    scrollbarWidth: 'none',
  },
  chip: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    padding: '5px 10px',
    borderRadius: 20,
    cursor: 'pointer',
    transition: 'background 0.2s, border-color 0.2s, color 0.2s',
    whiteSpace: 'nowrap',
  },
  emoji: {
    fontSize: 13,
    lineHeight: 1,
  },
  label: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 9,
    letterSpacing: '0.04em',
  },
}
