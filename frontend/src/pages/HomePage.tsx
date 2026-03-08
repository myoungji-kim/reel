import { useQuery } from '@tanstack/react-query'
import TopBar from '../components/layout/TopBar'
import FilmBar from '../components/layout/FilmBar'
import ChatPage from './ChatPage'
import RollPage from './RollPage'
import QuickNoteSheet from '../components/overlays/QuickNoteSheet'
import ArchivedSheet from '../components/overlays/ArchivedSheet'
import RollTitleSheet from '../components/overlays/RollTitleSheet'
import { useUIStore } from '../stores/uiStore'
import { getRolls } from '../api/rollApi'

export default function HomePage() {
  const {
    activeTab, setActiveTab,
    isQuickNoteOpen, setQuickNoteOpen,
    isArchivedOpen, setArchivedOpen,
    isRollTitleOpen, setRollTitleOpen,
    pendingRollNum, setPendingRollNum,
  } = useUIStore()

  const { data: rolls = [] } = useQuery({
    queryKey: ['rolls'],
    queryFn: getRolls,
    staleTime: 1000 * 60 * 5,
  })

  const pendingRollTitle = rolls.find(r => r.rollNum === pendingRollNum)?.title ?? null

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
      <RollTitleSheet
        isOpen={isRollTitleOpen}
        rollNum={pendingRollNum}
        currentTitle={pendingRollTitle}
        onClose={() => {
          setRollTitleOpen(false)
          setPendingRollNum(null)
        }}
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
