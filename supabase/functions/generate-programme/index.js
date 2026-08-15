import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYSTEM_PROMPT = `Tu es Lysa Andréa, coach sportif spécialisée dans l'accompagnement des femmes qui ont un rapport difficile à leur corps.
Tu dois analyser le questionnaire d'une nouvelle cliente et générer un programme complet et personnalisé :
1. Un profil résumé émotionnel (ses blocages, son profil émotionnel, le ton à adopter, ses forces)
2. 3 questions de bilan du soir personnalisées pour elle
3. Un programme de 8 semaines complet avec exercices détaillés pour chaque séance
4. Des conseils nutritionnels personnalisés

Le nombre de jours par semaine doit correspondre à la fréquence d'entraînement déclarée par la cliente.
Exemple : si elle s'entraîne 3x/semaine → 3 objets dans "jours". Si 5x/semaine → 5 objets dans "jours".
Adapte la durée estimée (duree) en fonction de la fréquence : plus de séances = séances plus courtes.

Progression sur 8 semaines :
- Semaines 1-2 : Découverte et mise en route — charges légères, mouvements fondamentaux, priorité à la technique
- Semaines 3-4 : Consolidation — légère augmentation du volume ou des charges
- Semaines 5-6 : Intensification progressive — variantes plus exigeantes, moins de repos
- Semaines 7-8 : Pic et intégration — séances plus denses, retour réflexif en S8

Respecte ABSOLUMENT : le niveau déclaré, le matériel disponible, les zones_eviter (ne jamais solliciter une zone blessée ou problématique).

Réponds UNIQUEMENT en JSON valide avec cette structure exacte :
{
  "profil_resume": "string (3-4 phrases sur son profil émotionnel)",
  "questions_personnalisees": [
    { "question": "string", "placeholder": "string" },
    { "question": "string", "placeholder": "string" },
    { "question": "string", "placeholder": "string" }
  ],
  "programme": [
    {
      "semaine": 1,
      "theme": "string",
      "intention": "string (1 phrase)",
      "jours": [
        {
          "jour": 1,
          "nom": "string (ex: Séance A — Full body, Séance B — Bas du corps…)",
          "duree": 45,
          "type": "string (ex: renforcement, cardio, mobilité, HIIT)",
          "intention": "string (1 courte phrase motivante)",
          "exercices": [
            {
              "nom": "string (nom de l'exercice)",
              "series": 3,
              "reps": "string (ex: 12, 10-12, 30 sec)",
              "repos": "string (ex: 60 sec, 90 sec)",
              "charge_notes": "",
              "commentaire": "",
              "fait": false
            }
          ]
        }
      ]
    }
  ],
  "conseils_nutrition": {
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

CONTRAINTES STRICTES :
- questions_personnalisees : exactement 3 questions, courtes.
- Le tableau "programme" contient exactement 8 objets (semaines 1 à 8).
- Chaque semaine a le même nombre de jours, calé sur la fréquence déclarée de la cliente.
- Chaque séance a entre 4 et 5 exercices, avec nom, séries, reps et temps de repos réalistes et adaptés au niveau et matériel de la cliente.
- charge_notes et commentaire restent des chaînes vides "" (la coach les complète manuellement). fait est toujours false.
- Ne jamais inclure d'exercice sollicitant une zone listée dans zones_eviter.
- Sois précise sur les noms d'exercices (ex: "Squat gobelet", "Fente marchée", "Gainage ventral", pas juste "Squat").

CONSEILS NUTRITION — règles impératives :
- Bienveillant, jamais restrictif ni culpabilisant.
- Adapté à son objectif ET son profil émotionnel alimentaire.
- Pas de comptage de calories.
- Orientations générales, pas prescriptions médicales.`

// Closes any open brackets/strings left by a truncated JSON response
function repairAndParseJson(text) {
  let inString = false
  let escape = false
  const stack = []

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (escape) {
      escape = false
      continue
    }
    if (ch === '\\' && inString) {
      escape = true
      continue
    }
    if (ch === '"') {
      inString = !inString
      continue
    }
    if (inString) continue
    if (ch === '{') stack.push('}')
    else if (ch === '[') stack.push(']')
    else if (ch === '}' || ch === ']') stack.pop()
  }

  let repaired = text.trimEnd()
  if (inString) repaired += '"'
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
        max_tokens: 16000,
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
    const stopReason = anthropicData.stop_reason ?? 'unknown'
    const rawText = anthropicData.content?.[0]?.text ?? ''

    console.log('[generate-programme] Réponse reçue — longueur:', rawText.length, '— stop_reason:', stopReason)
    if (stopReason === 'max_tokens') {
      console.warn('[generate-programme] ATTENTION : réponse tronquée (max_tokens atteint)')
    }

    let jsonText = rawText.trim()
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
    }

    let result
    try {
      result = JSON.parse(jsonText)
    } catch (firstErr) {
      console.warn('[generate-programme] JSON.parse direct échoué, tentative de réparation…')
      const match = jsonText.match(/\{[\s\S]*/)
      const candidate = match ? match[0] : jsonText
      try {
        result = repairAndParseJson(candidate)
        console.log('[generate-programme] JSON réparé ✓')
      } catch {
        throw new Error(`Réponse IA invalide — JSON non parsable: ${firstErr.message}`)
      }
    }

    const programme = result.programme
    console.log('[generate-programme] JSON parsé ✓ — semaines:', programme?.length ?? 0)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL'),
      Deno.env.get('SERVICE_ROLE_KEY')
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
    const message = err instanceof Error ? err.message : 'Erreur inconnue'
    console.error('[generate-programme] ERREUR:', message)
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
