import { useState } from 'react'

// ─── Seed data ────────────────────────────────────────────────────────────────

const HAS_ALERT = false

const TEMP_ZONES = [
  { id: 'outside',  label: 'Outside',     value: 54, unit: '°F', color: '#60a5fa' },
  { id: 'cabin',    label: 'Cabin',        value: 68, unit: '°F', color: '#f97316' },
  { id: 'ursa',     label: 'Ursa Minor',   value: 62, unit: '°F', color: '#f5f5f5' },
  { id: 'fridge',   label: 'Fridge',       value: 38, unit: '°F', color: '#4ade80' },
  { id: 'battery',  label: 'Battery comp', value: 72, unit: '°F', color: '#f5f5f5' },
  { id: 'water',    label: 'Water tank',   value: 55, unit: '°F', color: '#f5f5f5' },
]

const ECOFLOW = {
  name: 'Delta Pro',
  pct: 78,
  drawW: 142,
  solarW: 87,
  hrsRemaining: 4.2,
  ports: [
    { id: 'ac1',  label: 'AC 1',  active: true  },
    { id: 'dc',   label: 'DC',    active: true  },
    { id: 'usb',  label: 'USB',   active: true  },
    { id: 'ac2',  label: 'AC 2',  active: false },
  ],
}

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
      <div className="p-4 flex flex-col gap-5 pb-6">
        <RigHeader hasAlert={HAS_ALERT} />
        <TempZones />
        <EcoflowSection />
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
            <div className="text-lg font-bold leading-none" style={{ color: z.color }}>
              {z.value}{z.unit}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── EcoFlow ──────────────────────────────────────────────────────────────────

function EcoflowSection() {
  const { name, pct, drawW, solarW, hrsRemaining, ports } = ECOFLOW
  const barColor = pct > 50 ? '#22c55e' : pct > 20 ? '#f97316' : '#ef4444'

  return (
    <div>
      <SectionLabel>EcoFlow {name}</SectionLabel>
      <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-4 flex flex-col gap-3">
        {/* Battery level */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#9ca3af]">Battery</span>
          <span className="text-sm font-bold" style={{ color: barColor }}>{pct}%</span>
        </div>
        <div className="h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: barColor }}
          />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          <StatPill label="Draw"      value={`${drawW}W`}           color="#f87171" />
          <StatPill label="Solar"     value={`+${solarW}W`}         color="#4ade80" />
          <StatPill label="Est. time" value={`${hrsRemaining}hrs`}  color="#f5f5f5" />
        </div>

        {/* Ports */}
        <div className="flex gap-2 flex-wrap pt-0.5">
          {ports.map(p => (
            <span
              key={p.id}
              className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={
                p.active
                  ? { background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)', color: '#f97316' }
                  : { background: 'rgba(255,255,255,0.04)', border: '1px solid #2a2a2a', color: '#4b5563' }
              }
            >
              {p.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatPill({ label, value, color }) {
  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-2.5 py-2 flex flex-col items-center gap-0.5">
      <span className="text-xs font-bold" style={{ color }}>{value}</span>
      <span className="text-[9px] text-[#6b7280] uppercase tracking-wider">{label}</span>
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
  return (
    <div className="pl-4 pr-3 py-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-white">{label}</span>
        <Toggle on={on} onToggle={onToggle} />
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
            className="flex-1 accent-orange-500 cursor-pointer"
          />
        </div>
      </div>
    </div>
  )
}

function Toggle({ on, onToggle }) {
  return (
    <div
      onClick={onToggle}
      className="relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 cursor-pointer select-none"
      style={{ background: on ? '#f97316' : '#3a3a3a' }}
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
                ? { background: 'rgba(249,115,22,0.15)', borderColor: 'rgba(249,115,22,0.4)', color: '#f97316' }
                : { background: '#111', borderColor: '#2a2a2a', color: '#9ca3af' }
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
