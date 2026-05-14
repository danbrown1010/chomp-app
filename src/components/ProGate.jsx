import { useAppStore } from '../store/index'

export function ProGate({ feature, children }) {
  const { isPro } = useAppStore()
  console.log('ProGate isPro:', isPro, 'feature:', feature)

  if (isPro) return children

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      padding: '40px 32px',
      background: 'var(--bg-primary)',
      textAlign: 'center',
    }}>
      {/* Icon */}
      <div style={{
        width: 64, height: 64, borderRadius: 20,
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 20,
      }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
          stroke="var(--accent)" strokeWidth="1.75"
          strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0110 0v4"/>
        </svg>
      </div>

      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>
        PRO FEATURE
      </div>

      <div style={{ fontFamily: 'var(--font-body)', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>
        {feature}
      </div>

      <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 280, marginBottom: 32 }}>
        Upgrade to VELA PRO to unlock {feature} and all AI-powered expedition features.
      </div>

      <button
        style={{
          padding: '13px 28px', borderRadius: 14,
          background: 'var(--accent)', border: 'none',
          color: '#fff', fontFamily: 'var(--font-body)',
          fontSize: 15, fontWeight: 700, cursor: 'pointer',
          letterSpacing: '0.02em',
        }}
        onClick={() => alert('Stripe billing coming soon — stay tuned!')}
      >
        Upgrade to PRO
      </button>

      <div style={{ marginTop: 16, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-tertiary)', letterSpacing: '0.06em' }}>
        VELA PRO · BILLED MONTHLY
      </div>
    </div>
  )
}
