import { Component } from 'react'

const WA = `https://wa.me/33767742220?text=${encodeURIComponent(
  "Bonjour Nourdine, l'application a planté de mon côté. Je souhaite réserver une course.",
)}`

/**
 * Le dernier filet avant l'écran blanc.
 *
 * Sans ça, une seule erreur de rendu n'importe où dans l'arbre démonte toute
 * l'application : React vide la racine et le client se retrouve devant du noir,
 * sans message, sans recours, et sans que personne ne sache que c'est arrivé.
 * Pour une app dont le seul but est de prendre une réservation, c'est une
 * course perdue en silence.
 *
 * L'écran de repli ne s'excuse pas : il propose la seule chose que le client
 * voulait faire, et elle ne dépend pas du code qui vient de casser — WhatsApp
 * est un lien, pas un composant.
 */
export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    // Pas de service de télémétrie ici : la console est ce qu'on a, et c'est ce
    // qui remonte dans un rapport de bug si un client en envoie un.
    console.error('[inrun] crash', error, info?.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div
        role="alert"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 2147483000,
          background: '#050505',
          color: '#F5F1E8',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 18,
          padding: '0 36px',
          textAlign: 'center',
          fontFamily: "'Outfit', system-ui, sans-serif",
        }}
      >
        <div style={{ fontSize: 14, letterSpacing: '.22em', textTransform: 'uppercase', color: 'rgba(245,241,232,.45)' }}>
          I&amp;N RUN
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.3, letterSpacing: '-.02em', margin: 0 }}>
          L&apos;application a rencontré un problème.
        </h1>
        <p style={{ fontSize: 14, lineHeight: 1.6, color: 'rgba(245,241,232,.6)', maxWidth: 320, margin: 0 }}>
          Votre course, elle, reste possible. Écrivez-moi directement, je réponds
          en quelques minutes.
        </p>

        <a
          href={WA}
          style={{
            marginTop: 8,
            padding: '16px 30px',
            borderRadius: 999,
            background: '#25D366',
            color: '#04140A',
            fontSize: 16,
            fontWeight: 800,
            textDecoration: 'none',
          }}
        >
          Réserver sur WhatsApp
        </a>

        <button
          onClick={() => {
            // Un rechargement simple relance la même version depuis le cache du
            // service worker — donc la même erreur. Il faut vider avant.
            Promise.allSettled([
              navigator.serviceWorker?.getRegistrations?.().then((rs) => Promise.all(rs.map((r) => r.unregister()))),
              caches?.keys?.().then((ks) => Promise.all(ks.map((k) => caches.delete(k)))),
            ]).finally(() => location.reload())
          }}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            fontSize: 12,
            fontWeight: 700,
            color: 'rgba(245,241,232,.45)',
            textDecoration: 'underline',
          }}
        >
          Réinitialiser l&apos;application
        </button>
      </div>
    )
  }
}
