import { useState, useCallback, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import useBookingStore from '../../store/useBookingStore'
import useOSRM         from '../../hooks/useOSRM'
import useGeolocation  from '../../hooks/useGeolocation'
import { searchPlaces, displayAddr } from '../../utils/geocoder'
import { computePriceForBooking } from '../../utils/priceEngine'
import GlowingCTA  from '../ui/GlowingCTA'
import useAppTheme from '../../hooks/useAppTheme'


function LocationInput({ label, value, onSelect, placeholder, icon, th }) {
  const [query,       setQuery]   = useState(value?.name ?? '')
  const [suggestions, setSuggest] = useState([])
  const [loading,     setLoading] = useState(false)
  const [focused,     setFocused] = useState(false)
  const timerRef = useRef(null)

  // Sync field when value is set externally (GPS detection, store hydration)
  useEffect(() => {
    if (value?.name) setQuery(displayAddr(value))
  }, [value])

  const handleChange = (e) => {
    const q = e.target.value
    setQuery(q)
    clearTimeout(timerRef.current)
    if (q.length < 2) { setSuggest([]); return }
    timerRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const results = await searchPlaces(q)
        setSuggest(results)
      } finally {
        setLoading(false)
      }
    }, 350)
  }

  const pick = (item) => {
    setQuery(displayAddr(item))
    setSuggest([])
    setFocused(false)
    onSelect(item)
  }

  return (
    <div className="relative flex-1">
      <div
        className="flex items-center rounded-2xl transition-all duration-200"
        style={{
          background: th.bgInput,
          border: `1px solid ${focused ? 'color-mix(in srgb, var(--accent) 45%, transparent)' : th.border}`,
          boxShadow: focused ? '0 0 0 3px color-mix(in srgb, var(--accent) 8%, transparent)' : 'none',
        }}
      >
        <span className="pl-4 flex-shrink-0" style={{ color: focused ? '#FF5A1F' : 'color-mix(in srgb, var(--accent) 50%, transparent)' }}>
          {icon}
        </span>
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          placeholder={placeholder}
          className="flex-1 py-4 pl-3 pr-4 text-sm outline-none bg-transparent"
          style={{ color: th.inkFull }}
          aria-label={label}
          autoComplete="off"
        />
        {loading && (
          <span className="pr-3 flex-shrink-0">
            <span className="block w-4 h-4 border-2 rounded-full animate-spin"
              style={{ borderColor: 'color-mix(in srgb, var(--accent) 30%, transparent)', borderTopColor: '#FF5A1F' }} />
          </span>
        )}
      </div>

      {suggestions.length > 0 && (
        <ul
          role="listbox"
          className="absolute top-full left-0 right-0 mt-1.5 z-20 rounded-2xl overflow-hidden"
          style={{
            background: th.bgCard,
            boxShadow: '0 8px 24px rgba(0,0,0,.55)',
            border: `1px solid ${th.border}`,
            maxHeight: 200,
            overflowY: 'auto',
          }}
        >
          {suggestions.map((s, i) => (
            <li key={i}>
              <button
                onClick={() => pick(s)}
                className="w-full text-left px-4 py-3 text-sm transition-colors cursor-pointer"
                style={{
                  color: th.inkMid,
                  borderBottom: i < suggestions.length - 1 ? `1px solid ${th.borderFaint}` : 'none',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'color-mix(in srgb, var(--accent) 8%, transparent)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
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

const IconDepart = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="8" strokeOpacity=".35"/>
  </svg>
)

const IconArrive = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
)

export default function Step1Route({ onNext }) {
  const th = useAppTheme()
  const { depart, arrive, pickup, vehicleType, setDepart, setArrive, setPrice, setRouteGeometry } = useBookingStore()
  const { route, loading, error, fetchRoute } = useOSRM()
  const { status: geoStatus, error: geoError, detect } = useGeolocation()

  const handleCalculate = useCallback(async () => {
    if (!depart || !arrive || !pickup) return
    const result = await fetchRoute(depart, arrive)
    if (result) {
      setRouteGeometry(result.geometry)
      const price = computePriceForBooking(result.km, result.mins, { pickup, depart, arrive, vehicleType })
      setPrice(price)
    }
  }, [depart, arrive, pickup, vehicleType, fetchRoute, setPrice, setRouteGeometry])

  const handleGeolocate = useCallback(() => {
    detect((result) => {
      setDepart(result)
      setRouteGeometry(null)
    })
  }, [detect, setDepart, setRouteGeometry])

  const canProceed = depart && arrive && route && pickup

  return (
    <div className="flex flex-col gap-4 px-5 pb-6">

      {/* Departure */}
      <div className="flex items-center gap-2">
        <LocationInput
          label="Départ"
          value={depart}
          onSelect={(item) => { setDepart(item); setRouteGeometry(null) }}
          placeholder="Adresse de départ"
          icon={IconDepart}
          th={th}
        />
        {/* GPS button */}
        <button
          onClick={handleGeolocate}
          disabled={geoStatus === 'loading'}
          aria-label="Détecter ma position GPS"
          className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center cursor-pointer active:scale-95 transition-all duration-200"
          style={{
            background: geoStatus === 'success'
              ? 'color-mix(in srgb, var(--accent) 12%, transparent)'
              : th.bgInput,
            border: geoStatus === 'success'
              ? '1px solid color-mix(in srgb, var(--accent) 35%, transparent)'
              : `1px solid ${th.border}`,
          }}
        >
          {geoStatus === 'loading' ? (
            <span className="block w-4 h-4 border-2 rounded-full animate-spin"
              style={{ borderColor: 'color-mix(in srgb, var(--accent) 30%, transparent)', borderTopColor: '#FF5A1F' }} />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="#FF5A1F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="7"/>
              <circle cx="12" cy="12" r="2.5" fill="#FF5A1F" stroke="none"/>
              <line x1="12" y1="1"  x2="12" y2="5"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
              <line x1="1"  y1="12" x2="5"  y2="12"/>
              <line x1="19" y1="12" x2="23" y2="12"/>
            </svg>
          )}
        </button>
      </div>

      {/* Geo hint */}
      {geoStatus === 'error' && geoError && (
        <p className="text-xs px-1" style={{ color: 'color-mix(in srgb, var(--danger) 80%, transparent)' }}>{geoError}</p>
      )}
      {geoStatus === 'success' && (
        <p className="text-xs px-1" style={{ color: 'color-mix(in srgb, var(--accent) 80%, transparent)' }}>Position détectée</p>
      )}

      {/* Connector */}
      <div className="flex justify-center -my-1">
        <div
          className="w-px"
          style={{
            height: 20,
            background: 'linear-gradient(to bottom, color-mix(in srgb, var(--accent) 50%, transparent), color-mix(in srgb, var(--accent) 10%, transparent))',
          }}
        />
      </div>

      {/* Arrival */}
      <LocationInput
        label="Arrivée"
        value={arrive}
        onSelect={(item) => { setArrive(item); setRouteGeometry(null) }}
        placeholder="Adresse d'arrivée"
        icon={IconArrive}
        th={th}
      />

      {/* Date/time */}
      <div>
        <div
          className="flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-200"
          style={{
            background: th.bgInput,
            border: depart && arrive && !pickup
              ? '1px solid color-mix(in srgb, var(--accent) 45%, transparent)'
              : `1px solid ${th.border}`,
            boxShadow: depart && arrive && !pickup
              ? '0 0 0 3px color-mix(in srgb, var(--accent) 8%, transparent)'
              : undefined,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke={depart && arrive && !pickup ? '#FF5A1F' : 'color-mix(in srgb, var(--accent) 55%, transparent)'}
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
          </svg>
          <input
            type="datetime-local"
            defaultValue={pickup ?? ''}
            min={new Date().toISOString().slice(0, 16)}
            onChange={(e) => useBookingStore.getState().setPickup(e.target.value || null)}
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: th.inkHigh, colorScheme: th.inputScheme }}
            aria-label="Date et heure de prise en charge"
            aria-required="true"
          />
        </div>
        {depart && arrive && !pickup && (
          <p className="text-xs px-1 mt-1.5" style={{ color: 'color-mix(in srgb, var(--accent) 80%, transparent)' }}>
            Sélectionnez une date et heure pour calculer le tarif
          </p>
        )}
      </div>

      {error && (
        <p className="text-sm text-center px-1" style={{ color: 'color-mix(in srgb, var(--danger) 80%, transparent)' }}>{error}</p>
      )}

      {/* Route result badge — layoutId shared with Step2 route strip */}
      {route && (
        <motion.div
          layoutId="route-strip"
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
          style={{
            background: 'color-mix(in srgb, var(--accent) 6%, transparent)',
            border: '1px solid color-mix(in srgb, var(--accent) 18%, transparent)',
          }}
        >
          <div className="flex flex-col items-center flex-shrink-0" aria-hidden="true">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#FF5A1F' }} />
            <span className="w-px my-1" style={{ height: 8, background: 'linear-gradient(to bottom, color-mix(in srgb, var(--accent) 50%, transparent), color-mix(in srgb, var(--accent) 12%, transparent))' }} />
            <span className="w-1.5 h-1.5 rounded-full border" style={{ borderColor: 'color-mix(in srgb, var(--accent) 60%, transparent)', background: 'transparent' }} />
          </div>
          <p className="flex-1 text-[12px] font-semibold truncate" style={{ color: '#FF5A1F' }}>
            {depart?.name?.split(',')[0] ?? '—'}
          </p>
          <span className="font-mono text-[11px] font-semibold flex-shrink-0 px-2 py-0.5 rounded-full"
            style={{ background: 'color-mix(in srgb, var(--accent) 10%, transparent)', color: '#FF5A1F' }}>
            {route.km.toFixed(1)} km · {Math.round(route.mins)} min
          </span>
          <p className="flex-1 text-[12px] font-semibold truncate text-right" style={{ color: '#FF5A1F' }}>
            {arrive?.name?.split(',')[0] ?? '—'}
          </p>
        </motion.div>
      )}

      <GlowingCTA
        onClick={canProceed ? onNext : handleCalculate}
        disabled={(!depart || !arrive || !pickup) || loading}
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Calcul en cours…
          </>
        ) : canProceed ? (
          <>Voir le tarif →</>
        ) : depart && arrive && !pickup ? (
          <>Choisir une date</>
        ) : (
          <>Calculer le trajet</>
        )}
      </GlowingCTA>
    </div>
  )
}
