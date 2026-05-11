const rigs = [
  { name: 'Nikon D850', type: 'DSLR', battery: 'EN-EL15c ×2', storage: 'CFexpress + XQD' },
  { name: 'Nikon D70s', type: 'DSLR', battery: 'EN-EL3e ×2', storage: 'CompactFlash' },
  { name: 'DJI Air 2s', type: 'Drone', battery: 'Flight ×3', storage: 'microSD' },
  { name: 'Insta360 Ace Pro 2', type: 'Action', battery: '1800mAh ×2', storage: 'microSD' },
  { name: 'Wolfbox G850 Pro', type: 'Dash cam', battery: 'Hardwired', storage: 'microSD' },
  { name: 'iPhone 17 Pro ×2', type: 'Mobile', battery: 'Built-in', storage: 'iCloud' },
]

export default function RigPage() {
  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 gap-4">
      <div className="pt-2">
        <h1 className="text-2xl font-bold tracking-tight">Rig</h1>
        <p className="text-sm text-[#6b7280] mt-0.5">Vehicle, kit, and maintenance</p>
      </div>

      <Section title="Camera kit">
        <div className="divide-y divide-[#2a2a2a]">
          {rigs.map((rig) => (
            <div key={rig.name} className="px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">{rig.name}</span>
                <span className="text-xs text-[#6b7280] bg-[#1c1c1c] px-2 py-0.5 rounded-full">{rig.type}</span>
              </div>
              <div className="mt-1 flex gap-4">
                <span className="text-xs text-[#6b7280]">{rig.battery}</span>
                <span className="text-xs text-[#6b7280]">{rig.storage}</span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Vehicle">
        <ActionRow label="Tire rotation log" sub="Next: 5,000 mi" />
        <ActionRow label="Oil change" sub="Next: 3,200 mi" />
        <ActionRow label="Fluid levels" sub="Last checked: Apr 28" />
        <ActionRow label="Recovery gear" sub="Pre-trip checklist" />
      </Section>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div>
      <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-2">{title}</p>
      <div className="bg-[#111] border border-[#2a2a2a] rounded-xl overflow-hidden">
        {children}
      </div>
    </div>
  )
}

function ActionRow({ label, sub }) {
  return (
    <button className="w-full flex items-center justify-between px-4 py-3 text-left active:bg-[#1c1c1c] transition-colors border-t border-[#2a2a2a] first:border-t-0">
      <div>
        <div className="text-sm font-medium text-white">{label}</div>
        <div className="text-xs text-[#6b7280]">{sub}</div>
      </div>
      <svg className="w-4 h-4 text-[#6b7280]" viewBox="0 0 24 24" fill="none">
        <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}
