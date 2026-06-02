import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { fetchLetter, saveLetter } from '../../lib/supabase.js'

export default function LettreFin() {
  const { user, profile } = useAuth()
  const currentSem = Math.ceil((profile?.current_day ?? 1) / 7)
  const locked     = currentSem < 8

  const [contenu,  setContenu]  = useState('')
  const [savedAt,  setSavedAt]  = useState(null)
  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(false)
  const [error,    setError]    = useState(null)

  useEffect(() => {
    if (!user || locked) return
    fetchLetter(user.id).then(data => {
      if (data) {
        setContenu(data.contenu)
        setSavedAt(data.updated_at)
      }
    }).catch(() => {})
  }, [user, locked])

  async function handleSave() {
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      await saveLetter(user.id, contenu)
      setSaved(true)
      setSavedAt(new Date().toISOString())
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (locked) {
    return (
      <div style={s.page}>
        <h1 style={s.title}>Ma lettre de fin</h1>
        <div style={s.lockedBox}>
          <span style={s.lockIcon}>🔒</span>
          <p style={s.lockMsg}>Cette page se débloque à la semaine 8.</p>
          <p style={s.lockSub}>Tu es à la semaine {currentSem} — encore {8 - currentSem} semaine{8 - currentSem > 1 ? 's' : ''} !</p>
        </div>
      </div>
    )
  }

  return (
    <div style={s.page}>
      <h1 style={s.title}>Ma lettre de fin</h1>
      <p style={s.intro}>
        Félicitations pour avoir terminé tes 8 semaines. Écris ici une lettre à toi-même :
        ce que tu retiens, ce qui a changé, les promesses que tu te fais pour la suite.
      </p>

      <div style={s.card}>
        <textarea
          style={s.textarea}
          value={contenu}
          onChange={e => setContenu(e.target.value)}
          placeholder="Chère moi…"
          rows={18}
        />

        {savedAt && (
          <p style={s.savedAt}>
            Dernière sauvegarde le {new Date(savedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        )}

        {error && <p style={s.error}>{error}</p>}

        <button style={s.btn} onClick={handleSave} disabled={saving}>
          {saving ? 'Sauvegarde…' : saved ? 'Sauvegardé ✓' : 'Sauvegarder ma lettre'}
        </button>
      </div>
    </div>
  )
}

const s = {
  page:      { padding: 'var(--s8) var(--s6)', maxWidth: 680 },
  title:     { fontFamily: 'var(--serif)', fontSize: 'var(--tx-2xl)', color: 'var(--forest)', fontWeight: 400, marginBottom: 'var(--s4)' },
  intro:     { fontSize: 'var(--tx-sm)', color: 'var(--stone)', lineHeight: 1.65, marginBottom: 'var(--s7)' },
  card:      { background: 'var(--white)', borderRadius: 'var(--r-md)', padding: 'var(--s7)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: 'var(--s5)' },
  textarea:  { width: '100%', border: '1.5px solid var(--mist)', borderRadius: 'var(--r-sm)', padding: '14px 16px', fontFamily: 'var(--serif)', fontSize: 'var(--tx-md)', color: 'var(--forest)', lineHeight: 1.7, resize: 'vertical', outline: 'none', background: 'var(--cream)', boxSizing: 'border-box' },
  savedAt:   { fontSize: 'var(--tx-xs)', color: 'var(--stone)', fontStyle: 'italic' },
  error:     { fontSize: 'var(--tx-sm)', color: 'var(--terracotta)' },
  btn:       { padding: '11px 24px', background: 'var(--moss)', color: 'var(--white)', border: 'none', borderRadius: 'var(--r-sm)', fontSize: 'var(--tx-sm)', fontWeight: 500, cursor: 'pointer', alignSelf: 'flex-start' },
  lockedBox: { background: 'var(--white)', borderRadius: 'var(--r-md)', padding: 'var(--s10)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--s4)', textAlign: 'center' },
  lockIcon:  { fontSize: 40 },
  lockMsg:   { fontSize: 'var(--tx-md)', color: 'var(--forest)', fontWeight: 500 },
  lockSub:   { fontSize: 'var(--tx-sm)', color: 'var(--stone)' },
}
