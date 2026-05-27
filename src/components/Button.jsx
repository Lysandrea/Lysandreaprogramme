const VARIANTS = {
  primary: {
    background: 'var(--forest)',
    color: 'var(--white)',
    border: 'none',
    '--btn-hover': '#2e3c2d',
  },
  secondary: {
    background: 'transparent',
    color: 'var(--earth)',
    border: '1px solid var(--sand)',
    '--btn-hover': 'var(--sand)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--bark)',
    border: 'none',
    '--btn-hover': 'var(--sand)',
  },
  danger: {
    background: 'var(--terracotta)',
    color: 'var(--white)',
    border: 'none',
    '--btn-hover': '#a85e48',
  },
  sage: {
    background: 'var(--sage)',
    color: 'var(--forest)',
    border: 'none',
    '--btn-hover': '#8fa87f',
  },
}

const SIZES = {
  sm: { padding: '6px 14px',  fontSize: 'var(--text-sm)',  borderRadius: 'var(--border-radius-sm)' },
  md: { padding: '11px 22px', fontSize: 'var(--text-sm)',  borderRadius: 'var(--border-radius-md)' },
  lg: { padding: '14px 28px', fontSize: 'var(--text-base)', borderRadius: 'var(--border-radius-md)' },
}

export default function Button({
  children,
  variant  = 'primary',
  size     = 'md',
  disabled = false,
  loading  = false,
  fullWidth = false,
  onClick,
  type = 'button',
  style: extra,
}) {
  const v = VARIANTS[variant] ?? VARIANTS.primary
  const s = SIZES[size] ?? SIZES.md
  const isDisabled = disabled || loading

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-2)',
        fontFamily: 'var(--font-sans)',
        fontWeight: 500,
        letterSpacing: '0.01em',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.55 : 1,
        transition: 'background var(--transition-fast), opacity var(--transition-fast), transform var(--transition-fast)',
        width: fullWidth ? '100%' : 'auto',
        background: v.background,
        color: v.color,
        border: v.border,
        ...s,
        ...extra,
      }}
      onMouseEnter={e => { if (!isDisabled) e.currentTarget.style.filter = 'brightness(0.93)' }}
      onMouseLeave={e => { e.currentTarget.style.filter = '' }}
      onMouseDown={e  => { if (!isDisabled) e.currentTarget.style.transform = 'scale(0.98)' }}
      onMouseUp={e    => { e.currentTarget.style.transform = '' }}
    >
      {loading ? (
        <span style={{ opacity: 0.7 }}>Chargement…</span>
      ) : children}
    </button>
  )
}
