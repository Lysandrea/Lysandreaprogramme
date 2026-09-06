import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { IS_MOCK, fetchAiProgramme } from '../../lib/supabase.js'

export const RECETTES = [
  {
    sem: 1,
    titre: '🍌 Mon petit pot banane & chocolat',
    content: {
      photo: 'https://omcednuoxfmhyfwmrmmp.supabase.co/storage/v1/object/public/photo-recettes/PETIT%20POT.png',
      tagline: "Un petit-déjeuner ou une collation ultra gourmande, facile à préparer à l'avance… avec cette petite coque de chocolat qui craque sous la cuillère. 🤤",
      ingredients: [
        '🍌 1 banane bien mûre',
        '🥛 125 g de yaourt soja nature ou de skyr',
        '🌾 30 g de flocons d\'avoine',
        '🌱 1 c. à café de graines de chia',
        '💪 30 g de whey vanille (facultatif)',
        '🍫 10 g de chocolat noir 70 %',
      ],
      steps: [
        'Écrase la banane dans un bol à l\'aide d\'une fourchette.',
        'Ajoute le yaourt ou le skyr, les flocons d\'avoine, les graines de chia et, si tu le souhaites, la whey vanille.',
        'Mélange bien jusqu\'à obtenir une préparation homogène et crémeuse.',
        'Verse la préparation dans un petit pot en verre.',
        'Fais fondre le chocolat noir 70 % puis verse-le délicatement sur toute la surface afin de créer une fine couche.',
        'Place le pot au réfrigérateur pendant environ 1 heure.',
      ],
      note: "✨ Le chocolat va alors durcir et former une petite coque croquante. Il ne reste plus qu'à donner un petit coup de cuillère pour la casser… et déguster !",
      tip: "💡 Petit + gourmand — Tu peux personnaliser ton petit pot avec quelques fruits rouges, des noisettes concassées, de la noix de coco ou une petite cuillère de beurre de cacahuète. Simple, rassasiant et surtout : beaucoup trop bon. 🤎",
    },
  },
  {
    sem: 2,
    titre: '🌯 Wrap complet avocat, jambon & St Môret',
    content: {
      photo: 'https://omcednuoxfmhyfwmrmmp.supabase.co/storage/v1/object/public/photo-recettes/WRAP.png',
      tagline: 'Un wrap simple, frais et gourmand, parfait pour un déjeuner rapide ou un repas à préparer à l\'avance. 🥑',
      ingredients: [
        '🌯 1 tortilla complète',
        '🥑 ½ avocat',
        '🍅 6 à 8 tomates cerises',
        '🥩 2 tranches de jambon blanc',
        '🧀 2 c. à soupe de St Môret',
        '🫒 5 à 6 olives vertes dénoyautées',
        '🥬 Quelques feuilles de salade, roquette ou mâche',
        '🧂 Sel & poivre',
        '🌿 Herbes de Provence — facultatif',
      ],
      steps: [
        'Étale le St Môret sur toute la surface de la tortilla.',
        'Ajoute quelques feuilles de salade.',
        'Coupe les tomates cerises en deux et l\'avocat en tranches, puis dispose-les sur la tortilla avec le jambon et les olives vertes.',
        'Assaisonne avec un peu de sel, de poivre et, si tu le souhaites, quelques herbes de Provence.',
        'Rabats les côtés de la tortilla vers l\'intérieur, puis roule-la bien serrée afin que la garniture reste bien en place.',
        'Coupe ton wrap en deux et c\'est prêt ! 🌯✨',
      ],
      note: 'Simple, complet, gourmand et prêt en quelques minutes. 🤎',
      tip: '💡 Pour encore plus de fraîcheur, tu peux ajouter quelques gouttes de jus de citron sur l\'avocat ou un petit filet d\'huile d\'olive.',
    },
  },
  {
    sem: 3,
    titre: '🥗 Petite salade de pâtes aux œufs',
    content: {
      photo: 'https://omcednuoxfmhyfwmrmmp.supabase.co/storage/v1/object/public/photo-recettes/SALADE.png',
      tagline: 'Une salade fraîche et complète, parfaite pour un déjeuner rapide, un repas à emporter ou à préparer à l\'avance. 🥚🍅',
      ingredients: [
        '🍝 70 g de pâtes crues (complètes de préférence)',
        '🥚 2 œufs',
        '🍅 6 à 8 tomates cerises',
        '🥒 ½ concombre',
        '🌽 40 g de maïs',
        '🫒 5 à 6 olives vertes',
        '🥬 Quelques feuilles de roquette ou de salade',
        '🧀 30 g de feta — facultatif',
        '🫒 1 c. à café d\'huile d\'olive (sauce)',
        '🍋 1 c. à café de jus de citron (sauce)',
        '🌿 Herbes de Provence ou basilic (sauce)',
        '🧂 Sel & poivre (sauce)',
      ],
      steps: [
        'Fais cuire les pâtes selon les indications du paquet. Égoutte-les puis laisse-les refroidir.',
        'Fais cuire les œufs dans une casserole d\'eau bouillante pendant environ 9 à 10 minutes pour obtenir des œufs durs. Passe-les ensuite sous l\'eau froide et écale-les.',
        'Coupe les tomates cerises en deux, le concombre en petits dés et les olives en rondelles.',
        'Dans un saladier, mélange les pâtes refroidies avec les tomates, le concombre, le maïs, les olives et la roquette.',
        'Prépare la sauce en mélangeant l\'huile d\'olive, le jus de citron, les herbes, le sel et le poivre. Verse-la sur la salade et mélange délicatement.',
        'Coupe les œufs durs en deux ou en quartiers et dépose-les sur le dessus.',
      ],
      note: '✨ C\'est prêt ! Une salade colorée, fraîche et rassasiante, parfaite pour un repas simple sans prise de tête.',
      tip: '💡 Tu peux remplacer la feta par de la mozzarella, ajouter du thon ou quelques dés d\'avocat selon tes envies. Et si tu la prépares à l\'avance, garde la sauce à part et ajoute-la juste avant de manger pour conserver une salade bien fraîche. 🤎',
    },
  },
  {
    sem: 4,
    titre: '🐟 Saumon crémeux aux champignons & riz',
    content: {
      photo: 'https://omcednuoxfmhyfwmrmmp.supabase.co/storage/v1/object/public/photo-recettes/SAUMON.png',
      tagline: 'Un plat réconfortant, gourmand et équilibré, avec une sauce crémeuse légère qui accompagne parfaitement le saumon et les champignons. 🤎',
      ingredients: [
        '🐟 1 pavé de saumon — environ 120 à 150 g',
        '🍚 60 g de riz cru',
        '🍄 100 g de champignons de Paris',
        '🥛 50 à 70 ml de crème légère 4 %',
        '🧅 ½ petit oignon ou 1 échalote',
        '🫒 1 c. à café d\'huile d\'olive',
        '🌿 Persil ou ciboulette',
        '🧂 Sel & poivre',
        '🍋 Un filet de jus de citron — facultatif',
      ],
      steps: [
        'Fais cuire le riz selon les indications du paquet, puis réserve-le.',
        'Émince les champignons et l\'oignon. Fais chauffer l\'huile d\'olive dans une poêle et fais revenir l\'oignon quelques minutes.',
        'Ajoute les champignons et laisse-les cuire jusqu\'à ce qu\'ils soient bien fondants et légèrement dorés.',
        'Ajoute le pavé de saumon dans la poêle. Fais-le cuire quelques minutes de chaque côté, jusqu\'à ce qu\'il soit bien cuit tout en restant moelleux.',
        'Baisse le feu puis ajoute la crème légère à 4 %. Mélange délicatement avec les champignons et laisse mijoter 2 à 3 minutes afin que la sauce épaississe légèrement.',
        'Assaisonne avec du sel, du poivre, un peu de persil ou de ciboulette et, si tu aimes, quelques gouttes de citron.',
        'Sers le saumon accompagné du riz et nappe généreusement avec la sauce aux champignons. 🍚✨',
      ],
      note: 'Un plat simple, crémeux et réconfortant, sans avoir besoin d\'une sauce ultra-lourde. 🤎',
      tip: '💡 Pour une sauce encore plus parfumée, tu peux ajouter une petite cuillère de moutarde à la crème ou quelques herbes de Provence.',
    },
  },
  {
    sem: 5,
    titre: '🧁 Muffins protéinés banane & chocolat',
    content: {
      photo: 'https://omcednuoxfmhyfwmrmmp.supabase.co/storage/v1/object/public/photo-recettes/MUFFIN%20.png',
      tagline: 'Des petits muffins moelleux, gourmands et riches en protéines, parfaits pour un petit-déjeuner, une collation ou une petite touche sucrée après l\'entraînement. 🍌🍫',
      ingredients: [
        '🍌 1 banane bien mûre',
        '🥚 2 œufs',
        '🌾 80 g de flocons d\'avoine',
        '💪 30 g de protéine en poudre — vanille de préférence',
        '🥛 50 ml de lait ou boisson végétale',
        '🥄 1 c. à café de levure chimique',
        '🍫 20 g de chocolat noir 70 % en petits carrés',
        '🌿 1 c. à café d\'extrait de vanille — facultatif',
      ],
      steps: [
        'Préchauffe ton four à 180°C.',
        'Écrase la banane dans un saladier jusqu\'à obtenir une texture bien lisse.',
        'Ajoute les œufs et le lait, puis mélange.',
        'Ajoute les flocons d\'avoine, la protéine en poudre et la levure. Mélange jusqu\'à obtenir une pâte homogène.',
        'Répartis la préparation dans 6 moules à muffins légèrement huilés ou avec des caissettes.',
        'Dépose quelques petits carrés de chocolat sur le dessus de chaque muffin et enfonce-les légèrement dans la pâte. 🍫',
        'Enfourne pendant environ 15 à 20 minutes à 180°C. Les muffins doivent être légèrement dorés à l\'extérieur tout en restant moelleux à l\'intérieur.',
        'Laisse-les refroidir quelques minutes avant de les déguster.',
      ],
      note: '✨ Moelleux, chocolatés et rassasiants : le genre de collation qui fait plaisir sans avoir besoin de compliquer les choses.',
      tip: '💡 Pour des muffins encore plus gourmands, tu peux ajouter quelques pépites de chocolat directement dans la pâte avant la cuisson.',
    },
  },
  {
    sem: 6,
    titre: '🥤 Smoothie protéiné — banane ou fruits rouges',
    content: {
      photo: 'https://omcednuoxfmhyfwmrmmp.supabase.co/storage/v1/object/public/photo-recettes/MILKSHAKES.png',
      tagline: 'Un smoothie onctueux, frais et rassasiant, parfait au petit-déjeuner, en collation ou après une séance de sport. ✨',
      ingredients: [
        '🍌 Version banane : 1 banane',
        '🍌 150 ml de lait ou boisson végétale sans sucres ajoutés',
        '🍌 100 g de skyr ou yaourt grec',
        '🍌 20 à 30 g de whey vanille',
        '🍌 Quelques glaçons',
        '🍌 1 pincée de cannelle — facultatif',
        '🍓 Version fruits rouges : 150 g de fruits rouges surgelés',
        '🍓 150 ml de lait ou boisson végétale sans sucres ajoutés',
        '🍓 100 g de skyr ou yaourt grec',
        '🍓 20 à 30 g de whey vanille',
        '🍓 Quelques glaçons',
      ],
      steps: [
        'Place tous les ingrédients dans un blender.',
        'Mixe pendant environ 30 à 45 secondes, jusqu\'à obtenir une texture bien lisse et crémeuse.',
        'Ajuste la texture selon tes goûts : ajoute un peu de lait si ton smoothie est trop épais, ou quelques glaçons pour une texture plus fraîche.',
        'Verse dans un grand verre et déguste immédiatement. 🥤',
      ],
      note: 'Une recette express, gourmande et riche en protéines — sans prise de tête. 🤎',
      tip: '💡 Pour la version banane, tu peux ajouter 1 c. à café de beurre de cacahuète pour une texture encore plus gourmande. Pour la version fruits rouges, quelques gouttes de jus de citron permettent de relever naturellement les saveurs. 🍋',
    },
  },
  { sem: 7, titre: 'Recette de la semaine 7' },
  { sem: 8, titre: 'Recette de la semaine 8' },
]

