import { PODCASTS, PodcastPlayer } from '../cliente/Podcasts.jsx'

export default function PodcastsPreview() {
  return (
    <div style={s.page}>
      <div style={s.header}>
        <h1 style={s.title}>🎙️ Aperçu Podcasts</h1>
        <span style={s.badge}>Vue coach — toutes les semaines débloquées</span>
      </div>
      <p style={s.intro}>
        Vérifie le rendu et la qualité audio de chaque épisode.
        Les épisodes sans fichier audio affichent un placeholder.
      </p>

      <div style={s.list}>
        {PODCASTS.map(({ sem, titre, audioUrl, description }) => (
          <div key={sem} style={s.card}>
            <div style={s.cardLeft}>
              <div style={s.semBadge}>S{sem}</div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={s.cardTop}>
                <p style={s.cardTitle}>{titre}</p>
                {!audioUrl && <span style={s.todo}>À enregistrer</span>}
              </div>
              {description && <p style={s.description}>{description}</p>}
              <p style={s.semLabel}>🎙️ Semaine {sem}</p>
              <PodcastPlayer audioUrl={audioUrl} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const s = {
  page:      { padding: 'var(--s8) var(--s6)', maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 'var(--s6)' },
  header:    { display: 'flex', alignItems: 'baseline', gap: 'var(--s4)', flexWrap: 'wrap' },
  title:     { fontFamily: 'var(--serif)', fontSize: 'var(--tx-2xl)', color: 'var(--forest)', fontWeight: 400, margin: 0 },
  badge:     { fontSize: 'var(--tx-xs)', background: 'rgba(61,79,60,.1)', color: 'var(--forest)', padding: '3px 10px', borderRadius: 99, fontWeight: 600, whiteSpace: 'nowrap' },
  intro:     { fontSize: 'var(--tx-sm)', color: 'var(--stone)', margin: 0, lineHeight: 1.6 },
  list:      { display: 'flex', flexDirection: 'column', gap: 'var(--s4)' },
  card:      { background: 'var(--white)', borderRadius: 'var(--r-md)', padding: 'clamp(16px, 4vw, 24px)', boxShadow: 'var(--shadow-sm)', display: 'flex', gap: 'var(--s4)', alignItems: 'flex-start' },
  cardLeft:  { flexShrink: 0, paddingTop: 3 },
  semBadge:  { width: 36, height: 36, borderRadius: '50%', background: 'var(--sage)', color: 'var(--forest)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, letterSpacing: '.02em' },
  cardTop:   { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 4 },
  cardTitle:   { fontSize: 'var(--tx-sm)', fontWeight: 600, color: 'var(--forest)', lineHeight: 1.4, margin: 0 },
  description: { fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 'var(--tx-base)', color: 'var(--bark)', lineHeight: 1.7, margin: '6px 0 8px', opacity: 0.85 },
  semLabel:    { fontSize: 'var(--tx-xs)', color: 'var(--stone)', margin: 0 },
  todo:      { fontSize: 10, background: 'rgba(192,120,96,.12)', color: 'var(--terracotta)', padding: '3px 10px', borderRadius: 99, fontWeight: 600, flexShrink: 0, whiteSpace: 'nowrap' },
}
