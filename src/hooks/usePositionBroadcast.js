import { useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAppStore } from '../store/index'

export function usePositionBroadcast() {
  const { location, activeTrip, user, ecoflowSoc, ecoflowCharging } = useAppStore()
  const intervalRef      = useRef(null)
  const lastLocationRef  = useRef(null)
  const lastChargingRef  = useRef(undefined)
  const wasPublishedRef  = useRef(false)

  const getUpdateInterval = () => {
    const freq = localStorage.getItem('vela-position-frequency') ?? 'standard'
    return { battery: 300000, standard: 60000, live: 10000 }[freq] ?? 60000
  }

  const broadcastPosition = async (forceChargingUpdate = false) => {
    if (!activeTrip?.is_published) return
    if (!location || !user) return

    const last = lastLocationRef.current
    const positionUnchanged = last &&
      Math.abs(last.lat - location.lat) < 0.0001 &&
      Math.abs(last.lng - location.lng) < 0.0001

    const chargingChanged = ecoflowCharging !== lastChargingRef.current

    if (positionUnchanged && !chargingChanged && !forceChargingUpdate) return

    lastLocationRef.current = location
    lastChargingRef.current = ecoflowCharging

    const { error } = await supabase
      .from('trip_positions')
      .upsert({
        trip_id:          activeTrip.id,
        user_id:          user.id,
        lat:              location.lat,
        lng:              location.lng,
        accuracy:         location.accuracy,
        ecoflow_soc:      ecoflowSoc,
        ecoflow_charging: ecoflowCharging,
        recorded_at:      new Date().toISOString(),
      }, { onConflict: 'trip_id,user_id' })

    if (error) console.error('Position broadcast error:', error)
  }

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (!activeTrip?.is_published) {
      wasPublishedRef.current = false
      return
    }

    // Reset thresholds whenever broadcast (re)starts so position sends immediately
    if (!wasPublishedRef.current) {
      lastLocationRef.current  = null
      lastChargingRef.current  = undefined
    }
    wasPublishedRef.current = true

    broadcastPosition()
    intervalRef.current = setInterval(broadcastPosition, getUpdateInterval())

    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [activeTrip?.id, activeTrip?.is_published, location])

  // Fire immediately when charging state changes, regardless of position
  useEffect(() => {
    if (!activeTrip?.is_published || !location || !user) return
    if (ecoflowCharging === lastChargingRef.current) return
    broadcastPosition(true)
  }, [ecoflowCharging])
}
