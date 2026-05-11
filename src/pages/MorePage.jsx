export default function MorePage() {
  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 gap-4">
      <div className="pt-2">
        <h1 className="text-2xl font-bold tracking-tight">More</h1>
      </div>

      <Section title="App">
        <ActionRow label="Community" sub="Trail reports from PNW overlanders" />
        <ActionRow label="Media log" sub="Shot log and post-trip sync" />
        <ActionRow label="Pet care" sub="Profiles, pack list, vet records" />
      </Section>

      <Section title="Settings">
        <ActionRow label="Profile" sub="Dan Brown · danbrown1010@gmail.com" />
        <ActionRow label="Household" sub="2 members" />
        <ActionRow label="Units & preferences" sub="Imperial" />
        <ActionRow label="Offline data" sub="Manage cached maps and data" />
      </Section>

      <Section title="About">
        <ActionRow label="Chomp" sub="v0.1.0 · Offline-first overlanding" />
      </Section>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div>
      <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-2">{title}</p>
      <div className="bg-[#111] border border-[#2a2a2a] rounded-xl overflow-hidden divide-y divide-[#2a2a2a]">
        {children}
      </div>
    </div>
  )
}

function ActionRow({ label, sub }) {
  return (
    <button className="w-full flex items-center justify-between px-4 py-3 text-left active:bg-[#1c1c1c] transition-colors">
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
