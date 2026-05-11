import { IconHome, IconMap, IconFlame, IconSignal, IconMore } from './icons'
import { useAppStore } from '../store/index'

const tabs = [
  { id: 'home',   label: 'Home',   Icon: IconHome },
  { id: 'trip',   label: 'Trip',   Icon: IconMap },
  { id: 'safety', label: 'Safety', Icon: IconFlame },
  { id: 'rig',    label: 'Rig',    Icon: IconSignal },
  { id: 'more',   label: 'More',   Icon: IconMore },
]

export default function BottomNav({ active, onChange }) {
  const { accent } = useAppStore()
  return (
    <nav
      className="flex items-stretch bg-[#111] border-t border-[#2a2a2a]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {tabs.map(({ id, label, Icon }) => {
        const isActive = active === id
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-2 min-h-[56px] transition-colors"
            style={{ color: isActive ? accent : '#6b7280' }}
          >
            <Icon className="w-6 h-6" />
            <span className="text-[10px] font-medium tracking-wide">{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
