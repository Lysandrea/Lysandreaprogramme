import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext.jsx'

import Login          from './pages/auth/Login.jsx'
import Inscription    from './pages/auth/Inscription.jsx'
import Onboarding     from './pages/cliente/Onboarding.jsx'
import ClienteDash    from './pages/cliente/Dashboard.jsx'
import JourDetail     from './pages/cliente/JourDetail.jsx'
import BilanSoir      from './pages/cliente/BilanSoir.jsx'
import RoueDeLaVie    from './pages/cliente/RoueDeLaVie.jsx'
import Profil         from './pages/cliente/Profil.jsx'
import Documents      from './pages/cliente/Documents.jsx'
import Progression    from './pages/cliente/Progression.jsx'
import Podcasts       from './pages/cliente/Podcasts.jsx'
import Recettes       from './pages/cliente/Recettes.jsx'
import LettreFin      from './pages/cliente/LettreFin.jsx'
import Avis           from './pages/cliente/Avis.jsx'
import Attente        from './pages/cliente/Attente.jsx'
import CoachDash      from './pages/coach/Dashboard.jsx'
import ClienteDetail  from './pages/coach/ClienteDetail.jsx'

/* ── Loading screen ── */
function Spinner() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--cream)',
    }}>
      <span style={{
        fontFamily: 'var(--serif)', fontSize: 'var(--tx-xl)',
        color: 'var(--stone)', letterSpacing: '.06em',
      }}>
        Lysa Andréa…
      </span>
    </div>
  )
}

/* ── ProtectedRoute ── */
function ProtectedRoute({ children, allow }) {
  const { user, role, loading } = useAuth()
  const location = useLocation()

  if (loading) return <Spinner />
  if (!user)   return <Navigate to="/" state={{ from: location }} replace />
  if (allow && role !== allow) {
    return <Navigate to={role === 'coach' ? '/coach' : '/dashboard'} replace />
  }
  return children
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Login />} />
      <Route path="/inscription" element={<Inscription />} />

      {/* Onboarding (cliente only, no onboarding check — this IS the onboarding) */}
      <Route path="/onboarding" element={
        <ProtectedRoute allow="cliente"><Onboarding /></ProtectedRoute>
      } />

      {/* Waiting page after onboarding */}
      <Route path="/attente" element={
        <ProtectedRoute allow="cliente"><Attente /></ProtectedRoute>
      } />

      {/* Cliente (protected — Dashboard handles onboarding redirect internally) */}
      <Route path="/dashboard" element={
        <ProtectedRoute allow="cliente"><ClienteDash /></ProtectedRoute>
      } />
      <Route path="/jour/:id" element={
        <ProtectedRoute allow="cliente"><JourDetail /></ProtectedRoute>
      } />
      <Route path="/bilan/:id" element={
        <ProtectedRoute allow="cliente"><BilanSoir /></ProtectedRoute>
      } />
      <Route path="/roue-de-la-vie" element={
        <ProtectedRoute allow="cliente"><RoueDeLaVie /></ProtectedRoute>
      } />
      <Route path="/profil" element={
        <ProtectedRoute allow="cliente"><Profil /></ProtectedRoute>
      } />
      <Route path="/documents" element={
        <ProtectedRoute allow="cliente"><Documents /></ProtectedRoute>
      } />
      <Route path="/progression" element={
        <ProtectedRoute allow="cliente"><Progression /></ProtectedRoute>
      } />
      <Route path="/podcasts" element={
        <ProtectedRoute allow="cliente"><Podcasts /></ProtectedRoute>
      } />
      <Route path="/recettes" element={
        <ProtectedRoute allow="cliente"><Recettes /></ProtectedRoute>
      } />
      <Route path="/lettre-fin" element={
        <ProtectedRoute allow="cliente"><LettreFin /></ProtectedRoute>
      } />
      <Route path="/avis" element={
        <ProtectedRoute allow="cliente"><Avis /></ProtectedRoute>
      } />

      {/* Coach (protected) */}
      <Route path="/coach" element={
        <ProtectedRoute allow="coach"><CoachDash /></ProtectedRoute>
      } />
      <Route path="/coach/cliente/:id" element={
        <ProtectedRoute allow="coach"><ClienteDetail /></ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
