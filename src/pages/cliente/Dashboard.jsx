import { useNavigate } from 'react-router-dom'
import { useAuth }     from '../../contexts/AuthContext.jsx'
import Sidebar     from '../../components/Sidebar.jsx'
import Topbar      from '../../components/Topbar.jsx'
import Card        from '../../components/Card.jsx'
import Button      from '../../components/Button.jsx'
import LysaQuote   from '../../components/LysaQuote.jsx'
import { MOCK_DAYS, MOCK_CURRENT_DAY, MOTIVATIONAL_MESSAGES } from '../../lib/mockData.js'

export default function ClienteDashboard() {
  const { profile } = useAuth()
  const navigate    = useNavigate()
  const prenom      = profile?.prenom ?? 'Camille'
  const today       = MOCK_DAYS.find(d => d.status === 'current')
  const motivation  = MOTIVATIONAL_MESSAGES[new Date().getDay() % MOTIVATIONAL_MESSAGES.length]

  return (
    <div className="shell">
      <Sidebar />
      <div className="shell-main">
        <Topbar
          title={`Bonjour ${prenom} ✦`}
          subtitle={`Jour ${MOCK_CURRENT_DAY} · Semaine ${today?.semaine ?? 1}`}
        />
        <div className="shell-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s6)' }}>

          {/* ── Welcome banner ── */}
          <div style={s.banner}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <p style={s.bannerEye}>Ton programme · Semaine {today?.semaine ?? 1}</p>
              <h2 style={s.bannerTitle}>Bonjour {prenom} ✦</h2>
              <p style={s.bannerMsg}>{motivation}</p>
            </div>
            <div style={s.bannerWeek}>
              <span style={s.bannerWeekLabel}>Sem.</span>
              <span style={s.bannerWeekNum}>{today?.semaine ?? 1}</span>
              <span style={s.bannerWeekLabel}>/ 8</span>
            </div>
          </div>

          {/* ── Today card ── */}
          {today && (
            <Card style={{ borderLeft: '3px solid var(--terracotta)' }}>
              <div style={s.todayRow}>
                <div>
                  <p style={s.todayEye}>Séance d'aujourd'hui — J{today.jour}</p>
                  <h3 style={s.todayTitle}>{today.titre}</h3>
                  <p style={s.todayDuree}>⏱ {today.duree} min</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s2)', alignItems: 'flex-end' }}>
                  <Button onClick={() => navigate(`/jour/${today.jour}`)}>
                    Commencer →
                  </Button>
                  <Button
                    variant="secondary" size="sm"
                    onClick={() => navigate(`/bilan/${today.jour}`)}
                  >
                    Bilan du soir ✦
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* ── 56-day grid ── */}
          <div>
            <h3 style={s.sectionTitle}>Mon programme — 56 jours</h3>
            <div style={s.grid}>
              {MOCK_DAYS.map(day => (
                <DayCell
                  key={day.jour}
                  day={day}
                  onSelect={id => navigate(`/jour/${id}`)}
                />
              ))}
            </div>
          </div>

          {/* Quote */}
          <LysaQuote index={today?.jour ?? 0} />
        </div>
      </div>
    </div>
  )
}

/* ── Day cell ── */
function DayCell({ day, onSelect }) {
  const done    = day.status === 'done'
  const current = day.status === 'current'
  const locked  = day.status === 'locked'

  return (
    <div
      onClick={() => !locked && onSelect(day.jour)}
      title={locked ? `J${day.jour} — verrouillé` : `J${day.jour} — ${day.titre}`}
      style={{
        background: current ? 'var(--terracotta)'
                  : done    ? 'rgba(107,127,94,.12)'
                  :           'rgba(196,181,160,.15)',
        border: `1px solid ${current ? 'var(--terracotta)'
                             : done   ? 'var(--sage)'
                             :          'var(--sand)'}`,
        borderRadius: 'var(--r-md)',
        padding: '10px 8px',
        cursor: locked ? 'default' : 'pointer',
        opacity: locked ? .45 : 1,
        display: 'flex', flexDirection: 'column', gap: 3,
        transition: 'transform var(--ease-fast), box-shadow var(--ease-fast)',
      }}
      onMouseEnter={e => {
        if (!locked) {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = 'var(--sh-sm)'
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = ''
        e.currentTarget.style.boxShadow = ''
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '.06em',
          color: current ? 'rgba(253,250,246,.85)'
               : done    ? 'var(--moss)'
               :           'var(--stone)',
        }}>
          J{day.jour}
        </span>
        <span style={{ fontSize: 11 }}>
          {done ? '✓' : locked ? '🔒' : '→'}
        </span>
      </div>
      <p style={{
        fontSize: 10, lineHeight: 1.3,
        color: current ? 'var(--white)'
             : done    ? 'var(--earth)'
             :           'var(--stone)',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {day.titre}
      </p>
    </div>
  )
}

/* ── Styles ── */
const s = {
  banner: {
    background: 'linear-gradient(135deg, var(--forest) 0%, #2e3c2d 100%)',
    borderRadius: 'var(--r-xl)',
    padding: 'var(--s8)',
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'var(--s4)',
    position: 'relative', overflow: 'hidden',
  },
  bannerEye: {
    fontSize: 'var(--tx-xs)', color: 'var(--sage)',
    letterSpacing: '.1em', textTransform: 'uppercase',
    marginBottom: 'var(--s2)',
  },
  bannerTitle: {
    fontFamily: 'var(--serif)', fontSize: 'var(--tx-4xl)',
    fontWeight: 300, color: 'var(--white)', letterSpacing: '-.01em',
  },
  bannerMsg: {
    fontSize: 'var(--tx-sm)', color: 'rgba(245,240,232,.7)',
    marginTop: 'var(--s2)', maxWidth: 380,
  },
  bannerWeek: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    background: 'rgba(255,255,255,.08)', borderRadius: 'var(--r-md)',
    padding: 'var(--s4) var(--s6)', flexShrink: 0,
  },
  bannerWeekLabel: {
    fontSize: 'var(--tx-xs)', color: 'var(--sage)',
    letterSpacing: '.1em', textTransform: 'uppercase',
  },
  bannerWeekNum: {
    fontFamily: 'var(--serif)', fontSize: 48,
    fontWeight: 300, color: 'var(--white)', lineHeight: 1,
  },
  todayRow: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'var(--s4)', flexWrap: 'wrap',
  },
  todayEye: {
    fontSize: 'var(--tx-xs)', color: 'var(--stone)',
    letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 6,
  },
  todayTitle: {
    fontFamily: 'var(--serif)', fontSize: 'var(--tx-2xl)',
    fontWeight: 400, color: 'var(--earth)',
  },
  todayDuree: { fontSize: 'var(--tx-sm)', color: 'var(--bark)', marginTop: 4 },
  sectionTitle: {
    fontFamily: 'var(--serif)', fontSize: 'var(--tx-xl)',
    fontWeight: 400, color: 'var(--earth)',
    marginBottom: 'var(--s4)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(92px, 1fr))',
    gap: 'var(--s2)',
  },
}
