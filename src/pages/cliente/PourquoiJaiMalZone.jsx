import { useParams, useNavigate } from 'react-router-dom'
import { ZONES_DATA } from '../../lib/zonesData.js'

const WA_LINK = 'https://wa.me/33650947117?text=Bonjour%20Lysa%2C%20quelque%20chose%20a%20r%C3%A9sonn%C3%A9%20en%20moi%20en%20lisant%20la%20partie%20sur%20ma%20douleur.%20Je%20voudrais%20r%C3%A9server%20un%20cr%C3%A9neau%20de%20coaching%20%C3%A9motionnel.'

export default function PourquoiJaiMalZone() {
  const { zone } = useParams()
  const navigate = useNavigate()
  const label    = decodeURIComponent(zone ?? '')
  const data     = ZONES_DATA[label]

  if (!data) return (
    <div style={s.page}>
      <button style={s.back} onClick={() => navigate('/pourquoi-jai-mal')}>← Retour</button>
      <p style={{ color: 'var(--stone)', fontSize: 'var(--tx-sm)' }}>Zone introuvable.</p>
    </div>
  )

  return (
    <div style={s.page}>
      <button style={s.back} onClick={() => navigate('/pourquoi-jai-mal')}>← Toutes les zones</button>

      <h1 style={s.title}>{data.titre}</h1>

      <Section label="Anatomie">
        <p style={s.body}>{data.anatomie}</p>
      </Section>

      <Section label="Ce que ça dit de toi" accent="sage">
        {data.symbolique.split('\n\n').map((para, i) => (
          <p key={i} style={{ ...s.body, marginBottom: i < data.symbolique.split('\n\n').length - 1 ? 'var(--s4)' : 0 }}>{para}</p>
        ))}
      </Section>

      <Section label="Gauche / Droite">
        <div style={s.gdRow}>
          <div style={s.gdBlock}>
            <span style={s.gdLabel}>Gauche — masculin / action</span>
            <p style={s.body}>{data.gauche}</p>
          </div>
          <div style={s.gdBlock}>
            <span style={s.gdLabel}>Droite — féminin / affectif</span>
            <p style={s.body}>{data.droite}</p>
          </div>
        </div>
      </Section>

      <Section label="Élément — médecine chinoise">
        <p style={s.body}><strong style={{ color: 'var(--earth)' }}>{data.element}</strong> — {data.elementDescription}</p>
      </Section>

      <Section label="Questions pour aller plus loin">
        <ul style={s.questionList}>
          {data.questions.map((q, i) => (
            <li key={i} style={s.questionItem}>
              <span style={s.questionArrow}>→</span>
              <span style={{ ...s.body, fontStyle: 'italic' }}>{q}</span>
            </li>
          ))}
        </ul>
      </Section>

      <div style={s.avertissement}>
        <span style={s.avertissementIcon}>⚠️</span>
        <p style={s.avertissementText}>{data.avertissement}</p>
      </div>

      <div style={s.cta}>
        <p style={s.ctaText}>
          Si en lisant ça, quelque chose a résonné plus fort que prévu, ce n'est pas un hasard.
          On peut explorer ça ensemble en séance de coaching émotionnel.
        </p>
        <a href={WA_LINK} target="_blank" rel="noopener noreferrer" style={s.ctaBtn}>
          Réserver un créneau →
        </a>
      </div>
    </div>
  )
}

function Section({ label, accent, children }) {
  const bg = accent === 'sage'
    ? 'rgba(168,184,154,.08)'
    : 'var(--white)'
  const border = accent === 'sage'
    ? '1px solid rgba(168,184,154,.25)'
    : '1px solid var(--sand)'

  return (
    <div style={{ ...s.section, background: bg, border }}>
      <span style={s.sectionLabel}>{label}</span>
      {children}
    </div>
  )
}

const s = {
  page:             { padding: 'var(--s8) var(--s6)', maxWidth: 660 },
  back:             { background: 'none', border: 'none', color: 'var(--stone)', fontSize: 'var(--tx-sm)', cursor: 'pointer', padding: 0, marginBottom: 'var(--s6)', display: 'flex', alignItems: 'center', gap: 'var(--s2)' },
  title:            { fontFamily: 'var(--serif)', fontSize: 'var(--tx-3xl)', color: 'var(--forest)', fontWeight: 400, marginBottom: 'var(--s6)', lineHeight: 1.2 },
  section:          { borderRadius: 'var(--r-lg)', padding: 'var(--s5) var(--s6)', marginBottom: 'var(--s4)' },
  sectionLabel:     { display: 'block', fontSize: 'var(--tx-xs)', fontWeight: 600, color: 'var(--stone)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 'var(--s3)' },
  body:             { fontSize: 'var(--tx-sm)', color: 'var(--earth)', lineHeight: 1.75, margin: 0 },
  gdRow:            { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--s4)' },
  gdBlock:          { background: 'rgba(232,221,208,.35)', borderRadius: 'var(--r-md)', padding: 'var(--s4)' },
  gdLabel:          { display: 'block', fontSize: 'var(--tx-xs)', fontWeight: 600, color: 'var(--bark)', marginBottom: 'var(--s2)' },
  questionList:     { listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--s3)' },
  questionItem:     { display: 'flex', gap: 'var(--s3)', alignItems: 'flex-start' },
  questionArrow:    { color: 'var(--moss)', fontWeight: 700, flexShrink: 0, marginTop: 1 },
  avertissement:    { display: 'flex', gap: 'var(--s3)', alignItems: 'flex-start', background: 'rgba(192,120,96,.07)', border: '1px solid rgba(192,120,96,.2)', borderRadius: 'var(--r-md)', padding: 'var(--s4) var(--s5)', marginBottom: 'var(--s6)', marginTop: 'var(--s2)' },
  avertissementIcon:{ fontSize: '1rem', flexShrink: 0, marginTop: 1 },
  avertissementText:{ fontSize: 'var(--tx-xs)', color: 'var(--stone)', lineHeight: 1.65, margin: 0 },
  cta:              { background: 'var(--forest)', borderRadius: 'var(--r-lg)', padding: 'var(--s6) var(--s6)', marginBottom: 'var(--s8)' },
  ctaText:          { fontSize: 'var(--tx-sm)', color: 'rgba(253,250,246,.85)', lineHeight: 1.7, margin: '0 0 var(--s5) 0' },
  ctaBtn:           { display: 'inline-block', background: 'var(--white)', color: 'var(--forest)', fontSize: 'var(--tx-sm)', fontWeight: 600, padding: '10px 22px', borderRadius: 'var(--r-md)', textDecoration: 'none' },
}
