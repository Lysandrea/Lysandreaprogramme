import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'

const LAUNCH = new Date('2026-08-01T00:00:00')

function getTimeLeft() {
  const diff = LAUNCH - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  return {
    days:    Math.floor(diff / 86400000),
    hours:   Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000)  / 60000),
    seconds: Math.floor((diff % 60000)    / 1000),
  }
}

function CountBlock({ value, label }) {
  return (
    <div style={s.block}>
      <span style={s.blockNumber}>{String(value).padStart(2, '0')}</span>
      <span style={s.blockLabel}>{label}</span>
    </div>
  )
}

export default function ComingSoon() {
  const [time, setTime]           = useState(getTimeLeft)
  const [email, setEmail]         = useState('')
  const [status, setStatus]       = useState(null) // null | 'loading' | 'done' | 'error'
  const [errorMsg, setErrorMsg]   = useState('')

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft()), 1000)
    return () => clearInterval(id)
  }, [])

  async function handleWaitlist(e) {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')
    const { error } = await supabase.from('waitlist').insert({ email: email.trim() })
    if (error) {
      if (error.code === '23505') {
        // duplicate — treat as success
        setStatus('done')
      } else {
        setErrorMsg("Une erreur s'est produite. Réessaie.")
        setStatus('error')
      }
    } else {
      setStatus('done')
    }
  }

  return (
    <div style={s.page}>
      <div style={s.inner}>

        {/* Logo block */}
        <div style={s.logoBlock}>
          <span style={s.logoName}>Lysa Andréa</span>
          <span style={s.logoSub}>Déclic</span>
        </div>

        {/* Main title */}
        <h1 style={s.title}>Quelque chose se prépare.</h1>

        {/* Subtitle */}
        <p style={s.subtitle}>
          Un programme de 8 semaines pour te réconcilier avec ton corps.<br />
          Sport, émotions, et un accompagnement qui ne te lâche pas.
        </p>

        {/* Countdown */}
        <div style={s.countdown}>
          <CountBlock value={time.days}    label="Jours"    />
          <div style={s.sep}>:</div>
          <CountBlock value={time.hours}   label="Heures"   />
          <div style={s.sep}>:</div>
          <CountBlock value={time.minutes} label="Minutes"  />
          <div style={s.sep}>:</div>
          <CountBlock value={time.seconds} label="Secondes" />
        </div>

        {/* Waitlist */}
        <div style={s.waitlistWrap}>
          <p style={s.waitlistLabel}>Sois la première informée à l'ouverture</p>

          {status === 'done' ? (
            <p style={s.confirm}>C'est noté. À très vite. 🌿</p>
          ) : (
            <form onSubmit={handleWaitlist} style={s.form}>
              <input
                type="email"
                required
                placeholder="ton@email.fr"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={s.input}
                onFocus={e => { e.target.style.borderColor = 'var(--stone)'; e.target.style.outline = 'none' }}
                onBlur={e  => { e.target.style.borderColor = 'var(--sand)' }}
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                style={status === 'loading' ? { ...s.btn, opacity: 0.7 } : s.btn}
              >
                {status === 'loading' ? '…' : 'Me prévenir ✦'}
              </button>
            </form>
          )}

          {status === 'error' && <p style={s.errorMsg}>{errorMsg}</p>}
        </div>

        {/* Footer */}
        <p style={s.footer}>
          <Link to="/login" style={s.footerLink}>Déjà membre ? Se connecter</Link>
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
    padding: '40px 20px',
  },
  inner: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    maxWidth: 600,
    width: '100%',
    gap: 0,
  },
  logoBlock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 48,
  },
  logoName: {
    fontFamily: 'var(--font-serif)',
    fontSize: 36,
    fontWeight: 400,
    fontStyle: 'italic',
    color: 'var(--earth)',
    letterSpacing: '-0.01em',
    lineHeight: 1.1,
  },
  logoSub: {
    fontFamily: 'var(--font-sans)',
    fontSize: 10,
    color: 'var(--sage)',
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    marginTop: 6,
  },
  title: {
    fontFamily: 'var(--font-serif)',
    fontSize: 42,
    fontWeight: 400,
    fontStyle: 'italic',
    color: 'var(--earth)',
    letterSpacing: '-0.01em',
    lineHeight: 1.15,
    margin: '0 0 24px',
  },
  subtitle: {
    fontFamily: 'var(--font-sans)',
    fontSize: 16,
    color: 'var(--bark)',
    lineHeight: 1.8,
    margin: '0 0 52px',
  },
  countdown: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 56,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  block: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: 'var(--white)',
    border: '1px solid var(--sand)',
    borderRadius: 12,
    padding: '20px 24px 16px',
    minWidth: 80,
  },
  blockNumber: {
    fontFamily: 'var(--font-serif)',
    fontSize: 32,
    fontWeight: 400,
    color: 'var(--forest)',
    lineHeight: 1,
    marginBottom: 8,
  },
  blockLabel: {
    fontFamily: 'var(--font-sans)',
    fontSize: 10,
    color: 'var(--stone)',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
  },
  sep: {
    fontFamily: 'var(--font-serif)',
    fontSize: 28,
    color: 'var(--stone)',
    marginTop: -16,
  },
  waitlistWrap: {
    width: '100%',
    maxWidth: 440,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
    marginBottom: 48,
  },
  waitlistLabel: {
    fontFamily: 'var(--font-sans)',
    fontSize: 13,
    color: 'var(--stone)',
    letterSpacing: '0.04em',
    margin: 0,
  },
  form: {
    display: 'flex',
    width: '100%',
    gap: 8,
  },
  input: {
    flex: 1,
    padding: '14px 16px',
    borderRadius: 8,
    border: '1px solid var(--sand)',
    background: 'var(--white)',
    color: 'var(--earth)',
    fontFamily: 'var(--font-sans)',
    fontSize: 14,
    transition: 'border-color 0.15s',
  },
  btn: {
    padding: '14px 20px',
    borderRadius: 8,
    border: 'none',
    background: 'var(--terracotta)',
    color: 'var(--white)',
    fontFamily: 'var(--font-sans)',
    fontSize: 13,
    fontWeight: 500,
    letterSpacing: '0.03em',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'opacity 0.15s',
  },
  confirm: {
    fontFamily: 'var(--font-sans)',
    fontSize: 15,
    color: 'var(--forest)',
    fontStyle: 'italic',
    margin: 0,
  },
  errorMsg: {
    fontFamily: 'var(--font-sans)',
    fontSize: 13,
    color: 'var(--terracotta)',
    margin: 0,
  },
  footer: {
    margin: 0,
  },
  footerLink: {
    fontFamily: 'var(--font-sans)',
    fontSize: 12,
    color: 'var(--stone)',
    textDecoration: 'underline',
    textUnderlineOffset: 3,
    letterSpacing: '0.02em',
  },
}