export function RecetteDetail({ sem, titre, content }) {
  const { photo, tagline, ingredients, steps, note, tip } = content
  return (
    <div style={recettesStyles.detailCard}>
      <div style={recettesStyles.detailBadge}>S{sem}</div>
      <div style={recettesStyles.detailPhotoWrap}>
        <img src={photo} alt={titre} style={recettesStyles.detailPhoto} />
      </div>
      <div style={recettesStyles.detailBody}>
        <h2 style={recettesStyles.detailTitle}>{titre}</h2>
        <p style={recettesStyles.detailTagline}>{tagline}</p>

        <div style={recettesStyles.detailColumns}>
          <div style={recettesStyles.detailCol}>
            <h3 style={recettesStyles.colHeading}>Ingrédients</h3>
            <ul style={recettesStyles.ingredientList}>
              {ingredients.map((ing, i) => (
                <li key={i} style={recettesStyles.ingredientItem}>{ing}</li>
              ))}
            </ul>
          </div>
          <div style={recettesStyles.detailCol}>
            <h3 style={recettesStyles.colHeading}>Préparation</h3>
            <ol style={recettesStyles.stepList}>
              {steps.map((step, i) => (
                <li key={i} style={recettesStyles.stepItem}>
                  <span style={recettesStyles.stepNum}>{i + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div style={recettesStyles.noteBox}>
          <p style={recettesStyles.noteText}>{note}</p>
        </div>
        <div style={recettesStyles.tipBox}>
          <p style={recettesStyles.noteText}>{tip}</p>
        </div>
      </div>
    </div>
  )
}

export default function Recettes() {
  const { user, profile } = useAuth()
  const currentSem = Math.min(Math.ceil((profile?.current_day ?? 1) / 7), 8)

  const [publie,  setPublie]  = useState(false)
  const [loading, setLoading] = useState(true)
  const [openSem, setOpenSem] = useState(null)

  useEffect(() => {
    if (!user || IS_MOCK) { setLoading(false); return }
    fetchAiProgramme(user.id)
      .then(prog => setPublie(prog?.statut === 'publie'))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user])

  if (loading) return <div style={recettesStyles.page}><p style={{ color: 'var(--stone)', fontSize: 'var(--tx-sm)' }}>Chargement…</p></div>

  if (!publie) return (
    <div style={recettesStyles.page}>
      <h1 style={recettesStyles.title}>Le rendez-vous gourmand</h1>
      <div style={recettesStyles.gate}>
        <span style={{ fontSize: '2rem' }}>🔒</span>
        <p style={recettesStyles.gateText}>Disponible dès la publication de ton programme personnalisé.</p>
      </div>
    </div>
  )

  return (
    <div style={recettesStyles.page}>
      <h1 style={recettesStyles.title}>Le rendez-vous gourmand</h1>
      <p style={recettesStyles.intro}>Une recette se débloque chaque semaine au fil de ton programme.</p>

      <div style={recettesStyles.list}>
        {RECETTES.map(({ sem, titre, content }) => {
          const unlocked = sem <= currentSem

          if (unlocked && content) {
            const isOpen = openSem === sem
            return (
              <div key={sem} style={recettesStyles.recetteGroup}>
                <button
                  style={isOpen ? recettesStyles.rowBtnOpen : recettesStyles.rowBtn}
                  onClick={() => setOpenSem(isOpen ? null : sem)}
                  onMouseEnter={e => { if (!isOpen) e.currentTarget.style.background = 'var(--cream)' }}
                  onMouseLeave={e => { if (!isOpen) e.currentTarget.style.background = 'var(--white)' }}
                >
                  <div style={recettesStyles.semBadge}>S{sem}</div>
                  <p style={recettesStyles.rowTitle}>{titre}</p>
                  {content.photo && <img src={content.photo} alt="" style={recettesStyles.rowThumb} />}
                  <span style={recettesStyles.rowChevron}>{isOpen ? '↑' : '↓'}</span>
                </button>
                {isOpen && (
                  <div style={recettesStyles.detailCardWrap}>
                    <RecetteDetail sem={sem} titre={titre} content={content} />
                  </div>
                )}
              </div>
            )
          }

          return (
            <div key={sem} style={{ ...recettesStyles.card, ...(!unlocked ? recettesStyles.cardLocked : {}) }}>
              <div style={recettesStyles.cardLeft}>
                <div style={{ ...recettesStyles.semBadge, ...(!unlocked ? recettesStyles.badgeLocked : {}) }}>S{sem}</div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={recettesStyles.cardTop}>
                  <p style={{ ...recettesStyles.cardTitle, ...(!unlocked ? recettesStyles.textLocked : {}) }}>{titre}</p>
                  {!unlocked && <span style={recettesStyles.lock}>🔒</span>}
                </div>
                {unlocked ? (
                  <>
                    <p style={recettesStyles.cardDesc}>Recette à venir — contenu en cours d'ajout.</p>
                    <div style={recettesStyles.cardMeta}>
                      <span style={recettesStyles.metaItem}>🍲 Semaine {sem}</span>
                    </div>
                  </>
                ) : (
                  <p style={{ ...recettesStyles.cardDesc, ...recettesStyles.textLocked }}>Déblocage semaine {sem}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export const recettesStyles = {
  page:       { padding: 'var(--s8) var(--s6)', maxWidth: 760 },
  title:      { fontFamily: 'var(--serif)', fontSize: 'var(--tx-2xl)', color: 'var(--forest)', fontWeight: 400, marginBottom: 'var(--s3)' },
  intro:      { fontSize: 'var(--tx-sm)', color: 'var(--stone)', marginBottom: 'var(--s7)' },
  gate:       { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--s4)', padding: 'var(--s10)', background: 'var(--sand)', borderRadius: 'var(--r-lg)', textAlign: 'center' },
  gateText:   { fontSize: 'var(--tx-sm)', color: 'var(--stone)', maxWidth: 320, lineHeight: 1.6, margin: 0 },
  list:       { display: 'flex', flexDirection: 'column', gap: 'var(--s4)' },

  /* Compact row card (placeholder weeks) */
  card:       { background: 'var(--white)', borderRadius: 'var(--r-md)', padding: 'var(--s5) var(--s6)', boxShadow: 'var(--shadow-sm)', display: 'flex', gap: 'var(--s5)', alignItems: 'flex-start' },
  cardLocked: { opacity: .5 },
  cardLeft:   { flexShrink: 0 },
  semBadge:   { width: 36, height: 36, borderRadius: '50%', background: 'var(--sage)', color: 'var(--forest)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, letterSpacing: '.02em' },
  badgeLocked:{ background: 'var(--mist)', color: 'var(--stone)' },
  cardTop:    { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 4 },
  cardTitle:  { fontSize: 'var(--tx-sm)', fontWeight: 600, color: 'var(--forest)', lineHeight: 1.4, margin: 0 },
  cardDesc:   { fontSize: 'var(--tx-xs)', color: 'var(--stone)', lineHeight: 1.55, margin: 0 },
  textLocked: { color: 'var(--stone)' },
  lock:       { fontSize: 13, flexShrink: 0 },
  cardMeta:   { display: 'flex', alignItems: 'center', marginTop: 'var(--s3)' },
  metaItem:   { fontSize: 'var(--tx-xs)', color: 'var(--stone)' },

  /* Accordion row (unlocked recipe, collapsed) */
  recetteGroup:   { display: 'flex', flexDirection: 'column' },
  rowBtn:         { background: 'var(--white)', border: '1px solid var(--sand)', borderRadius: 'var(--r-md)', padding: 'var(--s4) var(--s5)', display: 'flex', alignItems: 'center', gap: 'var(--s4)', cursor: 'pointer', width: '100%', textAlign: 'left', transition: 'background 120ms ease' },
  rowBtnOpen:     { background: 'var(--white)', border: '1px solid var(--sand)', borderBottom: 'none', borderRadius: 'var(--r-md) var(--r-md) 0 0', padding: 'var(--s4) var(--s5)', display: 'flex', alignItems: 'center', gap: 'var(--s4)', cursor: 'pointer', width: '100%', textAlign: 'left' },
  rowTitle:       { flex: 1, minWidth: 0, fontSize: 'var(--tx-sm)', fontWeight: 600, color: 'var(--forest)', margin: 0, lineHeight: 1.4 },
  rowThumb:       { width: 48, height: 48, borderRadius: 'var(--r-sm)', objectFit: 'cover', flexShrink: 0 },
  rowChevron:     { flexShrink: 0, color: 'var(--stone)', fontSize: 'var(--tx-xs)', userSelect: 'none', width: 16, textAlign: 'center' },
  detailCardWrap: { borderRadius: '0 0 var(--r-lg) var(--r-lg)', overflow: 'hidden', border: '1px solid var(--sand)', borderTop: 'none' },

  /* Full recipe card */
  detailCard:      { background: 'var(--white)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden', position: 'relative' },
  detailBadge:     { position: 'absolute', top: 14, left: 14, zIndex: 2, width: 34, height: 34, borderRadius: '50%', background: 'var(--sage)', color: 'var(--forest)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, letterSpacing: '.02em', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' },
  detailPhotoWrap: { background: 'var(--cream)', overflow: 'hidden' },
  detailPhoto:     { width: '100%', aspectRatio: '4/3', objectFit: 'contain', maxHeight: 480, display: 'block' },
  detailBody:      { padding: 'clamp(20px, 5vw, 32px)', paddingBottom: 'clamp(28px, 5vw, 40px)', display: 'flex', flexDirection: 'column', gap: 'clamp(20px, 3vw, 28px)' },
  detailTitle:   { fontFamily: 'var(--serif)', fontSize: 'var(--tx-xl)', fontWeight: 400, color: 'var(--forest)', lineHeight: 1.25, margin: 0 },
  detailTagline: { fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 'var(--tx-base)', color: 'var(--bark)', lineHeight: 1.7, margin: 0, opacity: 0.85 },

  /* Two-column layout — stacks naturally when container is narrow */
  detailColumns: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--s7)', alignItems: 'start' },
  detailCol:     { display: 'flex', flexDirection: 'column', gap: 'var(--s4)' },
  colHeading:    { fontFamily: 'var(--font-sans)', fontSize: 'var(--tx-xs)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--stone)', margin: 0 },

  ingredientList: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--s2)' },
  ingredientItem: { fontSize: 'var(--tx-sm)', color: 'var(--bark)', lineHeight: 1.55, paddingLeft: 0 },

  stepList: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--s4)' },
  stepItem: { display: 'flex', gap: 'var(--s3)', alignItems: 'flex-start', fontSize: 'var(--tx-sm)', color: 'var(--bark)', lineHeight: 1.6 },
  stepNum:  { flexShrink: 0, width: 22, height: 22, borderRadius: '50%', background: 'var(--forest)', color: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, marginTop: 1 },

  noteBox: { background: 'var(--sand)', borderRadius: 'var(--r-md)', padding: 'var(--s5) var(--s6)' },
  tipBox:  { background: 'var(--sand)', borderRadius: 'var(--r-md)', padding: 'var(--s5) var(--s6)' },
  noteText: { fontSize: 'var(--tx-sm)', color: 'var(--earth)', lineHeight: 1.7, margin: 0 },
}
