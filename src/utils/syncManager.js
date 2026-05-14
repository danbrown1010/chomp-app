import { v4 as uuidv4 } from 'uuid'
import { supabase } from '../lib/supabase'

function isValidUUID(str) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)
}

function toUUID(id) {
  return isValidUUID(id) ? id : uuidv4()
}

function gearRow(item, userId) {
  return {
    id: toUUID(item.id),
    user_id: userId,
    name: item.name,
    category: item.category,
    quantity: item.quantity ?? 1,
    condition: item.condition ?? 'good',
    notes: item.notes ?? '',
    vendor: item.vendor ?? '',
    purchased_from: item.purchasedFrom ?? '',
    purchase_link: item.purchaseLink ?? '',
    on_rig: item.onRig ?? false,
    include_in_checklist: item.includeInChecklist ?? false,
    updated_at: new Date().toISOString(),
  }
}

// ─── TRIPS ────────────────────────────────────────────────────────────────────

export async function syncTripToSupabase(trip, userId) {
  const { data, error } = await supabase
    .from('trips')
    .upsert({
      id: toUUID(trip.id),
      user_id: userId,
      name: trip.name,
      type: trip.type,
      region: trip.region,
      departure_date: trip.departureDate,
      return_date: trip.returnDate,
      status: trip.status ?? 'planning',
      waypoints: trip.waypoints ?? [],
      campsites: trip.campsites ?? [],
      data: {
        checklist: trip.checklist ?? [],
        gearLists: trip.gearLists ?? [],
        partners: trip.partners ?? [],
        notes: trip.notes ?? '',
      },
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' })

  if (error) console.error('Trip sync error:', error)
  return { data, error }
}

export async function fetchTripsFromSupabase(userId) {
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) console.error('Trip fetch error:', error)
  return data ?? []
}

export async function deleteTripFromSupabase(tripId) {
  const { error } = await supabase
    .from('trips')
    .delete()
    .eq('id', tripId)

  if (error) console.error('Trip delete error:', error)
}

// ─── GEAR ─────────────────────────────────────────────────────────────────────

export async function syncGearToSupabase(item, userId) {
  const { data, error } = await supabase
    .from('gear_items')
    .upsert(gearRow(item, userId), { onConflict: 'id' })

  if (error) console.error('Gear sync error:', error)
  return { data, error }
}

export async function fetchGearFromSupabase(userId) {
  const { data, error } = await supabase
    .from('gear_items')
    .select('*')
    .eq('user_id', userId)
    .order('category', { ascending: true })

  if (error) console.error('Gear fetch error:', error)
  return data ?? []
}

export async function deleteGearFromSupabase(itemId) {
  const { error } = await supabase
    .from('gear_items')
    .delete()
    .eq('id', itemId)

  if (error) console.error('Gear delete error:', error)
}

export async function bulkSyncGearToSupabase(items, userId) {
  const rows = items.map(item => gearRow(item, userId))

  const { data, error } = await supabase
    .from('gear_items')
    .upsert(rows, { onConflict: 'id' })

  if (error) console.error('Bulk gear sync error:', error)
  return { data, error }
}
