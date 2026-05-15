import { useState } from 'react'

export function UserAvatar({ profile, user, size = 32 }) {
  const [imgError, setImgError] = useState(false)

  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url

  const initials = (
    profile?.name ||
    user?.user_metadata?.full_name ||
    user?.email ||
    '?'
  )
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  if (avatarUrl && !imgError) {
    return (
      <img
        src={avatarUrl}
        alt={profile?.name ?? 'User'}
        onError={() => setImgError(true)}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          flexShrink: 0,
          border: '1.5px solid var(--border)',
        }}
      />
    )
  }

  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: 'var(--accent)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: Math.round(size * 0.35),
      fontWeight: 600,
      color: '#fff',
      fontFamily: 'var(--font-body)',
      flexShrink: 0,
      border: '1.5px solid var(--border)',
    }}>
      {initials}
    </div>
  )
}
