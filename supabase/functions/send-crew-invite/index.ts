const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, content-type, x-client-info, apikey',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Parse body safely
  let body
  try {
    const text = await req.text()
    console.log('Raw body:', text)
    body = JSON.parse(text)
  } catch (err) {
    console.error('Body parse error:', err)
    return new Response(
      JSON.stringify({ error: 'Invalid JSON body', details: err.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { inviteeEmail, inviteeName, pilotName, crewName, role, inviteId, isGuest, crewPassword } = body

  console.log('Sending invite email to:', inviteeEmail)
  console.log('Crew:', crewName)
  console.log('Role:', role)
  console.log('RESEND_API_KEY set:', !!Deno.env.get('RESEND_API_KEY'))

  if (!inviteeEmail) {
    return new Response(
      JSON.stringify({ error: 'inviteeEmail is required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY not set')
    return new Response(
      JSON.stringify({ error: 'Email service not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const appUrl = `https://app.vela-go.com${inviteId ? `?invite=${inviteId}` : ''}`
  const roleLabel = role === 'copilot' ? 'Copilot' : 'Observer'
  const watchUrl = crewPassword
    ? `https://vela-go.com/watch?pw=${encodeURIComponent(crewPassword)}`
    : 'https://vela-go.com/watch'

  const observerBlock = isGuest && crewPassword ? `
    <div style="background:#1C2117;border:1px solid #3A4A32;border-radius:10px;padding:16px;margin:16px 0;text-align:center;">
      <div style="font-size:11px;color:#6B7D5E;font-family:monospace;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px;">Your crew password</div>
      <div style="font-size:28px;font-weight:700;color:#F0EDE4;font-family:monospace;letter-spacing:0.15em;margin-bottom:12px;">${crewPassword}</div>
      <div style="font-size:13px;color:#A8B89A;margin-bottom:12px;">Go to vela-go.com/watch and enter this password to watch the crew.</div>
      <a href="${watchUrl}" style="display:inline-block;background:#C4521A;color:#ffffff;text-decoration:none;padding:10px 24px;border-radius:8px;font-size:14px;font-weight:600;">Open watch page →</a>
    </div>` : ''

  const ctaBlock = isGuest ? observerBlock : `
    <a href="${appUrl}" style="display:block;background:#C4521A;color:#fff;text-align:center;text-decoration:none;padding:14px 24px;border-radius:10px;font-size:15px;font-weight:700;margin-bottom:24px;letter-spacing:0.01em;">
      Open VELA &amp; Accept Invite
    </a>
    <p style="font-size:12px;color:#6B7D5E;margin:0;line-height:1.6;">
      If you don't have a VELA account yet,
      <a href="https://app.vela-go.com" style="color:#C4521A;">sign up free</a>
      and the invite will be waiting for you.
    </p>`

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#1C2117;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:480px;margin:0 auto;padding:32px 24px;">

    <div style="margin-bottom:24px;">
      <span style="font-size:13px;font-weight:700;letter-spacing:0.12em;color:#C4521A;text-transform:uppercase;">VELA Expedition Intelligence</span>
    </div>

    <h1 style="font-size:24px;font-weight:700;color:#F0EDE4;margin:0 0 8px;">
      ${isGuest ? "You've been added as a crew observer" : "You've been invited to join a crew"}
    </h1>

    <p style="font-size:15px;color:#A8B89A;margin:0 0 24px;line-height:1.6;">
      <strong style="color:#F0EDE4;">${pilotName}</strong> has added you to watch
      <strong style="color:#F0EDE4;">${crewName}</strong> as an
      <strong style="color:#C4521A;">Observer</strong>.
      No account required — you can watch their live position when a trip goes active.
    </p>

    <div style="background:#2A3323;border:1px solid #3A4A32;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
      <div style="font-size:11px;font-weight:700;letter-spacing:0.1em;color:#6B7D5E;text-transform:uppercase;margin-bottom:8px;">Crew details</div>
      <div style="font-size:16px;font-weight:700;color:#F0EDE4;margin-bottom:4px;">${crewName}</div>
      <div style="font-size:12px;color:#C4521A;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;">● ${roleLabel}</div>
    </div>

    ${ctaBlock}

  </div>
</body>
</html>`

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'VELA <noreply@vela-go.com>',
        to: [inviteeEmail],
        subject: `${pilotName} invited you to join ${crewName} on VELA`,
        html,
      }),
    })

    const resBody = await res.json()
    console.log('Resend response:', res.status, JSON.stringify(resBody))

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: 'Email send failed', details: resBody }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, id: resBody.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('Resend fetch error:', err)
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
