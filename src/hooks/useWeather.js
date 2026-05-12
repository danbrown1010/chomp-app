import { useState, useEffect } from 'react'

export function useWeather(lat, lng) {
  const [weather, setWeather] = useState(null)
  const [forecast, setForecast] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!lat || !lng) return

    const cacheKey = `chomp-weather-${Math.round(lat * 10)}-${Math.round(lng * 10)}`
    const cacheTimeKey = `${cacheKey}-time`
    const cached = localStorage.getItem(cacheKey)
    const cachedTime = localStorage.getItem(cacheTimeKey)

    if (cached && cachedTime) {
      const age = Date.now() - parseInt(cachedTime)
      if (age < 1800000) {
        const parsed = JSON.parse(cached)
        setWeather(parsed.current)
        setForecast(parsed.forecast)
        setLoading(false)
        return
      }
    }

    const headers = { 'User-Agent': 'ChompApp/0.1 contact@chomp.app' }

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
  }, [lat, lng])

  return { weather, forecast, loading, error }
}
