import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar.jsx'
import Topbar  from '../../components/Topbar.jsx'
import Badge   from '../../components/Badge.jsx'
import { MOCK_DAYS } from '../../lib/mockData.js'

export default function Programme() {
  const navigate = useNavigate()

  const semaines = Array.from({ length: 8 }, (_, i) => ({
    num: i + 1,
    days: MOCK_DAYS.filter(d => d.semaine === i + 1),
  }))

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Topbar title="Mon programme" subtitle="8 semaines · 56 séances" />
        <main style={s.content}>
          {semaines.map(sem => (
            <div key={sem.num} style={{ marginBottom: 'var(--space-6)' }}>
              <h3 style={s.weekTitle}>Semaine {sem.num}</h3>
              <div style={s.weekGrid}>
                {sem.days.map(day => {
                  const isLocked  = day.status === 'locked'
                  const isCurrent = day.status === 'current'
                  const isDone    = day.status === 'done'
                  return (
                    <div
                      key={day.jour}
                      onClick={() => { if (!isLocked) navigate(`/programme/${day.jour}`) }}
                      style={{
                        background: isCurrent ? 'var(--forest)' : 'var(--white)',
                        border: `1px solid ${isCurrent ? 'var(--forest)' : 'var(--sand)'}`,
                        borderRadius: 'var(--border-radius-md)',
                        padding: 'var(--space-4)',
                        cursor: isLocked ? 'default' : 'pointer',
                        opacity: isLocked ? 0.45 : 1,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--space-2)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{
                          fontSize: 'var(--text-xs)',
                          fontWeight: 600,
                          color: isCurrent ? 'var(--sage)' : 'var(--stone)',
                          letterSpacing: '0.06em',
                        }}>
                          J{day.jour}
                        </span>
                        {isDone && <Badge variant="done" />}
                        {isCurrent && <Badge variant="current" />}
                        {isLocked && <span style={{ fontSize: 12 }}>🔒</span>}
                      </div>
                      <p style={{
                        fontSize: 'var(--text-sm)',
                        fontWeight: 500,
                        color: isCurrent ? 'var(--white)' : 'var(--earth)',
                      }}>
                        {day.titre}
                      </p>
                      <p style={{ fontSize: 'var(--text-xs)', color: isCurrent ? 'var(--sage)' : 'var(--stone)' }}>
                        {day.duree} min
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
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
  },
  weekTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: 'var(--text-lg)',
    fontWeight: 400,
    color: 'var(--earth)',
    marginBottom: 'var(--space-3)',
    letterSpacing: '-0.01em',
  },
  weekGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: 'var(--space-2)',
  },
}
