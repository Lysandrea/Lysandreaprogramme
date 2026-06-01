import { useState, useRef, useEffect } from 'react'
import Button from '../../components/Button.jsx'

/* ════════════════════════════════════════════════
   Defaults
   ════════════════════════════════════════════════ */
const DEF_ROUE = {
  corps_mouvement: 5, energie_vitalite: 5, emotions: 5, relations: 5,
  vie_pro: 5, environnement: 5, rapport_soi: 5, sommeil_recuperation: 5,
}
const DEFAULT_INTAKE = {
  prenom_surnom: '', age: '', ville_pays: '', whatsapp: '', email: '',
  pourquoi_maintenant: '', objectifs: [], objectifs_autre: '',
  vision_8_semaines: '', bloquee_jusquici: '', coaching_avant: '', coaching_avant_detail: '',
  mouvement_representation: '', pratique_passee: '', mouvements_evites: '',
  niveau_pratique: '', frequence_semaine: '', duree_seance: '', lieux_entrainement: [], materiel: '',
  relation_corps: '', histoire_corps: '', craintes_programme: '',
  douleurs: '', douleurs_detail: '', antecedents: '', zones_eviter: '', sommeil: '', stress: '',
  contraception: '', contraception_autre: '', cycle_regularite: '', duree_cycle: '', duree_regles: '',
  diagnostic: [], diagnostic_autre: '',
  symptomes_cycle: [], symptomes_regles_detail: '', symptomes_premenstruel_detail: '', symptomes_complet_detail: '',
  cycle_actuel: '',
  informations_manquantes: '', comment_connue: [], comment_connue_autre: '', questions_avant: '',
  roue_de_vie: DEF_ROUE,
}

/* ════════════════════════════════════════════════
   Reusable atoms
   ════════════════════════════════════════════════ */
function Fade({ show, children }) {
  return (
    <div style={{
      overflow: 'hidden',
      maxHeight: show ? 600 : 0,
      opacity: show ? 1 : 0,
      transition: 'max-height 300ms ease, opacity 200ms ease',
      marginTop: show ? 12 : 0,
    }}>
      {children}
    </div>
  )
}

function SectionHead({ num, emoji, title, sectionRef }) {
  return (
    <div ref={sectionRef} style={{ paddingTop: 8 }}>
      <p style={{ fontSize: 'var(--tx-xs)', color: 'var(--stone)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 4 }}>
        Section {num} / 8
      </p>
      <h3 style={{ fontFamily: 'var(--serif)', fontSize: 'var(--tx-2xl)', fontWeight: 400, color: 'var(--earth)' }}>
        {emoji} {title}
      </h3>
    </div>
  )
}

function QLabel({ children, hint }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <p style={{ fontSize: 'var(--tx-sm)', fontWeight: 500, color: 'var(--earth)', lineHeight: 1.5 }}>{children}</p>
      {hint && <p style={{ fontSize: 'var(--tx-xs)', color: 'var(--stone)', fontStyle: 'italic', marginTop: 4, lineHeight: 1.5 }}>{hint}</p>}
    </div>
  )
}

function TA({ value, onChange, placeholder, rows = 3 }) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      style={ta}
      onFocus={e => { e.target.style.borderColor = 'var(--stone)' }}
      onBlur={e  => { e.target.style.borderColor = 'var(--sand)' }}
    />
  )
}

function TI({ value, onChange, placeholder, type = 'text', readOnly = false }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      readOnly={readOnly}
      style={{ ...ti, opacity: readOnly ? .6 : 1, cursor: readOnly ? 'not-allowed' : 'text' }}
      onFocus={e => { if (!readOnly) e.target.style.borderColor = 'var(--stone)' }}
      onBlur={e  => { e.target.style.borderColor = 'var(--sand)' }}
    />
  )
}

