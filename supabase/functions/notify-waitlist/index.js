import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL'),
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
      { auth: { persistSession: false } }
    )

    // Fetch only unnotified entries
    const { data: rows, error: fetchError } = await supabase
      .from('waitlist')
      .select('id, email')
      .is('notified', false)

    if (fetchError) throw fetchError

    const resendKey = Deno.env.get('RESEND_API_KEY')
    if (!resendKey) throw new Error('RESEND_API_KEY not configured')

    let sent = 0
    const failed = []

    for (const row of rows) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Lysa Andréa <hello@lysaandrea.com>',
            to: [row.email],
            subject: "C'est ouvert 🌿",
            text: `Le moment est arrivé.

Déclic — mon programme 8 semaines — est officiellement ouvert.

Tu t'étais inscrite pour être prévenue, alors voilà : c'est maintenant.

Découvrir le programme → https://lysaandrea.com/vente

Places limitées à 10, prix beta à 179€ pour les 8 semaines.

À très vite.
— Lysa 🌿`,
            html: `
              <p>Le moment est arrivé.</p>
              <p><strong>Déclic</strong> — mon programme 8 semaines — est officiellement ouvert.</p>
              <p>Tu t'étais inscrite pour être prévenue, alors voilà : c'est maintenant.</p>
              <p style="margin: 32px 0;">
                <a href="https://lysaandrea.com/vente"
                   style="background:#2d5a27;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-size:16px;">
                  Découvrir le programme →
                </a>
              </p>
              <p>Places limitées à 10, prix beta à <strong>179€</strong> pour les 8 semaines.</p>
              <p>À très vite.<br>— Lysa 🌿</p>
            `,
          }),
        })

        if (!res.ok) {
          const err = await res.text()
          throw new Error(`Resend: ${err}`)
        }

        // Mark as notified immediately after successful send
        await supabase
          .from('waitlist')
          .update({ notified: true })
          .eq('id', row.id)

        sent++
      } catch (err) {
        console.error(`[notify-waitlist] failed for ${row.email}:`, err.message)
        failed.push(row.email)
      }
    }

    console.log(`[notify-waitlist] sent=${sent} failed=${failed.length}`)
    return new Response(JSON.stringify({ sent, failed }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('[notify-waitlist] error:', err.message)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
