import { useAppStore } from '../store/index'

const GPS_COLORS = {
  locked:      'var(--safe)',
  requesting:  'var(--accent)',
  unavailable: 'var(--accent)',
  denied:      'var(--danger)',
  'ip-based':  'var(--text-tertiary)',
}

const GPS_LABELS = {
  locked:      (loc) => `GPS LOCKED · ±${Math.round(loc?.accuracy ?? 0)}M`,
  requesting:  () => 'GPS ACQUIRING...',
  unavailable: () => 'GPS UNAVAILABLE',
  denied:      () => 'GPS DENIED · CHECK PERMISSIONS',
  'ip-based':  (loc) => `${loc?.city ?? 'LOCATION'} · IP APPROXIMATE`,
}

export function GpsStatus() {
  const { location, gpsStatus } = useAppStore()
  const color = GPS_COLORS[gpsStatus] ?? 'var(--text-tertiary)'
  const label = GPS_LABELS[gpsStatus]?.(location) ?? ''
  const pulsing = gpsStatus !== 'locked'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 6, fontSize: 11, fontFamily: 'var(--font-mono)', color, letterSpacing: '0.06em' }}>
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0, animation: pulsing ? 'pulse 1.5s ease-in-out infinite' : 'none' }} />
      {label}
    </div>
  )
}
