import { useState } from 'react'

export function BrandLogo({ url, name, size = 14, style = {} }) {
  const [failed, setFailed] = useState(false)

  if (!url || failed) {
    return (
      <div style={{
        width: size + 2,
        height: size + 2,
        borderRadius: '50%',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.55,
        color: 'var(--text-tertiary)',
        fontFamily: 'var(--font-body)',
        fontWeight: 600,
        flexShrink: 0,
        ...style,
      }}>
        {name?.charAt(0)?.toUpperCase() ?? '?'}
      </div>
    )
  }

  return (
    <img
      src={url}
      alt={name}
      onError={() => setFailed(true)}
      style={{
        width: size,
        height: size,
        borderRadius: 3,
        objectFit: 'contain',
        background: 'rgba(255,255,255,0.08)',
        padding: 1,
        flexShrink: 0,
        ...style,
      }}
    />
  )
}
