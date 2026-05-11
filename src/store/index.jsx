import { useState, createContext, useContext, useCallback } from 'react'

const AppContext = createContext(null)

const SEED_TRIPS = []

export function AppProvider({ children }) {
  const [trips, setTrips] = useState(SEED_TRIPS)
  const [activeTrip, setActiveTrip] = useState(null)

  const createTrip = useCallback((trip) => {
    const next = { ...trip, id: String(Date.now()), status: 'pre-trip' }
    setTrips((prev) => [...prev, next])
    return next
  }, [])

  return (
    <AppContext.Provider value={{ trips, activeTrip, setActiveTrip, createTrip }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppStore() {
  return useContext(AppContext)
}
