import type React from 'react'

interface Props {
  label?: string
}

export default function TopBar({ label }: Props) {
  return (
    <div>
      <div style={styles.topbar}>
        <div style={styles.inner}>
          <div style={styles.logo}>reel</div>
          {label && (
            <span style={styles.label}>{label}</span>
          )}
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  topbar: {
    flexShrink: 0,
    background: 'var(--surface-base)',
    borderBottom: '1px solid var(--border-default)',
  },
  inner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
  },
  logo: {
    fontFamily: "var(--font-display)",
    fontWeight: 600,
    fontStyle: 'italic',
    fontSize: 20,
    color: 'var(--text-primary)',
    lineHeight: 1,
  },
  label: {
    fontFamily: "var(--font-mono)",
    fontSize: 9,
    color: 'var(--text-muted)',
    letterSpacing: '0.06em',
  },
}
