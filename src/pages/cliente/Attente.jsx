import { useNavigate } from 'react-router-dom'

export default function Attente() {
  const navigate = useNavigate()

  return (
    <>
      <style>{`
        @keyframes lysa-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.35; transform: scale(0.78); }
        }
        .attente-pulse { animation: lysa-pulse 3s ease-in-out infinite; }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: 'var(--cream)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--s8)',
      }}>
        <div style={{
          maxWidth: 560,
          width: '100%',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--s8)',
        }}>

          {/* Pulsing dot */}
          <div className="attente-pulse" style={{
            width: 11,
            height: 11,
            borderRadius: '50%',
            background: 'var(--moss)',
          }} />

          {/* Title */}
          <h1 style={{
            fontFamily: 'var(--serif)',
            fontSize: 32,
            fontWeight: 300,
            color: 'var(--earth)',
            lineHeight: 1.3,
            letterSpacing: '-.01em',
          }}>
            Ton programme est entre mes mains.
          </h1>

          {/* Subtitle */}
          <p style={{
            fontFamily: 'var(--sans)',
            fontSize: 14,
            color: 'var(--bark)',
            lineHeight: 1.8,
            maxWidth: 460,
          }}>
            Je lis ton questionnaire avec attention.{' '}
            Ton programme personnalisé sera créé sur mesure pour toi
            et disponible cette semaine.
          </p>

          {/* Quote */}
          <blockquote style={{
            borderLeft: '2px solid var(--sage)',
            paddingLeft: 'var(--s5)',
            textAlign: 'left',
            alignSelf: 'stretch',
          }}>
            <p style={{
              fontFamily: 'var(--serif)',
              fontStyle: 'italic',
              fontSize: 'var(--tx-lg)',
              fontWeight: 300,
              color: 'var(--earth)',
              lineHeight: 1.55,
            }}>
              "Tu as fait le plus dur — commencer.
              Le reste, on le fait ensemble."
            </p>
            <cite style={{
              display: 'block',
              marginTop: 'var(--s2)',
              fontSize: 'var(--tx-xs)',
              fontStyle: 'normal',
              color: 'var(--stone)',
              letterSpacing: '.08em',
              textTransform: 'uppercase',
            }}>
              — Lysa Andréa
            </cite>
          </blockquote>

          {/* Personal message card */}
          <div style={{
            background: 'var(--sand)',
            borderRadius: 'var(--r-lg)',
            padding: 'var(--s6) var(--s8)',
            border: '1px solid rgba(196,181,160,.4)',
            textAlign: 'left',
            alignSelf: 'stretch',
          }}>
            <p style={{
              fontFamily: 'var(--sans)',
              fontSize: 'var(--tx-sm)',
              color: 'var(--earth)',
              lineHeight: 1.85,
              fontStyle: 'italic',
            }}>
              Je suis déjà fière de toi pour ce pas que tu viens de faire.
              N'hésite pas à m'écrire sur WhatsApp si quelque chose
              te vient d'ici là. Je suis là. 🌿
            </p>
          </div>

          {/* Ghost button */}
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              background: 'transparent',
              border: '1px solid var(--stone)',
              borderRadius: 'var(--r-sm)',
              padding: '8px 20px',
              fontSize: 'var(--tx-xs)',
              fontFamily: 'var(--sans)',
              color: 'var(--stone)',
              letterSpacing: '.04em',
              cursor: 'pointer',
              transition: 'color var(--ease-fast), border-color var(--ease-fast)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = 'var(--bark)'
              e.currentTarget.style.borderColor = 'var(--bark)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'var(--stone)'
              e.currentTarget.style.borderColor = 'var(--stone)'
            }}
          >
            Accéder à mon espace →
          </button>

        </div>
      </div>
    </>
  )
}
