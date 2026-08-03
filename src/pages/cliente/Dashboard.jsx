import { useEffect, useState } from 'react'
import { useNavigate }         from 'react-router-dom'
import { useAuth }             from '../../contexts/AuthContext.jsx'
import { IS_MOCK, fetchBilansJourNums, fetchOnboardingProgress, fetchAiProgramme } from '../../lib/supabase.js'
import Sidebar   from '../../components/Sidebar.jsx'
import Topbar    from '../../components/Topbar.jsx'
import Card      from '../../components/Card.jsx'
import Button    from '../../components/Button.jsx'
import LysaQuote from '../../components/LysaQuote.jsx'
const WEEKLY_MESSAGES = {
  1: "Tu commences. C'est déjà beaucoup.",
  2: "La routine s'installe, doucement.",
  3: "C'est normal si certains jours sont plus durs.",
  4: "Tu es à mi-chemin. Regarde ce que tu as déjà fait.",
  5: "La suite demande un peu plus de toi. Tu es prête.",
  6: "Ce qui semblait difficile devient plus familier.",
  7: "Bientôt la fin. Ne lâche rien.",
  8: "Tu y es presque. Regarde le chemin parcouru.",
}

const MIN_BILANS_TO_UNLOCK = 5

function buildDayDataFromProgramme(programme) {
  const map = {}
  for (const sem of programme) {
    const semNum   = Number(sem.semaine)
    const joursSem = sem.jours ?? []
    for (const jour of joursSem) {
      const jourNum     = Number(jour.jour)
      const titre       = jour.nom ?? jour.name ?? ''
      if (!jourNum || isNaN(jourNum) || jourNum < 1 || jourNum > 7) continue
      if (!titre) continue
      const absoluteDay = (semNum - 1) * 7 + jourNum
      if (absoluteDay < 1 || absoluteDay > 56) continue
      map[absoluteDay] = { titre, duree: Number(jour.duree) || 0 }
    }
  }
  return map
}

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

function buildDays(bilansJourNums = [], aiDayData = {}) {
  const unlocked = computeUnlockedWeeks(bilansJourNums)
  return Array.from({ length: 56 }, (_, i) => {
    const jour    = i + 1
    const semaine = Math.ceil(jour / 7)
    const done    = bilansJourNums.includes(jour)
    const ai      = aiDayData[jour]
    const isUnlocked = unlocked.has(semaine)
    return {
      jour,
      semaine,
      titre:  ai?.titre ?? (isUnlocked ? 'Repos actif' : ''),
      duree:  ai?.duree ?? 0,
      isRest: !ai && isUnlocked,
      status: done ? 'done' : isUnlocked ? 'available' : 'locked',
    }
  })
}

export default function ClienteDashboard() {
  const { user, profile } = useAuth()
  const navigate          = useNavigate()
  const prenom            = profile?.prenom ?? 'toi'
  const currentDay        = profile?.current_day ?? 1
  const currentWeekCalc   = Math.min(Math.ceil(currentDay / 7), 8)

  const [loading,        setLoading]        = useState(true)
  const [programmePublie, setProgrammePublie] = useState(null)
  const [days,           setDays]           = useState([])

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
        if (aiProg?.statut === 'publie') {
          setProgrammePublie(aiProg)
          const aiDayData = buildDayDataFromProgramme(aiProg.programme ?? [])
          setDays(buildDays(bilansJourNums, aiDayData))
        }
        setLoading(false)
      })
      .catch(err => {
        console.error('[Dashboard] erreur :', err)
        navigate('/onboarding')
      })
  }, [user]) // eslint-disable-line

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

  if (!programmePublie) {
    return <WaitingState prenom={prenom} />
  }

  const currentWeek    = Math.max(...days.filter(d => d.status !== 'locked').map(d => d.semaine))
  const bilansThisWeek = days.filter(d => d.semaine === currentWeek && d.status === 'done').length
  const nextAvailable  = days.find(d => d.status === 'available' && !d.isRest)

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
              <p style={s.bannerMsg}>{WEEKLY_MESSAGES[currentWeekCalc]}</p>
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
                <DayCell
                  key={day.jour}
                  day={day}
                  isCurrent={day.jour === nextAvailable?.jour}
                  onSelect={id => navigate(`/jour/${id}`)}
                />
              ))}
            </div>
          </div>

          <LysaQuote index={nextAvailable?.jour ?? 1} />
        </div>
      </div>
    </div>
  )
}

