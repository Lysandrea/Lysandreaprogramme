// Reorders days within weeks 1-4 of Tiphaine's programme (no content changes)
// Usage: SUPABASE_SERVICE_KEY=<key> node scripts/reorder-tiphaine-jours.mjs

const SUPABASE_URL = 'https://omcednuoxfmhyfwmrmmp.supabase.co'
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_KEY
const CLIENTE_ID   = 'f434f66c-75f8-482e-8ff5-6ecb3c92f768'

// New order: indices into the original jours array (0-based)
// Original: J1=0 Full Body, J2=1 Bas du corps, J3=2 Cardio, J4=3 Haut du corps, J5=4 BONUS
// New:      J1=0 Full Body, J2=2 Cardio,       J3=3 Haut du corps, J4=1 Bas du corps, J5=4 BONUS
const NEW_ORDER = [0, 2, 3, 1, 4]

if (!SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_KEY manquant.')
  process.exit(1)
}

const headers = {
  'apikey':        SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`,
  'Content-Type':  'application/json',
}

// ── 1. Fetch current programme ─────────────────────────────────────────────
console.log('1. Récupération du programme de Tiphaine…')

const fetchRes = await fetch(
  `${SUPABASE_URL}/rest/v1/ai_programmes?cliente_id=eq.${CLIENTE_ID}&select=id,programme`,
  { headers }
)
if (!fetchRes.ok) {
  console.error('❌ Fetch error:', await fetchRes.text())
  process.exit(1)
}

const rows = await fetchRes.json()
if (!rows.length) {
  console.error('❌ Aucun programme trouvé pour cette cliente.')
  process.exit(1)
}

const { id: programmeId, programme } = rows[0]
// programme is stored as an array (or array-like object)
const semaines = Array.isArray(programme) ? programme : Object.values(programme)
console.log(`   Programme ID: ${programmeId}`)
console.log(`   Semaines trouvées: ${semaines.length}`)

// ── 2. Reorder jours for weeks 1-4 ────────────────────────────────────────
console.log('\n2. Réorganisation des jours (semaines 1-4)…')

const updatedSemaines = semaines.map((semaine) => {
  const num = semaine.semaine
  if (num < 1 || num > 4) return semaine // weeks beyond 4 untouched

  const original = semaine.jours
  if (original.length !== 5) {
    console.warn(`   ⚠️  Semaine ${num}: ${original.length} jours (attendu 5) — ignorée`)
    return semaine
  }

  const reordered = NEW_ORDER.map((srcIdx, destIdx) => ({
    ...original[srcIdx],
    jour: destIdx + 1,
  }))

  console.log(`   Semaine ${num}:`)
  reordered.forEach(j => {
    console.log(`     J${j.jour} ← "${j.nom}"`)
  })

  return { ...semaine, jours: reordered }
})

// Preserve original shape (array)
const updatedProgramme = updatedSemaines

// ── 3. Preview ────────────────────────────────────────────────────────────
console.log('\n3. Aperçu complet des semaines 1-4 après réorganisation:')
for (let i = 0; i < 4; i++) {
  const s = updatedSemaines[i]
  console.log(`\n  📅 Semaine ${s.semaine}:`)
  s.jours.forEach(j => console.log(`     J${j.jour} — ${j.nom}`))
}

// ── 4. Confirm before saving ──────────────────────────────────────────────
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('⚠️  Prêt à sauvegarder. Relance avec --confirm pour écrire en base.')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

if (!process.argv.includes('--confirm')) {
  console.log('\n✅ Dry-run terminé — aucune donnée modifiée.')
  process.exit(0)
}

// ── 5. Save ───────────────────────────────────────────────────────────────
console.log('\n4. Sauvegarde en base…')

const saveRes = await fetch(
  `${SUPABASE_URL}/rest/v1/ai_programmes?id=eq.${programmeId}`,
  {
    method:  'PATCH',
    headers: { ...headers, 'Prefer': 'return=representation' },
    body:    JSON.stringify({ programme: updatedProgramme }),
  }
)

if (!saveRes.ok) {
  console.error('❌ Save error:', await saveRes.text())
  process.exit(1)
}

console.log('✅ Programme mis à jour avec succès!')
