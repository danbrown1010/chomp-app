import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useAuth() {
  // undefined = still loading, null = no session, object = authenticated
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signInWithGoogle = () =>
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })

  const signOut = () => supabase.auth.signOut()

  const user = session?.user ?? null

  // isPro: driven by user app_metadata once billing is wired up.
  // For now everyone is non-pro. Check user.app_metadata.plan === 'pro'
  // after Supabase billing/webhook sets it.
  const isPro = true // TODO: restore → user?.app_metadata?.plan === 'pro'

  return {
    session,
    user,
    isPro,
    signInWithGoogle,
    signOut,
    loading: session === undefined,
  }
}
