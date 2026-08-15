const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const LOGIN_URL = 'https://lysandreaprogramme.vercel.app/login'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { clienteId, clienteEmail, clientePrenom } = await req.json()

    if (!clienteEmail || !clientePrenom) {
      return new Response(
        JSON.stringify({ error: 'clienteEmail et clientePrenom sont requis' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    const resendKey = Deno.env.get('RESEND_API_KEY')
    if (!resendKey) {
      console.warn('[notify-cliente-programme-pret] RESEND_API_KEY manquant — email non envoyé')
      return new Response(
        JSON.stringify({ sent: false }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    const text = `${clientePrenom}, ton programme personnalisé est prêt.

On commence ce travail ensemble — et il est important qu'on puisse l'ajuster au fil des semaines pour que tu en profites pleinement, à sa juste valeur.

N'hésite pas à m'écrire dès la fin de ta première semaine s'il y a des ajustements à faire. C'est pour ça que je suis disponible sur WhatsApp.

On prévoit aussi un petit appel à la fin de ta 4ème semaine pour faire le point ensemble et ajuster la suite si besoin.

Connecte-toi dès maintenant pour découvrir ta première semaine :
${LOGIN_URL}

À très vite.
— Lysa 🌿`

    const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#F5F0E8;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F0E8;padding:48px 24px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:560px;background:#FDFAF6;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,.06);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#3D4F3C 0%,#4d6349 100%);padding:40px 48px 36px;text-align:center;">
              <p style="margin:0 0 4px;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:rgba(245,240,232,.6);">Lysa Andréa · Déclic</p>
              <h1 style="margin:0;font-size:28px;font-weight:400;color:#F5F0E8;letter-spacing:-.01em;line-height:1.2;">Ton programme est prêt 🌿</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 48px;">
              <p style="margin:0 0 20px;font-size:16px;color:#5C4A35;line-height:1.7;">
                <strong>${clientePrenom}</strong>, ton programme personnalisé est prêt.
              </p>
              <p style="margin:0 0 20px;font-size:15px;color:#8B7355;line-height:1.8;">
                On commence ce travail ensemble — et il est important qu'on puisse l'ajuster au fil des semaines pour que tu en profites pleinement, à sa juste valeur.
              </p>
              <p style="margin:0 0 20px;font-size:15px;color:#8B7355;line-height:1.8;">
                N'hésite pas à m'écrire dès la fin de ta première semaine s'il y a des ajustements à faire. C'est pour ça que je suis disponible sur WhatsApp.
              </p>
              <p style="margin:0 0 36px;font-size:15px;color:#8B7355;line-height:1.8;">
                On prévoit aussi un petit appel à la fin de ta 4ème semaine pour faire le point ensemble et ajuster la suite si besoin.
              </p>
              <p style="margin:0 0 36px;font-size:15px;color:#8B7355;line-height:1.8;">
                Connecte-toi dès maintenant pour découvrir ta première semaine :
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 36px;">
                <tr>
                  <td align="center" style="background:#3D4F3C;border-radius:10px;">
                    <a href="${LOGIN_URL}"
                       style="display:inline-block;padding:16px 40px;font-family:'Georgia',serif;font-size:15px;font-weight:400;color:#F5F0E8;text-decoration:none;letter-spacing:.02em;">
                      Accéder à mon espace →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:15px;color:#8B7355;line-height:1.8;">
                À très vite.<br>
                <span style="font-style:italic;color:#5C4A35;">— Lysa 🌿</span>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 48px;border-top:1px solid #E8DDD0;text-align:center;">
              <p style="margin:0;font-size:11px;color:#C4B5A0;letter-spacing:.04em;">
                Lysa Andréa · Coaching sportif &amp; émotionnel · <a href="https://lysaandrea.com" style="color:#C4B5A0;">lysaandrea.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        from:    'Lysa Andréa <hello@lysaandrea.com>',
        to:      [clienteEmail],
        subject: 'Ton programme Déclic est prêt 🌿',
        text,
        html,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Resend error: ${err}`)
    }

    console.log(`[notify-cliente-programme-pret] email envoyé à ${clienteEmail} (cliente ${clienteId})`)
    return new Response(
      JSON.stringify({ sent: true }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  } catch (err) {
    console.error('[notify-cliente-programme-pret] erreur:', err.message)
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  }
})
