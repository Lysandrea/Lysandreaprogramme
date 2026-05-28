import { createClient } from '@supabase/supabase-js'

const supabaseUrl     = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const IS_MOCK = !supabaseUrl || supabaseUrl.includes('placeholder')

if (IS_MOCK) {
  console.info('[Supabase] Mode mock actif — données de démonstration.')
}

export const supabase = createClient(
  supabaseUrl     ?? 'https://placeholder.supabase.co',
  supabaseAnonKey ?? 'placeholder'
)

/* ════════════════════════════════════════════════
   Helpers — Jours
   ════════════════════════════════════════════════ */

/** Récupère tous les jours d'une cliente */
export async function fetchJours(clienteId) {
  const { data, error } = await supabase
    .from('jours')
    .select('*')
    .eq('cliente_id', clienteId)
    .order('jour_num')
  if (error) throw error
  return data ?? []
}

/** Marque une séance comme faite (upsert) */
export async function marquerSeance(clienteId, jourNum) {
  const { error } = await supabase
    .from('jours')
    .upsert(
      {
        cliente_id:      clienteId,
        jour_num:        jourNum,
        seance_faite:    true,
        date_completion: new Date().toISOString(),
      },
      { onConflict: 'cliente_id,jour_num' }
    )
  if (error) throw error
}

/* ════════════════════════════════════════════════
   Helpers — Bilans
   ════════════════════════════════════════════════ */

/** Sauvegarde un bilan + avance le current_day du profil */
export async function saveBilan(clienteId, jourNum, answers) {
  // 1. Upsert bilan
  const { error: e1 } = await supabase
    .from('bilans')
    .upsert(
      { cliente_id: clienteId, jour_num: jourNum, ...answers },
      { onConflict: 'cliente_id,jour_num' }
    )
  if (e1) throw e1

  // 2. Marquer la séance comme faite (si pas déjà fait)
  await marquerSeance(clienteId, jourNum)

  // 3. Avancer current_day si nécessaire
  const { data: prof } = await supabase
    .from('profiles')
    .select('current_day')
    .eq('id', clienteId)
    .single()

  if (prof && prof.current_day <= jourNum) {
    const { error: e3 } = await supabase
      .from('profiles')
      .update({ current_day: jourNum + 1 })
      .eq('id', clienteId)
    if (e3) throw e3
  }
}

/** Récupère les bilans d'une cliente (les + récents en premier) */
export async function fetchBilans(clienteId, limit = 10) {
  const { data, error } = await supabase
    .from('bilans')
    .select('*')
    .eq('cliente_id', clienteId)
    .order('jour_num', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data ?? []
}

/* ════════════════════════════════════════════════
   Helpers — Coach
   ════════════════════════════════════════════════ */

/** Récupère toutes les clientes d'un coach */
export async function fetchClientes(coachId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*, jours(jour_num, seance_faite, date_completion)')
    .eq('coach_id', coachId)
    .eq('role', 'cliente')
    .order('created_at')
  if (error) throw error
  return data ?? []
}

/** Récupère le profil d'une cliente (pour le coach) */
export async function fetchClienteProfile(clienteId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', clienteId)
    .single()
  if (error) throw error
  return data
}

/** Débloquer la semaine suivante (avance current_day de 7) */
export async function desbloquerSemaine(clienteId, currentDay) {
  const nextDay = Math.min(currentDay + 7, 57)
  const { error } = await supabase
    .from('profiles')
    .update({ current_day: nextDay })
    .eq('id', clienteId)
  if (error) throw error
  return nextDay
}

/* ════════════════════════════════════════════════
   Helpers — Onboarding
   ════════════════════════════════════════════════ */

export async function fetchOnboardingProgress(clienteId) {
  const { data, error } = await supabase
    .from('onboarding_progress')
    .select('*')
    .eq('cliente_id', clienteId)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data ?? null
}

export async function saveOnboardingStep(clienteId, etape, checklist) {
  const { error } = await supabase
    .from('onboarding_progress')
    .upsert(
      { cliente_id: clienteId, etape_actuelle: etape, checklist, updated_at: new Date().toISOString() },
      { onConflict: 'cliente_id' }
    )
  if (error) throw error
}

export async function saveIntakeResponses(clienteId, reponses) {
  const { error } = await supabase
    .from('intake_responses')
    .upsert(
      { cliente_id: clienteId, reponses, updated_at: new Date().toISOString() },
      { onConflict: 'cliente_id' }
    )
  if (error) throw error
}

export async function fetchIntakeResponses(clienteId) {
  const { data, error } = await supabase
    .from('intake_responses')
    .select('reponses')
    .eq('cliente_id', clienteId)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data?.reponses ?? {}
}

export async function completeOnboarding(clienteId, signature) {
  const { error } = await supabase
    .from('onboarding_progress')
    .upsert(
      {
        cliente_id: clienteId,
        completed: true,
        completed_at: new Date().toISOString(),
        signature,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'cliente_id' }
    )
  if (error) throw error
}

export async function createCoachNotification(coachId, clienteId, message) {
  await supabase
    .from('notifications')
    .insert({ coach_id: coachId, cliente_id: clienteId, message, type: 'onboarding_complete' })
}
