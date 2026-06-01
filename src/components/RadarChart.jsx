export const ROUE_LABELS = ['Corps', 'Énergie', 'Émotions', 'Relations', 'Pro', 'Espace', 'Confiance', 'Sommeil']
export const ROUE_KEYS   = ['corps_mouvement','energie_vitalite','emotions','relations','vie_pro','environnement','rapport_soi','sommeil_recuperation']
export const ROUE_FULL   = ['Corps & mouvement','Énergie & vitalité','Émotions','Relations & liens','Vie professionnelle','Environnement & espace de vie','Rapport à soi & confiance','Sommeil & récupération']
export const DEF_ROUE    = { corps_mouvement:5, energie_vitalite:5, emotions:5, relations:5, vie_pro:5, environnement:5, rapport_soi:5, sommeil_recuperation:5 }

export default function RadarChart({ values = DEF_ROUE }) {
  const CX = 200, CY = 200, MAX_R = 130, N = 8

  function pt(angleDeg, r) {
    const rad = (angleDeg - 90) * Math.PI / 180
    return [CX + r * Math.cos(rad), CY + r * Math.sin(rad)]
  }

  const angles  = Array.from({ length: N }, (_, i) => (i * 360) / N)
  const vals     = ROUE_KEYS.map(k => values[k] ?? 5)
  const dataPts  = angles.map((a, i) => pt(a, (vals[i] / 10) * MAX_R))
  const dataPath = dataPts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${y}`).join('') + 'Z'

  function gridPath(level) {
    const pts = angles.map(a => pt(a, (level / 10) * MAX_R))
    return pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${y}`).join('') + 'Z'
  }

  return (
    <svg viewBox="0 0 400 400" style={{ width: '100%', maxWidth: 340, display: 'block', margin: '0 auto' }}>
      {[2,4,6,8,10].map(lvl => (
        <path key={lvl} d={gridPath(lvl)} fill="none" stroke="#E8DDD0" strokeWidth="0.8" />
      ))}
      {angles.map((a, i) => {
        const [x, y] = pt(a, MAX_R)
        return <line key={i} x1={CX} y1={CY} x2={x} y2={y} stroke="rgba(196,181,160,.5)" strokeWidth="0.8" />
      })}
      <path d={dataPath} style={{ fill: '#3D4F3C', fillOpacity: 0.28, stroke: '#6B7F5E', strokeWidth: 2 }} />
      {dataPts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3.5" fill="#6B7F5E" />
      ))}
      {angles.map((a, i) => {
        const [lx, ly] = pt(a, MAX_R + 28)
        const anchor   = lx < CX - 8 ? 'end' : lx > CX + 8 ? 'start' : 'middle'
        return (
          <g key={i}>
            <text x={lx} y={ly - 4}  textAnchor={anchor} style={{ fontSize: 10, fill: '#5C4A35', fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>{ROUE_LABELS[i]}</text>
            <text x={lx} y={ly + 11} textAnchor={anchor} style={{ fontSize: 9,  fill: '#C07860', fontFamily: 'DM Sans, sans-serif' }}>{vals[i]}/10</text>
          </g>
        )
      })}
    </svg>
  )
}
