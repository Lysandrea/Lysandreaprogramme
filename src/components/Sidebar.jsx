import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth }              from '../contexts/AuthContext.jsx'
import { useSidebar }           from '../contexts/SidebarContext.jsx'

const CLIENTE_NAV = [
  { label: 'Tableau de bord', to: '/dashboard', icon: '🏠' },
]
const COACH_NAV = [
  { label: 'Vue Coach', to: '/coach', icon: '📋' },
]

export default function Sidebar() {
  const { role, profile, signOut } = useAuth()
  const { open, close }            = useSidebar()
  const navigate  = useNavigate()
  const navItems  = role === 'coach' ? COACH_NAV : CLIENTE_NAV

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <>
      {/* Backdrop — rendu via JS, caché sur desktop via CSS */}
      {open && (
        <div
          className="sidebar-backdrop"
          onClick={close}
          aria-hidden="true"
        />
      )}

      {/* La sidebar est TOUJOURS dans le DOM.
          Desktop : CSS visible normalement (pas de transform).
          Mobile  : CSS la cache (-100%) ; .sidebar-open = visible. */}
      <aside className={`shell-sidebar${open ? ' sidebar-open' : ''}`}>

        {/* Bouton fermer — visible sur mobile via CSS seulement */}
        <button className="sidebar-close-btn" onClick={close} aria-label="Fermer">✕</button>

        {/* Brand */}
        <div style={s.brand}>
          <span style={s.brandName}>Lysa Andréa</span>
          <span style={s.brandSub}>Programme 8 semaines</span>
        </div>

        {/* Nav */}
        <nav style={s.nav}>
          {navItems.map(({ label, to, icon }) => (
            <NavLink
              key={to} to={to} end
              onClick={close}
              style={({ isActive }) => ({ ...s.item, ...(isActive ? s.itemActive : {}) })}
            >
              <span style={{ fontSize: '1rem', flexShrink: 0 }}>{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div style={s.bottom}>
          {role === 'cliente' && <WeekDots />}
          {role === 'coach'   && <CoachStats />}

          <div style={s.userRow}>
            <div style={s.avatar}>{(profile?.prenom?.[0] ?? '?').toUpperCase()}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={s.userName}>{profile?.prenom ?? 'Utilisateur'}</p>
              <p style={s.userRole}>{role ?? '—'}</p>
            </div>
            <button
              style={s.signOutBtn} onClick={handleSignOut} title="Déconnexion"
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--white)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--stone)' }}
            >⏻</button>
          </div>
        </div>

      </aside>
    </>
  )
}

function WeekDots() {
  const { profile }    = useAuth()
  const currentSemaine = Math.ceil((profile?.current_day ?? 1) / 7)
  return (
    <div style={{ marginBottom: 'var(--s5)' }}>
      <p style={s.dotLabel}>Progression</p>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {Array.from({ length: 8 }, (_, i) => {
          const sem = i + 1
          const done = sem < currentSemaine
          const current = sem === currentSemaine
          return (
            <div key={sem} style={{
              width: 24, height: 24, borderRadius: '50%', border: '1.5px solid',
              borderColor: done ? 'var(--moss)' : current ? 'var(--terracotta)' : 'rgba(168,184,154,.3)',
              background:  done ? 'var(--moss)' : current ? 'var(--terracotta)' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 9, fontWeight: 600,
              color: (done || current) ? 'var(--white)' : 'rgba(168,184,154,.45)',
            }}>{sem}</div>
          )
        })}
      </div>
    </div>
  )
}

function CoachStats() {
  return (
    <div style={{ marginBottom: 'var(--s5)' }}>
      <p style={s.dotLabel}>Aperçu rapide</p>
      {[['Clientes actives', '2'], ['Bilans en attente', '1'], ['Onboardings', '1']].map(([label, val]) => (
        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
          <span style={{ fontSize: 'var(--tx-xs)', color: 'rgba(253,250,246,.65)' }}>{label}</span>
          <span style={{ fontSize: 'var(--tx-sm)', fontWeight: 500, color: 'var(--white)' }}>{val}</span>
        </div>
      ))}
    </div>
  )
}

const s = {
  brand: { padding: 'var(--s8) var(--s6) var(--s6)', borderBottom: '1px solid rgba(168,184,154,.15)', marginBottom: 'var(--s4)' },
  brandName: { display: 'block', fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 400, color: 'var(--white)', letterSpacing: '-.01em' },
  brandSub: { display: 'block', fontSize: 'var(--tx-xs)', color: 'var(--sage)', letterSpacing: '.1em', textTransform: 'uppercase', marginTop: 4 },
  nav: { flex: 1, display: 'flex', flexDirection: 'column', gap: 2, padding: '0 var(--s3)' },
  item: { display: 'flex', alignItems: 'center', gap: 'var(--s3)', padding: '10px var(--s4)', borderRadius: 'var(--r-sm)', color: 'rgba(253,250,246,.72)', fontSize: 'var(--tx-sm)', textDecoration: 'none', transition: 'background var(--ease-fast)', borderLeft: '2px solid transparent' },
  itemActive: { background: 'rgba(168,184,154,.1)', color: 'var(--white)', borderLeftColor: 'var(--terracotta)' },
  bottom: { padding: 'var(--s5) var(--s4)', borderTop: '1px solid rgba(168,184,154,.15)', marginTop: 'auto' },
  dotLabel: { fontSize: 'var(--tx-xs)', color: 'var(--sage)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 'var(--s3)' },
  userRow: { display: 'flex', alignItems: 'center', gap: 'var(--s3)' },
  avatar: { width: 32, height: 32, borderRadius: '50%', background: 'var(--sage)', color: 'var(--forest)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--tx-sm)', fontWeight: 600, flexShrink: 0 },
  userName: { fontSize: 'var(--tx-sm)', fontWeight: 500, color: 'var(--white)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  userRole: { fontSize: 'var(--tx-xs)', color: 'var(--sage)', textTransform: 'capitalize' },
  signOutBtn: { background: 'none', border: 'none', color: 'var(--stone)', fontSize: '1rem', cursor: 'pointer', padding: 4, borderRadius: 4, flexShrink: 0, transition: 'color var(--ease-fast)' },
}
