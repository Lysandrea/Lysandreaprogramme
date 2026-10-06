/**
 * Crée ou met à jour le programme de Jennifer dans ai_programmes.
 * clienteId: b01c2c9d-f668-4340-b608-9059175227ad
 *
 * Usage :
 *   SUPABASE_SERVICE_KEY=<key> node scripts/create-jennifer-programme.mjs
 */

import { createInterface } from 'readline'

const SUPABASE_URL = 'https://omcednuoxfmhyfwmrmmp.supabase.co'
const CLIENTE_ID   = 'b01c2c9d-f668-4340-b608-9059175227ad'
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_KEY

if (!SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_KEY manquant. Lance avec : SUPABASE_SERVICE_KEY=<key> node scripts/create-jennifer-programme.mjs')
  process.exit(1)
}

const headers = {
  'apikey':        SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`,
  'Content-Type':  'application/json',
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────────────────────────────────────

const ex = (nom, series, reps, repos, description = '') => ({
  nom, series, reps, repos, description,
  charge_notes: '', commentaire: '', fait: false,
})

// ─────────────────────────────────────────────────────────────────────────────
// Exercices (identiques chaque semaine)
// ─────────────────────────────────────────────────────────────────────────────

const SEANCE_1_EXERCICES = [
  ex('Squat à la barre guidée',
     3, '12', '2min'),
  ex('Fentes avant avec haltères',
     3, '12/jambe', '2min',
     'Un haltère dans chaque main.'),
  ex('Hip thrust machine, ou épaules sur banc avec barre libre / haltère',
     3, '10', '2min',
     'Reste bien 3 secondes en haut du mouvement.'),
  ex('Abducteurs machine',
     3, '15', '1min30'),
  ex('Cardio au choix',
     1, '10min', '—',
     "Retour au calme. Si tu ressens une douleur liée à ta scoliose, dis-le-moi."),
]

const SEANCE_2_EXERCICES = [
  ex('Mobilité haut du corps',
     1, '5min', '—',
     'Avec bâton, mouvements de bras, etc.'),
  ex('Rameur',
     1, '5min', '—',
     "Pour t'échauffer."),
  ex('Tirage vertical prise large à la poulie',
     3, '12', '2min',
     "Abaisse bien les omoplates à chaque répétition, sans contracter les trapèzes. Mouvement lent et contrôlé. Si tu ressens une douleur liée à ta scoliose, dis-le-moi."),
  ex('Dips (machine guidée, ou pieds au sol et mains sur un banc)',
     3, 'max', '2min',
     'Note ta charge et ton nombre de répétitions, pour savoir quoi viser la semaine suivante.'),
  ex('Développé militaire assis, haltères',
     3, '12', '2min'),
  ex('Bonus : pompes',
     1, 'max', '—',
     '🎁'),
  ex('Cardio au choix',
     1, '5min', '—',
     "Ce retour au calme dit à ton corps de se détendre : l'effort est terminé."),
]

// Séance 3 : Presse + CIRCUIT 3 tours (repos "2min entre les tours" / "enchaîné")
const SEANCE_3_EXERCICES = [
  ex('Presse horizontale',
     3, '10', '2min',
     "Si le repos te paraît long, c'est que la charge n'est pas assez lourde. 😄"),
  ex('Montées sur box',
     3, '10 (5 par jambe)', '2min entre les tours',
     "Change le pied qui monte à chaque fois : commence par 5 montées avec une jambe, puis 5 avec l'autre."),
  ex('Crunch / sit-up au sol',
     3, '10', 'enchaîné',
     'Pense à bien inspirer et expirer sur le mouvement.'),
  ex('Military plank',
     3, '10', 'enchaîné',
     'Garde ton gainage solide.'),
  ex('Thrusters (haltères légers)',
     3, '10', '2min entre les tours',
     "Garde ton gainage solide et respire sur chaque mouvement. N'hésite pas à regarder des vidéos des exercices si tu as un doute."),
]

// Séances de base (nom, durée, type — mêmes chaque semaine)
const SEANCES_BASE = [
  { nom: 'Séance 1 — Bas du corps',  duree: 50, type: 'Bas du corps',  exercices: SEANCE_1_EXERCICES },
  { nom: 'Séance 2 — Haut du corps', duree: 55, type: 'Haut du corps', exercices: SEANCE_2_EXERCICES },
  { nom: 'Séance 3 — Full body',     duree: 50, type: 'Full body',     exercices: SEANCE_3_EXERCICES },
]

// ─────────────────────────────────────────────────────────────────────────────
// Intentions (varient par semaine)
// ─────────────────────────────────────────────────────────────────────────────

const SEMAINES_CONFIG = [
  {
    semaine:   1,
    theme:     'Découverte',
    intention: "Commence avec curiosité — chaque mouvement est une découverte. 🌿",
    jours: [
      "🦵 Ce moment est à toi. Pas de pression, juste toi et ton corps qui commencent une nouvelle routine ensemble. 🌿",
      "💪 Pose ta tête et suis le rythme. Ici, tu n'as rien à prouver, tu construis doucement. 🌸",
      "🔥 Défoule-toi ou avance tranquille, c'est toi qui choisis. L'important, c'est d'être venue. 🌿",
    ],
  },
  {
    semaine:   2,
    theme:     'Prise de repères',
    intention: "Tu t'installes dans ta routine. Les repères arrivent. 🌱",
    jours: [
      "🦵 Ton corps commence à connaître le mouvement. Reste à l'écoute, il te dit tout ce dont il a besoin. 🌱",
      "💪 Tu sens le muscle qui travaille ? C'est lui qui se construit. Prends soin de toi à chaque répétition. 🌿",
      "🔥 Le circuit, c'est ton espace de jeu. Respire, garde ton gainage, et amuse-toi un peu. 😄",
    ],
  },
  {
    semaine:   3,
    theme:     'Routine',
    intention: "La régularité crée la transformation. Reste avec toi. 🌸",
    jours: [
      "🦵 Tu prends tes marques. Cette routine devient la tienne, et c'est tout ce qui compte. 🌸",
      "💪 Sans pression, avec toi. Tu deviens peu à peu ta propre alliée dans cette routine. 🌿",
      "🔥 Sors ce que tu as à sortir, puis souffle. Ce moment est là pour te faire du bien. 🌱",
    ],
  },
  {
    semaine:   4,
    theme:     'Consolidation',
    intention: "Tu consolides tout ce que tu as commencé. Sois fière. 🌿",
    jours: [
      "🦵 Regarde le chemin parcouru depuis la première séance. Tu peux être fière de toi. 🌿",
      "💪 Tu deviens ta meilleure amie dans cette routine. Continue d'avancer avec douceur et sérieux. 🌸",
      "🔥 Dernière séance du bloc : donne ce que tu peux, et savoure ce que tu as construit. 🌿",
    ],
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Construire le programme
// ─────────────────────────────────────────────────────────────────────────────

const PROGRAMME = SEMAINES_CONFIG.map(cfg => ({
  semaine:   cfg.semaine,
  theme:     cfg.theme,
  intention: cfg.intention,
  jours: SEANCES_BASE.map((seance, idx) => ({
    jour:      idx + 1,
    nom:       seance.nom,
    duree:     seance.duree,
    type:      seance.type,
    intention: cfg.jours[idx],
    exercices: seance.exercices,
  })),
}))

// ─────────────────────────────────────────────────────────────────────────────
// 1. Vérifier si une ligne existe
// ─────────────────────────────────────────────────────────────────────────────

console.log("1. Vérification de l'existence du programme en base…")
const checkRes = await fetch(
  `${SUPABASE_URL}/rest/v1/ai_programmes?cliente_id=eq.${CLIENTE_ID}&select=id,statut,nutrition_statut,programme,profil_resume,questions_personnalisees,conseils_nutrition`,
  { headers }
)
if (!checkRes.ok) {
  console.error('❌ Erreur fetch:', checkRes.status, await checkRes.text())
  process.exit(1)
}
const rows = await checkRes.json()
const existing = rows[0] ?? null

if (existing) {
  console.log(`   ✓ Ligne existante trouvée — statut: ${existing.statut}`)
} else {
  console.log('   ℹ️  Aucune ligne existante — sera créée avec statut: en_attente')
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Aperçu complet
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n══════════════════════════════════════════════════════════════')
console.log('APERÇU — Programme Jennifer (4 semaines × 3 séances)')
console.log('══════════════════════════════════════════════════════════════')

for (const sem of PROGRAMME) {
  console.log(`\n📅 Semaine ${sem.semaine} — "${sem.theme}"`)
  console.log(`   💬 ${sem.intention}`)
  for (const jour of sem.jours) {
    console.log(`\n   🏋️  J${jour.jour} · ${jour.nom} (${jour.duree}min)`)
    console.log(`      ✨ ${jour.intention}`)
    console.log('      ──────────────────────────────────────────────────────')
    for (const e of jour.exercices) {
      console.log(`      • ${e.nom}`)
      console.log(`        ${e.series} × ${e.reps}  |  repos ${e.repos}`)
      if (e.description) console.log(`        → ${e.description}`)
    }
  }
}

console.log('\n══════════════════════════════════════════════════════════════')
if (existing) {
  console.log('⚠️  Mode UPDATE — sera modifié :')
  console.log(`   statut (${existing.statut})           → INCHANGÉ`)
  console.log('   profil_resume                   → INCHANGÉ')
  console.log('   questions_personnalisees         → INCHANGÉ')
  console.log('   conseils_nutrition               → INCHANGÉ')
  console.log('   programme                        → REMPLACÉ (4 semaines × 3 séances)')
} else {
  console.log('ℹ️  Mode CREATE — nouvelle ligne :')
  console.log('   statut           = en_attente')
  console.log('   nutrition_statut = en_attente')
  console.log('   programme        = [4 semaines × 3 séances]')
}
console.log('══════════════════════════════════════════════════════════════')

// ─────────────────────────────────────────────────────────────────────────────
// 3. Confirmation
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
// 4. Écrire en base
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n4. Écriture dans Supabase…')

let saveRes

if (existing) {
  // UPDATE : remplace programme uniquement
  saveRes = await fetch(
    `${SUPABASE_URL}/rest/v1/ai_programmes?cliente_id=eq.${CLIENTE_ID}`,
    {
      method:  'PATCH',
      headers,
      body:    JSON.stringify({ programme: PROGRAMME }),
    }
  )
} else {
  // INSERT : crée la ligne complète
  saveRes = await fetch(
    `${SUPABASE_URL}/rest/v1/ai_programmes`,
    {
      method:  'POST',
      headers: { ...headers, 'Prefer': 'return=representation' },
      body:    JSON.stringify({
        cliente_id:       CLIENTE_ID,
        statut:           'en_attente',
        nutrition_statut: 'en_attente',
        programme:        PROGRAMME,
      }),
    }
  )
}

if (!saveRes.ok) {
  const err = await saveRes.text()
  console.error('❌ Erreur écriture:', saveRes.status, err)
  process.exit(1)
}

const totalSeances = PROGRAMME.reduce((acc, sem) => acc + sem.jours.length, 0)
const totalExercices = PROGRAMME[0].jours.reduce((acc, j) => acc + j.exercices.length, 0)

console.log(`✅ Programme ${existing ? 'mis à jour' : 'créé'} avec succès !`)
console.log(`   ${PROGRAMME.length} semaines × 3 séances = ${totalSeances} séances au total`)
console.log(`   ${totalExercices} exercices par séance (définis sur S1, répétés identiques S2–S4)`)
console.log('\n👉 Pour le rendre visible à Jennifer, publier depuis la vue Coach.')
