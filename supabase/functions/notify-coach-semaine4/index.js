const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { prenom, clienteId } = await req.json()
    if (!prenom || !clienteId) {
      return new Response(JSON.stringify({ error: 'prenom and clienteId are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    const resendKey = Deno.env.get('RESEND_API_KEY')
    if (!resendKey) {
      console.log('[notify-coach-semaine4] RESEND_API_KEY missing — email not sent')
      return new Response(JSON.stringify({ sent: false }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    const profileUrl = `https://lysandreaprogramme.vercel.app/coach/cliente/${clienteId}`

    const text = `${prenom} vient d'entamer sa semaine 4 — pense à caler son appel de suivi.

${profileUrl}`

    const html = `
      <p><strong>${prenom}</strong> vient d'entamer sa semaine 4 — pense à caler son appel de suivi.</p>
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
        subject: `📞 ${prenom} entame sa semaine 4`,
        text,
        html,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Resend error: ${err}`)
    }

    console.log(`[notify-coach-semaine4] email sent for cliente ${clienteId}`)
    return new Response(JSON.stringify({ sent: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  } catch (err) {
    console.error('[notify-coach-semaine4] error:', err.message)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }
})
