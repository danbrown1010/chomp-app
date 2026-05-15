import { useState, useRef, useCallback, useEffect } from 'react'
import { useTripPhase } from '../hooks/useTripPhase'
import { useAppStore } from '../store/index'
import { getGearItems } from '../utils/gearStorage'
import { Skeleton } from '../components/Skeleton'
import { VelaLogo } from '../components/VelaLogo'
import { StatusBadge } from '../components/StatusBadge'
import { getFirstName } from '../utils/userHelpers'
import { TypeBadge } from '../components/TripTypeIcons'
import { IconSun, IconCloud, IconCloudSun, IconCloudRain, IconCloudSnow, IconWind } from '../components/icons'

export default function HomePage({ onPlanTrip, onEditTrip }) {
  const tripPhase = useTripPhase()
  if (tripPhase.phase === 'pre-trip')  return <PreTripHome  {...tripPhase} onEditTrip={onEditTrip} />
  if (tripPhase.phase === 'on-trip')   return <OnTripHome   {...tripPhase} onEditTrip={onEditTrip} />
  if (tripPhase.phase === 'post-trip') return <PostTripHome {...tripPhase} onEditTrip={onEditTrip} />
  return <IdleHome onPlanTrip={onPlanTrip} onEditTrip={onEditTrip} />
}

// ─── Pull-to-refresh ──────────────────────────────────────────────────────────

function usePullToRefresh(onRefresh) {
  const [pullY, setPullY] = useState(0)
  const startYRef = useRef(0)
  const activeRef = useRef(false)
  const pullYRef  = useRef(0)
  const scrollRef = useRef(null)
  const THRESHOLD = 64

  const onTouchStart = useCallback((e) => {
    if ((scrollRef.current?.scrollTop ?? 0) === 0) {
      startYRef.current = e.touches[0].clientY
      activeRef.current = true
    }
  }, [])

  const onTouchMove = useCallback((e) => {
    if (!activeRef.current) return
    const dy = e.touches[0].clientY - startYRef.current
    if (dy > 0 && (scrollRef.current?.scrollTop ?? 0) === 0) {
      const y = Math.min(dy * 0.5, THRESHOLD)
      pullYRef.current = y
      setPullY(y)
    } else if (dy <= 0) {
      activeRef.current = false
      pullYRef.current = 0
      setPullY(0)
    }
  }, [])

  const onTouchEnd = useCallback(() => {
    if (!activeRef.current) return
    activeRef.current = false
    const reached = pullYRef.current >= THRESHOLD
    pullYRef.current = 0
    setPullY(0)
    if (reached) onRefresh()
  }, [onRefresh])

  return { scrollRef, pullY, onTouchStart, onTouchMove, onTouchEnd }
}

// ─── Weather icon picker ──────────────────────────────────────────────────────

function WeatherIcon({ description, size = 40, color = 'var(--accent)' }) {
  const desc = (description ?? '').toLowerCase()
  const props = { style: { width: size, height: size, color, flexShrink: 0 } }
  if (desc.includes('thunder'))                                         return <IconCloudRain {...props} />
  if (desc.includes('snow') || desc.includes('sleet') || desc.includes('flurr')) return <IconCloudSnow {...props} />
  if (desc.includes('rain') || desc.includes('shower') || desc.includes('drizzle')) return <IconCloudRain {...props} />
  if (desc.includes('cloud') || desc.includes('overcast') || desc.includes('fog') || desc.includes('mist'))
    return desc.includes('partly') || desc.includes('mostly') ? <IconCloudSun {...props} /> : <IconCloud {...props} />
  if (desc.includes('wind') || desc.includes('breezy'))                return <IconWind {...props} />
  return <IconSun {...props} />
}

// ─── Weather card ─────────────────────────────────────────────────────────────

function WeatherCard() {
  const { weather, weatherLoading } = useAppStore()
  if (weatherLoading) {
    return (
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Skeleton className="h-8 w-20 rounded" />
          <Skeleton className="h-3 w-36 rounded" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
          <Skeleton className="h-3 w-12 rounded" />
          <Skeleton className="h-4 w-24 rounded" />
        </div>
      </div>
    )
  }
  if (!weather) return null
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
      <WeatherIcon description={weather.shortForecast} size={40} color="var(--accent)" />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-body)', lineHeight: 1 }}>
          {weather.temperature}°{weather.temperatureUnit}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-tertiary)', fontFamily: 'var(--font-body)', marginTop: 3, textTransform: 'capitalize' }}>
          {weather.shortForecast}
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Wind</div>
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', fontFamily: 'var(--font-body)', marginTop: 2 }}>
          {weather.windSpeed} {weather.windDirection}
        </div>
      </div>
    </div>
  )
}

