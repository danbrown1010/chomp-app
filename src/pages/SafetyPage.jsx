import { useState, useRef, useCallback, useMemo } from 'react'
import Map, { Source, Layer, Marker } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import distance from '@turf/distance'
import { point } from '@turf/helpers'
import { useFireData } from '../hooks/useFireData'
import { useFireWeather } from '../hooks/useWeather'
import { useAppStore } from '../store/index'

// Static conditions — real APIs to be added later
const SEED = {
  evac:       { yourZone: 'No order', advisory: 2, warning: 1, order: 0 },
  conditions: {
    burnBan:     { county: 'Chelan Co.', status: 'Active' },
    aqi:         { value: 84, label: 'Moderate' },
    privateLand: '2.4mi clear',
    escapeRoute: 'FR 5900 → Hwy 97',
  },
}

function getFireCoord(feature) {
  const geom = feature.geometry
  if (!geom) return null
  if (geom.type === 'Polygon')      return geom.coordinates[0]?.[0]
  if (geom.type === 'MultiPolygon') return geom.coordinates[0]?.[0]?.[0]
  return null
}

export default function SafetyPage() {
  const { location, aqi } = useAppStore()
  const { fires, loading: fireLoading, error: fireError, lastUpdated } = useFireData()
  const { alerts } = useFireWeather(location?.lat, location?.lng)

  const hasRedFlag   = alerts.some(a => a.properties.event === 'Red Flag Warning')
  const hasFireWatch = alerts.some(a => a.properties.event === 'Fire Weather Watch')
  const redFlagAlert = alerts.find(a => a.properties.event === 'Red Flag Warning')

  const nearbyFires = useMemo(() => {
    if (!fires?.features?.length) return []
    const userLng = location?.lng ?? -120.8830
    const userLat = location?.lat ?? 47.4521
    const userPt = point([userLng, userLat])

    return fires.features
      .map(f => {
        const coord = getFireCoord(f)
        if (!coord) return null
        const distMi = distance(userPt, point(coord), { units: 'miles' })
        return {
          name:       f.properties?.IncidentName ?? 'Unknown Fire',
          acres:      Math.round(f.properties?.GISAcres ?? 0),
          distanceMi: Math.round(distMi),
        }
      })
      .filter(f => f && f.distanceMi <= 100)
      .sort((a, b) => a.distanceMi - b.distanceMi)
  }, [fires, location])

  const nearest = nearbyFires[0] ?? null
  const updatedStr = lastUpdated
    ? lastUpdated.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    : null

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <FireStatus nearest={nearest} loading={fireLoading} error={fireError} updatedStr={updatedStr} />
        {hasRedFlag && (
          <div
            className="mx-4 mt-3 rounded-r-lg px-3 py-2"
            style={{ borderLeft: '3px solid #f97316', background: 'rgba(249,115,22,0.1)' }}
          >
            <p className="text-sm font-semibold" style={{ color: '#f97316' }}>Red Flag Warning</p>
            <p className="text-xs text-[#9ca3af] mt-0.5 leading-snug">
              {redFlagAlert?.properties?.headline ?? 'Fire weather conditions in effect'}
            </p>
          </div>
        )}
        <div className="p-4 flex flex-col gap-4 pb-6">
          <EvacZones     {...SEED.evac} />
          <Conditions
            burnBan={SEED.conditions.burnBan}
            aqi={aqi}
            hasRedFlag={hasRedFlag}
            hasFireWatch={hasFireWatch}
            privateLand={SEED.conditions.privateLand}
            escapeRoute={SEED.conditions.escapeRoute}
          />
          <FireMap location={location} fires={fires} lastUpdated={lastUpdated} />
        </div>
      </div>
      {/* SOS — pinned above nav */}
      <div className="px-4 py-3 bg-[#0a0a0a] border-t border-[#1a1a1a]">
        <SOSButton />
      </div>
    </div>
  )
}

// ─── Fire status strip ────────────────────────────────────────────────────────

