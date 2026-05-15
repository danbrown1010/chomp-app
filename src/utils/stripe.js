const CHECKOUT_FN = import.meta.env.VITE_SUPABASE_URL + '/functions/v1/create-checkout-session'

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
      successUrl: `${window.location.origin}?upgraded=true`,
      cancelUrl:  `${window.location.origin}?cancelled=true`,
    }),
  })

  const data = await res.json()
  if (data.error) throw new Error(data.error)

  window.location.href = data.url
}
