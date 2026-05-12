const STYLES = {
  safe:     { bg: 'rgba(74,124,63,0.15)',  border: '#4A7C3F', color: '#4A7C3F' },
  advisory: { bg: 'rgba(196,82,26,0.12)',  border: '#C4521A', color: '#C4521A' },
  warn:     { bg: 'rgba(196,82,26,0.20)',  border: '#C4521A', color: '#C4521A' },
  danger:   { bg: 'rgba(139,46,46,0.15)',  border: '#8B2E2E', color: '#C4521A' },
  monitor:  { bg: 'rgba(45,74,45,0.20)',   border: '#4A7C3F', color: '#4A7C3F' },
  linked:   { bg: 'rgba(74,124,63,0.15)',  border: '#4A7C3F', color: '#4A7C3F' },
  off:      { bg: 'rgba(107,125,94,0.10)', border: '#6B7D5E', color: '#6B7D5E' },
}

export function StatusBadge({ status, label, dot = true }) {
  const s = STYLES[status] ?? STYLES.monitor
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      background: s.bg,
      border: `1px solid ${s.border}`,
      borderRadius: 20,
      padding: '3px 10px',
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      fontWeight: 700,
      color: s.color,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      whiteSpace: 'nowrap',
    }}>
      {dot && (
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
      )}
      {label}
    </div>
  )
}
