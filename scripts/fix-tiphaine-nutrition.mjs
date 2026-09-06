/**
 * Génère UNIQUEMENT les conseils_nutrition pour Tiphaine,
 * sans toucher à son programme existant (édité manuellement).
 *
 * Usage :
 *   SUPABASE_SERVICE_KEY=<key> ANTHROPIC_API_KEY=<key> node scripts/fix-tiphaine-nutrition.mjs
 */

import { createInterface } from 'readline'

const SUPABASE_URL = 'https://omcednuoxfmhyfwmrmmp.supabase.co'
const CLIENTE_ID   = 'f434f66c-75f8-482e-8ff5-6ecb3c92f768'
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_KEY
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY

if (!SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_KEY manquant.')
  process.exit(1)
}
if (!ANTHROPIC_KEY) {
  console.error('❌ ANTHROPIC_API_KEY manquant.')
  process.exit(1)
}

const authHeaders = {
  'apikey':        SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`,
  'Content-Type':  'application/json',
}

// ── 1. Vérifier l'état actuel ──────────────────────────────────────────────
console.log('1. Vérification du programme actuel de Tiphaine…')
const checkRes = await fetch(
  `${SUPABASE_URL}/rest/v1/ai_programmes?cliente_id=eq.${CLIENTE_ID}&select=id,statut,programme,conseils_nutrition`,
  { headers: authHeaders }
)
const checkRows = await checkRes.json()
if (!checkRows.length) {
  console.error('❌ Aucun ai_programme trouvé pour ce clienteId.')
  process.exit(1)
}

const existing = checkRows[0]
console.log('   statut             :', existing.statut)
console.log('   conseils_nutrition :', existing.conseils_nutrition ? '✓ déjà présent' : '✗ null — à générer')
console.log('   programme semaines :', (existing.programme ?? []).length)

if (existing.conseils_nutrition) {
  console.log('\n⚠️  conseils_nutrition est déjà présent. Continue quand même ? (ctrl+C pour annuler)')
}

// ── 2. Fetch intake_responses ──────────────────────────────────────────────
console.log('\n2. Récupération des réponses intake…')
const intakeRes = await fetch(
  `${SUPABASE_URL}/rest/v1/intake_responses?cliente_id=eq.${CLIENTE_ID}&select=reponses`,
  { headers: authHeaders }
)
const intakeRows = await intakeRes.json()
if (!intakeRows.length) {
  console.error('❌ Aucune réponse intake trouvée.')
  process.exit(1)
}
const clienteData = intakeRows[0].reponses
console.log('   ✓ Intake récupéré — champs:', Object.keys(clienteData).join(', '))

// ── 3. Appel Anthropic directement ────────────────────────────────────────
console.log('\n3. Appel Anthropic (génération complète, on extraira seulement la nutrition)…')

const SYSTEM_PROMPT = `Tu es Lysa Andréa, coach sportif spécialisée dans l'accompagnement des femmes qui ont un rapport difficile à leur corps.
À partir du questionnaire d'une cliente, génère UNIQUEMENT ses conseils nutritionnels personnalisés.

Réponds UNIQUEMENT en JSON valide avec cette structure exacte (rien d'autre) :
{
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

RÈGLES IMPÉRATIVES :
- Bienveillant, jamais restrictif ni culpabilisant.
- Adapté à son objectif ET son profil émotionnel alimentaire.
- Pas de comptage de calories.
- Orientations générales, pas prescriptions médicales.
- Tiens compte de ses zones_eviter, douleurs, et relation au corps.`

const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'Content-Type':      'application/json',
    'x-api-key':         ANTHROPIC_KEY,
    'anthropic-version': '2023-06-01',
  },
  body: JSON.stringify({
    model:      'claude-sonnet-4-6',
    max_tokens: 2000,
    system:     SYSTEM_PROMPT,
    messages: [{
      role:    'user',
      content: `Voici le questionnaire complet de la cliente :\n\n${JSON.stringify(clienteData, null, 2)}`,
    }],
  }),
})

if (!anthropicRes.ok) {
  const err = await anthropicRes.json().catch(() => ({}))
  console.error('❌ Erreur Anthropic:', err?.error?.message ?? anthropicRes.status)
  process.exit(1)
}

const anthropicData = await anthropicRes.json()
const rawText = anthropicData.content?.[0]?.text ?? ''
console.log('   ✓ Réponse reçue — longueur:', rawText.length, '— stop_reason:', anthropicData.stop_reason)

// ── 4. Parse JSON et extraire nutrition ───────────────────────────────────
let jsonText = rawText.trim()
if (jsonText.startsWith('```')) {
  jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
}

let parsed
try {
  parsed = JSON.parse(jsonText)
} catch {
  const match = jsonText.match(/\{[\s\S]*/)
  parsed = JSON.parse(match ? match[0] : jsonText)
}

const nutrition = parsed.conseils_nutrition
if (!nutrition) {
  console.error('❌ conseils_nutrition absent de la réponse IA.')
  process.exit(1)
}

// ── 5. Preview + confirmation ─────────────────────────────────────────────
console.log('\n─────────────────────────────────────────────────────')
console.log('APERÇU — conseils_nutrition générés :')
console.log(JSON.stringify(nutrition, null, 2))
console.log('─────────────────────────────────────────────────────')
console.log('\n⚠️  Seul le champ conseils_nutrition sera mis à jour.')
console.log('   Le programme (jours/exercices) existant est préservé.')

const rl = createInterface({ input: process.stdin, output: process.stdout })
const confirmed = await new Promise(resolve => {
  rl.question('\nÉcrire en base ? (oui/non) : ', answer => {
    rl.close()
    resolve(answer.trim().toLowerCase() === 'oui')
  })
})

if (!confirmed) {
  console.log('Annulé — aucune modification effectuée.')
  process.exit(0)
}

// ── 6. PATCH ciblé sur conseils_nutrition uniquement ──────────────────────
console.log('\n6. Mise à jour de conseils_nutrition dans Supabase…')
const updateRes = await fetch(
  `${SUPABASE_URL}/rest/v1/ai_programmes?cliente_id=eq.${CLIENTE_ID}`,
  {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify({ conseils_nutrition: nutrition }),
  }
)

if (!updateRes.ok) {
  const errText = await updateRes.text()
  console.error('❌ Erreur PATCH:', updateRes.status, errText)
  process.exit(1)
}

console.log('✅ conseils_nutrition mis à jour avec succès !')
console.log('   Le programme existant (jours édités) est intact.')
