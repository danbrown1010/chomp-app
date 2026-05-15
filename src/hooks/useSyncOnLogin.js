import { useEffect } from 'react'
import { getGearItems, getPendingDeletes, removePendingDelete, clearPendingSaves, saveGearItem } from '../utils/gearStorage'
import { getPendingTripSaves, removePendingTripSave, getPendingTripDeletes, removePendingTripDelete } from '../utils/tripStorage'
import { bulkSyncGearToSupabase, deleteGearFromSupabase, syncTripToSupabase, deleteTripFromSupabase, fetchGearFromSupabase } from '../utils/syncManager'
import { getAnthropicKey } from '../utils/secretsManager'

export function useSyncOnLogin(user, setSyncStatus) {
  useEffect(() => {
    if (!user) return
    console.log('Starting sync for user:', user.id)

    const syncAll = async () => {
      setSyncStatus('syncing')
      try {
        const pendingTripDeletes = getPendingTripDeletes()
        if (pendingTripDeletes.length > 0) {
          console.log(`Flushing ${pendingTripDeletes.length} pending trip deletes...`)
          for (const id of pendingTripDeletes) {
            const { error } = await deleteTripFromSupabase(id)
            if (!error) removePendingTripDelete(id)
          }
        }

        const pendingTripSaves = Object.values(getPendingTripSaves())
        if (pendingTripSaves.length > 0) {
          console.log(`Flushing ${pendingTripSaves.length} pending trip saves...`)
          for (const trip of pendingTripSaves) {
            const { error } = await syncTripToSupabase(trip, user.id)
            if (!error) removePendingTripSave(trip.id)
          }
        }

        const pendingDeletes = getPendingDeletes()
        if (pendingDeletes.length > 0) {
          console.log(`Flushing ${pendingDeletes.length} pending deletes...`)
          for (const id of pendingDeletes) {
            const { error } = await deleteGearFromSupabase(id)
            if (!error) removePendingDelete(id)
          }
        }

        const localGear = await getGearItems()
        console.log('Local gear count:', localGear.length)

        if (localGear.length > 0) {
          console.log('Syncing to Supabase...')
          const { error } = await bulkSyncGearToSupabase(localGear, user.id)
          if (!error) {
            clearPendingSaves()
            console.log('Sync complete, pending saves cleared')
          } else {
            console.log('Sync result error:', error)
          }
        } else {
          console.log('No local gear found to sync')
        }

        // Pull ALL gear down from Supabase — ensures fresh sessions (incognito,
        // new device) get the full gear list even with no local IndexedDB cache
        const remoteGear = await fetchGearFromSupabase(user.id)
        if (remoteGear.length > 0) {
          const mapped = remoteGear.map(item => ({
            id: item.id,
            name: item.name,
            category: item.category,
            quantity: item.quantity,
            condition: item.condition,
            notes: item.notes ?? '',
            vendor: item.vendor ?? '',
            purchasedFrom: item.purchased_from ?? '',
            purchaseLink: item.purchase_link ?? '',
            onRig: item.on_rig ?? true,
            includeInChecklist: item.include_in_checklist ?? true,
            updatedAt: item.updated_at,
          }))
          for (const item of mapped) {
            await saveGearItem(item)
          }
          console.log(`Loaded ${mapped.length} gear items from Supabase`)
        }

        await getAnthropicKey(user.id)
        console.log('API key cached from Supabase')

        setSyncStatus('idle')
      } catch (err) {
        console.error('Sync failed:', err)
        setSyncStatus('error')
      }
    }

    syncAll()
  }, [user?.id])
}
