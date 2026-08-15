import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { IS_MOCK, fetchAiProgramme, supabase } from '../../lib/supabase.js'

export const PODCASTS = [
  { sem: 1, titre: 'La confiance en soi',               audioUrl: '1_CONFIANCE EN SOI.mp3' },
  { sem: 2, titre: "L'effet cumulé",                     audioUrl: "2_L'EFFET CUMULE.mp3" },
  { sem: 3, titre: 'La zone de confort',                 audioUrl: '3_LA ZONE DE CONFORT.mp3' },
  { sem: 4, titre: "L'exigence",                         audioUrl: "4_L'EXIGENCE.mp3" },
  { sem: 5, titre: 'La partie de toi qui...',            audioUrl: null },
  { sem: 6, titre: 'Le corps comme allié',               audioUrl: null },
  { sem: 7, titre: 'La régularité sans perfectionnisme', audioUrl: null },
  { sem: 8, titre: 'Ce que tu as construit',             audioUrl: null },
]

export function PodcastPlayer({ audioUrl }) {
  const [signedUrl,  setSignedUrl]  = useState(null)
  const [loadError,  setLoadError]  = useState(false)

  useEffect(() => {
    if (!audioUrl || IS_MOCK) return
    console.log('[PodcastPlayer] createSignedUrl — path:', audioUrl)
    supabase.storage
      .from('podcasts-prives')
      .createSignedUrl(audioUrl, 3600)
      .then(({ data, error }) => {
        if (error) {
          console.error('[PodcastPlayer] createSignedUrl error:', {
            message:    error.message,
            statusCode: error.statusCode,
            name:       error.name,
            error,
          })
          console.log('[PodcastPlayer] data on error:', data)
          setLoadError(true)
          return
        }
        console.log('[PodcastPlayer] signed URL ok:', data.signedUrl)
        setSignedUrl(data.signedUrl)
      })
  }, [audioUrl])

  if (!audioUrl) return (
    <div style={pl.placeholder}>🎙️ Audio bientôt disponible</div>
  )
  if (loadError) return (
    <p style={pl.error}>Impossible de charger l'audio.</p>
  )
  if (!signedUrl) return (
    <p style={pl.loading}>Chargement audio…</p>
  )
  return (
    <audio controls preload="none" style={pl.audio}>
      <source src={signedUrl} type="audio/mpeg" />
      Ton navigateur ne supporte pas la lecture audio.
    </audio>
  )
}

const pl = {
  placeholder: {
    fontSize: 'var(--tx-xs)', color: 'var(--stone)', fontStyle: 'italic',
    background: 'var(--sand)', borderRadius: 'var(--r-sm)',
    padding: '8px 14px', marginTop: 10, display: 'inline-block',
  },
  error:   { fontSize: 'var(--tx-xs)', color: 'var(--terracotta)', margin: '10px 0 0' },
  loading: { fontSize: 'var(--tx-xs)', color: 'var(--stone)', margin: '10px 0 0' },
  audio:   { width: '100%', display: 'block', marginTop: 12, accentColor: 'var(--forest)' },
}

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

  if (loading) return (
    <div style={s.page}>
      <p style={{ color: 'var(--stone)', fontSize: 'var(--tx-sm)' }}>Chargement…</p>
    </div>
  )

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
        {PODCASTS.map(({ sem, titre, audioUrl }) => {
          const unlocked = sem <= currentSem
          return (
            <div key={sem} style={{ ...s.card, ...(!unlocked ? s.cardLocked : {}) }}>
              <div style={s.cardLeft}>
                <div style={{ ...s.semBadge, ...(!unlocked ? s.badgeLocked : {}) }}>S{sem}</div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ ...s.cardTitle, ...(!unlocked ? s.textLocked : {}) }}>{titre}</p>
                {unlocked ? (
                  <>
                    <p style={s.semLabel}>🎙️ Semaine {sem}</p>
                    <PodcastPlayer audioUrl={audioUrl} />
                  </>
                ) : (
                  <p style={{ ...s.semLabel, ...s.textLocked }}>Déblocage semaine {sem}</p>
                )}
              </div>
              {!unlocked && <span style={s.lock}>🔒</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const s = {
  page:      { padding: 'var(--s8) var(--s6)', maxWidth: 640 },
  title:     { fontFamily: 'var(--serif)', fontSize: 'var(--tx-2xl)', color: 'var(--forest)', fontWeight: 400, marginBottom: 'var(--s3)' },
  intro:     { fontSize: 'var(--tx-sm)', color: 'var(--stone)', marginBottom: 'var(--s7)' },
  gate:      { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--s4)', padding: 'var(--s10)', background: 'var(--sand)', borderRadius: 'var(--r-lg)', textAlign: 'center' },
  gateText:  { fontSize: 'var(--tx-sm)', color: 'var(--stone)', maxWidth: 320, lineHeight: 1.6, margin: 0 },
  list:      { display: 'flex', flexDirection: 'column', gap: 'var(--s4)' },
  card:      { background: 'var(--white)', borderRadius: 'var(--r-md)', padding: 'clamp(16px, 4vw, 24px)', boxShadow: 'var(--shadow-sm)', display: 'flex', gap: 'var(--s4)', alignItems: 'flex-start' },
  cardLocked:{ opacity: .45 },
  cardLeft:  { flexShrink: 0, paddingTop: 3 },
  semBadge:  { width: 36, height: 36, borderRadius: '50%', background: 'var(--sage)', color: 'var(--forest)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, letterSpacing: '.02em' },
  badgeLocked:{ background: 'var(--mist)', color: 'var(--stone)' },
  cardTitle: { fontSize: 'var(--tx-sm)', fontWeight: 600, color: 'var(--forest)', lineHeight: 1.4, margin: '0 0 4px' },
  semLabel:  { fontSize: 'var(--tx-xs)', color: 'var(--stone)', margin: 0 },
  textLocked:{ color: 'var(--stone)' },
  lock:      { fontSize: 13, flexShrink: 0 },
}
