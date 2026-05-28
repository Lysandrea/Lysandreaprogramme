import { useEffect, useState } from 'react'
import { useNavigate }         from 'react-router-dom'
import { useAuth }             from '../../contexts/AuthContext.jsx'
import { IS_MOCK, fetchJours, fetchOnboardingProgress } from '../../lib/supabase.js'
import Sidebar   from '../../components/Sidebar.jsx'
import Topbar    from '../../components/Topbar.jsx'
import Card      from '../../components/Card.jsx'
import Button    from '../../components/Button.jsx'
import LysaQuote from '../../components/LysaQuote.jsx'
import {
  MOCK_DAYS, MOCK_CURRENT_DAY, MOTIVATIONAL_MESSAGES,
} from '../../lib/mockData.js'

/* Construit la liste des 56 jours à partir du current_day et des jours faits */
function buildDays(currentDay, joursData) {
  const SEANCE_TITLES   = ['Mobilité & respiration','Force — membres inférieurs','Cardio doux + gainage','Force — membres supérieurs','Récupération active','Circuit complet','Repos actif']
  const SEANCE_DURATIONS = [35, 45, 40, 50, 30, 55, 20]

  return Array.from({ length: 56 }, (_, i) => {
    const jour       = i + 1
    const jourData   = joursData.find(j => j.jour_num === jour)
    const faite      = jourData?.seance_faite ?? false
    const isCurrent  = jour === currentDay
    const isDone     = faite || jour < currentDay
    const isLocked   = jour > currentDay

    return {
      jour,
      semaine:   Math.ceil(jour / 7),
      titre:     SEANCE_TITLES[(jour - 1) % 7],
      duree:     SEANCE_DURATIONS[(jour - 1) % 7],
      status:    isDone ? 'done' : isCurrent ? 'current' : 'locked',
      bilanFait: faite,
    }
  })
}

export default function ClienteDashboard() {
  const { user, profile } = useAuth()
  const navigate          = useNavigate()
  const prenom            = profile?.prenom ?? 'toi'
  const motivation        = MOTIVATIONAL_MESSAGES[new Date().getDay() % MOTIVATIONAL_MESSAGES.length]

  /* ── State ── */
  const [days,       setDays]       = useState(MOCK_DAYS)
  const [currentDay, setCurrentDay] = useState(MOCK_CURRENT_DAY)
  // Toujours démarrer en loading — on attend la vérification onboarding avant d'afficher
  const [loading,    setLoading]    = useState(true)

  /* ── Vérification onboarding + fetch jours ── */
  useEffect(() => {
    if (!user) return

    // Toujours interroger Supabase pour l'onboarding — IS_MOCK ne court-circuite pas ce check.
    // Si Supabase est inaccessible (pas de .env.local) la catch redirige vers /onboarding.
    fetchOnboardingProgress(user.id)
      .then(prog => {
        console.log('[Dashboard] user.id :', user.id)
        console.log('[Dashboard] onboarding_progress reçu :', prog)
        console.log('[Dashboard] prog?.completed :', prog?.completed)
        if (!prog?.completed) {
          console.log('[Dashboard] → redirect /onboarding (completed = false ou null)')
          navigate('/onboarding')
          return null
        }
        console.log('[Dashboard] → onboarding OK, chargement des jours')
        // Jours : Supabase si dispo, sinon données mock suffisent
        if (IS_MOCK) { setLoading(false); return null }
        return fetchJours(user.id)
      })
      .then(joursData => {
        if (joursData == null) return
        const cd = profile?.current_day ?? 1
        setCurrentDay(cd)
        setDays(buildDays(cd, joursData))
        setLoading(false)
      })
      .catch(err => {
        console.error('[Dashboard] erreur fetchOnboardingProgress :', err)
        navigate('/onboarding')
      })
  }, [user, profile]) // eslint-disable-line

  const today = days.find(d => d.status === 'current')

  if (loading) {
    return (
      <div className="shell">
        <Sidebar />
        <div className="shell-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: 'var(--serif)', fontSize: 'var(--tx-xl)', color: 'var(--stone)' }}>Chargement…</span>
        </div>
      </div>
    )
  }

  return (
    <div className="shell">
      <Sidebar />
      <div className="shell-main">
        <Topbar
          title={`Bonjour ${prenom} ✦`}
          subtitle={`Jour ${currentDay} · Semaine ${today?.semaine ?? 1}`}
        />
        <div className="shell-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s6)' }}>

          {/* ── Bandeau de bienvenue ── */}
          <div style={s.banner}>
            <div>
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

          {/* ── Carte aujourd'hui ── */}
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
                  <Button variant="secondary" size="sm" onClick={() => navigate(`/bilan/${today.jour}`)}>
                    Bilan du soir ✦
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* ── Grille 56 jours ── */}
          <div>
            <h3 style={s.sectionTitle}>Mon programme — 56 jours</h3>
            <div style={s.grid}>
              {days.map(day => (
                <DayCell key={day.jour} day={day} onSelect={id => navigate(`/jour/${id}`)} />
              ))}
            </div>
          </div>

          <LysaQuote index={currentDay} />
        </div>
      </div>
    </div>
  )
}

