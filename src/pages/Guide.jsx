import { Link } from 'react-router-dom'
import PublicNav from '../components/PublicNav.jsx'

const GUIDE_URL = 'https://94bcc678.sibforms.com/serve/MUIFAFJRejjbwMVSXnUPUdx2A7TfkRFu8BKbxBryVM1jN8z1hffu-gEspOg4srHyCemTljSc88-wF9oACM9gKTt4qMlRhrrBjXuVtd-wOX6JdW0M9JhpUU23MMk4ob9BHeR7m9YTtjJFy9O38yqfSYI32IHjoFBiXCuu10k0YLX6_doLtvbC5Z28fXUy3hCrQ_leK1dn6ZtnDfpfTQ=='

const POINTS = [
  { emoji: '🧠', text: 'Comprendre les signaux que t\'envoie ton corps — et pourquoi tu les ignores' },
  { emoji: '💪', text: 'Reprendre contact avec ton énergie, sans te forcer ni te punir' },
  { emoji: '🌿', text: 'Des outils concrets pour avancer à ton rythme, semaine après semaine' },
  { emoji: '✨', text: 'Une invitation à devenir ton propre coach — avec bienveillance' },
]

export default function Guide() {
  return (
    <div style={s.page}>
      <PublicNav />

      {/* Hero */}
      <section style={s.hero}>
        <div style={s.inner}>
          <p style={s.eyebrow}>Gratuit — téléchargement immédiat</p>
          <h1 style={s.heroTitle}>Mon guide gratuit</h1>
          <p style={s.heroSub}>
            Un guide pour renouer avec ton corps, retrouver de l'énergie
            et construire une routine qui te ressemble vraiment.
            Sans injonctions. Sans perfection.
          </p>
          <a href={GUIDE_URL} target="_blank" rel="noopener noreferrer" style={s.ctaPrimary}>
            Télécharger le guide →
          </a>
        </div>
      </section>

      {/* Ce que tu vas y trouver */}
      <section style={s.sectionCream}>
        <div style={s.inner}>
          <h2 style={s.sectionTitle}>Ce que tu vas y trouver</h2>
          <div style={s.pointList}>
            {POINTS.map(({ emoji, text }) => (
              <div key={text} style={s.pointRow}>
                <span style={s.pointEmoji}>{emoji}</span>
                <p style={s.pointText}>{text}</p>
              </div>
            ))}
          </div>
          <a href={GUIDE_URL} target="_blank" rel="noopener noreferrer" style={s.ctaSecondary}>
            Télécharger le guide →
          </a>
        </div>
      </section>

      {/* Back */}
      <div style={s.backRow}>
        <Link to="/vente" style={s.backLink}>← Découvrir le programme Déclic</Link>
      </div>
    </div>
  )
}

const s = {
  page: {
    fontFamily: 'var(--sans)',
    color: 'var(--bark)',
    background: 'var(--cream)',
    minHeight: '100vh',
  },
  hero: {
    background: 'linear-gradient(135deg, #3D4F3C 0%, #4d6349 100%)',
    padding: 'clamp(60px, 10vw, 120px) clamp(24px, 5vw, 80px)',
    display: 'flex',
    justifyContent: 'center',
  },
  sectionCream: {
    padding: 'clamp(56px, 8vw, 96px) clamp(24px, 5vw, 80px)',
    display: 'flex',
    justifyContent: 'center',
    background: 'var(--cream)',
  },
  inner: {
    maxWidth: 620,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 28,
  },
  eyebrow: {
    fontFamily: 'var(--sans)',
    fontSize: 11,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: 'var(--sage)',
    margin: 0,
  },
  heroTitle: {
    fontFamily: 'var(--serif)',
    fontSize: 'clamp(36px, 6vw, 64px)',
    fontWeight: 400,
    color: 'var(--cream)',
    lineHeight: 1.15,
    letterSpacing: '-0.01em',
    margin: 0,
  },
  heroSub: {
    fontFamily: 'var(--sans)',
    fontSize: 16,
    color: 'rgba(245,240,232,0.82)',
    lineHeight: 1.85,
    margin: 0,
    maxWidth: 520,
  },
  sectionTitle: {
    fontFamily: 'var(--serif)',
    fontSize: 'clamp(26px, 4vw, 36px)',
    fontWeight: 400,
    color: 'var(--earth)',
    letterSpacing: '-0.01em',
    lineHeight: 1.2,
    margin: 0,
  },
  ctaPrimary: {
    display: 'inline-block',
    padding: '15px 36px',
    borderRadius: 8,
    border: 'none',
    background: 'var(--terracotta)',
    color: '#fff',
    fontFamily: 'var(--sans)',
    fontSize: 15,
    fontWeight: 500,
    letterSpacing: '0.03em',
    textDecoration: 'none',
    alignSelf: 'flex-start',
  },
  ctaSecondary: {
    display: 'inline-block',
    padding: '14px 32px',
    borderRadius: 8,
    border: '1.5px solid var(--forest)',
    background: 'transparent',
    color: 'var(--forest)',
    fontFamily: 'var(--sans)',
    fontSize: 15,
    fontWeight: 500,
    letterSpacing: '0.03em',
    textDecoration: 'none',
    alignSelf: 'flex-start',
  },
  pointList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  pointRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 16,
    padding: '16px 20px',
    background: 'var(--white)',
    borderRadius: 12,
    border: '1px solid var(--sand)',
  },
  pointEmoji: {
    fontSize: 22,
    flexShrink: 0,
    lineHeight: 1.4,
  },
  pointText: {
    fontFamily: 'var(--sans)',
    fontSize: 15,
    color: 'var(--earth)',
    lineHeight: 1.6,
    margin: 0,
  },
  backRow: {
    padding: '32px clamp(24px, 5vw, 80px) 56px',
    display: 'flex',
    justifyContent: 'center',
    background: 'var(--cream)',
    borderTop: '1px solid var(--sand)',
  },
  backLink: {
    fontFamily: 'var(--sans)',
    fontSize: 13,
    color: 'var(--bark)',
    textDecoration: 'none',
    opacity: 0.7,
    letterSpacing: '0.02em',
  },
}
