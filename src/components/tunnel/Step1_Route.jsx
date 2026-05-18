import { useState, useCallback, useRef } from 'react'
import useBookingStore from '../../store/useBookingStore'
import useOSRM         from '../../hooks/useOSRM'
import { computePriceForBooking } from '../../utils/priceEngine'
import GlowingCTA from '../ui/GlowingCTA'

async function geocodeNominatim(query) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=fr&accept-language=fr`
  const r = await fetch(url, { headers: { 'Accept-Language': 'fr' } })
  const data = await r.json()
  return data.map((item) => ({
    name: item.display_name,
    lat:  parseFloat(item.lat),
    lng:  parseFloat(item.lon),
  }))
}

function LocationInput({ label, value, onSelect, placeholder }) {
  const [query,       setQuery]   = useState(value?.name ?? '')
  const [suggestions, setSuggest] = useState([])
  const [loading,     setLoading] = useState(false)
  const timerRef = useRef(null)

  const handleChange = (e) => {
    const q = e.target.value
    setQuery(q)
    clearTimeout(timerRef.current)
    if (q.length < 2) { setSuggest([]); return }
    timerRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const results = await geocodeNominatim(q)
        setSuggest(results)
      } finally {
        setLoading(false)
      }
    }, 350)
  }

  const pick = (item) => {
    setQuery(item.name.split(',')[0])
    setSuggest([])
    onSelect(item)
  }

  return (
    <div className="relative">
      <div className="relative flex items-center">
        <span className="absolute left-4 text-ink-muted text-sm">{label === 'Départ' ? '📍' : '🏁'}</span>
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder={placeholder}
          className="
            w-full py-4 pl-10 pr-4 rounded-2xl
            bg-bg-elevated border border-[var(--rule-strong)]
            text-ink-primary text-sm placeholder-ink-muted
            focus:outline-none focus:border-accent
            transition-colors duration-200
          "
          aria-label={label}
          autoComplete="off"
        />
        {loading && (
          <span className="absolute right-3 w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
        )}
      </div>

      {suggestions.length > 0 && (
        <ul
          role="listbox"
          className="
            absolute top-full left-0 right-0 mt-1 z-10
            bg-[#001621] border border-[var(--rule-strong)] rounded-2xl
            overflow-hidden max-h-52 overflow-y-auto
          "
        >
          {suggestions.map((s, i) => (
            <li key={i}>
              <button
                onClick={() => pick(s)}
                className="
                  w-full text-left px-4 py-3 text-sm text-ink-secondary
                  hover:bg-accent/10 hover:text-ink-primary
                  transition-colors cursor-pointer border-b border-[var(--rule)] last:border-0
                "
              >
                {s.name.split(',').slice(0, 2).join(',')}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function Step1Route({ onNext }) {
  const { depart, arrive, pickup, vehicleType, setDepart, setArrive, setPrice } = useBookingStore()
  const { route, loading, error, fetchRoute } = useOSRM()

  const handleCalculate = useCallback(async () => {
    if (!depart || !arrive) return
    const result = await fetchRoute(depart, arrive)
    if (result) {
      const price = computePriceForBooking(result.km, result.mins, { pickup, depart, arrive, vehicleType })
      setPrice(price)
    }
  }, [depart, arrive, pickup, vehicleType, fetchRoute, setPrice])

  const canProceed = depart && arrive && route

  return (
    <div className="flex flex-col gap-4 px-5 pb-6">
      <LocationInput
        label="Départ"
        value={depart}
        onSelect={setDepart}
        placeholder="Adresse de départ"
      />

      {/* Route connector */}
      <div className="flex justify-center">
        <div className="w-px h-6 bg-gradient-to-b from-accent/40 to-accent/10" />
      </div>

      <LocationInput
        label="Arrivée"
        value={arrive}
        onSelect={setArrive}
        placeholder="Adresse d'arrivée"
      />

      {/* Date/time picker */}
      <div className="flex items-center gap-3 bg-bg-elevated rounded-2xl px-4 py-3 border border-[var(--rule-strong)]">
        <span className="text-ink-muted text-sm">🕒</span>
        <input
          type="datetime-local"
          defaultValue={pickup ?? ''}
          onChange={(e) => useBookingStore.getState().setPickup(e.target.value || null)}
          className="flex-1 bg-transparent text-ink-primary text-sm outline-none"
          aria-label="Date et heure de prise en charge"
        />
      </div>

      {error && (
        <p className="text-sm text-red-400 text-center">{error}</p>
      )}

      {route && (
        <div className="flex items-center justify-center gap-4 py-2">
          <span className="font-mono text-xs text-ink-muted">{route.km.toFixed(1)} km</span>
          <span className="text-ink-muted">·</span>
          <span className="font-mono text-xs text-ink-muted">≈ {Math.round(route.mins)} min</span>
        </div>
      )}

      <GlowingCTA
        onClick={canProceed ? onNext : handleCalculate}
        disabled={(!depart || !arrive) || loading}
      >
        {loading ? 'Calcul...' : canProceed ? 'Voir le tarif →' : 'Calculer le trajet'}
      </GlowingCTA>
    </div>
  )
}
