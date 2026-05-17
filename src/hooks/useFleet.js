import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAppStore } from '../store/index'

export function useFleet() {
  const { user, isPro } = useAppStore()
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    let cancelled = false
    const load = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('vehicles')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true })
        if (cancelled) return
        if (error) throw error
        setVehicles(data ?? [])
      } catch (err) {
        if (cancelled) return
        console.error('Fleet load error:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [user?.id])

  const canAddVehicle = () => {
    if (isPro) return true
    return vehicles.length === 0
  }

  const addVehicle = async (vehicleData) => {
    const { data, error } = await supabase
      .from('vehicles')
      .insert({ ...vehicleData, user_id: user.id, is_primary: vehicles.length === 0 })
      .select()
      .single()
    if (error) throw error
    setVehicles(prev => [...prev, data])
    return data
  }

  const updateVehicle = async (id, updates) => {
    const { data, error } = await supabase
      .from('vehicles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()
    if (error) throw error
    setVehicles(prev => prev.map(v => v.id === id ? data : v))
    return data
  }

  const deleteVehicle = async (id) => {
    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    if (error) throw error
    setVehicles(prev => prev.filter(v => v.id !== id))
  }

  return { vehicles, loading, canAddVehicle, addVehicle, updateVehicle, deleteVehicle }
}
