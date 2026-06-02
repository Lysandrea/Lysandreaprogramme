import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { supabase } from '../../lib/supabase.js'
import { updateProfile } from '../../lib/supabase.js'

export default function Profil() {
  const { user, profile, role } = useAuth()
  const [prenom,   setPrenom]   = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(false)
  const [error,    setError]    = useState(null)

  useEffect(() => {
    if (!user) return
    supabase
      .from('profiles')
      .select('prenom, whatsapp')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setPrenom(data.prenom ?? '')
          setWhatsapp(data.whatsapp ?? '')
        }
      })
  }, [user])

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      await updateProfile(user.id, { prenom, whatsapp })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const initial = (prenom?.[0] ?? profile?.prenom?.[0] ?? '?').toUpperCase()

  return (
    <div style={s.page}>
      <h1 style={s.title}>Mon profil</h1>

      <div style={s.card}>
        <div style={s.avatarWrap}>
          <div style={s.avatar}>{initial}</div>
          <p style={s.avatarSub}>Avatar</p>
        </div>

        <form onSubmit={handleSave} style={s.form}>
          <div style={s.field}>
            <label style={s.label}>Prénom</label>
            <input
              style={s.input}
              value={prenom}
              onChange={e => setPrenom(e.target.value)}
              placeholder="Ton prénom"
            />
          </div>

          <div style={s.field}>
            <label style={s.label}>Email</label>
            <input
              style={{ ...s.input, ...s.inputDisabled }}
              value={user?.email ?? ''}
              disabled
            />
          </div>

          <div style={s.field}>
            <label style={s.label}>WhatsApp</label>
            <input
              style={s.input}
              value={whatsapp}
              onChange={e => setWhatsapp(e.target.value)}
              placeholder="+33 6 00 00 00 00"
            />
          </div>

          {error && <p style={s.error}>{error}</p>}

          <button type="submit" style={s.btn} disabled={saving}>
            {saving ? 'Sauvegarde…' : saved ? 'Sauvegardé ✓' : 'Sauvegarder'}
          </button>
        </form>
      </div>
    </div>
  )
}

const s = {
  page:  { padding: 'var(--s8) var(--s6)', maxWidth: 560 },
  title: { fontFamily: 'var(--serif)', fontSize: 'var(--tx-2xl)', color: 'var(--forest)', fontWeight: 400, marginBottom: 'var(--s7)' },
  card:  { background: 'var(--white)', borderRadius: 'var(--r-md)', padding: 'var(--s8)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--s6)' },
  avatarWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--s2)' },
  avatar: { width: 80, height: 80, borderRadius: '50%', background: 'var(--sage)', color: 'var(--forest)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 36, fontWeight: 400 },
  avatarSub: { fontSize: 'var(--tx-xs)', color: 'var(--stone)', letterSpacing: '.08em', textTransform: 'uppercase' },
  form:  { width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--s5)' },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 'var(--tx-sm)', color: 'var(--forest)', fontWeight: 500 },
  input: { padding: '10px 14px', border: '1.5px solid var(--mist)', borderRadius: 'var(--r-sm)', fontSize: 'var(--tx-sm)', color: 'var(--forest)', background: 'var(--cream)', outline: 'none' },
  inputDisabled: { opacity: .55, cursor: 'not-allowed' },
  error: { fontSize: 'var(--tx-sm)', color: 'var(--terracotta)' },
  btn:   { marginTop: 'var(--s2)', padding: '11px 24px', background: 'var(--moss)', color: 'var(--white)', border: 'none', borderRadius: 'var(--r-sm)', fontSize: 'var(--tx-sm)', fontWeight: 500, cursor: 'pointer', alignSelf: 'flex-start' },
}
