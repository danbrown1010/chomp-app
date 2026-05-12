import { useState, createContext, useContext, useCallback } from 'react'
import { useGeolocation } from '../hooks/useGeolocation'
import { useWeather } from '../hooks/useWeather'
import { useAirQuality } from '../hooks/useAirQuality'

const AppContext = createContext(null)

const SEED_TRIPS = []

export function AppProvider({ children }) {
  const [trips, setTrips] = useState(SEED_TRIPS)
  const [activeTrip, setActiveTrip] = useState(null)
  const [accent, setAccentState] = useState(
    () => localStorage.getItem('chomp-accent') || '#f97316'
  )
  const [theme, setThemeState] = useState(() => {
    const stored = localStorage.getItem('chomp-theme')
    if (!stored) localStorage.setItem('chomp-theme', 'dark')
    return stored || 'dark'
  })

  const createTrip = useCallback((trip) => {
    const next = { ...trip, id: String(Date.now()), status: 'pre-trip' }
    setTrips((prev) => [...prev, next])
    return next
  }, [])

  const { location, error: locationError, loading: locationLoading } = useGeolocation()
  const { weather, forecast: weatherForecast, loading: weatherLoading, error: weatherError } = useWeather(location?.lat, location?.lng)
  const { aqi, loading: aqiLoading, error: aqiError } = useAirQuality(location?.lat, location?.lng)

  const setAccent = useCallback((color) => {
    setAccentState(color)
    localStorage.setItem('chomp-accent', color)
    document.documentElement.style.setProperty('--color-accent', color)
  }, [])

  const setTheme = useCallback((t) => {
    setThemeState(t)
    localStorage.setItem('chomp-theme', t)
    document.documentElement.classList.remove('dark', 'light')
    document.documentElement.classList.add(t)
  }, [])

  return (
    <AppContext.Provider value={{ trips, activeTrip, setActiveTrip, createTrip, accent, setAccent, theme, setTheme, location, locationError, locationLoading, weather, weatherForecast, weatherLoading, weatherError, aqi, aqiLoading, aqiError }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppStore() {
  return useContext(AppContext)
}
