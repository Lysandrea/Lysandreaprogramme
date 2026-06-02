import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth }    from '../../contexts/AuthContext.jsx'
import { useSidebar } from '../../contexts/SidebarContext.jsx'
import {
  IS_MOCK,
  fetchOnboardingProgress,
  fetchIntakeResponses,
  saveOnboardingStep,
  saveIntakeResponses,
  completeOnboarding,
  createCoachNotification,
} from '../../lib/supabase.js'
import Button               from '../../components/Button.jsx'
import LysaQuote            from '../../components/LysaQuote.jsx'
import IntakeQuestionnaire  from './IntakeQuestionnaire.jsx'

/* ── Storage helpers (mock fallback) ── */
const LS_KEY = 'lysa_onboarding'
function lsGet()        { try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}') } catch { return {} } }
function lsSave(patch)  { localStorage.setItem(LS_KEY, JSON.stringify({ ...lsGet(), ...patch })) }

/* ── Step metadata ── */
const STEPS = [
  { num: 1, label: 'Bienvenue'     },
  { num: 2, label: 'Le programme'  },
  { num: 3, label: 'Checklist'     },
  { num: 4, label: 'Questionnaire' },
  { num: 5, label: 'Accord'        },
]

/* ── Checklist ── */
const CHECKLIST = [
  {
    section: 'Accès & outils',
    items: [
      { key: 'lien_acces',    label: "J'ai reçu le lien d'accès à ma plateforme" },
      { key: 'whatsapp',      label: "J'ai enregistré le numéro WhatsApp de Lysa" },
      { key: 'appli',         label: "J'ai téléchargé l'application sur mon téléphone si besoin" },
    ],
  },
  {
    section: 'Espace physique',
    items: [
      { key: 'espace',        label: "J'ai identifié un espace pour mes séances à la maison" },
      { key: 'tapis',         label: "J'ai un tapis ou une surface confortable" },
      { key: 'vetements',     label: "J'ai des vêtements dans lesquels je me sens à l'aise" },
    ],
  },
  {
    section: 'Espace intérieur',
    items: [
      { key: 'message',       label: "J'ai lu le message de bienvenue de Lysa" },
      { key: 'moment',        label: "J'ai un moment réservé dans ma semaine pour bouger" },
      { key: 'rythme',        label: "Je suis prête à avancer à mon rythme, sans me juger" },
    ],
  },
]

/* ════════════════════════════════════════════════
   Main page
   ════════════════════════════════════════════════ */
