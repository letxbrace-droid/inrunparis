import useBookingStore from '../../store/useBookingStore'
import GlowingCTA from '../ui/GlowingCTA'

export default function Step2Price({ onNext, onBack }) {
  const { depart, arrive, price } = useBookingStore()

  if (!price) return (
    <div className="flex flex-col items-center justify-center gap-4 px-5 py-16">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,65,3,.35)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
      </svg>
      <p className="text-ink-muted text-sm text-center">Revenez à l'étape 1 pour calculer le trajet</p>
      <button onClick={onBack} className="text-accent text-sm underline cursor-pointer">← Retour</button>
    </div>
  )

  return (
    <div className="flex flex-col gap-5 px-5 pb-6">

      {/* Route summary */}
      <div className="flex items-center gap-2 px-1 pt-1">
        <p className="flex-1 text-xs text-ink-muted truncate text-right">
          {depart?.name?.split(',').slice(0, 2).join(',')}
        </p>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,65,3,.55)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
        <p className="flex-1 text-xs text-ink-muted truncate">
          {arrive?.name?.split(',').slice(0, 2).join(',')}
        </p>
      </div>

      {/* Price card */}
      <div
        className="relative flex flex-col items-center justify-center py-9 rounded-3xl overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, rgba(255,65,3,.09) 0%, rgba(255,65,3,.03) 100%)',
          border: '1px solid rgba(255,65,3,.25)',
          borderTop: '3px solid #ff4103',
        }}
      >
        {/* Ambient glow */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(255,65,3,.12), transparent 70%)' }}
        />

        <span
          className="font-mono font-bold leading-none tracking-tight"
          style={{ fontSize: '4rem', color: '#F5F1E8' }}
        >
          {price.final}<span style={{ fontSize: '2rem', color: '#ff4103', marginLeft: 4 }}>€</span>
        </span>

        <div className="flex items-center gap-2.5 mt-3">
          <span className="font-mono text-xs" style={{ color: 'rgba(245,241,232,.45)' }}>
            {price.km} km
          </span>
          <span style={{ color: 'rgba(245,241,232,.2)' }}>·</span>
          <span className="font-mono text-xs" style={{ color: 'rgba(245,241,232,.45)' }}>
            ≈ {price.mins} min
          </span>
          {price.savings > 0 && (
            <>
              <span style={{ color: 'rgba(245,241,232,.2)' }}>·</span>
              <span className="text-xs font-semibold" style={{ color: '#34d399' }}>
                −{price.savings}€ vs apps
              </span>
            </>
          )}
        </div>

        {(price.isNight || price.isAirport) && (
          <div className="flex gap-2 mt-4 flex-wrap justify-center px-4">
            {price.isNight && (
              <span
                className="px-3 py-1 rounded-full text-xs font-medium"
                style={{
                  background: 'rgba(255,65,3,.12)',
                  border: '1px solid rgba(255,65,3,.3)',
                  color: '#ff4103',
                }}
              >
                Tarif nuit
              </span>
            )}
            {price.isAirport && (
              <span
                className="px-3 py-1 rounded-full text-xs font-medium"
                style={{
                  background: 'rgba(255,65,3,.12)',
                  border: '1px solid rgba(255,65,3,.3)',
                  color: '#ff4103',
                }}
              >
                ✈ Supplément aéroport inclus
              </span>
            )}
          </div>
        )}
      </div>

      {/* Nav */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-none px-5 py-4 rounded-2xl text-sm font-medium cursor-pointer active:scale-95 transition-transform"
          style={{
            background: 'rgba(245,241,232,.06)',
            border: '1px solid rgba(245,241,232,.12)',
            color: 'rgba(245,241,232,.6)',
          }}
        >
          ← Retour
        </button>
        <GlowingCTA onClick={onNext} className="flex-1">
          Continuer →
        </GlowingCTA>
      </div>

    </div>
  )
}
