const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { clienteId, clienteName } = await req.json()
    if (!clienteId || !clienteName) {
      return new Response(JSON.stringify({ error: 'clienteId and clienteName are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    const resendKey = Deno.env.get('RESEND_API_KEY')
    if (!resendKey) {
      console.log('[notify-coach-questionnaire] RESEND_API_KEY missing — email not sent')
      return new Response(JSON.stringify({ sent: false }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    const profileUrl = `https://lysandreaprogramme.vercel.app/coach/cliente/${clienteId}`

    const text = `${clienteName} vient de compléter son questionnaire de démarrage.

Va jeter un œil dans ta vue coach pour le lire et préparer son programme.

${profileUrl}`

    const html = `
      <p>${clienteName} vient de compléter son questionnaire de démarrage.</p>
      <p>Va jeter un œil dans ta vue coach pour le lire et préparer son programme.</p>
      <p style="margin: 32px 0;">
        <a href="${profileUrl}"
           style="background:#2d5a27;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-size:16px;">
          Voir son profil →
        </a>
      </p>
    `

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Lysa Andréa <hello@lysaandrea.com>',
        to: ['lysaandreacoaching@gmail.com'],
        subject: 'Nouveau questionnaire complété 🌿',
        text,
        html,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Resend error: ${err}`)
    }

    console.log(`[notify-coach-questionnaire] email sent for cliente ${clienteId}`)
    return new Response(JSON.stringify({ sent: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  } catch (err) {
    console.error('[notify-coach-questionnaire] error:', err.message)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }
})