export default function Onboarding() {
  const { user, profile } = useAuth()
  const navigate  = useNavigate()
  const prenom    = profile?.prenom ?? 'toi'

  const [etape,      setEtape]      = useState(1)
  const [checklist,  setChecklist]  = useState({})
  const [intake,     setIntake]     = useState({})
  const [signature,  setSignature]  = useState('')
  const [loading,    setLoading]    = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [done,       setDone]       = useState(false)

  /* ── Load progress — Supabase en premier, localStorage en fallback ── */
  useEffect(() => {
    if (!user) return

    Promise.all([
      fetchOnboardingProgress(user.id),
      fetchIntakeResponses(user.id),
    ])
      .then(([prog, rep]) => {
        if (prog?.completed) { navigate('/dashboard'); return }
        setEtape(prog?.etape_actuelle ?? 1)
        setChecklist(prog?.checklist ?? {})
        setIntake(rep ?? {})
        setLoading(false)
      })
      .catch(() => {
        // Supabase inaccessible (pas de credentials) → fallback localStorage
        const saved = lsGet()
        if (saved.completed) { navigate('/dashboard'); return }
        setEtape(saved.etape ?? 1)
        setChecklist(saved.checklist ?? {})
        setIntake(saved.intake ?? {})
        setLoading(false)
      })
  }, [user]) // eslint-disable-line

  /* ── Auto-save intake every 30s ── */
  const intakeRef = useRef(intake)
  intakeRef.current = intake
  useEffect(() => {
    if (etape !== 4) return
    const id = setInterval(() => persistIntake(intakeRef.current), 30000)
    return () => clearInterval(id)
  }, [etape, user]) // eslint-disable-line

  async function persistIntake(data) {
    lsSave({ intake: data })                                   // backup local systématique
    if (!user) return
    try { await saveIntakeResponses(user.id, data) } catch {} // Supabase, erreurs silencieuses
  }

  async function goToStep(next) {
    window.scrollTo(0, 0)
    setEtape(next)
    lsSave({ etape: next, checklist })
    if (!user) return
    try { await saveOnboardingStep(user.id, next, checklist) } catch {}
  }

  function toggleCheck(key) {
    const next = { ...checklist, [key]: !checklist[key] }
    setChecklist(next)
    lsSave({ checklist: next })
    if (user) saveOnboardingStep(user.id, etape, next).catch(() => {})
  }

  async function handleComplete() {
    if (!signature.trim()) return
    setSubmitting(true)
    try {
      await persistIntake(intake)
      lsSave({ completed: true })        // backup local avant tout
      if (user) {
        try {
          await completeOnboarding(user.id, signature)
          if (profile?.coach_id) {
            await createCoachNotification(
              profile.coach_id, user.id,
              `${prenom} a terminé son onboarding.`
            )
          }
        } catch {}                       // erreur Supabase → on continue quand même
      }
      setDone(true)
      setTimeout(() => navigate('/dashboard'), 3000)
    } catch (e) {
      console.error(e)
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream)' }}>
      <span style={{ fontFamily: 'var(--serif)', fontSize: 'var(--tx-xl)', color: 'var(--stone)' }}>Chargement…</span>
    </div>
  )

  if (done) return <SuccessScreen prenom={prenom} />

  const { open, toggle, close } = useSidebar()

  return (
    <div className="shell">
      {/* Backdrop mobile */}
      {open && <div className="sidebar-backdrop" onClick={close} aria-hidden="true" />}

      <OnboardingSidebar etape={etape} profile={profile} open={open} close={close} />

      <div className="shell-main">
        {/* Topbar */}
        <header className="topbar" style={s.topbar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s3)' }}>
            <button className="topbar-hamburger" onClick={toggle} aria-label="Menu">
              <span style={{ display: 'block', width: 22, height: 2, background: 'var(--earth)', borderRadius: 2 }} />
              <span style={{ display: 'block', width: 22, height: 2, background: 'var(--earth)', borderRadius: 2 }} />
              <span style={{ display: 'block', width: 22, height: 2, background: 'var(--earth)', borderRadius: 2 }} />
            </button>
            <div>
              <h1 style={s.topTitle}>Bienvenue {prenom} ✦</h1>
              <p style={s.topSub}>Étape {etape} / 5</p>
            </div>
          </div>
          <div style={s.topAvatar}>
            {(profile?.prenom?.[0] ?? '?').toUpperCase()}
          </div>
        </header>

        {/* Content */}
        <div className="shell-body">
          {etape === 1 && (
            <Step1
              prenom={prenom}
              onNext={() => goToStep(2)}
            />
          )}
          {etape === 2 && (
            <Step2
              onBack={() => goToStep(1)}
              onNext={() => goToStep(3)}
            />
          )}
          {etape === 3 && (
            <Step3
              checklist={checklist}
              toggle={toggleCheck}
              onBack={() => goToStep(2)}
              onNext={() => goToStep(4)}
            />
          )}
          {etape === 4 && (
            <Step4
              intake={intake}
              setIntake={setIntake}
              userEmail={user?.email ?? ''}
              onBack={() => goToStep(3)}
              onNext={async () => {
                await persistIntake(intake)
                if (!IS_MOCK && user && profile?.coach_id) {
                  try {
                    await createCoachNotification(
                      profile.coach_id,
                      user.id,
                      `${prenom} a soumis son questionnaire.`,
                      'questionnaire_submitted'
                    )
                  } catch {}
                }
                goToStep(5)
              }}
            />
          )}
          {etape === 5 && (
            <Step5
              signature={signature}
              setSignature={setSignature}
              submitting={submitting}
              onBack={() => goToStep(4)}
              onComplete={handleComplete}
            />
          )}
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════
   Sidebar
   ════════════════════════════════════════════════ */
function OnboardingSidebar({ etape, profile, open, close }) {
  return (
    <aside className={`shell-sidebar${open ? ' sidebar-open' : ''}`}>
      <button className="sidebar-close-btn" onClick={close} aria-label="Fermer">✕</button>
      <div style={s.sidebarBrand}>
        <span style={s.brandName}>Lysa Andréa</span>
        <span style={s.brandSub}>Programme 8 semaines</span>
      </div>

      <nav style={s.sidebarNav}>
        <p style={s.sidebarNavLabel}>Étapes</p>
        {STEPS.map(step => {
          const done    = step.num < etape
          const current = step.num === etape
          return (
            <div key={step.num} style={s.sidebarItem}>
              <div style={{
                ...s.stepDot,
                background:   done    ? 'var(--moss)'
                            : current ? 'var(--terracotta)'
                            :           'rgba(255,255,255,0.12)',
                borderColor:  done    ? 'var(--moss)'
                            : current ? 'var(--terracotta)'
                            :           'rgba(255,255,255,0.2)',
              }}>
                {done ? '✓' : step.num}
              </div>
              <span style={{
                fontSize: 'var(--tx-sm)',
                color: current ? 'var(--white)'
                     : done    ? 'var(--sage)'
                     :           'rgba(253,250,246,0.4)',
                fontWeight: current ? 500 : 400,
                transition: 'color var(--ease-fast)',
              }}>
                {step.label}
              </span>
            </div>
          )
        })}
      </nav>

      <div style={s.sidebarBottom}>
        <div style={s.sidebarUser}>
          <div style={s.sidebarAvatar}>
            {(profile?.prenom?.[0] ?? '?').toUpperCase()}
          </div>
          <div>
            <p style={{ fontSize: 'var(--tx-sm)', color: 'var(--white)', fontWeight: 500 }}>
              {profile?.prenom ?? 'Cliente'}
            </p>
            <p style={{ fontSize: 'var(--tx-xs)', color: 'var(--sage)' }}>Onboarding</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

/* ════════════════════════════════════════════════
   Étape 1 — Bienvenue
   ════════════════════════════════════════════════ */
function Step1({ prenom, onNext }) {
  return (
    <div style={s.stepWrap}>
      {/* Banner */}
      <div style={s.heroBanner}>
        <p style={s.heroEye}>Ton programme commence ici</p>
        <h2 style={s.heroTitle}>Tu es là. C'est déjà le plus grand pas.</h2>
        <p style={s.heroSub}>Ce que tu commences n'est pas un programme comme les autres.</p>
      </div>

      {/* Message Lysa */}
      <div style={s.lysaCard}>
        <p style={s.lysaCardTag}>Message de Lysa</p>
        <p style={s.lysaCardText}>
          Je suis vraiment contente que tu sois là. Ce que tu as choisi de commencer, c'est courageux.
          Pas parce que c'est difficile — même si ça le sera parfois — mais parce que se donner la
          permission d'être accompagnée, c'est déjà un acte fort. Prends le temps de lire chaque étape.
        </p>
      </div>

      {/* Quote */}
      <LysaQuote
        index={0}
        style={{ marginTop: 4 }}
      />
      {/* Override the quote text inline */}
      <blockquote style={{ borderLeft: '2px solid var(--sage)', paddingLeft: 'var(--s5)', marginTop: 'var(--s4)' }}>
        <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 'var(--tx-lg)', fontWeight: 300, color: 'var(--earth)', lineHeight: 1.55 }}>
          "Ce programme n'est pas là pour te changer. Il est là pour t'aider à te retrouver."
        </p>
        <cite style={{ display: 'block', marginTop: 'var(--s2)', fontSize: 'var(--tx-xs)', fontStyle: 'normal', color: 'var(--stone)', letterSpacing: '.08em', textTransform: 'uppercase' }}>
          — Lysa Andréa
        </cite>
      </blockquote>

      <div style={{ marginTop: 'var(--s8)' }}>
        <Button variant="terracotta" size="lg" onClick={onNext}>
          Étape suivante →
        </Button>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════
   Étape 2 — Le programme
   ════════════════════════════════════════════════ */
const PROGRAMME_CARDS = [
  { icon: '🏃‍♀️', titre: 'Volet Sport',               desc: '3 séances par semaine, progressives et adaptées à où tu en es.' },
  { icon: '🧠', titre: 'Volet Émotionnel',            desc: "Intégré à chaque journée — le soir, quelques questions pour t'écouter vraiment." },
  { icon: '💬', titre: 'Check-ins hebdomadaires',     desc: 'Chaque semaine, un espace pour faire le point avec moi.' },
  { icon: '📲', titre: 'Suivi WhatsApp',              desc: 'Un accès direct à moi entre les séances.' },
]

function Step2({ onBack, onNext }) {
  return (
    <div style={s.stepWrap}>
      <div style={s.stepHeader}>
        <h2 style={s.stepTitle}>Le programme</h2>
        <p style={s.stepDesc}>Voici ce qui t'attend pendant ces 8 semaines.</p>
      </div>

      <div style={s.grid2x2}>
        {PROGRAMME_CARDS.map(card => (
          <div key={card.titre} style={s.progCard}>
            <span style={s.progIcon}>{card.icon}</span>
            <h3 style={s.progCardTitle}>{card.titre}</h3>
            <p style={s.progCardDesc}>{card.desc}</p>
          </div>
        ))}
      </div>

      <div style={s.navRow}>
        <Button variant="secondary" onClick={onBack}>← Précédent</Button>
        <Button variant="terracotta" onClick={onNext}>Étape suivante →</Button>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════
   Étape 3 — Checklist
   ════════════════════════════════════════════════ */
function Step3({ checklist, toggle, onBack, onNext }) {
  const total   = CHECKLIST.flatMap(s => s.items).length
  const checked = Object.values(checklist).filter(Boolean).length

  return (
    <div style={s.stepWrap}>
      <div style={s.stepHeader}>
        <h2 style={s.stepTitle}>Checklist de démarrage</h2>
        <p style={s.stepDesc}>{checked} / {total} éléments complétés</p>
      </div>

      {CHECKLIST.map(group => (
        <div key={group.section} style={{ marginBottom: 'var(--s6)' }}>
          <p style={s.checkSection}>{group.section}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s2)' }}>
            {group.items.map(item => (
              <label key={item.key} style={s.checkItem(checklist[item.key])}>
                <div
                  style={s.checkbox(checklist[item.key])}
                  onClick={() => toggle(item.key)}
                  role="checkbox"
                  aria-checked={!!checklist[item.key]}
                >
                  {checklist[item.key] && '✓'}
                </div>
                <span style={{ fontSize: 'var(--tx-sm)', color: checklist[item.key] ? 'var(--earth)' : 'var(--bark)', cursor: 'pointer' }}
                  onClick={() => toggle(item.key)}>
                  {item.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      ))}

      <div style={s.navRow}>
        <Button variant="secondary" onClick={onBack}>← Précédent</Button>
        <Button variant="terracotta" onClick={onNext}>Étape suivante →</Button>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════
   Étape 4 — Questionnaire d'intake (délégué)
   ════════════════════════════════════════════════ */
function Step4({ intake, setIntake, userEmail, onBack, onNext }) {
  return (
    <IntakeQuestionnaire
      intake={intake}
      setIntake={setIntake}
      userEmail={userEmail}
      onBack={onBack}
      onNext={onNext}
    />
  )
}

/* ════════════════════════════════════════════════
   Étape 5 — Accord & engagement
   ════════════════════════════════════════════════ */
function Step5({ signature, setSignature, submitting, onBack, onComplete }) {
  return (
    <div style={s.stepWrap}>
      <div style={s.stepHeader}>
        <h2 style={s.stepTitle}>Accord & engagement</h2>
        <p style={s.stepDesc}>Ce que l'on s'engage à faire ensemble.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s5)' }}>
        {/* Lysa s'engage */}
        <div style={s.accordCard}>
          <p style={s.accordSection}>Ce que je m'engage à faire pour toi</p>
          {[
            'Je lis ton questionnaire avec attention avant de démarrer.',
            'Je te réponds à chaque check-in dans les 24h.',
            'Je prépare chaque semaine en pensant à toi.',
            'Je ne te juge pas — jamais.',
          ].map(line => (
            <div key={line} style={s.accordLine}>
              <span style={s.accordDot}>✦</span>
              <span style={{ fontSize: 'var(--tx-sm)', color: 'var(--earth)' }}>{line}</span>
            </div>
          ))}
        </div>

        {/* Cliente s'engage */}
        <div style={s.accordCard}>
          <p style={s.accordSection}>Ce que tu t'engages à faire</p>
          {[
            'Compléter ton bilan du soir chaque jour.',
            'Me prévenir si tu traverses quelque chose de difficile.',
            'Aller à ton rythme sans te comparer.',
          ].map(line => (
            <div key={line} style={s.accordLine}>
              <span style={s.accordDot}>✦</span>
              <span style={{ fontSize: 'var(--tx-sm)', color: 'var(--earth)' }}>{line}</span>
            </div>
          ))}
        </div>

        {/* Ce qu'on comprend */}
        <div style={s.accordCard}>
          <p style={s.accordSection}>Ce qu'on comprend toutes les deux</p>
          {[
            "Il y aura des jours plus durs. Ce n'est pas un échec.",
            'Ce que tu partages ici reste confidentiel.',
          ].map(line => (
            <div key={line} style={s.accordLine}>
              <span style={s.accordDot}>✦</span>
              <span style={{ fontSize: 'var(--tx-sm)', color: 'var(--earth)' }}>{line}</span>
            </div>
          ))}
        </div>

        {/* Signature */}
        <div style={{ ...s.accordCard, border: '1px solid var(--sand)' }}>
          <p style={s.accordSection}>Ta signature</p>
          <p style={{ fontSize: 'var(--tx-xs)', color: 'var(--stone)', marginBottom: 'var(--s3)' }}>
            Écris ton prénom pour valider cet accord.
          </p>
          <input
            type="text"
            value={signature}
            onChange={e => setSignature(e.target.value)}
            placeholder="Ton prénom…"
            style={s.signatureInput}
          />
          <p style={{ fontSize: 'var(--tx-xs)', color: 'var(--stone)', marginTop: 'var(--s2)' }}>
            {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      <div style={s.navRow}>
        <Button variant="secondary" onClick={onBack}>← Précédent</Button>
        <Button
          variant="terracotta"
          size="lg"
          disabled={!signature.trim()}
          loading={submitting}
          onClick={onComplete}
        >
          Envoyer mon onboarding à Lysa ✦
        </Button>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════
   Success screen
   ════════════════════════════════════════════════ */
function SuccessScreen({ prenom }) {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, var(--forest) 0%, #2e3c2d 100%)',
      flexDirection: 'column', gap: 'var(--s6)', padding: 'var(--s8)',
    }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 48, marginBottom: 'var(--s4)' }}>✦</p>
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'var(--tx-4xl)', fontWeight: 300, color: 'var(--white)', marginBottom: 'var(--s4)' }}>
          Merci, {prenom}.
        </h2>
        <p style={{ fontSize: 'var(--tx-lg)', color: 'rgba(245,240,232,0.75)', maxWidth: 420, lineHeight: 1.7 }}>
          Ton onboarding est envoyé. Je te lis avec attention avant notre premier échange.
          Ton programme commence maintenant.
        </p>
        <p style={{ fontSize: 'var(--tx-sm)', color: 'var(--sage)', marginTop: 'var(--s6)', letterSpacing: '.08em' }}>
          Redirection vers ton tableau de bord…
        </p>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════
   Styles
   ════════════════════════════════════════════════ */
const s = {
  /* Sidebar */
  /* sidebar géré par .shell-sidebar en CSS */
  sidebarBrand: {
    padding: 'var(--s8) var(--s6) var(--s6)',
    borderBottom: '1px solid rgba(168,184,154,.15)',
    marginBottom: 'var(--s6)',
  },
  brandName: {
    display: 'block', fontFamily: 'var(--serif)', fontSize: 22,
    fontWeight: 400, color: 'var(--white)', letterSpacing: '-.01em',
  },
  brandSub: {
    display: 'block', fontSize: 'var(--tx-xs)', color: 'var(--sage)',
    letterSpacing: '.1em', textTransform: 'uppercase', marginTop: 4,
  },
  sidebarNav: { flex: 1, padding: '0 var(--s5)', display: 'flex', flexDirection: 'column', gap: 'var(--s2)' },
  sidebarNavLabel: {
    fontSize: 'var(--tx-xs)', color: 'var(--sage)', letterSpacing: '.1em',
    textTransform: 'uppercase', marginBottom: 'var(--s3)',
  },
  sidebarItem: { display: 'flex', alignItems: 'center', gap: 'var(--s3)', padding: '6px 0' },
  stepDot: {
    width: 28, height: 28, borderRadius: '50%', border: '1.5px solid',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 11, fontWeight: 600, color: 'var(--white)', flexShrink: 0,
    transition: 'background var(--ease-fast), border-color var(--ease-fast)',
  },
  sidebarBottom: {
    padding: 'var(--s5) var(--s5)',
    borderTop: '1px solid rgba(168,184,154,.15)', marginTop: 'auto',
  },
  sidebarUser: { display: 'flex', alignItems: 'center', gap: 'var(--s3)' },
  sidebarAvatar: {
    width: 32, height: 32, borderRadius: '50%', background: 'var(--sage)',
    color: 'var(--forest)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 'var(--tx-sm)', fontWeight: 600, flexShrink: 0,
  },

  /* Topbar */
  topbar: {
    height: 'var(--topbar-h)', background: 'var(--white)',
    borderBottom: '1px solid var(--sand)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 var(--s8)', flexShrink: 0,
  },
  topTitle: {
    fontFamily: 'var(--serif)', fontSize: 'var(--tx-xl)',
    fontWeight: 400, color: 'var(--earth)', letterSpacing: '-.01em',
  },
  topSub: { fontSize: 'var(--tx-xs)', color: 'var(--stone)', marginTop: 2, letterSpacing: '.04em' },
  topAvatar: {
    width: 36, height: 36, borderRadius: '50%', background: 'var(--sage)',
    color: 'var(--forest)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 'var(--tx-sm)', fontWeight: 600,
  },

  /* Step layout */
  stepWrap: { maxWidth: 720, display: 'flex', flexDirection: 'column', gap: 'var(--s6)' },
  stepHeader: { marginBottom: 'var(--s2)' },
  stepTitle: { fontFamily: 'var(--serif)', fontSize: 'var(--tx-3xl)', fontWeight: 400, color: 'var(--earth)', marginBottom: 'var(--s2)' },
  stepDesc:  { fontSize: 'var(--tx-sm)', color: 'var(--bark)', lineHeight: 1.6 },
  navRow:    { display: 'flex', gap: 'var(--s3)', marginTop: 'var(--s4)', flexWrap: 'wrap' },

  /* Step 1 */
  heroBanner: {
    background: 'linear-gradient(135deg, var(--forest) 0%, #2e3c2d 100%)',
    borderRadius: 'var(--r-xl)', padding: 'var(--s8)',
  },
  heroEye:   { fontSize: 'var(--tx-xs)', color: 'var(--sage)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 'var(--s3)' },
  heroTitle: { fontFamily: 'var(--serif)', fontSize: 'var(--tx-3xl)', fontWeight: 300, color: 'var(--white)', marginBottom: 'var(--s3)', lineHeight: 1.25 },
  heroSub:   { fontSize: 'var(--tx-base)', color: 'rgba(245,240,232,.72)', lineHeight: 1.65 },
  lysaCard: {
    background: 'var(--sand)', borderRadius: 'var(--r-lg)', padding: 'var(--s6)',
    border: '1px solid rgba(196,181,160,.4)',
  },
  lysaCardTag:  { fontSize: 'var(--tx-xs)', color: 'var(--bark)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 'var(--s3)' },
  lysaCardText: { fontSize: 'var(--tx-base)', color: 'var(--earth)', lineHeight: 1.75, fontStyle: 'italic' },

  /* Step 2 */
  grid2x2: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--s4)' },
  progCard: {
    background: 'var(--white)', borderRadius: 'var(--r-lg)', padding: 'var(--s6)',
    border: '1px solid var(--sand)', display: 'flex', flexDirection: 'column', gap: 'var(--s3)',
  },
  progIcon:      { fontSize: 28 },
  progCardTitle: { fontFamily: 'var(--serif)', fontSize: 'var(--tx-lg)', fontWeight: 400, color: 'var(--earth)' },
  progCardDesc:  { fontSize: 'var(--tx-sm)', color: 'var(--bark)', lineHeight: 1.65 },

  /* Step 3 */
  checkSection: {
    fontSize: 'var(--tx-xs)', color: 'var(--bark)', letterSpacing: '.1em',
    textTransform: 'uppercase', marginBottom: 'var(--s3)',
  },
  checkItem: checked => ({
    display: 'flex', alignItems: 'center', gap: 'var(--s3)',
    background: checked ? 'rgba(107,127,94,.08)' : 'var(--white)',
    borderRadius: 'var(--r-md)', padding: 'var(--s3) var(--s4)',
    border: `1px solid ${checked ? 'rgba(107,127,94,.25)' : 'var(--sand)'}`,
    transition: 'background var(--ease-fast), border-color var(--ease-fast)',
    cursor: 'default',
  }),
  checkbox: checked => ({
    width: 22, height: 22, borderRadius: 6, border: `1.5px solid ${checked ? 'var(--moss)' : 'var(--stone)'}`,
    background: checked ? 'var(--moss)' : 'transparent',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 12, color: 'var(--white)', fontWeight: 700, flexShrink: 0,
    cursor: 'pointer', transition: 'background var(--ease-fast), border-color var(--ease-fast)',
  }),

  /* Step 5 */
  accordCard: {
    background: 'var(--white)', borderRadius: 'var(--r-lg)', padding: 'var(--s6)',
    border: '1px solid var(--sand)', display: 'flex', flexDirection: 'column', gap: 'var(--s3)',
  },
  accordSection: {
    fontSize: 'var(--tx-xs)', color: 'var(--bark)', letterSpacing: '.1em',
    textTransform: 'uppercase', marginBottom: 'var(--s1)',
  },
  accordLine: { display: 'flex', alignItems: 'flex-start', gap: 'var(--s3)' },
  accordDot:  { color: 'var(--terracotta)', fontSize: 'var(--tx-xs)', marginTop: 3, flexShrink: 0 },
  signatureInput: {
    width: '100%', border: '1px solid var(--sand)', borderRadius: 'var(--r-sm)',
    padding: 'var(--s3) var(--s4)', background: 'var(--cream)', color: 'var(--earth)',
    fontSize: 'var(--tx-lg)', fontFamily: 'var(--serif)', fontStyle: 'italic',
    outline: 'none',
  },
}
