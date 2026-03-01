import TopBar from '../components/layout/TopBar'
import FilmBar from '../components/layout/FilmBar'
import ChatPage from './ChatPage'
import { useUIStore } from '../stores/uiStore'

function FilmRollPlaceholder() {
  return (
    <div style={styles.placeholder}>
      <p style={styles.placeholderText}>// FILM ROLL</p>
      <p style={styles.placeholderSub}>현상된 필름이 여기에 쌓여요</p>
    </div>
  )
}

export default function HomePage() {
  const { activeTab } = useUIStore()

  return (
    <div style={styles.container}>
      <TopBar />
      <FilmBar />
      {activeTab === 'chat' ? <ChatPage /> : <FilmRollPlaceholder />}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 440,
    margin: '0 auto',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  placeholder: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  placeholderText: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 13,
    color: 'var(--amber)',
    letterSpacing: '0.1em',
  },
  placeholderSub: {
    fontFamily: "'Noto Sans KR', sans-serif",
    fontSize: 13,
    color: 'var(--cream-muted)',
    fontWeight: 300,
  },
}
