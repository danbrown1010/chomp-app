import { useState } from 'react'
import { useAppStore } from '../store/index'

// ─── Constants ────────────────────────────────────────────────────────────────

const TRIP_TYPES = ['Overlanding', 'Photography', 'Fishing', 'Mixed']

const STEP_LABELS = ['Basics', 'Rig', 'People', 'Review']

const PREPARE_ITEMS = [
  { label: 'Fire & evac data',           status: 'Cached',    color: '#22c55e' },
  { label: 'Offline map tiles',          status: 'Cached',    color: '#22c55e' },
  { label: 'Weather window',             status: 'Fetching',  color: '#f97316' },
  { label: 'Burn ban status',            status: 'Fetching',  color: '#f97316' },
  { label: 'Meal plan suggestions',      status: 'On create', color: '#4b5563' },
  { label: 'Private land boundary data', status: 'On create', color: '#4b5563' },
]

const INITIAL_FORM = {
  name: '',
  type: 'Overlanding',
  departureDate: '',
  returnDate: '',
  region: '',
  gear: { summer: true, photography: false },
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CreateTripPage({ onClose, onCreated }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState(INITIAL_FORM)
  const { createTrip, setActiveTrip } = useAppStore()

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }))
  const updateGear = (key, val) => setForm(prev => ({ ...prev, gear: { ...prev.gear, [key]: val } }))

  const goBack = () => step > 1 ? setStep(s => s - 1) : onClose()
  const goNext = () => step < 4 ? setStep(s => s + 1) : handleCreate()

  const handleCreate = () => {
    const newTrip = createTrip({
      name:          form.name || 'New Trip',
      type:          form.type,
      departureDate: form.departureDate || '2026-06-01',
      returnDate:    form.returnDate    || '2026-06-05',
      region:        form.region,
    })
    setActiveTrip(newTrip)
    onCreated()
  }

  return (
    <div className="flex flex-col h-full">
      <StepHeader step={step} onBack={goBack} onNext={goNext} />
      <div className="flex-1 overflow-y-auto">
        {step === 1 && <Step1Basics  form={form} update={update} />}
        {step === 2 && <Step2Rig     form={form} updateGear={updateGear} />}
        {step === 3 && <Step3People />}
        {step === 4 && <Step4Review  form={form} onEdit={() => setStep(1)} onCreate={handleCreate} />}
      </div>
    </div>
  )
}

// ─── Shared header ────────────────────────────────────────────────────────────

function StepHeader({ step, onBack, onNext }) {
  const { accent } = useAppStore()
  return (
    <div className="px-4 pt-3 pb-0 border-b border-[#1a1a1a]">
      {/* Nav row */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={onBack}
          className="w-8 h-8 flex items-center justify-center active:opacity-60 transition-opacity"
        >
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <span className="text-base font-semibold text-white">New trip</span>

        <button
          onClick={onNext}
          className="text-sm font-semibold active:opacity-60 transition-opacity px-1"
          style={{ color: accent }}
        >
          {step === 4 ? 'Create' : 'Next'}
        </button>
      </div>

      {/* Progress bar */}
      <div className="flex gap-1 mb-2">
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            className="flex-1 h-1 rounded-full transition-colors duration-300"
            style={{ background: i <= step ? accent : '#2a2a2a' }}
          />
        ))}
      </div>

      {/* Step labels */}
      <div className="flex pb-2.5">
        {STEP_LABELS.map((l, i) => (
          <p
            key={l}
            className="flex-1 text-center text-[10px] font-semibold transition-colors"
            style={{ color: i + 1 === step ? accent : '#4b5563' }}
          >
            {l}
          </p>
        ))}
      </div>
    </div>
  )
}

// ─── Step 1 — Basics ──────────────────────────────────────────────────────────

