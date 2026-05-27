import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { label: 'Dashboard', to: '/', icon: '⊞' },
  { label: 'Settings', to: '/settings', icon: '⚙' },
]

export default function Sidebar() {
  return (
    <aside style={styles.sidebar}>
      <div style={styles.logo}>App</div>
      <nav style={styles.nav}>
        {NAV_ITEMS.map(({ label, to, icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            style={({ isActive }) => ({
              ...styles.item,
              ...(isActive ? styles.itemActive : {}),
            })}
          >
            <span style={styles.icon}>{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

const styles = {
  sidebar: {
    width: 'var(--sidebar-width)',
    background: 'var(--bg-sidebar)',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    height: '100vh',
    overflowY: 'auto',
  },
  logo: {
    padding: 'var(--space-6) var(--space-5)',
    fontSize: 'var(--text-xl)',
    fontWeight: 700,
    color: 'var(--text-inverse)',
    letterSpacing: '-0.02em',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-1)',
    padding: '0 var(--space-3)',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
    padding: 'var(--space-2) var(--space-3)',
    borderRadius: 'var(--border-radius-sm)',
    color: 'var(--text-sidebar)',
    fontSize: 'var(--text-sm)',
    fontWeight: 500,
    textDecoration: 'none',
    transition: 'background var(--transition-fast), color var(--transition-fast)',
  },
  itemActive: {
    background: 'var(--bg-sidebar-item-active)',
    color: 'var(--text-sidebar-active)',
  },
  icon: {
    fontSize: '1rem',
    lineHeight: 1,
  },
}
