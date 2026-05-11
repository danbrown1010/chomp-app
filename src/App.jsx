import { useState } from 'react'
import { AppProvider } from './store/index'
import BottomNav from './components/BottomNav'
import HomePage from './pages/HomePage'
import TripPage from './pages/TripPage'
import SafetyPage from './pages/SafetyPage'
import RigPage from './pages/RigPage'
import MorePage from './pages/MorePage'

export default function App() {
  const [activeTab, setActiveTab] = useState('home')

  return (
    <AppProvider>
      <div className="flex flex-col h-full bg-[#0a0a0a]" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="flex-1 overflow-hidden">
          {activeTab === 'home'   && <HomePage />}
          {activeTab === 'trip'   && <TripPage />}
          {activeTab === 'safety' && <SafetyPage />}
          {activeTab === 'rig'    && <RigPage />}
          {activeTab === 'more'   && <MorePage />}
        </div>
        <BottomNav active={activeTab} onChange={setActiveTab} />
      </div>
    </AppProvider>
  )
}
