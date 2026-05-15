import { useState, useEffect } from 'react'
import { useAuth } from './hooks/useAuth'
import { AppProvider, useAppStore } from './store/index'
import { useSyncOnLogin } from './hooks/useSyncOnLogin'
import { supabase } from './lib/supabase'
import { getPendingDeletes, removePendingDelete, getPendingSaves, removePendingSave } from './utils/gearStorage'
import { getPendingTripSaves, removePendingTripSave, getPendingTripDeletes, removePendingTripDelete } from './utils/tripStorage'
import { syncGearToSupabase, deleteGearFromSupabase, syncTripToSupabase, deleteTripFromSupabase } from './utils/syncManager'
import BottomNav from './components/BottomNav'
import HomePage from './pages/HomePage'
import TripPage from './pages/TripPage'
import SafetyPage from './pages/SafetyPage'
import RigPage from './pages/RigPage'
import MorePage from './pages/MorePage'
import CreateTripPage from './pages/CreateTripPage'
import EditTripPage from './pages/EditTripPage'
import SettingsPage from './pages/SettingsPage'
import SurvivalAgentPage from './pages/SurvivalAgentPage'
import KnowledgeBasePage from './pages/KnowledgeBasePage'
import MealPlanningPage from './pages/MealPlanningPage'
import GearRegistryPage from './pages/GearRegistryPage'
import AuthPage from './pages/AuthPage'

export default function App() {
  const { user, profile, isPro, signInWithGoogle, signOut, loading: authLoading, notAllowed } = useAuth()

  if (authLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(var(--vh, 1svh) * 100)', background: '#1C2117' }}>
        <svg width="48" height="48" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <rect width="100" height="100" rx="20" fill="#243020"/>
          <g fill="#F0EDE4">
            <path d="M50 5C41.7 5 35 11.7 35 20c0 11.5 15 28 15 28s15-16.5 15-28C65 11.7 58.3 5 50 5zM50 26c-3.3 0-6-2.7-6-6s2.7-6 6-6s6 2.7 6 6-2.7 6-6 6z"/>
            <path d="M2 92L30 38L45 63L38 73L53 92H2z"/>
            <path d="M98 92L70 45L55 65L62 75L47 92H98z"/>
            <path d="M46 92C46 92 47 78 50 70C53 62 57 59 55 52C53 45 49 48 49 48" fill="none" stroke="#1C2117" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round"/>
          </g>
        </svg>
      </div>
    )
  }

  if (!user) {
    return <AuthPage onSignIn={signInWithGoogle} notAllowed={notAllowed} />
  }

  return (
    <AppProvider user={user} profile={profile} signOut={signOut} signInWithGoogle={signInWithGoogle}>
      <AppShell user={user} />
    </AppProvider>
  )
}

function AppShell({ user }) {
  const { setSyncStatus, setProfile } = useAppStore()
  useSyncOnLogin(user, setSyncStatus)

  const [toast, setToast] = useState(null)
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3500) }

  // Handle Stripe redirect returns
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)

    if (params.get('upgraded') === 'true') {
      window.history.replaceState({}, '', window.location.pathname)
      if (user) {
        supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
          .then(({ data }) => {
            if (data) {
              setProfile(data)
              showToast('Welcome to VELA PRO!')
            }
          })
      }
    }

    if (params.get('cancelled') === 'true') {
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [user])

  useEffect(() => {
    const handleOnline = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return
      const userId = session.user.id

      for (const id of getPendingTripDeletes()) {
        const { error } = await deleteTripFromSupabase(id)
        if (!error) removePendingTripDelete(id)
      }

      for (const trip of Object.values(getPendingTripSaves())) {
        const { error } = await syncTripToSupabase(trip, userId)
        if (!error) removePendingTripSave(trip.id)
      }

      for (const id of getPendingDeletes()) {
        const { error } = await deleteGearFromSupabase(id)
        if (!error) removePendingDelete(id)
      }

      for (const item of Object.values(getPendingSaves())) {
        const { error } = await syncGearToSupabase(item, userId)
        if (!error) removePendingSave(item.id)
      }
    }
    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [])

  const [activeTab,   setActiveTab]   = useState('home')
  const [showCreate,  setShowCreate]  = useState(false)
  const [editingTrip, setEditingTrip] = useState(null)
  const [moreSubview, setMoreSubview] = useState(null)

  const openCreate  = () => setShowCreate(true)
  const closeCreate = () => setShowCreate(false)
  const openEdit    = (trip) => setEditingTrip(trip)
  const closeEdit   = () => setEditingTrip(null)

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setMoreSubview(null)
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-primary)',
      height: 'calc(var(--vh, 1svh) * 100)',
      paddingTop: 'env(safe-area-inset-top)',
      paddingBottom: 'env(safe-area-inset-bottom)',
      position: 'relative',
    }}>
      {toast && (
        <div style={{
          position: 'absolute', top: 'calc(16px + env(safe-area-inset-top))',
          left: '50%', transform: 'translateX(-50%)',
          zIndex: 9999, pointerEvents: 'none',
          background: 'var(--accent)', color: '#fff',
          padding: '10px 20px', borderRadius: 24,
          fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-body)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          whiteSpace: 'nowrap',
        }}>
          {toast}
        </div>
      )}
      {showCreate ? (
        <CreateTripPage
          onClose={closeCreate}
          onCreated={() => { closeCreate(); setActiveTab('home') }}
        />
      ) : editingTrip ? (
        <EditTripPage trip={editingTrip} onClose={closeEdit} />
      ) : (
        <>
          <div key={activeTab + (moreSubview ?? '')} className="page-enter" style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
            {activeTab === 'home'   && <HomePage onPlanTrip={openCreate} onEditTrip={openEdit} />}
            {activeTab === 'trip'   && <TripPage />}
            {activeTab === 'safety' && <SafetyPage />}
            {activeTab === 'rig'    && <RigPage />}
            {activeTab === 'more'   && moreSubview === null        && <MorePage          onNavigate={setMoreSubview} />}
            {activeTab === 'more'   && moreSubview === 'settings'  && <SettingsPage      onBack={() => setMoreSubview(null)} />}
            {activeTab === 'more'   && moreSubview === 'survival'  && <SurvivalAgentPage onBack={() => setMoreSubview(null)} />}
            {activeTab === 'more'   && moreSubview === 'knowledge' && <KnowledgeBasePage onBack={() => setMoreSubview(null)} />}
            {activeTab === 'more'   && moreSubview === 'meals'     && <MealPlanningPage  onBack={() => setMoreSubview(null)} />}
            {activeTab === 'more'   && moreSubview === 'gear'      && <GearRegistryPage  onBack={() => setMoreSubview(null)} />}
          </div>
          <BottomNav active={activeTab} onChange={handleTabChange} />
        </>
      )}
    </div>
  )
}
