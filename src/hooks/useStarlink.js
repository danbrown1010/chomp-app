import { useState, useEffect } from 'react'

const PROXY = import.meta.env.VITE_STARLINK_PROXY ?? 'http://localhost:3001'

export function useStarlink() {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${PROXY}/api/starlink/status`)
      const json = await res.json()
      if (json.success) {
        setStatus(json.data)
        setLastUpdated(new Date())
        setError(null)
      } else {
        setError(json.error)
      }
      setLoading(false)
    } catch {
      setError('Proxy unreachable')
      setStatus({ state: 'OFFLINE', offline: true })
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const downMbps   = status ? (status.downlinkThroughputBps / 1_000_000).toFixed(1) : null
  const upMbps     = status ? (status.uplinkThroughputBps   / 1_000_000).toFixed(1) : null
  const latencyMs  = status ? Math.round(status.popPingLatencyMs) : null
  const obstructionPct = status ? (status.obstructionFraction * 100).toFixed(1) : null
  const isOnline   = status?.state === 'CONNECTED'
  const isSearching = status?.state === 'SEARCHING'

  return {
    status, loading, error, lastUpdated,
    downMbps, upMbps, latencyMs, obstructionPct,
    isOnline, isSearching,
    refetch: fetchStatus,
  }
}
