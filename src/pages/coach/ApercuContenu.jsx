import { RECETTES, RecetteDetail, recettesStyles as rs } from '../cliente/Recettes.jsx'
import { PODCASTS }                                       from '../cliente/Podcasts.jsx'
import { ZONES }                                          from '../cliente/PourquoiJaiMal.jsx'

export default function ApercuContenu() {
  return (
    <div style={s.page}>

      {/* Banner */}
      <div style={s.banner}>
        <span style={s.bannerIcon}>👁️</span>
        <div>
          <p style={s.bannerTitle}>Aperçu contenu cliente</p>
          <p style={s.bannerSub}>Vue coach — tout est débloqué. Ce n'est pas visible par les clientes tant que leur programme n'est pas publié.</p>
        </div>
      </div>

      {/* ── Section 1 : Recettes ── */}
      <section style={s.section}>
        <h2 style={s.sectionTitle}>🍲 Recettes — Le rendez-vous gourmand</h2>
        <p style={s.sectionSub}>8 recettes, une par semaine. Seule la semaine 1 est finalisée.</p>
        <div style={rs.list}>
          {RECETTES.map(({ sem, titre, content }) => {
            if (content) {
              return <RecetteDetail key={sem} sem={sem} titre={titre} content={content} />
            }
            return (
              <div key={sem} style={rs.card}>
                <div style={rs.cardLeft}>
                  <div style={rs.semBadge}>S{sem}</div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={rs.cardTop}>
                    <p style={rs.cardTitle}>{titre}</p>
                    <span style={s.placeholder}>À rédiger</span>
                  </div>
                  <p style={rs.cardDesc}>Contenu placeholder — recette à ajouter.</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Section 2 : Podcasts ── */}
      <section style={s.section}>
        <h2 style={s.sectionTitle}>🎙️ Podcasts</h2>
        <p style={s.sectionSub}>8 épisodes, un par semaine. Contenus audio à venir.</p>
        <div style={ps.list}>
          {PODCASTS.map(({ sem, titre }) => (
            <div key={sem} style={ps.card}>
              <div style={ps.cardLeft}>
                <div style={ps.semBadge}>S{sem}</div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={ps.cardTop}>
                  <p style={ps.cardTitle}>{titre}</p>
                  <span style={s.placeholder}>À enregistrer</span>
                </div>
                <p style={ps.cardDesc}>Épisode à venir — contenu audio en cours d'ajout.</p>
                <div style={ps.cardMeta}>
                  <span style={ps.metaItem}>🎙️ Semaine {sem}</span>
                  <button style={ps.playBtn} disabled>▶ Bientôt disponible</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 3 : Pourquoi j'ai mal ── */}
      <section style={s.section}>
        <h2 style={s.sectionTitle}>🩹 Pourquoi j'ai mal</h2>
        <p style={s.sectionSub}>8 zones corporelles. Clique sur une zone pour voir son contenu dans un nouvel onglet.</p>
        <div style={zs.grid}>
          {ZONES.map(({ label, emoji }) => (
            <a
              key={label}
              href={`/pourquoi-jai-mal/${encodeURIComponent(label)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={zs.zoneCard}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--sh-md)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'var(--shadow-sm)' }}
            >
              <span style={{ fontSize: '2rem' }}>{emoji}</span>
              <span style={zs.zoneLabel}>{label}</span>
              <span style={zs.zoneArrow}>↗</span>
            </a>
          ))}
        </div>
      </section>

    </div>
  )
}

const s = {
  page:         { padding: 'var(--s8) var(--s6)', maxWidth: 800, display: 'flex', flexDirection: 'column', gap: 'var(--s10)' },
  banner:       { display: 'flex', alignItems: 'flex-start', gap: 'var(--s4)', background: 'rgba(61,79,60,.07)', border: '1px solid rgba(61,79,60,.15)', borderRadius: 'var(--r-md)', padding: 'var(--s5) var(--s6)' },
  bannerIcon:   { fontSize: '1.4rem', flexShrink: 0, marginTop: 2 },
  bannerTitle:  { fontSize: 'var(--tx-sm)', fontWeight: 600, color: 'var(--forest)', margin: 0 },
  bannerSub:    { fontSize: 'var(--tx-xs)', color: 'var(--stone)', marginTop: 3, lineHeight: 1.5 },
  section:      { display: 'flex', flexDirection: 'column', gap: 'var(--s5)' },
  sectionTitle: { fontFamily: 'var(--serif)', fontSize: 'var(--tx-xl)', fontWeight: 400, color: 'var(--forest)', margin: 0 },
  sectionSub:   { fontSize: 'var(--tx-xs)', color: 'var(--stone)', fontStyle: 'italic', margin: 0 },
  placeholder:  { fontSize: 10, background: 'rgba(192,120,96,.12)', color: 'var(--terracotta)', padding: '2px 8px', borderRadius: 99, fontWeight: 600, flexShrink: 0, whiteSpace: 'nowrap' },
}

const ps = {
  list:     { display: 'flex', flexDirection: 'column', gap: 'var(--s4)' },
  card:     { background: 'var(--white)', borderRadius: 'var(--r-md)', padding: 'var(--s5) var(--s6)', boxShadow: 'var(--shadow-sm)', display: 'flex', gap: 'var(--s5)', alignItems: 'flex-start' },
  cardLeft: { flexShrink: 0 },
  semBadge: { width: 36, height: 36, borderRadius: '50%', background: 'var(--sage)', color: 'var(--forest)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, letterSpacing: '.02em' },
  cardTop:  { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 4 },
  cardTitle:{ fontSize: 'var(--tx-sm)', fontWeight: 600, color: 'var(--forest)', lineHeight: 1.4, margin: 0 },
  cardDesc: { fontSize: 'var(--tx-xs)', color: 'var(--stone)', lineHeight: 1.55, margin: 0 },
  cardMeta: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'var(--s3)' },
  metaItem: { fontSize: 'var(--tx-xs)', color: 'var(--stone)' },
  playBtn:  { background: 'var(--sand)', color: 'var(--stone)', border: 'none', borderRadius: 99, padding: '4px 14px', fontSize: 'var(--tx-xs)', fontWeight: 500, cursor: 'not-allowed', opacity: .7 },
}

const zs = {
  grid:      { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 'var(--s4)' },
  zoneCard:  {
    background: 'var(--white)', border: '1px solid var(--sand)', borderRadius: 'var(--r-md)',
    padding: 'var(--s6) var(--s4)', display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 'var(--s3)', textDecoration: 'none',
    boxShadow: 'var(--shadow-sm)', transition: 'transform 150ms ease, box-shadow 150ms ease',
  },
  zoneLabel: { fontSize: 'var(--tx-sm)', fontWeight: 600, color: 'var(--earth)', textAlign: 'center' },
  zoneArrow: { fontSize: 'var(--tx-xs)', color: 'var(--stone)' },
}
