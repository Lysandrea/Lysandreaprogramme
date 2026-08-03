import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { IS_MOCK, fetchAiProgramme, fetchBilansJourNums } from '../../lib/supabase.js'

/* 8 weeks × 2 recipes each */
const RECETTES = Array.from({ length: 8 }, (_, i) => {
  const sem = i + 1
  return [
    { sem, type: 'A', titre: `Recette A — Semaine ${sem}` },
    { sem, type: 'B', titre: `Recette B — Semaine ${sem}`, bonus: true },
  ]
}).flat()

function bilansInWeek(bilansJourNums, sem) {
  const from = (sem - 1) * 7 + 1
  const to   = sem * 7
  return bilansJourNums.filter(n => n >= from && n <= to).length
}

export default function Recettes() {
  const { user, profile } = useAuth()
  const currentSem = Math.min(Math.ceil((profile?.current_day ?? 1) / 7), 8)

  const [publie,          setPublie]          = useState(false)
  const [bilansJourNums,  setBilansJourNums]  = useState([])
  const [loading,         setLoading]         = useState(true)

  useEffect(() => {
    if (!user || IS_MOCK) { setLoading(false); return }
    Promise.all([
      fetchAiProgramme(user.id),
      fetchBilansJourNums(user.id),
    ])
      .then(([prog, bilans]) => {
        setPublie(prog?.statut === 'publie')
        setBilansJourNums(bilans)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user])

  if (loading) return <div style={s.page}><p style={{ color: 'var(--stone)', fontSize: 'var(--tx-sm)' }}>Chargement…</p></div>

  if (!publie) return (
    <div style={s.page}>
      <h1 style={s.title}>Mes recettes</h1>
      <div style={s.gate}>
        <span style={{ fontSize: '2rem' }}>🔒</span>
        <p style={s.gateText}>Disponible dès la publication de ton programme personnalisé.</p>
      </div>
    </div>
  )

  return (
    <div style={s.page}>
      <h1 style={s.title}>Mes recettes</h1>
      <p style={s.intro}>
        Une recette se débloque chaque semaine. La recette bonus 🎁 se débloque dès ton 3ème bilan de la semaine.
      </p>

      <div style={s.list}>
        {RECETTES.map(({ sem, type, titre, bonus }) => {
          const unlocked = bonus
            ? bilansInWeek(bilansJourNums, sem) >= 3
            : sem <= currentSem

          return (
            <div key={`${sem}-${type}`} style={{ ...s.card, ...(!unlocked ? s.cardLocked : {}) }}>
              <div style={s.cardHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s3)' }}>
                  <span style={{ ...s.semBadge, ...(!unlocked ? s.badgeLocked : {}) }}>S{sem}</span>
                  {bonus && <span style={s.bonusBadge}>🎁 Bonus</span>}
                </div>
                {!unlocked && <span>🔒</span>}
              </div>
              <h3 style={{ ...s.cardTitle, ...(!unlocked ? s.textLocked : {}) }}>{titre}</h3>
              <p style={{ ...s.cardDesc, ...(!unlocked ? s.textLocked : {}) }}>
                {unlocked
                  ? 'Recette à venir — contenu en cours d\'ajout.'
                  : bonus
                    ? `Débloqué après 3 bilans en semaine ${sem}`
                    : `Débloqué à la semaine ${sem}`}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const s = {
  page:       { padding: 'var(--s8) var(--s6)', maxWidth: 700 },
  title:      { fontFamily: 'var(--serif)', fontSize: 'var(--tx-2xl)', color: 'var(--forest)', fontWeight: 400, marginBottom: 'var(--s3)' },
  intro:      { fontSize: 'var(--tx-sm)', color: 'var(--stone)', marginBottom: 'var(--s7)', lineHeight: 1.6 },
  gate:       { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--s4)', padding: 'var(--s10)', background: 'var(--sand)', borderRadius: 'var(--r-lg)', textAlign: 'center' },
  gateText:   { fontSize: 'var(--tx-sm)', color: 'var(--stone)', maxWidth: 320, lineHeight: 1.6, margin: 0 },
  list:       { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--s5)' },
  card:       { background: 'var(--white)', borderRadius: 'var(--r-md)', padding: 'var(--s6)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: 'var(--s3)' },
  cardLocked: { opacity: .5 },
  cardHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  semBadge:   { padding: '2px 10px', borderRadius: 99, background: 'var(--sage)', color: 'var(--forest)', fontSize: 10, fontWeight: 700, letterSpacing: '.04em' },
  badgeLocked:{ background: 'var(--mist)', color: 'var(--stone)' },
  bonusBadge: { fontSize: 10, color: 'var(--bark)', fontWeight: 500 },
  cardTitle:  { fontSize: 'var(--tx-sm)', fontWeight: 600, color: 'var(--forest)', lineHeight: 1.4, margin: 0 },
  cardDesc:   { fontSize: 'var(--tx-xs)', color: 'var(--stone)', lineHeight: 1.55, margin: 0 },
  textLocked: { color: 'var(--stone)' },
}
