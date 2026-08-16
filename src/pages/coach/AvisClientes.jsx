import { useEffect, useState } from 'react'
import { fetchAllAvis } from '../../lib/supabase.js'

export default function AvisClientes() {
  const [avis,    setAvis]    = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    fetchAllAvis()
      .then(setAvis)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h1 style={s.title}>⭐ Avis clientes</h1>
        {!loading && !error && (
          <span style={s.badge}>{avis.length} avis</span>
        )}
      </div>

      {loading && <p style={s.empty}>Chargement…</p>}
      {error   && <p style={{ ...s.empty, color: 'var(--terracotta)' }}>Erreur : {error}</p>}

      {!loading && !error && avis.length === 0 && (
        <p style={s.empty}>Aucun avis pour le moment.</p>
      )}

      {!loading && !error && avis.length > 0 && (
        <div style={s.list}>
          {avis.map(a => (
            <AvisCard key={a.id} avis={a} />
          ))}
        </div>
      )}
    </div>
  )
}

function AvisCard({ avis: a }) {
  const prenom  = a.profiles?.prenom ?? 'Cliente'
  const dateStr = new Date(a.created_at).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div style={s.card}>
      <div style={s.cardHeader}>
        <div style={s.avatar}>{prenom[0]?.toUpperCase()}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={s.prenom}>{prenom}</p>
          <p style={s.date}>{dateStr}</p>
        </div>
        <div style={s.stars}>
          {Array.from({ length: 5 }, (_, i) => (
            <span key={i} style={{ fontSize: 20, color: i < a.note ? '#F5A623' : 'var(--mist)' }}>★</span>
          ))}
        </div>
      </div>
      {a.commentaire && (
        <p style={s.commentaire}>"{a.commentaire}"</p>
      )}
    </div>
  )
}

const s = {
  page:        { padding: 'var(--s8) var(--s6)', maxWidth: 680, display: 'flex', flexDirection: 'column', gap: 'var(--s6)' },
  header:      { display: 'flex', alignItems: 'baseline', gap: 'var(--s4)', flexWrap: 'wrap' },
  title:       { fontFamily: 'var(--serif)', fontSize: 'var(--tx-2xl)', color: 'var(--forest)', fontWeight: 400, margin: 0 },
  badge:       { fontSize: 'var(--tx-xs)', background: 'rgba(61,79,60,.1)', color: 'var(--forest)', padding: '3px 10px', borderRadius: 99, fontWeight: 600 },
  empty:       { fontSize: 'var(--tx-sm)', color: 'var(--stone)' },
  list:        { display: 'flex', flexDirection: 'column', gap: 'var(--s4)' },
  card:        { background: 'var(--white)', border: '1px solid var(--sand)', borderRadius: 'var(--r-lg)', padding: 'var(--s6)', boxShadow: 'var(--sh-sm)', display: 'flex', flexDirection: 'column', gap: 'var(--s4)' },
  cardHeader:  { display: 'flex', alignItems: 'center', gap: 'var(--s4)' },
  avatar:      { width: 40, height: 40, borderRadius: '50%', background: 'var(--sand)', color: 'var(--earth)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 'var(--tx-sm)', flexShrink: 0 },
  prenom:      { fontSize: 'var(--tx-sm)', fontWeight: 600, color: 'var(--earth)', margin: 0 },
  date:        { fontSize: 'var(--tx-xs)', color: 'var(--stone)', marginTop: 2 },
  stars:       { display: 'flex', gap: 2, flexShrink: 0 },
  commentaire: { fontSize: 'var(--tx-sm)', color: 'var(--bark)', lineHeight: 1.7, fontStyle: 'italic', margin: 0, paddingTop: 'var(--s2)', borderTop: '1px solid var(--sand)' },
}
