import type { ChatMessage } from '../../types/chat'
import { formatTime } from '../../utils/dateFormat'

interface Props {
  message: ChatMessage
  onRetry?: () => void
}

export default function MessageBubble({ message, onRetry }: Props) {
  const isUser = message.role === 'USER'
  const time = formatTime(new Date(message.createdAt))

  if (isUser) {
    return (
      <div style={styles.msgUser}>
        <div>
          <div style={message.failed ? { ...styles.bubbleUser, ...styles.bubbleFailed } : styles.bubbleUser}>
            {message.content.split('\n').map((line, i) => (
              <span key={i}>
                {line}
                {i < message.content.split('\n').length - 1 && <br />}
              </span>
            ))}
          </div>
          {message.failed ? (
            <div style={styles.failedRow}>
              <button style={styles.retryBtn} onClick={onRetry} title="재시도">↺</button>
              <span style={styles.failedText}>✕ 전송 실패</span>
            </div>
          ) : (
            <div style={styles.timeUser}>{time}</div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div style={styles.msgAi}>
      <div style={styles.avatar}><div style={styles.avatarRing} /></div>
      <div>
        <div style={styles.bubbleAi}>
          {message.content.split('\n').map((line, i) => (
            <span key={i}>
              {line}
              {i < message.content.split('\n').length - 1 && <br />}
            </span>
          ))}
        </div>
        <div style={styles.time}>{time}</div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  bubbleFailed: {
    background: 'rgba(180,40,40,0.12)',
    border: '1px solid rgba(180,40,40,0.35)',
  },
  failedRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 4,
  },
  failedText: {
    fontFamily: "var(--font-mono)",
    fontSize: 'var(--text-base)' as unknown as number,
    color: 'rgba(200,60,60,0.85)',
  },
  retryBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: 13,
    color: 'var(--text-muted)',
    padding: 0,
    lineHeight: 1,
  },
  msgUser: {
    display: 'flex',
    gap: 8,
    maxWidth: '85%',
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  msgAi: {
    display: 'flex',
    gap: 8,
    maxWidth: '85%',
    alignSelf: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--surface-inverse)',
    marginTop: 2,
  },
  avatarRing: {
    width: 14,
    height: 14,
    borderRadius: '50%',
    border: '1.5px solid var(--accent-gold)',
  },
  bubbleUser: {
    padding: '10px 14px',
    borderRadius: 'var(--radius-md) 2px var(--radius-md) var(--radius-md)',
    fontSize: 14,
    lineHeight: 1.65,
    fontWeight: 300,
    background: 'var(--surface-inverse)',
    border: 'none',
    color: 'var(--text-inverse)',
  },
  bubbleAi: {
    padding: '10px 14px',
    borderRadius: '2px var(--radius-md) var(--radius-md) var(--radius-md)',
    fontSize: 14,
    lineHeight: 1.65,
    fontWeight: 300,
    background: 'var(--surface-card)',
    border: '1px solid var(--border-default)',
    color: 'var(--text-secondary)',
  },
  time: {
    fontFamily: "var(--font-mono)",
    fontSize: 'var(--text-xs)' as unknown as number,
    color: 'var(--text-placeholder)',
    marginTop: 4,
    paddingLeft: 40,
  },
  timeUser: {
    fontFamily: "var(--font-mono)",
    fontSize: 'var(--text-xs)' as unknown as number,
    color: 'var(--text-placeholder)',
    marginTop: 4,
    textAlign: 'right' as const,
  },
}
