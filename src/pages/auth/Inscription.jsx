import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link, Navigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase.js'
import Button from '../../components/Button.jsx'

export default function Inscription() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const token = params.get('invite')

  // null = verifying, true = valid, false = invalid
  const [tokenValid, setTokenValid] = useState(null)

  const [prenom,          setPrenom]          = useState('')
  const [email,           setEmail]           = useState('')
  const [password,        setPassword]        = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading,         setLoading]         = useState(false)
  const [error,           setError]           = useState('')

  useEffect(() => {
    if (!token) { setTokenValid(false); return }
    supabase
      .rpc('verify_invite_token', { p_token: token })
      .then(({ data, error }) => setTokenValid(!error && data === true))
  }, [token])

  if (tokenValid === null) {
    return (
      <div style={s.page}>
        <p style={{ color: 'var(--stone)', fontSize: 'var(--tx-sm)' }}>Vérification en cours…</p>
      </div>
    )
  }

  if (!tokenValid) return <Navigate to="/" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }

    setLoading(true)
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email:   email.trim(),
        password,
        options: { data: { prenom: prenom.trim() } },
      })
      if (signUpError) throw signUpError

      // Mark invite as used
      await supabase.rpc('use_invite_token', { p_token: token })

      if (data.session) {
        navigate('/onboarding', { replace: true })
        return
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email:    email.trim(),
        password,
      })
      if (signInError) throw signInError
      navigate('/onboarding', { replace: true })
    } catch (err) {
      if (err.message?.toLowerCase().includes('already registered')) {
        setError('Cet email est déjà utilisé. Connecte-toi via la page de connexion.')
      } else {
        setError(err.message ?? 'Erreur lors de la création du compte.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logoBlock}>
          <span style={s.logoTitle}>Lysa Andréa</span>
          <span style={s.logoSub}>Déclic</span>
        </div>

        <p style={s.welcome}>
          Bienvenue ! Lysa t'a réservé une place.<br />
          Crée ton accès ici.
        </p>

        <form onSubmit={handleSubmit} style={s.form}>
          <label style={s.label}>
            Prénom
            <input
              type="text"
              required
              value={prenom}
              onChange={e => setPrenom(e.target.value)}
              placeholder="Ton prénom"
              style={s.input}
              onFocus={e => { e.target.style.borderColor = 'var(--stone)'; e.target.style.outline = 'none' }}
              onBlur={e  => { e.target.style.borderColor = 'var(--sand)' }}
            />
          </label>

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
              placeholder="Minimum 6 caractères"
              style={s.input}
              onFocus={e => { e.target.style.borderColor = 'var(--stone)'; e.target.style.outline = 'none' }}
              onBlur={e  => { e.target.style.borderColor = 'var(--sand)' }}
            />
          </label>

          <label style={s.label}>
            Confirmer le mot de passe
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Répète ton mot de passe"
              style={s.input}
              onFocus={e => { e.target.style.borderColor = 'var(--stone)'; e.target.style.outline = 'none' }}
              onBlur={e  => { e.target.style.borderColor = 'var(--sand)' }}
            />
          </label>

          {error && <p style={s.error}>{error}</p>}

          <Button type="submit" fullWidth size="lg" loading={loading}>
            Créer mon accès ✦
          </Button>
        </form>

        <p style={s.footer}>
          Déjà un compte ?{' '}
          <Link to="/" style={s.link}>Se connecter</Link>
        </p>
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
    padding: 'var(--s4)',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    background: 'var(--white)',
    border: '1px solid var(--sand)',
    borderRadius: 'var(--r-xl)',
    padding: 'var(--s10) var(--s8)',
    boxShadow: 'var(--sh-md)',
  },
  logoBlock: {
    textAlign: 'center',
    marginBottom: 'var(--s6)',
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
    fontSize: 'var(--tx-xs)',
    color: 'var(--sage)',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    marginTop: 4,
  },
  welcome: {
    textAlign: 'center',
    fontSize: 'var(--tx-sm)',
    color: 'var(--bark)',
    lineHeight: 1.75,
    marginBottom: 'var(--s6)',
    fontStyle: 'italic',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--s4)',
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    fontSize: 'var(--tx-sm)',
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
    fontSize: 'var(--tx-sm)',
    color: 'var(--terracotta)',
    padding: '10px var(--s4)',
    background: 'rgba(192,120,96,0.08)',
    borderRadius: 'var(--r-sm)',
    border: '1px solid rgba(192,120,96,0.2)',
  },
  footer: {
    textAlign: 'center',
    fontSize: 'var(--tx-sm)',
    color: 'var(--stone)',
    marginTop: 'var(--s5)',
  },
  link: {
    color: 'var(--bark)',
    textDecoration: 'underline',
    textUnderlineOffset: 3,
  },
}