function Step1Basics({ form, update }) {
  const { accent } = useAppStore()
  return (
    <div className="p-4 flex flex-col gap-5" style={{ paddingBottom: 'calc(32px + env(safe-area-inset-bottom))' }}>

      <Field label="Trip name">
        <input
          type="text"
          value={form.name}
          onChange={e => update('name', e.target.value)}
          placeholder="Entiat River — Summer 2025"
          className="w-full bg-[#111] border border-[#2a2a2a] rounded-xl px-4 py-3 text-sm text-white placeholder-[#3a3a3a] outline-none"
          style={{ caretColor: accent }}
          onFocus={e => e.target.style.borderColor = `${accent}80`}
          onBlur={e => e.target.style.borderColor = '#2a2a2a'}
        />
      </Field>

      <Field label="Trip type">
        <div className="grid grid-cols-2 gap-2">
          {TRIP_TYPES.map(t => (
            <button
              key={t}
              onClick={() => update('type', t)}
              className="py-2.5 rounded-xl text-sm font-semibold transition-colors active:opacity-80"
              style={
                form.type === t
                  ? { background: accent, color: 'white' }
                  : { background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#6b7280' }
              }
            >
              {t}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Dates">
        <div className="flex gap-3">
          <DateCard
            label="Depart"
            value={form.departureDate}
            onChange={v => update('departureDate', v)}
          />
          <DateCard
            label="Return"
            value={form.returnDate}
            onChange={v => update('returnDate', v)}
          />
        </div>
      </Field>

      <Field label="Region">
        <input
          type="text"
          value={form.region}
          onChange={e => update('region', e.target.value)}
          placeholder="Okanogan NF · North Cascades"
          className="w-full bg-[#111] border border-[#2a2a2a] rounded-xl px-4 py-3 text-sm text-white placeholder-[#3a3a3a] outline-none"
          style={{ caretColor: accent }}
          onFocus={e => e.target.style.borderColor = `${accent}80`}
          onBlur={e => e.target.style.borderColor = '#2a2a2a'}
        />
      </Field>

    </div>
  )
}

function DateCard({ label, value, onChange }) {
  return (
    <div className="flex-1 bg-[#111] border border-[#2a2a2a] rounded-xl px-3 py-3">
      <p className="text-[10px] font-semibold text-[#6b7280] uppercase tracking-widest mb-1.5">{label}</p>
      <input
        type="date"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full text-white text-sm bg-transparent outline-none"
        style={{ colorScheme: 'dark' }}
      />
    </div>
  )
}

// ─── Step 2 — Rig ─────────────────────────────────────────────────────────────

function Step2Rig({ form, updateGear }) {
  return (
    <div className="p-4 flex flex-col gap-5" style={{ paddingBottom: 'calc(32px + env(safe-area-inset-bottom))' }}>

      <Field label="Vehicle">
        {/* Selected vehicle */}
        <div className="bg-[#111] border border-[#2a2a2a] rounded-xl overflow-hidden divide-y divide-[#2a2a2a]">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 rounded-lg bg-[#1c1c1c] border border-[#2a2a2a] flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-[#9ca3af]" viewBox="0 0 24 24" fill="none">
                <path d="M3 12l2-4h14l2 4M3 12v5a1 1 0 001 1h1a1 1 0 001-1v-1h12v1a1 1 0 001 1h1a1 1 0 001-1v-5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="7" cy="16" r="1.5" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="17" cy="16" r="1.5" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">2014 Jeep JKU — Chomp</p>
              <p className="text-xs text-[#6b7280]">Primary rig</p>
            </div>
            <svg className="w-4 h-4 text-[#22c55e] shrink-0" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <button className="w-full flex items-center gap-3 px-4 py-3 active:opacity-60 transition-opacity">
            <div className="w-8 h-8 rounded-lg border border-dashed border-[#2a2a2a] flex items-center justify-center shrink-0">
              <svg className="w-3.5 h-3.5 text-[#4b5563]" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-sm text-[#4b5563]">Add vehicle</span>
          </button>
        </div>
      </Field>

      <Field label="Gear lists">
        <div className="bg-[#111] border border-[#2a2a2a] rounded-xl overflow-hidden divide-y divide-[#2a2a2a]">
          <GearToggleRow
            label="5-day summer overlanding"
            count={42}
            on={form.gear.summer}
            onToggle={() => updateGear('summer', !form.gear.summer)}
          />
          <GearToggleRow
            label="Photography add-on"
            count={6}
            on={form.gear.photography}
            onToggle={() => updateGear('photography', !form.gear.photography)}
          />
        </div>
      </Field>

      <Field label="Fuel estimate">
        <div className="bg-[#111] border border-[#2a2a2a] rounded-xl overflow-hidden divide-y divide-[#2a2a2a]">
          <FuelRow label="Route distance"  value="~240mi round trip"     />
          <FuelRow label="Fuel needed"     value="~20 gal + 3 gal reserve" />
          <FuelRow label="Last fuel stop"  value="Entiat · 34mi out"     />
        </div>
      </Field>

    </div>
  )
}

function GearToggleRow({ label, count, on, onToggle }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-xs text-[#6b7280]">{count} items</p>
      </div>
      <Toggle on={on} onToggle={onToggle} />
    </div>
  )
}

function FuelRow({ label, value }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-sm text-[#9ca3af]">{label}</span>
      <span className="text-sm font-medium text-white">{value}</span>
    </div>
  )
}

// ─── Step 3 — People ──────────────────────────────────────────────────────────

function Step3People() {
  const { accent } = useAppStore()
  return (
    <div className="p-4 flex flex-col gap-5" style={{ paddingBottom: 'calc(32px + env(safe-area-inset-bottom))' }}>

      <Field label="Partners">
        <div className="bg-[#111] border border-[#2a2a2a] rounded-xl overflow-hidden divide-y divide-[#2a2a2a]">
          {/* Dan — fixed */}
          <div className="flex items-center gap-3 px-4 py-3">
            <Avatar initials="DB" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">Dan Brown</p>
              <p className="text-xs text-[#6b7280]">You · Trip lead</p>
            </div>
          </div>
          {/* Emily */}
          <div className="flex items-center gap-3 px-4 py-3">
            <Avatar initials="EB" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">Emily Brown</p>
              <p className="text-xs text-[#6b7280]">emily@gmail.com</p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 text-white" style={{ background: accent }}>
              Co-pilot
            </span>
          </div>
          {/* Invite */}
          <GhostRow label="Invite by email or link" />
        </div>
      </Field>

      <Field label="Campsites">
        <div className="bg-[#111] border border-[#2a2a2a] rounded-xl overflow-hidden divide-y divide-[#2a2a2a]">
          <CampsiteRow
            name="Handy Spring"
            sub="Dispersed · FR 5900"
            pinColor={accent}
            badge="Open"
            badgeColor="#22c55e"
            badgeBg="rgba(34,197,94,0.12)"
            badgeBorder="rgba(34,197,94,0.25)"
          />
          <CampsiteRow
            name="Entiat River Camp"
            sub="Rec.gov #482193"
            pinColor="#3b82f6"
            badge="Reserved"
            badgeColor="#60a5fa"
            badgeBg="rgba(59,130,246,0.12)"
            badgeBorder="rgba(59,130,246,0.25)"
          />
          <GhostRow label="Add campsite" />
        </div>
      </Field>

      <Field label="Pets">
        <div className="bg-[#111] border border-[#2a2a2a] rounded-xl overflow-hidden">
          <GhostRow label="Add a pet" />
        </div>
      </Field>

    </div>
  )
}

function Avatar({ initials }) {
  return (
    <div className="w-8 h-8 rounded-full bg-[#2a2a2a] flex items-center justify-center shrink-0">
      <span className="text-[10px] font-bold text-[#9ca3af]">{initials}</span>
    </div>
  )
}

function CampsiteRow({ name, sub, pinColor, badge, badgeColor, badgeBg, badgeBorder }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" style={{ color: pinColor }}>
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.75" />
        <circle cx="12" cy="9" r="2.5" fill="currentColor" />
      </svg>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white">{name}</p>
        <p className="text-xs text-[#6b7280]">{sub}</p>
      </div>
      <span
        className="text-xs font-semibold px-2 py-0.5 rounded-full shrink-0"
        style={{ color: badgeColor, background: badgeBg, border: `1px solid ${badgeBorder}` }}
      >
        {badge}
      </span>
    </div>
  )
}

function GhostRow({ label }) {
  return (
    <button className="w-full flex items-center gap-3 px-4 py-3 active:opacity-60 transition-opacity">
      <div className="w-5 h-5 rounded-full border border-dashed border-[#3a3a3a] flex items-center justify-center shrink-0">
        <svg className="w-2.5 h-2.5 text-[#4b5563]" viewBox="0 0 24 24" fill="none">
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>
      <span className="text-sm text-[#4b5563]">{label}</span>
    </button>
  )
}

// ─── Step 4 — Review ──────────────────────────────────────────────────────────

function Step4Review({ form, onEdit, onCreate }) {
  const { accent } = useAppStore()
  const gearCount = (form.gear.summer ? 42 : 0) + (form.gear.photography ? 6 : 0)

  return (
    <div className="p-4 flex flex-col gap-5" style={{ paddingBottom: 'calc(32px + env(safe-area-inset-bottom))' }}>

      {/* Summary card */}
      <div className="bg-[#111] border border-[#2a2a2a] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <p className="text-base font-bold text-white">{form.name || 'New Trip'}</p>
          <button onClick={onEdit} className="text-xs font-semibold active:opacity-60" style={{ color: accent }}>
            Edit
          </button>
        </div>
        <div className="divide-y divide-[#2a2a2a]">
          <ReviewRow label="Dates"     value={form.departureDate && form.returnDate ? `${fmtDate(form.departureDate)} → ${fmtDate(form.returnDate)}` : '—'} />
          <ReviewRow label="Type"      value={form.type} />
          <ReviewRow label="Region"    value={form.region || '—'} />
          <ReviewRow label="Vehicle"   value="2014 Jeep JKU · Chomp" />
          <ReviewRow label="People"    value="Dan Brown, Emily Brown" />
          <ReviewRow label="Campsites" value="Handy Spring, Entiat River" />
          <ReviewRow label="Gear"      value={`${gearCount} items`} />
        </div>
      </div>

      {/* Chomp will prepare */}
      <div>
        <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-2">Chomp will prepare</p>
        <div className="bg-[#111] border border-[#2a2a2a] rounded-xl overflow-hidden divide-y divide-[#2a2a2a]">
          {PREPARE_ITEMS.map(item => (
            <div key={item.label} className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-[#9ca3af]">{item.label}</span>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: item.color }} />
                <span className="text-xs font-semibold" style={{ color: item.color }}>{item.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2.5">
        <button
          onClick={onCreate}
          className="w-full py-4 rounded-xl text-sm font-bold text-white active:opacity-80 transition-opacity"
          style={{ background: accent }}
        >
          Create trip
        </button>
        <button className="w-full py-4 rounded-xl text-sm font-semibold text-[#9ca3af] border border-[#2a2a2a] active:opacity-60 transition-opacity">
          Save as draft
        </button>
      </div>

    </div>
  )
}

function ReviewRow({ label, value }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5">
      <span className="text-xs text-[#6b7280]">{label}</span>
      <span className="text-sm font-medium text-white text-right max-w-[60%]">{value}</span>
    </div>
  )
}

// ─── Shared primitives ────────────────────────────────────────────────────────

function Field({ label, children }) {
  return (
    <div>
      <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-2">{label}</p>
      {children}
    </div>
  )
}

function Toggle({ on, onToggle }) {
  const { accent } = useAppStore()
  return (
    <div
      onClick={onToggle}
      className="relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 cursor-pointer select-none"
      style={{ background: on ? accent : '#3a3a3a' }}
    >
      <div
        className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200"
        style={{ transform: on ? 'translateX(22px)' : 'translateX(2px)' }}
      />
    </div>
  )
}

function fmtDate(iso) {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
