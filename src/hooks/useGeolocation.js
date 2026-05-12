import { useState, useEffect } from 'react'

export function useGeolocation() {
  const [location, setLocation] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported')
      setLoading(false)
      return
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000,
    }

    const success = (position) => {
      setLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        heading: position.coords.heading,
        speed: position.coords.speed,
        timestamp: position.timestamp,
      })
      setLoading(false)
      setError(null)
    }

    const failure = (err) => {
      setError(err.message)
      setLoading(false)
    }

    navigator.geolocation.getCurrentPosition(success, failure, options)

    const watchId = navigator.geolocation.watchPosition(success, failure, options)

    return () => navigator.geolocation.clearWatch(watchId)
  }, [])

  return { location, error, loading }
}
