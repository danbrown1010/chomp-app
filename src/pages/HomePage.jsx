import { useState } from 'react'
import { useTripPhase } from '../hooks/useTripPhase'
import { useAppStore } from '../store/index'

export default function HomePage({ onPlanTrip }) {
  const tripPhase = useTripPhase()

  if (tripPhase.phase === 'pre-trip')  return <PreTripHome  {...tripPhase} />
  if (tripPhase.phase === 'on-trip')   return <OnTripHome   {...tripPhase} />
  if (tripPhase.phase === 'post-trip') return <PostTripHome {...tripPhase} />
  return <IdleHome onPlanTrip={onPlanTrip} />
}

// ─── Idle (no active trip) ────────────────────────────────────────────────────

function GpsStatus() {
  const { location, locationError, locationLoading } = useAppStore()
  let dot, text
  if (locationLoading)     { dot = '#6b7280'; text = 'Acquiring GPS' }
  else if (locationError)  { dot = '#ef4444'; text = 'GPS unavailable' }
  else if (location)       { dot = '#22c55e'; text = 'GPS locked' }
  if (!dot) return null
  return (
    <div className="flex items-center gap-1.5 mt-1">
      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: dot }} />
      <span className="text-xs text-[#6b7280]">{text}</span>
    </div>
  )
}

function WeatherCard() {
  const { weather, weatherLoading } = useAppStore()
  if (weatherLoading) {
    return (
      <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-4 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-[#6b7280] animate-pulse" />
        <span className="text-xs text-[#6b7280]">Loading weather…</span>
      </div>
    )
  }
  if (!weather) return null
  return (
    <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-4 flex items-center justify-between">
      <div>
        <div className="text-2xl font-bold text-[#f5f5f5]">
          {weather.temperature}°{weather.temperatureUnit}
        </div>
        <div className="text-xs text-[#6b7280] mt-0.5">{weather.shortForecast}</div>
      </div>
      <div className="text-right">
        <div className="text-[10px] text-[#6b7280] uppercase tracking-wider">Wind</div>
        <div className="text-sm font-medium text-white mt-0.5">
          {weather.windSpeed} {weather.windDirection}
        </div>
      </div>
    </div>
  )
}

function IdleHome({ onPlanTrip }) {
  const { accent } = useAppStore()
  return (
    <div className="relative h-full">
      <div className="flex flex-col min-h-full overflow-y-auto p-4 gap-4" style={{ paddingBottom: 'calc(24px + env(safe-area-inset-bottom))' }}>
        <div className="pt-2">
          <h1 className="text-2xl font-bold tracking-tight">Good morning, Dan</h1>
          <p className="text-sm text-[#6b7280] mt-0.5">No active trip</p>
          <GpsStatus />
        </div>

        <WeatherCard />

        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Days out (YTD)" value="47" />
          <StatCard label="Miles logged"   value="1,240" />
          <StatCard label="Trail reports"  value="12" />
          <StatCard label="Trips total"    value="8" />
        </div>

        <button
          onClick={onPlanTrip}
          className="w-full text-white text-sm font-semibold rounded-xl py-3.5 active:opacity-80 transition-opacity"
          style={{ background: accent }}
        >
          Plan a trip
        </button>

        <Section title="Recent trips">
          <TripRow name="Winthrop Loop"         detail="Apr 28 · 3 days · 284 mi" />
          <TripRow name="Teanaway Country"       detail="Apr 12 · 2 days · 190 mi" />
          <TripRow name="Sun Lakes – Dry Falls"  detail="Mar 1 · 4 days · 410 mi" />
        </Section>
      </div>

      {/* FAB */}
      <button
        onClick={onPlanTrip}
        className="absolute bottom-4 right-4 w-14 h-14 rounded-full flex items-center justify-center active:opacity-80 transition-opacity"
        style={{ background: accent, boxShadow: `0 4px 20px ${accent}73` }}
      >
        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none">
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}

// ─── Pre-trip ─────────────────────────────────────────────────────────────────

const PRE_TRIP_CHECKLIST = [
  'Recovery gear packed',
  'Water tanks filled',
  'Fridge loaded + powered',
  'Camera kits charged',
  'Offline maps downloaded',
  'Trip plan shared with contact',
]

function PreTripHome({ activeTrip, daysUntil }) {
  const { accent, weather } = useAppStore()
  const [checked, setChecked] = useState([])

  const toggle = (item) =>
    setChecked((prev) => prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item])

  const pct = Math.round((checked.length / PRE_TRIP_CHECKLIST.length) * 100)

  return (
    <div className="flex flex-col min-h-full overflow-y-auto p-4 gap-4" style={{ paddingBottom: 'calc(24px + env(safe-area-inset-bottom))' }}>
      <div className="pt-2">
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: accent }}>
          Departing in {daysUntil} {daysUntil === 1 ? 'day' : 'days'}
        </p>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: accent }}>{activeTrip.name}</h1>
        <p className="text-sm text-[#6b7280] mt-0.5">
          {fmt(activeTrip.departureDate)} → {fmt(activeTrip.returnDate)}
        </p>
        <GpsStatus />
      </div>

      {/* Packing readiness */}
      <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-white">Packing readiness</p>
          <span className="text-sm font-bold" style={{ color: pct === 100 ? '#22c55e' : accent }}>{pct}%</span>
        </div>
        <div className="h-1.5 bg-[#2a2a2a] rounded-full mb-4 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${pct}%`, background: pct === 100 ? '#22c55e' : accent }}
          />
        </div>
        <div className="flex flex-col gap-3">
          {PRE_TRIP_CHECKLIST.map((item) => (
            <CheckItem
              key={item}
              label={item}
              checked={checked.includes(item)}
              onToggle={() => toggle(item)}
              accent={accent}
            />
          ))}
        </div>
      </div>

      {/* Pre-trip intel */}
      <Section title="Pre-trip intel">
        <IntelRow
          label="Weather"
          value={weather ? `${weather.shortForecast}, ${weather.temperature}°${weather.temperatureUnit}` : 'Loading…'}
          color="neutral"
        />
        <IntelRow label="Road status" value="FS-9712 open"        color="green" />
        <IntelRow label="Burn ban"    value="No restriction"      color="green" />
        <IntelRow label="Campsite"    value="Site 14 · confirmed" color="green" />
      </Section>
    </div>
  )
}

