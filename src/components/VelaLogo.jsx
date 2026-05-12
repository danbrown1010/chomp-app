export function VelaLogo({ size = 32 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="15" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.6" />
        <path d="M10 22L13 15l2 3 1.5-2L19 22H10z" fill="#C4521A" />
        <path d="M8 22L11 16l2 2.5L15 22H8z" fill="currentColor" opacity="0.8" />
        <path d="M14 22L17 16l3 6h-6z" fill="currentColor" opacity="0.6" />
        <path d="M13 22v3M19 22v3M13 25h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <span style={{
        fontFamily: 'var(--font-body)',
        fontWeight: 700,
        fontSize: size * 0.65,
        letterSpacing: '0.08em',
        color: 'currentColor',
      }}>
        VELA
      </span>
    </div>
  )
}
