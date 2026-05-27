import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase.js'
import Button from '../../components/Button.jsx'
import Card from '../../components/Card.jsx'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (authError) throw authError
      navigate('/')
    } catch (err) {
      setError(err.message ?? 'Sign-in failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <Card style={styles.card}>
        <h1 style={styles.heading}>Sign in</h1>
        <p style={styles.sub}>Welcome back — enter your credentials.</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={styles.input}
            />
          </label>

          <label style={styles.label}>
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={styles.input}
            />
          </label>

          {error && <p style={styles.error}>{error}</p>}

          <Button type="submit" fullWidth loading={loading}>
            Sign in
          </Button>
        </form>
      </Card>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-base)',
    padding: 'var(--space-4)',
  },
  card: {
    width: '100%',
    maxWidth: 400,
  },
  heading: {
    fontSize: 'var(--text-2xl)',
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: 'var(--space-1)',
  },
  sub: {
    fontSize: 'var(--text-sm)',
    color: 'var(--text-secondary)',
    marginBottom: 'var(--space-6)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-4)',
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-1)',
    fontSize: 'var(--text-sm)',
    fontWeight: 500,
    color: 'var(--text-primary)',
  },
  input: {
    padding: '10px var(--space-3)',
    borderRadius: 'var(--border-radius-sm)',
    border: '1px solid var(--border-color)',
    fontSize: 'var(--text-sm)',
    color: 'var(--text-primary)',
    background: 'var(--bg-surface)',
    outline: 'none',
    transition: 'border-color var(--transition-fast)',
  },
  error: {
    fontSize: 'var(--text-sm)',
    color: 'var(--color-danger)',
  },
}
