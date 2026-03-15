import type React from 'react'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import TopBar from '../components/layout/TopBar'
import FilmBar from '../components/layout/FilmBar'
import BottomNav from '../components/layout/BottomNav'
import HomeBentoPage from './HomeBentoPage'
import ChatPage from './ChatPage'
import RollPage from './RollPage'
import FavoritesPage from './FavoritesPage'
import ProfilePage from './ProfilePage'
import QuickNoteSheet from '../components/overlays/QuickNoteSheet'
import ArchivedSheet from '../components/overlays/ArchivedSheet'
import RollTitleSheet from '../components/overlays/RollTitleSheet'
import FrameOverlay from '../components/frame/FrameOverlay'
import { useUIStore } from '../stores/uiStore'
import { useFrameStore } from '../stores/frameStore'
import { getRolls } from '../api/rollApi'
import { getFrames, getFrame } from '../api/frameApi'
import type { Frame } from '../types/frame'

export default function HomePage() {
  const {
    activeTab, setActiveTab,
    homeView, setHomeView,
    isQuickNoteOpen, setQuickNoteOpen,
    isArchivedOpen, setArchivedOpen,
    isRollTitleOpen, setRollTitleOpen,
    pendingRollNum, setPendingRollNum,
  } = useUIStore()
  const { setFrames } = useFrameStore()

  const [bentoSelectedFrame, setBentoSelectedFrame] = useState<Frame | null>(null)
  const [isBentoFrameOpen, setIsBentoFrameOpen] = useState(false)

  const { data: rolls = [] } = useQuery({
    queryKey: ['rolls'],
    queryFn: getRolls,
    staleTime: 1000 * 60 * 5,
  })

  const pendingRollTitle = rolls.find(r => r.rollNum === pendingRollNum)?.title ?? null

  const handleFabClick = () => {
    if (activeTab === 'home') {
      setHomeView('chat')
    } else {
      setActiveTab('home')
      setHomeView('chat')
    }
  }

  const handleTabChange = (tab: 'home' | 'roll' | 'favorites' | 'profile') => {
    setActiveTab(tab)
    if (tab === 'home') {
      setHomeView('bento')
    }
  }

  const handleBentoFrameClick = async (id: number) => {
    try {
      const { data } = await getFrame(id)
      setBentoSelectedFrame(data.data)
      setIsBentoFrameOpen(true)
    } catch {
      // 실패 시 무시
    }
  }

  const renderContent = () => {
    if (activeTab === 'home') {
      if (homeView === 'chat') {
        return <ChatPage onBack={() => setHomeView('bento')} />
      }
      return (
        <HomeBentoPage
          onFrameClick={handleBentoFrameClick}
          onPlusClick={() => setQuickNoteOpen(true)}
          onChatClick={() => setHomeView('chat')}
        />
      )
    }
    if (activeTab === 'favorites') return <FavoritesPage />
    if (activeTab === 'profile') return <ProfilePage />
    return <RollPage />
  }

  return (
    <div style={styles.container}>
      <TopBar label={activeTab === 'profile' ? 'MY PAGE' : undefined} />
      <FilmBar />
      {renderContent()}
      <BottomNav
        activeTab={activeTab}
        homeView={homeView}
        onTabChange={handleTabChange}
        onFabClick={handleFabClick}
      />
      <QuickNoteSheet
        isOpen={isQuickNoteOpen}
        onClose={() => setQuickNoteOpen(false)}
        onSaved={() => {
          setQuickNoteOpen(false)
          setActiveTab('roll')
          getFrames(0, 200).then(({ data }) => setFrames(data.data.content))
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
      <FrameOverlay
        isOpen={isBentoFrameOpen}
        frame={bentoSelectedFrame}
        onClose={() => setIsBentoFrameOpen(false)}
      />
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 440,
    margin: '0 auto',
    height: '100dvh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
}
