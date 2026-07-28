import { useState } from 'react'

const BASE = 'https://omcednuoxfmhyfwmrmmp.supabase.co/storage/v1/object/public/photo-page-vente'

/* ── FAQ accordion item ── */
function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={s.faqItem}>
      <button style={s.faqQ} onClick={() => setOpen(o => !o)} aria-expanded={open}>
        <span>{question}</span>
        <span style={{ ...s.faqChevron, transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>↓</span>
      </button>
      {open && <p style={s.faqA}>{answer}</p>}
    </div>
  )
}

/* ── Objection block ── */
function ObjectionItem({ question, answer }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={s.objItem}>
      <button style={s.objQ} onClick={() => setOpen(o => !o)} aria-expanded={open}>
        <span style={{ flex: 1, textAlign: 'left' }}>"{question}"</span>
        <span style={{ ...s.faqChevron, transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>↓</span>
      </button>
      {open && <p style={s.objA}>{answer}</p>}
    </div>
  )
}

/* ── Emphasis helpers ── */
const Em = ({ children }) => (
  <strong style={{ fontWeight: 600, color: 'var(--forest)' }}>{children}</strong>
)
const EmInverse = ({ children }) => (
  <strong style={{ fontWeight: 600, color: 'var(--cream)' }}>{children}</strong>
)

export default function Vente() {
  function scrollToOffre(e) {
    e.preventDefault()
    document.getElementById('offre')?.scrollIntoView({ behavior: 'smooth' })
  }

  const STRIPE_URL = 'https://buy.stripe.com/28E28r2XvbAjaDj0330co00'

  return (
    <div style={s.page}>

      {/* ── SECTION 1 — HERO (forest gradient) ── */}
      <section style={s.hero}>
        <div style={s.heroInner}>
          <div style={s.heroText}>
            <p style={s.eyebrow}>Programme Déclic · Beta Septembre 2026</p>
            <h1 style={s.heroTitle}>
              Ton corps ne te trahit pas.
              <br />
              <em>Il te parle.</em>
            </h1>
            <p style={s.heroSub}>
              Déclic — 8 semaines pour enfin l'entendre,<br />
              et bouger avec lui, pas contre lui.
            </p>
            <div style={s.heroCtaRow}>
              <a href="#offre" style={s.ctaSecondary} onClick={scrollToOffre}>
                Découvrir le programme ↓
              </a>
              <a href={STRIPE_URL} style={s.ctaTerracottaOutline}>
                Je réserve ma place ✦
              </a>
            </div>
          </div>
          <div style={s.heroImageWrap}>
            <img
              src={`${BASE}/DSC03757.JPG`}
              alt="Studio de pilates — espace d'entraînement lumineux"
              style={s.heroImage}
            />
          </div>
        </div>
      </section>

      {/* ── SECTION 2 — LE CONSTAT (cream) ── */}
      <section style={s.sectionCream}>
        <div style={s.inner}>
          <h2 style={s.sectionTitle}>Tu as déjà essayé.</h2>
          <p style={s.body}>
            Des régimes. Des programmes en ligne. Des coachs. Des applications.
            Peut-être même que ça a marché —{' '}
            <Em>un peu, un temps</Em>.
          </p>
          <p style={s.body}>
            Et puis c'est reparti comme avant. Tu t'es dit que tu n'étais
            pas assez motivée. Pas assez régulière. Pas assez disciplinée.
          </p>
          <p style={{ ...s.body, fontWeight: 600, color: 'var(--earth)', fontStyle: 'italic', fontSize: 20 }}>
            Ce n'est pas vrai.
          </p>
          <p style={s.body}>
            Ce n'est pas un problème de <Em>volonté</Em>.
            C'est un problème de <Em>relation avec ton corps</Em>.
          </p>
        </div>
      </section>

      {/* ── SECTION 3 — LA CONVICTION (image de fond Hyrox + overlay forest) ── */}
      <section style={s.sectionConviction}>
        <div style={s.convictionOverlay} />
        <div style={{ ...s.inner, position: 'relative', zIndex: 1 }}>
          <h2 style={{ ...s.sectionTitle, color: 'var(--cream)' }}>
            Ton corps t'envoie des messages. Depuis longtemps.
          </h2>
          <p style={s.bodyInverse}>
            La tension dans tes épaules. Le ventre noué. Le dos qui bloque
            au mauvais moment.
          </p>
          <p style={s.bodyInverse}>
            Ce ne sont pas des accidents. Ce sont{' '}
            <EmInverse>des signaux</EmInverse> — et tant
            qu'on ne les écoute pas, ils reviennent, ils s'aggravent,
            ils prennent toute la place.
          </p>
          <p style={s.bodyInverse}>
            Ma conviction : le corps n'est pas ton ennemi.{' '}
            <EmInverse>Il est ton allié</EmInverse>{' '}
            — encore faut-il apprendre sa langue.
          </p>
          <p style={{ ...s.bodyInverse, borderLeft: '3px solid var(--terracotta)', paddingLeft: 20, fontStyle: 'italic' }}>
            Déclic, c'est exactement ça : le moment où tu{' '}
            <EmInverse>arrêtes de subir</EmInverse>,
            et où tu <EmInverse>commences à comprendre</EmInverse>.
          </p>
        </div>
      </section>

      {/* ── SECTION 4 — QUI JE SUIS (forest) ── */}
      <section style={s.sectionForest}>
        <div style={s.innerWide}>
          <div style={s.quiLayout}>
            <div style={s.quiImageWrap}>
              <img
                src={`${BASE}/A601426C-48A3-41BE-B1A9-6A73B2ABB531.JPG`}
                alt="Portrait de Lysandréa, coach sportive et émotionnelle"
                style={s.quiImage}
              />
            </div>
            <div style={s.quiText}>
              <h2 style={{ ...s.sectionTitle, color: 'var(--cream)' }}>Qui suis-je ?</h2>
              <p style={s.bodyInverse}>
                J'ai traversé l'anorexie, puis la boulimie. Le sport a longtemps
                été <EmInverse>une punition</EmInverse> avant de devenir{' '}
                <EmInverse>une réconciliation</EmInverse>.
              </p>
              <p style={s.bodyInverse}>
                Aujourd'hui je suis athlète Hyrox, je m'entraîne dur — mais
                avec mon corps, <EmInverse>plus jamais contre lui</EmInverse>.
              </p>
              <p style={s.bodyInverse}>
                Je suis coach sportive et émotionnelle. En cours de certification
                en coaching sportif, déjà diplômée en coaching mental et émotionnel.
                J'ai construit Déclic comme <EmInverse>le programme que j'aurais aimé qu'on
                me propose</EmInverse>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 5 — L'OFFRE (cream, photos en colonne latérale) ── */}
      <section id="offre" style={s.sectionCream}>
        <div style={s.innerWide}>
          <div style={s.offreLayout}>
            <div style={s.offreLeft}>
              <h2 style={s.sectionTitle}>Ce que tu vas vivre pendant 8 semaines</h2>
              <div style={s.cardsGrid}>
                {OFFRE_CARDS.map(c => (
                  <div key={c.icon} style={s.card}>
                    <span style={s.cardIcon}>{c.icon}</span>
                    <strong style={s.cardTitle}>{c.title}</strong>
                    <p style={s.cardDesc}>{c.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div style={s.offreRight}>
              <img
                src={`${BASE}/IMG_1382.JPG`}
                alt="Lysandréa en compétition Hyrox"
                style={s.offrePhoto}
              />
              <img
                src={`${BASE}/IMG_2325.JPG`}
                alt="Effort et puissance en compétition"
                style={s.offrePhoto}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA APRÈS L'OFFRE ── */}
      <div style={s.ctaInterlude}>
        <a href={STRIPE_URL} style={s.ctaPrimary}>
          Je réserve ma place →
        </a>
        <p style={s.ctaInterludeNote}>10 places · Beta septembre 2026 · 179€</p>
      </div>

      {/* ── SECTION 6 — CE QUE CE N'EST PAS (white + sand card) ── */}
      <section style={s.sectionWhite}>
        <div style={s.inner}>
          <div style={s.disclaimerCard}>
            <p style={s.disclaimerText}>
              Je ne suis pas thérapeute, ni nutritionniste. Ce n'est pas
              un programme de performance, ni <Em>un régime déguisé</Em>.
            </p>
            <p style={s.disclaimerText}>
              C'est un accompagnement sport et émotionnel, pensé pour
              une seule chose : que tu arrêtes de{' '}
              <Em>te battre contre ton corps</Em>.
            </p>
          </div>
        </div>
      </section>

      {/* ── SECTION 7 — OBJECTIONS (cream) ── */}
      <section style={s.sectionCream}>
        <div style={s.inner}>
          <h2 style={s.sectionTitle}>Ce que tu te dis peut-être en ce moment</h2>
          <div style={s.objList}>
            <ObjectionItem
              question="Et si ça ne marche pas pour moi ?"
              answer={<>Ce n'est pas un programme générique.{' '}
                <Em>Il s'adapte à toi</Em>, à ton histoire, à ton rythme.
                On n'avance jamais plus vite que{' '}
                <Em>ce que ton corps peut entendre</Em>.</>}
            />
            <ObjectionItem
              question="Je n'ai jamais réussi à être régulière"
              answer={<>C'est exactement pour ça que{' '}
                <Em>tu n'es pas seule</Em> dans ce programme. Chaque semaine,
                je suis là. Si tu décroches, je le vois, et on ajuste ensemble.</>}
            />
            <ObjectionItem
              question="J'ai peur que ça redevienne une obsession"
              answer={<>Il n'y a pas d'objectif chiffré ici. Il y a{' '}
                <Em>toi, ton corps</Em>, et un cadre bienveillant pour apprendre
                à travailler avec lui — <Em>pas contre lui</Em>.</>}
            />
          </div>
        </div>
      </section>

      {/* ── SECTION 8 — LE PRIX (white, prominent forest card) ── */}
      <section style={s.sectionWhite}>
        <div style={s.inner}>
          <h2 style={s.sectionTitle}>Une offre beta — parce que c'est un vrai début</h2>
          <p style={s.body}>
            Je lance Déclic en beta. Ça veut dire une chose simple :
            je veux les retours de mes 10 premières clientes pour affiner
            encore ce que je propose. En échange, vous avez un accès complet,
            à <Em>un tarif qui ne reviendra pas</Em>.
          </p>
          <div style={s.prixCard}>
            <p style={s.prixSub}>Déclic · 8 semaines · 10 places seulement</p>
            <div style={s.prixRow}>
              <span style={s.prixBarre}>349€</span>
              <span style={s.prixMain}>179€</span>
            </div>
            <a href={STRIPE_URL} style={s.ctaPrimary}>
              Je réserve ma place
            </a>
            <p style={s.prixNote}>Paiement sécurisé · Places attribuées dans l'ordre d'inscription</p>
          </div>
        </div>
      </section>

      {/* ── SECTION 9 — FAQ (cream) ── */}
      <section style={s.sectionCream}>
        <div style={s.inner}>
          <h2 style={s.sectionTitle}>Questions fréquentes</h2>
          <div style={s.faqList}>
            <FaqItem
              question="Comment se passe le suivi au quotidien ?"
              answer="On travaille principalement par vocal et message. Chaque semaine, tu reçois ton programme, on fait un point ensemble sur ce qui s'est passé, et j'ajuste selon tes retours. Tu n'es jamais livrée à toi-même."
            />
            <FaqItem
              question="Est-ce que je dois avoir déjà une pratique sportive ?"
              answer="Pas du tout. Le programme s'adapte à ton niveau, qu'il soit débutant ou confirmé. Ce qui compte, c'est où tu en es toi — pas où tu penses que tu devrais être."
            />
            <FaqItem
              question="Qu'est-ce qui se passe après le paiement ?"
              answer="Après le paiement, tu reçois un email avec ton accès direct à la plateforme. Tu peux créer ton compte et remplir ton questionnaire de démarrage en toute autonomie — c'est pensé pour ça. Si tu préfères être accompagnée pour le remplir ensemble, tu peux réserver un rendez-vous gratuit de 30 minutes avec moi."
            />
            <FaqItem
              question="Combien de temps par semaine il faut prévoir ?"
              answer="Environ 3 à 5 heures pour les séances sport, plus quelques minutes par jour pour les check-ins et ton journal. On construit à ton rythme — rien n'est figé."
            />
          </div>
        </div>
      </section>

      {/* ── SECTION 10 — CTA FINAL (forest) ── */}
      <section style={{ ...s.sectionForest, textAlign: 'center' }}>
        <div style={{ ...s.inner, alignItems: 'center' }}>
          <h2 style={{ ...s.sectionTitle, color: 'var(--cream)', textAlign: 'center' }}>
            10 places. Une seule fois à ce prix.
          </h2>
          <p style={{ ...s.bodyInverse, maxWidth: 540, textAlign: 'center', opacity: 0.85 }}>
            Si tu sens que quelque chose doit changer dans ta relation
            à ton corps — c'est le moment de vivre ton Déclic.
          </p>
          <a href={STRIPE_URL} style={{ ...s.ctaPrimary, marginTop: 8 }}>
            Je réserve ma place — 179€
          </a>
        </div>
      </section>

    </div>
  )
}

/* ── Data ── */
const OFFRE_CARDS = [
  {
    icon: '🏃',
    title: 'Volet sport',
    desc: 'Un programme adapté à toi — pas à un idéal, à ta réalité, ton rythme, ton histoire.',
  },
  {
    icon: '🧠',
    title: 'Volet émotionnel',
    desc: 'Décoder ce que ton corps te dit, semaine après semaine.',
  },
  {
    icon: '💬',
    title: 'Suivi personnalisé',
    desc: "Un point hebdomadaire avec moi — vocal ou message, tu n'es jamais seule.",
  },
  {
    icon: '📓',
    title: 'Ton espace personnel',
    desc: 'Ton programme, ton journal, ta roue de la vie — avant/après.',
  },
  {
    icon: '🎯',
    title: 'Bilans réguliers',
    desc: 'Pour ajuster en continu, jamais figé.',
  },
]

/* ── Styles ── */
const s = {
  page: {
    fontFamily: 'var(--font-sans)',
    color: 'var(--bark)',
    background: 'var(--cream)',
  },

  /* Section backgrounds */
  sectionCream: {
    padding: '100px 24px',
    display: 'flex',
    justifyContent: 'center',
    background: 'var(--cream)',
  },
  sectionWhite: {
    padding: '100px 24px',
    display: 'flex',
    justifyContent: 'center',
    background: 'var(--white)',
  },
  sectionForest: {
    padding: '100px 24px',
    display: 'flex',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #3D4F3C 0%, #4d6349 100%)',
  },
  sectionConviction: {
    padding: '100px 24px',
    display: 'flex',
    justifyContent: 'center',
    position: 'relative',
    backgroundImage: `url(${BASE}/IMG_2275.JPG)`,
    backgroundSize: 'cover',
    backgroundPosition: 'center 30%',
  },
  convictionOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(44,57,43,0.80)',
    zIndex: 0,
  },

  /* Hero */
  hero: {
    background: 'linear-gradient(135deg, #3D4F3C 0%, #4d6349 100%)',
    padding: '100px 40px',
    display: 'flex',
    justifyContent: 'center',
  },
  heroInner: {
    maxWidth: 1100,
    width: '100%',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 60,
    alignItems: 'center',
  },
  heroText: {
    display: 'flex',
    flexDirection: 'column',
    gap: 28,
  },
  heroImageWrap: {
    flexShrink: 0,
  },
  heroImage: {
    width: '100%',
    height: 520,
    objectFit: 'cover',
    borderRadius: 16,
    border: '1px solid rgba(232,221,208,0.25)',
    display: 'block',
  },
  eyebrow: {
    fontFamily: 'var(--font-sans)',
    fontSize: 11,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: 'var(--sage)',
    margin: 0,
  },
  heroTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: 'clamp(40px, 5vw, 64px)',
    fontWeight: 400,
    color: 'var(--cream)',
    lineHeight: 1.15,
    letterSpacing: '-0.01em',
    margin: 0,
  },
  heroSub: {
    fontFamily: 'var(--font-sans)',
    fontSize: 17,
    color: 'rgba(245,240,232,0.8)',
    lineHeight: 1.8,
    margin: 0,
    maxWidth: 460,
  },
  heroCtaRow: {
    display: 'flex',
    gap: 16,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  ctaSecondary: {
    display: 'inline-block',
    padding: '14px 28px',
    borderRadius: 8,
    border: '1.5px solid rgba(245,240,232,0.45)',
    color: 'var(--cream)',
    fontFamily: 'var(--font-sans)',
    fontSize: 14,
    fontWeight: 500,
    letterSpacing: '0.03em',
    textDecoration: 'none',
    cursor: 'pointer',
  },
  ctaTerracottaOutline: {
    display: 'inline-block',
    padding: '14px 28px',
    borderRadius: 8,
    border: '1.5px solid var(--terracotta)',
    color: 'var(--terracotta)',
    background: 'transparent',
    fontFamily: 'var(--font-sans)',
    fontSize: 14,
    fontWeight: 500,
    letterSpacing: '0.03em',
    cursor: 'pointer',
  },

  /* Content containers */
  inner: {
    maxWidth: 720,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 28,
  },
  innerWide: {
    maxWidth: 1100,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 28,
  },

  /* Section 4 — Qui je suis */
  quiLayout: {
    display: 'flex',
    gap: 64,
    alignItems: 'center',
  },
  quiImageWrap: {
    flexShrink: 0,
    width: 380,
  },
  quiImage: {
    width: '100%',
    height: 500,
    objectFit: 'cover',
    borderRadius: 16,
    border: '1px solid rgba(232,221,208,0.2)',
    display: 'block',
  },
  quiText: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
  },

  /* Section 5 — L'offre layout */
  offreLayout: {
    display: 'flex',
    gap: 48,
    alignItems: 'flex-start',
  },
  offreLeft: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 28,
    minWidth: 0,
  },
  offreRight: {
    flexShrink: 0,
    width: 260,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  offrePhoto: {
    width: '100%',
    height: 240,
    objectFit: 'cover',
    borderRadius: 16,
    display: 'block',
  },

  /* CTA interlude */
  ctaInterlude: {
    padding: '52px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 14,
    background: 'var(--cream)',
    borderTop: '1px solid var(--sand)',
    borderBottom: '1px solid var(--sand)',
  },
  ctaInterludeNote: {
    fontFamily: 'var(--font-sans)',
    fontSize: 12,
    color: 'var(--bark)',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    margin: 0,
    opacity: 0.7,
  },

  /* Typography */
  sectionTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: 'clamp(28px, 4vw, 42px)',
    fontWeight: 400,
    color: 'var(--earth)',
    letterSpacing: '-0.01em',
    lineHeight: 1.2,
    margin: 0,
  },
  body: {
    fontFamily: 'var(--font-sans)',
    fontSize: 16,
    color: 'var(--bark)',
    lineHeight: 1.85,
    margin: 0,
  },
  bodyInverse: {
    fontFamily: 'var(--font-sans)',
    fontSize: 16,
    color: 'rgba(245,240,232,0.85)',
    lineHeight: 1.85,
    margin: 0,
  },

  /* Cards */
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: 16,
  },
  card: {
    background: 'var(--white)',
    border: '1px solid var(--sand)',
    borderRadius: 12,
    padding: '28px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  cardIcon: {
    fontSize: 28,
    lineHeight: 1,
  },
  cardTitle: {
    fontFamily: 'var(--font-sans)',
    fontSize: 15,
    fontWeight: 600,
    color: 'var(--earth)',
    letterSpacing: '0.01em',
  },
  cardDesc: {
    fontFamily: 'var(--font-sans)',
    fontSize: 14,
    color: 'var(--bark)',
    lineHeight: 1.7,
    margin: 0,
  },

  /* Section 6 — disclaimer */
  disclaimerCard: {
    background: 'var(--sand)',
    borderRadius: 16,
    padding: '40px 44px',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  disclaimerText: {
    fontFamily: 'var(--font-sans)',
    fontSize: 15,
    color: 'var(--earth)',
    lineHeight: 1.8,
    margin: 0,
    fontStyle: 'italic',
  },

  /* Section 7 — Objections */
  objList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
    border: '1px solid var(--sand)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  objItem: {
    borderBottom: '1px solid var(--sand)',
  },
  objQ: {
    width: '100%',
    padding: '20px 24px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'var(--font-sans)',
    fontSize: 15,
    color: 'var(--earth)',
    fontStyle: 'italic',
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    textAlign: 'left',
  },
  objA: {
    fontFamily: 'var(--font-sans)',
    fontSize: 14,
    color: 'var(--bark)',
    lineHeight: 1.8,
    margin: 0,
    padding: '0 24px 20px',
  },

  /* Section 8 — Prix */
  prixCard: {
    background: 'linear-gradient(135deg, #3D4F3C 0%, #4d6349 100%)',
    borderRadius: 20,
    padding: '56px 48px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 20,
    textAlign: 'center',
    boxShadow: '0 12px 48px rgba(61,79,60,0.18)',
  },
  prixSub: {
    fontFamily: 'var(--font-sans)',
    fontSize: 11,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: 'var(--sage)',
    margin: 0,
  },
  prixRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 16,
  },
  prixBarre: {
    fontFamily: 'var(--font-serif)',
    fontSize: 28,
    color: 'rgba(253,250,246,0.4)',
    textDecoration: 'line-through',
  },
  prixMain: {
    fontFamily: 'var(--font-serif)',
    fontSize: 72,
    fontWeight: 400,
    color: 'var(--cream)',
    lineHeight: 1,
    letterSpacing: '-0.02em',
  },
  ctaPrimary: {
    display: 'inline-block',
    padding: '18px 44px',
    borderRadius: 8,
    border: 'none',
    background: 'var(--terracotta)',
    color: 'var(--white)',
    fontFamily: 'var(--font-sans)',
    fontSize: 15,
    fontWeight: 500,
    letterSpacing: '0.03em',
    cursor: 'pointer',
    transition: 'opacity 0.15s',
  },
  prixNote: {
    fontFamily: 'var(--font-sans)',
    fontSize: 12,
    color: 'rgba(253,250,246,0.5)',
    margin: 0,
    letterSpacing: '0.02em',
  },

  /* Section 9 — FAQ */
  faqList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
    border: '1px solid var(--sand)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  faqItem: {
    borderBottom: '1px solid var(--sand)',
  },
  faqQ: {
    width: '100%',
    padding: '20px 24px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'var(--font-sans)',
    fontSize: 15,
    color: 'var(--earth)',
    fontWeight: 500,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    textAlign: 'left',
  },
  faqChevron: {
    fontSize: 14,
    color: 'var(--stone)',
    transition: 'transform 0.2s',
    flexShrink: 0,
  },
  faqA: {
    fontFamily: 'var(--font-sans)',
    fontSize: 14,
    color: 'var(--bark)',
    lineHeight: 1.8,
    margin: 0,
    padding: '0 24px 20px',
  },
}
