import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYSTEM_PROMPT = `Tu es Lysa Andréa, coach sportif spécialisée dans l'accompagnement des femmes qui ont un rapport difficile à leur corps.
Tu dois analyser le questionnaire d'une nouvelle cliente et générer :
1. Un profil résumé (ses blocages, son profil émotionnel, le ton à adopter, ses forces)
2. Un programme sport 8 semaines adapté à son niveau, sa fréquence, son matériel et ses zones à éviter
3. 3 questions de bilan du soir personnalisées pour elle

Réponds UNIQUEMENT en JSON valide avec cette structure exacte :
{
  "profil_resume": "string",
  "programme": [
    {
      "semaine": 1,
      "theme": "string",
      "intention": "string",
      "jours": [
        {
          "jour": 1,
          "nom": "string",
          "duree": 45,
          "type": "string",
          "intention": "string",
          "exercices": [
            {
              "nom": "string",
              "series": 3,
              "reps": "string",
              "repos": "string",
              "charge_notes": "",
              "commentaire": "",
              "fait": false
            }
          ]
        }
      ]
    }
  ],
  "questions_personnalisees": [
    { "question": "string", "placeholder": "string" },
    { "question": "string", "placeholder": "string" },
    { "question": "string", "placeholder": "string" }
  ]
}

Le programme doit avoir exactement 8 semaines. Chaque semaine doit avoir des jours de séance adaptés à la fréquence indiquée par la cliente (les jours sans séance peuvent avoir duree:0 et exercices vides avec un type "repos"). Génère des exercices réalistes et progressifs semaine par semaine.`

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { clienteData, clienteId } = await req.json()

    if (!clienteId) {
      return new Response(
        JSON.stringify({ error: 'clienteId manquant' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!anthropicKey) {
      return new Response(
        JSON.stringify({ error: 'ANTHROPIC_API_KEY non configurée dans les secrets Supabase' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('[generate-programme] Appel Anthropic pour cliente:', clienteId)

    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 8192,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `Voici le questionnaire complet de la nouvelle cliente :\n\n${JSON.stringify(clienteData, null, 2)}`,
          },
        ],
      }),
    })

    if (!anthropicRes.ok) {
      const err = await anthropicRes.json().catch(() => ({}))
      throw new Error(err?.error?.message ?? `Erreur Anthropic (${anthropicRes.status})`)
    }

    const anthropicData = await anthropicRes.json()
    const text: string = anthropicData.content?.[0]?.text ?? ''
    console.log('[generate-programme] Réponse reçue — longueur:', text.length)

    let jsonText = text.trim()
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
    }

    let result
    try {
      result = JSON.parse(jsonText)
    } catch {
      const match = jsonText.match(/\{[\s\S]*\}/)
      if (!match) throw new Error('Réponse IA invalide — JSON non trouvé')
      result = JSON.parse(match[0])
    }

    console.log('[generate-programme] JSON parsé ✓ — semaines:', result.programme?.length ?? 0)

    // Sauvegarde avec la clé service (contourne RLS)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { error: dbError } = await supabase
      .from('ai_programmes')
      .upsert(
        {
          cliente_id:               clienteId,
          profil_resume:            result.profil_resume,
          programme:                result.programme,
          questions_personnalisees: result.questions_personnalisees,
          statut:                   'en_attente',
          generated_at:             new Date().toISOString(),
        },
        { onConflict: 'cliente_id' }
      )

    if (dbError) {
      console.error('[generate-programme] Erreur Supabase:', dbError)
      throw new Error(dbError.message)
    }

    console.log('[generate-programme] Programme sauvegardé ✓')

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('[generate-programme] ERREUR:', err?.message ?? err)
    return new Response(
      JSON.stringify({ error: err?.message ?? 'Erreur inconnue' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
