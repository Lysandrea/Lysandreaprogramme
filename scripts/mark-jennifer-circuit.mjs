/**
 * Marque les 4 derniers exercices de la Séance 3 de Jennifer comme
 * appartenant à un circuit, pour les semaines 1 à 4.
 *
 * - "Presse horizontale" reste un exercice normal
 * - Les 4 suivants reçoivent groupe: "circuit", series: 1, repos: "enchaîné"
 * - jour.circuit = { tours: 3, repos: "2min" } est ajouté sur chaque séance 3
 *
 * Usage :
 *   SUPABASE_SERVICE_KEY=<key> node scripts/mark-jennifer-circuit.mjs
 */

import { createInterface } from 'readline'

const SUPABASE_URL = 'https://omcednuoxfmhyfwmrmmp.supabase.co'
const CLIENTE_ID   = 'b01c2c9d-f668-4340-b608-9059175227ad'
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_KEY

if (!SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_KEY manquant. Lance avec : SUPABASE_SERVICE_KEY=<key> node scripts/mark-jennifer-circuit.mjs')
  process.exit(1)
}

const headers = {
  'apikey':        SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`,
  'Content-Type':  'application/json',
}

const SEANCE_3_NOM     = 'Séance 3 — Full body'
const PRESSE_FIRST_NOM = 'Presse horizontale'

// ─────────────────────────────────────────────────────────────────────────────
// 1. Fetch programme
// ─────────────────────────────────────────────────────────────────────────────

console.log('1. Récupération du programme de Jennifer…')
const res = await fetch(
  `${SUPABASE_URL}/rest/v1/ai_programmes?cliente_id=eq.${CLIENTE_ID}&select=id,statut,programme`,
  { headers }
)
if (!res.ok) {
  console.error('❌ Erreur fetch:', res.status, await res.text())
  process.exit(1)
}
const rows = await res.json()
if (!rows.length) {
  console.error('❌ Aucun ai_programme trouvé pour ce clienteId.')
  process.exit(1)
}

const existing  = rows[0]
const programme = JSON.parse(JSON.stringify(existing.programme ?? []))
console.log(`   ✓ Programme trouvé — statut: ${existing.statut} — ${programme.length} semaines`)

// ─────────────────────────────────────────────────────────────────────────────
// 2. Apply circuit marking
// ─────────────────────────────────────────────────────────────────────────────

const changes = []

for (const sem of programme) {
  const semNum = sem.semaine
  if (semNum < 1 || semNum > 4) continue

  const jour3 = sem.jours?.find(j => j.nom === SEANCE_3_NOM)
  if (!jour3) {
    console.warn(`   ⚠ Semaine ${semNum} : séance "${SEANCE_3_NOM}" introuvable — ignorée`)
    continue
  }

  const exercices = jour3.exercices ?? []

  // Expect first exercise to be "Presse horizontale"
  if (exercices[0]?.nom !== PRESSE_FIRST_NOM) {
    console.warn(`   ⚠ Semaine ${semNum} : premier exercice inattendu "${exercices[0]?.nom}" — traitement quand même`)
  }

  // Mark exercises 1..N as circuit (everything after the first)
  for (let i = 1; i < exercices.length; i++) {
    exercices[i].groupe = 'circuit'
    exercices[i].series = 1
    exercices[i].repos  = 'enchaîné'
  }

  // Add circuit metadata to the jour
  jour3.circuit = { tours: 3, repos: '2min' }

  changes.push({ semaine: semNum, jour: jour3.jour, exercicesMarques: exercices.length - 1 })
}

if (!changes.length) {
  console.error('❌ Aucune modification à apporter.')
  process.exit(1)
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Preview
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n══════════════════════════════════════════════════════════════')
console.log('APERÇU — Modifications à appliquer')
console.log('══════════════════════════════════════════════════════════════')

for (const { semaine, exercicesMarques } of changes) {
  const sem   = programme.find(s => s.semaine === semaine)
  const jour3 = sem.jours.find(j => j.nom === SEANCE_3_NOM)

  console.log(`\n📅 Semaine ${semaine} — "${sem.theme}" · ${jour3.nom}`)
  console.log(`   circuit: { tours: ${jour3.circuit.tours}, repos: "${jour3.circuit.repos}" }`)
  console.log(`   Exercices :`)
  for (const ex of jour3.exercices) {
    const tag = ex.groupe === 'circuit' ? '[🔁 circuit]' : '[normal]    '
    console.log(`   ${tag} ${ex.nom}`)
    console.log(`              ${ex.series} × ${ex.reps}  |  repos ${ex.repos}`)
  }
}

console.log('\n══════════════════════════════════════════════════════════════')
console.log(`✅ ${changes.length} séance(s) modifiée(s) — ${changes[0].exercicesMarques} exercice(s) marqués 🔁 par séance`)
console.log('🔒 statut : INCHANGÉ')
console.log('══════════════════════════════════════════════════════════════')

// ─────────────────────────────────────────────────────────────────────────────
// 4. Confirmation
// ─────────────────────────────────────────────────────────────────────────────

const rl = createInterface({ input: process.stdin, output: process.stdout })
const confirmed = await new Promise(resolve => {
  rl.question('\n⚠️  Écrire en base ? (oui/non) : ', answer => {
    rl.close()
    resolve(answer.trim().toLowerCase() === 'oui')
  })
})

if (!confirmed) {
  console.log('Annulé — aucune modification effectuée.')
  process.exit(0)
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Save — replace programme only
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n5. Écriture dans Supabase…')
const patchRes = await fetch(
  `${SUPABASE_URL}/rest/v1/ai_programmes?cliente_id=eq.${CLIENTE_ID}`,
  {
    method:  'PATCH',
    headers,
    body:    JSON.stringify({ programme }),
  }
)

if (!patchRes.ok) {
  const err = await patchRes.text()
  console.error('❌ Erreur PATCH:', patchRes.status, err)
  process.exit(1)
}

console.log('✅ Programme mis à jour avec succès !')
console.log(`   Semaines modifiées : ${changes.map(c => c.semaine).join(', ')}`)
console.log(`   Circuit : 3 tours, 2min de repos, 4 exercices chacun`)
console.log('\n👉 Republier depuis la vue Coach si nécessaire pour que Jennifer voit les changements.')