function WaitingState({ prenom }) {
  const navigate = useNavigate()
  return (
    <div className="shell">
      <Sidebar />
      <div className="shell-main">
        <Topbar title={`Bonjour ${prenom} ✦`} subtitle="Ton espace" />
        <div className="shell-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s6)' }}>

          {/* ── Carte d'attente ── */}
          <div style={s.waitBanner}>
            <h2 style={s.waitTitle}>Ton programme arrive. 🌿</h2>
            <p style={s.waitText}>
              Lysa prépare ton programme personnalisé.{' '}
              Tu seras notifiée dès qu'il est disponible —{' '}
              en général dans les 48h.
            </p>
          </div>

          {/* ── Deux cartes verrouillées ── */}
          <div style={s.inviteGrid}>
            <Card style={s.inviteCard}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <p style={{ ...s.inviteIcon, margin: 0 }}>🎙️</p>
                <span style={s.lockedBadge}>Bientôt disponible</span>
              </div>
              <h3 style={s.inviteCardTitle}>Mes podcasts</h3>
              <p style={s.inviteCardText}>
                Les épisodes seront débloqués avec ton programme personnalisé.
              </p>
              <div style={s.lockedBtn}>Débloqué avec ton programme 🔒</div>
            </Card>
            <Card style={s.inviteCard}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <p style={{ ...s.inviteIcon, margin: 0 }}>🍲</p>
                <span style={s.lockedBadge}>Bientôt disponible</span>
              </div>
              <h3 style={s.inviteCardTitle}>Mes recettes</h3>
              <p style={s.inviteCardText}>
                Les recettes seront débloquées avec ton programme personnalisé.
              </p>
              <div style={s.lockedBtn}>Débloqué avec ton programme 🔒</div>
            </Card>
          </div>

          <LysaQuote quote="Le programme commence avant même la première séance. Il commence maintenant, dans ce choix que tu as fait." />
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
function DayCell({ day, isCurrent, onSelect }) {
  const done    = day.status === 'done'
  const locked  = day.status === 'locked'
  const isRest  = day.isRest
  const clickable = !locked && !isRest

  /* ── Visual state ── */
  let bg, border, opacity, numColor, titleColor, icon
  if (isCurrent) {
    bg = 'var(--terracotta)'; border = '1px solid var(--terracotta)'; opacity = 1
    numColor = 'rgba(255,255,255,.85)'; titleColor = 'var(--white)'; icon = '→'
  } else if (done) {
    bg = 'rgba(107,127,94,.13)'; border = '1px solid var(--sage)'; opacity = 1
    numColor = 'var(--moss)'; titleColor = 'var(--earth)'; icon = '✓'
  } else if (isRest) {
    /* Repos actif — full opacity, clearly neutral, NOT locked */
    bg = 'var(--cream)'; border = '1px solid var(--sand)'; opacity = 1
    numColor = 'var(--stone)'; titleColor = 'var(--stone)'; icon = '—'
  } else if (locked) {
    /* Future locked week — clearly faded */
    bg = 'rgba(196,181,160,.10)'; border = '1px solid var(--sand)'; opacity = 0.4
    numColor = 'var(--stone)'; titleColor = 'var(--stone)'; icon = '🔒'
  } else {
    /* Available session (not current) */
    bg = 'rgba(192,120,96,.06)'; border = '1px solid rgba(192,120,96,.35)'; opacity = 1
    numColor = 'var(--terracotta)'; titleColor = 'var(--bark)'; icon = '→'
  }

  return (
    <div
      onClick={() => clickable && onSelect(day.jour)}
      title={locked ? `J${day.jour} — semaine verrouillée` : `J${day.jour} — ${day.titre}`}
      style={{
        background: bg, border, borderRadius: 'var(--r-md)',
        padding: '10px 8px', opacity, cursor: clickable ? 'pointer' : 'default',
        display: 'flex', flexDirection: 'column', gap: 3,
        transition: 'transform var(--ease-fast)',
      }}
      onMouseEnter={e => { if (clickable) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--sh-sm)' } }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.06em', color: numColor }}>
          J{day.jour}
        </span>
        <span style={{ fontSize: isCurrent ? 12 : 11, color: isCurrent ? 'var(--white)' : undefined }}>
          {icon}
        </span>
      </div>
      <p style={{
        fontSize: 10, lineHeight: 1.3, color: titleColor,
        overflow: 'hidden',
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
      }}>
        {isCurrent ? day.titre : isRest ? 'Repos' : day.titre}
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
  grid:            { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 'var(--s2)' },
  waitBanner:      {
    background: 'var(--forest)',
    borderRadius: 'var(--r-xl)', padding: 'var(--s8)',
    width: '100%', boxSizing: 'border-box',
  },
  waitTitle:       { fontFamily: 'var(--serif)', fontSize: 'var(--tx-3xl)', fontWeight: 300, color: 'var(--white)', marginBottom: 'var(--s3)' },
  waitText:        { fontSize: 'var(--tx-sm)', color: 'rgba(245,240,232,.8)', lineHeight: 1.65, maxWidth: 520 },
  inviteGrid:      { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s4)' },
  inviteCard:      { display: 'flex', flexDirection: 'column', gap: 'var(--s3)' },
  inviteIcon:      { fontSize: '2rem', margin: 0 },
  inviteCardTitle: { fontFamily: 'var(--serif)', fontSize: 'var(--tx-xl)', fontWeight: 400, color: 'var(--earth)', margin: 0 },
  inviteCardText:  { fontSize: 'var(--tx-sm)', color: 'var(--stone)', lineHeight: 1.55, margin: 0 },
  lockedBadge:     { fontSize: 10, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--stone)', background: 'var(--sand)', borderRadius: 4, padding: '2px 7px' },
  lockedBtn:       { display: 'inline-block', padding: '10px 18px', borderRadius: 'var(--r-sm)', border: '1.5px solid var(--sand)', color: 'var(--stone)', fontSize: 'var(--tx-sm)', fontWeight: 500, background: 'transparent', cursor: 'not-allowed', opacity: 0.6, userSelect: 'none' },
}
