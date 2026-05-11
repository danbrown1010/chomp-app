import { useState } from 'react'
import { useAppStore } from '../store/index'

// ─── Constants ────────────────────────────────────────────────────────────────

const ACCENTS = [
  '#f97316', // orange (default)
  '#3b82f6', // blue
  '#22c55e', // green
  '#a855f7', // purple
  '#d97706', // amber
  '#94a3b8', // slate
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage({ onBack }) {
  const [theme,  setTheme]  = useState(() => {
    const stored = localStorage.getItem('chomp-theme')
    if (!stored) localStorage.setItem('chomp-theme', 'dark')
    return stored || 'dark'
  })
  const { accent, setAccent } = useAppStore()

  const [tripToggles, setTripToggles] = useState({
    phaseAware:        true,
    autoDetect:        true,
    postTripReminders: true,
  })

  const [notifToggles, setNotifToggles] = useState({
    fire:         true,
    burnBan:      true,
    privateLand:  true,
    campsite:     false,
    checkIn:      true,
  })

  const applyTheme = (t) => {
    setTheme(t)
    localStorage.setItem('chomp-theme', t)
    document.documentElement.classList.remove('dark', 'light')
    document.documentElement.classList.add(t)
  }

  const toggleTrip  = (k) => setTripToggles(p  => ({ ...p,  [k]: !p[k]  }))
  const toggleNotif = (k) => setNotifToggles(p => ({ ...p, [k]: !p[k] }))

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 flex flex-col gap-5 pb-8">

        {/* Header */}
        <div className="pt-2 flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1c1c1c] border border-[#2a2a2a] active:opacity-70 transition-opacity shrink-0"
          >
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        </div>

        {/* ── Appearance ─────────────────────────────────────────────────────── */}
        <Section label="Appearance">

          {/* Theme cards */}
          <div className="px-4 py-3 flex flex-col gap-3">
            <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Theme</p>
            <div className="flex gap-3">
              <ThemeCard
                label="Dark"
                selected={theme === 'dark'}
                onSelect={() => applyTheme('dark')}
                preview={<DarkPreview />}
              />
              <ThemeCard
                label="Light"
                selected={theme === 'light'}
                onSelect={() => applyTheme('light')}
                preview={<LightPreview />}
              />
            </div>
          </div>

          <div className="border-t border-[#2a2a2a]" />

          {/* Accent swatches */}
          <div className="px-4 py-3 flex items-center justify-between">
            <p className="text-sm font-medium text-white">Accent color</p>
            <div className="flex items-center gap-2">
              {ACCENTS.map(c => (
                <button
                  key={c}
                  onClick={() => setAccent(c)}
                  className="w-6 h-6 rounded-full transition-transform active:scale-90"
                  style={{
                    background: c,
                    boxShadow: accent === c ? `0 0 0 2px #0a0a0a, 0 0 0 4px ${c}` : 'none',
                    transform: accent === c ? 'scale(1.15)' : 'scale(1)',
                  }}
                />
              ))}
            </div>
          </div>

        </Section>

        {/* ── Trip lifecycle ──────────────────────────────────────────────────── */}
        <Section label="Trip Lifecycle">
          <ToggleRow
            label="Phase-aware home screen"
            sub="Adapt dashboard to trip phase"
            on={tripToggles.phaseAware}
            onToggle={() => toggleTrip('phaseAware')}
          />
          <ToggleRow
            label="Auto-detect on-trip"
            sub="Use GPS + trip dates"
            on={tripToggles.autoDetect}
            onToggle={() => toggleTrip('autoDetect')}
          />
          <ToggleRow
            label="Post-trip reminders"
            sub="Media sync, trail reports"
            on={tripToggles.postTripReminders}
            onToggle={() => toggleTrip('postTripReminders')}
          />
        </Section>

        {/* ── Notifications ───────────────────────────────────────────────────── */}
        <Section label="Notifications">
          <ToggleRow label="Fire alerts"            on={notifToggles.fire}        onToggle={() => toggleNotif('fire')}        />
          <ToggleRow label="Burn ban changes"       on={notifToggles.burnBan}     onToggle={() => toggleNotif('burnBan')}     />
          <ToggleRow label="Private land warnings"  on={notifToggles.privateLand} onToggle={() => toggleNotif('privateLand')} />
          <ToggleRow label="Campsite availability"  on={notifToggles.campsite}    onToggle={() => toggleNotif('campsite')}    />
          <ToggleRow label="Check-in reminders"     on={notifToggles.checkIn}     onToggle={() => toggleNotif('checkIn')}     />
        </Section>

        {/* ── Account ─────────────────────────────────────────────────────────── */}
        <Section label="Account">
          <AccountRow label="Vehicle profiles"  value="2014 Jeep JKU — Chomp" />
          <AccountRow label="Household"         value="Dan + Emily" />
          <AccountRow label="Subscription"      value="Pro" valueColor="#f97316" />
          <AccountRow label="Connected apps"    value="OnX, Gaia GPS" />
          <div className="border-t border-[#2a2a2a]">
            <button className="w-full flex items-center px-4 py-3 active:opacity-70 transition-opacity">
              <span className="text-sm font-semibold" style={{ color: '#ef4444' }}>Sign out</span>
            </button>
          </div>
        </Section>

        {/* ── About ───────────────────────────────────────────────────────────── */}
        <Section label="About">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-[#9ca3af]">Version</span>
            <span className="text-sm font-medium text-white">0.1.0 — Phase 3 build</span>
          </div>
          <div className="border-t border-[#2a2a2a]">
            <a
              href="https://danbrown1010.github.io/chomp-docs"
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-between px-4 py-3 active:opacity-70 transition-opacity"
            >
              <span className="text-sm font-medium text-white">Knowledge base</span>
              <svg className="w-4 h-4 text-[#4b5563]" viewBox="0 0 24 24" fill="none">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </Section>

      </div>
    </div>
  )
}

// ─── Theme cards ──────────────────────────────────────────────────────────────

function ThemeCard({ label, selected, onSelect, preview }) {
  const { accent } = useAppStore()
  return (
    <button
      onClick={onSelect}
      className="flex-1 rounded-xl overflow-hidden border-2 transition-colors active:opacity-80"
      style={{ borderColor: selected ? accent : '#2a2a2a' }}
    >
      {preview}
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{ background: label === 'Light' ? '#f0f0f0' : '#111' }}
      >
        <span className="text-xs font-semibold" style={{ color: label === 'Light' ? '#111111' : '#ffffff' }}>{label}</span>
        {selected && (
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" style={{ color: accent }}>
            <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
    </button>
  )
}

function DarkPreview() {
  return (
    <div className="h-16 p-2 flex flex-col gap-1.5" style={{ background: '#0a0a0a' }}>
      <div className="h-2 rounded" style={{ background: '#2a2a2a', width: '70%' }} />
      <div className="h-1.5 rounded" style={{ background: '#1c1c1c', width: '45%' }} />
      <div className="flex gap-1.5 mt-0.5">
        <div className="h-5 w-9 rounded" style={{ background: '#f97316' }} />
        <div className="h-5 flex-1 rounded border" style={{ background: '#111', borderColor: '#2a2a2a' }} />
      </div>
    </div>
  )
}

function LightPreview() {
  return (
    <div className="h-16 p-2 flex flex-col gap-1.5" style={{ background: '#f8f8f8' }}>
      <div className="h-2 rounded" style={{ background: '#d1d5db', width: '70%' }} />
      <div className="h-1.5 rounded" style={{ background: '#e5e7eb', width: '45%' }} />
      <div className="flex gap-1.5 mt-0.5">
        <div className="h-5 w-9 rounded" style={{ background: '#f97316' }} />
        <div className="h-5 flex-1 rounded border" style={{ background: '#fff', borderColor: '#e5e7eb' }} />
      </div>
    </div>
  )
}

// ─── Shared components ────────────────────────────────────────────────────────

function Section({ label, children }) {
  return (
    <div>
      <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-2">{label}</p>
      <div className="bg-[#111] border border-[#2a2a2a] rounded-xl overflow-hidden divide-y divide-[#2a2a2a]">
        {children}
      </div>
    </div>
  )
}

function ToggleRow({ label, sub, on, onToggle }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white">{label}</p>
        {sub && <p className="text-xs text-[#6b7280] mt-0.5">{sub}</p>}
      </div>
      <Toggle on={on} onToggle={onToggle} />
    </div>
  )
}

function AccountRow({ label, value, valueColor }) {
  return (
    <button className="w-full flex items-center justify-between px-4 py-3 active:opacity-70 transition-opacity">
      <span className="text-sm font-medium text-white">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm" style={{ color: valueColor || '#6b7280' }}>{value}</span>
        <svg className="w-4 h-4 text-[#4b5563] shrink-0" viewBox="0 0 24 24" fill="none">
          <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </button>
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
