import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function repairAndParseJson(text) {
  let inString = false
  let escape = false
  const stack = []
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (escape) { escape = false; continue }
    if (ch === '\\' && inString) { escape = true; continue }
    if (ch === '"') { inString = !inString; continue }
    if (inString) continue
    if (ch === '{') stack.push('}')
    else if (ch === '[') stack.push(']')
    else if (ch === '}' || ch === ']') stack.pop()
  }
  let repaired = text.trimEnd()
  if (inString) repaired += '"'
  repaired += stack.reverse().join('')
  return JSON.parse(repaired)
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { clienteId, semaineNum, theme, intention, jours, profil_resume, clienteData } = await req.json()

    if (!clienteId || !semaineNum) {
      return new Response(
        JSON.stringify({ error: 'clienteId et semaineNum requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!anthropicKey) {
      return new Response(
        JSON.stringify({ error: 'ANTHROPIC_API_KEY non configurée dans les secrets Supabase' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const joursListe = (jours ?? [])
      .map(j => `- J${j.jour} : ${j.nom} (${j.type}, ${j.duree} min)`)
      .join('\n')

    const prompt = `Tu es Lysa Andréa. Génère les exercices détaillés pour la semaine ${semaineNum} de cette cliente.
Thème: ${theme ?? '—'} — Intention: ${intention ?? '—'}
Profil: ${profil_resume ?? '—'}
Séances existantes:
${joursListe}
Fréquence: ${clienteData?.frequence ?? '—'} | Matériel: ${clienteData?.materiel ?? 'non précisé'} | Zones à éviter: ${clienteData?.zones_a_eviter ?? 'aucune'}

Pour chaque séance existante, génère 4 exercices maximum avec: nom, series, reps, repos.
Garde le nom de séance et le type existants, remplis juste le tableau exercices.
Adapte au matériel disponible et zones à éviter de la cliente.

Réponds en JSON: { "jours": [{ "jour": 1, "exercices": [{ "nom": "string", "series": 3, "reps": "10-12", "repos": "60s" }] }] }`

    console.log('[generate-semaine-exercices] Appel Anthropic — cliente:', clienteId, '— semaine:', semaineNum)

    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2048,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!anthropicRes.ok) {
      const err = await anthropicRes.json().catch(() => ({}))
      throw new Error(err?.error?.message ?? `Erreur Anthropic (${anthropicRes.status})`)
    }

    const anthropicData = await anthropicRes.json()
    const rawText = anthropicData.content?.[0]?.text ?? ''
    console.log('[generate-semaine-exercices] Réponse reçue — longueur:', rawText.length)

    let jsonText = rawText.trim()
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
    }

    let result
    try {
      result = JSON.parse(jsonText)
    } catch (firstErr) {
      console.warn('[generate-semaine-exercices] JSON.parse direct échoué, réparation…')
      const match = jsonText.match(/\{[\s\S]*/)
      const candidate = match ? match[0] : jsonText
      try {
        result = repairAndParseJson(candidate)
      } catch {
        throw new Error(`Réponse IA invalide — JSON non parsable: ${firstErr.message}`)
      }
    }

    // Map jour num → exercices from AI result
    const exercicesMap = {}
    for (const j of (result.jours ?? [])) {
      exercicesMap[j.jour] = j.exercices ?? []
    }

    // Fetch current programme from DB
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL'),
      Deno.env.get('SERVICE_ROLE_KEY')
    )

    const { data: aiRow, error: fetchError } = await supabase
      .from('ai_programmes')
      .select('id, programme')
      .eq('cliente_id', clienteId)
      .single()

    if (fetchError) throw new Error(fetchError.message)

    // Merge exercises only for the target week, keep everything else intact
    const programme = JSON.parse(JSON.stringify(aiRow.programme ?? []))
    for (const sem of programme) {
      if (sem.semaine === semaineNum) {
        for (const jour of (sem.jours ?? [])) {
          if (exercicesMap[jour.jour] !== undefined) {
            jour.exercices = exercicesMap[jour.jour]
          }
        }
      }
    }

    const { error: saveError } = await supabase
      .from('ai_programmes')
      .update({ programme })
      .eq('id', aiRow.id)

    if (saveError) throw new Error(saveError.message)

    console.log('[generate-semaine-exercices] Exercices sauvegardés ✓ — semaine:', semaineNum)

    return new Response(
      JSON.stringify({ success: true, programme }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue'
    console.error('[generate-semaine-exercices] ERREUR:', message)
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
