import { Link, useLocation } from 'react-router-dom'

export default function PublicNav() {
  const { pathname } = useLocation()
  const active = (path) => pathname === path || (path === '/vente' && pathname === '/')

  return (
    <nav style={n.nav}>
      <div style={n.left}>
        <Link to="/podcast" style={{ ...n.link, ...(active('/podcast') ? n.linkActive : {}) }}>
          🎙️ Mon podcast
        </Link>
        <Link to="/guide" style={{ ...n.link, ...(active('/guide') ? n.linkActive : {}) }}>
          📖 Mon guide gratuit
        </Link>
      </div>
      <Link to="/login" style={n.link}>
        Mon espace Déclic →
      </Link>
    </nav>
  )
}

const n = {
  nav: {
    background: 'linear-gradient(135deg, #3D4F3C 0%, #4d6349 100%)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 40px',
    borderBottom: '1px solid rgba(245,240,232,0.1)',
    flexWrap: 'wrap',
    gap: 8,
  },
  left: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  link: {
    fontFamily: 'var(--sans)',
    fontSize: 12,
    fontWeight: 500,
    letterSpacing: '0.04em',
    color: 'rgba(245,240,232,0.65)',
    textDecoration: 'none',
    border: '1px solid rgba(245,240,232,0.2)',
    borderRadius: 6,
    padding: '5px 12px',
    whiteSpace: 'nowrap',
    transition: 'color 150ms ease, border-color 150ms ease',
  },
  linkActive: {
    color: 'rgba(245,240,232,0.95)',
    borderColor: 'rgba(245,240,232,0.5)',
    background: 'rgba(245,240,232,0.08)',
  },
}
