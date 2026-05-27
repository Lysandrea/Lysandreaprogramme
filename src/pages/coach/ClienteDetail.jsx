import { useParams, useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar.jsx'
import Topbar  from '../../components/Topbar.jsx'
import Card    from '../../components/Card.jsx'
import Badge   from '../../components/Badge.jsx'
import Button  from '../../components/Button.jsx'
import { MOCK_CLIENTES, MOCK_DAYS } from '../../lib/mockData.js'

export default function ClienteDetail() {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const cliente   = MOCK_CLIENTES.find(c => c.id === id)

  if (!cliente) {
    return (
      <div style={s.notFound}>
        <p>Cliente introuvable.</p>
        <Button variant="ghost" onClick={() => navigate('/coach')}>← Retour</Button>
      </div>
    )
  }

  const progress   = Math.round((cliente.jourActuel / 56) * 100)
  const doneDays   = MOCK_DAYS.filter(d => d.jour <= cliente.jourActuel && d.status === 'done')
  const bilansDone = doneDays.filter(d => d.bilanFait).length

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Topbar
          title={`${cliente.prenom} ${cliente.nom}`}
          subtitle={`Jour ${cliente.jourActuel} / 56 · Rejoint le ${new Date(cliente.joinDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`}
        />
        <main style={s.content}>
          <Button variant="ghost" size="sm" onClick={() => navigate('/coach')} style={{ marginBottom: 'var(--space-2)' }}>
            ← Toutes les clientes
          </Button>

          {/* Header card */}
          <Card>
            <div style={s.clienteHeader}>
              <div style={s.bigAvatar}>
                {cliente.prenom[0]}{cliente.nom[0]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
                  <h2 style={s.name}>{cliente.prenom} {cliente.nom}</h2>
                  <Badge variant={cliente.status} />
                </div>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--stone)' }}>{cliente.email}</p>
                <div style={s.progressRow}>
                  <div style={s.progressBar}>
                    <div style={{ ...s.progressFill, width: `${progress}%` }} />
                  </div>
                  <span style={s.progressLabel}>{progress}% — J{cliente.jourActuel}/56</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Stats */}
          <div style={s.statsGrid}>
            {[
              { label: 'Jour actuel',         val: `J${cliente.jourActuel}` },
              { label: 'Bilans complétés',    val: bilansDone },
              { label: 'Séances terminées',   val: cliente.jourActuel - 1 },
              { label: 'Dernière activité',   val: cliente.derniereBilanDate
                ? new Date(cliente.derniereBilanDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
                : '—'
              },
            ].map(st => (
              <div key={st.label} style={s.statCard}>
                <span style={s.statVal}>{st.val}</span>
                <span style={s.statLabel}>{st.label}</span>
              </div>
            ))}
          </div>

          {/* Programme mini view */}
          <Card title="Progression du programme">
            <div style={s.miniDays}>
              {MOCK_DAYS.slice(0, 28).map(day => {
                const done    = day.jour < cliente.jourActuel
                const current = day.jour === cliente.jourActuel
                return (
                  <div key={day.jour} style={{
                    width: 28, height: 28,
                    borderRadius: 4,
                    background: current ? 'var(--forest)' : done ? 'var(--sage)' : 'var(--sand)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 9,
                    fontWeight: 600,
                    color: done || current ? 'var(--white)' : 'var(--stone)',
                    title: `J${day.jour}`,
                  }}>
                    {day.jour}
                  </div>
                )
              })}
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--stone)', alignSelf: 'center', marginLeft: 4 }}>
                J29–J56 →
              </span>
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
    gap: 'var(--space-5)',
  },
  clienteHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--space-6)',
  },
  bigAvatar: {
    width: 64, height: 64,
    borderRadius: '50%',
    background: 'var(--sand)',
    color: 'var(--earth)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 'var(--text-xl)',
    fontWeight: 600,
    flexShrink: 0,
  },
  name: {
    fontFamily: 'var(--font-serif)',
    fontSize: 'var(--text-2xl)',
    fontWeight: 400,
    color: 'var(--earth)',
  },
  progressRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
    marginTop: 'var(--space-4)',
  },
  progressBar: {
    flex: 1,
    height: 6,
    background: 'var(--sand)',
    borderRadius: 99,
    overflow: 'hidden',
    maxWidth: 300,
  },
  progressFill: {
    height: '100%',
    background: 'var(--forest)',
    borderRadius: 99,
    transition: 'width 0.5s ease',
  },
  progressLabel: {
    fontSize: 'var(--text-sm)',
    color: 'var(--bark)',
    whiteSpace: 'nowrap',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 'var(--space-4)',
  },
  statCard: {
    background: 'var(--white)',
    border: '1px solid var(--sand)',
    borderRadius: 'var(--border-radius-md)',
    padding: 'var(--space-5)',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    boxShadow: 'var(--shadow-sm)',
  },
  statVal: {
    fontFamily: 'var(--font-serif)',
    fontSize: 'var(--text-2xl)',
    fontWeight: 400,
    color: 'var(--earth)',
  },
  statLabel: {
    fontSize: 'var(--text-xs)',
    color: 'var(--stone)',
  },
  miniDays: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 'var(--space-3)',
  },
  notFound: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--space-4)',
    color: 'var(--stone)',
  },
}
