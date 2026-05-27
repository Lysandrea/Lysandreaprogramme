import { useParams, useNavigate } from 'react-router-dom'
import Sidebar   from '../../components/Sidebar.jsx'
import Topbar    from '../../components/Topbar.jsx'
import Card      from '../../components/Card.jsx'
import Button    from '../../components/Button.jsx'
import LysaQuote from '../../components/LysaQuote.jsx'
import { MOCK_DAYS } from '../../lib/mockData.js'

export default function JourDetail() {
  const { jour }  = useParams()
  const navigate  = useNavigate()
  const day       = MOCK_DAYS.find(d => d.jour === Number(jour))

  if (!day) {
    return (
      <div style={s.notFound}>
        <p>Jour introuvable.</p>
        <Button variant="ghost" onClick={() => navigate('/dashboard')}>← Retour</Button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Topbar
          title={`Jour ${day.jour} — ${day.titre}`}
          subtitle={`Semaine ${day.semaine} · ${day.duree} min`}
        />
        <main style={s.content}>
          {/* Header */}
          <div style={s.header}>
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>← Retour</Button>
          </div>

          {/* Séance card */}
          <Card title={day.titre} subtitle={`${day.duree} minutes — Semaine ${day.semaine}`}>
            <div style={s.exerciceList}>
              {MOCK_EXERCICES.map((ex, i) => (
                <div key={i} style={s.exercice}>
                  <div style={s.exerciceNum}>{i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <p style={s.exerciceName}>{ex.nom}</p>
                    <p style={s.exerciceDetail}>{ex.detail}</p>
                  </div>
                  <span style={s.exerciceDuree}>{ex.duree}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Quote */}
          <LysaQuote index={day.jour} />

          {/* CTA bilan */}
          <Card style={s.bilanCard}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-xl)', fontWeight: 400, color: 'var(--earth)' }}>
                  Bilan du soir
                </h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--bark)', marginTop: 4 }}>
                  Comment s'est passée ta journée ? Quelques minutes pour noter.
                </p>
              </div>
              <Button
                variant={day.bilanFait ? 'sage' : 'primary'}
                onClick={() => navigate(`/bilan/${day.jour}`)}
              >
                {day.bilanFait ? 'Voir mon bilan ✓' : 'Remplir le bilan →'}
              </Button>
            </div>
          </Card>
        </main>
      </div>
    </div>
  )
}

const MOCK_EXERCICES = [
  { nom: 'Échauffement articulaire', detail: 'Cercles épaules, hanches, chevilles', duree: '5 min' },
  { nom: 'Squat bodyweight', detail: '3 séries × 15 reps — Tempo 3-1-2', duree: '8 min' },
  { nom: 'Fentes alternées', detail: '3 séries × 12 reps/jambe', duree: '8 min' },
  { nom: 'Pont fessier', detail: '3 séries × 20 reps — maintien 2s en haut', duree: '7 min' },
  { nom: 'Gainage avant', detail: '3 × 40s — respiration profonde', duree: '5 min' },
  { nom: 'Étirements & respiration', detail: 'Respiration 4-7-8, relâchement complet', duree: '7 min' },
]

const s = {
  content: {
    flex: 1,
    overflowY: 'auto',
    padding: 'var(--space-8)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-6)',
    maxWidth: 700,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
  },
  exerciceList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-3)',
  },
  exercice: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--space-4)',
    padding: 'var(--space-4)',
    background: 'var(--cream)',
    borderRadius: 'var(--border-radius-sm)',
    border: '1px solid var(--sand)',
  },
  exerciceNum: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    background: 'var(--forest)',
    color: 'var(--white)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 'var(--text-xs)',
    fontWeight: 600,
    flexShrink: 0,
    marginTop: 2,
  },
  exerciceName: {
    fontSize: 'var(--text-sm)',
    fontWeight: 500,
    color: 'var(--earth)',
  },
  exerciceDetail: {
    fontSize: 'var(--text-xs)',
    color: 'var(--bark)',
    marginTop: 2,
  },
  exerciceDuree: {
    fontSize: 'var(--text-xs)',
    color: 'var(--stone)',
    whiteSpace: 'nowrap',
    marginTop: 6,
  },
  bilanCard: {
    background: 'linear-gradient(135deg, rgba(61,79,60,0.04) 0%, rgba(168,184,154,0.08) 100%)',
    borderColor: 'var(--sage)',
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
