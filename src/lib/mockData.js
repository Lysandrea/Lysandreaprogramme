/* ════════════════════════════════
   Mock data — Lysa Andréa
   ════════════════════════════════ */

/* Camille is on J3 — J1 and J2 are done */
export const MOCK_CURRENT_DAY = 3

const SEANCE_TITLES = [
  'Mobilité & respiration',
  'Force — membres inférieurs',
  'Cardio doux + gainage',
  'Force — membres supérieurs',
  'Récupération active',
  'Circuit complet',
  'Repos actif',
]

const SEANCE_DURATIONS = [35, 45, 40, 50, 30, 55, 20]

export const MOCK_DAYS = Array.from({ length: 56 }, (_, i) => {
  const jour      = i + 1
  const semaine   = Math.ceil(jour / 7)
  const isDone    = jour < MOCK_CURRENT_DAY
  const isCurrent = jour === MOCK_CURRENT_DAY
  const isLocked  = jour > MOCK_CURRENT_DAY
  const titleIdx  = (jour - 1) % 7

  return {
    jour,
    semaine,
    titre:     SEANCE_TITLES[titleIdx],
    duree:     SEANCE_DURATIONS[titleIdx],
    status:    isDone ? 'done' : isCurrent ? 'current' : 'locked',
    bilanFait: isDone,  // J1 and J2 have bilans done
  }
})

/* ── Mock exercises for JourDetail ── */
export const MOCK_EXERCICES = [
  {
    id: 1,
    nom:    'Squat bodyweight',
    detail: '3 séries × 15 répétitions — Tempo 3-1-2',
    duree:  '10 min',
    conseil: "Garde le dos droit, descends jusqu'à 90°.",
  },
  {
    id: 2,
    nom:    'Fentes alternées',
    detail: '3 séries × 12 répétitions / jambe',
    duree:  '10 min',
    conseil: 'Le genou avant ne dépasse pas la pointe du pied.',
  },
  {
    id: 3,
    nom:    'Gainage avant',
    detail: '3 séries × 40 secondes — respiration profonde',
    duree:  '8 min',
    conseil: "Corps aligné tête-talons, respire dans le ventre.",
  },
]

/* ── Coach: 3 clientes ── */
export const MOCK_CLIENTES = [
  {
    id:               'camille',
    prenom:           'Camille',
    nom:              'Durand',
    email:            'camille@email.fr',
    status:           'active',
    jourActuel:       3,
    bilansEnAttente:  0,
    derniereBilanDate: '2024-05-26',
    joinDate:         '2024-05-24',
    semaine:          1,
  },
  {
    id:               'sarah',
    prenom:           'Sarah',
    nom:              'Moreau',
    email:            'sarah@email.fr',
    status:           'active',
    jourActuel:       12,
    bilansEnAttente:  1,
    derniereBilanDate: '2024-05-20',
    joinDate:         '2024-05-16',
    semaine:          2,
  },
  {
    id:               'julie',
    prenom:           'Julie',
    nom:              'Lambert',
    email:            'julie@email.fr',
    status:           'onboarding',
    jourActuel:       1,
    bilansEnAttente:  0,
    derniereBilanDate: null,
    joinDate:         '2024-05-27',
    semaine:          1,
  },
]

/* ── Motivational messages ── */
export const MOTIVATIONAL_MESSAGES = [
  "Chaque pas compte. Tu es exactement là où tu dois être.",
  "La régularité crée la transformation.",
  "Le corps sait. Il suffit d'apprendre à l'écouter.",
  "Tu n'es pas en retard. Continue.",
  "Prends soin de toi aujourd'hui.",
  "La force se construit dans la constance.",
  "Sois fière du chemin parcouru.",
]

/* ── Mock recent bilans (for ClienteDetail) ── */
export const MOCK_BILANS = [
  {
    jour: 2,
    date: '2024-05-26',
    bodyFeeling: 3,   // index 0-4 of emoji array
    gratitude: "Le soleil, ma famille, mon corps qui bouge, ce programme, la musique.",
    lecon:     "Je peux faire plus que ce que je crois.",
    emotion:   "Fierté.",
    lacher:    "La peur de ne pas être à la hauteur.",
  },
  {
    jour: 1,
    date: '2024-05-25',
    bodyFeeling: 2,
    gratitude:   "Ma santé, l'eau fraîche, une bonne nuit de sommeil, Lysa, mon tapis de yoga.",
    lecon:      "Commencer est la partie la plus difficile.",
    emotion:    "Appréhension mêlée d'excitation.",
    lacher:     "Le besoin de tout contrôler.",
  },
]
