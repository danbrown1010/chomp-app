import { useState, useEffect } from 'react'
import { useAppStore } from '../store/index'
import { useEcoFlow } from '../hooks/useEcoFlow'
import { ECOFLOW_DEVICES } from '../config/devices'
import { useStarlink } from '../hooks/useStarlink'

// ─── Seed data ────────────────────────────────────────────────────────────────

const HAS_ALERT = false

const TEMP_ZONES = [
  { id: 'outside',  label: 'Outside',     value: 54, unit: '°F', color: '#60a5fa' },
  { id: 'cabin',    label: 'Cabin',        value: 68, unit: '°F', color: '#f97316' },
  { id: 'ursa',     label: 'Ursa Minor',   value: 62, unit: '°F', color: null },
  { id: 'fridge',   label: 'Fridge',       value: 38, unit: '°F', color: '#4ade80' },
  { id: 'battery',  label: 'Battery comp', value: 72, unit: '°F', color: null },
  { id: 'water',    label: 'Water tank',   value: 55, unit: '°F', color: null },
]


const HUMIDITY_ZONES = [
  { id: 'cabin', label: 'Cabin',      value: 45 },
  { id: 'ursa',  label: 'Ursa Minor', value: 52 },
]

const INITIAL_LIGHTS = {
  interior: { on: true,  brightness: 80  },
  cabin:    { on: false, brightness: 50  },
  rock:     { on: false, brightness: 100 },
  camp:     { on: true,  brightness: 60  },
  bed:      { on: true,  brightness: 100 },
}

const LIGHT_LABELS = {
  interior: 'Interior',
  cabin:    'Cabin dome',
  rock:     'Rock lights',
  camp:     'Camp flood',
  bed:      'Bed reading',
}

const SCENES = {
  'Arrive at camp': { interior: { on: true, brightness: 100 }, cabin: { on: true, brightness: 80 }, rock: { on: true, brightness: 60 }, camp: { on: true, brightness: 100 }, bed: { on: false } },
  'Cooking':        { interior: { on: true, brightness: 80  }, cabin: { on: true, brightness: 60 }, rock: { on: false },                camp: { on: true, brightness: 100 }, bed: { on: false } },
  'Stargazing':     { interior: { on: false }, cabin: { on: false }, rock: { on: false }, camp: { on: false }, bed: { on: false } },
  'Photography':    { interior: { on: true, brightness: 40  }, cabin: { on: false },               rock: { on: true, brightness: 100 }, camp: { on: true, brightness: 80  }, bed: { on: false } },
  'Wake up':        { interior: { on: true, brightness: 30  }, cabin: { on: true, brightness: 20 }, rock: { on: false },               camp: { on: false },                  bed: { on: true, brightness: 60 } },
  'Depart':         { interior: { on: false }, cabin: { on: false }, rock: { on: false }, camp: { on: false }, bed: { on: false } },
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RigPage() {
  const [lights, setLights] = useState(INITIAL_LIGHTS)

  const toggleLight = (id) =>
    setLights(prev => ({ ...prev, [id]: { ...prev[id], on: !prev[id].on } }))

  const setBrightness = (id, val) =>
    setLights(prev => ({ ...prev, [id]: { ...prev[id], brightness: val } }))

  const applyScene = (sceneName) => {
    const scene = SCENES[sceneName]
    setLights(prev => {
      const next = { ...prev }
      for (const [id, cfg] of Object.entries(scene)) {
        next[id] = {
          on: cfg.on,
          brightness: cfg.on ? cfg.brightness : prev[id].brightness,
        }
      }
      return next
    })
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 flex flex-col gap-5" style={{ paddingBottom: 'calc(24px + env(safe-area-inset-bottom))' }}>
        <RigHeader hasAlert={HAS_ALERT} />
        <EcoflowSection />
        <TempZones />
        <StarlinkSection />
        <HumiditySection />
        <LightingSection lights={lights} onToggle={toggleLight} onBrightness={setBrightness} />
        <ScenesSection onApply={applyScene} />
      </div>
    </div>
  )
}

// ─── Header ───────────────────────────────────────────────────────────────────

function RigHeader({ hasAlert }) {
  return (
    <div className="pt-2 flex items-start justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Chomp</h1>
        <p className="text-sm text-[#6b7280] mt-0.5">2014 Jeep JKU · Ursa Minor</p>
      </div>
      <div className="flex items-center gap-1.5 mt-1">
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{ background: hasAlert ? '#ef4444' : '#22c55e' }}
        />
        <span className="text-xs font-semibold" style={{ color: hasAlert ? '#f87171' : '#4ade80' }}>
          {hasAlert ? '1 alert' : 'All systems OK'}
        </span>
      </div>
    </div>
  )
}

