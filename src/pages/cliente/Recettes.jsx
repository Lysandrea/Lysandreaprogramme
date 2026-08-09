import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { IS_MOCK, fetchAiProgramme } from '../../lib/supabase.js'

const RECETTES = [
  {
    sem: 1,
    titre: '🍌 Mon petit pot banane & chocolat',
    content: {
      photo: 'https://omcednuoxfmhyfwmrmmp.supabase.co/storage/v1/object/public/photo-recettes/PETIT%20POT.png',
      tagline: "Un petit-déjeuner ou une collation ultra gourmande, facile à préparer à l'avance… avec cette petite coque de chocolat qui craque sous la cuillère. 🤤",
      ingredients: [
        '🍌 1 banane bien mûre',
        '🥛 125 g de yaourt soja nature ou de skyr',
        '🌾 30 g de flocons d\'avoine',
        '🌱 1 c. à café de graines de chia',
        '💪 30 g de whey vanille (facultatif)',
        '🍫 10 g de chocolat noir 70 %',
      ],
      steps: [
        'Écrase la banane dans un bol à l\'aide d\'une fourchette.',
        'Ajoute le yaourt ou le skyr, les flocons d\'avoine, les graines de chia et, si tu le souhaites, la whey vanille.',
        'Mélange bien jusqu\'à obtenir une préparation homogène et crémeuse.',
        'Verse la préparation dans un petit pot en verre.',
        'Fais fondre le chocolat noir 70 % puis verse-le délicatement sur toute la surface afin de créer une fine couche.',
        'Place le pot au réfrigérateur pendant environ 1 heure.',
      ],
      note: "✨ Le chocolat va alors durcir et former une petite coque croquante. Il ne reste plus qu'à donner un petit coup de cuillère pour la casser… et déguster !",
      tip: "💡 Petit + gourmand — Tu peux personnaliser ton petit pot avec quelques fruits rouges, des noisettes concassées, de la noix de coco ou une petite cuillère de beurre de cacahuète. Simple, rassasiant et surtout : beaucoup trop bon. 🤎",
    },
  },
  { sem: 2, titre: 'Recette de la semaine 2' },
  { sem: 3, titre: 'Recette de la semaine 3' },
  { sem: 4, titre: 'Recette de la semaine 4' },
  { sem: 5, titre: 'Recette de la semaine 5' },
  { sem: 6, titre: 'Recette de la semaine 6' },
  { sem: 7, titre: 'Recette de la semaine 7' },
  { sem: 8, titre: 'Recette de la semaine 8' },
]

