import { useEffect, useState } from 'react'
import { useNavigate }         from 'react-router-dom'
import { useAuth }             from '../../contexts/AuthContext.jsx'
import { IS_MOCK, fetchBilansJourNums, fetchOnboardingProgress, fetchAiProgramme } from '../../lib/supabase.js'
import Sidebar   from '../../components/Sidebar.jsx'
import Topbar    from '../../components/Topbar.jsx'
import Card      from '../../components/Card.jsx'
import Button    from '../../components/Button.jsx'
import LysaQuote from '../../components/LysaQuote.jsx'
import { MOCK_BILANS_JOUR_NUMS, MOTIVATIONAL_MESSAGES } from '../../lib/mockData.js'

const SEANCE_TITLES_DEFAULT    = ['Mobilité & respiration','Force — membres inférieurs','Cardio doux + gainage','Force — membres supérieurs','Récupération active','Circuit complet','Repos actif']
const SEANCE_DURATIONS_DEFAULT = [35, 45, 40, 50, 30, 55, 20]
const MIN_BILANS_TO_UNLOCK = 5

function buildDayDataFromProgramme(programme) {
  const map = {}
  for (const sem of programme) {
    for (const jour of sem.jours ?? []) {
      map[jour.jour] = { titre: jour.nom, duree: jour.duree }
    }
  }
  return map
}

/* Retourne un Set des numéros de semaine déverrouillées */
function computeUnlockedWeeks(bilansJourNums) {
  const weeks = new Set([1])
  for (let w = 2; w <= 8; w++) {
    const from  = (w - 2) * 7 + 1
    const to    = (w - 1) * 7
    const count = bilansJourNums.filter(n => n >= from && n <= to).length
    if (count >= MIN_BILANS_TO_UNLOCK) weeks.add(w)
  }
  return weeks
}

/* Construit les 56 jours avec status : 'done' | 'available' | 'locked' */
function buildDays(bilansJourNums = [], aiDayData = {}) {
  const unlocked = computeUnlockedWeeks(bilansJourNums)
  return Array.from({ length: 56 }, (_, i) => {
    const jour    = i + 1
    const semaine = Math.ceil(jour / 7)
    const done    = bilansJourNums.includes(jour)
    const ai      = aiDayData[jour]
    return {
      jour,
      semaine,
      titre:  ai?.titre ?? SEANCE_TITLES_DEFAULT[(jour - 1) % 7],
      duree:  ai?.duree ?? SEANCE_DURATIONS_DEFAULT[(jour - 1) % 7],
      status: done ? 'done' : unlocked.has(semaine) ? 'available' : 'locked',
    }
  })
}

export default function ClienteDashboard() {
  const { user, profile } = useAuth()
  const navigate          = useNavigate()
  const prenom            = profile?.prenom ?? 'toi'
  const motivation        = MOTIVATIONAL_MESSAGES[new Date().getDay() % MOTIVATIONAL_MESSAGES.length]

  const [days,    setDays]    = useState(() => buildDays(IS_MOCK ? MOCK_BILANS_JOUR_NUMS : []))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    fetchOnboardingProgress(user.id)
      .then(prog => {
        if (!prog?.completed) { navigate('/onboarding'); return null }
        if (IS_MOCK) { setLoading(false); return null }
        return Promise.all([fetchBilansJourNums(user.id), fetchAiProgramme(user.id)])
      })
      .then(result => {
        if (result == null) return
        const [bilansJourNums, aiProg] = result
        const aiDayData = aiProg?.statut === 'publie'
          ? buildDayDataFromProgramme(aiProg.programme ?? [])
          : {}
        setDays(buildDays(bilansJourNums, aiDayData))
        setLoading(false)
      })
      .catch(err => {
        console.error('[Dashboard] erreur :', err)
        navigate('/onboarding')
      })
  }, [user]) // eslint-disable-line

  /* Semaine courante = semaine la plus haute déverrouillée */
  const currentWeek      = Math.max(...days.filter(d => d.status !== 'locked').map(d => d.semaine))
  const bilansThisWeek   = days.filter(d => d.semaine === currentWeek && d.status === 'done').length
  const nextAvailable    = days.find(d => d.status === 'available')

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
          subtitle={`Semaine ${currentWeek} / 8 · ${bilansThisWeek}/7 bilans`}
        />
        <div className="shell-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s6)' }}>

          {/* ── Bandeau de bienvenue ── */}
          <div style={s.banner}>
            <div>
              <p style={s.bannerEye}>Ton programme · Semaine {currentWeek}</p>
              <h2 style={s.bannerTitle}>Bonjour {prenom} ✦</h2>
              <p style={s.bannerMsg}>{motivation}</p>
            </div>
            <div style={s.bannerWeek}>
              <span style={s.bannerWeekLabel}>Sem.</span>
              <span style={s.bannerWeekNum}>{currentWeek}</span>
              <span style={s.bannerWeekLabel}>/ 8</span>
            </div>
          </div>

          {/* ── Prochaine séance ── */}
          {nextAvailable && (
            <Card style={{ borderLeft: '3px solid var(--terracotta)' }}>
              <div style={s.todayRow}>
                <div>
                  <p style={s.todayEye}>Prochaine séance — J{nextAvailable.jour}</p>
                  <h3 style={s.todayTitle}>{nextAvailable.titre}</h3>
                  <p style={s.todayDuree}>⏱ {nextAvailable.duree} min</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s2)', alignItems: 'flex-end' }}>
                  <Button onClick={() => navigate(`/jour/${nextAvailable.jour}`)}>
                    Commencer →
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => navigate(`/bilan/${nextAvailable.jour}`)}>
                    Bilan du soir ✦
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* ── Grille 56 jours ── */}
          <div>
            <h3 style={s.sectionTitle}>Mon programme — 56 jours</h3>
            <WeekUnlockInfo days={days} currentWeek={currentWeek} />
            <div className="days-grid" style={s.grid}>
              {days.map(day => (
                <DayCell key={day.jour} day={day} onSelect={id => navigate(`/jour/${id}`)} />
              ))}
            </div>
          </div>

          <LysaQuote index={nextAvailable?.jour ?? 1} />
        </div>
      </div>
    </div>
  )
}

