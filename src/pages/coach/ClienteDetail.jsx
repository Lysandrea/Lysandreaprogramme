import { useState, useEffect }      from 'react'
import { useParams, useNavigate }   from 'react-router-dom'
import {
  IS_MOCK, fetchClienteProfile, fetchJours, fetchBilans, desbloquerSemaine,
} from '../../lib/supabase.js'
import Sidebar from '../../components/Sidebar.jsx'
import Topbar  from '../../components/Topbar.jsx'
import Card    from '../../components/Card.jsx'
import Badge   from '../../components/Badge.jsx'
import Button  from '../../components/Button.jsx'
import { MOCK_CLIENTES, MOCK_DAYS, MOCK_BILANS } from '../../lib/mockData.js'

const BODY_EMOJIS = ['😫', '😕', '😐', '🙂', '💪']

export default function ClienteDetail() {
  const { id }   = useParams()
  const navigate = useNavigate()

  const [cliente,    setCliente]    = useState(null)
  const [jours,      setJours]      = useState([])
  const [bilans,     setBilans]     = useState([])
  const [loading,    setLoading]    = useState(true)
  const [unlocking,  setUnlocking]  = useState(false)
  const [unlocked,   setUnlocked]   = useState(false)

  useEffect(() => {
    if (IS_MOCK) {
      // Mode mock
      const c = MOCK_CLIENTES.find(c => c.id === id)
      setCliente(c ?? null)
      setBilans(MOCK_BILANS)
      setLoading(false)
      return
    }
    // Mode Supabase
    Promise.all([
      fetchClienteProfile(id),
      fetchJours(id),
      fetchBilans(id, 5),
    ])
      .then(([prof, j, b]) => {
        setCliente(prof)
        setJours(j)
        setBilans(b)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  async function handleUnlock() {
    if (!cliente) return
    setUnlocking(true)
    try {
      if (!IS_MOCK) {
        const nextDay = await desbloquerSemaine(id, cliente.current_day ?? 1)
        setCliente(prev => ({ ...prev, current_day: nextDay }))
      }
      setUnlocked(true)
      setTimeout(() => setUnlocked(false), 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setUnlocking(false)
    }
  }

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

  if (!cliente) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 'var(--s4)', background: 'var(--cream)' }}>
        <p style={{ fontFamily: 'var(--serif)', fontSize: 'var(--tx-xl)', color: 'var(--stone)' }}>Cliente introuvable.</p>
        <Button variant="ghost" onClick={() => navigate('/coach')}>← Retour</Button>
      </div>
    )
  }

  const currentDay     = cliente.current_day ?? cliente.jourActuel ?? 1
  const currentSemaine = Math.ceil(currentDay / 7)
  const progress       = Math.round((currentDay / 56) * 100)

  return (
    <div className="shell">
      <Sidebar />
      <div className="shell-main">
        <Topbar
          title={`${cliente.prenom} ${cliente.nom ?? ''}`}
          subtitle={`Jour ${currentDay}/56 · Semaine ${currentSemaine}/8`}
        />
        <div className="shell-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s6)' }}>

          <Button variant="ghost" size="sm" onClick={() => navigate('/coach')} style={{ alignSelf: 'flex-start' }}>
            ← Toutes les clientes
          </Button>

          {/* Header */}
          <Card>
            <div style={s.header}>
              <div style={s.bigAvatar}>{(cliente.prenom?.[0] ?? '?')}{(cliente.nom?.[0] ?? '')}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s3)', marginBottom: 'var(--s2)', flexWrap: 'wrap' }}>
                  <h2 style={s.name}>{cliente.prenom} {cliente.nom}</h2>
                  <Badge variant={cliente.status ?? 'active'} />
                </div>
                <p style={{ fontSize: 'var(--tx-sm)', color: 'var(--stone)', marginBottom: 'var(--s4)' }}>{cliente.email}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s4)', flexWrap: 'wrap' }}>
                  <div style={s.progressWrap}>
                    <div style={{ ...s.progressFill, width: `${progress}%` }} />
                  </div>
                  <span style={{ fontSize: 'var(--tx-sm)', color: 'var(--bark)', whiteSpace: 'nowrap' }}>
                    {progress}% — J{currentDay}/56
                  </span>
                </div>
              </div>
              {/* Bouton débloquer */}
              <Button
                variant={unlocked ? 'sage' : 'secondary'}
                size="sm"
                loading={unlocking}
                onClick={handleUnlock}
                style={{ alignSelf: 'flex-start', flexShrink: 0 }}
              >
                {unlocked ? 'Semaine débloquée ✓' : 'Débloquer la semaine suivante →'}
              </Button>
            </div>
          </Card>

          {/* Stats */}
          <div style={s.statsGrid}>
            {[
              { label: 'Jour actuel',      val: `J${currentDay}` },
              { label: 'Semaine',          val: `${currentSemaine}/8` },
              { label: 'Bilans complétés', val: bilans.length },
              {
                label: 'Rejoint le',
                val: cliente.programme_start_date ?? cliente.joinDate
                  ? new Date(cliente.programme_start_date ?? cliente.joinDate)
                      .toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
                  : '—',
              },
            ].map(({ label, val }) => (
              <div key={label} style={s.statCard}>
                <span style={s.statVal}>{val}</span>
                <span style={s.statLabel}>{label}</span>
              </div>
            ))}
          </div>

          {/* Grille jours (lecture seule) */}
          <Card title="Progression du programme">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 'var(--s3)' }}>
              {MOCK_DAYS.map(day => {
                const jourDone = IS_MOCK
                  ? day.jour < currentDay
                  : jours.some(j => j.jour_num === day.jour && j.seance_faite)
                const isCurrent = day.jour === currentDay
                return (
                  <div key={day.jour} title={`J${day.jour} — ${day.titre}`} style={{
                    width: 30, height: 30, borderRadius: 6,
                    background: isCurrent ? 'var(--terracotta)' : jourDone ? 'var(--sage)' : 'var(--sand)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 9, fontWeight: 600,
                    color: (jourDone || isCurrent) ? 'var(--white)' : 'var(--stone)',
                  }}>
                    {day.jour}
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Bilans récents */}
          <Card title="Bilans récents">
            {bilans.length === 0 ? (
              <p style={{ fontSize: 'var(--tx-sm)', color: 'var(--stone)' }}>Aucun bilan pour l'instant.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s4)' }}>
                {bilans.map(b => <BilanCard key={`${b.jour_num ?? b.jour}`} b={b} />)}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

function BilanCard({ b }) {
  const jourNum = b.jour_num ?? b.jour
  const date    = b.created_at ?? b.date
  const dateStr = date
    ? new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
    : `Jour ${jourNum}`

  return (
    <div style={{ background: 'var(--cream)', border: '1px solid var(--sand)', borderRadius: 'var(--r-md)', padding: 'var(--s5)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--s4)' }}>
        <div>
          <span style={{ fontSize: 'var(--tx-sm)', fontWeight: 600, color: 'var(--earth)' }}>Jour {jourNum}</span>
          <span style={{ fontSize: 'var(--tx-sm)', color: 'var(--stone)' }}> · {dateStr}</span>
        </div>
        {b.corps !== undefined && b.corps !== null && (
          <span style={{ fontSize: 24 }}>{BODY_EMOJIS[b.corps]}</span>
        )}
      </div>
      {[
        { label: 'Gratitude', val: b.gratitude },
        { label: 'Leçon',    val: b.lecon     },
        { label: 'Émotion',  val: b.emotion   },
        { label: 'Lâcher',   val: b.lacher    },
      ].filter(r => r.val).map(({ label, val }) => (
        <div key={label} style={{ display: 'flex', gap: 'var(--s3)', marginBottom: 6 }}>
          <span style={{ fontSize: 'var(--tx-xs)', fontWeight: 600, color: 'var(--stone)', textTransform: 'uppercase', letterSpacing: '.06em', width: 72, flexShrink: 0 }}>
            {label}
          </span>
          <span style={{ fontSize: 'var(--tx-sm)', color: 'var(--earth)', lineHeight: 1.5 }}>{val}</span>
        </div>
      ))}
    </div>
  )
}

const s = {
  header: { display: 'flex', alignItems: 'flex-start', gap: 'var(--s6)', flexWrap: 'wrap' },
  bigAvatar: {
    width: 64, height: 64, borderRadius: '50%',
    background: 'var(--sand)', color: 'var(--earth)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 'var(--tx-xl)', fontWeight: 600, flexShrink: 0,
  },
  name: { fontFamily: 'var(--serif)', fontSize: 'var(--tx-2xl)', fontWeight: 400, color: 'var(--earth)' },
  progressWrap: { flex: 1, maxWidth: 280, height: 6, background: 'var(--sand)', borderRadius: 99, overflow: 'hidden' },
  progressFill: { height: '100%', background: 'var(--forest)', borderRadius: 99, transition: 'width .5s ease' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--s4)' },
  statCard: {
    background: 'var(--white)', border: '1px solid var(--sand)',
    borderRadius: 'var(--r-md)', padding: 'var(--s5)',
    display: 'flex', flexDirection: 'column', gap: 4, boxShadow: 'var(--sh-sm)',
  },
  statVal:   { fontFamily: 'var(--serif)', fontSize: 'var(--tx-2xl)', fontWeight: 400, color: 'var(--earth)' },
  statLabel: { fontSize: 'var(--tx-xs)', color: 'var(--stone)' },
}
