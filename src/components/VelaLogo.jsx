export function VelaLogo({ size = 32, textShadow, transparent = false }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        {!transparent && <rect width="100" height="100" rx="20" fill="#1C2117"/>}
        <g fill="#F0EDE4">
          <path d="M50 5C41.7 5 35 11.7 35 20c0 11.5 15 28 15 28s15-16.5 15-28C65 11.7 58.3 5 50 5zM50 26c-3.3 0-6-2.7-6-6s2.7-6 6-6s6 2.7 6 6-2.7 6-6 6z"/>
          <path d="M2 92L30 38L45 63L38 73L53 92H2z"/>
          <path d="M98 92L70 45L55 65L62 75L47 92H98z"/>
          <path d="M46 92C46 92 47 78 50 70C53 62 57 59 55 52C53 45 49 48 49 48" fill="none" stroke="#1C2117" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round"/>
        </g>
      </svg>
      <span style={{
        fontFamily: 'var(--font-body)',
        fontWeight: 700,
        fontSize: size * 0.85,
        letterSpacing: '0.08em',
        color: 'currentColor',
        textShadow,
      }}>
        VELA
      </span>
    </div>
  )
}
