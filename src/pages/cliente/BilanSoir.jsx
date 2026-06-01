import { useState }               from 'react'
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
    placeholder: 'Même les plus petites choses comptent…',
    rows: 4,
  },
  {
    id: 'lecon',
    titre: 'Une leçon que je retiens de cette journée',
    type: 'textarea',
    placeholder: "Ce que cette journée m'a appris…",
    rows: 3,
  },
  {
    id: 'corps',
    titre: "Comment mon corps s'est senti aujourd'hui",
    type: 'emoji',
    options: ['😫', '😕', '😐', '🙂', '💪'],
    labels:  ['Épuisée', 'Difficile', 'Neutre', 'Bien', 'Au top !'],
  },
  {
    id: 'emotion',
    titre: "Une émotion que j'ai traversée aujourd'hui",
    type: 'textarea',
    placeholder: "Nommer ce qu'on ressent, c'est déjà l'accueillir…",
    rows: 2,
  },
  {
    id: 'lacher',
    titre: 'Ce que je veux lâcher avant de dormir',
    type: 'textarea',
    placeholder: "Pose-le ici pour ne pas l'emporter dans ton sommeil…",
    rows: 3,
  },
]

export default function BilanSoir() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [seanceFaite,     setSeanceFaite]     = useState(null)   // 'faite' | 'pas-faite'
  const [raisonNonSeance, setRaisonNonSeance] = useState('')
  const [answers,         setAnswers]         = useState({})
  const [saving,          setSaving]          = useState(false)
  const [saved,           setSaved]           = useState(false)
  const [error,           setError]           = useState('')

  const isComplete = (
    seanceFaite !== null &&
    QUESTIONS.every(q =>
      q.type === 'emoji'
        ? answers[q.id] !== undefined
        : (answers[q.id] ?? '').trim().length > 0
    )
  )

  async function handleSubmit() {
    setSaving(true)
    setError('')
    try {
      if (!IS_MOCK && user) {
        await saveBilan(
          user.id,
          Number(id),
          {
            seance_faite_bilan: seanceFaite === 'faite',
            raison_non_seance:  seanceFaite !== 'faite' ? (raisonNonSeance || null) : null,
            gratitude:          answers.gratitude ?? '',
            lecon:              answers.lecon     ?? '',
            corps:              answers.corps     ?? null,
            emotion:            answers.emotion   ?? '',
            lacher:             answers.lacher    ?? '',
          },
          seanceFaite === 'faite'
        )
      } else {
        await new Promise(r => setTimeout(r, 600))
      }
      setSaved(true)
      setTimeout(() => navigate('/dashboard'), 2000)
    } catch (err) {
      setError("Erreur lors de l'enregistrement. Réessaie.")
      console.error('[BilanSoir] Erreur saveBilan :', err?.message ?? err)
      console.error('[BilanSoir] Détails :', JSON.stringify(err, null, 2))
    } finally {
      setSaving(false)
    }
  }

  if (saved) return <SuccessScreen />

  return (
    <div className="shell">
      <Sidebar />
      <div className="shell-main">
        <Topbar title={`Bilan du soir — Jour ${id}`} subtitle="Prends 5 minutes pour toi ✦" />
        <div className="shell-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s6)', maxWidth: 680 }}>

          {/* Message explicatif */}
          <div style={s.intro}>
            <p style={s.introText}>
              Ton bilan du soir complété débloque ta journée de demain.
            </p>
            <p style={s.introSub}>Prends 5 minutes pour toi.</p>
          </div>

          {/* SECTION 1 — Séance */}
          <div style={s.section}>
            <h3 style={s.sectionTitle}>Ma séance aujourd'hui</h3>
            <div style={{ display: 'flex', gap: 'var(--s3)', flexWrap: 'wrap' }}>
              <button
                onClick={() => setSeanceFaite('faite')}
                style={{
                  ...s.toggleBtn,
                  flex: 1, minWidth: 140,
                  background: seanceFaite === 'faite' ? 'var(--moss)' : 'transparent',
                  color:      seanceFaite === 'faite' ? 'var(--cream)' : 'var(--bark)',
                  border:     seanceFaite === 'faite' ? '2px solid var(--moss)' : '2px solid var(--sand)',
                }}
              >
                ✅ Séance faite
              </button>
              <button
                onClick={() => setSeanceFaite('pas-faite')}
                style={{
                  ...s.toggleBtn,
                  flex: 1, minWidth: 140,
                  background: seanceFaite === 'pas-faite' ? 'var(--sand)' : 'transparent',
                  color:      'var(--bark)',
                  border:     seanceFaite === 'pas-faite' ? '2px solid var(--stone)' : '2px solid var(--sand)',
                }}
              >
                💛 J'ai pas pu aujourd'hui
              </button>
            </div>

            {seanceFaite === 'pas-faite' && (
              <div style={{ marginTop: 'var(--s3)', display: 'flex', flexDirection: 'column', gap: 'var(--s2)' }}>
                <label style={{ fontSize: 'var(--tx-sm)', color: 'var(--stone)', fontStyle: 'italic' }}>
                  Tu veux me dire pourquoi ? (pas obligatoire)
                </label>
                <textarea
                  value={raisonNonSeance}
                  onChange={e => setRaisonNonSeance(e.target.value)}
                  placeholder="Pas besoin de te justifier…"
                  rows={2}
                  style={s.textarea}
                  onFocus={e => { e.target.style.borderColor = 'var(--stone)' }}
                  onBlur={e  => { e.target.style.borderColor = 'var(--sand)'  }}
                />
              </div>
            )}
          </div>

          {/* SECTION 2 — 5 Questions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s4)' }}>
            {QUESTIONS.map((q, i) => (
              <QuestionCard
                key={q.id}
                q={q}
                index={i}
                value={answers[q.id]}
                onChange={val => setAnswers(prev => ({ ...prev, [q.id]: val }))}
              />
            ))}
          </div>

          {error && (
            <p style={{ fontSize: 'var(--tx-sm)', color: 'var(--terracotta)', textAlign: 'center' }}>{error}</p>
          )}

          {/* SECTION 3 — Bouton valider */}
          <button
            disabled={!isComplete || saving}
            onClick={handleSubmit}
            style={{
              ...s.submitBtn,
              opacity: (!isComplete || saving) ? .5 : 1,
              cursor:  (!isComplete || saving) ? 'not-allowed' : 'pointer',
              marginBottom: 'var(--s8)',
            }}
          >
            {saving ? 'Enregistrement…' : 'Valider mon bilan ✦'}
          </button>

          {!isComplete && (
            <p style={{ textAlign: 'center', fontSize: 'var(--tx-xs)', color: 'var(--stone)', marginTop: -16 }}>
              {seanceFaite === null
                ? 'Indique si tu as fait ta séance, puis réponds aux 5 questions.'
                : 'Réponds à toutes les questions pour valider.'}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

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
                background: value === i ? 'var(--terracotta)' : 'transparent',
                cursor: 'pointer',
                transition: 'all var(--ease-fast)',
                minWidth: 52,
              }}
            >
              <span style={{ fontSize: 28, lineHeight: 1 }}>{emoji}</span>
              <span style={{ fontSize: 'var(--tx-xs)', color: value === i ? 'var(--white)' : 'var(--stone)', fontWeight: value === i ? 600 : 400 }}>
                {q.labels[i]}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function SuccessScreen() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 'var(--s5)', background: 'var(--cream)',
      padding: 'var(--s6)',
    }}>
      <span style={{ fontSize: 56 }}>🌿</span>
      <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'var(--tx-3xl)', fontWeight: 300, color: 'var(--earth)', textAlign: 'center' }}>
        Bilan enregistré. Demain t'attend.
      </h2>
    </div>
  )
}

