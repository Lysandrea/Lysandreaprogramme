export default function Card({ children, title, style: extraStyle }) {
  return (
    <div style={{ ...styles.card, ...extraStyle }}>
      {title && <h3 style={styles.title}>{title}</h3>}
      {children}
    </div>
  )
}

const styles = {
  card: {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--border-radius-md)',
    padding: 'var(--space-6)',
    boxShadow: 'var(--shadow-sm)',
  },
  title: {
    fontSize: 'var(--text-base)',
    fontWeight: 600,
    color: 'var(--text-primary)',
    marginBottom: 'var(--space-4)',
  },
}
