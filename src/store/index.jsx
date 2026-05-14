import { useState, createContext, useContext, useCallback } from 'react'
import { useGeolocation } from '../hooks/useGeolocation'
import { useWeather } from '../hooks/useWeather'
import { useAirQuality } from '../hooks/useAirQuality'
import { useAuth } from '../hooks/useAuth'

const AppContext = createContext(null)

const SEED_TRIPS = []

export function AppProvider({ children }) {
  const [trips, setTrips] = useState(SEED_TRIPS)
  const [activeTrip, setActiveTrip] = useState(null)
  const [accent, setAccentState] = useState(
    () => localStorage.getItem('vela-accent') || '#f97316'
  )
  const [theme, setThemeState] = useState(() => {
    const stored = localStorage.getItem('vela-theme')
    if (!stored) localStorage.setItem('vela-theme', 'dark')
    return stored || 'dark'
  })

  const createTrip = useCallback((trip) => {
    const next = { ...trip, id: String(Date.now()), status: 'pre-trip' }
    setTrips((prev) => [...prev, next])
    return next
  }, [])

  const [dataBust, setDataBust] = useState(0)
  const refreshHomeData = useCallback(() => setDataBust(k => k + 1), [])

  const { user, isPro, signInWithGoogle, signOut, loading: authLoading } = useAuth()

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
    <AppContext.Provider value={{ user, isPro, signInWithGoogle, signOut, authLoading, trips, activeTrip, setActiveTrip, createTrip, accent, setAccent, theme, setTheme, location, locationError, locationLoading, weather, weatherForecast, weatherLoading, weatherError, aqi, aqiLoading, aqiError, refreshHomeData }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppStore() {
  return useContext(AppContext)
}
