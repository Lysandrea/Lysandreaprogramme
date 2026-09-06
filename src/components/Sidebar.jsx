import { useState, useEffect }  from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth }              from '../contexts/AuthContext.jsx'
import { useSidebar }           from '../contexts/SidebarContext.jsx'
import { IS_MOCK, fetchUnreadNotificationsCount, fetchAiProgramme } from '../lib/supabase.js'

const COACH_NAV = [
  { label: 'Vue Coach',          to: '/coach',                    icon: '📋' },
  { label: 'Liste d\'attente',   to: '/coach/liste-attente',      icon: '📬' },
  { label: 'Aperçu Recettes',    to: '/coach/recettes-preview',   icon: '🍲' },
  { label: 'Aperçu Podcasts',    to: '/coach/podcasts-preview',   icon: '🎙️' },
  { label: 'Pourquoi j\'ai mal', to: '/coach/pourquoi-jai-mal',   icon: '🩹' },
  { label: 'Avis clientes',      to: '/coach/avis',               icon: '⭐' },
]

const CLIENTE_SECTIONS = [
  {
    title: 'Mon espace',
    items: [
      { label: 'Mon profil',    to: '/profil',    icon: '👤' },
      { label: 'Mes documents', to: '/documents', icon: '📄' },
    ],
  },
  {
    title: 'Mon programme',
    items: [
      { label: 'Accueil',           to: '/dashboard',      icon: '🌿' },
      { label: 'Ma roue de la vie', to: '/roue-de-la-vie', icon: '📊' },
      { label: 'Ma progression',    to: '/progression',    icon: '📈' },
      { label: 'Mes bilans',        to: '/mes-bilans',     icon: '📓' },
    ],
  },
  {
    title: 'Contenu débloqué',
    items: [
      { label: 'Mes podcasts',           to: '/podcasts',           icon: '🎙️', lockedUntilPublished: true },
      { label: 'Mes recettes',           to: '/recettes',           icon: '🍲', lockedUntilPublished: true },
      { label: 'Mes conseils nutrition', to: '/conseils-nutrition', icon: '🥗', requiresPublished: true },
      { label: "Pourquoi j'ai mal",      to: '/pourquoi-jai-mal',   icon: '🩹', lockedUntilPublished: true },
    ],
  },
  {
    title: 'Ma communauté',
    items: [
      { label: 'WhatsApp Lysa', href: 'https://wa.me/33650947117', icon: '💬', external: true },
    ],
  },
  {
    title: 'Fin de programme',
    items: [
      { label: 'Ma roue finale ✦',  to: '/roue-finale', icon: '🌀', lockable: true },
      { label: 'Ma lettre de fin',  to: '/lettre-fin',  icon: '📝', lockable: true },
      { label: 'Laisser un avis',   to: '/avis',        icon: '⭐', lockable: true },
    ],
  },
]

