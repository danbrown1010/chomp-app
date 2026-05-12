import { useState, useEffect } from 'react'

export function useWeather(lat, lng, bustKey = 0) {
  const [weather, setWeather] = useState(null)
  const [forecast, setForecast] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!lat || !lng) return

    const cacheKey = `vela-weather-${Math.round(lat * 10)}-${Math.round(lng * 10)}`
    const cacheTimeKey = `${cacheKey}-time`
    const cached = localStorage.getItem(cacheKey)
    const cachedTime = localStorage.getItem(cacheTimeKey)

    if (bustKey === 0 && cached && cachedTime) {
      const age = Date.now() - parseInt(cachedTime)
      if (age < 1800000) {
        const parsed = JSON.parse(cached)
        setWeather(parsed.current)
        setForecast(parsed.forecast)
        setLoading(false)
        return
      }
    }

    setLoading(true)

    const headers = { 'User-Agent': 'VELAApp/0.1' }

    fetch(`https://api.weather.gov/points/${lat.toFixed(4)},${lng.toFixed(4)}`, { headers })
      .then(r => r.json())
      .then(pointData => {
        const forecastUrl = pointData.properties.forecast
        const hourlyUrl = pointData.properties.forecastHourly
        return Promise.all([
          fetch(forecastUrl, { headers }).then(r => r.json()),
          fetch(hourlyUrl, { headers }).then(r => r.json()),
        ])
      })
      .then(([daily, hourly]) => {
        const current = hourly.properties.periods[0]
        const periods = daily.properties.periods.slice(0, 7)
        const result = { current, forecast: periods }
        setWeather(current)
        setForecast(periods)
        localStorage.setItem(cacheKey, JSON.stringify(result))
        localStorage.setItem(cacheTimeKey, Date.now().toString())
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
        if (cached) {
          const parsed = JSON.parse(cached)
          setWeather(parsed.current)
          setForecast(parsed.forecast)
        }
      })
  }, [lat, lng, bustKey])

  return { weather, forecast, loading, error }
}

export function useFireWeather(lat, lng) {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!lat || !lng) return

    fetch(
      `https://api.weather.gov/alerts/active` +
      `?point=${lat.toFixed(4)},${lng.toFixed(4)}` +
      `&event=Red%20Flag%20Warning,Fire%20Weather%20Watch,Extreme%20Fire%20Behavior`,
      { headers: { 'User-Agent': 'VELAApp/0.1' } }
    )
      .then(r => r.json())
      .then(data => {
        setAlerts(data.features || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [lat, lng])

  return { alerts, loading }
}
