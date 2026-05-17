import { useState, useEffect, useCallback } from 'react'

export function useHomeAssistant(enabled) {
  const [states, setStates] = useState([])
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)

  const haUrl  = (localStorage.getItem('vela-ha-url')   ?? '').replace(/\/$/, '')
  const haToken = localStorage.getItem('vela-ha-token') ?? ''

  const fetchStates = useCallback(async () => {
    if (!haUrl || !haToken) {
      setError('HA URL or token not configured — check Settings → Integrations')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${haUrl}/api/states`, {
        headers: { Authorization: `Bearer ${haToken}` },
      })
      if (res.status === 401) throw new Error('Invalid token — check Settings')
      if (!res.ok) throw new Error(`HA returned ${res.status}`)
      const data = await res.json()
      setStates(data)
      setConnected(true)
      setError(null)
      setLastUpdated(new Date())
    } catch (err) {
      setConnected(false)
      setError(
        err.message.includes('fetch') || err.message.includes('Failed')
          ? 'Cannot reach HA — connect to Chomp WiFi'
          : err.message
      )
    } finally {
      setLoading(false)
    }
  }, [haUrl, haToken])

  useEffect(() => {
    if (!enabled) {
      setStates([])
      setConnected(false)
      setError(null)
      return
    }
    fetchStates()
    const id = setInterval(fetchStates, 30000)
    return () => clearInterval(id)
  }, [enabled, fetchStates])

  const callService = useCallback(async (domain, service, serviceData = {}) => {
    if (!haUrl || !haToken) return
    try {
      await fetch(`${haUrl}/api/services/${domain}/${service}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${haToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(serviceData),
      })
      setTimeout(fetchStates, 600)
    } catch (err) {
      console.error('HA service call failed:', err)
    }
  }, [haUrl, haToken, fetchStates])

  const tempSensors = states
    .filter(s => s.attributes?.device_class === 'temperature' && s.state !== 'unavailable' && s.state !== 'unknown')
    .map(s => ({
      id: s.entity_id,
      label: s.attributes.friendly_name || s.entity_id.replace('sensor.', '').replace(/_/g, ' '),
      value: Math.round(parseFloat(s.state) * 10) / 10,
      unit: s.attributes.unit_of_measurement || '°F',
      color: null,
    }))

  const humiditySensors = states
    .filter(s => s.attributes?.device_class === 'humidity' && s.state !== 'unavailable' && s.state !== 'unknown')
    .map(s => ({
      id: s.entity_id,
      label: s.attributes.friendly_name || s.entity_id.replace('sensor.', '').replace(/_/g, ' '),
      value: Math.round(parseFloat(s.state)),
    }))

  const lights = states
    .filter(s => s.entity_id.startsWith('light.') && s.state !== 'unavailable')
    .map(s => ({
      id: s.entity_id,
      label: s.attributes.friendly_name || s.entity_id.replace('light.', '').replace(/_/g, ' '),
      on: s.state === 'on',
      brightness: s.attributes.brightness ? Math.round((s.attributes.brightness / 255) * 100) : 100,
    }))

  const scenes = states
    .filter(s => s.entity_id.startsWith('scene.'))
    .map(s => ({
      id: s.entity_id,
      label: s.attributes.friendly_name || s.entity_id.replace('scene.', '').replace(/_/g, ' '),
    }))

  return {
    connected, error, loading, lastUpdated,
    tempSensors, humiditySensors, lights, scenes,
    callService, refetch: fetchStates,
  }
}
