const PENDING_TRIP_SAVES_KEY = 'vela-pending-trip-saves'
const PENDING_TRIP_DELETES_KEY = 'vela-pending-trip-deletes'

export function getPendingTripSaves() {
  const raw = localStorage.getItem(PENDING_TRIP_SAVES_KEY)
  return raw ? JSON.parse(raw) : {}
}

export function addPendingTripSave(trip) {
  const pending = getPendingTripSaves()
  pending[trip.id] = trip
  localStorage.setItem(PENDING_TRIP_SAVES_KEY, JSON.stringify(pending))
}

export function removePendingTripSave(id) {
  const pending = getPendingTripSaves()
  delete pending[id]
  localStorage.setItem(PENDING_TRIP_SAVES_KEY, JSON.stringify(pending))
}

export function clearPendingTripSaves() {
  localStorage.removeItem(PENDING_TRIP_SAVES_KEY)
}

export function getPendingTripDeletes() {
  const raw = localStorage.getItem(PENDING_TRIP_DELETES_KEY)
  return raw ? JSON.parse(raw) : []
}

export function addPendingTripDelete(id) {
  const pending = getPendingTripDeletes()
  if (!pending.includes(id)) {
    pending.push(id)
    localStorage.setItem(PENDING_TRIP_DELETES_KEY, JSON.stringify(pending))
  }
}

export function removePendingTripDelete(id) {
  const pending = getPendingTripDeletes().filter(p => p !== id)
  localStorage.setItem(PENDING_TRIP_DELETES_KEY, JSON.stringify(pending))
}
