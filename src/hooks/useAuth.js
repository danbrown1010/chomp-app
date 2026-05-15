import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

async function checkAllowlist(email) {
  const { data, error } = await supabase
    .from('allowed_users')
    .select('email')
    .eq('email', email)
    .single()
  return !!data && !error
}

async function fetchProfile(userId, userMetadata) {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (data) {
    // Fall back to Google OAuth metadata if profile row has no avatar
    if (!data.avatar_url && userMetadata?.avatar_url) {
      data.avatar_url = userMetadata.avatar_url
    }
    if (!data.name && userMetadata?.full_name) {
      data.name = userMetadata.full_name
    }
    return data
  }

  // Profiles table row missing — synthesize from OAuth metadata
  return {
    id: userId,
    name: userMetadata?.full_name ?? null,
    avatar_url: userMetadata?.avatar_url ?? null,
    plan: null,
  }
}

export function useAuth() {
  const [user, setUser]             = useState(null)
  const [profile, setProfile]       = useState(null)
  const [loading, setLoading]       = useState(true)
  const [notAllowed, setNotAllowed] = useState(false)

  useEffect(() => {
    // Never stay loading more than 5 seconds
    const timeout = setTimeout(() => setLoading(false), 5000)

    // Resolve loading immediately from cached session
    supabase.auth.getSession()
      .then(async ({ data: { session } }) => {
        clearTimeout(timeout)
        if (session?.user) {
          setUser(session.user)
          fetchProfile(session.user.id, session.user.user_metadata)
            .then(setProfile)
            .catch(() => {})
        } else {
          setUser(null)
        }
        setLoading(false)
      })
      .catch(() => {
        clearTimeout(timeout)
        setLoading(false)
      })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null)
          setProfile(null)
          setNotAllowed(false)
          setLoading(false)
          return
        }

        if (session?.user) {
          try {
            const allowed = await checkAllowlist(session.user.email)
            if (!allowed) {
              await supabase.auth.signOut()
              setUser(null)
              setProfile(null)
              setNotAllowed(true)
              setLoading(false)
              return
            }
            setUser(session.user)
            setNotAllowed(false)
            fetchProfile(session.user.id, session.user.user_metadata)
              .then(setProfile)
              .catch(() => {})
          } catch (err) {
            console.error('Auth error:', err)
          } finally {
            setLoading(false)
          }
        } else {
          setUser(null)
          setProfile(null)
          setLoading(false)
        }
      }
    )

    return () => {
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [])

  const signInWithGoogle = async () => {
    const redirectTo = import.meta.env.DEV
      ? 'http://localhost:5173'
      : 'https://app.vela-go.com'

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    })
    if (error) console.error(error)
  }

  // Clear state immediately then tell Supabase — no page reload needed
  const signOut = async () => {
    setUser(null)
    setProfile(null)
    setLoading(false)
    await supabase.auth.signOut()
  }

  const isPro = profile?.plan === 'pro'

  return {
    user,
    profile,
    isPro,
    notAllowed,
    signInWithGoogle,
    signOut,
    loading,
  }
}
