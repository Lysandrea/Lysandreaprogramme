import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYSTEM_PROMPT = `Tu es Lysa Andréa, coach sportif spécialisée dans l'accompagnement des femmes qui ont un rapport difficile à leur corps.
Tu dois analyser le questionnaire d'une nouvelle cliente et générer :
1. Un profil résumé (ses blocages, son profil émotionnel, le ton à adopter, ses forces)
2. 3 questions de bilan du soir personnalisées pour elle
3. La semaine 1 du programme : 3 séances détaillées uniquement (pas les jours de repos)
4. Les semaines 2 à 8 en résumé uniquement (theme + intention, sans exercices)
5. Des conseils nutritionnels personnalisés

Réponds UNIQUEMENT en JSON valide avec cette structure exacte :
{
  "profil_resume": "string (3-4 phrases max)",
  "questions_personnalisees": [
    { "question": "string", "placeholder": "string" },
    { "question": "string", "placeholder": "string" },
    { "question": "string", "placeholder": "string" }
  ],
  "programme": [
    {
      "semaine": 1,
      "theme": "string",
      "intention": "string",
      "jours": [
        {
          "jour": 1,
          "nom": "string",
          "duree": 40,
          "type": "string",
          "intention": "string (1 phrase)",
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
    },
    {
      "semaine": 2,
      "theme": "string",
      "intention": "string",
      "jours": []
    }
  ],
  "conseils_nutrition": {
    "profil_resume": "string — 2-3 phrases sur son profil nutritionnel",
    "principes": ["string", "string", "string", "string", "string"],
    "repas_type": {
      "petit_dejeuner": "string",
      "dejeuner": "string",
      "diner": "string",
      "collation": "string"
    },
    "a_eviter": ["string", "string", "string"],
    "message_lysa": "string — message personnel de Lysa sur son rapport à la nourriture"
  }
}

CONTRAINTES STRICTES (respect du budget de tokens) :
- profil_resume : 3-4 phrases maximum.
- questions_personnalisees : exactement 3 questions, courtes.
- Semaine 1 : exactement 3 objets dans "jours" (les 3 séances, sans les jours de repos).
- Chaque séance de semaine 1 : 4 exercices maximum.
- Semaines 2 à 8 : uniquement "semaine", "theme", "intention" et "jours": []. Pas d'exercices.
- Le tableau "programme" contient exactement 8 objets (semaines 1 à 8).
- Sois concise. Chaque string doit être courte et précise.

CONSEILS NUTRITION — règles impératives :
- Bienveillant, jamais restrictif ni culpabilisant.
- Adapté à son objectif ET son profil émotionnel alimentaire.
- Pas de comptage de calories.
- Orientations générales, pas prescriptions médicales.
- Maximum 300 tokens pour toute la section conseils_nutrition.`

// Closes any open brackets/strings left by a truncated JSON response
function repairAndParseJson(text: string): unknown {
  let inString = false
  let escape = false
  const stack: string[] = []

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (escape)              { escape = false; continue }
    if (ch === '\\' && inString) { escape = true; continue }
    if (ch === '"')          { inString = !inString; continue }
    if (inString)            continue
    if (ch === '{')          stack.push('}')
    else if (ch === '[')     stack.push(']')
    else if (ch === '}' || ch === ']') stack.pop()
  }

  let repaired = text.trimEnd()
  // Close any open string literal
  if (inString) repaired += '"'
  // Close any remaining open objects / arrays
  repaired += stack.reverse().join('')
  return JSON.parse(repaired)
}

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
    const stopReason: string = anthropicData.stop_reason ?? 'unknown'
    const text: string = anthropicData.content?.[0]?.text ?? ''
    console.log('[generate-programme] Réponse reçue — longueur:', text.length, '— stop_reason:', stopReason)
    if (stopReason === 'max_tokens') {
      console.warn('[generate-programme] ATTENTION : réponse tronquée (max_tokens atteint)')
    }

    let jsonText = text.trim()
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
    }

    let result
    try {
      result = JSON.parse(jsonText)
    } catch (firstErr) {
      console.warn('[generate-programme] JSON.parse direct échoué, tentative de réparation…')
      // Try to extract the outermost {...} block first
      const match = jsonText.match(/\{[\s\S]*/)
      const candidate = match ? match[0] : jsonText
      try {
        result = repairAndParseJson(candidate)
        console.log('[generate-programme] JSON réparé ✓')
      } catch {
        throw new Error(`Réponse IA invalide — JSON non parsable: ${(firstErr as Error).message}`)
      }
    }

    console.log('[generate-programme] JSON parsé ✓ — semaines:', result.programme?.length ?? 0)

    // Sauvegarde avec la clé service (contourne RLS)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SERVICE_ROLE_KEY')!
    )

    const { error: dbError } = await supabase
      .from('ai_programmes')
      .upsert(
        {
          cliente_id:               clienteId,
          profil_resume:            result.profil_resume,
          programme:                result.programme,
          questions_personnalisees: result.questions_personnalisees,
          conseils_nutrition:       result.conseils_nutrition ?? null,
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
