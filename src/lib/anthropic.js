import { supabase } from './supabase.js'

export async function generateProgramme(clienteData, clienteId) {
  console.log('[AI] Appel Edge Function generate-programme — cliente:', clienteId)

  const { data, error } = await supabase.functions.invoke('generate-programme', {
    body: { clienteData, clienteId },
  })

  if (error) {
    console.error('[AI] Erreur Edge Function:', error)
    throw new Error(error.message ?? 'Erreur lors de la génération du programme')
  }

  if (data?.error) {
    console.error('[AI] Erreur retournée par la fonction:', data.error)
    throw new Error(data.error)
  }

  console.log('[AI] Programme généré et sauvegardé ✓')
  return data
}
