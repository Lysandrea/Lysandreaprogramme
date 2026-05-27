export default function Topbar({ title }) {
  return (
    <header style={styles.topbar}>
      <span style={styles.title}>{title}</span>
      <div style={styles.actions}>
        <div style={styles.avatar}>U</div>
      </div>
    </header>
  )
}

const styles = {
  topbar: {
    height: 'var(--topbar-height)',
    background: 'var(--bg-surface)',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 var(--space-6)',
    flexShrink: 0,
  },
  title: {
    fontSize: 'var(--text-base)',
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: 'var(--color-primary)',
    color: 'var(--text-inverse)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 'var(--text-sm)',
    fontWeight: 600,
  },
}
