import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { fetchJours, fetchBilansJourNums } from '../../lib/supabase.js'

export default function Progression() {
  const { user, profile } = useAuth()
  const [jours,   setJours]   = useState([])
  const [bilans,  setBilans]  = useState([])
  const [loading, setLoading] = useState(true)

  const currentDay    = profile?.current_day ?? 1
  const currentSem    = Math.ceil(currentDay / 7)

  useEffect(() => {
    if (!user) return
    Promise.all([
      fetchJours(user.id),
      fetchBilansJourNums(user.id),
    ]).then(([j, b]) => {
      setJours(j)
      setBilans(b)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [user])

  const doneSet    = new Set(jours.filter(j => j.seance_faite).map(j => j.jour_num))
  const bilanSet   = new Set(bilans)
  const joursCount = doneSet.size
  const bilansCount = bilanSet.size

  /* last 7 days bar chart */
  const last7Start = Math.max(1, currentDay - 6)
  const last7Days  = Array.from({ length: Math.min(7, currentDay) }, (_, i) => last7Start + i)

  /* 8 semaines status */
  const semaines = Array.from({ length: 8 }, (_, i) => {
    const sem       = i + 1
    const dayStart  = (sem - 1) * 7 + 1
    const dayEnd    = sem * 7
    const bilCount  = bilans.filter(n => n >= dayStart && n <= dayEnd).length
    let status = 'locked'
    if (sem < currentSem)    status = 'done'
    if (sem === currentSem)  status = 'current'
    return { sem, dayStart, dayEnd, bilCount, status }
  })

  if (loading) {
    return <div style={s.page}><p style={s.meta}>Chargement…</p></div>
  }

  return (
    <div style={s.page}>
      <h1 style={s.title}>Ma progression</h1>

      {/* Stats cards */}
      <div style={s.statsRow}>
        <StatCard label="Jours complétés" value={joursCount} sub="/56 jours" />
        <StatCard label="Bilans remplis"  value={bilansCount} sub={`/${currentDay} disponibles`} />
        <StatCard label="Semaine actuelle" value={`S${currentSem}`} sub="sur 8 semaines" />
      </div>

      {/* Bar chart */}
      <div style={s.card}>
        <h2 style={s.cardTitle}>7 derniers jours</h2>
        <div style={s.barRow}>
          {last7Days.map(day => {
            const done    = doneSet.has(day)
            const isCur   = day === currentDay
            return (
              <div key={day} style={s.barCol}>
                <div style={{
                  ...s.bar,
                  height: done ? 48 : 16,
                  background: done ? 'var(--moss)' : isCur ? 'var(--terracotta)' : 'var(--mist)',
                }} />
                <span style={s.barLabel}>J{day}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Semaines list */}
      <div style={s.card}>
        <h2 style={s.cardTitle}>8 semaines</h2>
        {semaines.map(({ sem, dayStart, dayEnd, bilCount, status }) => (
          <div key={sem} style={{ ...s.semRow, ...(status === 'current' ? s.semCurrent : {}) }}>
            <div style={s.semDot(status)} />
            <div style={{ flex: 1 }}>
              <span style={s.semLabel}>Semaine {sem}</span>
              <span style={s.semSub}> — jours {dayStart}–{dayEnd}</span>
            </div>
            {status !== 'locked' && (
              <span style={s.semBilans}>{bilCount} bilan{bilCount > 1 ? 's' : ''}</span>
            )}
            {status === 'locked' && <span style={s.semLock}>🔒</span>}
            {status === 'done'    && <span style={s.semCheck}>✓</span>}
            {status === 'current' && <span style={s.semActive}>En cours</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

function StatCard({ label, value, sub }) {
  return (
    <div style={s.statCard}>
      <span style={s.statValue}>{value}</span>
      <span style={s.statLabel}>{label}</span>
      <span style={s.statSub}>{sub}</span>
    </div>
  )
}

const s = {
  page:       { padding: 'var(--s8) var(--s6)', maxWidth: 640 },
  title:      { fontFamily: 'var(--serif)', fontSize: 'var(--tx-2xl)', color: 'var(--forest)', fontWeight: 400, marginBottom: 'var(--s7)' },
  meta:       { fontSize: 'var(--tx-sm)', color: 'var(--stone)', fontStyle: 'italic' },
  statsRow:   { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--s4)', marginBottom: 'var(--s6)' },
  statCard:   { background: 'var(--white)', borderRadius: 'var(--r-md)', padding: 'var(--s6)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 4 },
  statValue:  { fontFamily: 'var(--serif)', fontSize: 32, color: 'var(--forest)', fontWeight: 400 },
  statLabel:  { fontSize: 'var(--tx-xs)', color: 'var(--forest)', fontWeight: 500 },
  statSub:    { fontSize: 'var(--tx-xs)', color: 'var(--stone)' },
  card:       { background: 'var(--white)', borderRadius: 'var(--r-md)', padding: 'var(--s6)', boxShadow: 'var(--shadow-sm)', marginBottom: 'var(--s5)' },
  cardTitle:  { fontSize: 'var(--tx-sm)', fontWeight: 600, color: 'var(--forest)', marginBottom: 'var(--s5)', letterSpacing: '.02em' },
  barRow:     { display: 'flex', gap: 'var(--s3)', alignItems: 'flex-end', height: 64 },
  barCol:     { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 6 },
  bar:        { width: '100%', borderRadius: 4, transition: 'height .3s ease' },
  barLabel:   { fontSize: 9, color: 'var(--stone)', letterSpacing: '.04em' },
  semRow:     { display: 'flex', alignItems: 'center', gap: 'var(--s3)', padding: '9px 0', borderBottom: '1px solid var(--mist)' },
  semCurrent: { background: 'rgba(193,100,68,.04)', borderRadius: 6, padding: '9px 8px', margin: '0 -8px' },
  semDot:     (status) => ({
    width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
    background: status === 'done' ? 'var(--moss)' : status === 'current' ? 'var(--terracotta)' : 'var(--mist)',
  }),
  semLabel:   { fontSize: 'var(--tx-sm)', fontWeight: 500, color: 'var(--forest)' },
  semSub:     { fontSize: 'var(--tx-xs)', color: 'var(--stone)' },
  semBilans:  { fontSize: 'var(--tx-xs)', color: 'var(--stone)' },
  semLock:    { fontSize: 12, opacity: .4 },
  semCheck:   { fontSize: 13, color: 'var(--moss)', fontWeight: 700 },
  semActive:  { fontSize: 'var(--tx-xs)', color: 'var(--terracotta)', fontWeight: 600, background: 'rgba(193,100,68,.08)', padding: '2px 8px', borderRadius: 99 },
}
