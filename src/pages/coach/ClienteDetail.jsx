import { useState, useEffect }                    from 'react'
import { useParams, useNavigate, useLocation }    from 'react-router-dom'
import {
  IS_MOCK, fetchClienteProfile, fetchJours, fetchBilans,
  desbloquerSemaine, fetchIntakeResponses, saveReponseCoach,
  fetchAiProgramme, publishAiProgramme,
} from '../../lib/supabase.js'
import Sidebar   from '../../components/Sidebar.jsx'
import Topbar    from '../../components/Topbar.jsx'
import Card      from '../../components/Card.jsx'
import Badge     from '../../components/Badge.jsx'
import Button    from '../../components/Button.jsx'
import RadarChart, { ROUE_FULL, ROUE_KEYS, DEF_ROUE } from '../../components/RadarChart.jsx'
import { MOCK_CLIENTES, MOCK_DAYS, MOCK_BILANS } from '../../lib/mockData.js'

const BODY_EMOJIS = ['😫', '😕', '😐', '🙂', '💪']

export default function ClienteDetail() {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const { state: navState } = useLocation()

  const [tab,           setTab]           = useState(navState?.tab ?? 'progression')
  const [cliente,       setCliente]       = useState(null)
  const [jours,         setJours]         = useState([])
  const [bilans,        setBilans]        = useState([])
  const [intake,        setIntake]        = useState(null)
  const [aiProgramme,   setAiProgramme]   = useState(null)
  const [loading,       setLoading]       = useState(true)
  const [unlocking,     setUnlocking]     = useState(false)
  const [unlocked,      setUnlocked]      = useState(false)

  useEffect(() => {
    if (IS_MOCK) {
      const c = MOCK_CLIENTES.find(c => c.id === id)
      setCliente(c ?? null)
      setBilans(MOCK_BILANS)
      setLoading(false)
      return
    }
    Promise.all([
      fetchClienteProfile(id),
      fetchJours(id),
      fetchBilans(id),
      fetchIntakeResponses(id),
      fetchAiProgramme(id),
    ])
      .then(([prof, j, b, rep, ai]) => {
        setCliente(prof)
        setJours(j)
        setBilans(b)
        setIntake(rep ?? {})
        setAiProgramme(ai)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  async function handleUnlock() {
    if (!cliente) return
    setUnlocking(true)
    try {
      if (!IS_MOCK) {
        const nextDay = await desbloquerSemaine(id, cliente.current_day ?? 1)
        setCliente(prev => ({ ...prev, current_day: nextDay }))
      }
      setUnlocked(true)
      setTimeout(() => setUnlocked(false), 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setUnlocking(false)
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

  if (!cliente) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 'var(--s4)', background: 'var(--cream)' }}>
        <p style={{ fontFamily: 'var(--serif)', fontSize: 'var(--tx-xl)', color: 'var(--stone)' }}>Cliente introuvable.</p>
        <Button variant="ghost" onClick={() => navigate('/coach')}>← Retour</Button>
      </div>
    )
  }

  const currentDay     = cliente.current_day ?? cliente.jourActuel ?? 1
  const currentSemaine = Math.ceil(currentDay / 7)
  const progress       = Math.round((currentDay / 56) * 100)

  return (
    <div className="shell">
      <Sidebar />
      <div className="shell-main">
        <Topbar
          title={`${cliente.prenom} ${cliente.nom ?? ''}`}
          subtitle={`Jour ${currentDay}/56 · Semaine ${currentSemaine}/8`}
        />
        <div className="shell-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s6)' }}>

          <Button variant="ghost" size="sm" onClick={() => navigate('/coach')} style={{ alignSelf: 'flex-start' }}>
            ← Toutes les clientes
          </Button>

          {/* Header */}
          <Card>
            <div style={s.header}>
              <div style={s.bigAvatar}>{(cliente.prenom?.[0] ?? '?')}{(cliente.nom?.[0] ?? '')}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s3)', marginBottom: 'var(--s2)', flexWrap: 'wrap' }}>
                  <h2 style={s.name}>{cliente.prenom} {cliente.nom}</h2>
                  <Badge variant={cliente.status ?? 'active'} />
                </div>
                <p style={{ fontSize: 'var(--tx-sm)', color: 'var(--stone)', marginBottom: 'var(--s4)' }}>{cliente.email}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s4)', flexWrap: 'wrap' }}>
                  <div style={s.progressWrap}>
                    <div style={{ ...s.progressFill, width: `${progress}%` }} />
                  </div>
                  <span style={{ fontSize: 'var(--tx-sm)', color: 'var(--bark)', whiteSpace: 'nowrap' }}>
                    {progress}% — J{currentDay}/56
                  </span>
                </div>
              </div>
              {/* Bouton débloquer */}
              <Button
                variant={unlocked ? 'sage' : 'secondary'}
                size="sm"
                loading={unlocking}
                onClick={handleUnlock}
                style={{ alignSelf: 'flex-start', flexShrink: 0 }}
              >
                {unlocked ? 'Semaine débloquée ✓' : 'Débloquer la semaine suivante →'}
              </Button>
            </div>
          </Card>

          {/* Stats */}
          <div style={s.statsGrid}>
            {[
              { label: 'Jour actuel',      val: `J${currentDay}` },
              { label: 'Semaine',          val: `${currentSemaine}/8` },
              { label: 'Bilans complétés', val: bilans.length },
              {
                label: 'Rejoint le',
                val: cliente.programme_start_date ?? cliente.joinDate
                  ? new Date(cliente.programme_start_date ?? cliente.joinDate)
                      .toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
                  : '—',
              },
            ].map(({ label, val }) => (
              <div key={label} style={s.statCard}>
                <span style={s.statVal}>{val}</span>
                <span style={s.statLabel}>{label}</span>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={s.tabs}>
            {[['progression', '📋 Progression'], ['questionnaire', '📝 Questionnaire'], ['bilans', '💬 Bilans'], ['programme_ia', '🤖 Programme IA']].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                style={{ ...s.tabBtn, ...(tab === key ? s.tabBtnActive : {}) }}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === 'progression' && (
            <>
              {/* Grille jours (lecture seule) */}
              <Card title="Progression du programme">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 'var(--s3)' }}>
                  {MOCK_DAYS.map(day => {
                    const jourDone = IS_MOCK
                      ? day.jour < currentDay
                      : jours.some(j => j.jour_num === day.jour && j.seance_faite)
                    const isCurrent = day.jour === currentDay
                    return (
                      <div key={day.jour} title={`J${day.jour} — ${day.titre}`} style={{
                        width: 30, height: 30, borderRadius: 6,
                        background: isCurrent ? 'var(--terracotta)' : jourDone ? 'var(--sage)' : 'var(--sand)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 9, fontWeight: 600,
                        color: (jourDone || isCurrent) ? 'var(--white)' : 'var(--stone)',
                      }}>
                        {day.jour}
                      </div>
                    )
                  })}
                </div>
              </Card>

              {/* Bilans récents (5 derniers) */}
              <Card title="Bilans récents">
                {bilans.length === 0 ? (
                  <p style={{ fontSize: 'var(--tx-sm)', color: 'var(--stone)' }}>Aucun bilan pour l'instant.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s4)' }}>
                    {bilans.slice(0, 5).map(b => <BilanCard key={`${b.jour_num ?? b.jour}`} b={b} />)}
                  </div>
                )}
              </Card>
            </>
          )}

          {tab === 'questionnaire' && (
            <QuestionnaireTab intake={intake} />
          )}

          {tab === 'programme_ia' && (
            <ProgrammeIATab
              aiProgramme={aiProgramme}
              onPublished={updated => setAiProgramme(updated)}
            />
          )}

          {tab === 'bilans' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s4)' }}>
              {bilans.length === 0 ? (
                <div style={{ background: 'var(--sand)', borderRadius: 'var(--r-lg)', padding: 'var(--s8)', textAlign: 'center' }}>
                  <p style={{ fontFamily: 'var(--serif)', fontSize: 'var(--tx-lg)', color: 'var(--stone)' }}>
                    Aucun bilan soumis pour l'instant.
                  </p>
                </div>
              ) : (
                bilans.map(b => <BilanCoachCard key={b.id ?? `${b.jour_num ?? b.jour}`} b={b} />)
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Read-only helpers ── */
function QRow({ label, value }) {
  if (!value && value !== 0) return null
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingBottom: 12, borderBottom: '1px solid var(--sand)' }}>
      <span style={{ fontSize: 'var(--tx-xs)', fontWeight: 600, color: 'var(--stone)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
        {label}
      </span>
      <span style={{ fontSize: 'var(--tx-sm)', color: 'var(--earth)', lineHeight: 1.6 }}>{value}</span>
    </div>
  )
}

function Pills({ values = [], all = [] }) {
  if (!values.length) return null
  const labels = all.filter(o => values.includes(o.value)).map(o => o.label)
  if (!labels.length) return null
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {labels.map(l => (
        <span key={l} style={{ padding: '4px 12px', borderRadius: 99, background: 'rgba(61,79,60,.1)', border: '1px solid rgba(61,79,60,.3)', fontSize: 'var(--tx-xs)', color: 'var(--forest)', fontWeight: 500 }}>
          {l}
        </span>
      ))}
    </div>
  )
}

function RadioBadge({ value, options = [] }) {
  const opt = options.find(o => o.value === value)
  if (!opt) return null
  return (
    <span style={{ padding: '4px 12px', borderRadius: 99, background: 'rgba(61,79,60,.1)', border: '1px solid rgba(61,79,60,.3)', fontSize: 'var(--tx-xs)', color: 'var(--forest)', fontWeight: 500 }}>
      {opt.label}
    </span>
  )
}

const OBJ_OPTS = [
  { value: 'reconciliation',  label: 'Se réconcilier avec le corps' },
  { value: 'confiance',        label: 'Reprendre confiance via le sport' },
  { value: 'quotidien',        label: 'Se sentir mieux au quotidien' },
  { value: 'emotions',         label: 'Travailler les émotions' },
  { value: 'reprise',          label: 'Reprendre après une pause' },
  { value: 'relation_saine',   label: 'Relation saine avec le sport' },
  { value: 'competition',      label: 'Préparer une compétition' },
  { value: 'autre',            label: 'Autre' },
]
const NIVEAU_OPTS = [
  { value: 'debutante',     label: 'Débutante' },
  { value: 'intermediaire', label: 'Intermédiaire (6 mois–2 ans)' },
  { value: 'confirmee',     label: '2 ans et +' },
  { value: 'intermittente', label: 'Intermittente' },
]
const FREQ_OPTS = [
  { value: '2x', label: '2x/sem' }, { value: '3x', label: '3x/sem' },
  { value: '4x', label: '4x/sem' }, { value: '5x_plus', label: '5x+' },
  { value: 'variable', label: 'Variable' },
]
const LIEUX_OPTS = [
  { value: 'salle', label: 'Salle' }, { value: 'maison', label: 'À la maison' },
  { value: 'exterieur', label: 'Extérieur' }, { value: 'crossfit', label: 'CrossFit' },
  { value: 'mixte', label: 'Mixte' },
]
const CONTRACEPTION_OPTS = [
  { value: 'non', label: 'Non' }, { value: 'pilule', label: 'Pilule' },
  { value: 'diu_hormonal', label: 'DIU hormonal' }, { value: 'implant', label: 'Implant' },
  { value: 'autre', label: 'Autre' },
]
const DIAGNOSTIC_OPTS = [
  { value: 'rien', label: 'Rien' }, { value: 'sopk', label: 'SOPK' },
  { value: 'endometriose', label: 'Endométriose' }, { value: 'amenorrhee', label: 'Aménorrhée' },
  { value: 'autre', label: 'Autre' },
]
const COMMENT_OPTS = [
  { value: 'instagram', label: 'Instagram' }, { value: 'bouche_a_oreille', label: 'Bouche à oreille' },
  { value: 'podcast', label: 'Podcast' }, { value: 'autre', label: 'Autre' },
]

function IntakeSection({ title, children }) {
  return (
    <div style={{ background: 'var(--white)', border: '1px solid var(--sand)', borderRadius: 'var(--r-lg)', padding: 'var(--s6)', boxShadow: '0 1px 4px rgba(0,0,0,.04)' }}>
      <h4 style={{ fontFamily: 'var(--serif)', fontSize: 'var(--tx-lg)', fontWeight: 400, color: 'var(--earth)', marginBottom: 'var(--s5)', paddingBottom: 'var(--s3)', borderBottom: '1px solid var(--sand)' }}>
        {title}
      </h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s4)' }}>
        {children}
      </div>
    </div>
  )
}

function QuestionnaireTab({ intake }) {
  if (!intake || Object.keys(intake).length === 0) {
    return (
      <div style={{ background: 'var(--sand)', borderRadius: 'var(--r-lg)', padding: 'var(--s8)', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--serif)', fontSize: 'var(--tx-lg)', color: 'var(--stone)' }}>
          Questionnaire non rempli.
        </p>
      </div>
    )
  }

  const r = intake

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s5)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s3)' }}>
        <span style={{ fontSize: 'var(--tx-xs)', background: 'rgba(61,79,60,.1)', color: 'var(--forest)', padding: '3px 10px', borderRadius: 99, fontWeight: 600 }}>
          Validé ✓
        </span>
        <span style={{ fontSize: 'var(--tx-xs)', color: 'var(--stone)' }}>Questionnaire d'intake</span>
      </div>

      <IntakeSection title="👤 Qui elle est">
        <QRow label="Prénom / Surnom" value={r.prenom_surnom} />
        <QRow label="Âge" value={r.age} />
        <QRow label="Ville / Pays" value={r.ville_pays} />
        <QRow label="WhatsApp" value={r.whatsapp} />
      </IntakeSection>

      <IntakeSection title="🌟 Ce qui l'a amenée ici">
        <QRow label="Pourquoi maintenant ?" value={r.pourquoi_maintenant} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 'var(--tx-xs)', fontWeight: 600, color: 'var(--stone)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Objectifs</span>
          <Pills values={r.objectifs ?? []} all={OBJ_OPTS} />
          {r.objectifs_autre && <span style={{ fontSize: 'var(--tx-xs)', color: 'var(--stone)', fontStyle: 'italic' }}>{r.objectifs_autre}</span>}
        </div>
        <QRow label="Vision dans 8 semaines" value={r.vision_8_semaines} />
        <QRow label="Ce qui l'a bloquée jusqu'ici" value={r.bloquee_jusquici} />
        <QRow label="Coaching précédent" value={r.coaching_avant === 'oui' ? `Oui — ${r.coaching_avant_detail ?? ''}` : r.coaching_avant === 'non' ? 'Non' : null} />
      </IntakeSection>

      <IntakeSection title="🏃 Rapport au mouvement">
        <QRow label="Représentation du mouvement" value={r.mouvement_representation} />
        <QRow label="Pratique passée" value={r.pratique_passee} />
        <QRow label="Mouvements / lieux évités" value={r.mouvements_evites} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 'var(--tx-xs)', fontWeight: 600, color: 'var(--stone)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Niveau</span>
          <RadioBadge value={r.niveau_pratique} options={NIVEAU_OPTS} />
        </div>
        <div style={{ display: 'flex', gap: 'var(--s4)', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 'var(--tx-xs)', fontWeight: 600, color: 'var(--stone)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Fréquence</span>
            <RadioBadge value={r.frequence_semaine} options={FREQ_OPTS} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 'var(--tx-xs)', fontWeight: 600, color: 'var(--stone)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Durée séance</span>
            <RadioBadge value={r.duree_seance} options={[{ value: '30min', label: '30 min' },{ value: '45min', label: '45 min' },{ value: '1h', label: '1h' },{ value: '1h30', label: '1h30+' }]} />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 'var(--tx-xs)', fontWeight: 600, color: 'var(--stone)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Lieux</span>
          <Pills values={r.lieux_entrainement ?? []} all={LIEUX_OPTS} />
        </div>
        <QRow label="Matériel" value={r.materiel} />
      </IntakeSection>

      <IntakeSection title="🧠 Monde intérieur">
        <QRow label="Relation à son corps" value={r.relation_corps} />
        <QRow label="Histoire avec le corps" value={r.histoire_corps} />
        <QRow label="Craintes" value={r.craintes_programme} />
      </IntakeSection>

      <IntakeSection title="🩺 Santé & corps">
        <QRow label="Douleurs" value={r.douleurs === 'oui' ? `Oui — ${r.douleurs_detail ?? ''}` : r.douleurs === 'non' ? 'Non' : null} />
        <QRow label="Antécédents / blessures" value={r.antecedents} />
        <QRow label="Zones à éviter" value={r.zones_eviter} />
        <QRow label="Sommeil" value={{ tres_bien: 'Très bien', bien: 'Bien', moyen: 'Moyen', mal: 'Mal' }[r.sommeil] ?? r.sommeil} />
        <QRow label="Stress" value={{ faible: 'Faible', modere: 'Modéré', eleve: 'Élevé', tres_eleve: 'Très élevé' }[r.stress] ?? r.stress} />
      </IntakeSection>

      <IntakeSection title="🌙 Cycle hormonal">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 'var(--tx-xs)', fontWeight: 600, color: 'var(--stone)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Contraception</span>
          <RadioBadge value={r.contraception} options={CONTRACEPTION_OPTS} />
          {r.contraception_autre && <span style={{ fontSize: 'var(--tx-xs)', color: 'var(--stone)', fontStyle: 'italic' }}>{r.contraception_autre}</span>}
        </div>
        <QRow label="Régularité du cycle" value={{ regulier: 'Régulier', irregulier: 'Irrégulier', variable: 'Variable', ne_sait_pas: 'Ne sait pas', pas_de_cycle: 'Pas de cycle' }[r.cycle_regularite] ?? r.cycle_regularite} />
        <QRow label="Durée cycle / règles" value={r.duree_cycle && r.duree_regles ? `${r.duree_cycle} / règles ${r.duree_regles}` : r.duree_cycle ?? r.duree_regles ?? null} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 'var(--tx-xs)', fontWeight: 600, color: 'var(--stone)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Diagnostic</span>
          <Pills values={r.diagnostic ?? []} all={DIAGNOSTIC_OPTS} />
          {r.diagnostic_autre && <span style={{ fontSize: 'var(--tx-xs)', color: 'var(--stone)', fontStyle: 'italic' }}>{r.diagnostic_autre}</span>}
        </div>
        <QRow label="Où elle en est dans son cycle" value={r.cycle_actuel} />
      </IntakeSection>

      <IntakeSection title="💬 Pour finir">
        <QRow label="Informations manquantes" value={r.informations_manquantes} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 'var(--tx-xs)', fontWeight: 600, color: 'var(--stone)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Comment elle a connu Lysa</span>
          <Pills values={r.comment_connue ?? []} all={COMMENT_OPTS} />
          {r.comment_connue_autre && <span style={{ fontSize: 'var(--tx-xs)', color: 'var(--stone)', fontStyle: 'italic' }}>{r.comment_connue_autre}</span>}
        </div>
        <QRow label="Questions avant de commencer" value={r.questions_avant} />
      </IntakeSection>

      {/* Roue de la Vie */}
      <div style={{ background: 'var(--white)', border: '1px solid var(--sand)', borderRadius: 'var(--r-lg)', padding: 'var(--s6)', boxShadow: '0 1px 4px rgba(0,0,0,.04)' }}>
        <h4 style={{ fontFamily: 'var(--serif)', fontSize: 'var(--tx-lg)', fontWeight: 400, color: 'var(--earth)', marginBottom: 'var(--s5)', paddingBottom: 'var(--s3)', borderBottom: '1px solid var(--sand)' }}>
          🌀 Roue de la Vie — Début de programme
        </h4>
        <div style={{ display: 'flex', gap: 'var(--s6)', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div style={{ flex: '0 0 auto', background: 'var(--cream)', borderRadius: 'var(--r-lg)', padding: 'var(--s4)' }}>
            <RadarChart values={r.roue_de_vie ?? DEF_ROUE} />
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--s3)', minWidth: 180 }}>
            {ROUE_KEYS.map((key, i) => {
              const val = (r.roue_de_vie ?? DEF_ROUE)[key] ?? 5
              return (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 'var(--s3)' }}>
                  <span style={{ fontSize: 'var(--tx-xs)', color: 'var(--bark)', flex: 1 }}>{ROUE_FULL[i]}</span>
                  <div style={{ width: 80, height: 5, background: 'var(--sand)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ width: `${val * 10}%`, height: '100%', background: 'var(--forest)', borderRadius: 99 }} />
                  </div>
                  <span style={{ fontSize: 'var(--tx-xs)', fontWeight: 600, color: 'var(--earth)', minWidth: 24, textAlign: 'right' }}>{val}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function BilanCoachCard({ b }) {
  const jourNum  = b.jour_num ?? b.jour
  const date     = b.created_at ?? b.date
  const dateStr  = date
    ? new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
    : `Jour ${jourNum}`

  const [draft,     setDraft]     = useState(b.reponse_coach ?? '')
  const [savedResp, setSavedResp] = useState(b.reponse_coach ?? null)
  const [savedAt,   setSavedAt]   = useState(b.reponse_coach_at ?? null)
  const [saving,    setSaving]    = useState(false)
  const [saveError, setSaveError] = useState(null)

  async function handleSave() {
    if (!draft.trim()) return
    if (!b.id) {
      setSaveError('ID du bilan manquant.')
      return
    }
    setSaving(true)
    setSaveError(null)
    try {
      await saveReponseCoach(b.id, draft.trim())
      setSavedResp(draft.trim())
      setSavedAt(new Date().toISOString())
    } catch (err) {
      console.error('[handleSave]', err)
      setSaveError(err.message ?? 'Erreur lors de la sauvegarde.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ background: 'var(--white)', border: '1px solid var(--sand)', borderRadius: 'var(--r-lg)', overflow: 'hidden', boxShadow: 'var(--sh-sm)' }}>
      {/* Header */}
      <div style={{ background: 'var(--cream)', padding: 'var(--s4) var(--s5)', borderBottom: '1px solid var(--sand)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--s3)', flexWrap: 'wrap' }}>
        <div>
          <span style={{ fontSize: 'var(--tx-sm)', fontWeight: 600, color: 'var(--earth)' }}>Jour {jourNum}</span>
          <span style={{ fontSize: 'var(--tx-sm)', color: 'var(--stone)' }}> · {dateStr}</span>
        </div>
        {b.seance_faite_bilan !== undefined && b.seance_faite_bilan !== null && (
          <span style={{
            fontSize: 'var(--tx-xs)', fontWeight: 600, padding: '3px 10px', borderRadius: 99,
            background: b.seance_faite_bilan ? 'rgba(107,127,94,.12)' : 'rgba(192,120,96,.1)',
            color: b.seance_faite_bilan ? 'var(--moss)' : 'var(--terracotta)',
          }}>
            {b.seance_faite_bilan ? 'Séance faite ✓' : 'Séance non faite'}
          </span>
        )}
      </div>

      {/* Réponses */}
      <div style={{ padding: 'var(--s5)', display: 'flex', flexDirection: 'column', gap: 'var(--s3)' }}>
        {!b.seance_faite_bilan && b.raison_non_seance && (
          <QRow label="Raison" value={b.raison_non_seance} />
        )}
        {b.corps !== undefined && b.corps !== null && (
          <QRow
            label="Corps"
            value={`${BODY_EMOJIS[b.corps]}  ${['Épuisé', 'Fatigué', 'Neutre', 'Bien', 'En forme'][b.corps]}`}
          />
        )}
        {[
          { label: 'Gratitude', val: b.gratitude },
          { label: 'Leçon',     val: b.lecon     },
          { label: 'Émotion',   val: b.emotion   },
          { label: 'Lâcher',    val: b.lacher    },
        ].filter(r => r.val).map(({ label, val }) => (
          <QRow key={label} label={label} value={val} />
        ))}

        {/* Questions personnalisées */}
        {Array.isArray(b.reponses_personnalisees) && b.reponses_personnalisees.length > 0 && (
          <div style={{ borderTop: '1px solid var(--sand)', paddingTop: 'var(--s3)', marginTop: 'var(--s1)', display: 'flex', flexDirection: 'column', gap: 'var(--s3)' }}>
            <p style={{ fontSize: 'var(--tx-xs)', fontWeight: 600, color: 'var(--stone)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
              Questions personnalisées
            </p>
            {b.reponses_personnalisees.map((rp, i) => (
              <QRow key={i} label={rp.question} value={rp.reponse} />
            ))}
          </div>
        )}

        {/* Réponse coach */}
        {!IS_MOCK && (
          <div style={{ borderTop: '1px dashed var(--sand)', paddingTop: 'var(--s4)', marginTop: 'var(--s2)' }}>
            <p style={{ fontSize: 'var(--tx-xs)', fontWeight: 600, color: 'var(--stone)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 'var(--s3)' }}>
              Réponse de Lysa
            </p>
            {savedResp ? (
              <div>
                <p style={{ fontSize: 'var(--tx-sm)', color: 'var(--earth)', lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>{savedResp}</p>
                {savedAt && (
                  <p style={{ fontSize: 'var(--tx-xs)', color: 'var(--stone)', marginTop: 'var(--s2)' }}>
                    Envoyé le {new Date(savedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s3)' }}>
                <textarea
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  placeholder="Écris ta réponse pour cette cliente…"
                  rows={3}
                  style={{
                    width: '100%', padding: 'var(--s3) var(--s4)',
                    border: '1px solid var(--sand)', borderRadius: 'var(--r-md)',
                    background: 'var(--cream)', color: 'var(--earth)',
                    fontSize: 'var(--tx-sm)', resize: 'vertical',
                    outline: 'none', transition: 'border-color var(--ease-fast)',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'var(--stone)' }}
                  onBlur={e  => { e.target.style.borderColor = 'var(--sand)' }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s2)' }}>
                  <div>
                    <Button size="sm" variant="secondary" loading={saving} onClick={handleSave} disabled={!draft.trim()}>
                      Envoyer ma réponse →
                    </Button>
                  </div>
                  {saveError && (
                    <p style={{ fontSize: 'var(--tx-xs)', color: 'var(--terracotta)', lineHeight: 1.5 }}>
                      ⚠ {saveError}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function BilanCard({ b }) {
  const jourNum = b.jour_num ?? b.jour
  const date    = b.created_at ?? b.date
  const dateStr = date
    ? new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
    : `Jour ${jourNum}`

  return (
    <div style={{ background: 'var(--cream)', border: '1px solid var(--sand)', borderRadius: 'var(--r-md)', padding: 'var(--s5)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--s4)' }}>
        <div>
          <span style={{ fontSize: 'var(--tx-sm)', fontWeight: 600, color: 'var(--earth)' }}>Jour {jourNum}</span>
          <span style={{ fontSize: 'var(--tx-sm)', color: 'var(--stone)' }}> · {dateStr}</span>
        </div>
        {b.corps !== undefined && b.corps !== null && (
          <span style={{ fontSize: 24 }}>{BODY_EMOJIS[b.corps]}</span>
        )}
      </div>
      {[
        { label: 'Gratitude', val: b.gratitude },
        { label: 'Leçon',    val: b.lecon     },
        { label: 'Émotion',  val: b.emotion   },
        { label: 'Lâcher',   val: b.lacher    },
      ].filter(r => r.val).map(({ label, val }) => (
        <div key={label} style={{ display: 'flex', gap: 'var(--s3)', marginBottom: 6 }}>
          <span style={{ fontSize: 'var(--tx-xs)', fontWeight: 600, color: 'var(--stone)', textTransform: 'uppercase', letterSpacing: '.06em', width: 72, flexShrink: 0 }}>
            {label}
          </span>
          <span style={{ fontSize: 'var(--tx-sm)', color: 'var(--earth)', lineHeight: 1.5 }}>{val}</span>
        </div>
      ))}
    </div>
  )
}

/* ════════════════════════════════════════════════
   Programme IA Tab
   ════════════════════════════════════════════════ */
function ProgrammeIATab({ aiProgramme, onPublished }) {
  const [profil,     setProfil]     = useState(aiProgramme?.profil_resume ?? '')
  const [programme,  setProgramme]  = useState(aiProgramme?.programme ?? [])
  const [questions,  setQuestions]  = useState(aiProgramme?.questions_personnalisees ?? [])
  const [publishing, setPublishing] = useState(false)
  const [pubError,   setPubError]   = useState(null)
  const [expanded,   setExpanded]   = useState({})

  useEffect(() => {
    setProfil(aiProgramme?.profil_resume ?? '')
    setProgramme(aiProgramme?.programme ?? [])
    setQuestions(aiProgramme?.questions_personnalisees ?? [])
  }, [aiProgramme])

  if (!aiProgramme) {
    return (
      <div style={{ background: 'var(--sand)', borderRadius: 'var(--r-lg)', padding: 'var(--s8)', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--serif)', fontSize: 'var(--tx-lg)', color: 'var(--stone)' }}>
          En attente du questionnaire
        </p>
        <p style={{ fontSize: 'var(--tx-sm)', color: 'var(--stone)', marginTop: 'var(--s2)' }}>
          Le programme IA sera généré dès que la cliente aura soumis son questionnaire d'intake.
        </p>
      </div>
    )
  }

  const isPublished = aiProgramme.statut === 'publie'

  async function handlePublish() {
    setPublishing(true)
    setPubError(null)
    try {
      await publishAiProgramme(aiProgramme.id, {
        profil_resume: profil,
        programme,
        questions_personnalisees: questions,
      })
      onPublished({ ...aiProgramme, profil_resume: profil, programme, questions_personnalisees: questions, statut: 'publie', publie_at: new Date().toISOString() })
    } catch (err) {
      setPubError(err.message ?? 'Erreur lors de la publication.')
    } finally {
      setPublishing(false)
    }
  }

  function updateExercice(sIndex, jIndex, eIndex, field, value) {
    setProgramme(prev => {
      const next = JSON.parse(JSON.stringify(prev))
      next[sIndex].jours[jIndex].exercices[eIndex][field] = value
      return next
    })
  }

  function updateJour(sIndex, jIndex, field, value) {
    setProgramme(prev => {
      const next = JSON.parse(JSON.stringify(prev))
      next[sIndex].jours[jIndex][field] = value
      return next
    })
  }

  function updateSemaine(sIndex, field, value) {
    setProgramme(prev => {
      const next = JSON.parse(JSON.stringify(prev))
      next[sIndex][field] = value
      return next
    })
  }

  function updateQuestion(i, field, value) {
    setQuestions(prev => {
      const next = [...prev]
      next[i] = { ...next[i], [field]: value }
      return next
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s5)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--s3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s3)' }}>
          <h3 style={{ fontFamily: 'var(--serif)', fontSize: 'var(--tx-xl)', fontWeight: 400, color: 'var(--earth)' }}>
            🤖 Programme généré par l'IA
          </h3>
          {isPublished && (
            <span style={{ fontSize: 'var(--tx-xs)', padding: '3px 10px', borderRadius: 99, background: 'rgba(107,127,94,.15)', color: 'var(--moss)', fontWeight: 600 }}>
              Publié ✓
            </span>
          )}
        </div>
        {!isPublished && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s2)', alignItems: 'flex-end' }}>
            <Button variant="terracotta" loading={publishing} onClick={handlePublish}>
              Valider et publier sur son profil ✦
            </Button>
            {pubError && <p style={{ fontSize: 'var(--tx-xs)', color: 'var(--terracotta)' }}>⚠ {pubError}</p>}
          </div>
        )}
      </div>

      {/* Profil résumé */}
      <div style={sIA.card}>
        <h4 style={sIA.cardTitle}>🧠 Profil émotionnel</h4>
        {isPublished ? (
          <p style={{ fontSize: 'var(--tx-sm)', color: 'var(--earth)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{profil}</p>
        ) : (
          <textarea
            value={profil}
            onChange={e => setProfil(e.target.value)}
            rows={6}
            style={sIA.textarea}
            onFocus={e => { e.target.style.borderColor = 'var(--stone)' }}
            onBlur={e  => { e.target.style.borderColor = 'var(--sand)' }}
          />
        )}
      </div>

      {/* Questions personnalisées */}
      <div style={sIA.card}>
        <h4 style={sIA.cardTitle}>💬 Questions bilan du soir personnalisées</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s4)' }}>
          {questions.map((q, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <p style={{ fontSize: 'var(--tx-xs)', color: 'var(--stone)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                Question {i + 1}
              </p>
              {isPublished ? (
                <>
                  <p style={{ fontSize: 'var(--tx-sm)', color: 'var(--earth)', fontWeight: 500 }}>{q.question}</p>
                  <p style={{ fontSize: 'var(--tx-xs)', color: 'var(--stone)', fontStyle: 'italic' }}>{q.placeholder}</p>
                </>
              ) : (
                <>
                  <input
                    value={q.question ?? ''}
                    onChange={e => updateQuestion(i, 'question', e.target.value)}
                    placeholder="La question…"
                    style={sIA.input}
                    onFocus={e => { e.target.style.borderColor = 'var(--stone)' }}
                    onBlur={e  => { e.target.style.borderColor = 'var(--sand)' }}
                  />
                  <input
                    value={q.placeholder ?? ''}
                    onChange={e => updateQuestion(i, 'placeholder', e.target.value)}
                    placeholder="Placeholder de réponse…"
                    style={{ ...sIA.input, fontStyle: 'italic', opacity: .75 }}
                    onFocus={e => { e.target.style.borderColor = 'var(--stone)' }}
                    onBlur={e  => { e.target.style.borderColor = 'var(--sand)' }}
                  />
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Programme 8 semaines */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s3)' }}>
        <h4 style={{ fontFamily: 'var(--serif)', fontSize: 'var(--tx-lg)', fontWeight: 400, color: 'var(--earth)' }}>
          📅 Programme 8 semaines
        </h4>
        {programme.map((sem, sIndex) => (
          <div key={sIndex} style={sIA.semaineCard}>
            {/* Semaine header */}
            <button
              onClick={() => setExpanded(prev => ({ ...prev, [sIndex]: !prev[sIndex] }))}
              style={sIA.semaineHeader}
            >
              <div>
                <span style={{ fontSize: 'var(--tx-xs)', color: 'var(--stone)', textTransform: 'uppercase', letterSpacing: '.08em' }}>
                  Semaine {sem.semaine}
                </span>
                {isPublished ? (
                  <p style={{ fontSize: 'var(--tx-sm)', fontWeight: 500, color: 'var(--earth)', marginTop: 2 }}>{sem.theme}</p>
                ) : (
                  <input
                    value={sem.theme ?? ''}
                    onChange={e => { e.stopPropagation(); updateSemaine(sIndex, 'theme', e.target.value) }}
                    onClick={e => e.stopPropagation()}
                    placeholder="Thème de la semaine…"
                    style={{ ...sIA.input, marginTop: 4, fontWeight: 500 }}
                    onFocus={e => { e.target.style.borderColor = 'var(--stone)' }}
                    onBlur={e  => { e.target.style.borderColor = 'var(--sand)' }}
                  />
                )}
              </div>
              <span style={{ fontSize: 'var(--tx-xs)', color: 'var(--stone)' }}>
                {expanded[sIndex] ? '▲' : '▼'}
              </span>
            </button>

            {expanded[sIndex] && (
              <div style={{ padding: 'var(--s4)', display: 'flex', flexDirection: 'column', gap: 'var(--s4)' }}>
                {/* Intention semaine */}
                {isPublished ? (
                  <p style={{ fontSize: 'var(--tx-xs)', color: 'var(--stone)', fontStyle: 'italic', lineHeight: 1.6 }}>
                    {sem.intention}
                  </p>
                ) : (
                  <textarea
                    value={sem.intention ?? ''}
                    onChange={e => updateSemaine(sIndex, 'intention', e.target.value)}
                    placeholder="Intention de la semaine…"
                    rows={2}
                    style={{ ...sIA.textarea, fontSize: 'var(--tx-xs)' }}
                    onFocus={e => { e.target.style.borderColor = 'var(--stone)' }}
                    onBlur={e  => { e.target.style.borderColor = 'var(--sand)' }}
                  />
                )}

                {/* Jours */}
                {(sem.jours ?? []).map((jour, jIndex) => (
                  <div key={jIndex} style={{ background: 'var(--cream)', borderRadius: 'var(--r-md)', padding: 'var(--s4)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s3)', marginBottom: 'var(--s3)', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 'var(--tx-xs)', color: 'var(--stone)', minWidth: 40 }}>J{jour.jour}</span>
                      {isPublished ? (
                        <>
                          <span style={{ fontWeight: 600, color: 'var(--earth)', fontSize: 'var(--tx-sm)' }}>{jour.nom}</span>
                          <span style={{ fontSize: 'var(--tx-xs)', color: 'var(--stone)' }}>· {jour.duree} min · {jour.type}</span>
                        </>
                      ) : (
                        <>
                          <input
                            value={jour.nom ?? ''}
                            onChange={e => updateJour(sIndex, jIndex, 'nom', e.target.value)}
                            placeholder="Nom de la séance…"
                            style={{ ...sIA.input, flex: 1, minWidth: 120 }}
                            onFocus={e => { e.target.style.borderColor = 'var(--stone)' }}
                            onBlur={e  => { e.target.style.borderColor = 'var(--sand)' }}
                          />
                          <input
                            value={jour.duree ?? ''}
                            onChange={e => updateJour(sIndex, jIndex, 'duree', Number(e.target.value))}
                            type="number"
                            placeholder="Durée"
                            style={{ ...sIA.input, width: 64 }}
                            onFocus={e => { e.target.style.borderColor = 'var(--stone)' }}
                            onBlur={e  => { e.target.style.borderColor = 'var(--sand)' }}
                          />
                          <span style={{ fontSize: 'var(--tx-xs)', color: 'var(--stone)' }}>min</span>
                        </>
                      )}
                    </div>

                    {/* Exercices */}
                    {(jour.exercices ?? []).filter(ex => ex.nom).map((ex, eIndex) => (
                      <div key={eIndex} style={{ paddingLeft: 'var(--s4)', borderLeft: '2px solid var(--sand)', marginBottom: 8 }}>
                        {isPublished ? (
                          <div style={{ display: 'flex', gap: 'var(--s3)', flexWrap: 'wrap', alignItems: 'baseline' }}>
                            <span style={{ fontSize: 'var(--tx-sm)', color: 'var(--earth)', fontWeight: 500 }}>{ex.nom}</span>
                            <span style={{ fontSize: 'var(--tx-xs)', color: 'var(--stone)' }}>{ex.series}×{ex.reps} · repos {ex.repos}</span>
                            {ex.commentaire && <span style={{ fontSize: 'var(--tx-xs)', color: 'var(--stone)', fontStyle: 'italic' }}>{ex.commentaire}</span>}
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            <input
                              value={ex.nom ?? ''}
                              onChange={e => updateExercice(sIndex, jIndex, eIndex, 'nom', e.target.value)}
                              placeholder="Exercice…"
                              style={{ ...sIA.input, flex: 2, minWidth: 120 }}
                              onFocus={e => { e.target.style.borderColor = 'var(--stone)' }}
                              onBlur={e  => { e.target.style.borderColor = 'var(--sand)' }}
                            />
                            <input
                              value={ex.series ?? ''}
                              onChange={e => updateExercice(sIndex, jIndex, eIndex, 'series', Number(e.target.value))}
                              type="number"
                              placeholder="Séries"
                              style={{ ...sIA.input, width: 56 }}
                              onFocus={e => { e.target.style.borderColor = 'var(--stone)' }}
                              onBlur={e  => { e.target.style.borderColor = 'var(--sand)' }}
                            />
                            <input
                              value={ex.reps ?? ''}
                              onChange={e => updateExercice(sIndex, jIndex, eIndex, 'reps', e.target.value)}
                              placeholder="Reps"
                              style={{ ...sIA.input, width: 72 }}
                              onFocus={e => { e.target.style.borderColor = 'var(--stone)' }}
                              onBlur={e  => { e.target.style.borderColor = 'var(--sand)' }}
                            />
                            <input
                              value={ex.repos ?? ''}
                              onChange={e => updateExercice(sIndex, jIndex, eIndex, 'repos', e.target.value)}
                              placeholder="Repos"
                              style={{ ...sIA.input, width: 72 }}
                              onFocus={e => { e.target.style.borderColor = 'var(--stone)' }}
                              onBlur={e  => { e.target.style.borderColor = 'var(--sand)' }}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Publish CTA at bottom */}
      {!isPublished && (
        <div style={{ paddingTop: 'var(--s4)', borderTop: '1px solid var(--sand)', display: 'flex', flexDirection: 'column', gap: 'var(--s2)', alignItems: 'flex-start' }}>
          <Button variant="terracotta" loading={publishing} onClick={handlePublish}>
            Valider et publier sur son profil ✦
          </Button>
          {pubError && <p style={{ fontSize: 'var(--tx-xs)', color: 'var(--terracotta)' }}>⚠ {pubError}</p>}
        </div>
      )}
    </div>
  )
}

const sIA = {
  card: {
    background: 'var(--white)', border: '1px solid var(--sand)',
    borderRadius: 'var(--r-lg)', padding: 'var(--s6)',
    boxShadow: 'var(--sh-sm)',
  },
  cardTitle: {
    fontFamily: 'var(--serif)', fontSize: 'var(--tx-lg)',
    fontWeight: 400, color: 'var(--earth)',
    marginBottom: 'var(--s4)', paddingBottom: 'var(--s3)',
    borderBottom: '1px solid var(--sand)',
  },
  textarea: {
    width: '100%', resize: 'vertical',
    border: '1px solid var(--sand)', borderRadius: 'var(--r-sm)',
    padding: 'var(--s4)', background: 'var(--cream)',
    color: 'var(--earth)', fontSize: 'var(--tx-sm)',
    lineHeight: 1.7, outline: 'none',
    fontFamily: 'var(--sans)', transition: 'border-color 150ms ease',
  },
  input: {
    border: '1px solid var(--sand)', borderRadius: 'var(--r-sm)',
    padding: '8px var(--s3)', background: 'var(--cream)',
    color: 'var(--earth)', fontSize: 'var(--tx-sm)',
    outline: 'none', fontFamily: 'var(--sans)',
    transition: 'border-color 150ms ease',
  },
  semaineCard: {
    background: 'var(--white)', border: '1px solid var(--sand)',
    borderRadius: 'var(--r-lg)', overflow: 'hidden', boxShadow: 'var(--sh-sm)',
  },
  semaineHeader: {
    width: '100%', display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', padding: 'var(--s4) var(--s5)',
    background: 'var(--cream)', border: 'none', cursor: 'pointer',
    textAlign: 'left', borderBottom: '1px solid var(--sand)',
  },
}

const s = {
  tabs: { display: 'flex', gap: 'var(--s2)', borderBottom: '1px solid var(--sand)', paddingBottom: 0 },
  tabBtn: {
    background: 'none', border: 'none', borderBottom: '2px solid transparent',
    padding: '10px var(--s4)', cursor: 'pointer',
    fontSize: 'var(--tx-sm)', fontWeight: 500, color: 'var(--stone)',
    transition: 'color 150ms ease, border-color 150ms ease',
    marginBottom: -1,
  },
  tabBtnActive: { color: 'var(--earth)', borderBottomColor: 'var(--terracotta)' },
  header: { display: 'flex', alignItems: 'flex-start', gap: 'var(--s6)', flexWrap: 'wrap' },
  bigAvatar: {
    width: 64, height: 64, borderRadius: '50%',
    background: 'var(--sand)', color: 'var(--earth)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 'var(--tx-xl)', fontWeight: 600, flexShrink: 0,
  },
  name: { fontFamily: 'var(--serif)', fontSize: 'var(--tx-2xl)', fontWeight: 400, color: 'var(--earth)' },
  progressWrap: { flex: 1, maxWidth: 280, height: 6, background: 'var(--sand)', borderRadius: 99, overflow: 'hidden' },
  progressFill: { height: '100%', background: 'var(--forest)', borderRadius: 99, transition: 'width .5s ease' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--s4)' },
  statCard: {
    background: 'var(--white)', border: '1px solid var(--sand)',
    borderRadius: 'var(--r-md)', padding: 'var(--s5)',
    display: 'flex', flexDirection: 'column', gap: 4, boxShadow: 'var(--sh-sm)',
  },
  statVal:   { fontFamily: 'var(--serif)', fontSize: 'var(--tx-2xl)', fontWeight: 400, color: 'var(--earth)' },
  statLabel: { fontSize: 'var(--tx-xs)', color: 'var(--stone)' },
}
