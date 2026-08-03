import { useParams, useNavigate } from 'react-router-dom'

export default function PourquoiJaiMalZone() {
  const { zone }  = useParams()
  const navigate  = useNavigate()
  const label     = decodeURIComponent(zone ?? '')

  return (
    <div style={s.page}>
      <button style={s.back} onClick={() => navigate('/pourquoi-jai-mal')}>← Retour</button>
      <h1 style={s.title}>🩹 {label}</h1>
      <div style={s.placeholder}>
        <span style={{ fontSize: '2.5rem' }}>🚧</span>
        <p style={s.text}>Contenu à venir pour <strong>{label}</strong>.</p>
        <p style={s.sub}>Explications, causes fréquentes et conseils — en cours d'ajout.</p>
      </div>
    </div>
  )
}

const s = {
  page:        { padding: 'var(--s8) var(--s6)', maxWidth: 600 },
  back:        { background: 'none', border: 'none', color: 'var(--stone)', fontSize: 'var(--tx-sm)', cursor: 'pointer', padding: 0, marginBottom: 'var(--s6)' },
  title:       { fontFamily: 'var(--serif)', fontSize: 'var(--tx-2xl)', color: 'var(--forest)', fontWeight: 400, marginBottom: 'var(--s6)' },
  placeholder: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--s4)', padding: 'var(--s10)', background: 'var(--sand)', borderRadius: 'var(--r-lg)', textAlign: 'center' },
  text:        { fontSize: 'var(--tx-sm)', color: 'var(--earth)', margin: 0 },
  sub:         { fontSize: 'var(--tx-xs)', color: 'var(--stone)', margin: 0, lineHeight: 1.6 },
}
