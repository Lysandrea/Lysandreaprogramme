import { useState } from 'react'
import { ZONES_DATA } from '../../lib/zonesData.js'

const ZONES = Object.keys(ZONES_DATA)

const EMOJIS = {
  'Cheville': '🦶', 'Genou': '🦵', 'Dos': '🔙', 'Épaule': '💪',
  'Nuque': '🧘', 'Hanche': '⭕', 'Poignet': '🤲', 'Cervicales': '🔗',
}

export default function PourquoiJaiMalPreview() {
  const [openZone, setOpenZone] = useState(null)

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h1 style={s.title}>🩹 Pourquoi j'ai mal</h1>
        <span style={s.badge}>Vue coach — toutes les zones accessibles</span>
      </div>
      <p style={s.intro}>
        Aperçu du contenu "Pourquoi j'ai mal" tel que tes clientes le voient. Clique sur une zone pour dérouler le contenu complet.
      </p>

      <div style={s.list}>
        {ZONES.map(zone => {
          const data   = ZONES_DATA[zone]
          const isOpen = openZone === zone
          return (
            <div key={zone} style={s.group}>
              <button
                style={isOpen ? s.rowBtnOpen : s.rowBtn}
                onClick={() => setOpenZone(isOpen ? null : zone)}
                onMouseEnter={e => { if (!isOpen) e.currentTarget.style.background = 'var(--cream)' }}
                onMouseLeave={e => { if (!isOpen) e.currentTarget.style.background = 'var(--white)' }}
              >
                <span style={s.zoneEmoji}>{EMOJIS[zone] ?? '🩹'}</span>
                <p style={s.rowTitle}>{data.titre}</p>
                <span style={s.rowChevron}>{isOpen ? '↑' : '↓'}</span>
              </button>

              {isOpen && (
                <div style={s.detail}>
                  <ZoneDetail data={data} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ZoneDetail({ data }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s4)' }}>
      <Section label="Anatomie">
        <p style={ds.body}>{data.anatomie}</p>
      </Section>

      <Section label="Ce que ça dit de toi" accent="sage">
        {data.symbolique.split('\n\n').map((para, i, arr) => (
          <p key={i} style={{ ...ds.body, marginBottom: i < arr.length - 1 ? 'var(--s4)' : 0 }}>{para}</p>
        ))}
      </Section>

      <Section label="Gauche / Droite">
        <div style={ds.gdRow}>
          <div style={ds.gdBlock}>
            <span style={ds.gdLabel}>Gauche — masculin / action</span>
            <p style={ds.body}>{data.gauche}</p>
          </div>
          <div style={ds.gdBlock}>
            <span style={ds.gdLabel}>Droite — féminin / affectif</span>
            <p style={ds.body}>{data.droite}</p>
          </div>
        </div>
      </Section>

      <Section label="Élément — médecine chinoise">
        <p style={ds.body}><strong style={{ color: 'var(--earth)' }}>{data.element}</strong> — {data.elementDescription}</p>
      </Section>

      <Section label="Questions pour aller plus loin">
        <ul style={ds.questionList}>
          {data.questions.map((q, i) => (
            <li key={i} style={ds.questionItem}>
              <span style={ds.questionArrow}>→</span>
              <span style={{ ...ds.body, fontStyle: 'italic' }}>{q}</span>
            </li>
          ))}
        </ul>
      </Section>

      <div style={ds.avertissement}>
        <span style={{ fontSize: '1rem', flexShrink: 0, marginTop: 1 }}>⚠️</span>
        <p style={ds.avertissementText}>{data.avertissement}</p>
      </div>
    </div>
  )
}

function Section({ label, accent, children }) {
  const bg     = accent === 'sage' ? 'rgba(168,184,154,.08)' : 'var(--white)'
  const border = accent === 'sage' ? '1px solid rgba(168,184,154,.25)' : '1px solid var(--sand)'
  return (
    <div style={{ ...ds.section, background: bg, border }}>
      <span style={ds.sectionLabel}>{label}</span>
      {children}
    </div>
  )
}

const s = {
  page:       { padding: 'var(--s8) var(--s6)', maxWidth: 760, display: 'flex', flexDirection: 'column', gap: 'var(--s6)' },
  header:     { display: 'flex', alignItems: 'baseline', gap: 'var(--s4)', flexWrap: 'wrap' },
  title:      { fontFamily: 'var(--serif)', fontSize: 'var(--tx-2xl)', color: 'var(--forest)', fontWeight: 400, margin: 0 },
  badge:      { fontSize: 'var(--tx-xs)', background: 'rgba(61,79,60,.1)', color: 'var(--forest)', padding: '3px 10px', borderRadius: 99, fontWeight: 600, whiteSpace: 'nowrap' },
  intro:      { fontSize: 'var(--tx-sm)', color: 'var(--stone)', margin: 0, lineHeight: 1.6 },
  list:       { display: 'flex', flexDirection: 'column', gap: 'var(--s3)' },
  group:      { borderRadius: 'var(--r-md)', overflow: 'hidden', border: '1px solid var(--sand)' },
  rowBtn:     { width: '100%', display: 'flex', alignItems: 'center', gap: 'var(--s4)', padding: 'var(--s4) var(--s5)', background: 'var(--white)', border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background var(--ease-fast)' },
  rowBtnOpen: { width: '100%', display: 'flex', alignItems: 'center', gap: 'var(--s4)', padding: 'var(--s4) var(--s5)', background: 'rgba(61,79,60,.06)', border: 'none', cursor: 'pointer', textAlign: 'left', borderBottom: '1px solid var(--sand)' },
  zoneEmoji:  { fontSize: '1.4rem', flexShrink: 0, width: 28, textAlign: 'center' },
  rowTitle:   { flex: 1, fontSize: 'var(--tx-sm)', fontWeight: 600, color: 'var(--forest)', margin: 0 },
  rowChevron: { fontSize: 'var(--tx-xs)', color: 'var(--stone)', flexShrink: 0 },
  detail:     { padding: 'var(--s6) var(--s5)', background: 'var(--cream)' },
}

const ds = {
  section:          { borderRadius: 'var(--r-lg)', padding: 'var(--s5) var(--s6)', marginBottom: 0 },
  sectionLabel:     { display: 'block', fontSize: 'var(--tx-xs)', fontWeight: 600, color: 'var(--stone)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 'var(--s3)' },
  body:             { fontSize: 'var(--tx-sm)', color: 'var(--earth)', lineHeight: 1.75, margin: 0 },
  gdRow:            { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--s4)' },
  gdBlock:          { background: 'rgba(232,221,208,.35)', borderRadius: 'var(--r-md)', padding: 'var(--s4)' },
  gdLabel:          { display: 'block', fontSize: 'var(--tx-xs)', fontWeight: 600, color: 'var(--bark)', marginBottom: 'var(--s2)' },
  questionList:     { listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--s3)' },
  questionItem:     { display: 'flex', gap: 'var(--s3)', alignItems: 'flex-start' },
  questionArrow:    { color: 'var(--moss)', fontWeight: 700, flexShrink: 0, marginTop: 1 },
  avertissement:    { display: 'flex', gap: 'var(--s3)', alignItems: 'flex-start', background: 'rgba(192,120,96,.07)', border: '1px solid rgba(192,120,96,.2)', borderRadius: 'var(--r-md)', padding: 'var(--s4) var(--s5)' },
  avertissementText:{ fontSize: 'var(--tx-xs)', color: 'var(--stone)', lineHeight: 1.65, margin: 0 },
}
