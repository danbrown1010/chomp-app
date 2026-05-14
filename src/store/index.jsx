import { useState, useEffect, createContext, useContext, useCallback } from 'react'
import { useGeolocation } from '../hooks/useGeolocation'
import { useWeather } from '../hooks/useWeather'
import { useAirQuality } from '../hooks/useAirQuality'
import { syncTripToSupabase, fetchTripsFromSupabase, deleteTripFromSupabase } from '../utils/syncManager'
import { addPendingTripSave, removePendingTripSave, addPendingTripDelete, removePendingTripDelete } from '../utils/tripStorage'

const AppContext = createContext(null)

export function AppProvider({ children, user = null, isPro = false, signOut = () => {}, signInWithGoogle = () => {} }) {
  const [trips, setTrips]         = useState([])
  const [activeTrip, setActiveTrip] = useState(null)
  const [syncStatus, setSyncStatus] = useState('idle')
  const [accent, setAccentState]  = useState(() => localStorage.getItem('vela-accent') || '#f97316')
  const [theme, setThemeState]    = useState(() => {
    const stored = localStorage.getItem('vela-theme')
    if (!stored) localStorage.setItem('vela-theme', 'dark')
    return stored || 'dark'
  })
  const [dataBust, setDataBust]   = useState(0)

  // Load trips from Supabase on sign-in
  useEffect(() => {
    if (!user) return
    fetchTripsFromSupabase(user.id).then(remoteTrips => {
      if (remoteTrips.length === 0) return
      setTrips(remoteTrips.map(t => ({
        id: t.id,
        name: t.name,
        type: t.type,
        region: t.region,
        departureDate: t.departure_date,
        returnDate: t.return_date,
        status: t.status,
        waypoints: t.waypoints ?? [],
        campsites: t.campsites ?? [],
        ...(t.data ?? {}),
      })))
    }).catch(console.error)
  }, [user?.id])

  const createTrip = useCallback(async (trip) => {
    const next = {
      ...trip,
      id: trip.id ?? `trip-${Date.now()}`,
      status: trip.status ?? 'pre-trip',
      createdAt: new Date().toISOString(),
    }
    setTrips(prev => [...prev, next])
    setActiveTrip(next)

    if (user) {
      setSyncStatus('syncing')
      const { error } = await syncTripToSupabase(next, user.id)
      if (error) {
        addPendingTripSave(next)
        setSyncStatus('error')
      } else {
        removePendingTripSave(next.id)
        setSyncStatus('idle')
      }
    }

    return next
  }, [user])

  const updateTrip = useCallback(async (trip) => {
    setTrips(prev => prev.map(t => t.id === trip.id ? trip : t))
    setActiveTrip(prev => prev?.id === trip.id ? trip : prev)

    if (user) {
      const { error } = await syncTripToSupabase(trip, user.id)
      if (error) {
        addPendingTripSave(trip)
      } else {
        removePendingTripSave(trip.id)
      }
    }
  }, [user])

  const deleteTrip = useCallback(async (tripId) => {
    setTrips(prev => prev.filter(t => t.id !== tripId))
    setActiveTrip(prev => prev?.id === tripId ? null : prev)

    if (user) {
      const { error } = await deleteTripFromSupabase(tripId)
      if (error) {
        addPendingTripDelete(tripId)
      } else {
        removePendingTripDelete(tripId)
      }
    }
  }, [user])

  const refreshHomeData = useCallback(() => setDataBust(k => k + 1), [])

  const { location, error: locationError, loading: locationLoading } = useGeolocation()
  const { weather, forecast: weatherForecast, loading: weatherLoading, error: weatherError } = useWeather(location?.lat, location?.lng, dataBust)
  const { aqi, loading: aqiLoading, error: aqiError } = useAirQuality(location?.lat, location?.lng, dataBust)

  const setAccent = useCallback((color) => {
    setAccentState(color)
    localStorage.setItem('vela-accent', color)
    document.documentElement.style.setProperty('--color-accent', color)
  }, [])

  const setTheme = useCallback((t) => {
    setThemeState(t)
    localStorage.setItem('vela-theme', t)
    document.documentElement.classList.remove('dark', 'light')
    document.documentElement.classList.add(t)
  }, [])

  return (
    <AppContext.Provider value={{
      user, isPro, signOut, signInWithGoogle,
      syncStatus, setSyncStatus,
      trips, activeTrip, setActiveTrip, createTrip, updateTrip, deleteTrip,
      accent, setAccent, theme, setTheme,
      location, locationError, locationLoading,
      weather, weatherForecast, weatherLoading, weatherError,
      aqi, aqiLoading, aqiError,
      refreshHomeData,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppStore() {
  return useContext(AppContext)
}