function FireStatus({ nearest, loading, error, updatedStr }) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#2a2a2a]">
        <div className="w-2 h-2 rounded-full bg-[#6b7280] animate-pulse" />
        <span className="text-sm text-[#6b7280]">Loading fire data…</span>
      </div>
    )
  }

  if (nearest) {
    return (
      <div
        className="flex items-start justify-between px-4 py-3 border-l-4 border-l-[#dc2626]"
        style={{ background: 'rgba(220,38,38,0.07)' }}
      >
        <div className="flex items-start gap-2">
          <div className="relative mt-1.5 shrink-0">
            <span className="block w-2 h-2 rounded-full bg-red-500" />
            <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75" />
          </div>
          <div>
            <p className="text-sm font-semibold text-red-300">
              {nearest.name} · {nearest.distanceMi}mi away
            </p>
            <p className="text-xs text-red-400 mt-0.5 opacity-70">
              {nearest.acres.toLocaleString()} acres
              {updatedStr ? ` · Updated ${updatedStr}` : ''}
            </p>
          </div>
        </div>
        <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
          />
        </svg>
      </div>
    )
  }

  return (
    <div
      className="flex items-center gap-2 px-4 py-3 border-l-4 border-l-green-500"
      style={{ background: 'rgba(34,197,94,0.06)' }}
    >
      <div className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
      <div>
        <p className="text-sm font-semibold text-green-400">No active fires nearby</p>
        {updatedStr && (
          <p className="text-xs text-[#6b7280] mt-0.5">
            {error ? 'Using cached data' : 'NIFC live data'} · Updated {updatedStr}
          </p>
        )}
      </div>
    </div>
  )
}

// ─── Evacuation zones ─────────────────────────────────────────────────────────

const EVAC_STYLES = {
  green:  { bg: 'rgba(34,197,94,0.10)',  border: 'rgba(34,197,94,0.22)',  text: '#4ade80' },
  yellow: { bg: 'rgba(234,179,8,0.10)',  border: 'rgba(234,179,8,0.22)',  text: '#fde047' },
  amber:  { bg: 'rgba(249,115,22,0.10)', border: 'rgba(249,115,22,0.22)', text: '#fb923c' },
  red:    { bg: 'rgba(220,38,38,0.10)',  border: 'rgba(220,38,38,0.22)',  text: '#f87171' },
}

function EvacZones({ yourZone, advisory, warning, order }) {
  return (
    <div>
      <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-2">Evacuation zones</p>
      <div className="grid grid-cols-4 gap-2">
        <EvacChip label="Your zone" value={yourZone}            variant="green" />
        <EvacChip label="Advisory"  value={`${advisory} zones`} variant="yellow" />
        <EvacChip label="Warning"   value={`${warning} zone`}   variant="amber" />
        <EvacChip label="Order"     value={`${order} zones`}    variant="red"   dim={order === 0} />
      </div>
    </div>
  )
}

function EvacChip({ label, value, variant, dim = false }) {
  const { bg, border, text } = EVAC_STYLES[variant]
  return (
    <div className="rounded-lg px-2 py-1.5 flex flex-col gap-1" style={{ background: bg, border: `1px solid ${border}` }}>
      <span className="text-[8px] font-semibold text-[#6b7280] uppercase tracking-widest leading-none">{label}</span>
      <span className="text-sm font-bold leading-none" style={{ color: dim ? '#374151' : text }}>{value}</span>
    </div>
  )
}

// ─── Conditions ───────────────────────────────────────────────────────────────

const BADGE_STYLES = {
  green: { bg: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.25)',  text: '#4ade80' },
  amber: { bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.25)', text: '#fbbf24' },
  red:   { bg: 'rgba(248,113,113,0.12)',border: 'rgba(248,113,113,0.25)',text: '#f87171' },
}

function Badge({ text, variant }) {
  const { bg, border, text: color } = BADGE_STYLES[variant]
  return (
    <span className="text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap" style={{ background: bg, border: `1px solid ${border}`, color }}>
      {text}
    </span>
  )
}