// ─── GPS status ───────────────────────────────────────────────────────────────

function GpsStatus() {
  const { location, locationError, locationLoading } = useAppStore()
  let color, text
  if (locationLoading)    { color = 'var(--text-tertiary)'; text = 'GPS ACQUIRING' }
  else if (locationError) { color = 'var(--danger)';        text = 'GPS UNAVAILABLE' }
  else if (location)      { color = 'var(--safe)';          text = 'GPS LOCKED' }
  if (!color) return null
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4, fontFamily: 'var(--font-mono)', fontSize: 11, color }}>
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
      {text}
    </div>
  )
}

// ─── Idle home ────────────────────────────────────────────────────────────────

function IdleHome({ onPlanTrip, onEditTrip }) {
  const { accent, refreshHomeData, syncStatus, user, profile, trips, activeTrip, setActiveTripById, deactivateTrip, deleteTrip } = useAppStore()
  const firstName = getFirstName(profile, user)
  const { scrollRef, pullY, onTouchStart, onTouchMove, onTouchEnd } = usePullToRefresh(refreshHomeData)

  const now = new Date()

  const upcomingTrips = trips.filter(t =>
    t.status !== 'completed' &&
    t.status !== 'cancelled' &&
    t.id !== activeTrip?.id
  ).sort((a, b) => new Date(a.departureDate) - new Date(b.departureDate))

  const recentTrips = trips.filter(t =>
    t.status === 'completed' ||
    (t.returnDate && new Date(t.returnDate) < now)
  ).sort((a, b) => new Date(b.departureDate) - new Date(a.departureDate)).slice(0, 3)

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      <div
        ref={scrollRef}
        className="overflow-y-auto"
        style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', padding: 16, gap: 16, paddingBottom: 'calc(24px + env(safe-area-inset-bottom))' }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {pullY > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: pullY, opacity: pullY / 64 }}>
            <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid var(--text-tertiary)', borderTopColor: 'transparent', transform: `rotate(${(pullY / 64) * 270}deg)` }} />
          </div>
        )}

        <div style={{ paddingTop: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <VelaLogo size={22} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {syncStatus === 'syncing' && (
                <div style={{ width: 6, height: 6, borderRadius: '50%', border: '1.5px solid var(--text-tertiary)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
              )}
              {syncStatus === 'error' && (
                <div title="Sync error — will retry" style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b' }} />
              )}
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-tertiary)', letterSpacing: '0.06em' }}>
                GO FURTHER!
              </span>
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', margin: 0, lineHeight: 1.1 }}>Ready to roll, {firstName}</h1>
            <GpsStatus />
          </div>
        </div>

        <WeatherCard />

        {activeTrip && (
          <div style={{ background: 'var(--accent)', padding: '12px 16px', borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Active Trip</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#fff', fontFamily: 'var(--font-body)' }}>{activeTrip.name}</div>
            </div>
            <button
              onClick={deactivateTrip}
              style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, padding: '5px 10px', color: '#fff', fontSize: 12, fontFamily: 'var(--font-body)', cursor: 'pointer' }}
            >
              Deactivate
            </button>
          </div>
        )}

        {upcomingTrips.length > 0 && (
          <div>
            <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
              Upcoming
            </div>
            {upcomingTrips.map(trip => (
              <TripCard
                key={trip.id}
                trip={trip}
                isActive={false}
                onSetActive={() => setActiveTripById(trip.id)}
                onDelete={() => deleteTrip(trip.id)}
                onEdit={() => onEditTrip(trip)}
              />
            ))}
          </div>
        )}

        {recentTrips.length > 0 && (
          <div>
            <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
              Recent
            </div>
            {recentTrips.map(trip => (
              <TripCard
                key={trip.id}
                trip={trip}
                isActive={false}
                onSetActive={() => setActiveTripById(trip.id)}
                onDelete={() => deleteTrip(trip.id)}
                onEdit={() => onEditTrip(trip)}
              />
            ))}
          </div>
        )}

        {trips.length === 0 && (
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Days out (YTD)" value="47" />
            <StatCard label="Miles logged"   value="1,240" />
            <StatCard label="Trail reports"  value="12" />
            <StatCard label="Trips total"    value="8" />
          </div>
        )}

        <button
          onClick={onPlanTrip}
          style={{ width: '100%', background: accent, color: '#fff', fontWeight: 700, fontSize: 14, borderRadius: 16, padding: '14px 0', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)' }}
        >
          Plan a trip
        </button>
      </div>

      <button
        onClick={onPlanTrip}
        className="absolute bottom-4 right-4 w-14 h-14 rounded-full flex items-center justify-center active:opacity-80 transition-opacity"
        style={{ background: accent, boxShadow: `0 4px 20px ${accent}73`, border: 'none', cursor: 'pointer' }}
      >
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" style={{ color: '#fff' }}>
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}

// ─── Pre-trip ─────────────────────────────────────────────────────────────────

const PRE_TRIP_CHECKLIST = [
  'Recovery gear packed', 'Water tanks filled', 'Fridge loaded + powered',
  'Camera kits charged', 'Offline maps downloaded', 'Trip plan shared with contact',
]

function PreTripHome({ activeTrip, daysUntil, onEditTrip }) {
  const { accent, weather, aqi, deactivateTrip } = useAppStore()
  const [checked, setChecked] = useState([])
  const [gearChecklist, setGearChecklist] = useState([])
  const [gearChecked, setGearChecked] = useState(new Set())

  useEffect(() => {
    getGearItems().then(items => {
      setGearChecklist(
        items
          .filter(i => i.includeInChecklist)
          .map(i => ({ id: i.id, label: i.quantity > 1 ? `${i.name} (×${i.quantity})` : i.name }))
      )
    })
  }, [])

  const toggle = (item) => setChecked(p => p.includes(item) ? p.filter(x => x !== item) : [...p, item])
  const toggleGear = (id) => setGearChecked(prev => {
    const next = new Set(prev)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })

  const totalItems = PRE_TRIP_CHECKLIST.length + gearChecklist.length
  const totalChecked = checked.length + gearChecked.size
  const pct = totalItems === 0 ? 0 : Math.round((totalChecked / totalItems) * 100)

  return (
    <div className="overflow-y-auto" style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', padding: 16, gap: 16, paddingBottom: 'calc(24px + env(safe-area-inset-bottom))' }}>
      <div style={{ paddingTop: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: accent, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
              Departing in {daysUntil} {daysUntil === 1 ? 'day' : 'days'}
            </p>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: accent, margin: 0 }}>{activeTrip.name}</h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
              {fmt(activeTrip.departureDate)} → {fmt(activeTrip.returnDate)}
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, marginTop: 4 }}>
            <button
              onClick={() => onEditTrip?.(activeTrip)}
              style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, padding: '5px 10px', color: 'var(--text-secondary)', fontSize: 11, fontFamily: 'var(--font-body)', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              Edit
            </button>
            <button
              onClick={deactivateTrip}
              style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, padding: '5px 10px', color: 'var(--text-secondary)', fontSize: 11, fontFamily: 'var(--font-body)', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              Deactivate
            </button>
          </div>
        </div>
        <GpsStatus />
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>Packing readiness</p>
          <span style={{ fontSize: 14, fontWeight: 700, color: pct === 100 ? 'var(--safe)' : accent }}>{pct}%</span>
        </div>
        <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden', marginBottom: 16 }}>
          <div style={{ height: '100%', borderRadius: 3, width: `${pct}%`, background: pct === 100 ? 'var(--safe)' : accent, transition: 'width 0.3s' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {PRE_TRIP_CHECKLIST.map(item => (
            <CheckItem key={item} label={item} checked={checked.includes(item)} onToggle={() => toggle(item)} accent={accent} />
          ))}
          {gearChecklist.length > 0 && (
            <>
              <div style={{ height: 1, background: 'var(--border)', margin: '2px 0' }} />
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>From gear registry</p>
              {gearChecklist.map(item => (
                <CheckItem key={item.id} label={item.label} checked={gearChecked.has(item.id)} onToggle={() => toggleGear(item.id)} accent={accent} />
              ))}
            </>
          )}
        </div>
      </div>

      <Section title="Pre-trip intel">
        <IntelRow label="Weather" value={weather ? `${weather.shortForecast}, ${weather.temperature}°${weather.temperatureUnit}` : 'Loading…'} color="neutral" />
        <IntelRow label="AQI"     value={aqi ? `${aqi.aqi} · ${aqi.category}` : 'Loading…'} color={aqi ? (aqi.aqi < 50 ? 'safe' : aqi.aqi <= 100 ? 'warn' : 'danger') : 'neutral'} />
        <IntelRow label="Road status" value="FS-9712 open"        color="safe" />
        <IntelRow label="Burn ban"    value="No restriction"      color="safe" />
        <IntelRow label="Campsite"    value="Site 14 · confirmed" color="safe" />
      </Section>
    </div>
  )
}

// ─── On-trip ──────────────────────────────────────────────────────────────────

function OnTripHome({ activeTrip, dayOf, daysRemaining, totalDays }) {
  const { accent, deactivateTrip } = useAppStore()
  return (
    <div className="overflow-y-auto" style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', padding: 16, gap: 16, paddingBottom: 'calc(24px + env(safe-area-inset-bottom))' }}>
      <div style={{ paddingTop: 8, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{activeTrip.name}</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining</p>
          <GpsStatus />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
          <span style={{ marginTop: 4, fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, padding: '3px 12px', borderRadius: 20, background: `${accent}26`, color: accent, whiteSpace: 'nowrap' }}>
            DAY {dayOf} / {totalDays}
          </span>
          <button
            onClick={deactivateTrip}
            style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, padding: '4px 10px', color: 'var(--text-secondary)', fontSize: 11, fontFamily: 'var(--font-body)', cursor: 'pointer' }}
          >
            Deactivate
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <LiveStat label="EcoFlow" value="87%" ok />
        <LiveStat label="Fridge"  value="36°F" ok />
        <LiveStat label="Signal"  value="LTE" ok />
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 16 }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Next waypoint</p>
        <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 15 }}>Esmeralda Basin TH</p>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>47.4521° N · 120.8830° W · 4,200 ft</p>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button style={{ flex: 1, background: accent, color: '#fff', fontWeight: 700, fontSize: 12, borderRadius: 12, padding: '8px 0', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Navigate</button>
          <button style={{ flex: 1, background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontWeight: 600, fontSize: 12, borderRadius: 12, padding: '8px 0', border: '1px solid var(--border)', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Details</button>
        </div>
      </div>

      <Section title="Quick log">
        <ActionRow label="Log shot"  sub="Tag rig, subject + GPS" accent={accent} />
        <ActionRow label="Check in"  sub="Update live location" />
        <ActionRow label="Log fuel"  sub="Track range + cost" />
        <ActionRow label="Add note"  sub="Trail conditions, camp notes" />
      </Section>
    </div>
  )
}

// ─── Post-trip ────────────────────────────────────────────────────────────────

const POST_TRIP_TASKS = [
  'Sync media to NAS (Lightroom)', 'Submit trail report', 'Log trip mileage',
  'Clear SD cards', 'Recharge all batteries', 'Restock consumables',
]

function PostTripHome({ activeTrip, totalDays }) {
  const [checked, setChecked] = useState([])
  const { accent, deactivateTrip } = useAppStore()
  const toggle = (item) => setChecked(p => p.includes(item) ? p.filter(x => x !== item) : [...p, item])
  const done = checked.length === POST_TRIP_TASKS.length

  return (
    <div className="overflow-y-auto" style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', padding: 16, gap: 16, paddingBottom: 'calc(24px + env(safe-area-inset-bottom))' }}>
      <div style={{ paddingTop: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Trip complete</p>
          <button
            onClick={deactivateTrip}
            style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, padding: '4px 10px', color: 'var(--text-secondary)', fontSize: 11, fontFamily: 'var(--font-body)', cursor: 'pointer' }}
          >
            Deactivate
          </button>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#c4b5fd', margin: 0 }}>{activeTrip.name}</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
          {fmt(activeTrip.departureDate)} → {fmt(activeTrip.returnDate)}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <StatCard label="Days"  value={String(totalDays)} />
        <StatCard label="Miles" value="218" valueColor={accent} />
        <StatCard label="Shots" value="340" valueColor="#a78bfa" />
      </div>

      <button style={{ width: '100%', background: '#7c3aed', color: '#fff', fontWeight: 700, fontSize: 14, borderRadius: 16, padding: '14px 0', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
        Build highlight reel →
      </button>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>Post-trip tasks</p>
          {done && <span style={{ fontSize: 12, color: 'var(--safe)', fontWeight: 600 }}>All done</span>}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {POST_TRIP_TASKS.map(item => (
            <CheckItem key={item} label={item} checked={checked.includes(item)} onToggle={() => toggle(item)} accent={accent} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Trip card ────────────────────────────────────────────────────────────────

function TripCard({ trip, onSetActive, onDeactivate, onDelete, onEdit, isActive }) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  const daysUntil = trip.departureDate
    ? Math.ceil((new Date(trip.departureDate) - new Date()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <div style={{ background: 'var(--bg-card)', border: isActive ? '1px solid var(--accent)' : '1px solid var(--border)', borderRadius: 12, padding: '12px 14px', marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}>{trip.name}</div>
          {trip.region && (
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)', fontFamily: 'var(--font-body)', marginTop: 1 }}>{trip.region}</div>
          )}
          {trip.types?.length > 0 && (
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 5 }}>
              {trip.types.map(t => <TypeBadge key={t} type={t} />)}
            </div>
          )}
        </div>
        {isActive
          ? <StatusBadge status="safe" label="ACTIVE" />
          : (
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <button
                onClick={onEdit}
                style={{ background: 'transparent', border: 'none', padding: '2px 4px', cursor: 'pointer', color: 'var(--text-tertiary)', lineHeight: 1 }}
                aria-label="Edit trip"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
              <button
                onClick={() => setConfirmDelete(v => !v)}
                style={{ background: 'transparent', border: 'none', padding: '2px 4px', cursor: 'pointer', color: confirmDelete ? 'var(--danger)' : 'var(--text-tertiary)', lineHeight: 1 }}
                aria-label="Delete trip"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14H6L5 6" />
                  <path d="M10 11v6M14 11v6" />
                  <path d="M9 6V4h6v2" />
                </svg>
              </button>
            </div>
          )
        }
      </div>

      {confirmDelete ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>Delete this trip?</span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => setConfirmDelete(false)}
              style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, padding: '4px 10px', color: 'var(--text-secondary)', fontSize: 11, fontFamily: 'var(--font-body)', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              onClick={onDelete}
              style={{ background: 'var(--danger, #ef4444)', border: 'none', borderRadius: 8, padding: '4px 10px', color: '#fff', fontSize: 11, fontWeight: 500, fontFamily: 'var(--font-body)', cursor: 'pointer' }}
            >
              Delete
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
          <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>
            {trip.departureDate
              ? daysUntil > 0
                ? `Departs in ${daysUntil} days · ${new Date(trip.departureDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                : daysUntil === 0
                  ? 'Departing today'
                  : `Departed ${Math.abs(daysUntil)} days ago`
              : 'No date set'}
          </div>
          {isActive ? (
            <button
              onClick={onDeactivate}
              style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, padding: '4px 10px', color: 'var(--text-secondary)', fontSize: 11, fontFamily: 'var(--font-body)', cursor: 'pointer' }}
            >
              Deactivate
            </button>
          ) : (
            <button
              onClick={onSetActive}
              style={{ background: 'var(--accent)', border: 'none', borderRadius: 8, padding: '4px 10px', color: '#fff', fontSize: 11, fontWeight: 500, fontFamily: 'var(--font-body)', cursor: 'pointer' }}
            >
              Set active
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Shared primitives ────────────────────────────────────────────────────────

function StatCard({ label, value, valueColor }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 16 }}>
      <div style={{ fontSize: 24, fontWeight: 700, color: valueColor || 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>{label}</div>
    </div>
  )
}

function LiveStat({ label, value, ok = false }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 64 }}>
      <div style={{ fontSize: 18, fontWeight: 700, color: ok ? 'var(--text-primary)' : '#f87171', fontFamily: 'var(--font-mono)' }}>{value}</div>
      <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 2, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{title}</p>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  )
}

function ActionRow({ label, sub, accent = null }) {
  return (
    <button
      className="w-full flex items-center justify-between px-4 py-3 text-left active:opacity-70 transition-opacity"
      style={accent ? { borderLeft: `2px solid ${accent}` } : {}}
    >
      <div>
        <div style={{ fontSize: 14, fontWeight: 500, color: accent || 'var(--text-primary)' }}>{label}</div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{sub}</div>
      </div>
      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--text-tertiary)' }}>
        <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}

function TripRow({ name, detail }) {
  return (
    <button className="w-full flex items-center justify-between px-4 py-3 text-left active:opacity-70 transition-opacity">
      <div>
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{name}</div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{detail}</div>
      </div>
      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--text-tertiary)' }}>
        <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}

const INTEL_COLORS = { safe: 'var(--safe)', warn: 'var(--warn)', danger: 'var(--danger)' }

function IntelRow({ label, value, color = 'neutral' }) {
  const isNeutral = color === 'neutral'
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 600, color: isNeutral ? 'var(--text-primary)' : INTEL_COLORS[color] }}>{value}</span>
    </div>
  )
}

function CheckItem({ label, checked, onToggle, accent }) {
  return (
    <button className="flex items-center gap-3 text-left w-full" onClick={onToggle}>
      <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${checked ? accent : 'var(--border)'}`, background: checked ? accent : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
        {checked && (
          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" style={{ color: '#fff' }}>
            <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span style={{ fontSize: 14, color: checked ? 'var(--text-tertiary)' : 'var(--text-primary)', textDecoration: checked ? 'line-through' : 'none', transition: 'color 0.15s' }}>
        {label}
      </span>
    </button>
  )
}

function fmt(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
