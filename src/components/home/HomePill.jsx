import { useState, useCallback, useRef, useEffect } from 'react'
import useBookingStore from '../../store/useBookingStore'
import useOSRM         from '../../hooks/useOSRM'
import useGeolocation  from '../../hooks/useGeolocation'
import { computePriceForBooking } from '../../utils/priceEngine'

const PRESETS = [
  { name: 'Charles de Gaulle (CDG)', lat: 49.0097, lng: 2.5479,  type: 'airport'  },
  { name: 'CDG · Terminal 1',        lat: 49.0097, lng: 2.5479,  type: 'terminal' },
  { name: 'CDG · Terminal 2E',       lat: 49.0056, lng: 2.5693,  type: 'terminal' },
  { name: 'CDG · Terminal 2F',       lat: 49.0064, lng: 2.5683,  type: 'terminal' },
  { name: 'Orly (ORY)',              lat: 48.7233, lng: 2.3795,  type: 'airport'  },
  { name: 'Orly · Terminal 1-2',     lat: 48.7260, lng: 2.3653,  type: 'terminal' },
  { name: 'Orly · Terminal 3-4',     lat: 48.7281, lng: 2.3594,  type: 'terminal' },
  { name: 'Beauvais (BVA)',          lat: 49.4544, lng: 2.1128,  type: 'airport'  },
  { name: 'Gare du Nord',            lat: 48.8809, lng: 2.3553,  type: 'gare'     },
  { name: 'Gare de Lyon',            lat: 48.8443, lng: 2.3738,  type: 'gare'     },
  { name: 'Gare Montparnasse',       lat: 48.8410, lng: 2.3216,  type: 'gare'     },
  { name: 'Gare Saint-Lazare',       lat: 48.8754, lng: 2.3255,  type: 'gare'     },
  { name: "Gare de l'Est",           lat: 48.8767, lng: 2.3589,  type: 'gare'     },
  { name: 'La Défense · CNIT',       lat: 48.8897, lng: 2.2378,  type: 'poi'      },
  { name: 'Disneyland Paris',        lat: 48.8722, lng: 2.7758,  type: 'poi'      },
  { name: 'Versailles',              lat: 48.8049, lng: 2.1204,  type: 'city'     },
  { name: 'Ris-Orangis (91)',        lat: 48.6468, lng: 2.4185,  type: 'city'     },
]

const TAGS = [
  'CDG · Orly · Beauvais',
  'Province · Gares TGV',
  'Mise à disposition',
  "Réservation à l'avance",
]

const ICON = { airport: '✈', terminal: '✈', gare: '🚄', poi: '📍', city: '🏙', nominatim: '📌' }

const WA_URL = `https://wa.me/33767742220?text=${encodeURIComponent('Bonjour, je souhaite réserver une course.')}`

function norm(s) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

