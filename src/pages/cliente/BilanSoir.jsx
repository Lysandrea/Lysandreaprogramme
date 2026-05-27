import { useState }              from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth }                from '../../contexts/AuthContext.jsx'
import { IS_MOCK, saveBilan }     from '../../lib/supabase.js'
import Sidebar from '../../components/Sidebar.jsx'
import Topbar  from '../../components/Topbar.jsx'
import Button  from '../../components/Button.jsx'

const QUESTIONS = [
  {
    id: 'gratitude',
    titre: "5 choses pour lesquelles je suis reconnaissante aujourd'hui",
    type: 'textarea',
    placeholder: 'Ex: Le soleil ce matin, mon corps qui bouge, une belle conversation…',
    rows: 4,
  },
  {
    id: 'lecon',
    titre: 'Une leçon que je retiens de cette journée',
    type: 'textarea',
    placeholder: "Ce que j'emporte avec moi…",
    rows: 3,
  },
  {
    id: 'corps',
    titre: "Comment mon corps s'est senti pendant la séance",
    type: 'emoji',
    options: ['😫', '😕', '😐', '🙂', '💪'],
    labels:  ['Épuisée', 'Difficile', 'Neutre', 'Bien', 'Au top !'],
  },
  {
    id: 'emotion',
    titre: "Une émotion que j'ai ressentie aujourd'hui",
    type: 'textarea',
    placeholder: 'Joie, tristesse, fierté, fatigue, gratitude…',
    rows: 2,
  },
  {
    id: 'lacher',
    titre: 'Ce que je veux lâcher avant de dormir',
    type: 'textarea',
    placeholder: 'Un souci, une tension, une pensée qui tourne…',
    rows: 3,
  },
]

