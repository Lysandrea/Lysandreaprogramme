import { useState, useEffect } from 'react'
import { useAuth }             from '../../contexts/AuthContext.jsx'
import { IS_MOCK, fetchBilans } from '../../lib/supabase.js'
import Sidebar from '../../components/Sidebar.jsx'
import Topbar  from '../../components/Topbar.jsx'

const CORPS_EMOJIS = ['😫', '😕', '😐', '🙂', '💪']

const QUESTIONS_LABELS = {
  gratitude: "5 choses pour lesquelles je suis reconnaissante aujourd'hui",
  lecon:     'Une leçon que je retiens de cette journée',
  emotion:   "Une émotion que j'ai traversée aujourd'hui",
  lacher:    'Ce que je veux lâcher avant de dormir',
}

function formatDate(dateStr) {
  if (!dateStr) return null
  try {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric',
    }).format(new Date(dateStr))
  } catch {
    return null
  }
}

export default function MesBilans() {
  const { user } = useAuth()
  const [bilans,   setBilans]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [openId,   setOpenId]   = useState(null)

  useEffect(() => {
    if (!user || IS_MOCK) { setLoading(false); return }
    fetchBilans(user.id)
      .then(setBilans)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user])

  return (
    <div className="shell">
      <Sidebar />
      <div className="shell-main">
        <Topbar title="Mes bilans" subtitle="Ton carnet de bord personnel ✦" />
        <div className="shell-body" style={s.page}>
          <h1 style={s.heading}>Mon carnet</h1>
          <p style={s.intro}>Retrouve ici chaque soir que tu t'es accordé.</p>

          {loading && (
            <p style={s.muted}>Chargement…</p>
          )}

          {!loading && bilans.length === 0 && (
            <div style={s.empty}>
              <p style={s.emptyText}>
                Ton carnet est encore vide. Il se remplira au fil de tes journées. 🌿
              </p>
            </div>
          )}

          {!loading && bilans.length > 0 && (
            <div style={s.list}>
              {bilans.map(bilan => {
                const isOpen   = openId === bilan.id
                const corpsIdx = bilan.corps
                const corpsEmoji = (corpsIdx != null && CORPS_EMOJIS[corpsIdx]) ? CORPS_EMOJIS[corpsIdx] : null
                const dateLabel = formatDate(bilan.created_at)

                return (
                  <div key={bilan.id} style={s.entry}>
                    <button
                      onClick={() => setOpenId(isOpen ? null : bilan.id)}
                      style={{ ...s.rowBtn, ...(isOpen ? s.rowBtnOpen : {}) }}
                    >
                      <span style={s.jourLabel}>
                        Jour {bilan.jour_num}
                        {dateLabel && <span style={s.dateLabel}> — {dateLabel}</span>}
                      </span>
                      <span style={s.rowRight}>
                        {corpsEmoji && <span style={s.moodEmoji}>{corpsEmoji}</span>}
                        <span style={s.chevron}>{isOpen ? '↑' : '↓'}</span>
                      </span>
                    </button>

                    {isOpen && (
                      <div style={s.content}>
                        {/* Séance */}
                        <div style={s.block}>
                          <p style={s.blockLabel}>Ma séance</p>
                          <p style={s.blockValue}>
                            {bilan.seance_faite_bilan
                              ? '✅ Séance faite'
                              : '💛 Séance non faite'}
                          </p>
                          {!bilan.seance_faite_bilan && bilan.raison_non_seance && (
                            <p style={s.blockQuote}>{bilan.raison_non_seance}</p>
                          )}
                        </div>

                        <div style={s.divider} />

                        {/* 5 questions fixes */}
                        {Object.entries(QUESTIONS_LABELS).map(([key, label]) => (
                          bilan[key] != null && bilan[key] !== '' && (
                            <div key={key} style={s.block}>
                              <p style={s.blockLabel}>{label}</p>
                              <p style={s.blockAnswer}>{bilan[key]}</p>
                            </div>
                          )
                        ))}

                        {/* Corps (emoji) */}
                        {corpsEmoji && (
                          <div style={s.block}>
                            <p style={s.blockLabel}>Comment mon corps s'est senti</p>
                            <p style={s.blockAnswer}>
                              {corpsEmoji} {CORPS_LABELS[corpsIdx] ?? ''}
                            </p>
                          </div>
                        )}

                        {/* Questions personnalisées */}
                        {Array.isArray(bilan.reponses_personnalisees) && bilan.reponses_personnalisees.length > 0 && (
                          <>
                            <div style={s.divider} />
                            <p style={s.sectionMini}>Questions de Lysa pour toi</p>
                            {bilan.reponses_personnalisees.map((rp, i) => (
                              rp.reponse && (
                                <div key={i} style={s.block}>
                                  <p style={s.blockLabel}>{rp.question}</p>
                                  <p style={s.blockAnswer}>{rp.reponse}</p>
                                </div>
                              )
                            ))}
                          </>
                        )}

                        {/* Réponse coach */}
                        {bilan.reponse_coach && (
                          <>
                            <div style={s.divider} />
                            <div style={s.coachBlock}>
                              <p style={s.coachLabel}>✦ Réponse de Lysa</p>
                              <p style={s.coachAnswer}>{bilan.reponse_coach}</p>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const CORPS_LABELS = ['Épuisée', 'Difficile', 'Neutre', 'Bien', 'Au top !']

const s = {
  page:    { padding: 'var(--s8) var(--s6)', maxWidth: 720 },
  heading: { fontFamily: 'var(--serif)', fontSize: 'var(--tx-3xl)', fontWeight: 400, color: 'var(--earth)', marginBottom: 'var(--s2)' },
  intro:   { fontSize: 'var(--tx-sm)', color: 'var(--stone)', marginBottom: 'var(--s8)', fontStyle: 'italic' },
  muted:   { fontSize: 'var(--tx-sm)', color: 'var(--stone)' },

  empty: {
    background: 'var(--cream)', border: '1px solid var(--sand)',
    borderRadius: 'var(--r-lg)', padding: 'var(--s10)',
    textAlign: 'center',
  },
  emptyText: {
    fontFamily: 'var(--serif)', fontSize: 'var(--tx-xl)',
    fontWeight: 300, color: 'var(--bark)', lineHeight: 1.7, margin: 0,
  },

  list: { display: 'flex', flexDirection: 'column', gap: 'var(--s3)' },

  entry: { display: 'flex', flexDirection: 'column' },

  rowBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    background: 'var(--white)', border: '1px solid var(--sand)',
    borderRadius: 'var(--r-md)', padding: 'var(--s4) var(--s5)',
    cursor: 'pointer', width: '100%', textAlign: 'left',
    transition: 'background 120ms ease',
    borderLeft: '3px solid var(--sand)',
  },
  rowBtnOpen: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    background: '#FAF5EE', border: '1px solid var(--sand)',
    borderBottom: 'none', borderRadius: 'var(--r-md) var(--r-md) 0 0',
    padding: 'var(--s4) var(--s5)',
    cursor: 'pointer', width: '100%', textAlign: 'left',
    borderLeft: '3px solid var(--terracotta)',
  },

  jourLabel: {
    fontFamily: 'var(--serif)', fontSize: 'var(--tx-lg)',
    fontWeight: 400, color: 'var(--earth)', lineHeight: 1.3,
  },
  dateLabel: {
    color: 'var(--bark)', fontWeight: 300,
  },
  rowRight: { display: 'flex', alignItems: 'center', gap: 'var(--s3)', flexShrink: 0 },
  moodEmoji:  { fontSize: '1.2rem', lineHeight: 1 },
  chevron:    { fontSize: 'var(--tx-xs)', color: 'var(--stone)', userSelect: 'none', width: 16, textAlign: 'center' },

  content: {
    background: '#FAF5EE',
    border: '1px solid var(--sand)', borderTop: 'none',
    borderRadius: '0 0 var(--r-md) var(--r-md)',
    borderLeft: '3px solid var(--terracotta)',
    padding: 'var(--s6)',
    display: 'flex', flexDirection: 'column', gap: 'var(--s5)',
  },

  block:      { display: 'flex', flexDirection: 'column', gap: 6 },
  blockLabel: {
    fontSize: 'var(--tx-xs)', color: 'var(--stone)',
    textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 600, margin: 0,
  },
  blockValue: {
    fontSize: 'var(--tx-sm)', color: 'var(--earth)', margin: 0,
  },
  blockQuote: {
    fontFamily: 'var(--serif)', fontStyle: 'italic',
    fontSize: 'var(--tx-sm)', color: 'var(--bark)',
    lineHeight: 1.8, margin: 0,
    paddingLeft: 'var(--s4)',
    borderLeft: '2px solid var(--sand)',
  },
  blockAnswer: {
    fontFamily: 'var(--serif)', fontSize: 'var(--tx-base)',
    color: 'var(--earth)', lineHeight: 1.85, margin: 0, whiteSpace: 'pre-wrap',
  },

  divider: { height: 1, background: 'var(--sand)', margin: '0 calc(-1 * var(--s6))' },
  sectionMini: {
    fontSize: 'var(--tx-xs)', color: 'var(--stone)',
    textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 600, margin: 0,
  },

  coachBlock: {
    background: 'var(--forest)', borderRadius: 'var(--r-md)',
    padding: 'var(--s5) var(--s6)',
    display: 'flex', flexDirection: 'column', gap: 'var(--s3)',
  },
  coachLabel:  { fontSize: 'var(--tx-xs)', color: 'var(--sage)', letterSpacing: '.1em', textTransform: 'uppercase', margin: 0 },
  coachAnswer: {
    fontFamily: 'var(--serif)', fontSize: 'var(--tx-base)',
    color: 'var(--white)', lineHeight: 1.85, margin: 0, whiteSpace: 'pre-wrap',
  },
}