async function searchPlaces(q) {
  const matched = PRESETS.filter(p => norm(p.name).includes(norm(q))).slice(0, 5)
  if (matched.length >= 5 || q.length < 3) return matched

  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&countrycodes=fr&accept-language=fr`
    const r    = await fetch(url, { headers: { 'Accept-Language': 'fr' } })
    const data = await r.json()
    const nom  = data.map(d => ({
      name: d.display_name.split(',').slice(0, 2).join(',').trim(),
      lat:  parseFloat(d.lat),
      lng:  parseFloat(d.lon),
      type: 'nominatim',
    }))
    const seen = new Set(matched.map(p => norm(p.name)))
    return [...matched, ...nom.filter(n => !seen.has(norm(n.name)))].slice(0, 6)
  } catch {
    return matched
  }
}

export default function HomePill({ onOpenSheet }) {
  const [open,       setOpen]       = useState(false)
  const [tagIdx,     setTagIdx]     = useState(0)
  const [tagVisible, setTagVisible] = useState(true)

  // Inputs display value (short label, not full display_name)
  const [departQuery, setDepartQuery] = useState('')
  const [arriveQuery, setArriveQuery] = useState('')

  // Shared autocomplete
  const [suggestions, setSuggestions] = useState([])
  const [acField,     setAcField]     = useState(null) // 'depart' | 'arrive'
  const [acLoading,   setAcLoading]   = useState(false)
  const acTimer = useRef(null)

  // Store
  const {
    depart, arrive, pickup, vehicleType,
    setDepart, setArrive, setPrice, setRouteGeometry,
  } = useBookingStore()
  const price = useBookingStore(s => s.price)

  // Route — local instance for display in the card
  const { route, loading: routeLoading, fetchRoute } = useOSRM()

  // GPS
  const { status: geoStatus, detect } = useGeolocation()

  // Hydrate input display from persisted store on mount
  useEffect(() => {
    if (depart?.name) setDepartQuery(depart.name.split(',')[0])
    if (arrive?.name) setArriveQuery(arrive.name.split(',')[0])
  }, []) // eslint-disable-line

  // Rotating pill tag
  useEffect(() => {
    const t = setInterval(() => {
      setTagVisible(false)
      setTimeout(() => { setTagIdx(i => (i + 1) % TAGS.length); setTagVisible(true) }, 300)
    }, 8000)
    return () => clearInterval(t)
  }, [])

  // Auto-calculate route when both endpoints change
  useEffect(() => {
    if (!depart || !arrive || routeLoading) return
    fetchRoute(depart, arrive).then(result => {
      if (!result) return
      setRouteGeometry(result.geometry)
      setPrice(computePriceForBooking(result.km, result.mins, { pickup, depart, arrive, vehicleType }))
    })
  }, [depart?.lat, depart?.lng, arrive?.lat, arrive?.lng]) // eslint-disable-line

  // Autocomplete trigger
  const triggerAC = useCallback((q, field) => {
    clearTimeout(acTimer.current)
    setSuggestions([])
    setAcField(field)
    if (q.length < 2) return
    acTimer.current = setTimeout(async () => {
      setAcLoading(true)
      try   { setSuggestions(await searchPlaces(q)) }
      finally { setAcLoading(false) }
    }, 350)
  }, [])

  const pickSuggestion = useCallback((item, field) => {
    const short = item.name.split(',')[0]
    if (field === 'depart') {
      setDepartQuery(short)
      setDepart(item)
      setRouteGeometry(null)
    } else {
      setArriveQuery(short)
      setArrive(item)
      setRouteGeometry(null)
    }
    setSuggestions([])
    setAcField(null)
  }, [setDepart, setArrive, setRouteGeometry])

  const handleGPS = useCallback(() => {
    detect(result => {
      setDepartQuery(result.name.split(',')[0])
      setDepart(result)
      setRouteGeometry(null)
    })
  }, [detect, setDepart, setRouteGeometry])

  const handleReserve = useCallback(() => {
    setOpen(false)
    setSuggestions([])
    onOpenSheet(price ? 2 : 1)
  }, [price, onOpenSheet])

  const openCard  = () => { setOpen(true);  setSuggestions([]) }
  const closeCard = () => { setOpen(false); setSuggestions([]) }

  // CTA label
  const ctaLabel = route && price
    ? 'Réserver ce trajet →'
    : routeLoading
      ? 'Calcul…'
      : !depart ? 'Entrez votre départ'
      : !arrive ? 'Entrez votre destination'
      : 'Calculer le trajet…'

  return (
    <>
      {/* ──────────── PILL (collapsed) ──────────── */}
      <button
        onClick={openCard}
        aria-label="Ouvrir la réservation"
        aria-expanded={open}
        className="fixed left-5 right-5 z-[20] flex items-center rounded-full cursor-pointer
          active:scale-[.98] transition-transform duration-150 select-none overflow-hidden"
        style={{
          bottom:     'calc(var(--safe-bot) + 20px)',
          background: 'rgba(0,22,33,0.9)',
          border:     '1px solid rgba(255,65,3,.25)',
          backdropFilter: 'blur(24px)',
          boxShadow:  '0 0 28px rgba(255,65,3,.12), 0 6px 24px rgba(0,0,0,.55)',
          opacity:    open ? 0 : 1,
          pointerEvents: open ? 'none' : 'auto',
          transition: 'opacity .22s ease',
          maxWidth:   560,
          margin:     '0 auto',
          left:       0,
          right:      0,
          marginLeft: 20,
          marginRight: 20,
        }}
      >
        <span className="flex items-center gap-2 px-5 py-[14px]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff4103" strokeWidth="2.2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <span className="text-ink-primary text-sm font-medium">Où allons-nous ?</span>
        </span>
        <div className="w-px self-stretch bg-[var(--rule-strong)]" aria-hidden="true" />
        <span className="flex items-center gap-1.5 px-4 py-[14px]">
          <span
            className={`w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0 transition-opacity duration-300 ${tagVisible ? 'opacity-100' : 'opacity-0'}`}
            style={{ boxShadow: '0 0 6px rgba(52,211,153,.8)' }}
          />
          <span className={`font-mono text-[10px] text-ink-muted tracking-wide whitespace-nowrap transition-opacity duration-300 ${tagVisible ? 'opacity-100' : 'opacity-0'}`}>
            {TAGS[tagIdx]}
          </span>
        </span>
      </button>

      {/* ──────────── BACKDROP ──────────── */}
      <div
        onClick={closeCard}
        aria-hidden="true"
        className="fixed inset-0 z-[22] bg-black/40 transition-opacity duration-300"
        style={{ opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none' }}
      />

      {/* ──────────── CARD (expanded) ──────────── */}
      <div
        role="dialog"
        aria-label="Réservation"
        aria-modal={open}
        className="fixed left-0 right-0 z-[25] flex justify-center will-change-transform"
        style={{
          bottom:     0,
          transform:  open ? 'translateY(0)' : 'translateY(110%)',
          visibility: open ? 'visible' : 'hidden',
          transition: open
            ? 'transform .44s cubic-bezier(.32,1,.55,1), visibility 0s linear 0s'
            : 'transform .44s cubic-bezier(.32,1,.55,1), visibility 0s linear .44s',
        }}
      >
        <div
          className="w-full max-w-[560px]"
          style={{ paddingBottom: 'var(--safe-bot)' }}
        >
          <div
            className="rounded-t-[22px]"
            style={{
              background: 'linear-gradient(to bottom, #001A28, #001621)',
              border:     '1px solid rgba(255,65,3,.2)',
              borderBottom: 'none',
              boxShadow:  '0 -12px 60px rgba(0,0,0,.7), 0 -1px 0 rgba(255,65,3,.1)',
            }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-9 h-1 bg-[var(--rule-strong)] rounded-full" />
            </div>

            <div className="px-5 pb-5 flex flex-col gap-4">
              {/* HUD */}
              <div className="flex items-center gap-2.5 pt-1">
                <span className="font-brand font-bold text-ink-primary text-xs tracking-[.18em] uppercase">INR</span>
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" style={{ boxShadow: '0 0 6px rgba(52,211,153,.8)' }} />
                <span className="font-mono text-[10px] text-ink-muted tracking-wider truncate">
                  Réservation à l'avance · Aéroports & longue distance
                </span>
              </div>

              {/* Fields card */}
              <div className="relative bg-[#001621] rounded-2xl border border-[var(--rule-strong)]">
                {/* Departure row */}
                <div className="flex items-center gap-3 px-4 pt-3.5 pb-3">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: '#ff4103', boxShadow: '0 0 12px rgba(255,65,3,.8)' }} />
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-[9px] text-ink-muted tracking-widest uppercase mb-1">Votre position</div>
                    <input
                      type="text"
                      value={departQuery}
                      onChange={e => { setDepartQuery(e.target.value); triggerAC(e.target.value, 'depart') }}
                      onFocus={() => { setAcField('depart'); if (departQuery.length >= 2) triggerAC(departQuery, 'depart') }}
                      placeholder="Départ détecté…"
                      autoComplete="off"
                      aria-label="Adresse de départ"
                      aria-autocomplete="list"
                      className="w-full bg-transparent text-ink-primary text-sm outline-none placeholder-ink-muted"
                    />
                  </div>
                  {/* GPS button */}
                  <button
                    onClick={handleGPS}
                    disabled={geoStatus === 'loading'}
                    aria-label="Détecter ma position GPS"
                    className={`
                      w-8 h-8 flex-shrink-0 rounded-xl flex items-center justify-center
                      border cursor-pointer active:scale-95 transition-colors
                      ${geoStatus === 'loading' ? 'border-accent/30 bg-accent/10' :
                        geoStatus === 'success' ? 'border-green-400/30 bg-green-400/10' :
                                                  'border-[var(--rule-strong)]'}
                    `}
                  >
                    {geoStatus === 'loading' ? (
                      <span className="w-3 h-3 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                    ) : (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                        stroke={geoStatus === 'success' ? '#34d399' : '#ff4103'}
                        strokeWidth="2" strokeLinecap="round"
                      >
                        <circle cx="12" cy="12" r="3"/>
                        <path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
                      </svg>
                    )}
                  </button>
                </div>

                {/* Connector */}
                <div className="flex items-center px-4 -my-1.5">
                  <div className="ml-[4px] w-px h-5 bg-gradient-to-b from-accent/35 to-accent/10 flex-shrink-0" />
                  <div className="flex-1 border-t border-[var(--rule)] ml-3" />
                </div>

                {/* Arrival row */}
                <div className="flex items-center gap-3 px-4 pt-3 pb-3.5">
                  <div className="w-2.5 h-2.5 rounded-full border-2 flex-shrink-0"
                    style={{ borderColor: 'rgba(255,65,3,.75)', background: '#F5F1E8', boxShadow: '0 0 8px rgba(245,241,232,.4)' }} />
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-[9px] text-ink-muted tracking-widest uppercase mb-1">Destination</div>
                    <input
                      type="text"
                      value={arriveQuery}
                      onChange={e => { setArriveQuery(e.target.value); triggerAC(e.target.value, 'arrive') }}
                      onFocus={() => { setAcField('arrive'); if (arriveQuery.length >= 2) triggerAC(arriveQuery, 'arrive') }}
                      placeholder="Où allons-nous ?"
                      autoComplete="off"
                      aria-label="Adresse d'arrivée"
                      aria-autocomplete="list"
                      className="w-full bg-transparent text-ink-primary text-sm outline-none placeholder-ink-muted"
                    />
                  </div>
                </div>

                {/* Autocomplete dropdown */}
                {suggestions.length > 0 && (
                  <ul
                    role="listbox"
                    className="absolute left-0 right-0 z-10 rounded-2xl border border-[var(--rule-strong)] overflow-hidden"
                    style={{
                      top:       'calc(100% + 8px)',
                      background: '#001A28',
                      boxShadow: '0 8px 32px rgba(0,0,0,.6)',
                    }}
                  >
                    {suggestions.map((s, i) => (
                      <li key={i}>
                        <button
                          onClick={() => pickSuggestion(s, acField)}
                          className="w-full text-left flex items-center gap-3 px-4 py-3 border-b border-[var(--rule)] last:border-0 hover:bg-accent/10 active:bg-accent/15 transition-colors cursor-pointer"
                        >
                          <span className="text-sm flex-shrink-0">{ICON[s.type] ?? '📌'}</span>
                          <span className="text-sm text-ink-secondary truncate">{s.name.split(',')[0]}</span>
                        </button>
                      </li>
                    ))}
                    {acLoading && (
                      <li className="flex justify-center py-2">
                        <span className="w-3 h-3 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                      </li>
                    )}
                  </ul>
                )}
              </div>

              {/* Route info */}
              {routeLoading && (
                <div className="flex items-center justify-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                  <span className="font-mono text-xs text-ink-muted">Calcul du trajet…</span>
                </div>
              )}

              {route && price && !routeLoading && (
                <div className="flex items-center justify-center gap-3">
                  <span className="font-mono text-xs text-ink-muted">{route.km.toFixed(1)} km</span>
                  <span className="text-ink-muted text-xs">·</span>
                  <span className="font-mono text-xs text-ink-muted">≈ {Math.round(route.mins)} min</span>
                  <span className="text-ink-muted text-xs">·</span>
                  <span className="font-brand font-bold text-accent text-base">{price.final.toFixed(2)} €</span>
                </div>
              )}

              {/* Reserve CTA */}
              <button
                onClick={handleReserve}
                disabled={!depart || !arrive || routeLoading}
                className="
                  w-full py-4 rounded-[18px] font-bold text-white text-sm tracking-wide uppercase
                  cursor-pointer select-none active:scale-[.97] transition-transform duration-150
                  disabled:opacity-40 disabled:cursor-not-allowed
                "
                style={{
                  background: '#ff4103',
                  boxShadow:  (depart && arrive) ? '0 0 24px rgba(255,65,3,.35), 0 4px 12px rgba(0,0,0,.4)' : 'none',
                }}
              >
                {ctaLabel}
              </button>

              {/* WhatsApp direct */}
              <a
                href={WA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 rounded-[18px] text-xs font-semibold cursor-pointer active:scale-[.98] transition-transform duration-150 select-none"
                style={{
                  background: 'rgba(37,211,102,.07)',
                  border:     '1px solid rgba(37,211,102,.22)',
                  color:      '#25d366',
                }}
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Réservation directe WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
