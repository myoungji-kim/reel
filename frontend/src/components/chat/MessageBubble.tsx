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
            <div style={{ ...styles.time, textAlign: 'right' }}>{time}</div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div style={styles.msgAi}>
      <div style={styles.avatar}>AI</div>
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
    fontFamily: "'Space Mono', monospace",
    fontSize: 10,
    color: 'rgba(200,60,60,0.85)',
  },
  retryBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: 13,
    color: 'var(--cream-muted)',
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
    width: 28,
    height: 28,
    borderRadius: '50%',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, var(--amber), #8a5a1a)',
    fontFamily: "'VT323', monospace",
    color: 'var(--bg)',
    fontSize: 11,
    marginTop: 2,
  },
  bubbleUser: {
    padding: '10px 14px',
    borderRadius: '16px 4px 16px 16px',
    fontSize: 14,
    lineHeight: 1.65,
    fontWeight: 300,
    background: 'var(--amber-15)',
    border: '1px solid var(--amber-25)',
    color: 'var(--cream)',
  },
  bubbleAi: {
    padding: '10px 14px',
    borderRadius: '4px 16px 16px 16px',
    fontSize: 14,
    lineHeight: 1.65,
    fontWeight: 300,
    background: 'var(--bg-card)',
    border: '1px solid var(--border-light)',
    color: 'var(--cream-dim)',
  },
  time: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 10,
    color: 'var(--cream-muted)',
    marginTop: 4,
  },
}