/* Bandeau d'info sur le déverrouillage de la semaine suivante */
function WeekUnlockInfo({ days, currentWeek }) {
  if (currentWeek >= 8) return null

  const bilansThisWeek = days.filter(d => d.semaine === currentWeek && d.status === 'done').length
  const remaining      = MIN_BILANS_TO_UNLOCK - bilansThisWeek
  if (remaining <= 0) return null

  return (
    <p style={{ fontSize: 'var(--tx-xs)', color: 'var(--stone)', marginBottom: 'var(--s3)' }}>
      {remaining === 1
        ? `Encore 1 bilan cette semaine pour débloquer la semaine ${currentWeek + 1}`
        : `Encore ${remaining} bilans cette semaine pour débloquer la semaine ${currentWeek + 1}`}
    </p>
  )
}

/* ── Cellule jour ── */
function DayCell({ day, onSelect }) {
  const done      = day.status === 'done'
  const available = day.status === 'available'
  const locked    = day.status === 'locked'

  return (
    <div
      onClick={() => !locked && onSelect(day.jour)}
      title={locked ? `J${day.jour} — semaine verrouillée` : `J${day.jour} — ${day.titre}`}
      style={{
        background: done      ? 'rgba(107,127,94,.12)'
                  : available ? 'rgba(192,120,96,.06)'
                  : 'rgba(196,181,160,.15)',
        border: `1px solid ${done ? 'var(--sage)' : available ? 'rgba(192,120,96,.4)' : 'var(--sand)'}`,
        borderRadius: 'var(--r-md)', padding: '10px 8px',
        cursor: locked ? 'default' : 'pointer', opacity: locked ? .4 : 1,
        display: 'flex', flexDirection: 'column', gap: 3,
        transition: 'transform var(--ease-fast)',
      }}
      onMouseEnter={e => { if (!locked) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--sh-sm)' } }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.06em', color: done ? 'var(--moss)' : available ? 'var(--terracotta)' : 'var(--stone)' }}>
          J{day.jour}
        </span>
        <span style={{ fontSize: 11 }}>{done ? '✓' : locked ? '🔒' : '→'}</span>
      </div>
      <p style={{ fontSize: 10, lineHeight: 1.3, color: done ? 'var(--earth)' : available ? 'var(--bark)' : 'var(--stone)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
  bannerEye:       { fontSize: 'var(--tx-xs)', color: 'var(--sage)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 'var(--s2)' },
  bannerTitle:     { fontFamily: 'var(--serif)', fontSize: 'var(--tx-4xl)', fontWeight: 300, color: 'var(--white)' },
  bannerMsg:       { fontSize: 'var(--tx-sm)', color: 'rgba(245,240,232,.7)', marginTop: 'var(--s2)', maxWidth: 380 },
  bannerWeek:      { display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(255,255,255,.08)', borderRadius: 'var(--r-md)', padding: 'var(--s4) var(--s6)', flexShrink: 0 },
  bannerWeekLabel: { fontSize: 'var(--tx-xs)', color: 'var(--sage)', letterSpacing: '.1em', textTransform: 'uppercase' },
  bannerWeekNum:   { fontFamily: 'var(--serif)', fontSize: 'clamp(28px, 8vw, 48px)', fontWeight: 300, color: 'var(--white)', lineHeight: 1 },
  todayRow:        { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--s4)', flexWrap: 'wrap' },
  todayEye:        { fontSize: 'var(--tx-xs)', color: 'var(--stone)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 6 },
  todayTitle:      { fontFamily: 'var(--serif)', fontSize: 'var(--tx-2xl)', fontWeight: 400, color: 'var(--earth)' },
  todayDuree:      { fontSize: 'var(--tx-sm)', color: 'var(--bark)', marginTop: 4 },
  sectionTitle:    { fontFamily: 'var(--serif)', fontSize: 'var(--tx-xl)', fontWeight: 400, color: 'var(--earth)', marginBottom: 'var(--s3)' },
  grid:            { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(92px, 1fr))', gap: 'var(--s2)' },
}
