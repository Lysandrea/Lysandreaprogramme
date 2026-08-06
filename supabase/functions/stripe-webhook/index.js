import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
}

// Stripe HMAC-SHA256 signature verification (no SDK needed)
async function verifyStripeSignature(rawBody, sigHeader, secret) {
  const parts = Object.fromEntries(sigHeader.split(',').map(p => {
    const idx = p.indexOf('=')
    return [p.slice(0, idx), p.slice(idx + 1)]
  }))
  const timestamp = parts['t']
  const v1 = parts['v1']
  if (!timestamp || !v1) throw new Error('Malformed Stripe-Signature header')

  const now = Math.floor(Date.now() / 1000)
  if (Math.abs(now - parseInt(timestamp)) > 300) throw new Error('Webhook timestamp too old (>5 min)')

  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sigBytes = await crypto.subtle.sign('HMAC', key, enc.encode(`${timestamp}.${rawBody}`))
  const computed = Array.from(new Uint8Array(sigBytes))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

  if (computed !== v1) throw new Error('Invalid Stripe signature')
}

async function sendWelcomeEmail(email, token) {
  const inscriptionUrl = `https://lysandreaprogramme.vercel.app/inscription?invite=${token}`
  const resendKey = Deno.env.get('RESEND_API_KEY')

  if (!resendKey) {
    // No email service configured yet — log what would be sent
    console.log('[EMAIL — not sent, RESEND_API_KEY missing]')
    console.log(`  To: ${email}`)
    console.log(`  Subject: Bienvenue dans Déclic 🌿`)
    console.log(`  Link: ${inscriptionUrl}`)
    return
  }

  const body = `Bienvenue dans Déclic.

Je suis vraiment contente de t'accompagner sur ces 8 semaines.

Clique sur le lien ci-dessous pour créer ton accès à la plateforme :

${inscriptionUrl}

Une fois ton compte créé, tu pourras remplir ton questionnaire de démarrage — prends le temps qu'il te faut, il n'y a pas de bonne ou mauvaise réponse, je le lis avec attention.

Une fois ton questionnaire complété, compte environ une semaine pour que je prépare ton programme personnalisé sur mesure — sport, émotionnel, et nutrition.

Si tu as la moindre question d'ici là, écris-moi directement sur WhatsApp : https://wa.me/33650947117

À très vite.
— Lysa 🌿`

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Lysa Andréa <hello@lysaandrea.com>',
      to: [email],
      subject: 'Bienvenue dans Déclic 🌿',
      text: body,
      html: `
        <p>Bienvenue dans <strong>Déclic</strong>.</p>
        <p>Je suis vraiment contente de t'accompagner sur ces 8 semaines.</p>
        <p>Clique sur le lien ci-dessous pour créer ton accès à la plateforme :</p>
        <p style="margin: 32px 0;">
          <a href="${inscriptionUrl}"
             style="background:#2d5a27;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-size:16px;">
            Créer mon accès →
          </a>
        </p>
        <p>Une fois ton compte créé, tu pourras remplir ton questionnaire de démarrage — prends le temps qu'il te faut, il n'y a pas de bonne ou mauvaise réponse, je le lis avec attention.</p>
        <p>Une fois ton questionnaire complété, compte environ une semaine pour que je prépare ton programme personnalisé sur mesure — sport, émotionnel, et nutrition.</p>
        <p>Si tu as la moindre question d'ici là, écris-moi directement sur WhatsApp : <a href="https://wa.me/33650947117">https://wa.me/33650947117</a></p>
        <p>À très vite.<br>— Lysa 🌿</p>
      `,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Resend error: ${err}`)
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    if (!webhookSecret) throw new Error('STRIPE_WEBHOOK_SECRET not configured')

    const sigHeader = req.headers.get('stripe-signature')
    if (!sigHeader) return new Response('Missing Stripe-Signature', { status: 400 })

    const rawBody = await req.text()
    await verifyStripeSignature(rawBody, sigHeader, webhookSecret)

    const event = JSON.parse(rawBody)

    if (event.type !== 'checkout.session.completed') {
      return new Response(JSON.stringify({ received: true, skipped: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const session = event.data.object
    const email = session.customer_details?.email ?? session.customer_email
    if (!email) throw new Error('No email found in checkout session')

    const token = crypto.randomUUID()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL'),
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
      { auth: { persistSession: false } }
    )

    const { error: insertError } = await supabase
      .from('invites')
      .insert({ email, token })
    if (insertError) throw insertError

    // Remove from waitlist if they were on it (they've converted)
    await supabase.from('waitlist').delete().eq('email', email)

    await sendWelcomeEmail(email, token)

    console.log(`[stripe-webhook] invite created for ${email}`)
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('[stripe-webhook] error:', err.message)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
