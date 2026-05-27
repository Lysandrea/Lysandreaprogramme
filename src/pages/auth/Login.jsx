import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.jsx'
import Button from '../../components/Button.jsx'

export default function Login() {
  const navigate  = useNavigate()
  const { signIn } = useAuth()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { role } = await signIn(email.trim(), password)
      navigate(role === 'coach' ? '/coach' : '/dashboard', { replace: true })
    } catch (err) {
      setError(err.message ?? 'Connexion échouée.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        {/* Logo */}
        <div style={s.logoBlock}>
          <span style={s.logoTitle}>Lysa Andréa</span>
          <span style={s.logoSub}>Programme 8 semaines</span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={s.form}>
          <label style={s.label}>
            Email
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="ton@email.fr"
              style={s.input}
              onFocus={e => { e.target.style.borderColor = 'var(--stone)'; e.target.style.outline = 'none' }}
              onBlur={e  => { e.target.style.borderColor = 'var(--sand)' }}
            />
          </label>

          <label style={s.label}>
            Mot de passe
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={s.input}
              onFocus={e => { e.target.style.borderColor = 'var(--stone)'; e.target.style.outline = 'none' }}
              onBlur={e  => { e.target.style.borderColor = 'var(--sand)' }}
            />
          </label>

          {error && (
            <p style={s.error}>{error}</p>
          )}

          <Button type="submit" fullWidth size="lg" loading={loading}>
            Se connecter
          </Button>
        </form>

        {/* Footer */}
        <p style={s.footer}>
          Première connexion ?{' '}
          <a href="#" style={s.link}>Créer mon compte</a>
        </p>

        {/* Dev hint */}
        {!import.meta.env.VITE_SUPABASE_URL && (
          <div style={s.hint}>
            <strong>Mode démo</strong><br />
            coach@lysa.fr / lysa2024<br />
            cliente@lysa.fr / lysa2024
          </div>
        )}
      </div>
    </div>
  )
}

const s = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--cream)',
    padding: 'var(--space-4)',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    background: 'var(--white)',
    border: '1px solid var(--sand)',
    borderRadius: 'var(--border-radius-xl)',
    padding: 'var(--space-10) var(--space-8)',
    boxShadow: 'var(--shadow-md)',
  },
  logoBlock: {
    textAlign: 'center',
    marginBottom: 'var(--space-8)',
  },
  logoTitle: {
    display: 'block',
    fontFamily: 'var(--serif)',
    fontSize: 32,
    fontWeight: 400,
    fontStyle: 'italic',
    color: 'var(--earth)',
    letterSpacing: '-0.01em',
  },
  logoSub: {
    display: 'block',
    fontSize: 'var(--text-xs)',
    color: 'var(--sage)',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    marginTop: 4,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-4)',
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    fontSize: 'var(--text-sm)',
    fontWeight: 500,
    color: 'var(--earth)',
  },
  input: {
    padding: '14px var(--s4)',
    borderRadius: 8,
    border: '1px solid var(--sand)',
    background: 'var(--cream)',
    color: 'var(--earth)',
    fontSize: 'var(--tx-sm)',
    transition: 'border-color var(--ease-fast)',
  },
  error: {
    fontSize: 'var(--text-sm)',
    color: 'var(--terracotta)',
    padding: '10px var(--space-4)',
    background: 'rgba(192,120,96,0.08)',
    borderRadius: 'var(--border-radius-sm)',
    border: '1px solid rgba(192,120,96,0.2)',
  },
  footer: {
    textAlign: 'center',
    fontSize: 'var(--text-sm)',
    color: 'var(--stone)',
    marginTop: 'var(--space-5)',
  },
  link: {
    color: 'var(--bark)',
    textDecoration: 'underline',
    textUnderlineOffset: 3,
  },
  hint: {
    marginTop: 'var(--space-5)',
    padding: 'var(--space-4)',
    background: 'rgba(168,184,154,0.1)',
    borderRadius: 'var(--border-radius-sm)',
    border: '1px dashed var(--sage)',
    fontSize: 'var(--text-xs)',
    color: 'var(--bark)',
    lineHeight: 1.8,
    textAlign: 'center',
  },
}
