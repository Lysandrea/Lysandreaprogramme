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
  const [rows,       setRows]       = useState([])
  const [loading,    setLoading]    = useState(true)
  const [notifying,  setNotifying]  = useState(false)
  const [resetting,  setResetting]  = useState(false)
  const [notifyMsg,  setNotifyMsg]  = useState(null) // { type: 'success'|'error', text: string }

  useEffect(() => {
    supabase
      .from('waitlist')
      .select('id, email, created_at, notified')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setRows(data)
      })
      .finally(() => setLoading(false))
  }, [])

  const unnotifiedCount = rows.filter(r => !r.notified).length
  const notifiedCount   = rows.filter(r =>  r.notified).length

  async function handleNotify() {
    if (unnotifiedCount === 0) return
    const confirmed = window.confirm(
      `Envoyer l'annonce d'ouverture à ${unnotifiedCount} personne${unnotifiedCount > 1 ? 's' : ''} ?`
    )
    if (!confirmed) return

    setNotifying(true)
    setNotifyMsg(null)
    try {
      const { data, error } = await supabase.functions.invoke('notify-waitlist')
      if (error) throw error

      // Refresh rows so notified flags update
      const { data: fresh } = await supabase
        .from('waitlist')
        .select('id, email, created_at, notified')
        .order('created_at', { ascending: false })
      if (fresh) setRows(fresh)

      const failNote = data.failed?.length > 0
        ? ` (${data.failed.length} échec${data.failed.length > 1 ? 's' : ''})`
        : ''
      setNotifyMsg({ type: 'success', text: `Email envoyé à ${data.sent} personne${data.sent > 1 ? 's' : ''} ✓${failNote}` })
    } catch (err) {
      setNotifyMsg({ type: 'error', text: `Erreur : ${err.message}` })
    } finally {
      setNotifying(false)
    }
  }

  async function handleReset() {
    if (notifiedCount === 0) return
    const confirmed = window.confirm(
      `Réinitialiser les notifications pour ${notifiedCount} personne${notifiedCount > 1 ? 's' : ''} non-convertie${notifiedCount > 1 ? 's' : ''} ?`
    )
    if (!confirmed) return

    setResetting(true)
    setNotifyMsg(null)
    try {
      const { error } = await supabase
        .from('waitlist')
        .update({ notified: false })
        .eq('notified', true)
      if (error) throw error

      setRows(prev => prev.map(r => ({ ...r, notified: false })))
      setNotifyMsg({ type: 'success', text: `Notifications réinitialisées pour ${notifiedCount} personne${notifiedCount > 1 ? 's' : ''} ✓` })
    } catch (err) {
      setNotifyMsg({ type: 'error', text: `Erreur : ${err.message}` })
    } finally {
      setResetting(false)
    }
  }

  return (
    <div className="shell">
      <Sidebar />
      <div className="shell-main">
        <Topbar title="Liste d'attente" subtitle="Visiteuses inscrites avant ouverture" />
        <div className="shell-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s6)' }}>

          {/* Stat + actions */}
          <div style={s.topRow}>
            <div style={s.statCard}>
              <span style={s.statValue}>{loading ? '—' : rows.length}</span>
              <span style={s.statLabel}>
                {rows.length <= 1 ? 'personne en attente' : 'personnes en attente'}
              </span>
            </div>
            <div style={s.actions}>
              {rows.length > 0 && (
                <Button variant="secondary" onClick={() => exportCSV(rows)}>
                  Exporter en CSV ↓
                </Button>
              )}
              {unnotifiedCount > 0 && (
                <Button
                  variant="primary"
                  onClick={handleNotify}
                  loading={notifying}
                >
                  📢 Prévenir la liste d'attente ({unnotifiedCount})
                </Button>
              )}
              {notifiedCount > 0 && (
                <Button
                  variant="secondary"
                  onClick={handleReset}
                  loading={resetting}
                >
                  🔄 Réinitialiser les notifications
                </Button>
              )}
            </div>
          </div>

          {/* Feedback message */}
          {notifyMsg && (
            <p style={notifyMsg.type === 'success' ? s.msgSuccess : s.msgError}>
              {notifyMsg.text}
            </p>
          )}

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
                  <span style={{ width: 140, textAlign: 'right' }}>Date</span>
                  <span style={{ width: 90, textAlign: 'right' }}>Statut</span>
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
                    <span style={{ ...s.badge, ...(r.notified ? s.badgeSent : s.badgePending) }}>
                      {r.notified ? 'Notifiée' : 'En attente'}
                    </span>
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
  actions: {
    display: 'flex',
    gap: 'var(--s3)',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  msgSuccess: {
    fontSize: 'var(--tx-sm)',
    color: 'var(--forest)',
    padding: '10px var(--s4)',
    background: 'rgba(45,90,39,0.08)',
    borderRadius: 'var(--r-sm)',
    border: '1px solid rgba(45,90,39,0.2)',
  },
  msgError: {
    fontSize: 'var(--tx-sm)',
    color: 'var(--terracotta)',
    padding: '10px var(--s4)',
    background: 'rgba(192,120,96,0.08)',
    borderRadius: 'var(--r-sm)',
    border: '1px solid rgba(192,120,96,0.2)',
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
    width: 140,
    textAlign: 'right',
    fontSize: 'var(--tx-sm)',
    color: 'var(--stone)',
  },
  badge: {
    width: 90,
    textAlign: 'right',
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.04em',
  },
  badgeSent: {
    color: 'var(--forest)',
  },
  badgePending: {
    color: 'var(--stone)',
  },
}
