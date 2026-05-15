import { useState, useEffect, useRef } from 'react'

export function useGeolocation() {
  const [location, setLocation] = useState(null)
  const [status, setStatus]     = useState('requesting')
  const watchIdRef = useRef(null)
  const retryRef   = useRef(null)

  const getIPLocation = async () => {
    try {
      const res  = await fetch('https://ipapi.co/json/')
      const data = await res.json()
      if (data.latitude) {
        setLocation({
          lat: data.latitude,
          lng: data.longitude,
          accuracy: 10000, // ~10 km
          isIPBased: true,
          timestamp: Date.now(),
        })
        setStatus('ip-based')
      }
    } catch (err) {
      console.warn('IP location failed:', err)
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
        if (retryRef.current) {
          clearTimeout(retryRef.current)
          retryRef.current = null
        }
      },
      (err) => {
        console.warn('GPS error:', err.code, err.message)
        if (err.code === 1) {
          // Permission denied — don't retry
          setStatus('denied')
        } else {
          // Timeout or position unavailable — retry in 10s
          setStatus('unavailable')
          retryRef.current = setTimeout(() => {
            if (watchIdRef.current) {
              navigator.geolocation.clearWatch(watchIdRef.current)
            }
            startWatching()
          }, 10000)
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

  // IP-based fallback if GPS doesn't lock within 5 seconds
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      if (status === 'unavailable' || status === 'requesting') {
        getIPLocation()
      }
    }, 5000)
    return () => clearTimeout(fallbackTimer)
  }, [status]) // eslint-disable-line react-hooks/exhaustive-deps

  return { location, status }
}
