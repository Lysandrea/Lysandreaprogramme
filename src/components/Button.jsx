/* ── Button — Lysa Andréa ── */

const V = {
  primary:    { bg: 'var(--forest)',     color: 'var(--white)',  border: 'none' },
  secondary:  { bg: 'transparent',       color: 'var(--earth)',  border: '1px solid var(--sand)' },
  ghost:      { bg: 'transparent',       color: 'var(--bark)',   border: 'none' },
  danger:     { bg: 'var(--terracotta)', color: 'var(--white)',  border: 'none' },
  sage:       { bg: 'var(--sage)',       color: 'var(--forest)', border: 'none' },
  terracotta: { bg: 'var(--terracotta)', color: 'var(--white)',  border: 'none' },
}

const SZ = {
  sm: { padding: '7px 16px',  fontSize: 'var(--tx-sm)',   borderRadius: 'var(--r-sm)' },
  md: { padding: '12px 22px', fontSize: 'var(--tx-sm)',   borderRadius: 'var(--r-md)' },
  lg: { padding: '15px 30px', fontSize: 'var(--tx-base)', borderRadius: 'var(--r-md)' },
}

export default function Button({
  children, variant = 'primary', size = 'md',
  disabled = false, loading = false, fullWidth = false,
  onClick, type = 'button', style: extra,
}) {
  const v   = V[variant]  ?? V.primary
  const sz  = SZ[size]    ?? SZ.md
  const off = disabled || loading

  return (
    <button
      type={type}
      disabled={off}
      onClick={onClick}
      onMouseEnter={e => { if (!off) e.currentTarget.style.filter = 'brightness(.88)' }}
      onMouseLeave={e => { e.currentTarget.style.filter = '' }}
      onMouseDown={e  => { if (!off) e.currentTarget.style.transform = 'scale(.975)' }}
      onMouseUp={e    => { e.currentTarget.style.transform = '' }}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        gap: 'var(--s2)',
        fontFamily: 'var(--sans)', fontWeight: 500, letterSpacing: '.01em',
        cursor: off ? 'not-allowed' : 'pointer',
        opacity: off ? .55 : 1,
        transition: 'filter var(--ease-fast), transform var(--ease-fast)',
        width: fullWidth ? '100%' : 'auto',
        background: v.bg, color: v.color, border: v.border,
        ...sz, ...extra,
      }}
    >
      {loading ? <span style={{ opacity: .75 }}>Chargement…</span> : children}
    </button>
  )
}
