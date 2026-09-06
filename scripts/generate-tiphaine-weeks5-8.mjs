/**
 * Génère les semaines 5-8 du programme de Tiphaine via Anthropic,
 * en préservant EXACTEMENT les semaines 1-4 déjà éditées manuellement.
 * Affiche un aperçu avant de confirmer la sauvegarde.
 *
 * Usage :
 *   SUPABASE_SERVICE_KEY=<key> ANTHROPIC_API_KEY=<key> node scripts/generate-tiphaine-weeks5-8.mjs
 */

import { createInterface } from 'readline'

const SUPABASE_URL  = 'https://omcednuoxfmhyfwmrmmp.supabase.co'
const CLIENTE_ID    = 'f434f66c-75f8-482e-8ff5-6ecb3c92f768'
const SERVICE_KEY   = process.env.SUPABASE_SERVICE_KEY
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY

if (!SERVICE_KEY)   { console.error('❌ SUPABASE_SERVICE_KEY manquant.'); process.exit(1) }
if (!ANTHROPIC_KEY) { console.error('❌ ANTHROPIC_API_KEY manquant.');    process.exit(1) }

const authHeaders = {
  'apikey':        SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`,
  'Content-Type':  'application/json',
}

// ── 1. Fetch programme actuel (semaines 1-4 + statut) ─────────────────────
console.log('1. Récupération du programme actuel de Tiphaine…')
const progRes = await fetch(
  `${SUPABASE_URL}/rest/v1/ai_programmes?cliente_id=eq.${CLIENTE_ID}&select=id,statut,programme`,
  { headers: authHeaders }
)
const progRows = await progRes.json()
if (!progRows.length) {
  console.error('❌ Aucun ai_programme trouvé pour ce clienteId.')
  process.exit(1)
}

const existing     = progRows[0]
const currentWeeks = existing.programme ?? []
const weeks1to4    = currentWeeks.filter(s => s.semaine <= 4)
const alreadyHas5to8 = currentWeeks.some(s => s.semaine >= 5)

console.log(`   statut         : ${existing.statut}`)
console.log(`   semaines en DB : ${currentWeeks.map(s => s.semaine).join(', ') || '(aucune)'}`)

if (alreadyHas5to8) {
  console.log('⚠️  Des semaines 5-8 existent déjà. Le script les écrasera si tu confirmes.')
}
if (weeks1to4.length < 4) {
  console.warn(`⚠️  Seulement ${weeks1to4.length} semaine(s) trouvée(s) pour les semaines 1-4.`)
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
console.log('   objectifs        :', clienteData.objectifs)
console.log('   niveau           :', clienteData.niveau)
console.log('   frequence_semaine:', clienteData.frequence_semaine)
console.log('   zones_eviter     :', clienteData.zones_eviter)
console.log('   materiel         :', clienteData.materiel)

// ── 3. Extraire les exercices déjà utilisés en S1-S4 ──────────────────────
const usedExercises = []
for (const sem of weeks1to4) {
  for (const jour of (sem.jours ?? [])) {
    for (const ex of (jour.exercices ?? [])) {
      if (ex.nom && !usedExercises.includes(ex.nom)) {
        usedExercises.push(ex.nom)
      }
    }
  }
}
console.log(`\n   Exercices S1-S4 (${usedExercises.length}) :`, usedExercises.join(', '))

// ── 4. Déterminer le nombre de jours par semaine ───────────────────────────
const freq = parseInt(clienteData.frequence_semaine) || 5
console.log(`\n   → ${freq} jour(s) d'entraînement par semaine`)

// ── 5. Appel Anthropic ─────────────────────────────────────────────────────
console.log('\n3. Appel Anthropic — génération des semaines 5-8…')

const SYSTEM_PROMPT = `Tu es Lysa Andréa, coach sportif spécialisée dans l'accompagnement des femmes qui ont un rapport difficile à leur corps.

Tu dois générer UNIQUEMENT les semaines 5 à 8 d'un programme d'entraînement de 8 semaines.
Les semaines 1-4 existent déjà ; tu dois construire la progression en phase finale (consolidation et intensification progressive).

Réponds UNIQUEMENT en JSON valide, sans aucun texte autour. Structure exacte :
{
  "semaines": [
    {
      "semaine": 5,
      "theme": "string — thème de la semaine",
      "intention": "string — intention globale courte",
      "jours": [
        {
          "jour": 1,
          "nom": "string — nom de la séance",
          "duree": "string — ex: '45 min'",
          "type": "string — ex: 'Renforcement', 'Cardio doux', 'Mobilité'",
          "intention": "string — intention courte de la séance",
          "exercices": [
            {
              "nom": "string",
              "series": number,
              "reps": "string — ex: '12' ou '30 sec'",
              "repos": "string — ex: '45 sec'",
              "description": "",
              "charge_notes": "",
              "commentaire": "",
              "fait": false
            }
          ]
        }
      ]
    }
  ]
}

RÈGLES IMPÉRATIVES :
- Exactement 4 semaines (5, 6, 7, 8).
- Exactement ${freq} jour(s) par semaine (jours numérotés 1 à ${freq}).
- 3 à 4 exercices par séance.
- Progression logique : S5 = consolidation, S6 = intensification, S7 = pic, S8 = déload/bilan.
- Réutilise les exercices des semaines 1-4 avec des variantes ou progressions (plus de séries, moins de repos, charge plus lourde, unilatéral, etc.) — pas de répétition à l'identique.
- Tu peux introduire de nouveaux exercices en complément, en restant dans les capacités du matériel disponible.
- Respecte ABSOLUMENT les zones à éviter.
- Ton bienveillant, motivant, adapté au rapport au corps de la cliente.
- Les champs "theme", "intention" (semaine et jour) doivent rester COURTS : max 15 mots chacun.
- description, charge_notes, commentaire restent toujours des chaînes vides "".
- fait reste toujours false.`

const userPrompt = `Profil de la cliente :
${JSON.stringify({
  objectifs:        clienteData.objectifs,
  niveau:           clienteData.niveau,
  frequence_semaine: clienteData.frequence_semaine,
  zones_eviter:     clienteData.zones_eviter,
  materiel:         clienteData.materiel,
  douleurs:         clienteData.douleurs,
  relation_corps:   clienteData.relation_corps,
}, null, 2)}

Exercices déjà utilisés en semaines 1-4 (à faire progresser, pas répéter à l'identique) :
${usedExercises.map(e => `- ${e}`).join('\n')}

Génère maintenant UNIQUEMENT les semaines 5, 6, 7 et 8.`

const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'Content-Type':      'application/json',
    'x-api-key':         ANTHROPIC_KEY,
    'anthropic-version': '2023-06-01',
  },
  body: JSON.stringify({
    model:      'claude-sonnet-4-6',
    max_tokens: 16000,
    system:     SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
  }),
})

