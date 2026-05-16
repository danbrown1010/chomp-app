import { useState, useEffect, useRef } from 'react'

const MAX_RETRIES = 3

export function useGeolocation() {
  const [location, setLocation] = useState(null)
  const [status, setStatus]     = useState('requesting')
  const watchIdRef     = useRef(null)
  const retryRef       = useRef(null)
  const retryCountRef  = useRef(0)

  const getIPLocation = async () => {
    try {
      const res  = await fetch(`https://ipinfo.io/json?token=${import.meta.env.VITE_IPINFO_TOKEN}`, { headers: { Accept: 'application/json' } })
      const data = await res.json()

      if (data.loc) {
        const [lat, lng] = data.loc.split(',').map(parseFloat)
        setLocation({
          lat, lng,
          accuracy: 10000,
          isIPBased: true,
          city: data.city,
          region: data.region,
          timestamp: Date.now(),
        })
        setStatus('ip-based')
        return
      }
      throw new Error('No loc in response')
    } catch (err) {
      console.warn('ipinfo failed:', err.message)
      // Hardcoded Mac Mini location fallback
      setLocation({
        lat: 47.6815,
        lng: -122.2087,
        accuracy: 50000,
        isIPBased: true,
        city: 'Kirkland',
        region: 'WA',
        timestamp: Date.now(),
      })
      setStatus('ip-based')
    }
  }

  const startWatching = () => {
    if (!navigator.geolocation) {
      setStatus('unavailable')
      return
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          altitude: pos.coords.altitude,
          timestamp: pos.timestamp,
        })
        setStatus('locked')
        retryCountRef.current = 0
        if (retryRef.current) {
          clearTimeout(retryRef.current)
          retryRef.current = null
        }
      },
      (err) => {
        console.warn('GPS error:', err.code, err.message)

        if (err.code === 1) {
          // Permission denied — never retry
          setStatus('denied')
        } else if (err.code === 2) {
          // Position unavailable (no GPS hardware) — retry up to MAX_RETRIES then IP
          if (retryCountRef.current < MAX_RETRIES) {
            retryCountRef.current++
            setStatus('unavailable')
            retryRef.current = setTimeout(() => {
              if (watchIdRef.current) {
                navigator.geolocation.clearWatch(watchIdRef.current)
              }
              startWatching()
            }, 5000)
          } else {
            setStatus('unavailable')
            getIPLocation()
          }
        } else if (err.code === 3) {
          // Timeout — go straight to IP fallback
          setStatus('unavailable')
          getIPLocation()
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 30000,
      }
    )
  }

  useEffect(() => {
    startWatching()
    return () => {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current)
      if (retryRef.current)   clearTimeout(retryRef.current)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return { location, status }
}
