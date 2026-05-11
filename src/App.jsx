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
      <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', background: '#0a0a0a' }}>
        {showCreate ? (
          <CreateTripPage
            onClose={closeCreate}
            onCreated={() => { closeCreate(); setActiveTab('home') }}
          />
        ) : (
          <>
            <div className="flex-1 overflow-hidden">
              {activeTab === 'home'   && <HomePage onPlanTrip={openCreate} />}
              {activeTab === 'trip'   && <TripPage />}
              {activeTab === 'safety' && <SafetyPage />}
              {activeTab === 'rig'    && <RigPage />}
              {activeTab === 'more'   && moreSubview === null      && <MorePage     onNavigate={setMoreSubview} />}
              {activeTab === 'more'   && moreSubview === 'settings' && <SettingsPage onBack={() => setMoreSubview(null)} />}
            </div>
            <BottomNav active={activeTab} onChange={handleTabChange} />
          </>
        )}
      </div>
    </AppProvider>
  )
}
