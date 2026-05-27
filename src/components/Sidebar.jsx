import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'

/* ── Nav configs ── */
const CLIENTE_NAV = [
  { label: 'Tableau de bord', to: '/dashboard',  icon: '◈' },
  { label: 'Mon programme',   to: '/programme',  icon: '◉' },
]

const COACH_NAV = [
  { label: 'Tableau de bord', to: '/coach',      icon: '◈' },
]

export default function Sidebar() {
  const { role, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const navItems = role === 'coach' ? COACH_NAV : CLIENTE_NAV

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <aside style={s.sidebar}>
      {/* Logo */}
      <div style={s.logoBlock}>
        <span style={s.logoTitle}>Lysa Andréa</span>
        <span style={s.logoSub}>Programme 8 semaines</span>
      </div>

      {/* Nav */}
      <nav style={s.nav}>
        {navItems.map(({ label, to, icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            style={({ isActive }) => ({
              ...s.item,
              ...(isActive ? s.itemActive : {}),
            })}
          >
            <span style={s.icon}>{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div style={s.bottom}>
        {role === 'cliente' && <ProgressDots profile={profile} />}
        {role === 'coach'   && <CoachStats />}

        {/* User + sign out */}
        <div style={s.userRow}>
          <div style={s.avatar}>
            {(profile?.prenom?.[0] ?? '?').toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={s.userName}>{profile?.prenom ?? 'Utilisateur'}</p>
            <p style={s.userRole}>{role ?? '—'}</p>
          </div>
          <button style={s.signOutBtn} onClick={handleSignOut} title="Déconnexion">
            ⏻
          </button>
        </div>
      </div>
    </aside>
  )
}

/* ── Sub-components ── */
function ProgressDots({ profile }) {
  const currentWeek = profile?.current_week ?? 1
  return (
    <div style={{ marginBottom: 'var(--space-5)' }}>
      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--sage)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 'var(--space-3)' }}>
        Progression
      </p>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} style={{
            width: 20, height: 20,
            borderRadius: '50%',
            border: '1.5px solid',
            borderColor: i < currentWeek ? 'var(--sage)' : 'rgba(168,184,154,0.3)',
            background: i < currentWeek ? 'var(--sage)' : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 9, color: i < currentWeek ? 'var(--forest)' : 'rgba(168,184,154,0.4)',
            fontWeight: 600,
          }}>
            {i + 1}
          </div>
        ))}
      </div>
    </div>
  )
}

function CoachStats() {
  return (
    <div style={{ marginBottom: 'var(--space-5)' }}>
      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--sage)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 'var(--space-3)' }}>
        Aperçu
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {[['Clientes actives', '4'], ['Check-ins en attente', '2']].map(([label, val]) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-sidebar)' }}>{label}</span>
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--white)' }}>{val}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Styles ── */
const s = {
  sidebar: {
    width: 'var(--sidebar-width)',
    background: 'var(--bg-sidebar)',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    height: '100vh',
    overflowY: 'auto',
    overflowX: 'hidden',
  },
  logoBlock: {
    padding: 'var(--space-8) var(--space-6) var(--space-6)',
    borderBottom: '1px solid rgba(168,184,154,0.15)',
    marginBottom: 'var(--space-4)',
  },
  logoTitle: {
    display: 'block',
    fontFamily: 'var(--font-serif)',
    fontSize: '22px',
    fontWeight: 400,
    color: 'var(--white)',
    letterSpacing: '-0.01em',
  },
  logoSub: {
    display: 'block',
    fontSize: 'var(--text-xs)',
    color: 'var(--sage)',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    marginTop: 4,
  },
  nav: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    padding: '0 var(--space-3)',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
    padding: '10px var(--space-4)',
    borderRadius: 'var(--border-radius-sm)',
    color: 'var(--text-sidebar)',
    fontSize: 'var(--text-sm)',
    fontWeight: 400,
    textDecoration: 'none',
    transition: 'background var(--transition-fast), color var(--transition-fast)',
    borderLeft: '2px solid transparent',
  },
  itemActive: {
    background: 'var(--bg-sidebar-active)',
    color: 'var(--white)',
    borderLeftColor: 'var(--sage)',
  },
  icon: {
    fontSize: '1rem',
    lineHeight: 1,
    flexShrink: 0,
    color: 'var(--sage)',
  },
  bottom: {
    padding: 'var(--space-5) var(--space-4)',
    borderTop: '1px solid rgba(168,184,154,0.15)',
    marginTop: 'auto',
  },
  userRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
  },
  avatar: {
    width: 32, height: 32,
    borderRadius: '50%',
    background: 'var(--sage)',
    color: 'var(--forest)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 'var(--text-sm)',
    fontWeight: 600,
    flexShrink: 0,
  },
  userName: {
    fontSize: 'var(--text-sm)',
    fontWeight: 500,
    color: 'var(--white)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  userRole: {
    fontSize: 'var(--text-xs)',
    color: 'var(--sage)',
    textTransform: 'capitalize',
  },
  signOutBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--stone)',
    fontSize: '1rem',
    cursor: 'pointer',
    padding: 4,
    borderRadius: 4,
    flexShrink: 0,
    transition: 'color var(--transition-fast)',
  },
}
