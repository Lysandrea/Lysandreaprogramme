import { useAuth } from '../../contexts/AuthContext.jsx'

const RECETTES = [
  { sem: 1, titre: 'Bowl protéiné du matin', cat: 'Petit-déjeuner', temps: '10 min', desc: 'Yaourt grec, granola maison, fruits rouges et miel. Protéines + énergie pour bien démarrer.' },
  { sem: 1, titre: 'Salade de quinoa méditerranéenne', cat: 'Déjeuner', temps: '20 min', desc: 'Quinoa, concombre, tomates cerises, feta, olives et vinaigrette au citron.' },
  { sem: 2, titre: 'Omelette aux légumes rôtis', cat: 'Dîner', temps: '25 min', desc: 'Oeufs, poivrons, courgettes et herbes fraîches. Simple, rassasiant et équilibré.' },
  { sem: 3, titre: 'Smoothie vert énergie', cat: 'Snack', temps: '5 min', desc: 'Épinards, banane, lait de coco, gingembre et graines de chia. Pour une énergie durable.' },
  { sem: 3, titre: 'Saumon en papillote & légumes vapeur', cat: 'Dîner', temps: '30 min', desc: 'Filet de saumon, brocoli, carottes et sauce soja. Oméga-3 et légèreté au rendez-vous.' },
  { sem: 4, titre: 'Porridge aux fruits de saison', cat: 'Petit-déjeuner', temps: '10 min', desc: "Flocons d'avoine, lait végétal, cannelle et fruits frais. Cocooning et nutritif." },
  { sem: 5, titre: 'Buddha bowl végétarien', cat: 'Déjeuner', temps: '30 min', desc: 'Pois chiches rôtis, patate douce, avocat, riz complet et tahini maison.' },
  { sem: 6, titre: 'Soupe de lentilles corail', cat: 'Dîner', temps: '35 min', desc: 'Lentilles corail, cumin, curcuma, coriandre fraîche. Chaleur et protéines végétales.' },
  { sem: 7, titre: 'Pancakes protéinés sans gluten', cat: 'Brunch', temps: '20 min', desc: 'Banane, œufs, flocons de riz et beurre de cacahuète. Plaisir sans culpabilité.' },
]

const CAT_COLORS = {
  'Petit-déjeuner': '#7B9E63',
  'Déjeuner':       '#C16444',
  'Dîner':          '#5A7A8A',
  'Snack':          '#9B8060',
  'Brunch':         '#8A6B9B',
}

export default function Recettes() {
  const { profile } = useAuth()
  const currentSem  = Math.ceil((profile?.current_day ?? 1) / 7)

  return (
    <div style={s.page}>
      <h1 style={s.title}>Mes recettes</h1>
      <p style={s.intro}>Des recettes saines et gourmandes, débloquées au fil des semaines.</p>

      <div style={s.list}>
        {RECETTES.map(({ sem, titre, cat, temps, desc }, idx) => {
          const unlocked = sem <= currentSem
          return (
            <div key={idx} style={{ ...s.card, ...(!unlocked ? s.cardLocked : {}) }}>
              <div style={s.cardHeader}>
                <div style={s.cardMeta}>
                  <span style={{ ...s.catBadge, background: unlocked ? (CAT_COLORS[cat] ?? 'var(--sage)') : 'var(--mist)', color: unlocked ? 'var(--white)' : 'var(--stone)' }}>{cat}</span>
                  <span style={s.semLabel}>Semaine {sem}</span>
                </div>
                {!unlocked && <span>🔒</span>}
              </div>
              <h3 style={{ ...s.cardTitle, ...(!unlocked ? s.textLocked : {}) }}>{titre}</h3>
              <p style={{ ...s.cardDesc, ...(!unlocked ? s.textLocked : {}) }}>
                {unlocked ? desc : 'Débloqué à la semaine ' + sem}
              </p>
              {unlocked && (
                <p style={s.temps}>⏱ {temps}</p>
              )}
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
  list:       { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--s5)' },
  card:       { background: 'var(--white)', borderRadius: 'var(--r-md)', padding: 'var(--s6)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: 'var(--s3)' },
  cardLocked: { opacity: .5 },
  cardHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  cardMeta:   { display: 'flex', alignItems: 'center', gap: 'var(--s3)' },
  catBadge:   { padding: '2px 10px', borderRadius: 99, fontSize: 10, fontWeight: 600, letterSpacing: '.04em' },
  semLabel:   { fontSize: 10, color: 'var(--stone)', letterSpacing: '.04em' },
  cardTitle:  { fontSize: 'var(--tx-sm)', fontWeight: 600, color: 'var(--forest)', lineHeight: 1.4, margin: 0 },
  cardDesc:   { fontSize: 'var(--tx-xs)', color: 'var(--stone)', lineHeight: 1.55, margin: 0 },
  textLocked: { color: 'var(--stone)' },
  temps:      { fontSize: 'var(--tx-xs)', color: 'var(--moss)', fontWeight: 500, marginTop: 'auto', paddingTop: 4 },
}
