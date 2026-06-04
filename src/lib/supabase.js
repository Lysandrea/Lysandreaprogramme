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
export async function saveBilan(clienteId, jourNum, answers, seanceFaite = true) {
  const { error: e1 } = await supabase
    .from('bilans')
    .upsert(
      { cliente_id: clienteId, jour_num: jourNum, ...answers },
      { onConflict: 'cliente_id,jour_num' }
    )
  if (e1) { console.error('[saveBilan] upsert bilans :', e1); throw e1 }

  if (seanceFaite) await marquerSeance(clienteId, jourNum)

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
    if (e3) { console.error('[saveBilan] update current_day :', e3); throw e3 }
  }
}

/** Récupère tous les jour_nums pour lesquels la cliente a un bilan complété */
export async function fetchBilansJourNums(clienteId) {
  const { data, error } = await supabase
    .from('bilans')
    .select('jour_num')
    .eq('cliente_id', clienteId)
  if (error) throw error
  return (data ?? []).map(b => b.jour_num)
}

/** Récupère les bilans d'une cliente (les + récents en premier). Sans limit = tous. */
export async function fetchBilans(clienteId, limit = null) {
  let query = supabase
    .from('bilans')
    .select('*')
    .eq('cliente_id', clienteId)
    .order('jour_num', { ascending: false })
  if (limit) query = query.limit(limit)
  const { data, error } = await query
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

export async function createCoachNotification(coachId, clienteId, message, type = 'onboarding_complete') {
  await supabase
    .from('notifications')
    .insert({ coach_id: coachId, cliente_id: clienteId, message, type })
}

/* ════════════════════════════════════════════════
   Helpers — Notifications
   ════════════════════════════════════════════════ */

export async function fetchNotifications(coachId) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('coach_id', coachId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function markNotificationRead(notificationId) {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)
  if (error) throw error
}

export async function fetchUnreadNotificationsCount(coachId) {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('coach_id', coachId)
    .eq('read', false)
  if (error) throw error
  return count ?? 0
}

/* ════════════════════════════════════════════════
   Helpers — Bilans coach
   ════════════════════════════════════════════════ */

/* ════════════════════════════════════════════════
   Helpers — Profil (cliente)
   ════════════════════════════════════════════════ */

export async function updateProfile(userId, data) {
  const { error } = await supabase
    .from('profiles')
    .update(data)
    .eq('id', userId)
  if (error) throw error
}

/* ════════════════════════════════════════════════
   Helpers — Letters
   ════════════════════════════════════════════════ */

export async function fetchLetter(clienteId) {
  const { data, error } = await supabase
    .from('letters')
    .select('contenu, created_at, updated_at')
    .eq('cliente_id', clienteId)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data ?? null
}

export async function saveLetter(clienteId, contenu) {
  const { error } = await supabase
    .from('letters')
    .upsert(
      { cliente_id: clienteId, contenu, updated_at: new Date().toISOString() },
      { onConflict: 'cliente_id' }
    )
  if (error) throw error
}

/* ════════════════════════════════════════════════
   Helpers — Avis
   ════════════════════════════════════════════════ */

export async function fetchAvis(clienteId) {
  const { data, error } = await supabase
    .from('avis')
    .select('note, commentaire, created_at')
    .eq('cliente_id', clienteId)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data ?? null
}

export async function saveAvis(clienteId, note, commentaire) {
  const { error } = await supabase
    .from('avis')
    .upsert(
      { cliente_id: clienteId, note, commentaire, updated_at: new Date().toISOString() },
      { onConflict: 'cliente_id' }
    )
  if (error) throw error
}

/* ════════════════════════════════════════════════
   Helpers — Programmes IA
   ════════════════════════════════════════════════ */

export async function fetchAiProgramme(clienteId) {
  const { data, error } = await supabase
    .from('ai_programmes')
    .select('*')
    .eq('cliente_id', clienteId)
    .maybeSingle()
  if (error) throw error
  return data ?? null
}

export async function saveAiProgramme(clienteId, { profil_resume, programme, questions_personnalisees }) {
  const { error } = await supabase
    .from('ai_programmes')
    .upsert(
      {
        cliente_id: clienteId,
        profil_resume,
        programme,
        questions_personnalisees,
        statut: 'en_attente',
        generated_at: new Date().toISOString(),
      },
      { onConflict: 'cliente_id' }
    )
  if (error) throw error
}

export async function publishAiProgramme(programmeId, { profil_resume, programme, questions_personnalisees }) {
  const { error } = await supabase
    .from('ai_programmes')
    .update({
      profil_resume,
      programme,
      questions_personnalisees,
      statut: 'publie',
      publie_at: new Date().toISOString(),
    })
    .eq('id', programmeId)
  if (error) throw error
}

export async function saveReponseCoach(bilanId, reponse) {
  const { data, error } = await supabase
    .from('bilans')
    .update({ reponse_coach: reponse, reponse_coach_at: new Date().toISOString() })
    .eq('id', bilanId)
    .select('id')
  if (error) {
    console.error('[saveReponseCoach] Supabase error:', error)
    throw error
  }
  if (!data || data.length === 0) {
    const msg = 'Aucune ligne mise à jour — colonnes manquantes ou RLS bloque la requête. Lance le SQL coach_setup.sql dans Supabase.'
    console.error('[saveReponseCoach]', msg, { bilanId })
    throw new Error(msg)
  }
}
