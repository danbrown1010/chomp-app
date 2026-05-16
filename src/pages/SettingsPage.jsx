import { useState, useEffect } from 'react'
import { IconChevronLeft, IconChevronRight, IconCheck } from '../components/icons'
import { useAppStore } from '../store/index'
import { saveAnthropicKey, clearAnthropicKey, hasAnthropicKey } from '../utils/secretsManager'
import { UserAvatar } from '../components/UserAvatar'
import { getFirstName } from '../utils/userHelpers'
import { StatusBadge } from '../components/StatusBadge'

const CONNECTED_APPS = [
  { id: 'onx',      title: 'OnX Offroad', sub: 'Maps & route planning'  },
  { id: 'gaia',     title: 'Gaia GPS',    sub: 'Topo + satellite layers' },
  { id: 'ecoflow',  title: 'EcoFlow',     sub: 'Power station telemetry' },
  { id: 'starlink', title: 'Starlink',    sub: 'Satellite internet'      },
]


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

export default function SettingsPage({ onBack, onNavigateTab }) {
  const [subPage, setSubPage] = useState(null)
  const { accent, setAccent, theme, setTheme, user, profile, isPro, signOut, petsEnabled, setPetsEnabled } = useAppStore()

  if (subPage === 'connectedApps') return <ConnectedAppsPage onBack={() => setSubPage(null)} onNavigateTab={onNavigateTab} />

  const [keySet, setKeySet]           = useState(() => !!localStorage.getItem('vela-anthropic-key'))
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [keySaving, setKeySaving]     = useState(false)
  const [toast, setToast]             = useState('')

  useEffect(() => {
    hasAnthropicKey(user?.id).then(setKeySet)
  }, [user?.id])

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const handleSaveKey = async () => {
    if (!apiKeyInput.trim().startsWith('sk-ant-') || !user?.id) return
    setKeySaving(true)
    try {
      const success = await saveAnthropicKey(apiKeyInput.trim(), user.id)
      if (success) {
        setKeySet(true)
        setApiKeyInput('')
        showToast('AI features enabled ✓')
      } else {
        showToast('Failed to save key — try again')
      }
    } finally {
      setKeySaving(false)
    }
  }

  const handleClearKey = async () => {
    await clearAnthropicKey(user?.id)
    setKeySet(false)
    showToast('API key removed')
  }

  const [updateFrequency, setUpdateFrequency] = useState(
    () => localStorage.getItem('vela-position-frequency') ?? 'standard'
  )

  const handleFrequency = (id) => {
    setUpdateFrequency(id)
    localStorage.setItem('vela-position-frequency', id)
  }

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
            <IconChevronLeft style={{ width: 16, height: 16, color: 'var(--text-primary)' }} />
          </button>
          <h1 style={{ fontFamily: 'var(--font-body)', fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>Settings</h1>
        </div>

        {/* ── Account ─────────────────────────────────────────────────────────── */}
        <Section label="Account">
          {/* Profile header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
            <UserAvatar profile={profile} user={user} size={48} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-body)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {profile?.name || user?.user_metadata?.full_name || 'User'}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-tertiary)', fontFamily: 'var(--font-body)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email}
              </div>
              <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: profile?.plan === 'pro' ? 'var(--accent)' : 'var(--text-tertiary)', marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {profile?.plan === 'pro' ? '● PRO' : '● FREE'}
              </div>
            </div>
          </div>
          <AccountRow label="Vehicle profiles"  value="2014 Jeep JKU — Chomp" />
          <AccountRow label="Household"         value={`${getFirstName(profile, user, 'You')} + Emily`} />
          <AccountRow label="Subscription"      value={profile?.plan === 'pro' ? 'Pro' : 'Free'} valueColor={profile?.plan === 'pro' ? 'var(--accent)' : undefined} />
          <AccountRow label="Connected apps" value="OnX, Gaia GPS" onTap={() => setSubPage('connectedApps')} />
          {isPro && (
            <button
              className="w-full flex items-center justify-between px-4 py-3 active:opacity-70 transition-opacity"
              onClick={() => window.open('https://billing.stripe.com/p/login/5kQ9AT2zygVuf4ZfOzaAw00', '_blank')}
            >
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 14, color: 'var(--text-primary)', fontFamily: 'var(--font-body)', fontWeight: 500 }}>Manage subscription</div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', fontFamily: 'var(--font-body)', marginTop: 1 }}>Billing · Cancel · Receipts</div>
              </div>
              <IconChevronRight style={{ width: 16, height: 16, color: 'var(--text-tertiary)', flexShrink: 0 }} />
            </button>
          )}
          <button
            className="w-full flex items-center px-4 py-3 active:opacity-70 transition-opacity"
            onClick={async () => {
              console.log('Sign out clicked')
              await signOut()
              console.log('Sign out complete')
            }}
          >
            <span className="text-sm font-semibold" style={{ color: 'var(--danger)' }}>Sign out</span>
          </button>
        </Section>

        {/* ── App Features ────────────────────────────────────────────────────── */}
        <Section label="App Features">
          <ToggleRow
            label="Pet companion"
            sub="Trail profiles for your dogs"
            on={petsEnabled}
            onToggle={() => setPetsEnabled(!petsEnabled)}
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

        {/* ── Trip Lifecycle ──────────────────────────────────────────────────── */}
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

        {/* ── Trip Sharing ────────────────────────────────────────────────────── */}
        <Section label="Trip Sharing">
          <div className="px-4 py-3 flex flex-col gap-3">
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Position update frequency</p>
            {[
              { id: 'battery', label: 'Battery saver', sub: 'Every 5 minutes', proOnly: false },
              { id: 'standard', label: 'Standard', sub: 'Every 60 seconds', proOnly: false },
              { id: 'live', label: 'Live', sub: 'Every 10 seconds · PRO', proOnly: true },
            ].map(opt => {
              const selected = updateFrequency === opt.id
              const disabled = opt.proOnly && !isPro
              return (
                <button
                  key={opt.id}
                  onClick={() => !disabled && handleFrequency(opt.id)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 12px', borderRadius: 10, textAlign: 'left',
                    border: `1px solid ${selected ? accent : 'var(--border)'}`,
                    background: selected ? `${accent}18` : 'var(--bg-secondary)',
                    cursor: disabled ? 'default' : 'pointer',
                    opacity: disabled ? 0.5 : 1,
                  }}
                >
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{opt.label}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 1 }}>{opt.sub}</p>
                  </div>
                  {selected && (
                    <IconCheck style={{ width: 16, height: 16, flexShrink: 0, color: accent }} />
                  )}
                </button>
              )
            })}
          </div>
        </Section>

        {/* ── AI Configuration ────────────────────────────────────────────────── */}
        <Section label="AI Configuration">
          <div className="px-4 py-3 flex flex-col gap-3">
            {toast && (
              <div style={{
                padding: '8px 12px', borderRadius: 8,
                background: toast.includes('✓') ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.1)',
                border: `1px solid ${toast.includes('✓') ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                fontSize: 12, fontFamily: 'var(--font-body)',
                color: toast.includes('✓') ? '#22c55e' : '#f87171',
              }}>
                {toast}
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">Anthropic API key</p>
                <p style={{ fontSize: 11, color: keySet ? '#22c55e' : 'var(--text-tertiary)', marginTop: 2 }}>
                  {keySet ? 'Configured' : 'Not configured'}
                </p>
              </div>
              {keySet && (
                <button
                  onClick={handleClearKey}
                  style={{
                    fontSize: 12, padding: '5px 12px', borderRadius: 20,
                    border: '1px solid var(--border)', background: 'transparent',
                    color: '#ef4444', fontFamily: 'var(--font-body)', cursor: 'pointer',
                  }}
                >
                  Clear
                </button>
              )}
            </div>
            {!keySet && (
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="password"
                  placeholder="sk-ant-..."
                  value={apiKeyInput}
                  onChange={e => setApiKeyInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSaveKey()}
                  style={{
                    flex: 1, background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)', borderRadius: 10,
                    padding: '9px 12px', color: 'var(--text-primary)',
                    fontFamily: 'var(--font-mono)', fontSize: 13, outline: 'none',
                  }}
                />
                <button
                  onClick={handleSaveKey}
                  disabled={!apiKeyInput.trim().startsWith('sk-ant-') || keySaving}
                  style={{
                    padding: '9px 16px', borderRadius: 10, border: 'none',
                    background: apiKeyInput.trim().startsWith('sk-ant-') && !keySaving ? accent : 'var(--border)',
                    color: apiKeyInput.trim().startsWith('sk-ant-') && !keySaving ? '#fff' : 'var(--text-tertiary)',
                    fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
                    cursor: apiKeyInput.trim().startsWith('sk-ant-') && !keySaving ? 'pointer' : 'default',
                    flexShrink: 0, transition: 'background 0.15s',
                  }}
                >
                  {keySaving ? 'Saving…' : 'Save API Key'}
                </button>
              </div>
            )}
          </div>
        </Section>

        {/* ── Appearance ─────────────────────────────────────────────────────── */}
        <Section label="Appearance">
          <div className="px-4 py-3 flex flex-col gap-3">
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Theme</p>
            <div className="flex gap-3">
              <ThemeCard label="Dark"  selected={theme === 'dark'}  onSelect={() => setTheme('dark')}  preview={<DarkPreview />}  />
              <ThemeCard label="Light" selected={theme === 'light'} onSelect={() => setTheme('light')} preview={<LightPreview />} />
            </div>
          </div>
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
              <IconChevronRight style={{ width: 16, height: 16, color: 'var(--text-tertiary)' }} />
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
          <IconCheck style={{ width: 14, height: 14, color: accent }} />
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
  const [open, setOpen] = useState(false)
  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center justify-between"
        style={{ marginBottom: open ? 8 : 0, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</p>
        <IconChevronRight style={{ width: 14, height: 14, color: 'var(--text-tertiary)', flexShrink: 0, transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
      </button>
      {open && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }} className="divide-y divide-[var(--border)]">
          {children}
        </div>
      )}
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

function AccountRow({ label, value, valueColor, onTap }) {
  return (
    <button onClick={onTap} className="w-full flex items-center justify-between px-4 py-3 active:opacity-70 transition-opacity">
      <span className="text-sm font-medium text-[var(--text-primary)]">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm" style={{ color: valueColor || 'var(--text-secondary)' }}>{value}</span>
        <IconChevronRight style={{ width: 16, height: 16, color: 'var(--text-tertiary)', flexShrink: 0 }} />
      </div>
    </button>
  )
}

// ─── Connected Apps sub-page ──────────────────────────────────────────────────

const STARLINK_PROXY = import.meta.env.VITE_STARLINK_PROXY ?? null

function ConnectedAppsPage({ onBack, onNavigateTab }) {
  const [starlinkSheet, setStarlinkSheet] = useState(false)

  const handleTap = (id) => {
    if (id === 'onx')      window.open('https://www.onxmaps.com/offroad/app', '_blank')
    if (id === 'gaia')     window.open('https://www.gaiagps.com', '_blank')
    if (id === 'ecoflow')  onNavigateTab?.('rig')
    if (id === 'starlink') setStarlinkSheet(true)
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 flex flex-col gap-5" style={{ paddingBottom: 'calc(32px + env(safe-area-inset-bottom))' }}>
        <div style={{ paddingTop: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={onBack}
            style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', flexShrink: 0 }}
          >
            <IconChevronLeft style={{ width: 16, height: 16, color: 'var(--text-primary)' }} />
          </button>
          <h1 style={{ fontFamily: 'var(--font-body)', fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>Connected Apps</h1>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
          {CONNECTED_APPS.map((app, i) => (
            <button
              key={app.id}
              onClick={() => handleTap(app.id)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 16px', width: '100%', textAlign: 'left',
                borderBottom: i < CONNECTED_APPS.length - 1 ? '1px solid var(--border)' : 'none',
                cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
                background: 'transparent',
              }}
              className="active:opacity-70 transition-opacity"
            >
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}>{app.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2, fontFamily: 'var(--font-body)' }}>{app.sub}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <StatusBadge status="linked" label="LINKED" dot={false} />
                <IconChevronRight style={{ width: 16, height: 16, color: 'var(--text-tertiary)' }} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Starlink bottom sheet */}
      {starlinkSheet && (
        <div
          onClick={() => setStarlinkSheet(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ width: '100%', background: 'var(--bg-card)', borderRadius: '20px 20px 0 0', border: '1px solid var(--border)', borderBottom: 'none', padding: '24px 20px', paddingBottom: 'calc(24px + env(safe-area-inset-bottom))' }}
          >
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border)', margin: '0 auto 20px' }} />
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-body)', marginBottom: 4 }}>Starlink</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', marginBottom: 20 }}>Satellite internet · connection info</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>Status</span>
                <StatusBadge status={STARLINK_PROXY ? 'linked' : 'danger'} label={STARLINK_PROXY ? 'CONNECTED' : 'OFFLINE'} dot={false} />
              </div>

              {STARLINK_PROXY && (
                <div style={{ padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: 10, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Proxy URL</div>
                  <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', wordBreak: 'break-all' }}>{STARLINK_PROXY}</div>
                </div>
              )}

              {!STARLINK_PROXY && (
                <div style={{ padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: 10, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>To enable proxy</div>
                  <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', lineHeight: 1.7 }}>
                    1. Connect to Starlink network{'\n'}
                    2. Run the proxy on your laptop{'\n'}
                    3. Set VITE_STARLINK_PROXY in .env
                  </div>
                </div>
              )}

              <button
                onClick={() => window.open('https://www.starlink.com', '_blank')}
                style={{ width: '100%', padding: '12px', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-primary)', fontSize: 14, fontFamily: 'var(--font-body)', fontWeight: 500, cursor: 'pointer', textAlign: 'center' }}
                className="active:opacity-70 transition-opacity"
              >
                starlink.com →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
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
