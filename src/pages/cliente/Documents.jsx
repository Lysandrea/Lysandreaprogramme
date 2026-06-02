import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { fetchOnboardingProgress } from '../../lib/supabase.js'

const ACCORD_TEXTE = `ACCORD ET ENGAGEMENT — PROGRAMME LYSA ANDRÉA

En rejoignant ce programme de 8 semaines, je m'engage à :

• Participer activement à chaque semaine du programme
• Compléter mes bilans quotidiens avec honnêteté
• Communiquer avec ma coach en cas de difficulté
• Respecter les recommandations nutritionnelles et sportives fournies
• Prendre soin de moi comme d'une priorité

Je comprends que ce programme est un accompagnement personnalisé et que les résultats dépendent de mon implication.

Ce document a été signé électroniquement lors de mon inscription au programme.`

export default function Documents() {
  const { user } = useAuth()
  const [progress, setProgress] = useState(null)
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    if (!user) return
    fetchOnboardingProgress(user.id)
      .then(setProgress)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user])

  const signedAt = progress?.completed_at
    ? new Date(progress.completed_at).toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : null

  return (
    <div style={s.page}>
      <h1 style={s.title}>Mes documents</h1>

      <div style={s.card}>
        <div style={s.docHeader}>
          <span style={s.docIcon}>📄</span>
          <div>
            <p style={s.docTitle}>Accord &amp; engagement</p>
            {signedAt && <p style={s.docMeta}>Signé le {signedAt}</p>}
          </div>
        </div>

        {loading ? (
          <p style={s.meta}>Chargement…</p>
        ) : (
          <>
            <pre style={s.accord}>{ACCORD_TEXTE}</pre>

            {progress?.signature && (
              <div style={s.signBox}>
                <p style={s.signLabel}>Signature électronique</p>
                <p style={s.signValue}>{progress.signature}</p>
              </div>
            )}

            {!progress?.completed && (
              <p style={s.meta}>Document en attente de signature (onboarding non complété).</p>
            )}
          </>
        )}
      </div>
    </div>
  )
}

const s = {
  page:      { padding: 'var(--s8) var(--s6)', maxWidth: 640 },
  title:     { fontFamily: 'var(--serif)', fontSize: 'var(--tx-2xl)', color: 'var(--forest)', fontWeight: 400, marginBottom: 'var(--s7)' },
  card:      { background: 'var(--white)', borderRadius: 'var(--r-md)', padding: 'var(--s8)', boxShadow: 'var(--shadow-sm)' },
  docHeader: { display: 'flex', alignItems: 'center', gap: 'var(--s4)', marginBottom: 'var(--s6)', paddingBottom: 'var(--s5)', borderBottom: '1px solid var(--mist)' },
  docIcon:   { fontSize: 32 },
  docTitle:  { fontSize: 'var(--tx-md)', fontWeight: 600, color: 'var(--forest)' },
  docMeta:   { fontSize: 'var(--tx-xs)', color: 'var(--stone)', marginTop: 3 },
  accord:    { fontFamily: 'inherit', fontSize: 'var(--tx-sm)', color: 'var(--forest)', lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: 0 },
  signBox:   { marginTop: 'var(--s6)', paddingTop: 'var(--s5)', borderTop: '1px solid var(--mist)' },
  signLabel: { fontSize: 'var(--tx-xs)', color: 'var(--stone)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 6 },
  signValue: { fontFamily: 'var(--serif)', fontSize: 'var(--tx-lg)', color: 'var(--forest)', fontStyle: 'italic' },
  meta:      { fontSize: 'var(--tx-sm)', color: 'var(--stone)', fontStyle: 'italic' },
}
