// Regenerates Tiphaine's programme via the Edge Function
// Usage: SUPABASE_SERVICE_KEY=<key> node scripts/regenerate-tiphaine.mjs

const SUPABASE_URL    = 'https://omcednuoxfmhyfwmrmmp.supabase.co'
const SERVICE_KEY     = process.env.SUPABASE_SERVICE_KEY
const CLIENTE_ID      = 'f434f66c-75f8-482e-8ff5-6ecb3c92f768'

if (!SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_KEY manquant. Lance avec : SUPABASE_SERVICE_KEY=<key> node scripts/regenerate-tiphaine.mjs')
  process.exit(1)
}

// ── 1. Fetch intake_responses ──────────────────────────────────────────────
console.log('1. Récupération des réponses intake de Tiphaine…')
const intakeRes = await fetch(
  `${SUPABASE_URL}/rest/v1/intake_responses?cliente_id=eq.${CLIENTE_ID}&select=reponses`,
  {
    headers: {
      'apikey':        SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type':  'application/json',
    },
  }
)

if (!intakeRes.ok) {
  console.error('❌ Erreur fetch intake:', intakeRes.status, await intakeRes.text())
  process.exit(1)
}

const intakeRows = await intakeRes.json()
if (!intakeRows.length) {
  console.error('❌ Aucune réponse intake trouvée pour ce clienteId')
  process.exit(1)
}

const clienteData = intakeRows[0].reponses
console.log('   ✓ Intake récupéré — champs:', Object.keys(clienteData).join(', '))
console.log('   frequence_semaine:', clienteData.frequence_semaine)
console.log('   niveau:', clienteData.niveau)
console.log('   zones_eviter:', clienteData.zones_eviter)

// ── 2. Call Edge Function ──────────────────────────────────────────────────
console.log('\n2. Appel de la Edge Function generate-programme…')
const edgeRes = await fetch(
  `${SUPABASE_URL}/functions/v1/generate-programme`,
  {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${SERVICE_KEY}`,
    },
    body: JSON.stringify({ clienteId: CLIENTE_ID, clienteData }),
  }
)

const edgeBody = await edgeRes.json()

if (!edgeRes.ok || edgeBody.error) {
  console.error('❌ Erreur Edge Function:', edgeBody)
  process.exit(1)
}

console.log('   ✓ Edge Function réponse:', edgeBody)

// ── 3. Verify saved programme ──────────────────────────────────────────────
console.log('\n3. Vérification du programme sauvegardé dans ai_programmes…')
const progRes = await fetch(
  `${SUPABASE_URL}/rest/v1/ai_programmes?cliente_id=eq.${CLIENTE_ID}&select=statut,generated_at,programme`,
  {
    headers: {
      'apikey':        SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type':  'application/json',
    },
  }
)

const progRows = await progRes.json()
if (!progRows.length) {
  console.error('❌ Aucun programme trouvé après génération')
  process.exit(1)
}

const prog = progRows[0]
console.log('   statut       :', prog.statut)
console.log('   generated_at :', prog.generated_at)

const semaines = prog.programme ?? []
console.log('   semaines     :', semaines.length)

// Check exercices on each week
let totalExercices = 0
let emptyCount = 0
for (const sem of semaines) {
  for (const jour of (sem.jours ?? [])) {
    const exCount = (jour.exercices ?? []).length
    totalExercices += exCount
    if (exCount === 0) emptyCount++
    console.log(`   S${sem.semaine} J${jour.jour} "${jour.nom}" — ${exCount} exercice(s)`)
  }
}

console.log('\n──────────────────────────────────')
console.log(`Total exercices : ${totalExercices}`)
console.log(`Séances vides   : ${emptyCount}`)

if (emptyCount === 0 && totalExercices > 0) {
  console.log('✅ Programme complet avec exercices détaillés !')
} else if (emptyCount > 0) {
  console.log('⚠️  Certaines séances ont encore exercices: []')
}

// Show sample from S1 J1
const s1j1 = semaines[0]?.jours?.[0]
if (s1j1?.exercices?.length) {
  console.log('\nAperçu S1 J1 —', s1j1.nom)
  for (const ex of s1j1.exercices) {
    console.log(`  • ${ex.nom} — ${ex.series}x${ex.reps}, repos ${ex.repos}`)
  }
}
