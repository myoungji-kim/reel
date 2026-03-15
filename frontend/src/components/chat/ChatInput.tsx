import { useRef, useState } from 'react'
import { Send } from 'lucide-react'

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
          aria-label="메시지 전송"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  area: {
    flexShrink: 0,
    padding: '7px 14px 8px',
    borderTop: '1px solid var(--border-default)',
    background: 'var(--surface-base)',
  },
  row: {
    display: 'flex',
    gap: 8,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    background: 'var(--surface-card)',
    border: '1px solid var(--border-default)',
    borderRadius: 20,
    padding: '9px 14px',
    color: 'var(--text-primary)',
    fontFamily: "var(--font-body)",
    fontSize: 11,
    fontWeight: 300,
    resize: 'none',
    maxHeight: 100,
    lineHeight: 1.5,
    outline: 'none',
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: 'var(--surface-inverse)',
    border: 'none',
    color: 'var(--surface-base)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'opacity 0.2s, transform 0.1s',
  },
}
