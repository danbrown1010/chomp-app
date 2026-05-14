export default function AuthPage({ onSignIn }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: 'calc(var(--vh, 1svh) * 100)',
      background: '#1C2117',
      padding: '32px 24px',
      paddingTop: 'calc(32px + env(safe-area-inset-top))',
      paddingBottom: 'calc(32px + env(safe-area-inset-bottom))',
      boxSizing: 'border-box',
    }}>

      {/* Logo */}
      <div style={{ marginBottom: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <svg width="80" height="80" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <rect width="100" height="100" rx="20" fill="#243020"/>
          <g fill="#F0EDE4">
            <path d="M50 5C41.7 5 35 11.7 35 20c0 11.5 15 28 15 28s15-16.5 15-28C65 11.7 58.3 5 50 5zM50 26c-3.3 0-6-2.7-6-6s2.7-6 6-6s6 2.7 6 6-2.7 6-6 6z"/>
            <path d="M2 92L30 38L45 63L38 73L53 92H2z"/>
            <path d="M98 92L70 45L55 65L62 75L47 92H98z"/>
            <path d="M46 92C46 92 47 78 50 70C53 62 57 59 55 52C53 45 49 48 49 48" fill="none" stroke="#1C2117" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round"/>
          </g>
        </svg>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 36, letterSpacing: '0.12em', color: '#F0EDE4' }}>
            VELA
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(240,237,228,0.45)', letterSpacing: '0.14em', marginTop: 6, textTransform: 'uppercase' }}>
            Go further
          </div>
        </div>
      </div>

      {/* Card */}
      <div style={{
        width: '100%',
        maxWidth: 340,
        background: 'rgba(240,237,228,0.06)',
        border: '1px solid rgba(240,237,228,0.12)',
        borderRadius: 20,
        padding: '28px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}>
        <div style={{ textAlign: 'center', marginBottom: 4 }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 17, fontWeight: 600, color: '#F0EDE4', marginBottom: 6 }}>
            Sign in to continue
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(240,237,228,0.5)', lineHeight: 1.5 }}>
            Your expedition companion for overlanding and off-grid adventure.
          </div>
        </div>

        {/* Google button */}
        <button
          onClick={onSignIn}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            width: '100%',
            padding: '13px 20px',
            borderRadius: 12,
            border: 'none',
            background: '#fff',
            color: '#1C2117',
            fontFamily: 'var(--font-body)',
            fontWeight: 600,
            fontSize: 15,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
          }}
        >
          <GoogleIcon />
          Continue with Google
        </button>
      </div>

      {/* Footer */}
      <div style={{ marginTop: 28, fontFamily: 'var(--font-body)', fontSize: 11, color: 'rgba(240,237,228,0.25)', textAlign: 'center', maxWidth: 280, lineHeight: 1.6 }}>
        By signing in you agree to our terms of service and privacy policy.
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
      <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
    </svg>
  )
}
