import { useAuth } from '../contexts/AuthContext.jsx'

export default function Topbar({ title, subtitle }) {
  const { profile } = useAuth()

  return (
    <header style={s.topbar}>
      <div>
        {title && (
          <h1 style={s.title}>{title}</h1>
        )}
        {subtitle && (
          <p style={s.subtitle}>{subtitle}</p>
        )}
      </div>
      <div style={s.right}>
        <div style={s.avatar}>
          {(profile?.prenom?.[0] ?? '?').toUpperCase()}
        </div>
      </div>
    </header>
  )
}

const s = {
  topbar: {
    height: 'var(--topbar-height)',
    background: 'var(--white)',
    borderBottom: '1px solid var(--sand)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 var(--space-8)',
    flexShrink: 0,
  },
  title: {
    fontFamily: 'var(--font-serif)',
    fontSize: 'var(--text-xl)',
    fontWeight: 400,
    color: 'var(--earth)',
    letterSpacing: '-0.01em',
  },
  subtitle: {
    fontSize: 'var(--text-xs)',
    color: 'var(--stone)',
    marginTop: 2,
    letterSpacing: '0.04em',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: 'var(--sage)',
    color: 'var(--forest)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 'var(--text-sm)',
    fontWeight: 600,
  },
}
