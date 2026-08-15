import { Link } from 'react-router-dom'
import PublicNav from '../components/PublicNav.jsx'

const SPOTIFY_URL = 'https://open.spotify.com/show/5liGrzBl0uiwExIgSI83Yi?si=5646fb32a5674a0f'

const PLATFORMS = [
  { name: 'Spotify',        url: SPOTIFY_URL,                                          available: true },
  { name: 'Apple Podcasts', url: 'https://podcasts.apple.com/fr/podcast/univers/id1691448467', available: true },
  { name: 'Deezer',         url: 'https://www.deezer.com/fr/show/1000046155',          available: true },
]

export default function Podcast() {
  return (
    <div style={s.page}>
      <PublicNav />

      {/* Hero */}
      <section style={s.hero}>
        <div style={s.inner}>
          <p style={s.eyebrow}>Écouter gratuitement</p>
          <h1 style={s.heroTitle}>Mon podcast</h1>
          <p style={s.heroSub}>
            Ce podcast s'adresse à des personnes comme toi, cherchant à évoluer,
            à dépasser leurs limites et à comprendre les rouages de leur âme.
            C'est un espace pour discuter, réfléchir, rire et grandir ensemble.
            Je te propose une pause dans ton quotidien, un moment authentique
            et un voyage unique où chaque épisode est une nouvelle exploration.
          </p>
          <p style={s.heroSub}>
            Fitness, Développement personnel, Mindset et coaching —
            bienvenue dans mon Univers.
          </p>
          <a href={SPOTIFY_URL} target="_blank" rel="noopener noreferrer" style={s.ctaPrimary}>
            Écouter sur Spotify →
          </a>
        </div>
      </section>

      {/* Où m'écouter */}
      <section style={s.sectionCream}>
        <div style={s.inner}>
          <h2 style={s.sectionTitle}>Où m'écouter</h2>
          <div style={s.platformList}>
            {PLATFORMS.map(({ name, url, available }) =>
              available ? (
                <a key={name} href={url} target="_blank" rel="noopener noreferrer" style={s.platformRow}>
                  <span style={s.platformDot} />
                  <span style={s.platformName}>{name}</span>
                  <span style={s.platformArrow}>Écouter →</span>
                </a>
              ) : (
                <div key={name} style={{ ...s.platformRow, ...s.platformRowMuted }}>
                  <span style={{ ...s.platformDot, background: 'var(--sand)' }} />
                  <span style={{ ...s.platformName, opacity: 0.45 }}>{name}</span>
                  <span style={s.bientotBadge}>Bientôt disponible</span>
                </div>
              )
            )}
          </div>
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
  platformList: {
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid var(--sand)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  platformRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: '18px 24px',
    borderBottom: '1px solid var(--sand)',
    background: 'var(--white)',
    textDecoration: 'none',
    cursor: 'pointer',
  },
  platformRowMuted: {
    cursor: 'default',
  },
  platformDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: 'var(--sage)',
    flexShrink: 0,
  },
  platformName: {
    flex: 1,
    fontFamily: 'var(--sans)',
    fontSize: 15,
    fontWeight: 500,
    color: 'var(--earth)',
  },
  platformArrow: {
    fontFamily: 'var(--sans)',
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--forest)',
    letterSpacing: '0.02em',
  },
  bientotBadge: {
    fontFamily: 'var(--sans)',
    fontSize: 11,
    color: 'var(--stone)',
    background: 'var(--sand)',
    borderRadius: 99,
    padding: '3px 10px',
    letterSpacing: '0.02em',
    whiteSpace: 'nowrap',
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
