const VARIANTS = {
  primary: {
    background: 'var(--color-primary)',
    color: 'var(--text-inverse)',
    border: 'none',
    hoverBg: 'var(--color-primary-hover)',
  },
  secondary: {
    background: 'var(--bg-surface)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-color)',
    hoverBg: 'var(--bg-base)',
  },
  danger: {
    background: 'var(--color-danger)',
    color: 'var(--text-inverse)',
    border: 'none',
    hoverBg: 'var(--color-danger-hover)',
  },
}

const SIZES = {
  sm: { padding: '6px 12px', fontSize: 'var(--text-sm)' },
  md: { padding: '10px 18px', fontSize: 'var(--text-sm)' },
  lg: { padding: '12px 24px', fontSize: 'var(--text-base)' },
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  onClick,
  type = 'button',
  style: extraStyle,
}) {
  const v = VARIANTS[variant] ?? VARIANTS.primary
  const s = SIZES[size] ?? SIZES.md

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-2)',
        fontWeight: 500,
        borderRadius: 'var(--border-radius-sm)',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'background var(--transition-fast), opacity var(--transition-fast)',
        width: fullWidth ? '100%' : 'auto',
        background: v.background,
        color: v.color,
        border: v.border,
        ...s,
        ...extraStyle,
      }}
    >
      {loading ? 'Loading…' : children}
    </button>
  )
}