if (!anthropicRes.ok) {
  const err = await anthropicRes.json().catch(() => ({}))
  console.error('❌ Erreur Anthropic:', err?.error?.message ?? anthropicRes.status)
  process.exit(1)
}

const anthropicData = await anthropicRes.json()
const rawText = anthropicData.content?.[0]?.text ?? ''
console.log(`   ✓ Réponse reçue — longueur: ${rawText.length} — stop_reason: ${anthropicData.stop_reason}`)

// ── 6. Parse JSON ──────────────────────────────────────────────────────────
let jsonText = rawText.trim()
if (jsonText.startsWith('```')) {
  jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
}

let parsed
try {
  parsed = JSON.parse(jsonText)
} catch {
  const match = jsonText.match(/\{[\s\S]*/)
  try {
    parsed = JSON.parse(match ? match[0] : jsonText)
  } catch (e2) {
    console.error('❌ Impossible de parser le JSON reçu:', e2.message)
    console.error('Début du texte brut:\n', rawText.slice(0, 500))
    process.exit(1)
  }
}

const weeks5to8 = parsed.semaines ?? []
if (!weeks5to8.length || weeks5to8.some(s => s.semaine < 5)) {
  console.error('❌ La réponse ne contient pas les semaines 5-8 attendues.')
  console.error(JSON.stringify(weeks5to8.map(s => s.semaine)))
  process.exit(1)
}

// ── 7. Validation rapide ───────────────────────────────────────────────────
console.log('\n4. Validation du contenu généré…')
let totalEx = 0
for (const sem of weeks5to8) {
  const nbJours = (sem.jours ?? []).length
  console.log(`   S${sem.semaine} "${sem.theme}" — ${nbJours} jour(s)`)
  for (const jour of (sem.jours ?? [])) {
    const nbEx = (jour.exercices ?? []).length
    totalEx += nbEx
    console.log(`      J${jour.jour} "${jour.nom}" — ${nbEx} exercice(s)`)
  }
}
console.log(`   Total exercices : ${totalEx}`)

// ── 8. Aperçu détaillé ────────────────────────────────────────────────────
console.log('\n' + '─'.repeat(60))
console.log('APERÇU COMPLET — semaines 5-8 générées :')
console.log('─'.repeat(60))
for (const sem of weeks5to8) {
  console.log(`\n📅 SEMAINE ${sem.semaine} — ${sem.theme}`)
  console.log(`   Intention : ${sem.intention}`)
  for (const jour of (sem.jours ?? [])) {
    console.log(`\n   🏋️  Jour ${jour.jour} — ${jour.nom} (${jour.duree}, ${jour.type})`)
    console.log(`       Intention : ${jour.intention}`)
    for (const ex of (jour.exercices ?? [])) {
      console.log(`       • ${ex.nom} — ${ex.series}x${ex.reps}, repos ${ex.repos}`)
    }
  }
}
console.log('\n' + '─'.repeat(60))

// ── 9. Confirmation ────────────────────────────────────────────────────────
console.log('\n⚠️  RÉCAPITULATIF :')
console.log(`   Semaines 1-4 : PRÉSERVÉES EXACTEMENT (${weeks1to4.length} semaines)`)
console.log(`   Semaines 5-8 : NOUVELLEMENT GÉNÉRÉES (${weeks5to8.length} semaines)`)
console.log(`   Statut       : INCHANGÉ (${existing.statut})`)
console.log('\n   Les semaines 5-8 ne seront PAS visibles par la cliente')
console.log('   tant que son current_day n\'atteint pas la semaine 5.')

const rl = createInterface({ input: process.stdin, output: process.stdout })
const confirmed = await new Promise(resolve => {
  rl.question('\nSauvegarder en base ? (oui/non) : ', answer => {
    rl.close()
    resolve(answer.trim().toLowerCase() === 'oui')
  })
})

if (!confirmed) {
  console.log('Annulé — aucune modification effectuée.')
  process.exit(0)
}

// ── 10. Merge S1-4 + S5-8 et PATCH ────────────────────────────────────────
const merged = [...weeks1to4, ...weeks5to8]

console.log(`\n5. Sauvegarde du programme complet (${merged.length} semaines) dans Supabase…`)
const updateRes = await fetch(
  `${SUPABASE_URL}/rest/v1/ai_programmes?cliente_id=eq.${CLIENTE_ID}`,
  {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify({ programme: merged }),
  }
)

if (!updateRes.ok) {
  const errText = await updateRes.text()
  console.error('❌ Erreur PATCH:', updateRes.status, errText)
  process.exit(1)
}

console.log('✅ Programme 8 semaines sauvegardé avec succès !')
console.log(`   Semaines 1-4 : préservées intactes`)
console.log(`   Semaines 5-8 : ajoutées`)
console.log(`   Statut       : ${existing.statut} (inchangé)`)