/* ── Cellule jour ── */
function DayCell({ day, onSelect }) {
  const done    = day.status === 'done'
  const current = day.status === 'current'
  const locked  = day.status === 'locked'

  return (
    <div
      onClick={() => !locked && onSelect(day.jour)}
      title={locked ? `J${day.jour} — verrouillé` : `J${day.jour} — ${day.titre}`}
      style={{
        background: current ? 'var(--terracotta)' : done ? 'rgba(107,127,94,.12)' : 'rgba(196,181,160,.15)',
        border: `1px solid ${current ? 'var(--terracotta)' : done ? 'var(--sage)' : 'var(--sand)'}`,
        borderRadius: 'var(--r-md)', padding: '10px 8px',
        cursor: locked ? 'default' : 'pointer', opacity: locked ? .45 : 1,
        display: 'flex', flexDirection: 'column', gap: 3,
        transition: 'transform var(--ease-fast)',
      }}
      onMouseEnter={e => { if (!locked) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--sh-sm)' } }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.06em', color: current ? 'rgba(253,250,246,.85)' : done ? 'var(--moss)' : 'var(--stone)' }}>
          J{day.jour}
        </span>
        <span style={{ fontSize: 11 }}>{done ? '✓' : locked ? '🔒' : '→'}</span>
      </div>
      <p style={{ fontSize: 10, lineHeight: 1.3, color: current ? 'var(--white)' : done ? 'var(--earth)' : 'var(--stone)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {day.titre}
      </p>
    </div>
  )
}

const s = {
  banner: {
    background: 'linear-gradient(135deg, var(--forest) 0%, #2e3c2d 100%)',
    borderRadius: 'var(--r-xl)', padding: 'var(--s8)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--s4)',
  },
  bannerEye: { fontSize: 'var(--tx-xs)', color: 'var(--sage)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 'var(--s2)' },
  bannerTitle: { fontFamily: 'var(--serif)', fontSize: 'var(--tx-4xl)', fontWeight: 300, color: 'var(--white)' },
  bannerMsg: { fontSize: 'var(--tx-sm)', color: 'rgba(245,240,232,.7)', marginTop: 'var(--s2)', maxWidth: 380 },
  bannerWeek: { display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(255,255,255,.08)', borderRadius: 'var(--r-md)', padding: 'var(--s4) var(--s6)', flexShrink: 0 },
  bannerWeekLabel: { fontSize: 'var(--tx-xs)', color: 'var(--sage)', letterSpacing: '.1em', textTransform: 'uppercase' },
  bannerWeekNum: { fontFamily: 'var(--serif)', fontSize: 48, fontWeight: 300, color: 'var(--white)', lineHeight: 1 },
  todayRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--s4)', flexWrap: 'wrap' },
  todayEye: { fontSize: 'var(--tx-xs)', color: 'var(--stone)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 6 },
  todayTitle: { fontFamily: 'var(--serif)', fontSize: 'var(--tx-2xl)', fontWeight: 400, color: 'var(--earth)' },
  todayDuree: { fontSize: 'var(--tx-sm)', color: 'var(--bark)', marginTop: 4 },
  sectionTitle: { fontFamily: 'var(--serif)', fontSize: 'var(--tx-xl)', fontWeight: 400, color: 'var(--earth)', marginBottom: 'var(--s4)' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(92px, 1fr))', gap: 'var(--s2)' },
}
