const PRESETS = {
  active:      { bg: 'rgba(107,127,94,0.15)',  color: 'var(--moss)',       label: 'Active' },
  onboarding:  { bg: 'rgba(196,149,106,0.15)', color: 'var(--color-warning)', label: 'Onboarding' },
  silent:      { bg: 'rgba(192,120,96,0.15)',  color: 'var(--terracotta)', label: 'Silencieuse' },
  done:        { bg: 'rgba(107,127,94,0.12)',  color: 'var(--moss)',       label: 'Fait ✓' },
  locked:      { bg: 'rgba(196,181,160,0.2)',  color: 'var(--stone)',      label: '🔒' },
  current:     { bg: 'rgba(61,79,60,0.12)',    color: 'var(--forest)',     label: 'Aujourd\'hui' },
  coach:       { bg: 'rgba(61,79,60,0.12)',    color: 'var(--forest)',     label: 'Coach' },
  cliente:     { bg: 'rgba(168,184,154,0.2)',  color: 'var(--moss)',       label: 'Cliente' },
}

export default function Badge({ variant = 'active', children, style: extra }) {
  const preset = PRESETS[variant] ?? PRESETS.active
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '3px 10px',
      borderRadius: '99px',
      fontSize: 'var(--text-xs)',
      fontWeight: 500,
      letterSpacing: '0.02em',
      background: preset.bg,
      color: preset.color,
      ...extra,
    }}>
      {children ?? preset.label}
    </span>
  )
}