// ─── Temperature ──────────────────────────────────────────────────────────────

function TempZones() {
  return (
    <div>
      <SectionLabel>Temperature</SectionLabel>
      <div className="grid grid-cols-3 gap-2">
        {TEMP_ZONES.map(z => (
          <div key={z.id} className="bg-[#111] border border-[#2a2a2a] rounded-xl px-3 py-3">
            <div className="text-[10px] font-semibold text-[#6b7280] uppercase tracking-widest mb-1 leading-none">
              {z.label}
            </div>
            <div
              className={`text-lg font-bold leading-none${z.color ? '' : ' text-white'}`}
              style={z.color ? { color: z.color } : undefined}
            >
              {z.value}{z.unit}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── EcoFlow ──────────────────────────────────────────────────────────────────

function formatRemainTime(minutes) {
  if (minutes == null || minutes <= 0) return '—'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

function formatLastUpdated(date) {
  if (!date) return null
  const secs = Math.floor((Date.now() - date.getTime()) / 1000)
  if (secs < 15) return 'Updated just now'
  if (secs < 90) return `Updated ${secs}s ago`
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `Updated ${mins}min ago`
  return `Updated ${Math.floor(mins / 60)}h ago`
}

function EcoToast({ message }) {
  return (
    <div
      className="fixed left-0 right-0 flex justify-center z-[60] pointer-events-none"
      style={{ top: 'calc(env(safe-area-inset-top) + 16px)' }}
    >
      <div
        className="px-4 py-2 rounded-full text-sm font-medium text-white"
        style={{ background: 'rgba(28,28,28,0.96)', border: '1px solid #3a3a3a' }}
      >
        {message}
      </div>
    </div>
  )
}

function ChargingIndicator({ netFlow }) {
  const color = netFlow > 0 ? '#22c55e' : netFlow < 0 ? '#ef4444' : '#6b7280'
  const shouldPulse = netFlow !== 0

  return (
    <div style={{ position: 'relative', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      {shouldPulse && (
        <div style={{ position: 'absolute', width: 24, height: 24, borderRadius: '50%', background: color, opacity: 0.2, animation: 'gps-pulse 2s ease-out infinite' }} />
      )}
      {shouldPulse && (
        <div style={{ position: 'absolute', width: 16, height: 16, borderRadius: '50%', background: color, opacity: 0.3, animation: 'gps-pulse 2s ease-out infinite', animationDelay: '0.4s' }} />
      )}
      <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, position: 'relative', zIndex: 1, boxShadow: shouldPulse ? `0 0 6px ${color}` : 'none' }} />
    </div>
  )
}

function PowerFlowCard({ type, data }) {
  const isIn = type === 'in'
  const accentColor = isIn ? '#22c55e' : '#f97316'

  const rows = isIn
    ? [
        {
          label: 'Solar',
          watts: data?.solarWatts ?? 0,
          icon: (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4"/>
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
            </svg>
          ),
        },
        {
          label: 'AC Mains',
          watts: data?.acInputWatts ?? 0,
          icon: (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22V12M7 7h10v4a5 5 0 0 1-10 0z"/>
              <line x1="5" y1="7" x2="5" y2="3"/>
              <line x1="19" y1="7" x2="19" y2="3"/>
            </svg>
          ),
        },
        {
          label: 'Alternator',
          watts: data?.alternatorWatts ?? 0,
          icon: (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2"/>
              <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
              <line x1="12" y1="12" x2="12" y2="16"/>
              <line x1="10" y1="14" x2="14" y2="14"/>
            </svg>
          ),
        },
      ]
    : [
        {
          label: 'AC',
          watts: data?.acOutputWatts ?? 0,
          icon: (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22V12M7 7h10v4a5 5 0 0 1-10 0z"/>
              <line x1="5" y1="7" x2="5" y2="3"/>
              <line x1="19" y1="7" x2="19" y2="3"/>
            </svg>
          ),
        },
        {
          label: 'DC 12V',
          watts: data?.dcOutputWatts ?? 0,
          icon: (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2h-3"/>
              <circle cx="9" cy="17" r="3"/>
              <circle cx="17" cy="17" r="3"/>
            </svg>
          ),
        },
        {
          label: 'USB',
          watts: data?.usbOutputWatts ?? 0,
          icon: (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v12M9 7l3-5 3 5"/>
              <circle cx="7" cy="16" r="3"/>
              <circle cx="17" cy="16" r="3"/>
              <path d="M7 13v-2h10v2"/>
            </svg>
          ),
        },
      ]

  const total = isIn ? (data?.totalInputWatts ?? 0) : (data?.totalOutputWatts ?? 0)

  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-2.5 flex flex-col gap-1">
      <div className="flex items-center justify-between mb-0.5 px-1">
        <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: accentColor }}>
          {isIn ? 'IN' : 'OUT'}
        </span>
      </div>
      {rows.map(row => (
        <div
          key={row.label}
          className={`flex items-center gap-1.5 px-1.5 py-1 rounded-lg${row.watts > 0 ? ' bg-[#2a2a2a]' : ''}`}
        >
          <span style={{ color: row.watts > 0 ? accentColor : '#4b5563' }}>{row.icon}</span>
          <span className="text-[9px] text-[#6b7280] flex-1 leading-none">{row.label}</span>
          <span className={`text-[10px] font-semibold tabular-nums ${row.watts > 0 ? 'text-[#f5f5f5]' : 'text-[#4b5563]'}`}>
            {row.watts > 0 ? `${row.watts}W` : '—'}
          </span>
        </div>
      ))}
      <div className="flex justify-end px-1 pt-1 border-t border-[#2a2a2a] mt-0.5">
        <span
          className={`text-sm font-bold tabular-nums${total === 0 ? ' text-[#4b5563]' : ''}`}
          style={total > 0 ? { color: accentColor } : undefined}
        >
          {total}W
        </span>
      </div>
    </div>
  )
}

function PortToggleRow({ icon, label, watts, enabled, onToggle, accent }) {
  return (
    <div
      className="bg-[#1a1a1a] border border-[#2a2a2a] flex items-center gap-3 px-3 py-2.5 rounded-xl"
      style={enabled ? { borderColor: 'rgba(34,197,94,0.35)' } : undefined}
    >
      <span className={enabled ? 'text-[#4ade80]' : 'text-[#4b5563]'}>{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white leading-none">{label}</p>
        <p className={`text-[10px] mt-0.5 ${enabled ? 'text-[#4ade80]' : 'text-[#6b7280]'}`}>
          {enabled && watts > 0 ? `${watts}W` : enabled ? 'On' : 'Off'}
        </p>
      </div>
      <div
        onClick={onToggle}
        className="relative w-11 h-6 bg-[#3a3a3a] rounded-full transition-colors duration-200 shrink-0 cursor-pointer select-none"
        style={enabled ? { background: accent ?? '#f97316' } : undefined}
      >
        <div
          className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200"
          style={{ transform: enabled ? 'translateX(22px)' : 'translateX(2px)' }}
        />
      </div>
    </div>
  )
}

const DEVICE_LIST = Object.entries(ECOFLOW_DEVICES).map(([key, d]) => ({ key, ...d }))

const ExternalLinkIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
    <polyline points="15 3 21 3 21 9"/>
    <line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
)

function DeviceInfoSheet({ device, data, onClose }) {
  const hasBattery = device.capacity > 0
  const soc = data?.soc ?? null
  const whRemaining = hasBattery && soc != null
    ? Math.round((soc / 100) * device.capacity)
    : null
  const whColor = whRemaining == null ? '#6b7280'
    : soc > 50 ? '#4ade80'
    : soc > 20 ? '#fbbf24'
    : '#f87171'
  const fmtWh = (wh) => wh >= 1000
    ? `${Math.floor(wh / 1000)},${String(wh % 1000).padStart(3, '0')} Wh`
    : `${wh} Wh`

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
    >
      <div
        className="bg-[#111] border-t border-[#2a2a2a] rounded-t-2xl p-6 flex flex-col gap-4"
        style={{ paddingBottom: 'calc(24px + env(safe-area-inset-bottom))' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Device identity */}
        <div>
          <p className="text-xl font-bold text-white">{device.name}</p>
          <p className="text-sm text-[#6b7280] mt-0.5">{device.model}</p>
        </div>

        {/* Serial number */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#9ca3af]">Serial</span>
          <span className="text-sm text-[#6b7280] font-mono">{device.sn ?? '—'}</span>
        </div>

        {/* Capacity + live SOC — battery devices only */}
        {hasBattery && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#9ca3af]">Capacity</span>
              <span className="text-sm text-[#6b7280]">{fmtWh(device.capacity)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#9ca3af]">Current charge</span>
              <span className="text-sm font-semibold" style={{ color: whColor }}>
                {soc != null ? `${soc}% · ${fmtWh(whRemaining)}` : '—'}
              </span>
            </div>
          </>
        )}

        {/* Cycle count */}
        {data?.cycles != null && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#9ca3af]">Charge cycles</span>
            <span className="text-sm text-[#6b7280]">{data.cycles}</span>
          </div>
        )}

        <div className="border-t border-[#2a2a2a]" />

        {/* Links */}
        <a href={device.manualUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between py-1">
          <span className="text-sm text-white">Owner's Manual</span>
          <ExternalLinkIcon />
        </a>
        <a href="https://www.ecoflow.com/us/support" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between py-1">
          <span className="text-sm text-white">EcoFlow Support</span>
          <ExternalLinkIcon />
        </a>

        {/* Close */}
        <button onClick={onClose} className="w-full py-3 rounded-xl text-sm font-semibold text-[#9ca3af] border border-[#2a2a2a] mt-1">
          Close
        </button>
      </div>
    </div>
  )
}

function EcoflowSection() {
  const { accent, theme } = useAppStore()
  const isLight = theme === 'light'
  const chipInactive = isLight
    ? { background: '#f3f4f6', borderColor: '#e5e7eb', color: '#6b7280' }
    : { background: '#111',    borderColor: '#2a2a2a', color: '#9ca3af' }
  const [selectedKey, setSelectedKey] = useState('delta2Max')
  const [infoOpen, setInfoOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const [, tick] = useState(0)
  const device = ECOFLOW_DEVICES[selectedKey]
  const { data, loading, error, lastUpdated, refetch } = useEcoFlow(device.sn)

  useEffect(() => {
    const id = setInterval(() => tick(n => n + 1), 15000)
    return () => clearInterval(id)
  }, [])

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2000)
  }

  const soc = data?.soc ?? null
  const barColor = soc == null ? '#4b5563' : soc > 50 ? '#22c55e' : soc > 20 ? '#f97316' : '#ef4444'
  const totalIn  = data?.totalInputWatts  ?? 0
  const totalOut = data?.totalOutputWatts ?? 0
  const netWatts = totalIn - totalOut

  return (
    <div>
      {toast && <EcoToast message={toast} />}
      {infoOpen && <DeviceInfoSheet device={device} data={data} onClose={() => setInfoOpen(false)} />}

      <SectionLabel>EcoFlow</SectionLabel>

      {/* Device selector chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-3" style={{ scrollbarWidth: 'none' }}>
        {DEVICE_LIST.map(d => (
          <button
            key={d.key}
            onClick={() => setSelectedKey(d.key)}
            className="shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-colors"
            style={
              d.key === selectedKey
                ? { background: `${accent}26`, borderColor: `${accent}66`, color: accent }
                : chipInactive
            }
          >
            {d.name}
          </button>
        ))}
      </div>

      <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-4 flex flex-col gap-3">
        {/* Card header */}
        <div className="flex items-center justify-between">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ChargingIndicator netFlow={netWatts} />
            <div>
              <div className="text-white" style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.2 }}>{device.name}</div>
              <div className="text-[#6b7280]" style={{ fontSize: 11, lineHeight: 1.2, marginTop: 2 }}>
                {netWatts > 0 ? `+${netWatts}W · Charging` : netWatts < 0 ? `${netWatts}W · Discharging` : 'Idle'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setInfoOpen(true)}
              className="flex items-center justify-center text-[#6b7280]"
              style={{ width: 24, height: 24, borderRadius: '50%', border: '1px solid #3a3a3a', background: 'transparent', fontSize: 12, fontStyle: 'italic', fontWeight: 600, lineHeight: 1 }}
              aria-label="Device info"
            >
              i
            </button>
            <button
              onClick={refetch}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-[#6b7280] hover:text-white transition-colors"
              style={{ background: 'rgba(255,255,255,0.04)' }}
              aria-label="Refresh"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 0 1 15-6.7L21 8"/>
                <path d="M21 3v5h-5"/>
                <path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
                <path d="M3 21v-5h5"/>
              </svg>
            </button>
          </div>
        </div>

        {error ? (
          <p className="text-xs text-[#f87171] text-center py-2">{error}</p>
        ) : (
          <>
            {/* Battery bar */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-[#9ca3af]">Battery</span>
                <span className="text-sm font-bold" style={{ color: barColor }}>
                  {loading ? '—' : soc != null ? `${soc}%` : '—'}
                  {netWatts > 0 && <span style={{ fontSize: 12, marginLeft: 4, color: '#22c55e' }}>⚡</span>}
                </span>
              </div>
              <div className="h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${soc ?? 0}%`, background: barColor }}
                />
              </div>
              {!loading && (
                <div className="flex justify-between mt-1.5">
                  <span className={`text-[10px] font-medium ${totalIn > 0 ? 'text-[#4ade80]' : 'text-[#4b5563]'}`}>
                    ↓ {totalIn}W in
                  </span>
                  <span className={`text-[10px] font-medium ${totalOut > 0 ? 'text-[#fb923c]' : 'text-[#4b5563]'}`}>
                    ↑ {totalOut}W out
                  </span>
                </div>
              )}
            </div>

            {/* Power flow grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <PowerFlowCard type="in"  data={data} />
              <PowerFlowCard type="out" data={data} />
            </div>

            {/* Net flow + time remaining */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-2.5 py-2 flex flex-col items-center gap-0.5">
                <span className={`text-xs font-bold tabular-nums ${netWatts > 0 ? 'text-[#4ade80]' : netWatts < 0 ? 'text-[#f87171]' : 'text-[#4b5563]'}`}>
                  {netWatts > 0 ? `+${netWatts}W` : `${netWatts}W`}
                </span>
                <span className="text-[9px] text-[#6b7280] uppercase tracking-wider">Net</span>
              </div>
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-2.5 py-2 flex flex-col items-center gap-0.5">
                <span className="text-xs font-bold text-[#f5f5f5]">
                  {loading ? '—' : formatRemainTime(data?.remainTime)}
                </span>
                <span className="text-[9px] text-[#6b7280] uppercase tracking-wider">Time left</span>
              </div>
            </div>

            {/* Port toggles */}
            <div className="flex flex-col gap-2">
              <PortToggleRow
                label="AC Output"
                watts={data?.acOutputWatts ?? 0}
                enabled={data?.acEnabled ?? false}
                accent={accent}
                onToggle={() => showToast('Port control coming in Phase 5')}
                icon={
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22V12M7 7h10v4a5 5 0 0 1-10 0z"/>
                    <line x1="5" y1="7" x2="5" y2="3"/>
                    <line x1="19" y1="7" x2="19" y2="3"/>
                  </svg>
                }
              />
              <PortToggleRow
                label="12V DC"
                watts={data?.dcOutputWatts ?? 0}
                enabled={data?.dcEnabled ?? false}
                accent={accent}
                onToggle={() => showToast('Port control coming in Phase 5')}
                icon={
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2h-3"/>
                    <circle cx="9" cy="17" r="3"/>
                    <circle cx="17" cy="17" r="3"/>
                  </svg>
                }
              />
              <PortToggleRow
                label="USB & Type-C"
                watts={data?.usbOutputWatts ?? 0}
                enabled={data?.usbEnabled ?? false}
                accent={accent}
                onToggle={() => showToast('Port control coming in Phase 5')}
                icon={
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2v12M9 7l3-5 3 5"/>
                    <circle cx="7" cy="16" r="3"/>
                    <circle cx="17" cy="16" r="3"/>
                    <path d="M7 13v-2h10v2"/>
                  </svg>
                }
              />
            </div>
          </>
        )}

        {lastUpdated && (
          <p className="text-[10px] text-[#4b5563] text-right -mt-1">
            {formatLastUpdated(lastUpdated)}
          </p>
        )}
      </div>
    </div>
  )
}

// ─── Starlink ─────────────────────────────────────────────────────────────────

function StarlinkSection() {
  const {
    status, loading, isOnline, isSearching,
    downMbps, upMbps, latencyMs, obstructionPct,
    lastUpdated, refetch,
  } = useStarlink()

  const dotColor = isOnline ? '#22c55e' : isSearching ? '#f97316' : '#ef4444'
  const statusLabel = isOnline ? 'Connected'
    : isSearching ? 'Searching...'
    : status?.offline ? 'Dish offline'
    : loading ? 'Connecting...'
    : 'Not connected'

  return (
    <div>
      <SectionLabel>Starlink</SectionLabel>
      <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-4 flex flex-col gap-3">

        {/* Header row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Status dot */}
            <div style={{ position: 'relative', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {isOnline && (
                <div style={{ position: 'absolute', width: 24, height: 24, borderRadius: '50%', background: '#22c55e', opacity: 0.2, animation: 'gps-pulse 2s ease-out infinite' }} />
              )}
              {isOnline && (
                <div style={{ position: 'absolute', width: 16, height: 16, borderRadius: '50%', background: '#22c55e', opacity: 0.3, animation: 'gps-pulse 2s ease-out infinite', animationDelay: '0.4s' }} />
              )}
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: dotColor, position: 'relative', zIndex: 1, boxShadow: isOnline ? '0 0 6px #22c55e' : 'none' }} />
            </div>

            <div>
              <div className="text-white" style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.2 }}>{statusLabel}</div>
              <div className="text-[#6b7280]" style={{ fontSize: 11, lineHeight: 1.2, marginTop: 2 }}>Starlink · Flat High Performance</div>
            </div>
          </div>

          <button
            onClick={refetch}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#6b7280] hover:text-white transition-colors"
            style={{ background: 'rgba(255,255,255,0.04)' }}
            aria-label="Refresh"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 0 1 15-6.7L21 8"/>
              <path d="M21 3v5h-5"/>
              <path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
              <path d="M3 21v-5h5"/>
            </svg>
          </button>
        </div>

        {/* Speed stats — online only */}
        {isOnline && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 6 }}>
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-2 flex flex-col items-center gap-0.5">
              <span className="text-xs font-bold text-[#f5f5f5] tabular-nums">{downMbps}</span>
              <span className="text-[9px] text-[#6b7280] uppercase tracking-wider">↓ Mbps</span>
            </div>
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-2 flex flex-col items-center gap-0.5">
              <span className="text-xs font-bold text-[#f5f5f5] tabular-nums">{upMbps}</span>
              <span className="text-[9px] text-[#6b7280] uppercase tracking-wider">↑ Mbps</span>
            </div>
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-2 flex flex-col items-center gap-0.5">
              <span className="text-xs font-bold text-[#f5f5f5] tabular-nums">{latencyMs}ms</span>
              <span className="text-[9px] text-[#6b7280] uppercase tracking-wider">Latency</span>
            </div>
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-2 flex flex-col items-center gap-0.5">
              <span
                className="text-xs font-bold tabular-nums"
                style={{ color: parseFloat(obstructionPct) > 5 ? '#ef4444' : '#22c55e' }}
              >
                {obstructionPct}%
              </span>
              <span className="text-[9px] text-[#6b7280] uppercase tracking-wider">Obstruct</span>
            </div>
          </div>
        )}

        {/* Alerts */}
        {status?.alerts?.thermalThrottle && (
          <div className="rounded-r-lg px-3 py-2" style={{ background: 'rgba(249,115,22,0.1)', borderLeft: '2px solid #f97316' }}>
            <p className="text-xs font-medium" style={{ color: '#f97316' }}>Thermal throttling active</p>
          </div>
        )}
        {status?.alerts?.motorsStuck && (
          <div className="rounded-r-lg px-3 py-2" style={{ background: 'rgba(239,68,68,0.1)', borderLeft: '2px solid #ef4444' }}>
            <p className="text-xs font-medium" style={{ color: '#ef4444' }}>Motors stuck — check dish position</p>
          </div>
        )}

        {/* Offline message */}
        {!loading && (status?.offline || (!isOnline && !isSearching)) && (
          <p className="text-[#6b7280] text-xs text-center py-1">
            Dish not reachable · Connect to Starlink network to monitor
          </p>
        )}

        {/* Last updated */}
        {lastUpdated && (
          <p className="text-[10px] text-[#4b5563] text-right -mt-1">
            Updated {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  )
}

// ─── Humidity ─────────────────────────────────────────────────────────────────

function HumiditySection() {
  return (
    <div>
      <SectionLabel>Humidity</SectionLabel>
      <div className="bg-[#111] border border-[#2a2a2a] rounded-xl overflow-hidden divide-y divide-[#2a2a2a]">
        {HUMIDITY_ZONES.map(z => {
          const ok = z.value < 70
          return (
            <div key={z.id} className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-[#9ca3af]">{z.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">{z.value}%</span>
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={
                    ok
                      ? { background: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.22)', color: '#4ade80' }
                      : { background: 'rgba(251,191,36,0.10)', border: '1px solid rgba(251,191,36,0.22)', color: '#fbbf24' }
                  }
                >
                  {ok ? 'Optimal' : 'High'}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Lighting ─────────────────────────────────────────────────────────────────

function LightingSection({ lights, onToggle, onBrightness }) {
  return (
    <div>
      <SectionLabel>Lighting</SectionLabel>
      <div className="bg-[#111] border border-[#2a2a2a] rounded-xl divide-y divide-[#2a2a2a]">
        {Object.keys(lights).map(id => (
          <LightRow
            key={id}
            id={id}
            label={LIGHT_LABELS[id]}
            on={lights[id].on}
            brightness={lights[id].brightness}
            onToggle={() => onToggle(id)}
            onBrightness={(v) => onBrightness(id, v)}
          />
        ))}
      </div>
    </div>
  )
}

function LightRow({ id, label, on, brightness, onToggle, onBrightness }) {
  const { accent } = useAppStore()
  return (
    <div className="pl-4 pr-3 py-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-white">{label}</span>
        <Toggle on={on} onToggle={onToggle} accent={accent} />
      </div>
      <div
        className="overflow-hidden transition-all duration-200"
        style={{ maxHeight: on ? 44 : 0, opacity: on ? 1 : 0 }}
      >
        <div className="flex items-center gap-3 pt-2.5">
          <span className="text-[10px] text-[#6b7280] w-6 text-right shrink-0">{brightness}%</span>
          <input
            type="range"
            min={5}
            max={100}
            value={brightness}
            onChange={e => onBrightness(Number(e.target.value))}
            className="flex-1 cursor-pointer"
            style={{ accentColor: accent }}
          />
        </div>
      </div>
    </div>
  )
}

function Toggle({ on, onToggle, accent }) {
  return (
    <div
      onClick={onToggle}
      className="relative w-11 h-6 bg-[#3a3a3a] rounded-full transition-colors duration-200 shrink-0 cursor-pointer select-none"
      style={on ? { background: accent } : undefined}
    >
      <div
        className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200"
        style={{ transform: on ? 'translateX(22px)' : 'translateX(2px)' }}
      />
    </div>
  )
}

// ─── Scenes ───────────────────────────────────────────────────────────────────

function ScenesSection({ onApply }) {
  const { accent, theme } = useAppStore()
  const chipInactive = theme === 'light'
    ? { background: '#f3f4f6', borderColor: '#e5e7eb', color: '#6b7280' }
    : { background: '#111',    borderColor: '#2a2a2a', color: '#9ca3af' }
  const [active, setActive] = useState(null)

  const handle = (name) => {
    setActive(name)
    onApply(name)
  }

  return (
    <div>
      <SectionLabel>Scene presets</SectionLabel>
      <div
        className="flex gap-2 overflow-x-auto pb-1"
        style={{ scrollbarWidth: 'none' }}
      >
        {Object.keys(SCENES).map(name => (
          <button
            key={name}
            onClick={() => handle(name)}
            className="shrink-0 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors"
            style={
              active === name
                ? { background: `${accent}26`, borderColor: `${accent}66`, color: accent }
                : chipInactive
            }
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Shared ───────────────────────────────────────────────────────────────────

function SectionLabel({ children }) {
  return (
    <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-2">{children}</p>
  )
}
