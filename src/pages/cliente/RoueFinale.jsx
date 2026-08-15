import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { IS_MOCK, fetchIntakeResponses, saveRoueFinale } from '../../lib/supabase.js'
import Sidebar from '../../components/Sidebar.jsx'
import Topbar from '../../components/Topbar.jsx'
import Card from '../../components/Card.jsx'
import RadarChart, { ROUE_KEYS, ROUE_FULL, DEF_ROUE } from '../../components/RadarChart.jsx'

function SliderRow({ label, value, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontSize: 'var(--tx-sm)', color: 'var(--earth)', fontWeight: 500 }}>{label}</span>
        <span style={{ fontFamily: 'var(--serif)', fontSize: 'var(--tx-xl)', fontWeight: 300, color: 'var(--forest)', minWidth: 28, textAlign: 'right' }}>
          {value}
        </span>
      </div>
      <input
        type="range" min="1" max="10" step="1"
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: '#3D4F3C', cursor: 'pointer' }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 9, color: 'var(--stone)' }}>1</span>
        <span style={{ fontSize: 9, color: 'var(--stone)' }}>10</span>
      </div>
    </div>
  )
}

export default function RoueFinale() {
  const { user, profile } = useAuth()
  const currentSem = Math.ceil((profile?.current_day ?? 1) / 7)
  const locked = currentSem < 8

  const [roueInitiale, setRoueInitiale] = useState(null)
  const [values,  setValues]  = useState({ ...DEF_ROUE })
  const [loading, setLoading] = useState(true)
  const [alreadySaved, setAlreadySaved] = useState(false)
  const [saving, setSaving]  = useState(false)
  const [saved,  setSaved]   = useState(false)
  const [error,  setError]   = useState(null)

  useEffect(() => {
    if (!user || locked) { setLoading(false); return }
    if (IS_MOCK) { setLoading(false); return }
    fetchIntakeResponses(user.id)
      .then(rep => {
        if (rep?.roue_de_vie)        setRoueInitiale(rep.roue_de_vie)
        if (rep?.roue_de_vie_finale) {
          setValues(rep.roue_de_vie_finale)
          setAlreadySaved(true)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user, locked])

  function set(key, val) {
    setValues(prev => ({ ...prev, [key]: val }))
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      await saveRoueFinale(user.id, values)
      setSaved(true)
      setAlreadySaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
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

  if (locked) {
    return (
      <div className="shell">
        <Sidebar />
        <div className="shell-main">
          <Topbar title="Ma Roue de la Vie 2.0" subtitle="Fin de programme" />
          <div className="shell-body">
            <div style={s.lockedBox}>
              <span style={{ fontSize: 40 }}>🔒</span>
              <p style={s.lockMsg}>Cette page se débloque à la semaine 8.</p>
              <p style={s.lockSub}>
                Tu es à la semaine {currentSem} — encore {8 - currentSem} semaine{8 - currentSem > 1 ? 's' : ''} !
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="shell">
      <Sidebar />
      <div className="shell-main">
        <Topbar title="Ma Roue de la Vie 2.0" subtitle="Ton profil de fin · Semaine 8" />
        <div className="shell-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s6)' }}>

          {/* Intro */}
          <div style={s.intro}>
            <h2 style={s.introTitle}>🌀 Ta Roue de la Vie — Déclic 2.0</h2>
            <p style={s.introMsg}>
              Tu as terminé ton programme. C'est le moment de refaire ta roue et de mesurer
              ton chemin. Note chaque domaine honnêtement — c'est ton ressenti aujourd'hui,
              pas ce que tu voudrais qu'il soit.
            </p>
            {alreadySaved && (
              <p style={s.savedBadge}>✓ Roue finale enregistrée — tu peux la modifier à tout moment.</p>
            )}
          </div>

          {/* Sliders + preview côte à côte */}
          <div style={s.twoCol}>
            <Card style={{ flex: '1 1 300px' }}>
              <p style={s.chartLabel}>Ton aperçu en temps réel</p>
              <div style={{ background: 'var(--cream)', borderRadius: 'var(--r-lg)', padding: 'var(--s5)', marginBottom: 'var(--s6)' }}>
                <RadarChart values={values} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s5)' }}>
                {ROUE_KEYS.map((key, i) => (
                  <SliderRow
                    key={key}
                    label={ROUE_FULL[i]}
                    value={values[key]}
                    onChange={v => set(key, v)}
                  />
                ))}
              </div>

              {error && <p style={s.error}>{error}</p>}

              <button style={s.btn} onClick={handleSave} disabled={saving}>
                {saving ? 'Sauvegarde…' : saved ? 'Enregistré ✓' : alreadySaved ? 'Mettre à jour ma roue' : 'Enregistrer ma roue finale'}
              </button>
            </Card>

            {/* Comparaison avec la roue initiale */}
            {roueInitiale && (
              <Card style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column', gap: 'var(--s5)' }}>
                <p style={s.chartLabel}>Début du programme</p>
                <div style={{ background: 'var(--cream)', borderRadius: 'var(--r-lg)', padding: 'var(--s5)' }}>
                  <RadarChart values={roueInitiale} />
                </div>

                {alreadySaved && (
                  <>
                    <p style={{ ...s.chartLabel, marginTop: 'var(--s2)' }}>Évolution domaine par domaine</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s3)' }}>
                      {ROUE_KEYS.map((key, i) => {
                        const initial = roueInitiale[key] ?? 5
                        const final   = values[key] ?? 5
                        const diff    = final - initial
                        return (
                          <div key={key} style={s.diffRow}>
                            <span style={s.diffLabel}>{ROUE_FULL[i]}</span>
                            <div style={s.diffScores}>
                              <span style={s.diffInitial}>{initial}</span>
                              <span style={s.diffArrow}>→</span>
                              <span style={s.diffFinal}>{final}</span>
                              <span style={{ ...s.diffBadge, color: diff > 0 ? 'var(--moss)' : diff < 0 ? 'var(--terracotta)' : 'var(--stone)' }}>
                                {diff > 0 ? `+${diff}` : diff === 0 ? '=' : diff}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </>
                )}
              </Card>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

const s = {
  intro: {
    background: 'linear-gradient(135deg, var(--forest) 0%, #2e3c2d 100%)',
    borderRadius: 'var(--r-xl)', padding: 'var(--s8)',
  },
  introTitle:  { fontFamily: 'var(--serif)', fontSize: 'var(--tx-3xl)', fontWeight: 300, color: 'var(--white)', marginBottom: 'var(--s3)' },
  introMsg:    { fontSize: 'var(--tx-sm)', color: 'rgba(245,240,232,.75)', lineHeight: 1.7, maxWidth: 560 },
  savedBadge:  { fontSize: 'var(--tx-xs)', color: 'var(--sage)', marginTop: 'var(--s4)', fontWeight: 500 },
  twoCol:      { display: 'flex', gap: 'var(--s5)', flexWrap: 'wrap', alignItems: 'flex-start' },
  chartLabel:  { fontSize: 'var(--tx-xs)', color: 'var(--stone)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 'var(--s4)' },
  btn:         { marginTop: 'var(--s6)', padding: '12px 28px', background: 'var(--terracotta)', color: 'var(--white)', border: 'none', borderRadius: 'var(--r-sm)', fontSize: 'var(--tx-sm)', fontWeight: 600, cursor: 'pointer', alignSelf: 'flex-start', letterSpacing: '.02em' },
  error:       { fontSize: 'var(--tx-sm)', color: 'var(--terracotta)', marginTop: 'var(--s3)' },
  diffRow:     { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--s3)' },
  diffLabel:   { fontSize: 'var(--tx-xs)', color: 'var(--earth)', flex: 1, lineHeight: 1.3 },
  diffScores:  { display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 },
  diffInitial: { fontFamily: 'var(--serif)', fontSize: 'var(--tx-lg)', color: 'var(--stone)', fontWeight: 300 },
  diffArrow:   { fontSize: 10, color: 'var(--stone)' },
  diffFinal:   { fontFamily: 'var(--serif)', fontSize: 'var(--tx-lg)', color: 'var(--forest)', fontWeight: 300 },
  diffBadge:   { fontSize: 11, fontWeight: 700, minWidth: 24, textAlign: 'right' },
  lockedBox:   { background: 'var(--white)', borderRadius: 'var(--r-md)', padding: 'var(--s10)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--s4)', textAlign: 'center', maxWidth: 480 },
  lockMsg:     { fontSize: 'var(--tx-md)', color: 'var(--forest)', fontWeight: 500 },
  lockSub:     { fontSize: 'var(--tx-sm)', color: 'var(--stone)' },
}
