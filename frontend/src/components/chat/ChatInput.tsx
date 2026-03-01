import { useRef, useState } from 'react'

interface Props {
  onSend: (content: string) => void
  disabled?: boolean
}

export default function ChatInput({ onSend, disabled = false }: Props) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const autoResize = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 100) + 'px'
  }

  const handleSend = () => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div style={styles.area}>
      <div style={styles.row}>
        <textarea
          ref={textareaRef}
          style={styles.input}
          value={value}
          rows={1}
          placeholder="오늘 있었던 일, 기분... 뭐든요"
          onChange={(e) => {
            setValue(e.target.value)
            autoResize()
          }}
          onKeyDown={handleKeyDown}
        />
        <button
          style={{
            ...styles.sendBtn,
            opacity: !value.trim() || disabled ? 0.35 : 1,
            cursor: !value.trim() || disabled ? 'not-allowed' : 'pointer',
          }}
          onClick={handleSend}
          disabled={!value.trim() || disabled}
        >
          ➤
        </button>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  area: {
    flexShrink: 0,
    padding: '10px 12px 16px',
    borderTop: '1px solid var(--border)',
    background: 'var(--bg)',
  },
  row: {
    display: 'flex',
    gap: 8,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    background: 'var(--bg-card)',
    border: '1px solid var(--border-light)',
    borderRadius: 20,
    padding: '10px 16px',
    color: 'var(--cream)',
    fontFamily: "'Noto Sans KR', sans-serif",
    fontSize: 14,
    fontWeight: 300,
    resize: 'none',
    maxHeight: 100,
    lineHeight: 1.5,
    outline: 'none',
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--amber-light), var(--amber))',
    border: 'none',
    color: 'var(--bg)',
    fontSize: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 2px 8px rgba(212,130,42,0.35)',
    transition: 'opacity 0.2s, transform 0.1s',
  },
}
