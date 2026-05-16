import { IconHome, IconMap, IconFlame, IconSignal, IconMore, IconPaw } from './icons'
import { useAppStore } from '../store/index'

export default function BottomNav({ active, onChange }) {
  const { accent, pendingInviteCount, petsEnabled } = useAppStore()

  const tabs = [
    { id: 'home',   label: 'Home',   Icon: IconHome   },
    { id: 'trip',   label: 'Trip',   Icon: IconMap    },
    { id: 'safety', label: 'Safety', Icon: IconFlame  },
    { id: 'rig',    label: 'Rig',    Icon: IconSignal },
    ...(petsEnabled ? [{ id: 'pets', label: 'Pets', Icon: IconPaw }] : []),
    { id: 'more',   label: 'More',   Icon: IconMore   },
  ]

  return (
    <nav style={{ display: 'flex', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', flexShrink: 0, paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {tabs.map(({ id, label, Icon }) => {
        const isActive = active === id
        return (
          <button
            key={id}
            onClick={() => { if (navigator.vibrate) navigator.vibrate(10); onChange(id) }}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-2 min-h-[56px] transition-colors"
            style={{ color: isActive ? accent : 'var(--text-tertiary)', fontFamily: 'var(--font-body)' }}
          >
            <div style={{ position: 'relative', display: 'inline-flex' }}>
              <Icon className="w-6 h-6" />
              {id === 'more' && pendingInviteCount > 0 && (
                <div style={{
                  position: 'absolute', top: -2, right: -2,
                  width: 16, height: 16, borderRadius: '50%',
                  background: 'var(--accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 9, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-mono)',
                }}>
                  {pendingInviteCount}
                </div>
              )}
            </div>
            <span className="text-[10px] font-medium tracking-wide">{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
