import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { fetchAvis, saveAvis } from '../../lib/supabase.js'

export default function Avis() {
  const { user, profile } = useAuth()
  const currentSem = Math.ceil((profile?.current_day ?? 1) / 7)
  const locked     = currentSem < 8

  const [note,        setNote]        = useState(0)
  const [commentaire, setCommentaire] = useState('')
  const [alreadySent, setAlreadySent] = useState(false)
  const [saving,      setSaving]      = useState(false)
  const [saved,       setSaved]       = useState(false)
  const [error,       setError]       = useState(null)

  useEffect(() => {
    if (!user || locked) return
    fetchAvis(user.id).then(data => {
      if (data) {
        setNote(data.note)
        setCommentaire(data.commentaire ?? '')
        setAlreadySent(true)
      }
    }).catch(() => {})
  }, [user, locked])

  async function handleSave() {
    if (!note) { setError('Merci de choisir une note.'); return }
    setSaving(true)
    setError(null)
    try {
      await saveAvis(user.id, note, commentaire)
      setSaved(true)
      setAlreadySent(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (locked) {
    return (
      <div style={s.page}>
        <h1 style={s.title}>Laisser un avis</h1>
        <div style={s.lockedBox}>
          <span style={s.lockIcon}>🔒</span>
          <p style={s.lockMsg}>Cette page se débloque à la semaine 8.</p>
          <p style={s.lockSub}>Tu es à la semaine {currentSem} — encore {8 - currentSem} semaine{8 - currentSem > 1 ? 's' : ''} !</p>
        </div>
      </div>
    )
  }

  if (saved || alreadySent) {
    return (
      <div style={s.page}>
        <h1 style={s.title}>Laisser un avis</h1>
        <div style={s.card}>
          <div style={s.stars}>{Array.from({ length: 5 }, (_, i) => (
            <span key={i} style={{ fontSize: 32, color: i < note ? '#F5A623' : 'var(--mist)' }}>★</span>
          ))}</div>
          <p style={s.thankMsg}>Merci pour ton avis ! ✨</p>
          {commentaire && <p style={s.thankComment}>"{commentaire}"</p>}
          <button style={s.editBtn} onClick={() => { setSaved(false); setAlreadySent(false) }}>
            Modifier mon avis
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={s.page}>
      <h1 style={s.title}>Laisser un avis</h1>
      <p style={s.intro}>
        Tu as terminé le programme — bravo ! Ton retour aide à améliorer l'accompagnement
        pour les prochaines clientes.
      </p>

      <div style={s.card}>
        <div>
          <p style={s.label}>Ta note globale</p>
          <div style={s.stars}>
            {Array.from({ length: 5 }, (_, i) => (
              <button
                key={i}
                style={{ ...s.starBtn, color: i < note ? '#F5A623' : 'var(--mist)' }}
                onClick={() => setNote(i + 1)}
              >★</button>
            ))}
          </div>
          {note > 0 && <p style={s.noteLabel}>{['', 'Pas convaincu', 'Peut mieux faire', 'Bien', 'Très bien', 'Excellent !'][note]}</p>}
        </div>

        <div>
          <p style={s.label}>Ton commentaire (optionnel)</p>
          <textarea
            style={s.textarea}
            value={commentaire}
            onChange={e => setCommentaire(e.target.value)}
            placeholder="Ce que j'ai aimé, ce qui m'a le plus transformée, mes conseils pour les futures clientes…"
            rows={6}
          />
        </div>

        {error && <p style={s.error}>{error}</p>}

        <button style={s.btn} onClick={handleSave} disabled={saving}>
          {saving ? 'Envoi…' : 'Envoyer mon avis'}
        </button>
      </div>
    </div>
  )
}

const s = {
  page:        { padding: 'var(--s8) var(--s6)', maxWidth: 560 },
  title:       { fontFamily: 'var(--serif)', fontSize: 'var(--tx-2xl)', color: 'var(--forest)', fontWeight: 400, marginBottom: 'var(--s4)' },
  intro:       { fontSize: 'var(--tx-sm)', color: 'var(--stone)', lineHeight: 1.65, marginBottom: 'var(--s7)' },
  card:        { background: 'var(--white)', borderRadius: 'var(--r-md)', padding: 'var(--s8)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: 'var(--s6)' },
  label:       { fontSize: 'var(--tx-sm)', fontWeight: 500, color: 'var(--forest)', marginBottom: 'var(--s3)' },
  stars:       { display: 'flex', gap: 4 },
  starBtn:     { background: 'none', border: 'none', fontSize: 36, cursor: 'pointer', padding: 2, transition: 'color .15s' },
  noteLabel:   { fontSize: 'var(--tx-xs)', color: 'var(--stone)', marginTop: 6 },
  textarea:    { width: '100%', border: '1.5px solid var(--mist)', borderRadius: 'var(--r-sm)', padding: '12px 14px', fontFamily: 'inherit', fontSize: 'var(--tx-sm)', color: 'var(--forest)', lineHeight: 1.65, resize: 'vertical', outline: 'none', background: 'var(--cream)', boxSizing: 'border-box' },
  error:       { fontSize: 'var(--tx-sm)', color: 'var(--terracotta)' },
  btn:         { padding: '11px 24px', background: 'var(--moss)', color: 'var(--white)', border: 'none', borderRadius: 'var(--r-sm)', fontSize: 'var(--tx-sm)', fontWeight: 500, cursor: 'pointer', alignSelf: 'flex-start' },
  lockedBox:   { background: 'var(--white)', borderRadius: 'var(--r-md)', padding: 'var(--s10)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--s4)', textAlign: 'center' },
  lockIcon:    { fontSize: 40 },
  lockMsg:     { fontSize: 'var(--tx-md)', color: 'var(--forest)', fontWeight: 500 },
  lockSub:     { fontSize: 'var(--tx-sm)', color: 'var(--stone)' },
  thankMsg:    { fontSize: 'var(--tx-lg)', color: 'var(--forest)', fontWeight: 500, fontFamily: 'var(--serif)' },
  thankComment:{ fontSize: 'var(--tx-sm)', color: 'var(--stone)', fontStyle: 'italic' },
  editBtn:     { background: 'none', border: '1.5px solid var(--mist)', borderRadius: 'var(--r-sm)', padding: '8px 18px', fontSize: 'var(--tx-xs)', color: 'var(--stone)', cursor: 'pointer' },
}
