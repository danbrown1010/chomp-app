import { useState, useRef, useCallback } from 'react'

// ─── Seed data ────────────────────────────────────────────────────────────────
const SEED = {
  hasActiveAlert: true,
  alert:  { name: 'Bolt Creek Fire', distanceMi: 23, direction: 'NE', updatedMin: 8 },
  evac:   { yourZone: 'No order', advisory: 2, warning: 1, order: 0 },
  conditions: {
    burnBan:     { county: 'Chelan Co.', status: 'Active' },
    aqi:         { value: 84, label: 'Moderate' },
    privateLand: '2.4mi clear',
    escapeRoute: 'FR 5900 → Hwy 97',
  },
}

export default function SafetyPage() {
  return (
    <div className="flex flex-col h-full">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {SEED.hasActiveAlert && <AlertStrip {...SEED.alert} />}
        <div className="p-4 flex flex-col gap-4 pb-2">
          <EvacZones     {...SEED.evac} />
          <Conditions    {...SEED.conditions} />
          <FireMapPlaceholder />
        </div>
      </div>
      {/* SOS — pinned above nav */}
      <div className="px-4 py-3 bg-[#0a0a0a] border-t border-[#1a1a1a]">
        <SOSButton />
      </div>
    </div>
  )
}

// ─── Alert strip ──────────────────────────────────────────────────────────────

function AlertStrip({ name, distanceMi, direction, updatedMin }) {
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
            {name} · {distanceMi}mi {direction}
          </p>
          <p className="text-xs text-red-400 mt-0.5 opacity-60">Updated {updatedMin}min ago</p>
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
        <EvacChip label="Order"     value={`${order} zones`}    variant="red" dim={order === 0} />
      </div>
    </div>
  )
}

function EvacChip({ label, value, variant, dim = false }) {
  const { bg, border, text } = EVAC_STYLES[variant]
  return (
    <div
      className="rounded-lg px-2 py-1.5 flex flex-col gap-1"
      style={{ background: bg, border: `1px solid ${border}` }}
    >
      <span className="text-[8px] font-semibold text-[#6b7280] uppercase tracking-widest leading-none">
        {label}
      </span>
      <span className="text-sm font-bold leading-none" style={{ color: dim ? '#374151' : text }}>
        {value}
      </span>
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
    <span
      className="text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
      style={{ background: bg, border: `1px solid ${border}`, color }}
    >
      {text}
    </span>
  )
}

function Conditions({ burnBan, aqi, privateLand, escapeRoute }) {
  const aqiColor = aqi.value < 50 ? '#4ade80' : aqi.value <= 100 ? '#fbbf24' : '#f87171'

  return (
    <div>
      <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-2">Conditions</p>
      <div className="bg-[#111] border border-[#2a2a2a] rounded-xl overflow-hidden divide-y divide-[#2a2a2a]">

        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm text-[#9ca3af]">Burn ban</span>
          <Badge
            text={`${burnBan.county} · ${burnBan.status}`}
            variant={burnBan.status === 'Active' ? 'amber' : 'green'}
          />
        </div>

        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm text-[#9ca3af]">AQI</span>
          <span className="text-sm font-semibold" style={{ color: aqiColor }}>
            {aqi.value} · {aqi.label}
          </span>
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

function FireMapPlaceholder() {
  return (
    <div className="bg-[#111] border border-[#2a2a2a] rounded-xl flex flex-col items-center justify-center gap-1.5" style={{ height: 160 }}>
      <p className="text-sm font-semibold text-[#4b5563]">Fire perimeter map</p>
      <p className="text-xs text-[#2a2a2a]">MapLibre overlay — Phase 4</p>
    </div>
  )
}

// ─── SOS button ───────────────────────────────────────────────────────────────

const HOLD_MS   = 3000
const RING_CIRC = 100  // r=15.9 → circumference ≈ 100, convenient for progress math

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

  const handleConfirm = () => {
    console.log('SOS SENT')
    setShowModal(false)
    setProgress(0)
  }

  const handleCancel = () => {
    setShowModal(false)
    setProgress(0)
  }

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
        {/* Ring — fades in when holding */}
        <div
          className="relative w-7 h-7 shrink-0 transition-opacity duration-150"
          style={{ opacity: progress > 0 ? 1 : 0 }}
        >
          <svg className="-rotate-90 w-full h-full" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="3" />
            <circle
              cx="18" cy="18" r="15.9"
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={RING_CIRC}
              strokeDashoffset={ringOffset}
            />
          </svg>
        </div>
        <span className="text-white font-bold text-sm tracking-wide">
          SOS — Hold 3 seconds to broadcast
        </span>
      </button>

      {/* Confirmation modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-6"
          style={{ background: 'rgba(0,0,0,0.8)' }}
        >
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-start gap-3 mb-5">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(220,38,38,0.15)' }}>
                <svg className="w-5 h-5 text-red-400" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                    stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <p className="text-white font-bold text-base">Broadcast SOS?</p>
                <p className="text-xs text-[#6b7280] mt-1 leading-relaxed">
                  This will alert emergency services to your GPS location.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-[#9ca3af] border border-[#2a2a2a] active:bg-[#2a2a2a] transition-colors"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white active:brightness-90 transition-[filter]"
                style={{ background: '#dc2626' }}
                onClick={handleConfirm}
              >
                Confirm Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
