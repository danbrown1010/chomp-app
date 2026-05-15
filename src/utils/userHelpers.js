export function getDisplayName(profile, user, fallback = 'Explorer') {
  return (
    profile?.name ||
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    fallback
  )
}

export function getFirstName(profile, user, fallback = 'there') {
  return getDisplayName(profile, user, fallback).split(' ')[0]
}

export function getInitials(profile, user) {
  return getDisplayName(profile, user)
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
