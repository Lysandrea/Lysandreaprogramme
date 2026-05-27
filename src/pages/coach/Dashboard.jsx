import { useNavigate } from 'react-router-dom'
import { useAuth }   from '../../contexts/AuthContext.jsx'
import Sidebar  from '../../components/Sidebar.jsx'
import Topbar   from '../../components/Topbar.jsx'
import Card     from '../../components/Card.jsx'
import Badge    from '../../components/Badge.jsx'
import { MOCK_CLIENTES } from '../../lib/mockData.js'

export default function CoachDashboard() {
  const { profile } = useAuth()
  const navigate    = useNavigate()

  const stats = {
    active:   MOCK_CLIENTES.filter(c => c.status === 'active').length,
    checkins: 2,
    intakes:  1,
  }

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Topbar
          title={`Bonjour ${profile?.prenom ?? 'Coach'} ✦`}
          subtitle="Vue d'ensemble — clientes"
        />
        <main style={s.content}>
          {/* Stats row */}
          <div style={s.statsRow}>
            {[
              { label: 'Clientes actives',       value: stats.active,   color: 'var(--moss)' },
              { label: 'Check-ins en attente',   value: stats.checkins, color: 'var(--terracotta)' },
              { label: 'Intakes en attente',     value: stats.intakes,  color: 'var(--bark)' },
            ].map(st => (
              <div key={st.label} style={s.statCard}>
                <span style={{ ...s.statValue, color: st.color }}>{st.value}</span>
                <span style={s.statLabel}>{st.label}</span>
              </div>
            ))}
          </div>

          {/* Clientes list */}
          <Card title="Mes clientes">
            <div style={s.clienteList}>
              {MOCK_CLIENTES.map(c => (
                <div
                  key={c.id}
                  onClick={() => navigate(`/coach/cliente/${c.id}`)}
                  style={s.clienteRow}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--cream)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                >
                  {/* Avatar */}
                  <div style={s.avatar}>
                    {c.prenom[0]}{c.nom[0]}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={s.clienteName}>{c.prenom} {c.nom}</p>
                    <p style={s.clienteEmail}>{c.email}</p>
                  </div>

                  {/* Jour actuel */}
                  <div style={s.jourBlock}>
                    <span style={s.jourValue}>J{c.jourActuel}</span>
                    <span style={s.jourLabel}>/ 56</span>
                  </div>

                  {/* Dernière activité */}
                  <div style={s.activiteBlock}>
                    <p style={s.activiteLabel}>Dernière activité</p>
                    <p style={s.activiteDate}>
                      {c.derniereBilanDate
                        ? new Date(c.derniereBilanDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
                        : '—'
                      }
                    </p>
                  </div>

                  {/* Badge */}
                  <Badge variant={c.status} />
                </div>
              ))}
            </div>
          </Card>
        </main>
      </div>
    </div>
  )
}

const s = {
  content: {
    flex: 1,
    overflowY: 'auto',
    padding: 'var(--space-8)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-6)',
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 'var(--space-4)',
  },
  statCard: {
    background: 'var(--white)',
    border: '1px solid var(--sand)',
    borderRadius: 'var(--border-radius-lg)',
    padding: 'var(--space-6)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-1)',
    boxShadow: 'var(--shadow-sm)',
  },
  statValue: {
    fontFamily: 'var(--font-serif)',
    fontSize: 'var(--text-4xl)',
    fontWeight: 300,
    lineHeight: 1,
  },
  statLabel: {
    fontSize: 'var(--text-sm)',
    color: 'var(--stone)',
    marginTop: 'var(--space-1)',
  },
  clienteList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
    marginTop: 'var(--space-2)',
  },
  clienteRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-4)',
    padding: 'var(--space-4) var(--space-3)',
    borderRadius: 'var(--border-radius-md)',
    cursor: 'pointer',
    transition: 'background var(--transition-fast)',
    borderBottom: '1px solid var(--sand)',
  },
  avatar: {
    width: 40, height: 40,
    borderRadius: '50%',
    background: 'var(--sand)',
    color: 'var(--earth)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 'var(--text-xs)',
    fontWeight: 600,
    flexShrink: 0,
  },
  clienteName: {
    fontSize: 'var(--text-sm)',
    fontWeight: 500,
    color: 'var(--earth)',
  },
  clienteEmail: {
    fontSize: 'var(--text-xs)',
    color: 'var(--stone)',
  },
  jourBlock: {
    textAlign: 'right',
    flexShrink: 0,
    minWidth: 60,
  },
  jourValue: {
    fontFamily: 'var(--font-serif)',
    fontSize: 'var(--text-xl)',
    fontWeight: 400,
    color: 'var(--earth)',
  },
  jourLabel: {
    fontSize: 'var(--text-xs)',
    color: 'var(--stone)',
    marginLeft: 2,
  },
  activiteBlock: {
    textAlign: 'right',
    flexShrink: 0,
    minWidth: 100,
  },
  activiteLabel: {
    fontSize: 'var(--text-xs)',
    color: 'var(--stone)',
  },
  activiteDate: {
    fontSize: 'var(--text-sm)',
    color: 'var(--earth)',
    fontWeight: 500,
  },
}