// ─── On-trip ──────────────────────────────────────────────────────────────────

function OnTripHome({ activeTrip, dayOf, daysRemaining, totalDays }) {
  const { accent } = useAppStore()
  return (
    <div className="flex flex-col min-h-full overflow-y-auto p-4 gap-4" style={{ paddingBottom: 'calc(24px + env(safe-area-inset-bottom))' }}>
      <div className="pt-2 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{activeTrip.name}</h1>
          <p className="text-sm text-[#6b7280] mt-0.5">{daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining</p>
        <GpsStatus />
        </div>
        <span
          className="mt-1 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap"
          style={{ background: `${accent}26`, color: accent }}
        >
          Day {dayOf} of {totalDays}
        </span>
      </div>

      {/* Live stats */}
      <div className="grid grid-cols-3 gap-2">
        <LiveStat label="EcoFlow" value="87%" unit="" ok />
        <LiveStat label="Fridge"  value="36°F" ok />
        <LiveStat label="Signal"  value="LTE" ok />
      </div>

      {/* Next waypoint */}
      <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-4">
        <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-2">Next waypoint</p>
        <p className="text-white font-semibold">Esmeralda Basin TH</p>
        <p className="text-xs text-[#6b7280] mt-0.5">47.4521° N · 120.8830° W · 4,200 ft</p>
        <div className="flex gap-2 mt-3">
          <button
            className="flex-1 text-white text-xs font-semibold rounded-lg py-2 active:opacity-80 transition-opacity"
            style={{ background: accent }}
          >
            Navigate
          </button>
          <button className="flex-1 bg-[#1c1c1c] text-white text-xs font-semibold rounded-lg py-2 border border-[#2a2a2a] active:bg-[#2a2a2a] transition-colors">
            Details
          </button>
        </div>
      </div>

      {/* Quick log */}
      <Section title="Quick log">
        <ActionRow label="Log shot"    sub="Tag rig, subject + GPS" accent={accent} />
        <ActionRow label="Check in"    sub="Update live location" />
        <ActionRow label="Log fuel"    sub="Track range + cost" />
        <ActionRow label="Add note"    sub="Trail conditions, camp notes" />
      </Section>
    </div>
  )
}

// ─── Post-trip ────────────────────────────────────────────────────────────────

const POST_TRIP_TASKS = [
  'Sync media to NAS (Lightroom)',
  'Submit trail report',
  'Log trip mileage',
  'Clear SD cards',
  'Recharge all batteries',
  'Restock consumables',
]

function PostTripHome({ activeTrip, totalDays }) {
  const [checked, setChecked] = useState([])
  const { accent } = useAppStore()

  const toggle = (item) =>
    setChecked((prev) => prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item])

  const done = checked.length === POST_TRIP_TASKS.length

  return (
    <div className="flex flex-col min-h-full overflow-y-auto p-4 gap-4" style={{ paddingBottom: 'calc(24px + env(safe-area-inset-bottom))' }}>
      <div className="pt-2">
        <p className="text-xs font-semibold text-violet-400 uppercase tracking-widest mb-1">Trip complete</p>
        <h1 className="text-2xl font-bold tracking-tight text-violet-300">{activeTrip.name}</h1>
        <p className="text-sm text-[#6b7280] mt-0.5">
          {fmt(activeTrip.departureDate)} → {fmt(activeTrip.returnDate)}
        </p>
      </div>

      {/* Trip stats */}
      <div className="grid grid-cols-3 gap-2">
        <StatCard label="Days"  value={String(totalDays)} />
        <StatCard label="Miles" value="218" valueColor={accent} />
        <StatCard label="Shots" value="340" valueColor="#a78bfa" />
      </div>

      {/* Highlight reel CTA */}
      <button className="w-full bg-violet-600 text-white text-sm font-semibold rounded-xl py-3.5 active:bg-violet-700 transition-colors">
        Build highlight reel →
      </button>

      {/* Post-trip checklist */}
      <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-white">Post-trip tasks</p>
          {done && <span className="text-xs text-green-400 font-semibold">All done</span>}
        </div>
        <div className="flex flex-col gap-3">
          {POST_TRIP_TASKS.map((item) => (
            <CheckItem
              key={item}
              label={item}
              checked={checked.includes(item)}
              onToggle={() => toggle(item)}
              accent={accent}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Shared primitives ────────────────────────────────────────────────────────

function StatCard({ label, value, valueColor }) {
  return (
    <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-4">
      <div className="text-2xl font-bold text-[#f5f5f5]" style={valueColor ? { color: valueColor } : {}}>{value}</div>
      <div className="text-xs text-[#6b7280] mt-0.5">{label}</div>
    </div>
  )
}

function LiveStat({ label, value, ok = false }) {
  return (
    <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-3 flex flex-col items-center justify-center min-h-[64px]">
      <div className={`text-lg font-bold ${ok ? 'text-white' : 'text-red-400'}`}>{value}</div>
      <div className="text-[10px] text-[#6b7280] mt-0.5">{label}</div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div>
      <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-2">{title}</p>
      <div className="bg-[#111] border border-[#2a2a2a] rounded-xl overflow-hidden divide-y divide-[#2a2a2a]">
        {children}
      </div>
    </div>
  )
}

function ActionRow({ label, sub, accent = null }) {
  return (
    <button
      className="w-full flex items-center justify-between px-4 py-3 text-left active:bg-[#1c1c1c] transition-colors"
      style={accent ? { borderLeft: `2px solid ${accent}` } : {}}
    >
      <div>
        <div className="text-sm font-medium" style={{ color: accent || undefined }}>{label}</div>
        <div className="text-xs text-[#6b7280]">{sub}</div>
      </div>
      <svg className="w-4 h-4 text-[#6b7280] shrink-0" viewBox="0 0 24 24" fill="none">
        <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}

function TripRow({ name, detail }) {
  return (
    <button className="w-full flex items-center justify-between px-4 py-3 text-left active:bg-[#1c1c1c] transition-colors">
      <div>
        <div className="text-sm font-medium text-white">{name}</div>
        <div className="text-xs text-[#6b7280]">{detail}</div>
      </div>
      <svg className="w-4 h-4 text-[#6b7280] shrink-0" viewBox="0 0 24 24" fill="none">
        <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}

const INTEL_COLORS = {
  neutral: '#f5f5f5',
  green:   '#22c55e',
  amber:   '#f59e0b',
  red:     '#ef4444',
}

function IntelRow({ label, value, color = 'neutral' }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-sm text-[#9ca3af]">{label}</span>
      <span className="text-sm font-semibold" style={{ color: INTEL_COLORS[color] }}>{value}</span>
    </div>
  )
}

function CheckItem({ label, checked, onToggle, accent }) {
  return (
    <button
      className="flex items-center gap-3 text-left w-full"
      onClick={onToggle}
    >
      <div
        className="w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors"
        style={{
          borderColor: checked ? accent : '#3a3a3a',
          background:  checked ? accent : 'transparent',
        }}
      >
        {checked && (
          <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
            <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span className={`text-sm transition-colors ${checked ? 'text-[#6b7280] line-through' : 'text-white'}`}>
        {label}
      </span>
    </button>
  )
}

function fmt(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
