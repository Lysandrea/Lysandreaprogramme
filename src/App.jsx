import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext.jsx'

import Login          from './pages/auth/Login.jsx'
import ClienteDash    from './pages/cliente/Dashboard.jsx'
import CoachDash      from './pages/coach/Dashboard.jsx'
import JourDetail     from './pages/cliente/JourDetail.jsx'
import Programme      from './pages/cliente/Programme.jsx'
import BilanSoir      from './pages/cliente/BilanSoir.jsx'
import ClienteDetail  from './pages/coach/ClienteDetail.jsx'

/* ── Route guard ── */
function Protected({ children, allow }) {
  const { user, role, loading } = useAuth()
  const location = useLocation()

  if (loading) return <LoadingScreen />
  if (!user)   return <Navigate to="/" state={{ from: location }} replace />
  if (allow && role !== allow) {
    return <Navigate to={role === 'coach' ? '/coach' : '/dashboard'} replace />
  }
  return children
}

function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--cream)',
      fontFamily: 'var(--font-serif)',
      fontSize: 'var(--text-xl)',
      color: 'var(--stone)',
      letterSpacing: '0.05em',
    }}>
      Lysa Andréa…
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Login />} />

      {/* Cliente */}
      <Route path="/dashboard" element={
        <Protected allow="cliente"><ClienteDash /></Protected>
      } />
      <Route path="/programme" element={
        <Protected allow="cliente"><Programme /></Protected>
      } />
      <Route path="/programme/:jour" element={
        <Protected allow="cliente"><JourDetail /></Protected>
      } />
      <Route path="/bilan/:jour" element={
        <Protected allow="cliente"><BilanSoir /></Protected>
      } />

      {/* Coach */}
      <Route path="/coach" element={
        <Protected allow="coach"><CoachDash /></Protected>
      } />
      <Route path="/coach/cliente/:id" element={
        <Protected allow="coach"><ClienteDetail /></Protected>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
