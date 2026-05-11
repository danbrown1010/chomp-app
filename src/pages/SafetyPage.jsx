export default function SafetyPage() {
  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 gap-4">
      <div className="pt-2">
        <h1 className="text-2xl font-bold tracking-tight">Safety</h1>
        <p className="text-sm text-[#6b7280] mt-0.5">Conditions, fire, and emergency info</p>
      </div>

      <StatusRow label="Burn ban" value="No restriction" ok />
      <StatusRow label="AQI" value="14 · Good" ok />
      <StatusRow label="Fire weather watch" value="None active" ok />

      <Section title="Emergency">
        <ActionRow label="SOS — SPOT / inReach" sub="Trigger satellite SOS" accent />
        <ActionRow label="Nearest emergency vet" sub="Find closest clinic" />
        <ActionRow label="Escape route" sub="Pre-loaded GPX exits" />
      </Section>

      <Section title="Weather">
        <ActionRow label="48h forecast" sub="Tap to expand" />
        <ActionRow label="Wind & precip map" sub="Requires connection" />
      </Section>
    </div>
  )
}

function StatusRow({ label, value, ok = false, warn = false }) {
  const color = warn ? '#f97316' : ok ? '#22c55e' : '#6b7280'
  return (
    <div className="bg-[#111] border border-[#2a2a2a] rounded-xl px-4 py-3 flex items-center justify-between">
      <span className="text-sm text-[#9ca3af]">{label}</span>
      <span className="text-sm font-semibold" style={{ color }}>{value}</span>
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

function ActionRow({ label, sub, accent = false }) {
  return (
    <button className="w-full flex items-center justify-between px-4 py-3 text-left active:bg-[#1c1c1c] transition-colors">
      <div>
        <div className={`text-sm font-medium ${accent ? 'text-[#f97316]' : 'text-white'}`}>{label}</div>
        <div className="text-xs text-[#6b7280]">{sub}</div>
      </div>
      <svg className="w-4 h-4 text-[#6b7280]" viewBox="0 0 24 24" fill="none">
        <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}
