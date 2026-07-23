import { useState } from 'react'

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

export default function Vente() {
  function scrollToOffre(e) {
    e.preventDefault()
    document.getElementById('offre')?.scrollIntoView({ behavior: 'smooth' })
  }

  function handleCTA(e) {
    e.preventDefault()
    console.log('stripe checkout')
  }

  return (
    <div style={s.page}>

      {/* ── SECTION 1 — HERO ── */}
      <section style={s.hero}>
        <div style={s.heroInner}>
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
          <a href="#offre" style={s.ctaSecondary} onClick={scrollToOffre}>
            Découvrir le programme ↓
          </a>
        </div>
      </section>

      {/* ── SECTION 2 — LE CONSTAT ── */}
      <section style={s.section}>
        <div style={s.inner}>
          <h2 style={s.sectionTitle}>Tu as déjà essayé.</h2>
          <p style={s.body}>
            Des régimes. Des programmes en ligne. Des coachs. Des applications.
            Peut-être même que ça a marché — un peu, un temps.
          </p>
          <p style={s.body}>
            Et puis c'est reparti comme avant. Tu t'es dit que tu n'étais
            pas assez motivée. Pas assez régulière. Pas assez disciplinée.
          </p>
          <p style={{ ...s.body, fontWeight: 600, color: 'var(--earth)', fontStyle: 'italic', fontSize: 20 }}>
            Ce n'est pas vrai.
          </p>
          <p style={s.body}>
            Ce n'est pas un problème de volonté. C'est un problème de
            relation avec ton corps.
          </p>
        </div>
      </section>

      {/* ── SECTION 3 — LA CONVICTION ── */}
      <section style={{ ...s.section, background: 'var(--white)' }}>
        <div style={s.inner}>
          <h2 style={s.sectionTitle}>Ton corps t'envoie des messages. Depuis longtemps.</h2>
          <p style={s.body}>
            La tension dans tes épaules. Le ventre noué. Le dos qui bloque
            au mauvais moment.
          </p>
          <p style={s.body}>
            Ce ne sont pas des accidents. Ce sont des signaux — et tant
            qu'on ne les écoute pas, ils reviennent, ils s'aggravent,
            ils prennent toute la place.
          </p>
          <p style={s.body}>
            Ma conviction : le corps n'est pas ton ennemi. Il est ton allié
            — encore faut-il apprendre sa langue.
          </p>
          <p style={{ ...s.body, borderLeft: '3px solid var(--terracotta)', paddingLeft: 20, fontStyle: 'italic' }}>
            Déclic, c'est exactement ça : le moment où tu arrêtes de subir,
            et où tu commences à comprendre.
          </p>
        </div>
      </section>

      {/* ── SECTION 4 — QUI JE SUIS ── */}
      <section style={s.section}>
        <div style={s.inner}>
          <h2 style={s.sectionTitle}>Pourquoi moi</h2>
          <p style={s.body}>
            J'ai traversé l'anorexie, puis la boulimie. Le sport a longtemps
            été une punition avant de devenir une réconciliation.
          </p>
          <p style={s.body}>
            Aujourd'hui je suis athlète Hyrox, je m'entraîne dur — mais
            avec mon corps, plus jamais contre lui.
          </p>
          <p style={s.body}>
            Je suis coach sportive et émotionnelle. En cours de certification
            en coaching sportif, déjà diplômée en coaching mental et émotionnel.
            J'ai construit Déclic comme le programme que j'aurais aimé qu'on
            me propose.
          </p>
        </div>
      </section>

      {/* ── SECTION 5 — L'OFFRE ── */}
      <section id="offre" style={{ ...s.section, background: 'var(--white)' }}>
        <div style={s.inner}>
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
      </section>

      {/* ── SECTION 6 — CE QUE CE N'EST PAS ── */}
      <section style={s.section}>
        <div style={s.inner}>
          <div style={s.disclaimerCard}>
            <p style={s.disclaimerText}>
              Je ne suis pas thérapeute, ni nutritionniste. Ce n'est pas
              un programme de performance, ni un régime déguisé.
            </p>
            <p style={s.disclaimerText}>
              C'est un accompagnement sport et émotionnel, pensé pour
              une seule chose : que tu arrêtes de te battre contre ton corps.
            </p>
          </div>
        </div>
      </section>

      {/* ── SECTION 7 — OBJECTIONS ── */}
      <section style={{ ...s.section, background: 'var(--white)' }}>
        <div style={s.inner}>
          <h2 style={s.sectionTitle}>Ce que tu te dis peut-être en ce moment</h2>
          <div style={s.objList}>
            <ObjectionItem
              question="Et si ça ne marche pas pour moi ?"
              answer="Ce n'est pas un programme générique. Il s'adapte à toi, à ton histoire, à ton rythme. On n'avance jamais plus vite que ce que ton corps peut entendre."
            />
            <ObjectionItem
              question="Je n'ai jamais réussi à être régulière"
              answer="C'est exactement pour ça que tu n'es pas seule dans ce programme. Chaque semaine, je suis là. Si tu décroches, je le vois, et on ajuste ensemble."
            />
            <ObjectionItem
              question="J'ai peur que ça redevienne une obsession"
              answer="Il n'y a pas d'objectif chiffré ici. Il y a toi, ton corps, et un cadre bienveillant pour apprendre à travailler avec lui — pas contre lui."
            />
          </div>
        </div>
      </section>

      {/* ── SECTION 8 — LE PRIX ── */}
      <section style={s.section}>
        <div style={s.inner}>
          <h2 style={s.sectionTitle}>Une offre beta — parce que c'est un vrai début</h2>
          <p style={s.body}>
            Je lance Déclic en beta. Ça veut dire une chose simple :
            je veux les retours de mes 10 premières clientes pour affiner
            encore ce que je propose. En échange, vous avez un accès complet,
            à un tarif qui ne reviendra pas.
          </p>
          <div style={s.prixCard}>
            <p style={s.prixSub}>Déclic · 8 semaines · 10 places seulement</p>
            <div style={s.prixRow}>
              <span style={s.prixBarre}>349€</span>
              <span style={s.prixMain}>179€</span>
            </div>
            <button style={s.ctaPrimary} onClick={handleCTA}>
              Je réserve ma place
            </button>
            <p style={s.prixNote}>Paiement sécurisé · Places attribuées dans l'ordre d'inscription</p>
          </div>
        </div>
      </section>

      {/* ── SECTION 9 — FAQ ── */}
      <section style={{ ...s.section, background: 'var(--white)' }}>
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
              answer="Tu reçois un email avec un questionnaire de démarrage pour que je puisse te connaître avant qu'on commence. Ensuite on planifie un premier échange pour poser les bases ensemble."
            />
            <FaqItem
              question="Combien de temps par semaine il faut prévoir ?"
              answer="Environ 3 à 5 heures pour les séances sport, plus quelques minutes par jour pour les check-ins et ton journal. On construit à ton rythme — rien n'est figé."
            />
          </div>
        </div>
      </section>

      {/* ── SECTION 10 — CTA FINAL ── */}
      <section style={{ ...s.section, background: 'var(--forest)', textAlign: 'center' }}>
        <div style={{ ...s.inner, alignItems: 'center' }}>
          <h2 style={{ ...s.sectionTitle, color: 'var(--white)' }}>
            10 places. Une seule fois à ce prix.
          </h2>
          <p style={{ ...s.body, color: 'rgba(253,250,246,0.8)', maxWidth: 540, textAlign: 'center' }}>
            Si tu sens que quelque chose doit changer dans ta relation
            à ton corps — c'est le moment de vivre ton Déclic.
          </p>
          <button style={{ ...s.ctaPrimary, marginTop: 8 }} onClick={handleCTA}>
            Je réserve ma place — 179€
          </button>
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
    desc: 'Un point hebdomadaire avec moi — vocal ou message, tu n\'es jamais seule.',
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
  hero: {
    background: 'var(--cream)',
    padding: '100px 24px 80px',
    display: 'flex',
    justifyContent: 'center',
  },
  heroInner: {
    maxWidth: 680,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: 24,
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
    fontSize: 'clamp(40px, 6vw, 68px)',
    fontWeight: 400,
    color: 'var(--earth)',
    lineHeight: 1.15,
    letterSpacing: '-0.01em',
    margin: 0,
  },
  heroSub: {
    fontFamily: 'var(--font-sans)',
    fontSize: 17,
    color: 'var(--bark)',
    lineHeight: 1.8,
    margin: 0,
    maxWidth: 520,
  },
  ctaSecondary: {
    display: 'inline-block',
    padding: '14px 28px',
    borderRadius: 8,
    border: '1.5px solid var(--forest)',
    color: 'var(--forest)',
    fontFamily: 'var(--font-sans)',
    fontSize: 14,
    fontWeight: 500,
    letterSpacing: '0.03em',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  section: {
    padding: '80px 24px',
    display: 'flex',
    justifyContent: 'center',
    background: 'var(--cream)',
  },
  inner: {
    maxWidth: 720,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
  },
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
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: 16,
  },
  card: {
    background: 'var(--cream)',
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
  disclaimerCard: {
    background: 'var(--sand)',
    borderRadius: 12,
    padding: '32px 36px',
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
  prixCard: {
    background: 'var(--forest)',
    borderRadius: 16,
    padding: '48px 40px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 20,
    textAlign: 'center',
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
    fontSize: 64,
    fontWeight: 400,
    color: 'var(--white)',
    lineHeight: 1,
    letterSpacing: '-0.02em',
  },
  ctaPrimary: {
    display: 'inline-block',
    padding: '18px 40px',
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
