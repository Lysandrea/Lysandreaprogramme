/* ── Card — Lysa Andréa ── */

export default function Card({
  children, title, subtitle,
  style: extra, padding,
  shadow = true, border = true,
}) {
  return (
    <div style={{
      background: 'var(--white)',
      border: border ? '1px solid var(--sand)' : 'none',
      borderRadius: 'var(--r-lg)',
      padding: padding ?? 'var(--s6)',
      boxShadow: shadow ? 'var(--sh-sm)' : 'none',
      ...extra,
    }}>
      {(title || subtitle) && (
        <div style={{ marginBottom: 'var(--s5)' }}>
          {title && (
            <h3 style={{
              fontFamily: 'var(--serif)', fontSize: 'var(--tx-xl)',
              fontWeight: 400, color: 'var(--earth)', letterSpacing: '-.01em',
            }}>
              {title}
            </h3>
          )}
          {subtitle && (
            <p style={{ fontSize: 'var(--tx-sm)', color: 'var(--bark)', marginTop: 'var(--s1)' }}>
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  )
}
