import { useState, createContext, useContext, useCallback } from 'react'

const AppContext = createContext(null)

const SEED_TRIPS = []

export function AppProvider({ children }) {
  const [trips, setTrips] = useState(SEED_TRIPS)
  const [activeTrip, setActiveTrip] = useState(null)
  const [accent, setAccentState] = useState(
    () => localStorage.getItem('chomp-accent') || '#f97316'
  )

  const createTrip = useCallback((trip) => {
    const next = { ...trip, id: String(Date.now()), status: 'pre-trip' }
    setTrips((prev) => [...prev, next])
    return next
  }, [])

  const setAccent = useCallback((color) => {
    setAccentState(color)
    localStorage.setItem('chomp-accent', color)
    document.documentElement.style.setProperty('--color-accent', color)
  }, [])

  return (
    <AppContext.Provider value={{ trips, activeTrip, setActiveTrip, createTrip, accent, setAccent }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppStore() {
  return useContext(AppContext)
}