const s = {
  intro: {
    background: 'var(--forest)',
    borderRadius: 'var(--r-xl)', padding: 'var(--s6)',
  },
  introText: {
    fontFamily: 'var(--serif)', fontSize: 'var(--tx-xl)',
    fontWeight: 400, color: 'var(--white)', lineHeight: 1.4,
  },
  introSub: {
    fontSize: 'var(--tx-sm)', color: 'rgba(253,250,246,.65)',
    marginTop: 'var(--s2)',
  },
  section: {
    background: 'var(--white)', border: '1px solid var(--sand)',
    borderRadius: 'var(--r-lg)', padding: 'var(--s6)',
    boxShadow: 'var(--sh-sm)', display: 'flex', flexDirection: 'column', gap: 'var(--s4)',
  },
  sectionTitle: {
    fontFamily: 'var(--serif)', fontSize: 'var(--tx-lg)',
    fontWeight: 400, color: 'var(--earth)',
  },
  toggleBtn: {
    padding: '14px var(--s4)',
    borderRadius: 'var(--r-md)',
    fontFamily: 'var(--sans)', fontSize: 'var(--tx-sm)', fontWeight: 500,
    cursor: 'pointer', transition: 'all var(--ease-fast)',
    textAlign: 'center', minHeight: 44,
  },
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
  qTitle: {
    fontFamily: 'var(--serif)', fontSize: 'var(--tx-lg)',
    fontWeight: 400, color: 'var(--earth)', lineHeight: 1.4,
  },
  textarea: {
    width: '100%', padding: 'var(--s4)',
    borderRadius: 'var(--r-sm)', border: '1px solid var(--sand)',
    background: 'var(--cream)', color: 'var(--earth)',
    fontSize: 'var(--tx-sm)', lineHeight: 1.7, resize: 'vertical',
    fontFamily: 'var(--sans)', transition: 'border-color var(--ease-fast)',
    outline: 'none',
  },
  submitBtn: {
    width: '100%', padding: '18px var(--s6)',
    background: 'var(--terracotta)', color: 'var(--white)',
    border: 'none', borderRadius: 'var(--r-md)',
    fontFamily: 'var(--sans)', fontSize: 'var(--tx-base)', fontWeight: 500,
    letterSpacing: '.02em', transition: 'filter var(--ease-fast)',
  },
}