function Conditions({ burnBan, aqi, hasRedFlag, hasFireWatch, privateLand, escapeRoute }) {
  const fireWeatherColor = hasRedFlag ? '#ef4444' : hasFireWatch ? '#f97316' : '#22c55e'
  const fireWeatherText  = hasRedFlag ? 'Red Flag Warning active' : hasFireWatch ? 'Fire Weather Watch active' : 'No fire weather alerts'

  return (
    <div>
      <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-2">Conditions</p>
      <div className="bg-[#111] border border-[#2a2a2a] rounded-xl overflow-hidden divide-y divide-[#2a2a2a]">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm text-[#9ca3af]">Fire weather</span>
          <span className="text-sm font-medium" style={{ color: fireWeatherColor }}>{fireWeatherText}</span>
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm text-[#9ca3af]">AQI</span>
          {aqi ? (
            <span className="text-sm font-semibold" style={{ color: aqi.color }}>
              {aqi.aqi} · {aqi.category}
            </span>
          ) : (
            <span className="text-sm text-[#6b7280]">Fetching AQI…</span>
          )}
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm text-[#9ca3af]">Private land</span>
          <Badge text={privateLand} variant="green" />
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm text-[#9ca3af]">Escape route</span>
          <span className="text-sm font-medium text-white">{escapeRoute}</span>
        </div>
      </div>
    </div>
  )
}

// ─── Fire map placeholder ─────────────────────────────────────────────────────

function FireMap({ location, fires, lastUpdated }) {
  const updatedStr = lastUpdated
    ? lastUpdated.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    : null

  return (
    <div>
      <div style={{ height: 200, borderRadius: 12, overflow: 'hidden' }}>
        <Map
          mapStyle="https://tiles.openfreemap.org/styles/liberty"
          initialViewState={{
            longitude: location?.lng ?? -120.8830,
            latitude:  location?.lat ?? 47.4521,
            zoom: 8,
          }}
          interactive={false}
          attributionControl={false}
        >
          {location && (
            <Marker longitude={location.lng} latitude={location.lat} anchor="center">
              <div style={{ position: 'relative', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ position: 'absolute', width: 32, height: 32, borderRadius: '50%', background: 'rgba(249,115,22,0.2)', animation: 'gps-pulse 2s ease-out infinite' }} />
                <div style={{ position: 'absolute', width: 20, height: 20, borderRadius: '50%', background: 'rgba(249,115,22,0.3)', animation: 'gps-pulse 2s ease-out infinite', animationDelay: '0.5s' }} />
                <div style={{ position: 'relative', width: 12, height: 12, borderRadius: '50%', background: '#f97316', border: '2.5px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.3)', zIndex: 1 }} />
              </div>
            </Marker>
          )}

          {fires && (
            <Source id="fires-safety" type="geojson" data={fires}>
              <Layer
                id="fire-fill-safety"
                type="fill"
                paint={{ 'fill-color': '#ef4444', 'fill-opacity': 0.2 }}
              />
              <Layer
                id="fire-outline-safety"
                type="line"
                paint={{ 'line-color': '#dc2626', 'line-width': 1.5 }}
              />
            </Source>
          )}
        </Map>
      </div>
      <p className="text-[10px] text-[#4b5563] mt-1.5">
        Fire perimeter data · NIFC{updatedStr ? ` · Updated ${updatedStr}` : ''}
      </p>
    </div>
  )
}

// ─── SOS button ───────────────────────────────────────────────────────────────

const HOLD_MS   = 3000
const RING_CIRC = 100

function SOSButton() {
  const [progress,  setProgress]  = useState(0)
  const [showModal, setShowModal] = useState(false)
  const rafRef   = useRef(null)
  const startRef = useRef(null)

  const startHold = useCallback((e) => {
    if (showModal) return
    e.preventDefault()
    startRef.current = Date.now()
    const tick = () => {
      const pct = Math.min(((Date.now() - startRef.current) / HOLD_MS) * 100, 100)
      setProgress(pct)
      if (pct < 100) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        setShowModal(true)
      }
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [showModal])

  const cancelHold = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    setProgress(0)
  }, [])

  const handleConfirm = () => { console.log('SOS SENT'); setShowModal(false); setProgress(0) }
  const handleCancel  = () => { setShowModal(false); setProgress(0) }

  const ringOffset = RING_CIRC - (progress / 100) * RING_CIRC

  return (
    <>
      <button
        className="w-full rounded-xl py-4 flex items-center justify-center gap-3 select-none active:brightness-90 transition-[filter]"
        style={{ background: '#dc2626', WebkitUserSelect: 'none' }}
        onPointerDown={startHold}
        onPointerUp={cancelHold}
        onPointerLeave={cancelHold}
        onPointerCancel={cancelHold}
      >
        <div className="relative w-7 h-7 shrink-0 transition-opacity duration-150" style={{ opacity: progress > 0 ? 1 : 0 }}>
          <svg className="-rotate-90 w-full h-full" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="3" />
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"
              strokeDasharray={RING_CIRC} strokeDashoffset={ringOffset} />
          </svg>
        </div>
        <span className="text-white font-bold text-sm tracking-wide">SOS — Hold 3 seconds to broadcast</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6" style={{ background: 'rgba(0,0,0,0.8)' }}>
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-start gap-3 mb-5">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(220,38,38,0.15)' }}>
                <svg className="w-5 h-5 text-red-400" viewBox="0 0 24 24" fill="none">
                  <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                    stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <p className="text-white font-bold text-base">Broadcast SOS?</p>
                <p className="text-xs text-[#6b7280] mt-1 leading-relaxed">This will alert emergency services to your GPS location.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-[#9ca3af] border border-[#2a2a2a] active:bg-[#2a2a2a] transition-colors" onClick={handleCancel}>
                Cancel
              </button>
              <button className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white active:brightness-90 transition-[filter]" style={{ background: '#dc2626' }} onClick={handleConfirm}>
                Confirm Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
