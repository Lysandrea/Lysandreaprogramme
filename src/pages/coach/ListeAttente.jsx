import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase.js'
import Sidebar from '../../components/Sidebar.jsx'
import Topbar  from '../../components/Topbar.jsx'
import Card    from '../../components/Card.jsx'
import Button  from '../../components/Button.jsx'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

function exportCSV(rows) {
  const header = 'Email,Date d\'inscription\n'
  const body = rows
    .map(r => `${r.email},"${formatDate(r.created_at)}"`)
    .join('\n')
  const blob = new Blob([header + body], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `liste-attente-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function ListeAttente() {
  const [rows,    setRows]    = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('waitlist')
      .select('id, email, created_at')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setRows(data)
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="shell">
      <Sidebar />
      <div className="shell-main">
        <Topbar title="Liste d'attente" subtitle="Visiteuses inscrites avant ouverture" />
        <div className="shell-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s6)' }}>

          {/* Stat + export */}
          <div style={s.topRow}>
            <div style={s.statCard}>
              <span style={s.statValue}>{loading ? '—' : rows.length}</span>
              <span style={s.statLabel}>
                {rows.length <= 1 ? 'personne en attente' : 'personnes en attente'}
              </span>
            </div>
            {rows.length > 0 && (
              <Button variant="secondary" onClick={() => exportCSV(rows)}>
                Exporter en CSV ↓
              </Button>
            )}
          </div>

          {/* Table */}
          <Card title="Emails collectés">
            {loading ? (
              <p style={s.empty}>Chargement…</p>
            ) : rows.length === 0 ? (
              <p style={s.empty}>
                Personne pour l'instant.<br />
                Les emails apparaîtront ici dès qu'une visiteuse s'inscrit. 🌿
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={s.theadRow}>
                  <span style={{ flex: 1 }}>Email</span>
                  <span style={{ width: 180, textAlign: 'right' }}>Date d'inscription</span>
                </div>
                {rows.map((r, i) => (
                  <div
                    key={r.id}
                    style={{
                      ...s.row,
                      borderBottom: i === rows.length - 1 ? 'none' : '1px solid var(--sand)',
                    }}
                  >
                    <span style={s.email}>{r.email}</span>
                    <span style={s.date}>{formatDate(r.created_at)}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

const s = {
  topRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'var(--s4)',
    flexWrap: 'wrap',
  },
  statCard: {
    background: 'var(--white)',
    border: '1px solid var(--sand)',
    borderRadius: 'var(--r-lg)',
    padding: 'var(--s5) var(--s8)',
    display: 'flex',
    alignItems: 'baseline',
    gap: 12,
    boxShadow: 'var(--sh-sm)',
  },
  statValue: {
    fontFamily: 'var(--serif)',
    fontSize: 52,
    fontWeight: 300,
    lineHeight: 1,
    color: 'var(--forest)',
  },
  statLabel: {
    fontSize: 'var(--tx-sm)',
    color: 'var(--stone)',
  },
  theadRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px var(--s3) 8px',
    fontSize: 10,
    fontWeight: 600,
    color: 'var(--stone)',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    borderBottom: '1px solid var(--sand)',
    marginBottom: 2,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    padding: 'var(--s3) var(--s3)',
  },
  email: {
    flex: 1,
    fontSize: 'var(--tx-sm)',
    color: 'var(--earth)',
  },
  date: {
    width: 180,
    textAlign: 'right',
    fontSize: 'var(--tx-sm)',
    color: 'var(--stone)',
  },
  empty: {
    fontSize: 'var(--tx-sm)',
    color: 'var(--stone)',
    lineHeight: 1.8,
    padding: 'var(--s4) 0',
  },
}
