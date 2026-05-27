import { useState }        from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Sidebar     from '../../components/Sidebar.jsx'
import Topbar      from '../../components/Topbar.jsx'
import Card        from '../../components/Card.jsx'
import Button      from '../../components/Button.jsx'
import LysaQuote   from '../../components/LysaQuote.jsx'
import { MOCK_DAYS, MOCK_EXERCICES } from '../../lib/mockData.js'

export default function JourDetail() {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const day       = MOCK_DAYS.find(d => d.jour === Number(id))

  // Checkbox state: { [exerciceId]: boolean }
  const [checked, setChecked] = useState({})

  if (!day) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 'var(--s4)', background: 'var(--cream)' }}>
        <p style={{ color: 'var(--stone)', fontFamily: 'var(--serif)', fontSize: 'var(--tx-xl)' }}>Jour introuvable.</p>
        <Button variant="ghost" onClick={() => navigate('/dashboard')}>← Retour</Button>
      </div>
    )
  }

  const allDone  = MOCK_EXERCICES.every(ex => checked[ex.id])
  const doneCnt  = Object.values(checked).filter(Boolean).length

  function toggle(id) {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="shell">
      <Sidebar />
      <div className="shell-main">
        <Topbar
          title={`Jour ${day.jour} — ${day.titre}`}
          subtitle={`Semaine ${day.semaine} · ${day.duree} min`}
        />
        <div className="shell-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s6)', maxWidth: 720 }}>

          {/* Back */}
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} style={{ alignSelf: 'flex-start' }}>
            ← Retour
          </Button>

          {/* Header card */}
          <Card style={{ background: 'linear-gradient(135deg, var(--forest) 0%, #2e3c2d 100%)', border: 'none' }}>
            <p style={{ fontSize: 'var(--tx-xs)', color: 'var(--sage)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 'var(--s2)' }}>
              Séance du matin
            </p>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'var(--tx-3xl)', fontWeight: 300, color: 'var(--white)', letterSpacing: '-.01em' }}>
              {day.titre}
            </h2>
            <p style={{ fontSize: 'var(--tx-sm)', color: 'rgba(245,240,232,.65)', marginTop: 'var(--s2)' }}>
              Semaine {day.semaine} · {day.duree} minutes
            </p>

            {/* Progress bar */}
            <div style={{ marginTop: 'var(--s5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 'var(--tx-xs)', color: 'var(--sage)' }}>Progression</span>
                <span style={{ fontSize: 'var(--tx-xs)', color: 'var(--sage)' }}>{doneCnt}/{MOCK_EXERCICES.length}</span>
              </div>
              <div style={{ height: 4, background: 'rgba(255,255,255,.15)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 99,
                  background: 'var(--sage)',
                  width: `${MOCK_EXERCICES.length ? (doneCnt / MOCK_EXERCICES.length) * 100 : 0}%`,
                  transition: 'width .4s ease',
                }} />
              </div>
            </div>
          </Card>

          {/* Exercises */}
          <Card title="Exercices de la séance">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s3)' }}>
              {MOCK_EXERCICES.map((ex, i) => (
                <ExerciceRow
                  key={ex.id}
                  ex={ex}
                  index={i}
                  done={!!checked[ex.id]}
                  onToggle={() => toggle(ex.id)}
                />
              ))}
            </div>
          </Card>

          {/* Quote */}
          <LysaQuote index={day.jour} />

          {/* CTA bilan */}
          <Card style={{
            background: allDone
              ? 'linear-gradient(135deg, rgba(61,79,60,.06) 0%, rgba(168,184,154,.1) 100%)'
              : 'var(--white)',
            borderColor: allDone ? 'var(--sage)' : 'var(--sand)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--s4)' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--serif)', fontSize: 'var(--tx-xl)', fontWeight: 400, color: 'var(--earth)' }}>
                  Compléter mon bilan du soir
                </h3>
                <p style={{ fontSize: 'var(--tx-sm)', color: 'var(--bark)', marginTop: 4 }}>
                  {allDone
                    ? 'Séance terminée ! Prends quelques minutes pour ton bilan.'
                    : "Complète tes exercices puis remplis ton bilan de fin de journée."}
                </p>
              </div>
              <Button
                variant={allDone ? 'primary' : 'secondary'}
                onClick={() => navigate(`/bilan/${day.jour}`)}
              >
                Bilan du soir ✦
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

/* ── Exercise row with checkbox ── */
function ExerciceRow({ ex, index, done, onToggle }) {
  return (
    <div
      onClick={onToggle}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 'var(--s4)',
        padding: 'var(--s4)',
        background: done ? 'rgba(107,127,94,.08)' : 'var(--cream)',
        borderRadius: 'var(--r-sm)',
        border: `1px solid ${done ? 'var(--sage)' : 'var(--sand)'}`,
        cursor: 'pointer',
        transition: 'background var(--ease-fast), border-color var(--ease-fast)',
      }}
    >
      {/* Checkbox */}
      <div style={{
        width: 22, height: 22, borderRadius: '50%',
        border: `2px solid ${done ? 'var(--moss)' : 'var(--stone)'}`,
        background: done ? 'var(--moss)' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, marginTop: 2,
        transition: 'all var(--ease-fast)',
      }}>
        {done && <span style={{ fontSize: 11, color: 'var(--white)', fontWeight: 700 }}>✓</span>}
      </div>

      {/* Info */}
      <div style={{ flex: 1 }}>
        <p style={{
          fontSize: 'var(--tx-sm)', fontWeight: 500,
          color: done ? 'var(--moss)' : 'var(--earth)',
          textDecoration: done ? 'line-through' : 'none',
          transition: 'color var(--ease-fast)',
        }}>
          {ex.nom}
        </p>
        <p style={{ fontSize: 'var(--tx-xs)', color: 'var(--bark)', marginTop: 2 }}>{ex.detail}</p>
        {ex.conseil && (
          <p style={{
            fontSize: 'var(--tx-xs)', color: 'var(--sage)',
            marginTop: 4, fontStyle: 'italic',
          }}>
            💡 {ex.conseil}
          </p>
        )}
      </div>

      {/* Duration */}
      <span style={{ fontSize: 'var(--tx-xs)', color: 'var(--stone)', whiteSpace: 'nowrap', marginTop: 4 }}>
        {ex.duree}
      </span>
    </div>
  )
}
