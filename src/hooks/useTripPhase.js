import { useMemo } from 'react'
import { useAppStore } from '../store/index'

function dayOnly(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function diffDays(a, b) {
  return Math.round((b - a) / 86_400_000)
}

export function useTripPhase() {
  const { activeTrip } = useAppStore()

  return useMemo(() => {
    if (!activeTrip) return { phase: 'none', activeTrip: null, daysUntil: null, dayOf: null, daysRemaining: null, totalDays: null }

    const today      = dayOnly(new Date().toISOString().slice(0, 10))
    const departure  = dayOnly(activeTrip.departureDate)
    const returnDate = dayOnly(activeTrip.returnDate)
    const totalDays  = diffDays(departure, returnDate) + 1

    if (today < departure) {
      return { phase: 'pre-trip',  activeTrip, daysUntil: diffDays(today, departure), dayOf: null, daysRemaining: null, totalDays }
    }
    if (today > returnDate) {
      return { phase: 'post-trip', activeTrip, daysUntil: null, dayOf: null, daysRemaining: 0, totalDays }
    }
    return {
      phase: 'on-trip',
      activeTrip,
      daysUntil: null,
      dayOf: diffDays(departure, today) + 1,
      daysRemaining: diffDays(today, returnDate),
      totalDays,
    }
  }, [activeTrip])
}
