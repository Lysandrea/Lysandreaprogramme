import { useState, useEffect }      from 'react'
import { useParams, useNavigate }   from 'react-router-dom'
import { useAuth }                  from '../../contexts/AuthContext.jsx'
import {
  IS_MOCK, marquerSeance,
  fetchAiProgramme, fetchBilan, saveExercicesData,
} from '../../lib/supabase.js'
import Sidebar   from '../../components/Sidebar.jsx'
import Topbar    from '../../components/Topbar.jsx'
import Card      from '../../components/Card.jsx'
import Button    from '../../components/Button.jsx'
import LysaQuote from '../../components/LysaQuote.jsx'
import { MOCK_DAYS, MOCK_EXERCICES } from '../../lib/mockData.js'

/* Convert a 1-56 absolute day to { semaine, jourInWeek } */
function parseAbsoluteDay(abs) {
  const semaine    = Math.ceil(abs / 7)
  const jourInWeek = abs - (semaine - 1) * 7
  return { semaine, jourInWeek }
}

export default function JourDetail() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const jourNum  = Number(id)

  const [seance,  setSeance]  = useState(null)
  const [loading, setLoading] = useState(true)
  /* { [index]: { fait: bool, charge_notes: string, commentaire: string } } */
  const [exState, setExState] = useState({})
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)

  useEffect(() => {
    if (!user) return

    if (IS_MOCK) {
      const mockDay = MOCK_DAYS.find(d => d.jour === jourNum)
      if (mockDay) {
        const mockExs = MOCK_EXERCICES.map(ex => ({
          nom: ex.nom, series: 3, reps: ex.detail.split('–')[0].trim(),
          repos: '60s', commentaire: ex.conseil ?? '',
        }))
        setSeance({ ...mockDay, exercices: mockExs })
        const init = {}
        mockExs.forEach((_, i) => { init[i] = { fait: false, charge_notes: '', commentaire: '' } })
        setExState(init)
      }
      setLoading(false)
      return
    }

    const { semaine, jourInWeek } = parseAbsoluteDay(jourNum)

    Promise.all([
      fetchAiProgramme(user.id),
      fetchBilan(user.id, jourNum),
    ]).then(([aiProg, bilan]) => {
      const sem  = aiProg?.programme?.find(s => Number(s.semaine) === semaine)
      const jour = sem?.jours?.find(j => Number(j.jour) === jourInWeek)
      if (jour) {
        setSeance({ ...jour, semaine })
        const saved = bilan?.exercices_data ?? []
        const init  = {}
        ;(jour.exercices ?? []).forEach((_, i) => {
          init[i] = {
            fait:         saved[i]?.fait         ?? false,
            charge_notes: saved[i]?.charge_notes ?? '',
            commentaire:  saved[i]?.commentaire  ?? '',
          }
        })
        setExState(init)
      }
      setLoading(false)
    }).catch(err => {
      console.error('[JourDetail]', err)
      setLoading(false)
    })
  }, [user, id]) // eslint-disable-line

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

  if (!seance) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 'var(--s4)', background: 'var(--cream)' }}>
        <p style={{ fontFamily: 'var(--serif)', fontSize: 'var(--tx-xl)', color: 'var(--stone)' }}>Séance introuvable.</p>
        <Button variant="ghost" onClick={() => navigate('/dashboard')}>← Retour</Button>
      </div>
    )
  }

  const exercices = seance.exercices ?? []
  const doneCnt   = Object.values(exState).filter(s => s.fait).length
  const allDone   = exercices.length > 0 && doneCnt === exercices.length

  function setEx(i, field, value) {
    setExState(prev => ({ ...prev, [i]: { ...prev[i], [field]: value } }))
  }

  async function handleSeanceDone() {
    if (IS_MOCK || !user) { setSaved(true); return }
    setSaving(true)
    try {
      const data = exercices.map((_, i) => exState[i] ?? { fait: false, charge_notes: '', commentaire: '' })
      await saveExercicesData(user.id, jourNum, data)
      await marquerSeance(user.id, jourNum)
      setSaved(true)
    } catch (err) {
      console.error('[JourDetail] handleSeanceDone', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="shell">
      <Sidebar />
      <div className="shell-main">
        <Topbar
          title={`Jour ${jourNum} — ${seance.nom}`}
          subtitle={`Semaine ${seance.semaine} · ${seance.duree} min`}
        />
        <div className="shell-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s6)', maxWidth: 720 }}>

          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} style={{ alignSelf: 'flex-start' }}>
            ← Retour
          </Button>

          {/* ── Header ── */}
          <Card style={{ background: 'linear-gradient(135deg, var(--forest) 0%, #2e3c2d 100%)', border: 'none' }}>
            {seance.type && (
              <p style={{ fontSize: 'var(--tx-xs)', color: 'var(--sage)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 'var(--s2)' }}>
                {seance.type}
              </p>
            )}
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'var(--tx-3xl)', fontWeight: 300, color: 'var(--white)' }}>
              {seance.nom}
            </h2>
            {seance.intention && (
              <p style={{ fontSize: 'var(--tx-sm)', color: 'rgba(245,240,232,.7)', marginTop: 'var(--s2)', fontStyle: 'italic' }}>
                {seance.intention}
              </p>
            )}
            <p style={{ fontSize: 'var(--tx-sm)', color: 'rgba(245,240,232,.65)', marginTop: 'var(--s2)' }}>
              Semaine {seance.semaine} · {seance.duree} minutes
            </p>
            {exercices.length > 0 && (
              <div style={{ marginTop: 'var(--s5)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 'var(--tx-xs)', color: 'var(--sage)' }}>Progression</span>
                  <span style={{ fontSize: 'var(--tx-xs)', color: 'var(--sage)' }}>{doneCnt}/{exercices.length}</span>
                </div>
                <div style={{ height: 4, background: 'rgba(255,255,255,.15)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', background: 'var(--sage)', borderRadius: 99,
                    width: `${(doneCnt / exercices.length) * 100}%`,
                    transition: 'width .4s ease',
                  }} />
                </div>
              </div>
            )}
          </Card>

          {/* ── Exercices ── */}
          {exercices.length > 0 && (
            <Card title="Exercices de la séance">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s4)' }}>
                {exercices.map((ex, i) => (
                  <ExerciceRow
                    key={i}
                    ex={ex}
                    state={exState[i] ?? { fait: false, charge_notes: '', commentaire: '' }}
                    onChange={(field, value) => setEx(i, field, value)}
                  />
                ))}
              </div>
              <p style={{
                marginTop: 'var(--s5)',
                padding: 'var(--s4)',
                background: 'var(--sand)',
                borderRadius: 'var(--r-md)',
                fontSize: 'var(--tx-xs)',
                color: 'var(--stone)',
                fontStyle: 'italic',
                lineHeight: 1.6,
              }}>
                📸 Les photos et vidéos de démonstration ne sont pas encore disponibles dans cette version beta — elles arrivent en janvier. En attendant, n'hésite pas à me demander sur WhatsApp si un mouvement n'est pas clair pour toi.
              </p>
            </Card>
          )}

          <LysaQuote index={jourNum} />

          {/* ── CTA bilan ── */}
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
                <Button onClick={() => navigate(`/bilan/${jourNum}`)}>
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

/* ── Exercise row with repos badge, charge input, checkbox, comment ── */
function ExerciceRow({ ex, state, onChange }) {
  const { fait, charge_notes, commentaire } = state
  const [showComment, setShowComment] = useState(!!commentaire)

  return (
    <div style={{
      border: `1px solid ${fait ? 'var(--sage)' : 'var(--sand)'}`,
      borderRadius: 'var(--r-md)',
      background: fait ? 'rgba(107,127,94,.06)' : 'var(--white)',
      transition: 'background var(--ease-fast), border-color var(--ease-fast)',
    }}>
      <div style={{ padding: 'var(--s4)', display: 'flex', alignItems: 'flex-start', gap: 'var(--s4)' }}>

        {/* Checkbox */}
        <div
          role="checkbox"
          aria-checked={fait}
          onClick={() => onChange('fait', !fait)}
          style={{
            width: 22, height: 22, borderRadius: '50%', flexShrink: 0, marginTop: 3,
            border: `2px solid ${fait ? 'var(--moss)' : 'var(--stone)'}`,
            background: fait ? 'var(--moss)' : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all var(--ease-fast)',
          }}
        >
          {fait && <span style={{ fontSize: 11, color: 'var(--white)', fontWeight: 700 }}>✓</span>}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Name + séries × reps + repos badge */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--s2)', flexWrap: 'wrap', marginBottom: 'var(--s3)' }}>
            <span style={{
              fontSize: 'var(--tx-sm)', fontWeight: 600,
              color: fait ? 'var(--moss)' : 'var(--earth)',
              textDecoration: fait ? 'line-through' : 'none',
              transition: 'color var(--ease-fast)',
            }}>
              {ex.nom}
            </span>
            <span style={{ fontSize: 'var(--tx-xs)', color: 'var(--bark)', whiteSpace: 'nowrap' }}>
              {ex.series} × {ex.reps}
            </span>
            {ex.repos && (
              <span style={{
                fontSize: 'var(--tx-xs)', padding: '2px 8px', borderRadius: 99,
                background: 'var(--sand)', color: 'var(--bark)', fontWeight: 500,
                whiteSpace: 'nowrap',
              }}>
                Repos : {ex.repos}
              </span>
            )}
          </div>

          {/* Commentaire coach (from AI) */}
          {ex.commentaire && (
            <p style={{ fontSize: 'var(--tx-xs)', color: 'var(--sage)', marginBottom: 'var(--s3)', fontStyle: 'italic' }}>
              💡 {ex.commentaire}
            </p>
          )}

          {/* Ma charge input */}
          <input
            type="text"
            value={charge_notes}
            onChange={e => onChange('charge_notes', e.target.value)}
            placeholder="Ma charge (ex: 10kg, poids du corps…)"
            style={{
              width: '100%', padding: '6px var(--s3)', boxSizing: 'border-box',
              border: '1px solid var(--sand)', borderRadius: 'var(--r-sm)',
              background: 'var(--cream)', color: 'var(--earth)',
              fontSize: 'var(--tx-xs)', outline: 'none',
              transition: 'border-color var(--ease-fast)',
            }}
            onFocus={e => { e.target.style.borderColor = 'var(--stone)' }}
            onBlur={e  => { e.target.style.borderColor = 'var(--sand)' }}
          />

          {/* Toggle commentaire perso */}
          <button
            onClick={() => setShowComment(s => !s)}
            style={{
              marginTop: 6, background: 'none', border: 'none', padding: 0,
              fontSize: 'var(--tx-xs)', color: 'var(--stone)', cursor: 'pointer',
              textDecoration: 'underline', textUnderlineOffset: 2,
            }}
          >
            {showComment ? 'Masquer la note' : '+ Ajouter une note'}
          </button>

          {showComment && (
            <textarea
              value={commentaire}
              onChange={e => onChange('commentaire', e.target.value)}
              placeholder="Notes sur cet exercice…"
              rows={2}
              style={{
                marginTop: 'var(--s2)', width: '100%', boxSizing: 'border-box',
                padding: '6px var(--s3)',
                border: '1px solid var(--sand)', borderRadius: 'var(--r-sm)',
                background: 'var(--cream)', color: 'var(--earth)',
                fontSize: 'var(--tx-xs)', resize: 'vertical', outline: 'none',
                fontFamily: 'var(--sans)', transition: 'border-color var(--ease-fast)',
              }}
              onFocus={e => { e.target.style.borderColor = 'var(--stone)' }}
              onBlur={e  => { e.target.style.borderColor = 'var(--sand)' }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
