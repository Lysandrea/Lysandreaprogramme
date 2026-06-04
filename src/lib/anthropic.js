const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY

const SYSTEM_PROMPT = `Tu es Lysa Andréa, coach sportif spécialisée dans l'accompagnement des femmes qui ont un rapport difficile à leur corps.
Tu dois analyser le questionnaire d'une nouvelle cliente et générer :
1. Un profil résumé (ses blocages, son profil émotionnel, le ton à adopter, ses forces)
2. Un programme sport 8 semaines adapté à son niveau, sa fréquence, son matériel et ses zones à éviter
3. 3 questions de bilan du soir personnalisées pour elle

Réponds UNIQUEMENT en JSON valide avec cette structure exacte :
{
  "profil_resume": "string",
  "programme": [
    {
      "semaine": 1,
      "theme": "string",
      "intention": "string",
      "jours": [
        {
          "jour": 1,
          "nom": "string",
          "duree": 45,
          "type": "string",
          "intention": "string",
          "exercices": [
            {
              "nom": "string",
              "series": 3,
              "reps": "string",
              "repos": "string",
              "charge_notes": "",
              "commentaire": "",
              "fait": false
            }
          ]
        }
      ]
    }
  ],
  "questions_personnalisees": [
    { "question": "string", "placeholder": "string" },
    { "question": "string", "placeholder": "string" },
    { "question": "string", "placeholder": "string" }
  ]
}

Le programme doit avoir exactement 8 semaines. Chaque semaine doit avoir des jours de séance adaptés à la fréquence indiquée par la cliente (les jours sans séance peuvent avoir duree:0 et exercices vides avec un type "repos"). Génère des exercices réalistes et progressifs semaine par semaine.`

export async function generateProgramme(clienteData) {
  const keyPreview = ANTHROPIC_API_KEY
    ? `${ANTHROPIC_API_KEY.slice(0, 16)}...`
    : 'NON DÉFINIE'
  console.log('[AI] generateProgramme démarré')
  console.log('[AI] Clé API :', keyPreview)
  console.log('[AI] Cliente :', clienteData?.prenom_surnom ?? '(sans prénom)')

  if (!ANTHROPIC_API_KEY || ANTHROPIC_API_KEY === '***') {
    throw new Error(
      'Clé API Anthropic non configurée — redémarre le serveur Vite après avoir mis VITE_ANTHROPIC_API_KEY dans .env.local'
    )
  }

  console.log('[AI] Envoi requête à api.anthropic.com...')

  let response
  try {
    response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 8192,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `Voici le questionnaire complet de la nouvelle cliente :\n\n${JSON.stringify(clienteData, null, 2)}`,
          },
        ],
      }),
    })
  } catch (networkErr) {
    console.error('[AI] Erreur réseau (CORS ?):', networkErr)
    throw new Error(`Erreur réseau : ${networkErr.message}`)
  }

  console.log('[AI] Réponse reçue — status:', response.status)

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    console.error('[AI] Erreur API:', response.status, err)
    throw new Error(err?.error?.message ?? `Erreur API Anthropic (${response.status})`)
  }

  const data = await response.json()
  const text = data.content?.[0]?.text ?? ''
  console.log('[AI] Texte reçu — longueur:', text.length, 'chars')

  let jsonText = text.trim()
  if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
  }

  try {
    const parsed = JSON.parse(jsonText)
    console.log('[AI] JSON parsé ✓ — semaines:', parsed.programme?.length ?? 0)
    return parsed
  } catch {
    const match = jsonText.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('Réponse IA invalide — JSON non trouvé dans la réponse')
    const parsed = JSON.parse(match[0])
    console.log('[AI] JSON extrait ✓ — semaines:', parsed.programme?.length ?? 0)
    return parsed
  }
}
