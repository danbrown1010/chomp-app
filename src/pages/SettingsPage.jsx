import { useState } from 'react'
import { useAppStore } from '../store/index'


// ─── Constants ────────────────────────────────────────────────────────────────

const ACCENTS = [
  '#C4521A', // terra-cotta (default)
  '#3b82f6', // blue
  '#4A7C3F', // forest green
  '#a855f7', // purple
  '#d97706', // amber
  '#94a3b8', // slate
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage({ onBack }) {
  const { accent, setAccent, theme, setTheme } = useAppStore()

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

  const toggleTrip  = (k) => setTripToggles(p  => ({ ...p,  [k]: !p[k]  }))
  const toggleNotif = (k) => setNotifToggles(p => ({ ...p, [k]: !p[k] }))

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 flex flex-col gap-5" style={{ paddingBottom: 'calc(32px + env(safe-area-inset-bottom))' }}>

        {/* Header */}
        <div style={{ paddingTop: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={onBack}
            style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', flexShrink: 0 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--text-primary)' }}>
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h1 style={{ fontFamily: 'var(--font-body)', fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>Settings</h1>
        </div>

        {/* ── Appearance ─────────────────────────────────────────────────────── */}
        <Section label="Appearance">

          {/* Theme cards */}
          <div className="px-4 py-3 flex flex-col gap-3">
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Theme</p>
            <div className="flex gap-3">
              <ThemeCard
                label="Dark"
                selected={theme === 'dark'}
                onSelect={() => setTheme('dark')}
                preview={<DarkPreview />}
              />
              <ThemeCard
                label="Light"
                selected={theme === 'light'}
                onSelect={() => setTheme('light')}
                preview={<LightPreview />}
              />
            </div>
          </div>

          {/* Accent swatches */}
          <div className="px-4 py-3 flex items-center justify-between">
            <p className="text-sm font-medium text-[var(--text-primary)]">Accent color</p>
            <div className="flex items-center gap-2">
              {ACCENTS.map(c => (
                <button
                  key={c}
                  onClick={() => setAccent(c)}
                  className="w-6 h-6 rounded-full transition-transform active:scale-90"
                  style={{
                    background: c,
                    boxShadow: accent === c ? `0 0 0 2px var(--bg-primary), 0 0 0 4px ${c}` : 'none',
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
          <AccountRow label="Subscription"      value="Pro" valueColor="var(--accent)" />
          <AccountRow label="Connected apps"    value="OnX, Gaia GPS" />
          <button className="w-full flex items-center px-4 py-3 active:opacity-70 transition-opacity">
            <span className="text-sm font-semibold" style={{ color: 'var(--danger)' }}>Sign out</span>
          </button>
        </Section>

        {/* ── About ───────────────────────────────────────────────────────────── */}
        <Section label="About">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-[var(--text-secondary)]">Version</span>
            <span className="text-sm font-medium text-[var(--text-primary)]">0.1.0 — Phase 3 build</span>
          </div>
          <a
              href="https://danbrown1010.github.io/chomp-docs"
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-between px-4 py-3 active:opacity-70 transition-opacity"
            >
              <span className="text-sm font-medium text-[var(--text-primary)]">Knowledge base</span>
              <svg className="w-4 h-4 text-[var(--text-tertiary)]" viewBox="0 0 24 24" fill="none">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
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
      style={{ borderColor: selected ? accent : 'var(--border)' }}
    >
      {preview}
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{ background: label === 'Light' ? '#E8E4D9' : '#1C2117' }}
      >
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', color: label === 'Light' ? '#1C2117' : '#F0EDE4' }}>{label}</span>
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
    <div className="h-16 p-2 flex flex-col gap-1.5" style={{ background: '#1C2117' }}>
      <div className="h-2 rounded" style={{ background: '#3A4A32', width: '70%' }} />
      <div className="h-1.5 rounded" style={{ background: '#242B1E', width: '45%' }} />
      <div className="flex gap-1.5 mt-0.5">
        <div className="h-5 w-9 rounded" style={{ background: '#C4521A' }} />
        <div className="h-5 flex-1 rounded border" style={{ background: '#2A3323', borderColor: '#3A4A32' }} />
      </div>
    </div>
  )
}

function LightPreview() {
  return (
    <div className="h-16 p-2 flex flex-col gap-1.5" style={{ background: '#E8E4D9' }}>
      <div className="h-2 rounded" style={{ background: '#C8C3B5', width: '70%' }} />
      <div className="h-1.5 rounded" style={{ background: '#DDD8CC', width: '45%' }} />
      <div className="flex gap-1.5 mt-0.5">
        <div className="h-5 w-9 rounded" style={{ background: '#C4521A' }} />
        <div className="h-5 flex-1 rounded border" style={{ background: '#F0EDE4', borderColor: '#C8C3B5' }} />
      </div>
    </div>
  )
}

// ─── Shared components ────────────────────────────────────────────────────────

function Section({ label, children }) {
  return (
    <div>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{label}</p>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }} className="divide-y divide-[var(--border)]">
        {children}
      </div>
    </div>
  )
}

function ToggleRow({ label, sub, on, onToggle }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--text-primary)]">{label}</p>
        {sub && <p className="text-xs text-[var(--text-secondary)] mt-0.5">{sub}</p>}
      </div>
      <Toggle on={on} onToggle={onToggle} />
    </div>
  )
}

function AccountRow({ label, value, valueColor }) {
  return (
    <button className="w-full flex items-center justify-between px-4 py-3 active:opacity-70 transition-opacity">
      <span className="text-sm font-medium text-[var(--text-primary)]">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm" style={{ color: valueColor || 'var(--text-secondary)' }}>{value}</span>
        <svg className="w-4 h-4 text-[var(--text-tertiary)] shrink-0" viewBox="0 0 24 24" fill="none">
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
      style={{ background: on ? accent : 'var(--border)' }}
    >
      <div
        className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200"
        style={{ transform: on ? 'translateX(22px)' : 'translateX(2px)' }}
      />
    </div>
  )
}
