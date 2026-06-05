import { useEffect, useState } from 'react'
import { useNavigate }         from 'react-router-dom'
import { useAuth }             from '../../contexts/AuthContext.jsx'
import {
  IS_MOCK, fetchClientes, fetchNotifications, markNotificationRead,
} from '../../lib/supabase.js'
import Sidebar from '../../components/Sidebar.jsx'
import Topbar  from '../../components/Topbar.jsx'
import Card    from '../../components/Card.jsx'
import Badge   from '../../components/Badge.jsx'
import Button  from '../../components/Button.jsx'
import { MOCK_CLIENTES } from '../../lib/mockData.js'

export default function CoachDashboard() {
  const { user }  = useAuth()
  const navigate  = useNavigate()

  const [clientes,       setClientes]       = useState(MOCK_CLIENTES)
  const [notifications,  setNotifications]  = useState([])
  const [loading,        setLoading]        = useState(!IS_MOCK)

  useEffect(() => {
    if (IS_MOCK || !user) return
    Promise.all([
      fetchClientes(user.id),
      fetchNotifications(user.id),
    ])
      .then(([cl, notifs]) => {
        setClientes(cl)
        setNotifications(notifs)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user])

  const clienteMap  = Object.fromEntries(clientes.map(c => [c.id, c.prenom ?? 'Cliente']))

  /* Group notifications by cliente — keep most recent, track count */
  const groupedNotifs = Object.values(
    notifications.reduce((acc, n) => {
      const key = n.cliente_id
      if (!acc[key] || n.created_at > acc[key].created_at) {
        acc[key] = { ...n, count: (acc[key]?.count ?? 0) + 1 }
      } else {
        acc[key] = { ...acc[key], count: acc[key].count + 1 }
      }
      return acc
    }, {})
  ).sort((a, b) => b.created_at.localeCompare(a.created_at))

  const unreadNotifs = groupedNotifs.filter(n => !n.read)

  function handleMarkRead(notifId) {
    /* Mark all notifications from same cliente read */
    const clienteId = notifications.find(n => n.id === notifId)?.cliente_id
    const ids = clienteId ? notifications.filter(n => n.cliente_id === clienteId).map(n => n.id) : [notifId]
    ids.forEach(id => markNotificationRead(id).catch(console.error))
    setNotifications(prev => prev.map(n => ids.includes(n.id) ? { ...n, read: true } : n))
  }

  const actives    = clientes.filter(c => c.status === 'active').length
  const bilansEn   = clientes.reduce((a, c) => a + (c.bilansEnAttente ?? 0), 0)
  const onboarding = clientes.filter(c => c.status === 'onboarding').length

  return (
    <div className="shell">
      <Sidebar />
      <div className="shell-main">
        <Topbar title="Vue Coach" subtitle="Tableau de bord" />
        <div className="shell-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s6)' }}>

          {/* Notifications */}
          {!IS_MOCK && (
            <Card title={`🔔 Notifications${unreadNotifs.length > 0 ? ` · ${unreadNotifs.length} non lue${unreadNotifs.length > 1 ? 's' : ''}` : ''}`}>
              {groupedNotifs.length === 0 ? (
                <p style={{ fontSize: 'var(--tx-sm)', color: 'var(--stone)', padding: 'var(--s2) 0' }}>
                  Tout est à jour ✓
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {groupedNotifs.map((n, i) => (
                    <NotifRow
                      key={n.id}
                      n={n}
                      prenom={clienteMap[n.cliente_id] ?? 'Cliente'}
                      isLast={i === groupedNotifs.length - 1}
                      onRead={handleMarkRead}
                      onView={() => navigate(`/coach/cliente/${n.cliente_id}`, { state: { tab: 'questionnaire' } })}
                    />
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* Stat cards */}
          <div style={s.statsRow}>
            <StatCard label="Clientes actives"     value={actives}    color="var(--moss)" />
            <StatCard label="Bilans en attente"     value={bilansEn}   color="var(--terracotta)" />
            <StatCard label="Onboardings en cours"  value={onboarding} color="var(--bark)" />
          </div>

          {/* Liste clientes */}
          <Card title="Mes clientes">
            {loading ? (
              <p style={{ fontSize: 'var(--tx-sm)', color: 'var(--stone)', padding: 'var(--s4) 0' }}>Chargement…</p>
            ) : clientes.length === 0 ? (
              <p style={{ fontSize: 'var(--tx-sm)', color: 'var(--stone)', padding: 'var(--s4) 0' }}>
                Aucune cliente pour l'instant.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {clientes.map((c, i) => (
                  <ClienteRow
                    key={c.id}
                    c={c}
                    isLast={i === clientes.length - 1}
                    onClick={() => navigate(`/coach/cliente/${c.id}`)}
                  />
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

function NotifRow({ n, prenom, isLast, onRead, onView }) {
  const dateStr = new Date(n.created_at).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  })
  const count = n.count ?? 1

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 'var(--s4)',
      padding: 'var(--s4) var(--s3)',
      borderBottom: isLast ? 'none' : '1px solid var(--sand)',
      background: n.read ? 'transparent' : 'rgba(192,120,96,.04)',
    }}>
      {!n.read && (
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--terracotta)', flexShrink: 0, marginTop: 6 }} />
      )}
      {n.read && <div style={{ width: 8, flexShrink: 0 }} />}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 'var(--tx-sm)', color: 'var(--earth)', fontWeight: n.read ? 400 : 500 }}>
          <span style={{ fontWeight: 600 }}>{prenom}</span>
          {count > 1
            ? ` — ${count} soumissions`
            : ' a soumis son questionnaire'}
        </p>
        <p style={{ fontSize: 'var(--tx-xs)', color: 'var(--stone)', marginTop: 2 }}>{dateStr}</p>
      </div>
      <div style={{ display: 'flex', gap: 'var(--s2)', flexShrink: 0, flexWrap: 'wrap' }}>
        <Button size="sm" variant="secondary" onClick={onView}>
          Voir le questionnaire →
        </Button>
        {!n.read && (
          <Button size="sm" variant="ghost" onClick={() => onRead(n.id)}>
            Marquer comme lu
          </Button>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div style={s.statCard}>
      <span style={{ ...s.statValue, color }}>{value}</span>
      <span style={s.statLabel}>{label}</span>
    </div>
  )
}

function ClienteRow({ c, isLast, onClick }) {
  const lastDate = c.derniereBilanDate
    ? new Date(c.derniereBilanDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
    : '—'

  const jourActuel = c.current_day ?? c.jourActuel ?? 1

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 'var(--s4)',
        padding: 'var(--s4) var(--s3)',
        borderRadius: 'var(--r-md)',
        borderBottom: isLast ? 'none' : '1px solid var(--sand)',
        cursor: 'pointer', transition: 'background var(--ease-fast)',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--cream)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
    >
      <div style={s.avatar}>{(c.prenom?.[0] ?? '?')}{(c.nom?.[0] ?? '')}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={s.name}>{c.prenom} {c.nom}</p>
        <p style={s.email}>{c.email}</p>
      </div>
      <div style={s.jourBlock}>
        <span style={s.jourVal}>J{jourActuel}</span>
        <span style={{ fontSize: 'var(--tx-xs)', color: 'var(--stone)' }}>/56</span>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0, minWidth: 100 }}>
        <p style={{ fontSize: 'var(--tx-xs)', color: 'var(--stone)' }}>Dernière activité</p>
        <p style={{ fontSize: 'var(--tx-sm)', fontWeight: 500, color: 'var(--earth)' }}>{lastDate}</p>
      </div>
      <Badge variant={c.status} />
    </div>
  )
}

const s = {
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--s4)' },
  statCard: {
    background: 'var(--white)', border: '1px solid var(--sand)',
    borderRadius: 'var(--r-lg)', padding: 'var(--s6)',
    display: 'flex', flexDirection: 'column', gap: 'var(--s1)', boxShadow: 'var(--sh-sm)',
  },
  statValue: { fontFamily: 'var(--serif)', fontSize: 52, fontWeight: 300, lineHeight: 1 },
  statLabel: { fontSize: 'var(--tx-sm)', color: 'var(--stone)', marginTop: 'var(--s1)' },
  avatar: {
    width: 40, height: 40, borderRadius: '50%',
    background: 'var(--sand)', color: 'var(--earth)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 'var(--tx-xs)', fontWeight: 700, flexShrink: 0, letterSpacing: '.02em',
  },
  name:     { fontSize: 'var(--tx-sm)', fontWeight: 500, color: 'var(--earth)' },
  email:    { fontSize: 'var(--tx-xs)', color: 'var(--stone)' },
  jourBlock:{ textAlign: 'right', flexShrink: 0 },
  jourVal:  { fontFamily: 'var(--serif)', fontSize: 'var(--tx-xl)', fontWeight: 400, color: 'var(--earth)' },
}
