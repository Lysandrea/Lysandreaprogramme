import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar.jsx'
import Topbar  from '../../components/Topbar.jsx'
import Card    from '../../components/Card.jsx'
import Button  from '../../components/Button.jsx'

const HUMEUR_OPTIONS = ['😴', '😐', '🙂', '😊', '🌟']
const ENERGIE_OPTIONS = ['⚡', '⚡⚡', '⚡⚡⚡', '⚡⚡⚡⚡', '⚡⚡⚡⚡⚡']

export default function BilanSoir() {
  const { jour }  = useParams()
  const navigate  = useNavigate()

  const [humeur,    setHumeur]    = useState(null)
  const [energie,   setEnergie]   = useState(null)
  const [seaneFait, setSeaneFait] = useState(null)
  const [note,      setNote]      = useState('')
  const [saved,     setSaved]     = useState(false)

  function handleSave() {
    // In prod: save to Supabase
    console.log('Bilan J' + jour, { humeur, energie, seaneFait, note })
    setSaved(true)
    setTimeout(() => navigate('/dashboard'), 1500)
  }

  if (saved) {
    return (
      <div style={s.savedScreen}>
        <span style={s.savedIcon}>✦</span>
        <h2 style={s.savedTitle}>Bilan enregistré</h2>
        <p style={s.savedSub}>Bien joué aujourd'hui. On se retrouve demain.</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Topbar title={`Bilan — Jour ${jour}`} subtitle="Quelques minutes pour toi" />
        <main style={s.content}>
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} style={{ marginBottom: 'var(--space-2)' }}>
            ← Retour
          </Button>

          {/* Séance faite ? */}
          <Card title="As-tu fait ta séance aujourd'hui ?">
            <div style={s.boolRow}>
              {[['Oui ✓', true], ['Non', false]].map(([label, val]) => (
                <button
                  key={label}
                  onClick={() => setSeaneFait(val)}
                  style={{
                    ...s.chip,
                    background: seaneFait === val ? 'var(--forest)' : 'var(--cream)',
                    color: seaneFait === val ? 'var(--white)' : 'var(--earth)',
                    borderColor: seaneFait === val ? 'var(--forest)' : 'var(--sand)',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </Card>

          {/* Humeur */}
          <Card title="Comment tu te sens ce soir ?">
            <div style={s.emojiRow}>
              {HUMEUR_OPTIONS.map((emoji, i) => (
                <button
                  key={i}
                  onClick={() => setHumeur(i)}
                  style={{
                    ...s.emojiBtn,
                    background: humeur === i ? 'var(--sand)' : 'transparent',
                    transform: humeur === i ? 'scale(1.25)' : 'scale(1)',
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </Card>

          {/* Énergie */}
          <Card title="Niveau d'énergie ?">
            <div style={s.emojiRow}>
              {ENERGIE_OPTIONS.map((emoji, i) => (
                <button
                  key={i}
                  onClick={() => setEnergie(i)}
                  style={{
                    ...s.emojiBtn,
                    background: energie === i ? 'var(--sand)' : 'transparent',
                    transform: energie === i ? 'scale(1.15)' : 'scale(1)',
                    fontSize: 'var(--text-sm)',
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </Card>

          {/* Note libre */}
          <Card title="Note libre (optionnel)">
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Quelque chose à noter sur ta journée, ton ressenti, tes progrès…"
              rows={4}
              style={s.textarea}
            />
          </Card>

          <Button
            fullWidth
            disabled={seaneFait === null || humeur === null || energie === null}
            onClick={handleSave}
          >
            Enregistrer mon bilan
          </Button>
        </main>
      </div>
    </div>
  )
}

const s = {
  content: {
    flex: 1,
    overflowY: 'auto',
    padding: 'var(--space-8)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-5)',
    maxWidth: 600,
  },
  boolRow: {
    display: 'flex',
    gap: 'var(--space-3)',
  },
  chip: {
    padding: '10px 24px',
    borderRadius: 'var(--border-radius-md)',
    border: '1px solid',
    cursor: 'pointer',
    fontSize: 'var(--text-sm)',
    fontWeight: 500,
    transition: 'all var(--transition-fast)',
    fontFamily: 'var(--font-sans)',
  },
  emojiRow: {
    display: 'flex',
    gap: 'var(--space-3)',
    flexWrap: 'wrap',
  },
  emojiBtn: {
    fontSize: 28,
    border: 'none',
    borderRadius: 'var(--border-radius-sm)',
    padding: 'var(--space-2)',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    lineHeight: 1,
  },
  textarea: {
    width: '100%',
    padding: 'var(--space-4)',
    borderRadius: 'var(--border-radius-sm)',
    border: '1px solid var(--sand)',
    background: 'var(--cream)',
    color: 'var(--earth)',
    fontSize: 'var(--text-sm)',
    lineHeight: 1.6,
    resize: 'vertical',
    outline: 'none',
    fontFamily: 'var(--font-sans)',
  },
  savedScreen: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--space-4)',
    background: 'var(--cream)',
  },
  savedIcon: {
    fontSize: 48,
    color: 'var(--sage)',
  },
  savedTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: 'var(--text-3xl)',
    fontWeight: 400,
    color: 'var(--earth)',
  },
  savedSub: {
    fontSize: 'var(--text-base)',
    color: 'var(--bark)',
  },
}
