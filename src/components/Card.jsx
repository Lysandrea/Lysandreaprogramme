export default function Card({
  children,
  title,
  subtitle,
  style: extra,
  padding,
  shadow = true,
  border = true,
}) {
  return (
    <div style={{
      background: 'var(--white)',
      border: border ? '1px solid var(--sand)' : 'none',
      borderRadius: 'var(--border-radius-lg)',
      padding: padding ?? 'var(--space-6)',
      boxShadow: shadow ? 'var(--shadow-sm)' : 'none',
      ...extra,
    }}>
      {(title || subtitle) && (
        <div style={{ marginBottom: 'var(--space-5)' }}>
          {title && (
            <h3 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'var(--text-xl)',
              fontWeight: 400,
              color: 'var(--earth)',
              letterSpacing: '-0.01em',
            }}>{title}</h3>
          )}
          {subtitle && (
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--bark)',
              marginTop: 'var(--space-1)',
            }}>{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </div>
  )
}
