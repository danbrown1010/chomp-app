import { useState } from 'react'
import { redirectToCheckout } from '../utils/stripe'
import { useAppStore } from '../store/index'

export function ProGate({ children, feature }) {
  const { isPro, user } = useAppStore()
  const [loading, setLoading] = useState(null)

  if (isPro) return children

  const handleUpgrade = async (plan) => {
    setLoading(plan)
    try {
      const priceId = plan === 'monthly'
        ? import.meta.env.VITE_STRIPE_MONTHLY_PRICE_ID
        : import.meta.env.VITE_STRIPE_YEARLY_PRICE_ID
      await redirectToCheckout(priceId, user?.email, user?.id)
    } catch (err) {
      console.error('Checkout failed:', err)
      setLoading(null)
    }
  }

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 32,
      gap: 16,
      background: 'var(--bg-primary)',
    }}>
      {/* Lock icon */}
      <div style={{
        width: 64, height: 64, borderRadius: 20,
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.75"
          strokeLinecap="round" strokeLinejoin="round" style={{ width: 28, height: 28 }}>
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0110 0v4"/>
        </svg>
      </div>

      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        PRO FEATURE
      </div>

      <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-body)', textAlign: 'center' }}>
        {feature}
      </div>

      <div style={{ fontSize: 14, color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', textAlign: 'center', lineHeight: 1.6, maxWidth: 280 }}>
        {feature} is available on VELA PRO. Upgrade to unlock all AI features.
      </div>

      {/* What's included */}
      <div style={{
        width: '100%', maxWidth: 300,
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 12, padding: '12px 16px',
        display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        {[
          'Survival Agent — AI wilderness expert',
          'Knowledge Base — manual search',
          'AI Meal Planning',
          'Bulk gear import',
        ].map((f) => (
          <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--safe)" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, flexShrink: 0 }}>
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            {f}
          </div>
        ))}
      </div>

      {/* Pricing buttons */}
      <div style={{ width: '100%', maxWidth: 300, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button
          onClick={() => handleUpgrade('monthly')}
          disabled={loading !== null}
          style={{
            width: '100%', padding: '13px', borderRadius: 10, border: 'none',
            background: loading === 'monthly' ? 'var(--border)' : 'var(--accent)',
            color: '#fff', fontSize: 15, fontWeight: 600,
            fontFamily: 'var(--font-body)',
            cursor: loading !== null ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {loading === 'monthly' ? 'Loading…' : 'Upgrade · $4.99 / month'}
        </button>

        <button
          onClick={() => handleUpgrade('yearly')}
          disabled={loading !== null}
          style={{
            width: '100%', padding: '13px', borderRadius: 10,
            border: '1px solid var(--border)',
            background: 'var(--bg-card)', color: 'var(--text-primary)',
            fontSize: 14, fontWeight: 500, fontFamily: 'var(--font-body)',
            cursor: loading !== null ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {loading === 'yearly' ? 'Loading…' : '$39 / year — save 35%'}
        </button>
      </div>

      <div style={{ fontSize: 12, color: 'var(--text-tertiary)', fontFamily: 'var(--font-body)', textAlign: 'center' }}>
        Cancel anytime · Instant access
      </div>
    </div>
  )
}