function RecetteDetail({ sem, titre, content }) {
  const { photo, tagline, ingredients, steps, note, tip } = content
  return (
    <div style={s.detailCard}>
      <div style={s.detailBadge}>S{sem}</div>
      <img src={photo} alt={titre} style={s.detailPhoto} />
      <div style={s.detailBody}>
        <h2 style={s.detailTitle}>{titre}</h2>
        <p style={s.detailTagline}>{tagline}</p>

        <div style={s.detailColumns}>
          <div style={s.detailCol}>
            <h3 style={s.colHeading}>Ingrédients</h3>
            <ul style={s.ingredientList}>
              {ingredients.map((ing, i) => (
                <li key={i} style={s.ingredientItem}>{ing}</li>
              ))}
            </ul>
          </div>
          <div style={s.detailCol}>
            <h3 style={s.colHeading}>Préparation</h3>
            <ol style={s.stepList}>
              {steps.map((step, i) => (
                <li key={i} style={s.stepItem}>
                  <span style={s.stepNum}>{i + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div style={s.noteBox}>
          <p style={s.noteText}>{note}</p>
        </div>
        <div style={s.tipBox}>
          <p style={s.noteText}>{tip}</p>
        </div>
      </div>
    </div>
  )
}

export default function Recettes() {
  const { user, profile } = useAuth()
  const currentSem = Math.min(Math.ceil((profile?.current_day ?? 1) / 7), 8)

  const [publie,  setPublie]  = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || IS_MOCK) { setLoading(false); return }
    fetchAiProgramme(user.id)
      .then(prog => setPublie(prog?.statut === 'publie'))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user])

  if (loading) return <div style={s.page}><p style={{ color: 'var(--stone)', fontSize: 'var(--tx-sm)' }}>Chargement…</p></div>

  if (!publie) return (
    <div style={s.page}>
      <h1 style={s.title}>Le rendez-vous gourmand</h1>
      <div style={s.gate}>
        <span style={{ fontSize: '2rem' }}>🔒</span>
        <p style={s.gateText}>Disponible dès la publication de ton programme personnalisé.</p>
      </div>
    </div>
  )

  return (
    <div style={s.page}>
      <h1 style={s.title}>Le rendez-vous gourmand</h1>
      <p style={s.intro}>Une recette se débloque chaque semaine au fil de ton programme.</p>

      <div style={s.list}>
        {RECETTES.map(({ sem, titre, content }) => {
          const unlocked = sem <= currentSem

          if (unlocked && content) {
            return <RecetteDetail key={sem} sem={sem} titre={titre} content={content} />
          }

          return (
            <div key={sem} style={{ ...s.card, ...(!unlocked ? s.cardLocked : {}) }}>
              <div style={s.cardLeft}>
                <div style={{ ...s.semBadge, ...(!unlocked ? s.badgeLocked : {}) }}>S{sem}</div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={s.cardTop}>
                  <p style={{ ...s.cardTitle, ...(!unlocked ? s.textLocked : {}) }}>{titre}</p>
                  {!unlocked && <span style={s.lock}>🔒</span>}
                </div>
                {unlocked ? (
                  <>
                    <p style={s.cardDesc}>Recette à venir — contenu en cours d'ajout.</p>
                    <div style={s.cardMeta}>
                      <span style={s.metaItem}>🍲 Semaine {sem}</span>
                    </div>
                  </>
                ) : (
                  <p style={{ ...s.cardDesc, ...s.textLocked }}>Déblocage semaine {sem}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const s = {
  page:       { padding: 'var(--s8) var(--s6)', maxWidth: 760 },
  title:      { fontFamily: 'var(--serif)', fontSize: 'var(--tx-2xl)', color: 'var(--forest)', fontWeight: 400, marginBottom: 'var(--s3)' },
  intro:      { fontSize: 'var(--tx-sm)', color: 'var(--stone)', marginBottom: 'var(--s7)' },
  gate:       { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--s4)', padding: 'var(--s10)', background: 'var(--sand)', borderRadius: 'var(--r-lg)', textAlign: 'center' },
  gateText:   { fontSize: 'var(--tx-sm)', color: 'var(--stone)', maxWidth: 320, lineHeight: 1.6, margin: 0 },
  list:       { display: 'flex', flexDirection: 'column', gap: 'var(--s4)' },

  /* Compact row card (placeholder weeks) */
  card:       { background: 'var(--white)', borderRadius: 'var(--r-md)', padding: 'var(--s5) var(--s6)', boxShadow: 'var(--shadow-sm)', display: 'flex', gap: 'var(--s5)', alignItems: 'flex-start' },
  cardLocked: { opacity: .5 },
  cardLeft:   { flexShrink: 0 },
  semBadge:   { width: 36, height: 36, borderRadius: '50%', background: 'var(--sage)', color: 'var(--forest)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, letterSpacing: '.02em' },
  badgeLocked:{ background: 'var(--mist)', color: 'var(--stone)' },
  cardTop:    { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 4 },
  cardTitle:  { fontSize: 'var(--tx-sm)', fontWeight: 600, color: 'var(--forest)', lineHeight: 1.4, margin: 0 },
  cardDesc:   { fontSize: 'var(--tx-xs)', color: 'var(--stone)', lineHeight: 1.55, margin: 0 },
  textLocked: { color: 'var(--stone)' },
  lock:       { fontSize: 13, flexShrink: 0 },
  cardMeta:   { display: 'flex', alignItems: 'center', marginTop: 'var(--s3)' },
  metaItem:   { fontSize: 'var(--tx-xs)', color: 'var(--stone)' },

  /* Full recipe card */
  detailCard:    { background: 'var(--white)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden', position: 'relative' },
  detailBadge:   { position: 'absolute', top: 14, left: 14, zIndex: 2, width: 34, height: 34, borderRadius: '50%', background: 'var(--sage)', color: 'var(--forest)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, letterSpacing: '.02em', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' },
  detailPhoto:   { width: '100%', height: 280, objectFit: 'cover', display: 'block' },
  detailBody:    { padding: 'var(--s7) var(--s7) var(--s8)', display: 'flex', flexDirection: 'column', gap: 'var(--s6)' },
  detailTitle:   { fontFamily: 'var(--serif)', fontSize: 'var(--tx-xl)', fontWeight: 400, color: 'var(--forest)', lineHeight: 1.25, margin: 0 },
  detailTagline: { fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 'var(--tx-base)', color: 'var(--bark)', lineHeight: 1.7, margin: 0, opacity: 0.85 },

  /* Two-column layout — stacks naturally when container is narrow */
  detailColumns: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--s7)', alignItems: 'start' },
  detailCol:     { display: 'flex', flexDirection: 'column', gap: 'var(--s4)' },
  colHeading:    { fontFamily: 'var(--font-sans)', fontSize: 'var(--tx-xs)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--stone)', margin: 0 },

  ingredientList: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--s2)' },
  ingredientItem: { fontSize: 'var(--tx-sm)', color: 'var(--bark)', lineHeight: 1.55, paddingLeft: 0 },

  stepList: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--s4)' },
  stepItem: { display: 'flex', gap: 'var(--s3)', alignItems: 'flex-start', fontSize: 'var(--tx-sm)', color: 'var(--bark)', lineHeight: 1.6 },
  stepNum:  { flexShrink: 0, width: 22, height: 22, borderRadius: '50%', background: 'var(--forest)', color: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, marginTop: 1 },

  noteBox: { background: 'var(--sand)', borderRadius: 'var(--r-md)', padding: 'var(--s5) var(--s6)' },
  tipBox:  { background: 'var(--sand)', borderRadius: 'var(--r-md)', padding: 'var(--s5) var(--s6)' },
  noteText: { fontSize: 'var(--tx-sm)', color: 'var(--earth)', lineHeight: 1.7, margin: 0 },
}
