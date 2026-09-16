import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { IS_MOCK, fetchAiProgramme } from '../../lib/supabase.js'

export const ZONES = [
  { label: 'Cheville',   emoji: '🦶' },
  { label: 'Genou',      emoji: '🦵' },
  { label: 'Dos',        emoji: '🔙' },
  { label: 'Épaule',     emoji: '💪' },
  { label: 'Nuque',      emoji: '🧘' },
  { label: 'Hanche',     emoji: '⭕' },
  { label: 'Poignet',    emoji: '🤲' },
  { label: 'Cervicales', emoji: '🔗' },
]

export default function PourquoiJaiMal() {
  const { user } = useAuth()
  const navigate  = useNavigate()

  const [publie,     setPublie]     = useState(false)
  const [loading,    setLoading]    = useState(true)
  const [fetchError, setFetchError] = useState(false)

  useEffect(() => {
    if (!user || IS_MOCK) { setLoading(false); return }
    fetchAiProgramme(user.id)
      .then(prog => setPublie(prog?.statut === 'publie'))
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false))
  }, [user])

  if (loading) return <div style={s.page}><p style={{ color: 'var(--stone)', fontSize: 'var(--tx-sm)' }}>Chargement…</p></div>

  if (fetchError) return (
    <div style={s.page}>
      <h1 style={s.title}>🩹 Pourquoi j'ai mal</h1>
      <div style={{ padding: 'var(--s5)', background: 'rgba(192,120,96,.08)', border: '1px solid rgba(192,120,96,.2)', borderRadius: 'var(--r-md)' }}>
        <p style={{ fontSize: 'var(--tx-sm)', color: 'var(--terracotta)', lineHeight: 1.6 }}>
          Impossible de vérifier le statut de ton programme. Réessaie ou{' '}
          <a href="https://wa.me/33650947117" target="_blank" rel="noreferrer" style={{ color: 'var(--terracotta)', fontWeight: 600 }}>contacte Lysa sur WhatsApp</a>.
        </p>
      </div>
    </div>
  )

  if (!publie) return (
    <div style={s.page}>
      <h1 style={s.title}>🩹 Pourquoi j'ai mal</h1>
      <div style={s.gate}>
        <span style={{ fontSize: '2rem' }}>🔒</span>
        <p style={s.gateText}>Disponible dès la publication de ton programme personnalisé.</p>
      </div>
    </div>
  )

  return (
    <div style={s.page}>
      <h1 style={s.title}>🩹 Pourquoi j'ai mal</h1>
      <p style={s.intro}>Clique sur une zone pour comprendre ce qui se passe dans ton corps.</p>

      <div style={s.grid}>
        {ZONES.map(({ label, emoji }) => (
          <button
            key={label}
            style={s.zoneCard}
            onClick={() => navigate(`/pourquoi-jai-mal/${encodeURIComponent(label)}`)}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--sh-md)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'var(--shadow-sm)' }}
          >
            <span style={{ fontSize: '2rem' }}>{emoji}</span>
            <span style={s.zoneLabel}>{label}</span>
            <span style={s.zoneArrow}>→</span>
          </button>
        ))}
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
  grid:      { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 'var(--s4)' },
  zoneCard:  {
    background: 'var(--white)', border: '1px solid var(--sand)', borderRadius: 'var(--r-md)',
    padding: 'var(--s6) var(--s4)', display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 'var(--s3)', cursor: 'pointer',
    boxShadow: 'var(--shadow-sm)', transition: 'transform 150ms ease, box-shadow 150ms ease',
  },
  zoneLabel: { fontSize: 'var(--tx-sm)', fontWeight: 600, color: 'var(--earth)', textAlign: 'center' },
  zoneArrow: { fontSize: 'var(--tx-xs)', color: 'var(--stone)' },
}
