/**
 * Remplace les semaines 2-8 du programme de Tiphaine avec le contenu
 * construit ensemble avec Lysa. La semaine 1 est préservée intacte.
 *
 * Usage :
 *   SUPABASE_SERVICE_KEY=<key> node scripts/update-tiphaine-weeks2-8.mjs
 */

import { createInterface } from 'readline'

const SUPABASE_URL = 'https://omcednuoxfmhyfwmrmmp.supabase.co'
const CLIENTE_ID   = 'f434f66c-75f8-482e-8ff5-6ecb3c92f768'
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_KEY

if (!SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_KEY manquant.')
  process.exit(1)
}

const headers = {
  'apikey':        SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`,
  'Content-Type':  'application/json',
}

/* ─────────────────────────────────────────────────────────────────
   DONNÉES DES SÉANCES
   series = nombre (rendu UI: "{series} × {reps}")
   reps   = string sans le mot "reps"
───────────────────────────────────────────────────────────────── */

const ex = (nom, series, reps, repos) => ({
  nom, series, reps, repos,
  description: '', charge_notes: '', commentaire: '', fait: false,
})

/* ── BLOC 1 — séances communes aux semaines 2, 3, 4, 5 ─────────── */

const B1_S1 = {
  jour: 1,
  nom: 'Séance 1 — Haut du corps A',
  duree: 60,
  type: 'Force — Haut du corps',
  intention: "💪 On construit la base avec sérieux — chaque traction compte vraiment. Donne le meilleur de toi aujourd'hui. Sois fière de l'effort que tu poses. 🌿",
  exercices: [
    ex('Tractions strictes (pronation)',       4, '6-7',         '2min'),
    ex('Développé militaire debout (OHP)',      4, '6-8',         '2min'),
    ex('Pompes classiques (tempo 2010)',        3, '12',          '1min30'),
    ex('Tirage horizontal anneaux/TRX',        3, '10-12',       '1min30'),
    ex('Hollow body hold',                     3, '35-45sec',    '1min'),
  ],
}

const B1_S2 = {
  jour: 2,
  nom: 'Séance 2 — Bas du corps',
  duree: 60,
  type: 'Force — Bas du corps',
  intention: "🦵 On renforce un bas du corps fort et stable — pour porter tes kilomètres, mais aussi pour le plaisir d'un corps qui bouge avec puissance. Pousse fort, mais écoute-le, il te porte depuis toujours. 🌿",
  exercices: [
    ex('Split squat KB (ou fentes arrières)',   4, '8-10/jambe',  '2min'),
    ex('Soulevé de terre roumain 1 jambe',      3, '8-10/jambe',  '1min30'),
    ex('Step-up sur banc contrôlé',            3, '10/jambe',    '1min30'),
    ex('Élévations mollets debout 1 jambe',    4, '12-15/jambe', '1min'),
    ex('Gainage latéral + élévation jambe',    3, '30sec/côté',  '1min'),
  ],
}

const B1_S3 = {
  jour: 3,
  nom: 'Séance 3 — Haut du corps B',
  duree: 55,
  type: 'Calisthenics & Volume',
  intention: "🤸‍♀️ Le format EMOM construit du volume progressivement — c'est exactement ce qui va te faire gagner en tractions et en pompes. Chaque minute compte, donne ce que tu peux aujourd'hui. 🌿",
  exercices: [
    ex('Chest-to-wall handstand hold',                 4,  '25-35sec',  '1min30'),
    ex('EMOM 10min — Tractions poids de corps',        10, '3/min',     '1min'),
    ex('EMOM 10min — Pompes poids de corps',           10, '5-6/min',   '1min'),
    ex('Dips poids de corps (ou anneaux)',             3,  '8-10',      '1min30'),
    ex('Arch hold (superman)',                         3,  '45sec',     '1min'),
  ],
}

const B1_S4 = {
  jour: 4,
  nom: 'Séance 4 — Bonus bas du corps',
  duree: 40,
  type: 'Prévention & Isométrie',
  intention: "🛡️ Cette séance ne se voit pas dans le miroir, mais elle te protège pour continuer à tout donner ailleurs. Prends-la au sérieux, elle fait partie de ta force globale. 🌿",
  exercices: [
    ex('Chaise isométrique 1 jambe',               4, '30-45sec/jambe', '1min15'),
    ex('Renforcement tibial antérieur',             3, '15-20',          '1min'),
    ex('Soleus wall sit',                          3, '45sec',           '1min'),
    ex('Isométrie ischios (pont fessier 1 jambe)', 3, '30sec/jambe',    '1min'),
    ex('Routine mobilité chevilles & hanches',     2, '10/côté',         '1min'),
  ],
}

/* ── BLOC 2 — séances communes aux semaines 6, 7, 8 ────────────── */

const B2_S1 = {
  jour: 1,
  nom: 'Séance 1 — Haut du corps A',
  duree: 60,
  type: 'Force — Haut du corps',
  intention: "🔥 On commence à lester un peu plus — l'intensité augmente parce que tu es prête pour ça. Continue de faire confiance au processus. 🌿",
  exercices: [
    ex('Tractions lestées (+2,5 à +5kg)',      4, '3-4',        '2min30'),
    ex('Développé militaire debout',            4, '4-6',        '2min30'),
    ex('Pompes déclinées ou lestées',           4, '10',         '1min30'),
    ex('Tirage unilatéral DB/kettlebell',       3, '10/côté',    '1min30'),
    ex('Hollow body avec extensions',           3, '45sec',      '1min'),
  ],
}

const B2_S2 = {
  jour: 2,
  nom: 'Séance 2 — Bas du corps',
  duree: 60,
  type: 'Force — Bas du corps',
  intention: '💥 Ta chaîne postérieure devient ta plus grande alliée. Pousse fort, reste toi-même. 🌿',
  exercices: [
    ex('Bulgarian split squat',                    4, '8/jambe',       '2min'),
    ex('Soulevé de terre roumain barre ou 2 DB',   4, '8-10',          '1min30'),
    ex('Step-up explosif avec charge',             3, '8/jambe',       '1min30'),
    ex('Mollets 1 jambe sur marche',               4, '12/jambe',      '1min'),
    ex('Copenhagen plank',                         3, '25-30sec/côté', '1min'),
  ],
}

const B2_S3 = {
  jour: 3,
  nom: 'Séance 3 — Haut du corps B',
  duree: 55,
  type: 'Calisthenics & Volume',
  intention: "🏆 On change de format pour aller chercher encore plus — tes tractions, tes pompes, ton handstand. Donne tout ce que tu as, l'intensité est méritée aujourd'hui. 🌿",
  exercices: [
    ex('Handstand kick-up au mur',             5,  '3-5 essais', '1min30'),
    ex('Tractions poids de corps (test)',       4,  '8-10',       '2min'),
    ex('EMOM 10min — Pompes',                  10, '7-8/min',    '1min'),
    ex('Dips poids de corps (ou lestés)',       3,  '8',          '1min30'),
    ex('L-sit à terre ou parallettes',         3,  '15-25sec',   '1min'),
  ],
}

const B2_S4 = { ...B1_S4, jour: 4 }  // Même contenu prévention

/* ── Construire un objet semaine complet ────────────────────────── */
function makeSemaine(num, theme, intention, seances) {
  return { semaine: num, theme, intention, jours: seances }
}

const NOUVELLES_SEMAINES = [
  makeSemaine(2,
    'Construction — Force & Bases Handstand',
    'On pose les fondations. Chaque séance compte. 🌿',
    [B1_S1, B1_S2, B1_S3, B1_S4]
  ),
  makeSemaine(3,
    'Ancrage — Intensité & Progression',
    'Tu te reconnectes à ce que ton corps peut faire. 🌿',
    [B1_S1, B1_S2, B1_S3, B1_S4]
  ),
  makeSemaine(4,
    'Consolidation — Maîtrise & Régularité',
    'La régularité crée la transformation. 🌿',
    [B1_S1, B1_S2, B1_S3, B1_S4]
  ),
  makeSemaine(5,
    'Puissance — Pics & Volume',
    'Le travail paye. On monte le niveau. 🌿',
    [B1_S1, B1_S2, B1_S3, B1_S4]
  ),
  makeSemaine(6,
    'Surcharge — Force Pure & Gestion',
    'Plus de charge, même précision. Tu es prête. 🌿',
    [B2_S1, B2_S2, B2_S3, B2_S4]
  ),
  makeSemaine(7,
    'Intensité Max — Pic de Forme',
    "C'est là que la transformation devient visible. 🌿",
    [B2_S1, B2_S2, B2_S3, B2_S4]
  ),
  makeSemaine(8,
    'Performance — Test & Confirmation',
    'Montre-toi ce que tu as construit en 8 semaines. 🌿',
    [B2_S1, B2_S2, B2_S3, B2_S4]
  ),
]

/* ─────────────────────────────────────────────────────────────────
   1. Fetch programme actuel
───────────────────────────────────────────────────────────────── */
console.log('1. Récupération du programme actuel de Tiphaine…')
const res = await fetch(
  `${SUPABASE_URL}/rest/v1/ai_programmes?cliente_id=eq.${CLIENTE_ID}&select=id,statut,programme`,
  { headers }
)
const rows = await res.json()
if (!rows.length) {
  console.error('❌ Aucun ai_programme trouvé pour ce clienteId.')
  process.exit(1)
}

const existing = rows[0]
const currentProgramme = existing.programme ?? []
const sem1 = currentProgramme.find(s => Number(s.semaine) === 1)

if (!sem1) {
  console.error('❌ Semaine 1 introuvable dans le programme actuel.')
  process.exit(1)
}

console.log(`   ✓ Programme trouvé — statut: ${existing.statut} — ${currentProgramme.length} semaines`)
console.log(`   ✓ Semaine 1 préservée — thème: "${sem1.theme ?? '(pas de thème)'}"`)

/* ─────────────────────────────────────────────────────────────────
   2. Preview
───────────────────────────────────────────────────────────────── */
console.log('\n─────────────────────────────────────────────────────')
console.log('APERÇU — Semaines 2 à 8 (nouvelles données)')
console.log('─────────────────────────────────────────────────────')

const SEP  = '  '
const LINE = '  ─────────────────────────────────'

for (const sem of NOUVELLES_SEMAINES) {
  console.log(`\n📅 Semaine ${sem.semaine} — "${sem.theme}"`)
  console.log(`${SEP}💬 ${sem.intention}`)
  for (const jour of sem.jours) {
    console.log(`\n${SEP}🏋️  ${jour.nom} (${jour.duree}min)`)
    console.log(`${SEP}   ${jour.intention}`)
    console.log(LINE)
    for (const ex of jour.exercices) {
      console.log(`${SEP}   • ${ex.nom}`)
      console.log(`${SEP}     ${ex.series} × ${ex.reps}  —  repos ${ex.repos}`)
    }
  }
}

console.log('\n─────────────────────────────────────────────────────')
console.log(`✅ Semaine 1 : INTACTE (${sem1.jours?.length ?? 0} jours préservés)`)
console.log(`📝 Semaines 2-8 : REMPLACEMENT (${NOUVELLES_SEMAINES.length} semaines × 4 séances)`)
console.log(`🔒 statut: inchangé (${existing.statut}) — à republier manuellement depuis le coach`)
console.log('─────────────────────────────────────────────────────')

/* ─────────────────────────────────────────────────────────────────
   3. Confirmation
───────────────────────────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────────────────────────
   4. Save
───────────────────────────────────────────────────────────────── */
const updatedProgramme = [sem1, ...NOUVELLES_SEMAINES]

console.log('\n4. Mise à jour dans Supabase…')
const patchRes = await fetch(
  `${SUPABASE_URL}/rest/v1/ai_programmes?cliente_id=eq.${CLIENTE_ID}`,
  {
    method:  'PATCH',
    headers,
    body:    JSON.stringify({ programme: updatedProgramme }),
  }
)

if (!patchRes.ok) {
  const errText = await patchRes.text()
  console.error('❌ Erreur PATCH:', patchRes.status, errText)
  process.exit(1)
}

console.log('✅ Programme mis à jour avec succès !')
console.log('   Semaine 1 : intacte')
console.log('   Semaines 2-5 : BLOC 1 (Force & Handstand fondations)')
console.log('   Semaines 6-8 : BLOC 2 (Surcharge & Performance)')
console.log('\n👉 Pour rendre visible à Tiphaine, republier depuis la vue Coach.')
