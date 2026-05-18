import useBookingStore from '../../store/useBookingStore'
import GlowingCTA from '../ui/GlowingCTA'

export default function Step2Price({ onNext, onBack }) {
  const { depart, arrive, price, vehicleType, setVehicleType } = useBookingStore()

  if (!price) return (
    <div className="flex flex-col items-center justify-center gap-4 px-5 py-12">
      <p className="text-ink-muted text-sm text-center">Revenez à l'étape 1 pour calculer le trajet</p>
      <button onClick={onBack} className="text-accent text-sm underline cursor-pointer">← Retour</button>
    </div>
  )

  return (
    <div className="flex flex-col gap-5 px-5 pb-6">
      {/* Route summary */}
      <div className="text-center py-2">
        <p className="text-xs text-ink-muted truncate">{depart?.name?.split(',')[0]}</p>
        <p className="text-ink-muted text-xs my-0.5">↓</p>
        <p className="text-xs text-ink-muted truncate">{arrive?.name?.split(',')[0]}</p>
      </div>

      {/* Price display */}
      <div
        className="relative flex flex-col items-center justify-center py-8 rounded-3xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(255,65,3,.10), rgba(255,65,3,.03))',
          border: '0.5px solid rgba(255,65,3,.32)',
        }}
      >
        <span className="font-mono text-[3.2rem] font-bold text-ink-primary leading-none">
          {price.final}<span className="text-2xl text-accent ml-1">€</span>
        </span>
        <div className="flex items-center gap-3 mt-2">
          <span className="font-mono text-xs text-ink-muted">{price.km} km</span>
          <span className="text-ink-muted">·</span>
          <span className="font-mono text-xs text-ink-muted">≈ {price.mins} min</span>
          {price.savings > 0 && (
            <>
              <span className="text-ink-muted">·</span>
              <span className="text-xs text-[#34d399]">−{price.savings}€ vs apps</span>
            </>
          )}
        </div>
        {price.isNight && (
          <span className="mt-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs">
            🌙 Tarif nuit
          </span>
        )}
        {price.isAirport && (
          <span className="mt-1 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs">
            ✈️ Supplément aéroport
          </span>
        )}
      </div>

      {/* Vehicle selector */}
      <div className="flex gap-3">
        {['berline', 'van'].map((type) => (
          <button
            key={type}
            onClick={() => setVehicleType(type)}
            className={`
              flex-1 py-3 rounded-2xl text-sm font-medium cursor-pointer
              transition-all duration-200 border
              ${vehicleType === type
                ? 'bg-accent/15 border-accent/50 text-ink-primary'
                : 'bg-bg-elevated border-[var(--rule-strong)] text-ink-muted'}
            `}
          >
            {type === 'berline' ? '🚗 Berline' : '🚐 Van 7 places'}
          </button>
        ))}
      </div>

      <div className="flex gap-3 mt-1">
        <button
          onClick={onBack}
          className="flex-none px-5 py-4 rounded-2xl bg-bg-elevated text-ink-secondary text-sm cursor-pointer border border-[var(--rule-strong)]"
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
