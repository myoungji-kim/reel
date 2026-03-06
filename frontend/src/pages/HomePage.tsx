import TopBar from '../components/layout/TopBar'
import FilmBar from '../components/layout/FilmBar'
import ChatPage from './ChatPage'
import RollPage from './RollPage'
import QuickNoteSheet from '../components/overlays/QuickNoteSheet'
import ArchivedSheet from '../components/overlays/ArchivedSheet'
import { useUIStore } from '../stores/uiStore'

export default function HomePage() {
  const { activeTab, setActiveTab, isQuickNoteOpen, setQuickNoteOpen, isArchivedOpen, setArchivedOpen } = useUIStore()

  return (
    <div style={styles.container}>
      <TopBar />
      <FilmBar />
      {activeTab === 'chat' ? <ChatPage /> : <RollPage />}
      <QuickNoteSheet
        isOpen={isQuickNoteOpen}
        onClose={() => setQuickNoteOpen(false)}
        onSaved={() => {
          setQuickNoteOpen(false)
          setActiveTab('roll')
        }}
      />
      <ArchivedSheet
        isOpen={isArchivedOpen}
        onClose={() => setArchivedOpen(false)}
      />
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
