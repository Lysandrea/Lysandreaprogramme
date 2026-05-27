import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.jsx'
import Sidebar from '../../components/Sidebar.jsx'
import Topbar  from '../../components/Topbar.jsx'
import Card    from '../../components/Card.jsx'
import Badge   from '../../components/Badge.jsx'
import Button  from '../../components/Button.jsx'
import LysaQuote from '../../components/LysaQuote.jsx'
import { MOCK_DAYS, MOCK_CURRENT_DAY, MOTIVATIONAL_MESSAGES } from '../../lib/mockData.js'

export default function ClienteDashboard() {
  const { profile } = useAuth()
  const navigate    = useNavigate()
  const prenom      = profile?.prenom ?? 'toi'
  const today       = MOCK_DAYS.find(d => d.status === 'current')
  const motivation  = MOTIVATIONAL_MESSAGES[new Date().getDate() % MOTIVATIONAL_MESSAGES.length]

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--cream)' }}>
        <Topbar title="Tableau de bord" subtitle={`Jour ${MOCK_CURRENT_DAY} · Semaine ${today?.semaine ?? 1}`} />

        <main style={s.content}>
          {/* Welcome banner */}
          <div style={s.banner}>
            <div>
              <h2 style={s.bannerTitle}>Bonjour {prenom} ✦</h2>
              <p style={s.bannerMsg}>{motivation}</p>
            </div>
            <div style={s.bannerSemaine}>
              <span style={s.bannerSemanineLabel}>Semaine</span>
              <span style={s.bannerSemanineNum}>{today?.semaine ?? 1}</span>
            </div>
          </div>

          {/* Today card */}
          {today && (
            <Card style={s.todayCard}>
              <div style={s.todayHeader}>
                <div>
                  <p style={s.todayLabel}>Séance du jour — J{today.jour}</p>
                  <h3 style={s.todayTitle}>{today.titre}</h3>
                  <p style={s.todayDuree}>{today.duree} min</p>
                </div>
                <div style={s.todayActions}>
                  <Button onClick={() => navigate(`/programme/${today.jour}`)}>
                    Commencer →
                  </Button>
                  <Badge variant={today.bilanFait ? 'done' : 'current'}>
                    {today.bilanFait ? 'Bilan fait ✓' : 'Bilan à remplir'}
                  </Badge>
                </div>
              </div>
            </Card>
          )}

          {/* Days list */}
          <div>
            <h3 style={s.sectionTitle}>Mon programme</h3>
            <div style={s.daysGrid}>
              {MOCK_DAYS.map(day => (
                <DayTile key={day.jour} day={day} onClick={() => {
                  if (day.status !== 'locked') navigate(`/programme/${day.jour}`)
                }} />
              ))}
            </div>
          </div>

          {/* Quote */}
          <LysaQuote index={today?.jour ?? 0} style={{ marginTop: 'var(--space-6)' }} />
        </main>
      </div>
    </div>
  )
}

function DayTile({ day, onClick }) {
  const isLocked  = day.status === 'locked'
  const isCurrent = day.status === 'current'
  const isDone    = day.status === 'done'

  return (
    <div
      onClick={onClick}
      style={{
        background: isCurrent ? 'var(--forest)' : isDone ? 'var(--white)' : 'rgba(196,181,160,0.15)',
        border: `1px solid ${isCurrent ? 'var(--forest)' : isDone ? 'var(--sage)' : 'var(--sand)'}`,
        borderRadius: 'var(--border-radius-md)',
        padding: '10px 12px',
        cursor: isLocked ? 'default' : 'pointer',
        opacity: isLocked ? 0.5 : 1,
        transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
      onMouseEnter={e => { if (!isLocked) e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = isLocked ? '' : 'var(--shadow-sm)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{
          fontSize: 'var(--text-xs)',
          fontWeight: 600,
          color: isCurrent ? 'var(--sage)' : isDone ? 'var(--moss)' : 'var(--stone)',
          letterSpacing: '0.06em',
        }}>
          J{day.jour}
        </span>
        <span style={{ fontSize: 11 }}>
          {isDone ? '✓' : isLocked ? '🔒' : '→'}
        </span>
      </div>
      <p style={{
        fontSize: 'var(--text-xs)',
        color: isCurrent ? 'var(--white)' : isDone ? 'var(--earth)' : 'var(--stone)',
        lineHeight: 1.3,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {day.titre}
      </p>
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
  banner: {
    background: 'linear-gradient(135deg, var(--forest) 0%, #2e3c2d 100%)',
    borderRadius: 'var(--border-radius-xl)',
    padding: 'var(--space-8) var(--space-8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'var(--space-4)',
  },
  bannerTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: 'var(--text-3xl)',
    fontWeight: 400,
    color: 'var(--white)',
    letterSpacing: '-0.01em',
  },
  bannerMsg: {
    fontSize: 'var(--text-sm)',
    color: 'var(--sage)',
    marginTop: 'var(--space-2)',
    maxWidth: 400,
  },
  bannerSemaine: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: 'rgba(255,255,255,0.08)',
    borderRadius: 'var(--border-radius-md)',
    padding: 'var(--space-4) var(--space-6)',
    flexShrink: 0,
  },
  bannerSemanineLabel: {
    fontSize: 'var(--text-xs)',
    color: 'var(--sage)',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
  },
  bannerSemanineNum: {
    fontFamily: 'var(--font-serif)',
    fontSize: 'var(--text-4xl)',
    fontWeight: 300,
    color: 'var(--white)',
    lineHeight: 1,
    marginTop: 2,
  },
  todayCard: {
    borderLeft: '3px solid var(--forest)',
  },
  todayHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'var(--space-4)',
    flexWrap: 'wrap',
  },
  todayLabel: {
    fontSize: 'var(--text-xs)',
    color: 'var(--stone)',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  todayTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: 'var(--text-2xl)',
    fontWeight: 400,
    color: 'var(--earth)',
  },
  todayDuree: {
    fontSize: 'var(--text-sm)',
    color: 'var(--bark)',
    marginTop: 4,
  },
  todayActions: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 'var(--space-2)',
  },
  sectionTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: 'var(--text-xl)',
    fontWeight: 400,
    color: 'var(--earth)',
    marginBottom: 'var(--space-4)',
  },
  daysGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
    gap: 'var(--space-2)',
  },
}
