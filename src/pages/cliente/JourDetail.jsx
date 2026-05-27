import { useState, useEffect }      from 'react'
import { useParams, useNavigate }   from 'react-router-dom'
import { useAuth }                  from '../../contexts/AuthContext.jsx'
import { IS_MOCK, marquerSeance }   from '../../lib/supabase.js'
import Sidebar   from '../../components/Sidebar.jsx'
import Topbar    from '../../components/Topbar.jsx'
import Card      from '../../components/Card.jsx'
import Button    from '../../components/Button.jsx'
import LysaQuote from '../../components/LysaQuote.jsx'
import { MOCK_DAYS, MOCK_EXERCICES } from '../../lib/mockData.js'

export default function JourDetail() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const day      = MOCK_DAYS.find(d => d.jour === Number(id))

  const [checked,  setChecked]  = useState({})
  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(false)

  if (!day) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 'var(--s4)', background: 'var(--cream)' }}>
        <p style={{ fontFamily: 'var(--serif)', fontSize: 'var(--tx-xl)', color: 'var(--stone)' }}>Jour introuvable.</p>
        <Button variant="ghost" onClick={() => navigate('/dashboard')}>← Retour</Button>
      </div>
    )
  }

  const doneCnt = Object.values(checked).filter(Boolean).length
  const allDone = MOCK_EXERCICES.every(ex => checked[ex.id])

  async function handleSeanceDone() {
    if (IS_MOCK || !user) { setSaved(true); return }
    setSaving(true)
    try {
      await marquerSeance(user.id, Number(id))
      setSaved(true)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
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

          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} style={{ alignSelf: 'flex-start' }}>
            ← Retour
          </Button>

          {/* Header */}
          <Card style={{ background: 'linear-gradient(135deg, var(--forest) 0%, #2e3c2d 100%)', border: 'none' }}>
            <p style={{ fontSize: 'var(--tx-xs)', color: 'var(--sage)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 'var(--s2)' }}>
              Séance du matin
            </p>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'var(--tx-3xl)', fontWeight: 300, color: 'var(--white)' }}>
              {day.titre}
            </h2>
            <p style={{ fontSize: 'var(--tx-sm)', color: 'rgba(245,240,232,.65)', marginTop: 'var(--s2)' }}>
              Semaine {day.semaine} · {day.duree} minutes
            </p>
            {/* Barre de progression */}
            <div style={{ marginTop: 'var(--s5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 'var(--tx-xs)', color: 'var(--sage)' }}>Progression</span>
                <span style={{ fontSize: 'var(--tx-xs)', color: 'var(--sage)' }}>{doneCnt}/{MOCK_EXERCICES.length}</span>
              </div>
              <div style={{ height: 4, background: 'rgba(255,255,255,.15)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', background: 'var(--sage)', borderRadius: 99,
                  width: `${(doneCnt / MOCK_EXERCICES.length) * 100}%`,
                  transition: 'width .4s ease',
                }} />
              </div>
            </div>
          </Card>

          {/* Exercices */}
          <Card title="Exercices de la séance">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s3)' }}>
              {MOCK_EXERCICES.map(ex => (
                <ExerciceRow
                  key={ex.id}
                  ex={ex}
                  done={!!checked[ex.id]}
                  onToggle={() => setChecked(p => ({ ...p, [ex.id]: !p[ex.id] }))}
                />
              ))}
            </div>
          </Card>

          <LysaQuote index={day.jour} />

          {/* CTA bilan */}
          <Card style={{ borderColor: allDone ? 'var(--sage)' : 'var(--sand)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--s4)' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--serif)', fontSize: 'var(--tx-xl)', fontWeight: 400, color: 'var(--earth)' }}>
                  Compléter mon bilan du soir
                </h3>
                <p style={{ fontSize: 'var(--tx-sm)', color: 'var(--bark)', marginTop: 4 }}>
                  {allDone
                    ? 'Séance terminée 💪 Passe au bilan du soir.'
                    : 'Coche tes exercices, puis remplis ton bilan.'}
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s2)' }}>
                {allDone && !saved && (
                  <Button variant="sage" size="sm" loading={saving} onClick={handleSeanceDone}>
                    ✓ Marquer la séance
                  </Button>
                )}
                {saved && <span style={{ fontSize: 'var(--tx-xs)', color: 'var(--moss)' }}>Séance enregistrée ✓</span>}
                <Button onClick={() => navigate(`/bilan/${day.jour}`)}>
                  Bilan du soir ✦
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function ExerciceRow({ ex, done, onToggle }) {
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
      <div style={{
        width: 22, height: 22, borderRadius: '50%', flexShrink: 0, marginTop: 2,
        border: `2px solid ${done ? 'var(--moss)' : 'var(--stone)'}`,
        background: done ? 'var(--moss)' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all var(--ease-fast)',
      }}>
        {done && <span style={{ fontSize: 11, color: 'var(--white)', fontWeight: 700 }}>✓</span>}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 'var(--tx-sm)', fontWeight: 500, color: done ? 'var(--moss)' : 'var(--earth)', textDecoration: done ? 'line-through' : 'none' }}>
          {ex.nom}
        </p>
        <p style={{ fontSize: 'var(--tx-xs)', color: 'var(--bark)', marginTop: 2 }}>{ex.detail}</p>
        {ex.conseil && (
          <p style={{ fontSize: 'var(--tx-xs)', color: 'var(--sage)', marginTop: 4, fontStyle: 'italic' }}>
            💡 {ex.conseil}
          </p>
        )}
      </div>
      <span style={{ fontSize: 'var(--tx-xs)', color: 'var(--stone)', whiteSpace: 'nowrap', marginTop: 4 }}>{ex.duree}</span>
    </div>
  )
}
