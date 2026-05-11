import { useState, createContext, useContext, useCallback } from 'react'

const AppContext = createContext(null)

// Seed trip: departure yesterday (2026-05-10) → return in 4 days (2026-05-15)
const SEED_TRIPS = [
  {
    id: '1',
    name: 'Teanaway — Esmeralda Basin',
    departureDate: '2026-05-01',
    returnDate:    '2026-05-05',
    status: 'on-trip',
  },
]

export function AppProvider({ children }) {
  const [trips, setTrips] = useState(SEED_TRIPS)
  const [activeTrip, setActiveTrip] = useState(SEED_TRIPS[0])

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
