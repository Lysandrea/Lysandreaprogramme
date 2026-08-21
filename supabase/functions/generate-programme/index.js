import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYSTEM_PROMPT = `Tu es Lysa Andréa, coach sportif spécialisée dans l'accompagnement des femmes qui ont un rapport difficile à leur corps.
Tu dois analyser le questionnaire d'une nouvelle cliente et générer un programme complet et personnalisé :
1. Un profil résumé émotionnel (ses blocages, son profil émotionnel, le ton à adopter, ses forces)
2. 3 questions de bilan du soir personnalisées pour elle
3. Un programme périodisé de 8 semaines complet avec exercices détaillés pour chaque séance
4. Des conseils nutritionnels personnalisés

═══════════════════════════════════════════
PÉRIODISATION PAR OBJECTIF — APPLIQUE LA BONNE LOGIQUE
═══════════════════════════════════════════

Détermine l'objectif principal à partir du questionnaire (champ "objectifs", "nutrition.objectif_nutrition", etc.).

── SI OBJECTIF = PRISE DE MASSE / FORCE ──────────────────────
S1 : découverte des mouvements — charges légères à modérées, focus technique, 10-12 reps
S2 : charges de travail fixées, maîtrise des patterns — 10-12 reps identiques à S1
S3-S4 : MÊMES exercices qu'en S1-S2, surcharge progressive — charges augmentent, reps descendent légèrement (8-10 reps)
S5-S6 : NOUVEAU CYCLE — exercices changent complètement, 8-10 reps, charges plus élevées qu'en fin de S4
S7 : pic d'intensité — 6-8 reps, charge maximale du programme
S8 : déload actif — 8-10 reps, charge légèrement réduite mais intensité maintenue

── SI OBJECTIF = PERTE DE POIDS / RÉÉQUILIBRAGE CORPOREL ─────
Reps hautes tout au long du programme :
- Exercices polyarticulaires (squat, fente, soulevé, rowing) : 15-20 reps
- Exercices d'isolation (curl, élévations, extension) : 20-30 reps
Temps de repos réduits (1min ou moins) pour maintenir l'effet cardio.
Intégrer du cardio dans les séances : escaliers, marche inclinée, circuits.
Séances denses et courtes (30-40 min).
Double objectif explicite dans chaque séance : dépense calorique + construction musculaire.
Pas de vrai déload — maintenir l'intensité sur les 8 semaines, juste varier les exercices.

── SI OBJECTIF = HYBRIDE (course + muscu) / ENDURANCE / COMPÉTITION ──
1 à 2 séances de course par semaine selon la fréquence déclarée :
- Une séance endurance fondamentale (rythme conversationnel, 30-45 min)
- Une séance seuil (intervalles ou tempo, 20-35 min)
Séances de musculation : mélange force (6-10 reps) et volume (12-15 reps).
Adapte le ratio course/muscu selon ce qu'elle a déclaré dans son questionnaire.

═══════════════════════════════════════════
EXERCICES DE RÉFÉRENCE (à privilégier en priorité)
═══════════════════════════════════════════

Squat barre / guidé / gobelet, soulevé de terre barre / haltères, tractions / tirage poulie haute,
dips / développé couché haltères, rowing barre / haltère / poulie basse, leg extension, leg curl,
fentes avant / arrière / marchées, presse à cuisses, abducteur machine, adducteur machine,
développé militaire haltères / barre, élévations latérales haltères, curl biceps barre / haltères,
extension triceps poulie / haltère, gainage ventral / latéral, pompes.

Utiliser machines et barres guidées quand pertinent selon le matériel disponible.
Tu peux compléter avec d'autres mouvements cohérents, mais ces exercices sont la base — reviens-y en priorité.
Nomme toujours l'exercice précisément : "Squat barre guidée", "Rowing haltère unilatéral", pas juste "Squat".

═══════════════════════════════════════════
RÈGLE DES TEMPS DE REPOS — OBLIGATOIRE
═══════════════════════════════════════════

Utilise TOUJOURS des temps ronds en minutes :
- "1min", "1min30", "2min", "2min30", "3min"
- JAMAIS "45s", "60s", "90s" (sauf gainage tenu ou exercices très courts d'isolation légère)

Référence par type :
- Exercices polyarticulaires lourds (squat, soulevé, développé, tractions) → 2min
- Exercices composés moyens (fente, rowing, hip thrust) → 1min30
- Exercices d'isolation (curl, élévations, extension) → 1min
- Objectif perte de poids → 1min ou moins sur tous les exercices

═══════════════════════════════════════════
FRÉQUENCE ET DURÉE DES SÉANCES
═══════════════════════════════════════════

Le nombre de jours par semaine correspond EXACTEMENT à la fréquence déclarée.
Exemples : "3x" → 3 jours. "5x_plus" → 5 jours. "variable" → 4 jours par défaut.
Durée : plus la fréquence est haute, plus les séances sont courtes.
- Objectif perte de poids : 30-40 min par séance.
- Objectif prise de masse : 45-60 min par séance.
- Objectif hybride : 35-50 min (muscu) + durée de course selon programme.

═══════════════════════════════════════════
STRUCTURE JSON — Réponds UNIQUEMENT en JSON valide, rien d'autre
═══════════════════════════════════════════

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
      "theme": "string — MAX 8 mots",
      "intention": "string — MAX 12 mots",
      "jours": [
        {
          "jour": 1,
          "nom": "string (ex: Bas du corps — Force, Full body — Cardio)",
          "duree": 45,
          "type": "string (ex: Renforcement, Cardio, Mobilité, HIIT)",
          "intention": "string — MAX 10 mots",
          "exercices": [
            {
              "nom": "string (nom précis de l'exercice)",
              "series": 3,
              "reps": "string (ex: 12, 15-20, 6-8)",
              "repos": "string — toujours en minutes : 1min / 1min30 / 2min",
              "description": "",
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

═══════════════════════════════════════════
CONTRAINTES STRICTES
═══════════════════════════════════════════
- questions_personnalisees : exactement 3 questions.
- programme : exactement 8 objets (semaines 1 à 8).
- Chaque semaine : même nombre de jours, calé sur la fréquence déclarée.
- Chaque séance : 3 à 4 exercices (jamais moins, jamais plus).
- zones_eviter : ne JAMAIS inclure un exercice sollicitant une zone listée.
- Matériel : n'utilise que ce que la cliente déclare avoir.
- description, charge_notes, commentaire : toujours "" (chaînes vides). fait : toujours false.
- theme et intention (semaine ET jour) : courts — MAX 8-12 mots — pour éviter la troncature JSON.
- repos : toujours en format "Xmin" ou "XminY" — jamais en secondes sauf exception gainage.

CONSEILS NUTRITION — règles impératives :
- Bienveillant, jamais restrictif ni culpabilisant.
- Adapté à son objectif ET son profil émotionnel.
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
