import { useEffect, useState } from 'react'
import { useNavigate }         from 'react-router-dom'
import { useAuth }             from '../../contexts/AuthContext.jsx'
import { IS_MOCK, fetchClientes } from '../../lib/supabase.js'
import Sidebar from '../../components/Sidebar.jsx'
import Topbar  from '../../components/Topbar.jsx'
import Card    from '../../components/Card.jsx'
import Badge   from '../../components/Badge.jsx'
import { MOCK_CLIENTES } from '../../lib/mockData.js'

export default function CoachDashboard() {
  const { user }  = useAuth()
  const navigate  = useNavigate()

  const [clientes, setClientes] = useState(MOCK_CLIENTES)
  const [loading,  setLoading]  = useState(!IS_MOCK)

  useEffect(() => {
    if (IS_MOCK || !user) return
    fetchClientes(user.id)
      .then(data => setClientes(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user])

  const actives    = clientes.filter(c => c.status === 'active').length
  const bilansEn   = clientes.reduce((a, c) => a + (c.bilansEnAttente ?? 0), 0)
  const onboarding = clientes.filter(c => c.status === 'onboarding').length

  return (
    <div className="shell">
      <Sidebar />
      <div className="shell-main">
        <Topbar title="Vue Coach" subtitle="Tableau de bord" />
        <div className="shell-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s6)' }}>

          {/* Stat cards */}
          <div style={s.statsRow}>
            <StatCard label="Clientes actives"     value={actives}    color="var(--moss)" />
            <StatCard label="Bilans en attente"     value={bilansEn}   color="var(--terracotta)" />
            <StatCard label="Onboardings en cours"  value={onboarding} color="var(--bark)" />
          </div>

          {/* Liste clientes */}
          <Card title="Mes clientes">
            {loading ? (
              <p style={{ fontSize: 'var(--tx-sm)', color: 'var(--stone)', padding: 'var(--s4) 0' }}>Chargement…</p>
            ) : clientes.length === 0 ? (
              <p style={{ fontSize: 'var(--tx-sm)', color: 'var(--stone)', padding: 'var(--s4) 0' }}>
                Aucune cliente pour l'instant. Invitez des clientes via Supabase Auth.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {clientes.map((c, i) => (
                  <ClienteRow
                    key={c.id}
                    c={c}
                    isLast={i === clientes.length - 1}
                    onClick={() => navigate(`/coach/cliente/${c.id}`)}
                  />
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div style={s.statCard}>
      <span style={{ ...s.statValue, color }}>{value}</span>
      <span style={s.statLabel}>{label}</span>
    </div>
  )
}

function ClienteRow({ c, isLast, onClick }) {
  const lastDate = c.derniereBilanDate
    ? new Date(c.derniereBilanDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
    : '—'

  const jourActuel = c.current_day ?? c.jourActuel ?? 1

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 'var(--s4)',
        padding: 'var(--s4) var(--s3)',
        borderRadius: 'var(--r-md)',
        borderBottom: isLast ? 'none' : '1px solid var(--sand)',
        cursor: 'pointer', transition: 'background var(--ease-fast)',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--cream)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
    >
      <div style={s.avatar}>{(c.prenom?.[0] ?? '?')}{(c.nom?.[0] ?? '')}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={s.name}>{c.prenom} {c.nom}</p>
        <p style={s.email}>{c.email}</p>
      </div>
      <div style={s.jourBlock}>
        <span style={s.jourVal}>J{jourActuel}</span>
        <span style={{ fontSize: 'var(--tx-xs)', color: 'var(--stone)' }}>/56</span>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0, minWidth: 100 }}>
        <p style={{ fontSize: 'var(--tx-xs)', color: 'var(--stone)' }}>Dernière activité</p>
        <p style={{ fontSize: 'var(--tx-sm)', fontWeight: 500, color: 'var(--earth)' }}>{lastDate}</p>
      </div>
      <Badge variant={c.status} />
    </div>
  )
}

const s = {
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--s4)' },
  statCard: {
    background: 'var(--white)', border: '1px solid var(--sand)',
    borderRadius: 'var(--r-lg)', padding: 'var(--s6)',
    display: 'flex', flexDirection: 'column', gap: 'var(--s1)', boxShadow: 'var(--sh-sm)',
  },
  statValue: { fontFamily: 'var(--serif)', fontSize: 52, fontWeight: 300, lineHeight: 1 },
  statLabel: { fontSize: 'var(--tx-sm)', color: 'var(--stone)', marginTop: 'var(--s1)' },
  avatar: {
    width: 40, height: 40, borderRadius: '50%',
    background: 'var(--sand)', color: 'var(--earth)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 'var(--tx-xs)', fontWeight: 700, flexShrink: 0, letterSpacing: '.02em',
  },
  name:     { fontSize: 'var(--tx-sm)', fontWeight: 500, color: 'var(--earth)' },
  email:    { fontSize: 'var(--tx-xs)', color: 'var(--stone)' },
  jourBlock:{ textAlign: 'right', flexShrink: 0 },
  jourVal:  { fontFamily: 'var(--serif)', fontSize: 'var(--tx-xl)', fontWeight: 400, color: 'var(--earth)' },
}
