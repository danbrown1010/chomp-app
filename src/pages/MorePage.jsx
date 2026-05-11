import { useState } from 'react'

// ─── Nav config ───────────────────────────────────────────────────────────────

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
      { id: 'gear',   title: 'Gear & Packing', sub: 'Checklists, fish & game', icon: IconBackpack },
      { id: 'meals',  title: 'Meal Planning',  sub: 'AI off-grid meals',       icon: IconUtensils },
      { id: 'pets',   title: 'Pets',           sub: 'Care, food, vets',        icon: IconPaw      },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { id: 'survival',   title: 'Survival Agent', sub: 'AI wilderness expert',  icon: IconShield, pro: true },
      { id: 'knowledge',  title: 'Knowledge Base', sub: 'Manuals, RAG search',   icon: IconBook,   pro: true },
      { id: 'campbot',    title: 'Campsite Bot',   sub: 'Availability alerts',   icon: IconBell,   pro: true },
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MorePage() {
  const [view, setView] = useState('more')

  if (view === 'settings') return <SettingsPlaceholder onBack={() => setView('more')} />

  const handleTap = (id) => {
    if (id === 'settings') setView('settings')
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 flex flex-col gap-5 pb-6">
        <div className="pt-2">
          <h1 className="text-2xl font-bold tracking-tight">More</h1>
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
                onTap={() => handleTap(item.id)}
              />
            ))}
          </Section>
        ))}
      </div>
    </div>
  )
}

// ─── Settings placeholder ─────────────────────────────────────────────────────

function SettingsPlaceholder({ onBack }) {
  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 flex flex-col gap-4 pb-6">
        <div className="pt-2 flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1c1c1c] border border-[#2a2a2a] active:opacity-70 transition-opacity"
          >
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        </div>
        <div className="flex-1 flex items-center justify-center py-20">
          <p className="text-sm text-[#4b5563]">Settings coming in Phase 4</p>
        </div>
      </div>
    </div>
  )
}

// ─── Section ──────────────────────────────────────────────────────────────────

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

// ─── Row ──────────────────────────────────────────────────────────────────────

function ItemRow({ title, sub, Icon, pro, onTap }) {
  return (
    <button
      onClick={onTap}
      className="w-full flex items-center gap-3 px-4 py-3 text-left active:opacity-70 transition-opacity"
    >
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-[#1c1c1c] border border-[#2a2a2a]">
        <Icon className="w-[18px] h-[18px] text-[#9ca3af]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white">{title}</p>
        <p className="text-xs text-[#6b7280]">{sub}</p>
      </div>
      {pro ? (
        <span className="shrink-0 text-[10px] font-bold text-white px-2 py-0.5 rounded-full" style={{ background: '#f97316' }}>
          PRO
        </span>
      ) : (
        <svg className="w-4 h-4 text-[#4b5563] shrink-0" viewBox="0 0 24 24" fill="none">
          <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconCalendar({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="18" height="17" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <path d="M3 9h18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M8 2v3M16 2v3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M7 13h2M11 13h2M15 13h2M7 17h2M11 17h2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

function IconPeople({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="7" r="3" stroke="currentColor" strokeWidth="1.75" />
      <path d="M3 20c0-3.31 2.69-6 6-6s6 2.69 6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <circle cx="17" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M21 20c0-2.76-1.79-5.11-4.27-5.82" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function IconStar({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
    </svg>
  )
}

function IconBackpack({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect x="5" y="8" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <path d="M9 8V6a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M8 14h8M12 11v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function IconUtensils({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M7 2v6c0 1.66 1.34 3 3 3v11" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M7 2v4M10 2v4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M17 2c0 0 0 8-3 9v9" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

function IconPaw({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <circle cx="7"  cy="7"  r="1.8" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17" cy="7"  r="1.8" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="5"  cy="12" r="1.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="19" cy="12" r="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 10c-3 0-6 2.5-5 6.5C7.5 19.5 9.5 21 12 21s4.5-1.5 5-4.5C18 12.5 15 10 12 10z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
    </svg>
  )
}

function IconShield({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M12 2L4 6v6c0 5.25 3.5 9.74 8 11 4.5-1.26 8-5.75 8-11V6L12 2z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconBook({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M4 4h7a2 2 0 012 2v13a1.5 1.5 0 00-1.5-1.5H4V4z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
      <path d="M20 4h-7a2 2 0 00-2 2v13a1.5 1.5 0 011.5-1.5H20V4z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
    </svg>
  )
}

function IconBell({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

function IconFolder({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
    </svg>
  )
}

function IconWifi({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M5 12.55a11 11 0 0114.08 0" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M1.42 9a16 16 0 0121.16 0" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M8.53 16.11a6 6 0 016.95 0" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <circle cx="12" cy="20" r="1.2" fill="currentColor" />
    </svg>
  )
}

function IconCog({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.75" />
      <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}
