const QUOTES = [
  { text: "Le corps sait. Il suffit d'apprendre à l'écouter.", author: "Lysa Andréa" },
  { text: "Chaque jour est un choix. Pas une obligation.",       author: "Lysa Andréa" },
  { text: "La régularité crée la transformation.",               author: "Lysa Andréa" },
  { text: "Tu n'es pas en retard. Tu es exactement là où tu dois être.", author: "Lysa Andréa" },
  { text: "La force ne vient pas du corps seul.",                author: "Lysa Andréa" },
]

export default function LysaQuote({ index, style: extra }) {
  const q = QUOTES[(index ?? Math.floor(Math.random() * QUOTES.length)) % QUOTES.length]

  return (
    <blockquote style={{
      borderLeft: '2px solid var(--sage)',
      paddingLeft: 'var(--space-5)',
      marginTop: 'var(--space-4)',
      ...extra,
    }}>
      <p style={{
        fontFamily: 'var(--font-serif)',
        fontStyle: 'italic',
        fontSize: 'var(--text-lg)',
        fontWeight: 300,
        color: 'var(--earth)',
        lineHeight: 1.5,
      }}>
        "{q.text}"
      </p>
      <cite style={{
        display: 'block',
        marginTop: 'var(--space-2)',
        fontSize: 'var(--text-xs)',
        fontStyle: 'normal',
        color: 'var(--stone)',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
      }}>
        — {q.author}
      </cite>
    </blockquote>
  )
}
