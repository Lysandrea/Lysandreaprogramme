import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'

/* ── Mock fallback (used when Supabase is not configured) ── */
const MOCK_USERS = {
  'coach@lysa.fr':    { id: 'mock-coach', email: 'coach@lysa.fr',    role: 'coach',   prenom: 'Lysa' },
  'cliente@lysa.fr':  { id: 'mock-c1',    email: 'cliente@lysa.fr',  role: 'cliente', prenom: 'Camille' },
}
const MOCK_PASSWORD = 'lysa2024'
const IS_MOCK = !import.meta.env.VITE_SUPABASE_URL

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)   // Supabase user object
  const [profile, setProfile] = useState(null)   // { role, prenom, ... }
  const [loading, setLoading] = useState(true)

  /* Derive role from profile (or mock) */
  const role = profile?.role ?? null

  /* ── Bootstrap: check existing session ── */
  useEffect(() => {
    if (IS_MOCK) { setLoading(false); return }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser(session.user)
          fetchProfile(session.user.id)
        } else {
          setUser(null)
          setProfile(null)
          setLoading(false)
        }
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId) {
    const { data } = await supabase
      .from('profiles')
      .select('role, prenom, avatar_url')
      .eq('id', userId)
      .single()
    setProfile(data ?? { role: 'cliente', prenom: '' })
    setLoading(false)
  }

  /* ── Sign in ── */
  async function signIn(email, password) {
    if (IS_MOCK) {
      const mock = MOCK_USERS[email.toLowerCase()]
      if (!mock || password !== MOCK_PASSWORD) {
        throw new Error('Identifiants incorrects. Essaie coach@lysa.fr ou cliente@lysa.fr / lysa2024')
      }
      setUser({ id: mock.id, email: mock.email })
      setProfile({ role: mock.role, prenom: mock.prenom })
      return { role: mock.role }
    }

    const { error, data } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error

    const { data: prof } = await supabase
      .from('profiles')
      .select('role, prenom')
      .eq('id', data.user.id)
      .single()

    setUser(data.user)
    setProfile(prof)
    return { role: prof?.role }
  }

  /* ── Sign out ── */
  async function signOut() {
    if (!IS_MOCK) await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  return (
    <AuthContext.Provider value={{ user, profile, role, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
