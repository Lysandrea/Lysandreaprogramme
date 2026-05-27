import { useState }        from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar.jsx'
import Topbar  from '../../components/Topbar.jsx'
import Card    from '../../components/Card.jsx'
import Badge   from '../../components/Badge.jsx'
import Button  from '../../components/Button.jsx'
import { MOCK_CLIENTES, MOCK_DAYS, MOCK_BILANS } from '../../lib/mockData.js'

const BODY_EMOJIS = ['😫', '😕', '😐', '🙂', '💪']

export default function ClienteDetail() {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const cliente   = MOCK_CLIENTES.find(c => c.id === id)
  const [unlocked, setUnlocked] = useState(false)

  if (!cliente) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 'var(--s4)', background: 'var(--cream)' }}>
        <p style={{ fontFamily: 'var(--serif)', fontSize: 'var(--tx-xl)', color: 'var(--stone)' }}>Cliente introuvable.</p>
        <Button variant="ghost" onClick={() => navigate('/coach')}>← Retour</Button>
      </div>
    )
  }

  const progress       = Math.round((cliente.jourActuel / 56) * 100)
  const currentSemaine = Math.ceil(cliente.jourActuel / 7)

  function handleUnlock() {
    // In prod: supabase update — unlock next week
    setUnlocked(true)
    setTimeout(() => setUnlocked(false), 3000)
  }

  return (
    <div className="shell">
      <Sidebar />
      <div className="shell-main">
        <Topbar
          title={`${cliente.prenom} ${cliente.nom}`}
          subtitle={`Jour ${cliente.jourActuel}/56 · Semaine ${currentSemaine}/8`}
        />
        <div className="shell-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s6)' }}>

          <Button variant="ghost" size="sm" onClick={() => navigate('/coach')} style={{ alignSelf: 'flex-start' }}>
            ← Toutes les clientes
          </Button>

          {/* ── Header card ── */}
          <Card>
            <div style={s.header}>
              <div style={s.bigAvatar}>
                {cliente.prenom[0]}{cliente.nom[0]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s3)', marginBottom: 'var(--s2)', flexWrap: 'wrap' }}>
                  <h2 style={s.name}>{cliente.prenom} {cliente.nom}</h2>
                  <Badge variant={cliente.status} />
                </div>
                <p style={{ fontSize: 'var(--tx-sm)', color: 'var(--stone)', marginBottom: 'var(--s4)' }}>{cliente.email}</p>

                {/* Progress bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s4)', flexWrap: 'wrap' }}>
                  <div style={s.progressWrap}>
                    <div style={{ ...s.progressFill, width: `${progress}%` }} />
                  </div>
                  <span style={{ fontSize: 'var(--tx-sm)', color: 'var(--bark)', whiteSpace: 'nowrap' }}>
                    {progress}% — J{cliente.jourActuel}/56
                  </span>
                </div>
              </div>

              {/* Unlock button */}
              <Button
                variant={unlocked ? 'sage' : 'secondary'}
                size="sm"
                onClick={handleUnlock}
                style={{ alignSelf: 'flex-start', flexShrink: 0 }}
              >
                {unlocked ? 'Semaine débloquée ✓' : 'Débloquer la semaine suivante →'}
              </Button>
            </div>
          </Card>

          {/* ── Stats ── */}
          <div style={s.statsGrid}>
            {[
              { label: 'Jour actuel',         val: `J${cliente.jourActuel}` },
              { label: 'Semaine',             val: `${currentSemaine}/8` },
              { label: 'Bilans complétés',    val: MOCK_BILANS.filter(b => b.jour < cliente.jourActuel).length },
              { label: 'Rejoint le',
                val: new Date(cliente.joinDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) },
            ].map(({ label, val }) => (
              <div key={label} style={s.statCard}>
                <span style={s.statVal}>{val}</span>
                <span style={s.statLabel}>{label}</span>
              </div>
            ))}
          </div>

          {/* ── Day grid (read-only) ── */}
          <Card title="Progression du programme">
            <div style={s.dayGrid}>
              {MOCK_DAYS.map(day => {
                const done    = day.jour < cliente.jourActuel
                const current = day.jour === cliente.jourActuel
                return (
                  <div key={day.jour} title={`J${day.jour} — ${day.titre}`} style={{
                    width: 30, height: 30, borderRadius: 6,
                    background: current ? 'var(--terracotta)'
                               : done   ? 'var(--sage)'
                               :          'var(--sand)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 9, fontWeight: 600,
                    color: (done || current) ? 'var(--white)' : 'var(--stone)',
                  }}>
                    {day.jour}
                  </div>
                )
              })}
            </div>
          </Card>

          {/* ── Recent bilans ── */}
          <Card title="Bilans récents">
            {MOCK_BILANS.length === 0 ? (
              <p style={{ fontSize: 'var(--tx-sm)', color: 'var(--stone)' }}>Aucun bilan pour le moment.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s4)' }}>
                {MOCK_BILANS.map(b => (
                  <BilanCard key={b.jour} b={b} />
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

/* ── Bilan card ── */
function BilanCard({ b }) {
  const date = new Date(b.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
  return (
    <div style={s.bilanCard}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--s4)' }}>
        <div>
          <span style={s.bilanJour}>Jour {b.jour}</span>
          <span style={s.bilanDate}> · {date}</span>
        </div>
        <span style={{ fontSize: 24 }}>{BODY_EMOJIS[b.bodyFeeling]}</span>
      </div>
      {[
        { label: 'Gratitude',  val: b.gratitude },
        { label: 'Leçon',     val: b.lecon },
        { label: 'Émotion',   val: b.emotion },
        { label: 'Lâcher',    val: b.lacher },
      ].map(({ label, val }) => (
        <div key={label} style={s.bilanRow}>
          <span style={s.bilanKey}>{label}</span>
          <span style={s.bilanVal}>{val}</span>
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
  progressWrap: {
    flex: 1, maxWidth: 280, height: 6,
    background: 'var(--sand)', borderRadius: 99, overflow: 'hidden',
  },
  progressFill: { height: '100%', background: 'var(--forest)', borderRadius: 99, transition: 'width .5s ease' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--s4)' },
  statCard: {
    background: 'var(--white)', border: '1px solid var(--sand)',
    borderRadius: 'var(--r-md)', padding: 'var(--s5)',
    display: 'flex', flexDirection: 'column', gap: 4, boxShadow: 'var(--sh-sm)',
  },
  statVal: { fontFamily: 'var(--serif)', fontSize: 'var(--tx-2xl)', fontWeight: 400, color: 'var(--earth)' },
  statLabel: { fontSize: 'var(--tx-xs)', color: 'var(--stone)' },
  dayGrid: { display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 'var(--s3)' },
  bilanCard: {
    background: 'var(--cream)', border: '1px solid var(--sand)',
    borderRadius: 'var(--r-md)', padding: 'var(--s5)',
  },
  bilanJour: { fontSize: 'var(--tx-sm)', fontWeight: 600, color: 'var(--earth)' },
  bilanDate: { fontSize: 'var(--tx-sm)', color: 'var(--stone)' },
  bilanRow: { display: 'flex', gap: 'var(--s3)', marginBottom: 6 },
  bilanKey: { fontSize: 'var(--tx-xs)', fontWeight: 600, color: 'var(--stone)', textTransform: 'uppercase', letterSpacing: '.06em', width: 70, flexShrink: 0 },
  bilanVal: { fontSize: 'var(--tx-sm)', color: 'var(--earth)', lineHeight: 1.5 },
}
