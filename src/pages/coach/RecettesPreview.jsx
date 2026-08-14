import { RECETTES, RecetteDetail, recettesStyles as rs } from '../cliente/Recettes.jsx'

export default function RecettesPreview() {
  return (
    <div style={s.page}>
      <div style={s.header}>
        <h1 style={s.title}>🍲 Aperçu Recettes</h1>
        <span style={s.badge}>Vue coach — toutes les semaines débloquées</span>
      </div>
      <p style={s.intro}>
        Vérifie ici le rendu exact de chaque recette telle qu'une cliente la voit.
        Les semaines sans contenu affichent un placeholder.
      </p>

      <div style={rs.list}>
        {RECETTES.map(({ sem, titre, content }) => {
          if (content) {
            return <RecetteDetail key={sem} sem={sem} titre={titre} content={content} />
          }

          return (
            <div key={sem} style={s.placeholder}>
              <div style={s.placeholderBadge}>S{sem}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={s.placeholderTitle}>{titre}</p>
                <p style={s.placeholderDesc}>Contenu à rédiger — recette pas encore ajoutée.</p>
              </div>
              <span style={s.todo}>À rédiger</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const s = {
  page:             { padding: 'var(--s8) var(--s6)', maxWidth: 760, display: 'flex', flexDirection: 'column', gap: 'var(--s6)' },
  header:           { display: 'flex', alignItems: 'baseline', gap: 'var(--s4)', flexWrap: 'wrap' },
  title:            { fontFamily: 'var(--serif)', fontSize: 'var(--tx-2xl)', color: 'var(--forest)', fontWeight: 400, margin: 0 },
  badge:            { fontSize: 'var(--tx-xs)', background: 'rgba(61,79,60,.1)', color: 'var(--forest)', padding: '3px 10px', borderRadius: 99, fontWeight: 600, whiteSpace: 'nowrap' },
  intro:            { fontSize: 'var(--tx-sm)', color: 'var(--stone)', margin: 0, lineHeight: 1.6 },
  placeholder:      { background: 'var(--sand)', border: '1.5px dashed rgba(168,160,148,.5)', borderRadius: 'var(--r-md)', padding: 'var(--s5) var(--s6)', display: 'flex', alignItems: 'center', gap: 'var(--s4)' },
  placeholderBadge: { width: 36, height: 36, borderRadius: '50%', background: 'var(--mist)', color: 'var(--stone)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 },
  placeholderTitle: { fontSize: 'var(--tx-sm)', fontWeight: 600, color: 'var(--stone)', margin: '0 0 4px' },
  placeholderDesc:  { fontSize: 'var(--tx-xs)', color: 'var(--stone)', opacity: .7, margin: 0 },
  todo:             { fontSize: 10, background: 'rgba(192,120,96,.12)', color: 'var(--terracotta)', padding: '3px 10px', borderRadius: 99, fontWeight: 600, flexShrink: 0, whiteSpace: 'nowrap' },
}
