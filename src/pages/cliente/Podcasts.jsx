import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { IS_MOCK, fetchAiProgramme } from '../../lib/supabase.js'

const PODCASTS = [
  { sem: 1, titre: 'La confiance en soi' },
  { sem: 2, titre: "L'effet cumulé" },
  { sem: 3, titre: 'La zone de confort' },
  { sem: 4, titre: "L'exigence" },
  { sem: 5, titre: 'La partie de toi qui...' },
  { sem: 6, titre: 'Le corps comme allié' },
  { sem: 7, titre: 'La régularité sans perfectionnisme' },
  { sem: 8, titre: 'Ce que tu as construit' },
]

export default function Podcasts() {
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
      <h1 style={s.title}>Mes podcasts</h1>
      <div style={s.gate}>
        <span style={{ fontSize: '2rem' }}>🔒</span>
        <p style={s.gateText}>Disponible dès la publication de ton programme personnalisé.</p>
      </div>
    </div>
  )

  return (
    <div style={s.page}>
      <h1 style={s.title}>Mes podcasts</h1>
      <p style={s.intro}>Un épisode se débloque chaque semaine au fil de ton programme.</p>

      <div style={s.list}>
        {PODCASTS.map(({ sem, titre }) => {
          const unlocked = sem <= currentSem
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
                    <p style={s.cardDesc}>Épisode à venir — contenu audio en cours d'ajout.</p>
                    <div style={s.cardMeta}>
                      <span style={s.metaItem}>🎙️ Semaine {sem}</span>
                      <button style={s.playBtn} disabled>▶ Bientôt disponible</button>
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
  page:       { padding: 'var(--s8) var(--s6)', maxWidth: 640 },
  title:      { fontFamily: 'var(--serif)', fontSize: 'var(--tx-2xl)', color: 'var(--forest)', fontWeight: 400, marginBottom: 'var(--s3)' },
  intro:      { fontSize: 'var(--tx-sm)', color: 'var(--stone)', marginBottom: 'var(--s7)' },
  gate:       { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--s4)', padding: 'var(--s10)', background: 'var(--sand)', borderRadius: 'var(--r-lg)', textAlign: 'center' },
  gateText:   { fontSize: 'var(--tx-sm)', color: 'var(--stone)', maxWidth: 320, lineHeight: 1.6, margin: 0 },
  list:       { display: 'flex', flexDirection: 'column', gap: 'var(--s4)' },
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
  cardMeta:   { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'var(--s3)' },
  metaItem:   { fontSize: 'var(--tx-xs)', color: 'var(--stone)' },
  playBtn:    { background: 'var(--sand)', color: 'var(--stone)', border: 'none', borderRadius: 99, padding: '4px 14px', fontSize: 'var(--tx-xs)', fontWeight: 500, cursor: 'not-allowed', opacity: .7 },
}
