import { useState, useEffect } from 'react'
import { useAuth }             from '../../contexts/AuthContext.jsx'
import { IS_MOCK, fetchIntakeResponses } from '../../lib/supabase.js'
import Sidebar   from '../../components/Sidebar.jsx'
import Topbar    from '../../components/Topbar.jsx'
import Card      from '../../components/Card.jsx'
import RadarChart, { ROUE_KEYS, ROUE_FULL, DEF_ROUE } from '../../components/RadarChart.jsx'

const MOCK_ROUE = {
  corps_mouvement: 4, energie_vitalite: 6, emotions: 5, relations: 7,
  vie_pro: 6, environnement: 8, rapport_soi: 4, sommeil_recuperation: 5,
}

export default function RoueDeLaVie() {
  const { user, profile } = useAuth()
  const [roue,    setRoue]    = useState(null)
  const [roueFin, setRoueFin] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    if (IS_MOCK) {
      setRoue(MOCK_ROUE)
      setLoading(false)
      return
    }
    fetchIntakeResponses(user.id)
      .then(rep => {
        if (rep?.roue_de_vie) setRoue(rep.roue_de_vie)
        if (rep?.roue_de_vie_finale) setRoueFin(rep.roue_de_vie_finale)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user])

  const currentWeek = Math.ceil((profile?.current_day ?? 1) / 7)
  const roueData    = roue ?? DEF_ROUE

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
        <Topbar title="Ma Roue de la Vie" subtitle="Ton profil de départ · Semaine 1" />
        <div className="shell-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s6)' }}>

          {/* Intro */}
          <div style={s.intro}>
            <h2 style={s.introTitle}>🌀 Ta Roue de la Vie</h2>
            <p style={s.introMsg}>
              Cet outil te permet de visualiser comment tu te sens dans les différentes sphères de ta vie.
              Tu l'as rempli au début de ton programme — on le refait à la fin pour mesurer ton évolution.
            </p>
          </div>

          {/* Radar chart + tableau */}
          <div style={s.twoCol}>
            {/* Chart initial */}
            <Card style={{ flex: '1 1 300px' }}>
              <p style={s.chartLabel}>Début du programme</p>
              <div style={{ background: 'var(--cream)', borderRadius: 'var(--r-lg)', padding: 'var(--s5)' }}>
                <RadarChart values={roueData} />
              </div>
            </Card>

            {/* Chart final — affiché seulement si semaine 8 et données disponibles */}
            {(currentWeek >= 8 && roueFin) ? (
              <Card style={{ flex: '1 1 300px' }}>
                <p style={s.chartLabel}>Fin du programme ✦</p>
                <div style={{ background: 'var(--cream)', borderRadius: 'var(--r-lg)', padding: 'var(--s5)' }}>
                  <RadarChart values={roueFin} />
                </div>
              </Card>
            ) : currentWeek >= 8 ? (
              <Card style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--s4)', minHeight: 280 }}>
                <p style={{ fontFamily: 'var(--serif)', fontSize: 'var(--tx-lg)', color: 'var(--stone)', textAlign: 'center' }}>
                  🌿 Roue de fin de programme
                </p>
                <p style={{ fontSize: 'var(--tx-sm)', color: 'var(--stone)', textAlign: 'center' }}>
                  Ton bilan de fin de programme permettra de remplir ta roue finale.
                </p>
              </Card>
            ) : null}
          </div>

          {/* Valeurs en liste */}
          <Card title="Tes 8 domaines en détail">
            <div style={s.valuesList}>
              {ROUE_KEYS.map((key, i) => {
                const val    = roueData[key] ?? 5
                const valFin = roueFin?.[key]
                const diff   = valFin != null ? valFin - val : null
                return (
                  <div key={key} style={s.valueRow}>
                    <div style={{ flex: 1 }}>
                      <p style={s.valueName}>{ROUE_FULL[i]}</p>
                      <div style={s.barWrap}>
                        <div style={{ ...s.barFill, width: `${val * 10}%` }} />
                      </div>
                    </div>
                    <div style={s.scores}>
                      <span style={s.scoreNum}>{val}<span style={s.scoreDen}>/10</span></span>
                      {diff != null && (
                        <span style={{ ...s.diff, color: diff > 0 ? 'var(--moss)' : diff < 0 ? 'var(--terracotta)' : 'var(--stone)' }}>
                          {diff > 0 ? `+${diff}` : diff}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Message de fin si semaine < 8 */}
          {currentWeek < 8 && (
            <div style={s.futureCard}>
              <p style={s.futureTitle}>🌱 Rendez-vous à la semaine 8</p>
              <p style={s.futureMsg}>
                Tu referas cet exercice à la fin des 8 semaines pour voir ton évolution.
                Les deux roues s'afficheront côte à côte pour mesurer ton chemin.
              </p>
            </div>
          )}

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
  introTitle: { fontFamily: 'var(--serif)', fontSize: 'var(--tx-3xl)', fontWeight: 300, color: 'var(--white)', marginBottom: 'var(--s3)' },
  introMsg: { fontSize: 'var(--tx-sm)', color: 'rgba(245,240,232,.75)', lineHeight: 1.7, maxWidth: 560 },
  twoCol: { display: 'flex', gap: 'var(--s5)', flexWrap: 'wrap' },
  chartLabel: { fontSize: 'var(--tx-xs)', color: 'var(--stone)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 'var(--s4)' },
  valuesList: { display: 'flex', flexDirection: 'column', gap: 'var(--s4)', marginTop: 'var(--s3)' },
  valueRow: { display: 'flex', alignItems: 'center', gap: 'var(--s5)' },
  valueName: { fontSize: 'var(--tx-sm)', fontWeight: 500, color: 'var(--earth)', marginBottom: 6 },
  barWrap: { height: 6, background: 'var(--sand)', borderRadius: 99, overflow: 'hidden' },
  barFill: { height: '100%', background: 'var(--forest)', borderRadius: 99, transition: 'width .5s ease' },
  scores: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, minWidth: 52 },
  scoreNum: { fontFamily: 'var(--serif)', fontSize: 'var(--tx-xl)', fontWeight: 300, color: 'var(--earth)', lineHeight: 1 },
  scoreDen: { fontSize: 'var(--tx-xs)', color: 'var(--stone)' },
  diff: { fontSize: 'var(--tx-xs)', fontWeight: 600 },
  futureCard: {
    background: 'var(--sand)', border: '1px solid rgba(196,181,160,.4)',
    borderRadius: 'var(--r-lg)', padding: 'var(--s7)',
    textAlign: 'center',
  },
  futureTitle: { fontFamily: 'var(--serif)', fontSize: 'var(--tx-xl)', fontWeight: 400, color: 'var(--earth)', marginBottom: 'var(--s3)' },
  futureMsg: { fontSize: 'var(--tx-sm)', color: 'var(--bark)', lineHeight: 1.7, maxWidth: 460, margin: '0 auto' },
}
