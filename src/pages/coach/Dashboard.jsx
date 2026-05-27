import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar.jsx'
import Topbar  from '../../components/Topbar.jsx'
import Card    from '../../components/Card.jsx'
import Badge   from '../../components/Badge.jsx'
import { MOCK_CLIENTES } from '../../lib/mockData.js'

export default function CoachDashboard() {
  const navigate = useNavigate()

  const actives    = MOCK_CLIENTES.filter(c => c.status === 'active').length
  const bilansEn   = MOCK_CLIENTES.reduce((acc, c) => acc + (c.bilansEnAttente ?? 0), 0)
  const onboarding = MOCK_CLIENTES.filter(c => c.status === 'onboarding').length

  return (
    <div className="shell">
      <Sidebar />
      <div className="shell-main">
        <Topbar title="Vue Coach" subtitle="Tableau de bord" />
        <div className="shell-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s6)' }}>

          {/* ── 3 stat cards ── */}
          <div style={s.statsRow}>
            <StatCard label="Clientes actives"    value={actives}    color="var(--moss)" />
            <StatCard label="Bilans en attente"    value={bilansEn}   color="var(--terracotta)" />
            <StatCard label="Onboardings en cours" value={onboarding} color="var(--bark)" />
          </div>

          {/* ── Cliente list ── */}
          <Card title="Mes clientes">
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {MOCK_CLIENTES.map((c, i) => (
                <ClienteRow
                  key={c.id}
                  c={c}
                  isLast={i === MOCK_CLIENTES.length - 1}
                  onClick={() => navigate(`/coach/cliente/${c.id}`)}
                />
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

/* ── Stat card ── */
function StatCard({ label, value, color }) {
  return (
    <div style={s.statCard}>
      <span style={{ ...s.statValue, color }}>{value}</span>
      <span style={s.statLabel}>{label}</span>
    </div>
  )
}

/* ── Cliente row ── */
function ClienteRow({ c, isLast, onClick }) {
  const lastDate = c.derniereBilanDate
    ? new Date(c.derniereBilanDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
    : '—'

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 'var(--s4)',
        padding: 'var(--s4) var(--s3)',
        borderRadius: 'var(--r-md)',
        borderBottom: isLast ? 'none' : '1px solid var(--sand)',
        cursor: 'pointer',
        transition: 'background var(--ease-fast)',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--cream)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
    >
      {/* Avatar */}
      <div style={s.avatar}>
        {c.prenom[0]}{c.nom[0]}
      </div>

      {/* Name + email */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={s.clienteName}>{c.prenom} {c.nom}</p>
        <p style={s.clienteEmail}>{c.email}</p>
      </div>

      {/* Current day */}
      <div style={s.jourBlock}>
        <span style={s.jourValue}>J{c.jourActuel}</span>
        <span style={s.jourSub}>/56</span>
      </div>

      {/* Last activity */}
      <div style={s.activityBlock}>
        <p style={s.activityLabel}>Dernière activité</p>
        <p style={s.activityDate}>{lastDate}</p>
      </div>

      {/* Badge */}
      <Badge variant={c.status} />
    </div>
  )
}

const s = {
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--s4)' },
  statCard: {
    background: 'var(--white)', border: '1px solid var(--sand)',
    borderRadius: 'var(--r-lg)', padding: 'var(--s6)',
    display: 'flex', flexDirection: 'column', gap: 'var(--s1)',
    boxShadow: 'var(--sh-sm)',
  },
  statValue: {
    fontFamily: 'var(--serif)', fontSize: 52,
    fontWeight: 300, lineHeight: 1,
  },
  statLabel: { fontSize: 'var(--tx-sm)', color: 'var(--stone)', marginTop: 'var(--s1)' },
  avatar: {
    width: 40, height: 40, borderRadius: '50%',
    background: 'var(--sand)', color: 'var(--earth)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 'var(--tx-xs)', fontWeight: 700, flexShrink: 0,
    letterSpacing: '.02em',
  },
  clienteName: { fontSize: 'var(--tx-sm)', fontWeight: 500, color: 'var(--earth)' },
  clienteEmail: { fontSize: 'var(--tx-xs)', color: 'var(--stone)' },
  jourBlock: { textAlign: 'right', flexShrink: 0 },
  jourValue: { fontFamily: 'var(--serif)', fontSize: 'var(--tx-xl)', fontWeight: 400, color: 'var(--earth)' },
  jourSub: { fontSize: 'var(--tx-xs)', color: 'var(--stone)', marginLeft: 2 },
  activityBlock: { textAlign: 'right', flexShrink: 0, minWidth: 100 },
  activityLabel: { fontSize: 'var(--tx-xs)', color: 'var(--stone)' },
  activityDate: { fontSize: 'var(--tx-sm)', fontWeight: 500, color: 'var(--earth)' },
}
