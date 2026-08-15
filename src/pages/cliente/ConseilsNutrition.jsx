import { useState, useEffect } from 'react'
import { useAuth }             from '../../contexts/AuthContext.jsx'
import { IS_MOCK, fetchAiProgramme } from '../../lib/supabase.js'
import Sidebar   from '../../components/Sidebar.jsx'
import Topbar    from '../../components/Topbar.jsx'
import Card      from '../../components/Card.jsx'
import LysaQuote from '../../components/LysaQuote.jsx'

export default function ConseilsNutrition() {
  const { user } = useAuth()
  const [nutrition, setNutrition] = useState(null)
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    if (!user) return
    if (IS_MOCK) { setLoading(false); return }
    fetchAiProgramme(user.id)
      .then(prog => {
        if (prog?.statut === 'publie' && prog?.conseils_nutrition) {
          setNutrition(prog.conseils_nutrition)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user])

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

  return (
    <div className="shell">
      <Sidebar />
      <div className="shell-main">
        <Topbar title="Mes conseils nutrition" subtitle="Orientations personnalisées par Lysa" />
        <div className="shell-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s6)' }}>

          {/* Disclaimer */}
          <div style={s.disclaimer}>
            <p style={s.disclaimerText}>
              Ces conseils sont des orientations générales et ne remplacent pas l'avis d'un professionnel de santé ou d'une diététicienne.
            </p>
          </div>

          {!nutrition ? (
            <div style={s.emptyCard}>
              <p style={s.emptyEmoji}>🌿</p>
              <p style={s.emptyTitle}>Tes conseils nutrition arrivent avec ton programme.</p>
              <p style={s.emptyMsg}>Dès que Lysa aura publié ton programme, tes orientations nutritionnelles personnalisées apparaîtront ici.</p>
            </div>
          ) : (
            <>
              {/* Grands principes */}
              <Card title="Mes grands principes">
                <div style={s.principlesList}>
                  {(nutrition.principes ?? []).map((p, i) => (
                    <div key={i} style={s.principleRow}>
                      <span style={s.bullet}>✦</span>
                      <p style={s.principleText}>{p}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Exemples de repas */}
              <div>
                <p style={s.sectionTitle}>Exemples de repas</p>
                <div style={s.mealGrid}>
                  {[
                    { key: 'petit_dejeuner', label: 'Petit-déjeuner', emoji: '☀️' },
                    { key: 'dejeuner',       label: 'Déjeuner',       emoji: '🥗' },
                    { key: 'diner',          label: 'Dîner',          emoji: '🌙' },
                    { key: 'collation',      label: 'Collation',      emoji: '🍎' },
                  ].map(({ key, label, emoji }) => (
                    <Card key={key} style={{ flex: '1 1 220px' }}>
                      <p style={s.mealEmoji}>{emoji}</p>
                      <p style={s.mealLabel}>{label}</p>
                      <p style={s.mealText}>{nutrition.repas_type?.[key] ?? '—'}</p>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Ce que j'évite */}
              {(nutrition.a_eviter ?? []).length > 0 && (
                <Card title="Ce que j'évite">
                  <div style={s.avoidList}>
                    {nutrition.a_eviter.map((item, i) => (
                      <div key={i} style={s.avoidRow}>
                        <span style={s.avoidDot} />
                        <p style={s.avoidText}>{item}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Message Lysa */}
              {nutrition.message_lysa && (
                <LysaQuote quote={nutrition.message_lysa} />
              )}
            </>
          )}

        </div>
      </div>
    </div>
  )
}

const s = {
  disclaimer: {
    background: 'var(--sand)', border: '1px solid rgba(196,181,160,.4)',
    borderRadius: 'var(--r-md)', padding: 'var(--s4) var(--s5)',
  },
  disclaimerText: {
    fontSize: 'var(--tx-xs)', color: 'var(--bark)', fontStyle: 'italic', lineHeight: 1.6,
  },
  emptyCard: {
    background: 'var(--white)', border: '1px solid var(--sand)',
    borderRadius: 'var(--r-lg)', padding: 'var(--s10)',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: 'var(--s3)', textAlign: 'center',
  },
  emptyEmoji: { fontSize: 40, lineHeight: 1 },
  emptyTitle: {
    fontFamily: 'var(--serif)', fontSize: 'var(--tx-xl)', fontWeight: 400, color: 'var(--earth)',
  },
  emptyMsg: { fontSize: 'var(--tx-sm)', color: 'var(--stone)', lineHeight: 1.7, maxWidth: 380 },
  principlesList: { display: 'flex', flexDirection: 'column', gap: 'var(--s3)', marginTop: 'var(--s2)' },
  principleRow: { display: 'flex', gap: 'var(--s3)', alignItems: 'flex-start' },
  bullet: { color: 'var(--forest)', fontSize: 'var(--tx-sm)', flexShrink: 0, marginTop: 2 },
  principleText: { fontSize: 'var(--tx-sm)', color: 'var(--bark)', lineHeight: 1.65 },
  sectionTitle: {
    fontSize: 'var(--tx-xs)', color: 'var(--stone)', letterSpacing: '.1em',
    textTransform: 'uppercase', marginBottom: 'var(--s4)', fontWeight: 600,
  },
  mealGrid: { display: 'flex', gap: 'var(--s4)', flexWrap: 'wrap' },
  mealEmoji: { fontSize: 24, marginBottom: 'var(--s2)' },
  mealLabel: {
    fontSize: 'var(--tx-xs)', color: 'var(--stone)', textTransform: 'uppercase',
    letterSpacing: '.08em', fontWeight: 600, marginBottom: 'var(--s2)',
  },
  mealText: { fontSize: 'var(--tx-sm)', color: 'var(--bark)', lineHeight: 1.65 },
  avoidList: { display: 'flex', flexDirection: 'column', gap: 'var(--s3)', marginTop: 'var(--s2)' },
  avoidRow: { display: 'flex', gap: 'var(--s3)', alignItems: 'flex-start' },
  avoidDot: {
    width: 6, height: 6, borderRadius: '50%', background: 'var(--terracotta)',
    flexShrink: 0, marginTop: 6,
  },
  avoidText: { fontSize: 'var(--tx-sm)', color: 'var(--bark)', lineHeight: 1.65 },
}
