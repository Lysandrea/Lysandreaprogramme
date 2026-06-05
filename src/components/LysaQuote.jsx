/* ── LysaQuote — Lysa Andréa ── */

const QUOTES = [
  { text: "Le corps sait. Il suffit d'apprendre à l'écouter.", },
  { text: "Chaque jour est un choix. Pas une obligation.",     },
  { text: "La régularité crée la transformation.",             },
  { text: "Tu n'es pas en retard. Tu es exactement là où tu dois être.", },
  { text: "La force ne vient pas du corps seul.",              },
  { text: "Prendre soin de soi est un acte de courage.",       },
]

export default function LysaQuote({ index, quote, style: extra }) {
  const text = quote ?? QUOTES[(index ?? 0) % QUOTES.length].text
  return (
    <blockquote style={{ borderLeft: '2px solid var(--sage)', paddingLeft: 'var(--s5)', ...extra }}>
      <p style={{
        fontFamily: 'var(--serif)', fontStyle: 'italic',
        fontSize: 'var(--tx-lg)', fontWeight: 300, color: 'var(--earth)', lineHeight: 1.55,
      }}>
        "{text}"
      </p>
      <cite style={{
        display: 'block', marginTop: 'var(--s2)',
        fontSize: 'var(--tx-xs)', fontStyle: 'normal',
        color: 'var(--stone)', letterSpacing: '.08em', textTransform: 'uppercase',
      }}>
        — Lysa Andréa
      </cite>
    </blockquote>
  )
}
