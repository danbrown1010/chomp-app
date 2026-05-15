const CHECKOUT_FN = import.meta.env.VITE_SUPABASE_URL + '/functions/v1/create-checkout-session'

const baseUrl = import.meta.env.DEV
  ? 'http://localhost:5173'
  : 'https://app.vela-go.com'

export async function redirectToCheckout(priceId, userEmail, userId) {
  const res = await fetch(CHECKOUT_FN, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      priceId,
      userEmail,
      userId,
      successUrl: `${baseUrl}?upgraded=true`,
      cancelUrl:  `${baseUrl}?cancelled=true`,
    }),
  })

  const data = await res.json()
  if (data.error) throw new Error(data.error)

  window.location.href = data.url
}