export default function Sidebar() {
  const { user, role, profile, signOut } = useAuth()
  const { open, close }                  = useSidebar()
  const navigate  = useNavigate()
  const location  = useLocation()
  const [unreadCount, setUnreadCount] = useState(0)

  const currentSemaine = Math.ceil((profile?.current_day ?? 1) / 7)
  const isWeek8 = currentSemaine >= 8
  const [aiPublie, setAiPublie] = useState(false)

  useEffect(() => {
    if (IS_MOCK || role !== 'coach' || !user) return
    fetchUnreadNotificationsCount(user.id)
      .then(setUnreadCount)
      .catch(() => {})
  }, [role, user, location.pathname])

  useEffect(() => {
    if (IS_MOCK || role !== 'cliente' || !user) return
    fetchAiProgramme(user.id)
      .then(prog => setAiPublie(prog?.statut === 'publie'))
      .catch(() => {})
  }, [role, user])

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <>
      {open && <div className="sidebar-backdrop" onClick={close} aria-hidden="true" />}

      <aside className={`shell-sidebar${open ? ' sidebar-open' : ''}`}>
        <button className="sidebar-close-btn" onClick={close} aria-label="Fermer">✕</button>

        {/* Brand */}
        <div style={s.brand}>
          <span style={s.brandName}>Lysa Andréa</span>
          <span style={s.brandSub}>Déclic</span>
        </div>

        {/* Nav — Cliente : sections */}
        {role === 'cliente' && (
          <nav style={s.nav}>
            {CLIENTE_SECTIONS.map(section => (
              <div key={section.title} style={{ marginBottom: 'var(--s2)' }}>
                <p style={s.sectionLabel}>{section.title}</p>
                {section.items.map(item => {
                  const locked = (item.lockable && !isWeek8) || (item.lockedUntilPublished && !aiPublie)
                  if (item.requiresPublished && !aiPublie) return null

                  if (item.external) {
                    return (
                      <a
                        key={item.label}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={close}
                        style={s.item}
                      >
                        <span style={s.icon}>{item.icon}</span>
                        <span style={{ flex: 1 }}>{item.label}</span>
                        <span style={{ fontSize: 10, opacity: .4 }}>↗</span>
                      </a>
                    )
                  }

                  if (locked) {
                    return (
                      <div key={item.to} style={{ ...s.item, ...s.itemLocked }}>
                        <span style={s.icon}>{item.icon}</span>
                        <span style={{ flex: 1 }}>{item.label}</span>
                        <span style={{ fontSize: 10 }}>🔒</span>
                      </div>
                    )
                  }

                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end
                      onClick={close}
                      style={({ isActive }) => ({ ...s.item, ...(isActive ? s.itemActive : {}) })}
                    >
                      <span style={s.icon}>{item.icon}</span>
                      <span>{item.label}</span>
                    </NavLink>
                  )
                })}
              </div>
            ))}
          </nav>
        )}

        {/* Nav — Coach */}
        {role === 'coach' && (
          <nav style={s.nav}>
            {COACH_NAV.map(({ label, to, icon }) => (
              <NavLink
                key={to} to={to} end
                onClick={close}
                style={({ isActive }) => ({ ...s.item, ...(isActive ? s.itemActive : {}) })}
              >
                <span style={{ fontSize: '1rem', flexShrink: 0 }}>{icon}</span>
                <span style={{ flex: 1 }}>{label}</span>
                {to === '/coach' && unreadCount > 0 && (
                  <span style={s.badge}>{unreadCount}</span>
                )}
              </NavLink>
            ))}
          </nav>
        )}

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
  const { profile } = useAuth()
  const currentSemaine = Math.ceil((profile?.current_day ?? 1) / 7)
  return (
    <div style={{ marginBottom: 'var(--s5)' }}>
      <p style={s.dotLabel}>Progression</p>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {Array.from({ length: 8 }, (_, i) => {
          const sem     = i + 1
          const done    = sem < currentSemaine
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
      {[['Clientes actives', '—'], ['Bilans en attente', '—']].map(([label, val]) => (
        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
          <span style={{ fontSize: 'var(--tx-xs)', color: 'rgba(253,250,246,.65)' }}>{label}</span>
          <span style={{ fontSize: 'var(--tx-sm)', fontWeight: 500, color: 'var(--white)' }}>{val}</span>
        </div>
      ))}
    </div>
  )
}

const s = {
  brand: { padding: 'var(--s8) var(--s6) var(--s5)', borderBottom: '1px solid rgba(168,184,154,.15)', marginBottom: 'var(--s3)' },
  brandName: { display: 'block', fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 400, color: 'var(--white)', letterSpacing: '-.01em' },
  brandSub:  { display: 'block', fontSize: 'var(--tx-xs)', color: 'var(--sage)', letterSpacing: '.1em', textTransform: 'uppercase', marginTop: 4 },
  nav: { flex: 1, display: 'flex', flexDirection: 'column', padding: '0 var(--s3)', overflowY: 'auto' },
  sectionLabel: { fontSize: 10, color: 'rgba(168,184,154,.7)', letterSpacing: '.12em', textTransform: 'uppercase', padding: '8px var(--s2) 3px', fontWeight: 600 },
  item: { display: 'flex', alignItems: 'center', gap: 'var(--s3)', padding: '7px var(--s3)', borderRadius: 'var(--r-sm)', color: 'rgba(253,250,246,.68)', fontSize: 'var(--tx-sm)', textDecoration: 'none', transition: 'background var(--ease-fast)', borderLeft: '2px solid transparent', cursor: 'pointer' },
  itemActive: { background: 'rgba(168,184,154,.1)', color: 'var(--white)', borderLeftColor: 'var(--terracotta)' },
  itemLocked: { color: 'rgba(253,250,246,.22)', cursor: 'not-allowed' },
  icon: { fontSize: '0.9rem', flexShrink: 0, width: 18, textAlign: 'center' },
  bottom: { padding: 'var(--s5) var(--s4)', borderTop: '1px solid rgba(168,184,154,.15)', marginTop: 'auto' },
  dotLabel: { fontSize: 'var(--tx-xs)', color: 'var(--sage)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 'var(--s3)' },
  userRow: { display: 'flex', alignItems: 'center', gap: 'var(--s3)' },
  avatar: { width: 32, height: 32, borderRadius: '50%', background: 'var(--sage)', color: 'var(--forest)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--tx-sm)', fontWeight: 600, flexShrink: 0 },
  userName: { fontSize: 'var(--tx-sm)', fontWeight: 500, color: 'var(--white)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  userRole:  { fontSize: 'var(--tx-xs)', color: 'var(--sage)', textTransform: 'capitalize' },
  signOutBtn: { background: 'none', border: 'none', color: 'var(--stone)', fontSize: '1rem', cursor: 'pointer', padding: 4, borderRadius: 4, flexShrink: 0, transition: 'color var(--ease-fast)' },
  badge: { minWidth: 18, height: 18, borderRadius: 99, background: 'var(--terracotta)', color: 'var(--white)', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px', flexShrink: 0 },
}
