import type { ChatMessage } from '../../types/chat'
import { formatTime } from '../../utils/dateFormat'

interface Props {
  message: ChatMessage
}

export default function MessageBubble({ message }: Props) {
  const isUser = message.role === 'USER'
  const time = formatTime(new Date(message.createdAt))

  if (isUser) {
    return (
      <div style={styles.msgUser}>
        <div>
          <div style={styles.bubbleUser}>
            {message.content.split('\n').map((line, i) => (
              <span key={i}>
                {line}
                {i < message.content.split('\n').length - 1 && <br />}
              </span>
            ))}
          </div>
          <div style={{ ...styles.time, textAlign: 'right' }}>{time}</div>
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
    background: 'rgba(212,130,42,0.15)',
    border: '1px solid rgba(212,130,42,0.25)',
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
    fontSize: 9,
    color: 'var(--cream-muted)',
    marginTop: 4,
  },
}
