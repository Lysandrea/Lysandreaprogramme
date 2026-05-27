/* ── Mock programme data (56 jours = 8 semaines) ── */

export const MOCK_CURRENT_DAY = 2   // J2 is "today"

export const MOCK_DAYS = Array.from({ length: 56 }, (_, i) => {
  const jour = i + 1
  const isDone    = jour < MOCK_CURRENT_DAY
  const isCurrent = jour === MOCK_CURRENT_DAY
  const isLocked  = jour > MOCK_CURRENT_DAY

  const SEANCES = [
    'Mobilité & respiration',
    'Force — membres inférieurs',
    'Cardio doux + gainage',
    'Force — membres supérieurs',
    'Récupération active',
    'Circuit complet',
    'Repos actif',
  ]

  return {
    jour,
    semaine: Math.ceil(jour / 7),
    titre: SEANCES[(jour - 1) % SEANCES.length],
    duree: 35 + ((jour * 7) % 25),   // between 35–60 min
    status: isDone ? 'done' : isCurrent ? 'current' : 'locked',
    bilanFait: isDone ? jour % 3 !== 0 : false,
  }
})

export const MOCK_CLIENTES = [
  {
    id: 'c1',
    prenom: 'Camille',
    nom: 'Durand',
    email: 'camille@email.fr',
    status: 'active',
    jourActuel: 14,
    derniereBilanDate: '2024-01-22',
    joinDate: '2024-01-10',
  },
  {
    id: 'c2',
    prenom: 'Elodie',
    nom: 'Martin',
    email: 'elodie@email.fr',
    status: 'onboarding',
    jourActuel: 2,
    derniereBilanDate: null,
    joinDate: '2024-01-21',
  },
  {
    id: 'c3',
    prenom: 'Sophie',
    nom: 'Bernard',
    email: 'sophie@email.fr',
    status: 'silent',
    jourActuel: 28,
    derniereBilanDate: '2024-01-10',
    joinDate: '2023-12-15',
  },
  {
    id: 'c4',
    prenom: 'Marine',
    nom: 'Lefebvre',
    email: 'marine@email.fr',
    status: 'active',
    jourActuel: 42,
    derniereBilanDate: '2024-01-23',
    joinDate: '2023-11-20',
  },
]

export const MOTIVATIONAL_MESSAGES = [
  "Chaque pas compte. Tu es exactement là où tu dois être.",
  "La régularité crée la transformation.",
  "Le corps sait. Il suffit d'apprendre à l'écouter.",
  "Tu n'es pas en retard. Continue.",
  "Prends soin de toi aujourd'hui.",
]