export default function BilanSoir() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [answers, setAnswers] = useState({})
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)
  const [error,   setError]   = useState('')

  const isComplete = QUESTIONS.every(q =>
    q.type === 'emoji'
      ? answers[q.id] !== undefined
      : (answers[q.id] ?? '').trim().length > 0
  )

  async function handleSubmit() {
    setSaving(true)
    setError('')
    try {
      if (!IS_MOCK && user) {
        await saveBilan(user.id, Number(id), {
          gratitude: answers.gratitude ?? '',
          lecon:     answers.lecon     ?? '',
          corps:     answers.corps     ?? null,
          emotion:   answers.emotion   ?? '',
          lacher:    answers.lacher    ?? '',
        })
      } else {
        // mode mock : simulation
        await new Promise(r => setTimeout(r, 600))
      }
      setSaved(true)
      setTimeout(() => navigate('/dashboard'), 2000)
    } catch (err) {
      setError("Erreur lors de l'enregistrement. Réessaie.")
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (saved) return <SuccessScreen />

  return (
    <div className="shell">
      <Sidebar />
      <div className="shell-main">
        <Topbar title={`Bilan du soir — Jour ${id}`} subtitle="Quelques minutes pour toi ✦" />
        <div className="shell-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s6)', maxWidth: 680 }}>

          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} style={{ alignSelf: 'flex-start' }}>
            ← Retour
          </Button>

          {/* Intro */}
          <div style={s.intro}>
            <h2 style={s.introTitle}>Bilan du soir</h2>
            <p style={s.introSub}>Ce moment t'appartient. Réponds avec honnêteté, sans jugement.</p>
          </div>

          {/* Questions */}
          {QUESTIONS.map((q, i) => (
            <QuestionCard
              key={q.id}
              q={q}
              index={i}
              value={answers[q.id]}
              onChange={val => setAnswers(prev => ({ ...prev, [q.id]: val }))}
            />
          ))}

          {error && (
            <p style={{ fontSize: 'var(--tx-sm)', color: 'var(--terracotta)', textAlign: 'center' }}>{error}</p>
          )}

          <Button
            fullWidth size="lg"
            disabled={!isComplete}
            loading={saving}
            onClick={handleSubmit}
            style={{ marginBottom: 'var(--s8)' }}
          >
            Valider mon bilan ✦
          </Button>

          {!isComplete && (
            <p style={{ textAlign: 'center', fontSize: 'var(--tx-xs)', color: 'var(--stone)', marginTop: -16 }}>
              Réponds à toutes les questions pour valider.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Question card ── */
function QuestionCard({ q, index, value, onChange }) {
  return (
    <div style={s.qCard}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--s3)' }}>
        <span style={s.qNum}>{index + 1}</span>
        <h3 style={s.qTitle}>{q.titre}</h3>
      </div>

      {q.type === 'textarea' && (
        <textarea
          value={value ?? ''}
          onChange={e => onChange(e.target.value)}
          placeholder={q.placeholder}
          rows={q.rows}
          style={s.textarea}
          onFocus={e => { e.target.style.borderColor = 'var(--stone)'; e.target.style.outline = 'none' }}
          onBlur={e  => { e.target.style.borderColor = 'var(--sand)' }}
        />
      )}

      {q.type === 'emoji' && (
        <div style={{ display: 'flex', gap: 'var(--s3)', flexWrap: 'wrap' }}>
          {q.options.map((emoji, i) => (
            <button
              key={i}
              onClick={() => onChange(i)}
              title={q.labels[i]}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                padding: 'var(--s3)',
                borderRadius: 'var(--r-md)',
                border: `2px solid ${value === i ? 'var(--terracotta)' : 'var(--sand)'}`,
                background: value === i ? 'rgba(192,120,96,.08)' : 'transparent',
                cursor: 'pointer',
                transition: 'all var(--ease-fast)',
                transform: value === i ? 'scale(1.1)' : 'scale(1)',
              }}
            >
              <span style={{ fontSize: 32, lineHeight: 1 }}>{emoji}</span>
              <span style={{ fontSize: 'var(--tx-xs)', color: value === i ? 'var(--terracotta)' : 'var(--stone)', fontWeight: value === i ? 500 : 400 }}>
                {q.labels[i]}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Écran de succès ── */
function SuccessScreen() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--s5)', background: 'var(--cream)' }}>
      <span style={{ fontSize: 56, color: 'var(--sage)' }}>✦</span>
      <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'var(--tx-3xl)', fontWeight: 300, color: 'var(--earth)' }}>
        Bilan enregistré
      </h2>
      <p style={{ fontSize: 'var(--tx-base)', color: 'var(--bark)', textAlign: 'center', maxWidth: 340 }}>
        Bien joué aujourd'hui. Repose-toi bien — demain t'attend.
      </p>
    </div>
  )
}

const s = {
  intro: {
    background: 'linear-gradient(135deg, var(--forest) 0%, #2e3c2d 100%)',
    borderRadius: 'var(--r-xl)', padding: 'var(--s6)',
  },
  introTitle: {
    fontFamily: 'var(--serif)', fontSize: 'var(--tx-3xl)',
    fontWeight: 300, fontStyle: 'italic', color: 'var(--white)',
  },
  introSub: { fontSize: 'var(--tx-sm)', color: 'rgba(245,240,232,.7)', marginTop: 'var(--s2)' },
  qCard: {
    background: 'var(--white)', border: '1px solid var(--sand)',
    borderRadius: 'var(--r-lg)', padding: 'var(--s6)',
    boxShadow: 'var(--sh-sm)', display: 'flex', flexDirection: 'column', gap: 'var(--s4)',
  },
  qNum: {
    width: 28, height: 28, borderRadius: '50%', flexShrink: 0, marginTop: 2,
    background: 'var(--cream)', border: '1.5px solid var(--sand)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 'var(--tx-xs)', fontWeight: 600, color: 'var(--bark)',
  },
  qTitle: { fontFamily: 'var(--serif)', fontSize: 'var(--tx-lg)', fontWeight: 400, color: 'var(--earth)', lineHeight: 1.4 },
  textarea: {
    width: '100%', padding: 'var(--s4)',
    borderRadius: 'var(--r-sm)', border: '1px solid var(--sand)',
    background: 'var(--cream)', color: 'var(--earth)',
    fontSize: 'var(--tx-sm)', lineHeight: 1.7, resize: 'vertical',
    fontFamily: 'var(--sans)', transition: 'border-color var(--ease-fast)',
  },
}
