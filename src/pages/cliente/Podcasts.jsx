import { useAuth } from '../../contexts/AuthContext.jsx'

const PODCASTS = [
  { sem: 1, titre: 'Comprendre ton corps & poser les bases', duree: '28 min', desc: 'Introduction au programme, mindset de départ et objectifs personnalisés.' },
  { sem: 2, titre: 'Alimentation intuitive & plaisir sans culpabilité', duree: '32 min', desc: 'Comment écouter ses signaux de faim et de satiété pour manger avec confiance.' },
  { sem: 3, titre: 'Le mouvement comme célébration', duree: '25 min', desc: 'Changer le rapport au sport : du devoir à l\'envie. Trouver ce qui te fait vibrer.' },
  { sem: 4, titre: 'Gestion du stress & cravings émotionnels', duree: '30 min', desc: 'Identifier les déclencheurs émotionnels et créer des stratégies concrètes.' },
  { sem: 5, titre: 'Image corporelle & bienveillance envers soi', duree: '27 min', desc: 'Travailler son dialogue intérieur et cultiver une relation apaisée avec son corps.' },
  { sem: 6, titre: 'Sommeil, récupération & énergie', duree: '24 min', desc: 'L\'impact du sommeil sur la composition corporelle et les habitudes de récupération.' },
  { sem: 7, titre: 'Sociali­ser sans perdre ses repères', duree: '26 min', desc: 'Naviguer les repas en société, les sorties, les voyages avec sérénité.' },
  { sem: 8, titre: 'Vie après le programme — maintien & liberté', duree: '35 min', desc: 'Consolider ses acquis et construire une autonomie durable après les 8 semaines.' },
]

export default function Podcasts() {
  const { profile } = useAuth()
  const currentSem  = Math.ceil((profile?.current_day ?? 1) / 7)

  return (
    <div style={s.page}>
      <h1 style={s.title}>Mes podcasts</h1>
      <p style={s.intro}>Un podcast par semaine, débloqué à chaque nouvelle étape du programme.</p>

      <div style={s.list}>
        {PODCASTS.map(({ sem, titre, duree, desc }) => {
          const unlocked = sem <= currentSem
          return (
            <div key={sem} style={{ ...s.card, ...(!unlocked ? s.cardLocked : {}) }}>
              <div style={s.cardLeft}>
                <div style={{ ...s.semBadge, ...(!unlocked ? s.badgeLocked : {}) }}>S{sem}</div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={s.cardTop}>
                  <p style={{ ...s.cardTitle, ...(!unlocked ? s.textLocked : {}) }}>{titre}</p>
                  {!unlocked && <span style={s.lock}>🔒</span>}
                </div>
                <p style={{ ...s.cardDesc, ...(!unlocked ? s.textLocked : {}) }}>{unlocked ? desc : 'Déblocage semaine ' + sem}</p>
                {unlocked && (
                  <div style={s.cardMeta}>
                    <span style={s.metaItem}>🎙️ {duree}</span>
                    <button style={s.playBtn}>▶ Écouter</button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const s = {
  page:       { padding: 'var(--s8) var(--s6)', maxWidth: 640 },
  title:      { fontFamily: 'var(--serif)', fontSize: 'var(--tx-2xl)', color: 'var(--forest)', fontWeight: 400, marginBottom: 'var(--s3)' },
  intro:      { fontSize: 'var(--tx-sm)', color: 'var(--stone)', marginBottom: 'var(--s7)' },
  list:       { display: 'flex', flexDirection: 'column', gap: 'var(--s4)' },
  card:       { background: 'var(--white)', borderRadius: 'var(--r-md)', padding: 'var(--s5) var(--s6)', boxShadow: 'var(--shadow-sm)', display: 'flex', gap: 'var(--s5)', alignItems: 'flex-start' },
  cardLocked: { opacity: .55 },
  cardLeft:   { flexShrink: 0 },
  semBadge:   { width: 36, height: 36, borderRadius: '50%', background: 'var(--sage)', color: 'var(--forest)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, letterSpacing: '.02em' },
  badgeLocked:{ background: 'var(--mist)', color: 'var(--stone)' },
  cardTop:    { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 4 },
  cardTitle:  { fontSize: 'var(--tx-sm)', fontWeight: 600, color: 'var(--forest)', lineHeight: 1.4 },
  cardDesc:   { fontSize: 'var(--tx-xs)', color: 'var(--stone)', lineHeight: 1.55 },
  textLocked: { color: 'var(--stone)' },
  lock:       { fontSize: 13, flexShrink: 0 },
  cardMeta:   { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'var(--s3)' },
  metaItem:   { fontSize: 'var(--tx-xs)', color: 'var(--stone)' },
  playBtn:    { background: 'var(--moss)', color: 'var(--white)', border: 'none', borderRadius: 99, padding: '4px 14px', fontSize: 'var(--tx-xs)', fontWeight: 500, cursor: 'pointer' },
}
