// Duplicates week 1 jours into weeks 2, 3, 4 for Tiphaine
// Usage: SUPABASE_SERVICE_KEY=<key> node scripts/duplicate-week1.mjs

const SUPABASE_URL = 'https://omcednuoxfmhyfwmrmmp.supabase.co'
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_KEY
const CLIENTE_ID   = 'f434f66c-75f8-482e-8ff5-6ecb3c92f768'

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
  `${SUPABASE_URL}/rest/v1/ai_programmes?cliente_id=eq.${CLIENTE_ID}&select=programme`,
  { headers }
)
const rows = await fetchRes.json()
if (!rows.length) { console.error('❌ Aucun programme trouvé'); process.exit(1) }

const programme = rows[0].programme
console.log(`   ✓ ${programme.length} semaines trouvées`)

// ── 2. Extract week 1 jours ────────────────────────────────────────────────
const sem1 = programme.find(s => s.semaine === 1)
if (!sem1) { console.error('❌ Semaine 1 introuvable'); process.exit(1) }

console.log(`\n2. Semaine 1 — ${sem1.jours.length} séances à dupliquer :`)
for (const j of sem1.jours) {
  console.log(`   J${j.jour} "${j.nom}" — ${(j.exercices ?? []).length} exercices`)
}

// ── 3. Build updated programme ─────────────────────────────────────────────
const updated = programme.map(sem => {
  if (sem.semaine === 2 || sem.semaine === 3 || sem.semaine === 4) {
    return {
      ...sem,
      jours: sem1.jours.map((j, idx) => ({
        ...j,
        jour: idx + 1,
      })),
    }
  }
  return sem
})

console.log('\n3. Aperçu du programme mis à jour :')
for (const sem of updated) {
  const exTotal = sem.jours.reduce((acc, j) => acc + (j.exercices ?? []).length, 0)
  console.log(`   S${sem.semaine} — ${sem.jours.length} séances, ${exTotal} exercices au total`)
}

// ── 4. Confirm before saving ───────────────────────────────────────────────
console.log('\n⚠️  Prête à écraser les semaines 2, 3, 4 avec le contenu de la semaine 1.')
console.log('   Envoi dans Supabase…')

const saveRes = await fetch(
  `${SUPABASE_URL}/rest/v1/ai_programmes?cliente_id=eq.${CLIENTE_ID}`,
  {
    method:  'PATCH',
    headers: { ...headers, 'Prefer': 'return=minimal' },
    body:    JSON.stringify({ programme: updated }),
  }
)

if (!saveRes.ok) {
  const err = await saveRes.text()
  console.error('❌ Erreur sauvegarde:', saveRes.status, err)
  process.exit(1)
}

console.log('✅ Programme sauvegardé — semaines 2, 3, 4 sont maintenant identiques à la semaine 1.')
