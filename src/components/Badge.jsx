/* ── Badge — Lysa Andréa ── */

const P = {
  active:     { bg: 'rgba(107,127,94,.15)', color: 'var(--moss)',       label: 'Active' },
  onboarding: { bg: 'rgba(196,149,106,.2)', color: '#B07240',           label: 'Onboarding' },
  silent:     { bg: 'rgba(192,120,96,.15)', color: 'var(--terracotta)', label: 'Silencieuse' },
  done:       { bg: 'rgba(107,127,94,.13)', color: 'var(--moss)',       label: 'Fait ✓' },
  locked:     { bg: 'rgba(196,181,160,.2)', color: 'var(--stone)',      label: '🔒' },
  current:    { bg: 'rgba(192,120,96,.13)', color: 'var(--terracotta)', label: "Aujourd'hui" },
  coach:      { bg: 'rgba(61,79,60,.12)',   color: 'var(--forest)',     label: 'Coach' },
  cliente:    { bg: 'rgba(168,184,154,.2)', color: 'var(--moss)',       label: 'Cliente' },
}

export default function Badge({ variant = 'active', children, style: extra }) {
  const p = P[variant] ?? P.active
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 10px', borderRadius: 99,
      fontSize: 'var(--tx-xs)', fontWeight: 500, letterSpacing: '.02em',
      background: p.bg, color: p.color,
      whiteSpace: 'nowrap',
      ...extra,
    }}>
      {children ?? p.label}
    </span>
  )
}
