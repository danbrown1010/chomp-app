import { StatusBadge } from '../components/StatusBadge'
import { useAppStore } from '../store/index'
import { UserAvatar } from '../components/UserAvatar'

const CONNECTED = [
  { id: 'onx',       title: 'OnX Offroad',    sub: 'Maps & route planning' },
  { id: 'gaia',      title: 'Gaia GPS',        sub: 'Topo + satellite layers' },
  { id: 'ecoflow',   title: 'EcoFlow',          sub: 'Power station telemetry' },
  { id: 'starlink',  title: 'Starlink',         sub: 'Satellite internet' },
]

const SECTIONS = [
  {
    label: 'Expedition',
    items: [
      { id: 'reservations', title: 'Reservations',  sub: 'Camps, hotels, Airbnb',       icon: IconCalendar },
      { id: 'groups',       title: 'Trip Groups',   sub: 'Partners & convoy',            icon: IconPeople   },
      { id: 'badges',       title: 'Badges',        sub: 'Your trail record',            icon: IconStar     },
    ],
  },
  {
    label: 'Gear & Prep',
    items: [
      { id: 'gear',  title: 'Gear & Packing', sub: 'Checklists, fish & game', icon: IconBackpack },
      { id: 'meals', title: 'Meal Planning',  sub: 'AI off-grid meals',       icon: IconUtensils },
      { id: 'pets',  title: 'Pets',           sub: 'Care, food, vets',        icon: IconPaw      },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { id: 'survival',  title: 'Survival Agent', sub: 'AI wilderness expert',  icon: IconShield, pro: true },
      { id: 'knowledge', title: 'Knowledge Base', sub: 'Manuals, RAG search',   icon: IconBook,   pro: true },
      { id: 'campbot',   title: 'Campsite Bot',   sub: 'Availability alerts',   icon: IconBell,   pro: true },
    ],
  },
  {
    label: 'Admin',
    items: [
      { id: 'docs',     title: 'Travel Documents', sub: 'Insurance, permits',        icon: IconFolder },
      { id: 'comms',    title: 'Comms & Network',  sub: 'Starlink, hotspots, radio', icon: IconWifi   },
      { id: 'settings', title: 'Settings',         sub: 'Appearance, account',       icon: IconCog    },
    ],
  },
]

export default function MorePage({ onNavigate }) {
  const { user, profile } = useAppStore()
  const displayName = profile?.name || user?.user_metadata?.full_name || user?.email || 'User'
  const isPro = profile?.plan === 'pro'

  return (
    <div style={{ height: '100%', overflowY: 'auto' }}>
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 'calc(24px + env(safe-area-inset-bottom))' }}>

        {/* Profile row */}
        <div style={{ paddingTop: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <UserAvatar profile={profile} user={user} size={44} />
              <div>
                <p style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>{displayName}</p>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{user?.email}</p>
              </div>
            </div>
            <StatusBadge status="safe" label="PRO" />
          </div>
        </div>

        {/* Vehicle profile */}
        <div>
          <SectionLabel>Vehicle</SectionLabel>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 17H3V9l3-5h10l3 5v8h-2" />
                <path d="M5 9h14" />
                <circle cx="7.5" cy="17.5" r="2.5" />
                <circle cx="16.5" cy="17.5" r="2.5" />
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>2014 Jeep JKU · Chomp</p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2, letterSpacing: '0.04em' }}>PRIMARY RIG · URSA MINOR</p>
            </div>
            <StatusBadge status="safe" label="READY" dot={false} />
          </div>
        </div>

        {/* Connected services */}
        <div>
          <SectionLabel>Connected</SectionLabel>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
            {CONNECTED.map((s, i) => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: i < CONNECTED.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{s.title}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{s.sub}</p>
                </div>
                <StatusBadge status="linked" label="LINKED" dot={false} />
              </div>
            ))}
          </div>
        </div>

        {SECTIONS.map(s => (
          <Section key={s.label} label={s.label}>
            {s.items.map(item => (
              <ItemRow
                key={item.id}
                title={item.title}
                sub={item.sub}
                Icon={item.icon}
                pro={item.pro}
                onTap={() => onNavigate && onNavigate(item.id)}
              />
            ))}
          </Section>
        ))}
      </div>
    </div>
  )
}

function SectionLabel({ children }) {
  return (
    <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{children}</p>
  )
}

function Section({ label, children }) {
  return (
    <div>
      <SectionLabel>{label}</SectionLabel>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  )
}

function ItemRow({ title, sub, Icon, pro, onTap }) {
  return (
    <button
      onClick={onTap}
      className="w-full text-left active:opacity-70 transition-opacity"
      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid var(--border)' }}
    >
      <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon className="w-[18px] h-[18px]" style={{ color: 'var(--text-secondary)' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{title}</p>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{sub}</p>
      </div>
      {pro ? (
        <StatusBadge status="advisory" label="PRO" dot={false} />
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--text-tertiary)', flexShrink: 0 }}>
          <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconCalendar({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 9h18M8 2v3M16 2v3M7 13h2M11 13h2M15 13h2M7 17h2M11 17h2" strokeLinecap="round" />
    </svg>
  )
}
function IconPeople({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <circle cx="9" cy="7" r="3" /><path d="M3 20c0-3.31 2.69-6 6-6s6 2.69 6 6" strokeLinecap="round" /><circle cx="17" cy="8" r="2.5" strokeWidth="1.5" /><path d="M21 20c0-2.76-1.79-5.11-4.27-5.82" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
function IconStar({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}
function IconBackpack({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <rect x="5" y="8" width="14" height="13" rx="2" /><path d="M9 8V6a3 3 0 016 0v2M8 14h8M12 11v6" strokeLinecap="round" />
    </svg>
  )
}
function IconUtensils({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
      <path d="M7 2v6c0 1.66 1.34 3 3 3v11M7 2v4M10 2v4M17 2c0 0 0 8-3 9v9" />
    </svg>
  )
}
function IconPaw({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="7" cy="7" r="1.8" /><circle cx="17" cy="7" r="1.8" /><circle cx="5" cy="12" r="1.5" strokeWidth="1.5" /><circle cx="19" cy="12" r="1.5" strokeWidth="1.5" /><path d="M12 10c-3 0-6 2.5-5 6.5C7.5 19.5 9.5 21 12 21s4.5-1.5 5-4.5C18 12.5 15 10 12 10z" strokeWidth="1.75" strokeLinejoin="round" />
    </svg>
  )
}
function IconShield({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round">
      <path d="M12 2L4 6v6c0 5.25 3.5 9.74 8 11 4.5-1.26 8-5.75 8-11V6L12 2z" /><path d="M9 12l2 2 4-4" strokeLinecap="round" />
    </svg>
  )
}
function IconBook({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round">
      <path d="M4 4h7a2 2 0 012 2v13a1.5 1.5 0 00-1.5-1.5H4V4z" /><path d="M20 4h-7a2 2 0 00-2 2v13a1.5 1.5 0 011.5-1.5H20V4z" />
    </svg>
  )
}
function IconBell({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  )
}
function IconFolder({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round">
      <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
    </svg>
  )
}
function IconWifi({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
      <path d="M5 12.55a11 11 0 0114.08 0M1.42 9a16 16 0 0121.16 0M8.53 16.11a6 6 0 016.95 0" /><circle cx="12" cy="20" r="1.2" fill="currentColor" />
    </svg>
  )
}
function IconCog({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
      <circle cx="12" cy="12" r="3" /><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  )
}
