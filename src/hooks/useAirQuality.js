import { useState, useEffect } from 'react'

function getCategoryColor(categoryNumber) {
  const colors = {
    1: '#22c55e',
    2: '#eab308',
    3: '#f97316',
    4: '#ef4444',
    5: '#7c3aed',
    6: '#7f1d1d',
  }
  return colors[categoryNumber] || '#6b7280'
}

export function useAirQuality(lat, lng) {
  const [aqi, setAqi] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!lat || !lng) return

    const key = import.meta.env.VITE_AIRNOW_API_KEY
    const cacheKey = `chomp-aqi-${Math.round(lat * 10)}-${Math.round(lng * 10)}`
    const cacheTimeKey = `${cacheKey}-time`
    const cached = localStorage.getItem(cacheKey)
    const cachedTime = localStorage.getItem(cacheTimeKey)

    if (cached && cachedTime) {
      const age = Date.now() - parseInt(cachedTime)
      if (age < 1800000) {
        setAqi(JSON.parse(cached))
        setLoading(false)
        return
      }
    }

    const url =
      `https://www.airnowapi.org/aq/observation/latLong/current/` +
      `?format=application/json` +
      `&latitude=${lat.toFixed(4)}` +
      `&longitude=${lng.toFixed(4)}` +
      `&distance=25` +
      `&API_KEY=${key}`

    fetch(url)
      .then(r => r.json())
      .then(data => {
        if (!data || data.length === 0) {
          setAqi(null)
          setLoading(false)
          return
        }
        const primary = data.find(d => d.ParameterName === 'PM2.5') || data[0]
        const aqiData = {
          aqi:           primary.AQI,
          category:      primary.Category.Name,
          pollutant:     primary.ParameterName,
          color:         getCategoryColor(primary.Category.Number),
          reportingArea: primary.ReportingArea,
          stateCode:     primary.StateCode,
          dateObserved:  primary.DateObserved,
          hourObserved:  primary.HourObserved,
        }
        setAqi(aqiData)
        localStorage.setItem(cacheKey, JSON.stringify(aqiData))
        localStorage.setItem(cacheTimeKey, Date.now().toString())
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
        if (cached) setAqi(JSON.parse(cached))
      })
  }, [lat, lng])

  return { aqi, loading, error }
}