function RadioPills({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {options.map(opt => {
        const active = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            style={{
              padding: '10px 16px',
              borderRadius: 'var(--r-md)',
              border: `1.5px solid ${active ? 'var(--forest)' : 'var(--sand)'}`,
              background: active ? 'var(--forest)' : 'transparent',
              color: active ? 'var(--white)' : 'var(--bark)',
              fontSize: 'var(--tx-sm)', textAlign: 'left',
              cursor: 'pointer', transition: 'all 150ms ease',
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

function CheckboxList({ options, values = [], onChange, max }) {
  function toggle(val) {
    if (values.includes(val)) {
      onChange(values.filter(v => v !== val))
    } else if (!max || values.length < max) {
      onChange([...values, val])
    }
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {options.map(opt => {
        const checked  = values.includes(opt.value)
        const disabled = !checked && max && values.length >= max
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => !disabled && toggle(opt.value)}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 16px', borderRadius: 'var(--r-md)', textAlign: 'left',
              border: `1.5px solid ${checked ? 'var(--forest)' : 'var(--sand)'}`,
              background: checked ? 'rgba(61,79,60,.07)' : 'transparent',
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? .45 : 1,
              transition: 'all 150ms ease',
            }}
          >
            <div style={{
              width: 20, height: 20, borderRadius: 4, flexShrink: 0,
              border: `1.5px solid ${checked ? 'var(--forest)' : 'var(--stone)'}`,
              background: checked ? 'var(--forest)' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 150ms ease',
            }}>
              {checked && <span style={{ fontSize: 11, color: 'var(--white)', fontWeight: 700 }}>✓</span>}
            </div>
            <span style={{ fontSize: 'var(--tx-sm)', color: 'var(--bark)' }}>{opt.label}</span>
          </button>
        )
      })}
    </div>
  )
}

function Divider() {
  return <div style={{ borderTop: '1px solid var(--sand)', margin: '8px 0' }} />
}

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

/* ════════════════════════════════════════════════
   Radar chart
   ════════════════════════════════════════════════ */
const ROUE_LABELS = ['Corps', 'Énergie', 'Émotions', 'Relations', 'Pro', 'Espace', 'Confiance', 'Sommeil']
const ROUE_KEYS   = ['corps_mouvement','energie_vitalite','emotions','relations','vie_pro','environnement','rapport_soi','sommeil_recuperation']
const ROUE_FULL   = ['Corps & mouvement','Énergie & vitalité','Émotions','Relations & liens','Vie professionnelle','Environnement','Rapport à soi','Sommeil & récupération']

function RadarChart({ values }) {
  const CX = 200, CY = 200, MAX_R = 130, N = 8

  function pt(angleDeg, r) {
    const rad = (angleDeg - 90) * Math.PI / 180
    return [CX + r * Math.cos(rad), CY + r * Math.sin(rad)]
  }

  const angles = Array.from({ length: N }, (_, i) => (i * 360) / N)
  const vals   = ROUE_KEYS.map(k => values[k] ?? 5)

  function gridPath(level) {
    const pts = angles.map(a => pt(a, (level / 10) * MAX_R))
    return pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${y}`).join('') + 'Z'
  }

  const dataPts = angles.map((a, i) => pt(a, (vals[i] / 10) * MAX_R))
  const dataPath = dataPts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${y}`).join('') + 'Z'

  return (
    <svg viewBox="0 0 400 400" style={{ width: '100%', maxWidth: 340, display: 'block', margin: '0 auto' }}>
      {/* Grid rings */}
      {[2,4,6,8,10].map(lvl => (
        <path key={lvl} d={gridPath(lvl)} fill="none" stroke="#E8DDD0" strokeWidth="0.8" />
      ))}
      {/* Axis spokes */}
      {angles.map((a, i) => {
        const [x, y] = pt(a, MAX_R)
        return <line key={i} x1={CX} y1={CY} x2={x} y2={y} stroke="rgba(196,181,160,.5)" strokeWidth="0.8" />
      })}
      {/* Data fill */}
      <path d={dataPath} style={{ fill: '#3D4F3C', fillOpacity: 0.28, stroke: '#6B7F5E', strokeWidth: 2 }} />
      {/* Data dots */}
      {dataPts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3.5" fill="#6B7F5E" />
      ))}
      {/* Labels */}
      {angles.map((a, i) => {
        const LR     = MAX_R + 28
        const [lx, ly] = pt(a, LR)
        const anchor = lx < CX - 8 ? 'end' : lx > CX + 8 ? 'start' : 'middle'
        return (
          <g key={i}>
            <text x={lx} y={ly - 4} textAnchor={anchor} style={{ fontSize: 10, fill: '#5C4A35', fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>
              {ROUE_LABELS[i]}
            </text>
            <text x={lx} y={ly + 11} textAnchor={anchor} style={{ fontSize: 9, fill: '#C07860', fontFamily: 'DM Sans, sans-serif' }}>
              {vals[i]}/10
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/* ════════════════════════════════════════════════
   Main component
   ════════════════════════════════════════════════ */
export default function IntakeQuestionnaire({ intake, setIntake, userEmail, onBack, onNext }) {
  /* Merge with defaults */
  const d = {
    ...DEFAULT_INTAKE,
    ...intake,
    email: intake?.email || userEmail || '',
    roue_de_vie: { ...DEF_ROUE, ...(intake?.roue_de_vie || {}) },
  }

  function set(field, value) {
    setIntake(prev => ({ ...DEFAULT_INTAKE, ...prev, [field]: value }))
  }
  function setRoue(field, value) {
    setIntake(prev => ({
      ...DEFAULT_INTAKE, ...prev,
      roue_de_vie: { ...DEF_ROUE, ...(prev.roue_de_vie || {}), [field]: value },
    }))
  }

  /* Pre-fill email once */
  useEffect(() => {
    if (!intake?.email && userEmail) set('email', userEmail)
  }, [userEmail]) // eslint-disable-line

  /* Scroll-based section progress */
  const sRefs = useRef([])
  const [activeSection, setActiveSection] = useState(1)
  useEffect(() => {
    function onScroll() {
      const threshold = window.innerHeight * 0.35
      let best = 1
      sRefs.current.forEach((el, i) => {
        if (el && el.getBoundingClientRect().top <= threshold) best = i + 1
      })
      setActiveSection(best)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div style={{ maxWidth: 720, display: 'flex', flexDirection: 'column', gap: 'var(--s6)' }}>

      {/* ── Progress bar ── */}
      <div style={{ position: 'sticky', top: 0, zIndex: 20, background: 'var(--white)', borderBottom: '1px solid var(--sand)', padding: '10px 0 10px', marginBottom: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 'var(--tx-xs)', color: 'var(--stone)', whiteSpace: 'nowrap', minWidth: 72 }}>
            Section {activeSection} / 8
          </span>
          <div style={{ flex: 1, height: 3, background: 'var(--sand)', borderRadius: 99 }}>
            <div style={{ width: `${(activeSection / 8) * 100}%`, height: '100%', background: 'var(--forest)', borderRadius: 99, transition: 'width 400ms ease' }} />
          </div>
        </div>
      </div>

      {/* ── Intro ── */}
      <div style={{ background: 'var(--forest)', borderRadius: 'var(--r-xl)', padding: 'var(--s8)' }}>
        <p style={{ fontFamily: 'var(--serif)', fontSize: 'var(--tx-xl)', fontWeight: 300, color: 'var(--white)', lineHeight: 1.6, marginBottom: 'var(--s3)' }}>
          🌿 Bienvenue. Ce questionnaire me permet de te connaître vraiment avant qu'on commence.
          Prends le temps de répondre honnêtement — il n'y a pas de bonne ou mauvaise réponse.
          Rien de ce que tu écriras ne te fera juger.
        </p>
        <p style={{ fontSize: 'var(--tx-sm)', color: 'rgba(253,250,246,.6)', fontStyle: 'italic' }}>
          Durée estimée : 10–15 minutes
        </p>
      </div>

      {/* ════════════════════════════════
          SECTION 1 — Qui tu es
          ════════════════════════════════ */}
      <div style={card}>
        <SectionHead num={1} emoji="👤" title="Qui tu es" sectionRef={el => sRefs.current[0] = el} />
        <div style={fields}>
          <div>
            <QLabel>Comment tu t'appelles, et comment tu aimes qu'on t'appelle ?</QLabel>
            <TI value={d.prenom_surnom} onChange={v => set('prenom_surnom', v)} placeholder="Ton prénom ou surnom…" />
          </div>
          <div style={row2}>
            <div style={{ flex: 1 }}>
              <QLabel>Âge</QLabel>
              <TI value={d.age} onChange={v => set('age', v)} placeholder="27" type="number" />
            </div>
            <div style={{ flex: 2 }}>
              <QLabel>Ville / Pays</QLabel>
              <TI value={d.ville_pays} onChange={v => set('ville_pays', v)} placeholder="Paris, France" />
            </div>
          </div>
          <div>
            <QLabel>WhatsApp</QLabel>
            <TI value={d.whatsapp} onChange={v => set('whatsapp', v)} placeholder="+33 6 …" />
          </div>
          <div>
            <QLabel>Email</QLabel>
            <TI value={d.email} onChange={() => {}} readOnly />
          </div>
        </div>
      </div>

      <Divider />

      {/* ════════════════════════════════
          SECTION 2 — Ce qui t'a amenée ici
          ════════════════════════════════ */}
      <div style={card}>
        <SectionHead num={2} emoji="🌟" title="Ce qui t'a amenée ici" sectionRef={el => sRefs.current[1] = el} />
        <div style={fields}>

          <div>
            <QLabel hint="Prends le temps de répondre — c'est la question la plus importante.">
              Pourquoi tu veux commencer un coaching maintenant ? Qu'est-ce qui t'a décidée ?
            </QLabel>
            <TA value={d.pourquoi_maintenant} onChange={v => set('pourquoi_maintenant', v)} placeholder="Ta réponse…" rows={4} />
          </div>

          <div>
            <QLabel>Quel est ton objectif principal ? (3 max)</QLabel>
            <CheckboxList
              max={3}
              values={d.objectifs}
              onChange={v => set('objectifs', v)}
              options={[
                { value: 'reconciliation',  label: 'Me réconcilier avec mon corps et le mouvement' },
                { value: 'confiance',        label: 'Reprendre confiance en moi via le sport' },
                { value: 'quotidien',        label: 'Me sentir mieux dans mon corps au quotidien' },
                { value: 'emotions',         label: 'Travailler mes émotions par le mouvement' },
                { value: 'reprise',          label: 'Reprendre une pratique après une longue pause' },
                { value: 'relation_saine',   label: 'Construire une relation saine et durable avec le sport' },
                { value: 'competition',      label: 'Préparer une compétition (Hyrox, running, autre)' },
                { value: 'autre',            label: 'Autre' },
              ]}
            />
            <Fade show={d.objectifs.includes('autre')}>
              <TI value={d.objectifs_autre} onChange={v => set('objectifs_autre', v)} placeholder="Précise ton objectif…" />
            </Fade>
          </div>

          <div>
            <QLabel hint="Pas une liste d'objectifs. Une image concrète.">
              Si dans 8 semaines ce programme a vraiment marché pour toi — pas « parfaitement », mais vraiment — qu'est-ce qui sera différent dans ta vie quotidienne ?
            </QLabel>
            <TA value={d.vision_8_semaines} onChange={v => set('vision_8_semaines', v)} placeholder="Ta réponse…" rows={4} />
          </div>

          <div>
            <QLabel>Qu'est-ce qui t'a bloquée jusqu'ici quand tu as essayé de prendre soin de toi ?</QLabel>
            <TA value={d.bloquee_jusquici} onChange={v => set('bloquee_jusquici', v)} placeholder="Ta réponse…" rows={3} />
          </div>

          <div>
            <QLabel>Tu as déjà suivi un programme ou un coaching avant ?</QLabel>
            <RadioPills
              value={d.coaching_avant}
              onChange={v => set('coaching_avant', v)}
              options={[
                { value: 'non', label: "Non, c'est ma première fois" },
                { value: 'oui', label: 'Oui' },
              ]}
            />
            <Fade show={d.coaching_avant === 'oui'}>
              <QLabel>Qu'est-ce qui n'avait pas fonctionné ?</QLabel>
              <TA value={d.coaching_avant_detail} onChange={v => set('coaching_avant_detail', v)} placeholder="Ta réponse…" rows={3} />
            </Fade>
          </div>

        </div>
      </div>

      <Divider />

      {/* ════════════════════════════════
          SECTION 3 — Ton rapport au mouvement
          ════════════════════════════════ */}
      <div style={card}>
        <SectionHead num={3} emoji="🏃" title="Ton rapport au mouvement" sectionRef={el => sRefs.current[2] = el} />
        <div style={fields}>

          <div>
            <QLabel hint="Douloureux, neutre, libérateur, inconnu, anxiogène… Il n'y a pas de mauvaise réponse.">
              Qu'est-ce que le mouvement représente pour toi en ce moment ?
            </QLabel>
            <TA value={d.mouvement_representation} onChange={v => set('mouvement_representation', v)} placeholder="Ta réponse…" rows={3} />
          </div>

          <div>
            <QLabel>As-tu déjà eu une pratique sportive régulière ? Si oui, comment ça s'est passé ?</QLabel>
            <TA value={d.pratique_passee} onChange={v => set('pratique_passee', v)} placeholder="Ta réponse…" rows={3} />
          </div>

          <div>
            <QLabel hint="Salles de sport, cours collectifs, certains types d'effort…">
              Est-ce qu'il y a des mouvements, des types d'exercices ou des environnements sportifs que tu évites ?
            </QLabel>
            <TA value={d.mouvements_evites} onChange={v => set('mouvements_evites', v)} placeholder="Ta réponse…" rows={2} />
          </div>

          <div>
            <QLabel>Depuis combien de temps tu pratiques du sport régulièrement ?</QLabel>
            <RadioPills
              value={d.niveau_pratique}
              onChange={v => set('niveau_pratique', v)}
              options={[
                { value: 'debutante',       label: 'Je débute (moins de 6 mois)' },
                { value: 'intermediaire',   label: 'Intermédiaire (6 mois – 2 ans)' },
                { value: 'confirmee',       label: 'Je pratique depuis 2 ans et +' },
                { value: 'intermittente',   label: "J'ai eu des périodes, mais j'ai arrêté" },
              ]}
            />
          </div>

          <div>
            <QLabel>Combien de fois par semaine tu peux t'entraîner ?</QLabel>
            <RadioPills
              value={d.frequence_semaine}
              onChange={v => set('frequence_semaine', v)}
              options={[
                { value: '2x',        label: '2x par semaine' },
                { value: '3x',        label: '3x par semaine' },
                { value: '4x',        label: '4x par semaine' },
                { value: '5x_plus',   label: '5x et plus' },
                { value: 'variable',  label: 'Variable selon les semaines' },
              ]}
            />
          </div>

          <div>
            <QLabel>Combien de temps tu peux consacrer à chaque séance ?</QLabel>
            <RadioPills
              value={d.duree_seance}
              onChange={v => set('duree_seance', v)}
              options={[
                { value: '30min',   label: '30 minutes' },
                { value: '45min',   label: '45 minutes' },
                { value: '1h',      label: '1 heure' },
                { value: '1h30',    label: '1h30 et plus' },
              ]}
            />
          </div>

          <div>
            <QLabel>Où tu t'entraînes ?</QLabel>
            <CheckboxList
              values={d.lieux_entrainement}
              onChange={v => set('lieux_entrainement', v)}
              options={[
                { value: 'salle',    label: 'Salle de sport' },
                { value: 'maison',   label: 'À la maison' },
                { value: 'exterieur',label: 'Extérieur / parc' },
                { value: 'crossfit', label: 'Box / CrossFit' },
                { value: 'mixte',    label: 'Mixte' },
              ]}
            />
          </div>

          <div>
            <QLabel>Matériel disponible</QLabel>
            <TA value={d.materiel} onChange={v => set('materiel', v)} placeholder="Haltères, élastiques, tapis, barbell…" rows={2} />
          </div>

        </div>
      </div>

      <Divider />

      {/* ════════════════════════════════
          SECTION 4 — Ton monde intérieur
          ════════════════════════════════ */}
      <div style={card}>
        <SectionHead num={4} emoji="🧠" title="Ton monde intérieur" sectionRef={el => sRefs.current[3] = el} />
        <div style={fields}>

          <div>
            <QLabel hint="Une image, une sensation, une phrase honnête — tout fonctionne.">
              Comment tu décrirais ta relation à ton corps aujourd'hui ?
            </QLabel>
            <TA value={d.relation_corps} onChange={v => set('relation_corps', v)} placeholder="Ta réponse…" rows={3} />
          </div>

          <div>
            <QLabel hint="Tu n'as pas à tout raconter. Partage ce qui te semble important. Rien n'est obligatoire ici.">
              Y a-t-il des chapitres de ton histoire avec ton corps dont tu voudrais que je sois au courant ?
            </QLabel>
            <TA value={d.histoire_corps} onChange={v => set('histoire_corps', v)} placeholder="Ta réponse…" rows={4} />
          </div>

          <div>
            <QLabel hint="La peur est de l'information. Si quelque chose t'inquiète, c'est important que je le sache.">
              Y a-t-il quelque chose que tu redoutes dans ce programme ou dans le fait de commencer ?
            </QLabel>
            <TA value={d.craintes_programme} onChange={v => set('craintes_programme', v)} placeholder="Ta réponse…" rows={3} />
          </div>

        </div>
      </div>

      <Divider />

      {/* ════════════════════════════════
          SECTION 5 — Santé & corps
          ════════════════════════════════ */}
      <div style={card}>
        <SectionHead num={5} emoji="🩺" title="Santé & corps" sectionRef={el => sRefs.current[4] = el} />
        <div style={fields}>

          <div>
            <QLabel>Tu as des douleurs en ce moment ?</QLabel>
            <RadioPills
              value={d.douleurs}
              onChange={v => set('douleurs', v)}
              options={[
                { value: 'non', label: 'Non, tout va bien' },
                { value: 'oui', label: 'Oui' },
              ]}
            />
            <Fade show={d.douleurs === 'oui'}>
              <QLabel>Où ? Depuis quand ?</QLabel>
              <TA value={d.douleurs_detail} onChange={v => set('douleurs_detail', v)} placeholder="Ta réponse…" rows={2} />
            </Fade>
          </div>

          <div>
            <QLabel>Antécédents de blessures, chirurgies, ou pathologies ?</QLabel>
            <TA value={d.antecedents} onChange={v => set('antecedents', v)} placeholder="Ta réponse…" rows={2} />
          </div>

          <div>
            <QLabel>Zones à éviter absolument ?</QLabel>
            <TA value={d.zones_eviter} onChange={v => set('zones_eviter', v)} placeholder="Ta réponse…" rows={2} />
          </div>

          <div>
            <QLabel>Comment tu dors en général ?</QLabel>
            <RadioPills
              value={d.sommeil}
              onChange={v => set('sommeil', v)}
              options={[
                { value: 'tres_bien', label: 'Très bien — 7h+ et je me réveille reposée' },
                { value: 'bien',      label: 'Bien — 6-7h' },
                { value: 'moyen',     label: 'Moyen — sommeil perturbé' },
                { value: 'mal',       label: 'Mal — insomnie, fatigue chronique' },
              ]}
            />
          </div>

          <div>
            <QLabel>Niveau de stress au quotidien ?</QLabel>
            <RadioPills
              value={d.stress}
              onChange={v => set('stress', v)}
              options={[
                { value: 'faible',      label: 'Faible' },
                { value: 'modere',      label: 'Modéré' },
                { value: 'eleve',       label: 'Élevé' },
                { value: 'tres_eleve',  label: 'Très élevé — stress chronique' },
              ]}
            />
          </div>

        </div>
      </div>

      <Divider />

      {/* ════════════════════════════════
          SECTION 6 — Ton cycle hormonal
          ════════════════════════════════ */}
      <div style={card}>
        <SectionHead num={6} emoji="🌙" title="Ton cycle hormonal" sectionRef={el => sRefs.current[5] = el} />
        <p style={{ fontSize: 'var(--tx-sm)', color: 'var(--stone)', fontStyle: 'italic', lineHeight: 1.6 }}>
          J'adapte l'intensité de tes séances à ton cycle pour de meilleurs résultats et une meilleure récupération. Ces infos restent strictement confidentielles entre nous.
        </p>
        <div style={fields}>

          <div>
            <QLabel>Tu es sous contraception hormonale ?</QLabel>
            <RadioPills
              value={d.contraception}
              onChange={v => set('contraception', v)}
              options={[
                { value: 'non',              label: 'Non' },
                { value: 'pilule',           label: 'Oui — pilule' },
                { value: 'diu_hormonal',     label: 'Oui — stérilet hormonal (DIU)' },
                { value: 'implant',          label: 'Oui — implant' },
                { value: 'autre',            label: 'Oui — autre' },
              ]}
            />
            <Fade show={d.contraception === 'autre'}>
              <TI value={d.contraception_autre} onChange={v => set('contraception_autre', v)} placeholder="Précise…" />
            </Fade>
          </div>

          <div>
            <QLabel>Ton cycle est plutôt… ?</QLabel>
            <RadioPills
              value={d.cycle_regularite}
              onChange={v => set('cycle_regularite', v)}
              options={[
                { value: 'regulier',     label: 'Régulier (autour de 28 jours)' },
                { value: 'irregulier',   label: 'Irrégulier' },
                { value: 'variable',     label: 'Variable' },
                { value: 'ne_sait_pas',  label: "Je ne sais pas / je n'observe pas mon cycle" },
                { value: 'pas_de_cycle', label: "Je n'ai pas de cycle (contraception, ménopause, autre)" },
              ]}
            />
          </div>

          <div style={row2}>
            <div style={{ flex: 1 }}>
              <QLabel>Durée moyenne de ton cycle</QLabel>
              <TI value={d.duree_cycle} onChange={v => set('duree_cycle', v)} placeholder="28 jours" />
            </div>
            <div style={{ flex: 1 }}>
              <QLabel>Durée de tes règles</QLabel>
              <TI value={d.duree_regles} onChange={v => set('duree_regles', v)} placeholder="5 jours" />
            </div>
          </div>

          <div>
            <QLabel>Tu as un diagnostic particulier ?</QLabel>
            <CheckboxList
              values={d.diagnostic}
              onChange={v => set('diagnostic', v)}
              options={[
                { value: 'rien',           label: 'Non, rien de particulier' },
                { value: 'sopk',           label: 'SOPK (syndrome des ovaires polykystiques)' },
                { value: 'endometriose',   label: 'Endométriose' },
                { value: 'amenorrhee',     label: 'Aménorrhée (absence de règles)' },
                { value: 'autre',          label: 'Autre' },
              ]}
            />
            <Fade show={d.diagnostic.includes('autre')}>
              <TI value={d.diagnostic_autre} onChange={v => set('diagnostic_autre', v)} placeholder="Précise…" />
            </Fade>
          </div>

          <div>
            <QLabel>Est-ce que tu as des symptômes récurrents qui impactent ton énergie ou tes séances ?</QLabel>
            <CheckboxList
              values={d.symptomes_cycle}
              onChange={v => set('symptomes_cycle', v)}
              options={[
                { value: 'non_impact',     label: 'Non, mon cycle impacte peu mon quotidien' },
                { value: 'regles',         label: 'Oui, surtout pendant les règles' },
                { value: 'premenstruel',   label: 'Oui, surtout en phase pré-menstruelle (SPM)' },
                { value: 'complet',        label: 'Oui, tout au long du cycle' },
              ]}
            />
            <Fade show={d.symptomes_cycle.includes('regles')}>
              <p style={{ fontSize: 'var(--tx-xs)', color: 'var(--stone)', marginBottom: 4 }}>Règles — précise :</p>
              <TA value={d.symptomes_regles_detail} onChange={v => set('symptomes_regles_detail', v)} placeholder="Ta réponse…" rows={2} />
            </Fade>
            <Fade show={d.symptomes_cycle.includes('premenstruel')}>
              <p style={{ fontSize: 'var(--tx-xs)', color: 'var(--stone)', marginBottom: 4 }}>Phase pré-menstruelle — précise :</p>
              <TA value={d.symptomes_premenstruel_detail} onChange={v => set('symptomes_premenstruel_detail', v)} placeholder="Ta réponse…" rows={2} />
            </Fade>
            <Fade show={d.symptomes_cycle.includes('complet')}>
              <p style={{ fontSize: 'var(--tx-xs)', color: 'var(--stone)', marginBottom: 4 }}>Tout au long du cycle — précise :</p>
              <TA value={d.symptomes_complet_detail} onChange={v => set('symptomes_complet_detail', v)} placeholder="Ta réponse…" rows={2} />
            </Fade>
          </div>

          <div>
            <QLabel hint="Jour approximatif, phase, règles en cours…">
              Où tu en es dans ton cycle aujourd'hui, si tu le sais ?
            </QLabel>
            <TA value={d.cycle_actuel} onChange={v => set('cycle_actuel', v)} placeholder="Ta réponse…" rows={2} />
          </div>

        </div>
      </div>

      <Divider />

      {/* ════════════════════════════════
          SECTION 7 — Pour finir
          ════════════════════════════════ */}
      <div style={card}>
        <SectionHead num={7} emoji="💬" title="Pour finir" sectionRef={el => sRefs.current[6] = el} />
        <div style={fields}>

          <div>
            <QLabel>Est-ce qu'il y a quelque chose d'important à savoir sur toi que je n'ai pas demandé ?</QLabel>
            <TA value={d.informations_manquantes} onChange={v => set('informations_manquantes', v)} placeholder="Ta réponse…" rows={3} />
          </div>

          <div>
            <QLabel>Comment tu as entendu parler de moi ?</QLabel>
            <CheckboxList
              values={d.comment_connue}
              onChange={v => set('comment_connue', v)}
              options={[
                { value: 'instagram',       label: 'Instagram' },
                { value: 'bouche_a_oreille',label: 'Bouche à oreille' },
                { value: 'podcast',         label: 'Podcast' },
                { value: 'autre',           label: 'Autre' },
              ]}
            />
            <Fade show={d.comment_connue.includes('autre')}>
              <TI value={d.comment_connue_autre} onChange={v => set('comment_connue_autre', v)} placeholder="Précise…" />
            </Fade>
          </div>

          <div>
            <QLabel>Tu as des questions avant qu'on commence ?</QLabel>
            <TA value={d.questions_avant} onChange={v => set('questions_avant', v)} placeholder="Ta réponse…" rows={3} />
          </div>

        </div>
      </div>

      {/* ── Closing message ── */}
      <div style={{ ...card, background: 'var(--sand)', border: '1px solid rgba(196,181,160,.4)' }}>
        <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 'var(--tx-lg)', color: 'var(--earth)', lineHeight: 1.7 }}>
          🙏 Merci d'avoir pris le temps de remplir tout ça avec soin. Je lis chaque réponse attentivement. À très vite.
        </p>
        <p style={{ fontSize: 'var(--tx-base)', color: 'var(--bark)', marginTop: 'var(--s2)' }}>— Lysa 🌿</p>
      </div>

      <Divider />

      {/* ════════════════════════════════
          SECTION 8 — Roue de la Vie
          ════════════════════════════════ */}
      <div style={card}>
        <SectionHead num={8} emoji="🌀" title="Ta Roue de la Vie" sectionRef={el => sRefs.current[7] = el} />
        <p style={{ fontSize: 'var(--tx-sm)', color: 'var(--bark)', lineHeight: 1.6 }}>
          Note chaque domaine de 1 à 10. Il n'y a pas de bonne réponse — juste ton ressenti honnête aujourd'hui.
        </p>
        <p style={{ fontSize: 'var(--tx-xs)', color: 'var(--stone)', fontStyle: 'italic', marginTop: 4 }}>
          On refait cet exercice à la fin des 8 semaines pour mesurer ton évolution.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s5)', marginTop: 'var(--s4)' }}>
          {ROUE_KEYS.map((key, i) => (
            <SliderRow
              key={key}
              label={ROUE_FULL[i]}
              value={d.roue_de_vie[key]}
              onChange={v => setRoue(key, v)}
            />
          ))}
        </div>

        <div style={{ marginTop: 'var(--s8)', background: 'var(--cream)', borderRadius: 'var(--r-lg)', padding: 'var(--s6)' }}>
          <p style={{ fontSize: 'var(--tx-xs)', color: 'var(--stone)', letterSpacing: '.08em', textTransform: 'uppercase', textAlign: 'center', marginBottom: 'var(--s4)' }}>
            Ton profil aujourd'hui
          </p>
          <RadarChart values={d.roue_de_vie} />
        </div>
      </div>

      {/* ── Navigation ── */}
      <div style={{ display: 'flex', gap: 'var(--s3)', marginTop: 'var(--s4)', marginBottom: 'var(--s8)', flexWrap: 'wrap' }}>
        <Button variant="secondary" onClick={onBack}>← Précédent</Button>
        <Button variant="terracotta" onClick={onNext}>Étape suivante →</Button>
      </div>

    </div>
  )
}

/* ── Shared inline styles ── */
const card   = { background: 'var(--white)', border: '1px solid var(--sand)', borderRadius: 'var(--r-lg)', padding: 'var(--s6)', display: 'flex', flexDirection: 'column', gap: 'var(--s5)', boxShadow: '0 1px 4px rgba(0,0,0,.04)' }
const fields = { display: 'flex', flexDirection: 'column', gap: 'var(--s5)' }
const row2   = { display: 'flex', gap: 'var(--s4)', flexWrap: 'wrap' }
const ta     = { width: '100%', resize: 'vertical', border: '1px solid var(--sand)', borderRadius: 'var(--r-sm)', padding: 'var(--s4)', background: 'var(--cream)', color: 'var(--earth)', fontSize: 'var(--tx-sm)', lineHeight: 1.7, outline: 'none', fontFamily: 'var(--sans)', transition: 'border-color 150ms ease' }
const ti     = { width: '100%', border: '1px solid var(--sand)', borderRadius: 'var(--r-sm)', padding: '12px var(--s4)', background: 'var(--cream)', color: 'var(--earth)', fontSize: 'var(--tx-sm)', outline: 'none', fontFamily: 'var(--sans)', transition: 'border-color 150ms ease' }
