import { useAuth } from '../contexts/AuthContext.jsx'

export default function Topbar({ title, subtitle, right }) {
  const { profile } = useAuth()

  return (
    <header style={s.topbar}>
      <div>
        {title && <h1 style={s.title}>{title}</h1>}
        {subtitle && <p style={s.sub}>{subtitle}</p>}
      </div>
      <div style={s.right}>
        {right}
        <div style={s.avatar}>
          {(profile?.prenom?.[0] ?? '?').toUpperCase()}
        </div>
      </div>
    </header>
  )
}

const s = {
  topbar: {
    height: 'var(--topbar-h)', background: 'var(--white)',
    borderBottom: '1px solid var(--sand)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 var(--s8)', flexShrink: 0,
  },
  title: {
    fontFamily: 'var(--serif)', fontSize: 'var(--tx-xl)',
    fontWeight: 400, color: 'var(--earth)', letterSpacing: '-.01em',
  },
  sub: {
    fontSize: 'var(--tx-xs)', color: 'var(--stone)',
    marginTop: 2, letterSpacing: '.04em',
  },
  right: { display: 'flex', alignItems: 'center', gap: 'var(--s3)' },
  avatar: {
    width: 36, height: 36, borderRadius: '50%',
    background: 'var(--sage)', color: 'var(--forest)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 'var(--tx-sm)', fontWeight: 600,
  },
}
