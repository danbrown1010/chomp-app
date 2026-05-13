import { useState } from 'react'
import { AppProvider } from './store/index'
import BottomNav from './components/BottomNav'
import HomePage from './pages/HomePage'
import TripPage from './pages/TripPage'
import SafetyPage from './pages/SafetyPage'
import RigPage from './pages/RigPage'
import MorePage from './pages/MorePage'
import CreateTripPage from './pages/CreateTripPage'
import SettingsPage from './pages/SettingsPage'
import SurvivalAgentPage from './pages/SurvivalAgentPage'
import KnowledgeBasePage from './pages/KnowledgeBasePage'
import MealPlanningPage from './pages/MealPlanningPage'

export default function App() {
  const [activeTab,   setActiveTab]   = useState('home')
  const [showCreate,  setShowCreate]  = useState(false)
  const [moreSubview, setMoreSubview] = useState(null)

  const openCreate = () => setShowCreate(true)
  const closeCreate = () => setShowCreate(false)

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setMoreSubview(null)
  }

  return (
    <AppProvider>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg-primary)',
          height: 'calc(var(--vh, 1svh) * 100)',
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {showCreate ? (
          <CreateTripPage
            onClose={closeCreate}
            onCreated={() => { closeCreate(); setActiveTab('home') }}
          />
        ) : (
          <>
            <div key={activeTab + (moreSubview ?? '')} className="page-enter" style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
              {activeTab === 'home'   && <HomePage onPlanTrip={openCreate} />}
              {activeTab === 'trip'   && <TripPage />}
              {activeTab === 'safety' && <SafetyPage />}
              {activeTab === 'rig'    && <RigPage />}
              {activeTab === 'more'   && moreSubview === null      && <MorePage     onNavigate={setMoreSubview} />}
              {activeTab === 'more'   && moreSubview === 'settings'         && <SettingsPage      onBack={() => setMoreSubview(null)} />}
              {activeTab === 'more'   && moreSubview === 'survival'          && <SurvivalAgentPage  onBack={() => setMoreSubview(null)} />}
              {activeTab === 'more'   && moreSubview === 'knowledge'         && <KnowledgeBasePage  onBack={() => setMoreSubview(null)} />}
              {activeTab === 'more'   && moreSubview === 'meals'             && <MealPlanningPage   onBack={() => setMoreSubview(null)} />}
            </div>
            <BottomNav active={activeTab} onChange={handleTabChange} />
          </>
        )}
      </div>
    </AppProvider>
  )
}
