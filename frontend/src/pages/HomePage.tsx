import TopBar from '../components/layout/TopBar'
import FilmBar from '../components/layout/FilmBar'
import ChatPage from './ChatPage'
import RollPage from './RollPage'
import { useUIStore } from '../stores/uiStore'

export default function HomePage() {
  const { activeTab } = useUIStore()

  return (
    <div style={styles.container}>
      <TopBar />
      <FilmBar />
      {activeTab === 'chat' ? <ChatPage /> : <RollPage />}
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
}
