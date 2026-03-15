import { useRef, useState } from 'react'
import { Send } from 'lucide-react'

interface Props {
  onSend: (content: string) => void
  disabled?: boolean
  onDevelop?: () => void
  suggestActive?: boolean   // true면 골드 테두리 (suggest 준비됨)
  stage?: 1 | 2             // 1: 초기, 2: suggest 이후
}

export default function ChatInput({ onSend, disabled = false, onDevelop, suggestActive = false, stage = 1 }: Props) {
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

  const placeholder = stage >= 2
    ? '더 하고 싶은 말이 있으면...'
    : '오늘 있었던 일, 기분... 뭐든요'

  return (
    <div style={styles.area}>
      <div style={styles.row}>
        {/* 현상 아이콘 — 1단계: 조용히, 2단계(suggestActive): 골드 */}
        <button
          style={{
            ...styles.developIcon,
            ...(suggestActive ? styles.developIconActive : {}),
          }}
          onClick={onDevelop}
          aria-label="현상하기"
          type="button"
        >
          <svg viewBox="0 0 20 20" fill="none" width="14" height="14"
            stroke={suggestActive ? '#7a5c20' : '#b0a898'}
            strokeWidth="1.5" strokeLinecap="round">
            <circle cx="10" cy="10" r="3" />
            <path d="M3 10a7 7 0 1014 0A7 7 0 003 10z" opacity=".4" />
            <path d="M10 2v2.5M10 15.5V18M2 10h2.5M15.5 10H18" />
          </svg>
        </button>

        <textarea
          ref={textareaRef}
          style={styles.input}
          value={value}
          rows={1}
          placeholder={placeholder}
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
  developIcon: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    border: '1px solid rgba(42,38,32,0.15)',
    background: 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'border-color 0.2s, background 0.2s',
    WebkitTapHighlightColor: 'transparent',
  },
  developIconActive: {
    borderColor: 'rgba(200,169,110,0.6)',
    background: '#fdf8ee',
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
