import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useBookingStore from '../../store/useBookingStore'
import useOSRM         from '../../hooks/useOSRM'
import useGeolocation  from '../../hooks/useGeolocation'
import { computePriceForBooking } from '../../utils/priceEngine'
import { searchPlaces, displayAddr, TYPE_COLOR } from '../../utils/geocoder'
import useAppTheme from '../../hooks/useAppTheme'

const TAGS = [
  'CDG · Orly · Beauvais',
  'Province · Gares TGV',
  'Mise à disposition',
  "Réservation à l'avance",
]


function PinIcon({ color = 'currentColor' }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={color} stroke="none" aria-hidden="true">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  )
}


export default function HomePill({ onOpenSheet }) {
  const th = useAppTheme()
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
  const price  = useBookingStore(s => s.price)
  const isDark = useBookingStore(s => s.isDark)

  // Route — local instance for display in the card
  const { route, loading: routeLoading, fetchRoute } = useOSRM()

  // GPS
  const { status: geoStatus, detect } = useGeolocation()

  // Hydrate input display from persisted store on mount
  useEffect(() => {
    if (depart?.name) setDepartQuery(displayAddr(depart))
    if (arrive?.name) setArriveQuery(displayAddr(arrive))
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
    const label = displayAddr(item)
    if (field === 'depart') {
      setDepartQuery(label)
      setDepart(item)
      setRouteGeometry(null)
    } else {
      setArriveQuery(label)
      setArrive(item)
      setRouteGeometry(null)
    }
    setSuggestions([])
    setAcField(null)
  }, [setDepart, setArrive, setRouteGeometry])

  const handleGPS = useCallback(() => {
    detect(result => {
      setDepartQuery(displayAddr(result))
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
  const ctaLabel = !depart ? 'Entrez votre départ'
    : !arrive ? 'Entrez votre destination'
    : depart && arrive && !pickup ? 'Choisir une date'
    : routeLoading ? 'Calcul…'
    : route && price ? 'Réserver ce trajet →'
    : 'Calculer le trajet…'

  return (
    <>
      {/* ──────────── PILL (collapsed) ──────────── */}
      <button
        onClick={openCard}
        aria-label={depart && arrive ? 'Modifier la réservation' : 'Ouvrir la réservation'}
        aria-expanded={open}
        className="fixed z-[20] flex items-center cursor-pointer active:scale-[.98] transition-transform duration-150 select-none overflow-hidden"
        style={{
          bottom:        'calc(var(--safe-bot) + 20px)',
          left:          0,
          right:         0,
          marginLeft:    20,
          marginRight:   20,
          maxWidth:      560,
          marginInline:  'auto',
          borderRadius:  depart && arrive ? 22 : 999,
          background:    th.isDark ? th.bgPanel : th.bgCard,
          border:        '1px solid var(--separator-strong)',
          boxShadow: th.isDark
            ? '0 14px 40px rgba(0,0,0,.88), 0 4px 14px rgba(0,0,0,.72), inset 0 1px 0 rgba(255,255,255,.08)'
            : '0 6px 24px rgba(0,0,0,.13), 0 2px 8px rgba(0,0,0,.08)',
          opacity:       open ? 0 : 1,
          pointerEvents: open ? 'none' : 'auto',
          transition:    'opacity .22s ease, border-radius .25s ease',
        }}
      >
        {depart && arrive ? (
          /* ───── Aperçu du trajet ───── */
          <span className="flex items-center gap-3 w-full px-4 py-3">
            {/* A→B indicator */}
            <span className="flex flex-col items-center flex-shrink-0" aria-hidden="true">
              <span className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: '#FF5A1F' }} />
              <span className="relative overflow-hidden my-[3px] flex-shrink-0" style={{ width: 1, height: 16 }}>
                <span className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(255,90,31,.55), rgba(255,90,31,.15))' }} />
                <motion.span
                  className="absolute left-0 right-0"
                  style={{ height: 7, background: 'linear-gradient(to bottom, transparent, rgba(255,90,31,1), transparent)' }}
                  animate={{ y: [-7, 18] }}
                  transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.7 }}
                />
              </span>
              <span className="w-2 h-2 rounded-full border-2 flex-shrink-0"
                style={{ borderColor: 'rgba(255,90,31,.7)', background: th.isDark ? th.bgBase : th.bgCard }} />
            </span>
            {/* Names — full address including city */}
            <span className="flex flex-col flex-1 min-w-0 gap-[5px] text-left">
              <span className="text-[13px] font-semibold truncate" style={{ color: th.inkFull }}>
                {depart ? `${depart.name}${depart.city ? ', ' + depart.city : ''}` : 'Départ'}
              </span>
              <span className="text-[13px] font-semibold truncate" style={{ color: th.inkMid }}>
                {arrive ? `${arrive.name}${arrive.city ? ', ' + arrive.city : ''}` : 'Destination'}
              </span>
            </span>
            {/* Price + chevron */}
            <span className="flex items-center gap-2.5 flex-shrink-0 pl-1">
              {price && (
                <span className="font-brand font-bold text-[15px] whitespace-nowrap tnum text-accent">
                  {price.final} €
                </span>
              )}
              <span className="flex items-center justify-center w-7 h-7 rounded-full"
                style={{ background: th.borderFaint }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={th.inkMid}
                  strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 15l-6-6-6 6"/>
                </svg>
              </span>
            </span>
          </span>
        ) : (
          /* ───── Invite ───── */
          <>
            <span className="flex items-center gap-2 px-5 py-[14px]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF5A1F" strokeWidth="2.2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
              <span className="text-ink-primary text-sm font-semibold">Où allons-nous ?</span>
            </span>
            <div className="w-px self-stretch" style={{ background: 'var(--separator-strong)' }} aria-hidden="true" />
            <span className="flex items-center gap-1.5 px-4 py-[14px]">
              <span
                className={`w-1.5 h-1.5 rounded-full bg-positive flex-shrink-0 transition-opacity duration-300 ${tagVisible ? 'opacity-100' : 'opacity-0'}`}
                />
              <span className={`text-[11px] text-ink-muted tracking-wide whitespace-nowrap transition-opacity duration-300 ${tagVisible ? 'opacity-100' : 'opacity-0'}`}>
                {TAGS[tagIdx]}
              </span>
            </span>
          </>
        )}
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
              background:   th.isDark ? th.bgPanel : th.bgCard,
              border:       `1px solid ${th.border}`,
              borderBottom: 'none',
              boxShadow:    th.isDark ? '0 -8px 32px rgba(0,0,0,.8)' : '0 -4px 20px rgba(0,0,0,.10)',
            }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-9 h-1 bg-[var(--rule-strong)] rounded-full" />
            </div>

            <div className="px-5 pb-5 flex flex-col gap-4">
              {/* HUD */}
              <div className="flex items-center gap-2.5 pt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-positive flex-shrink-0" />
                <span className="text-[11px] tracking-wide font-medium truncate" style={{ color: th.inkMid }}>
                  Réservation à l'avance · Aéroports & longue distance
                </span>
              </div>

              {/* Fields card */}
              <div className="relative rounded-2xl" style={{
                background: th.bgCard,
                border: `1px solid ${th.borderStrong}`,
                boxShadow: th.isDark
                  ? 'inset 0 1px 0 rgba(255,255,255,.06)'
                  : 'inset 0 1px 0 rgba(255,255,255,.95), 0 0 0 1px rgba(0,0,0,.04)',
              }}>
                {/* Departure row */}
                <div className="flex items-center gap-3 px-4 pt-3.5 pb-3">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: '#FF5A1F' }} />
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-[11px] font-semibold tracking-[.08em] uppercase mb-1.5" style={{ color: th.inkMid }}>Votre position</div>
                    <input
                      type="text"
                      value={departQuery}
                      onChange={e => { setDepartQuery(e.target.value); triggerAC(e.target.value, 'depart') }}
                      onFocus={() => { setAcField('depart'); if (departQuery.length >= 2) triggerAC(departQuery, 'depart') }}
                      placeholder={geoStatus === 'loading' ? 'Localisation en cours…' : 'Adresse de départ'}
                      autoComplete="off"
                      aria-label="Adresse de départ"
                      aria-autocomplete="list"
                      className="w-full bg-transparent text-[15px] font-semibold outline-none"
                      style={{ color: th.inkFull }}
                    />
                  </div>
                  {/* GPS button */}
                  <button
                    onClick={handleGPS}
                    disabled={geoStatus === 'loading'}
                    aria-label="Détecter ma position GPS"
                    className={`
                      w-11 h-11 flex-shrink-0 rounded-xl flex items-center justify-center
                      border cursor-pointer active:scale-95 transition-colors
                      ${geoStatus === 'loading' ? 'border-accent/30 bg-accent/10' :
                        geoStatus === 'success' ? 'border-[var(--positive-dim)] bg-[rgba(52,211,153,.10)]' :
                                                  'border-[var(--rule-strong)]'}
                    `}
                  >
                    {geoStatus === 'loading' ? (
                      <span className="w-3 h-3 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke={geoStatus === 'success' ? '#34d399' : '#FF5A1F'}
                        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="7"/>
                        <circle cx="12" cy="12" r="2.5" fill={geoStatus === 'success' ? '#34d399' : '#FF5A1F'} stroke="none"/>
                        <line x1="12" y1="1"  x2="12" y2="5"/>
                        <line x1="12" y1="19" x2="12" y2="23"/>
                        <line x1="1"  y1="12" x2="5"  y2="12"/>
                        <line x1="19" y1="12" x2="23" y2="12"/>
                      </svg>
                    )}
                  </button>
                </div>

                {/* Connector */}
                <div className="flex items-start px-4 -my-1">
                  <div className="relative flex-shrink-0 overflow-hidden" style={{ width: 2, height: 28, marginLeft: 4 }}>
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(255,90,31,.55), rgba(255,90,31,.18))' }} />
                    <motion.div
                      className="absolute left-0 right-0"
                      style={{ height: 12, background: 'linear-gradient(to bottom, transparent, rgba(255,90,31,1), transparent)', borderRadius: 4 }}
                      animate={{ y: [-12, 30] }}
                      transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.8 }}
                    />
                  </div>
                  <div className="flex-1 border-t ml-3" style={{ borderColor: th.borderFaint, marginTop: 13 }} />
                </div>

                {/* Arrival row */}
                <div className="flex items-center gap-3 px-4 pt-3 pb-3.5">
                  <div className="w-2.5 h-2.5 rounded-full border-2 flex-shrink-0"
                    style={{ borderColor: 'rgba(255,90,31,.75)', background: th.bgBase }} />
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-[11px] font-semibold tracking-[.08em] uppercase mb-1.5" style={{ color: th.inkMid }}>Destination</div>
                    <input
                      type="text"
                      value={arriveQuery}
                      onChange={e => { setArriveQuery(e.target.value); triggerAC(e.target.value, 'arrive') }}
                      onFocus={() => { setAcField('arrive'); if (arriveQuery.length >= 2) triggerAC(arriveQuery, 'arrive') }}
                      placeholder="Où allons-nous ?"
                      autoComplete="off"
                      aria-label="Adresse d'arrivée"
                      aria-autocomplete="list"
                      className="w-full bg-transparent text-[15px] font-semibold outline-none"
                      style={{ color: th.inkFull }}
                    />
                  </div>
                </div>

                {/* Autocomplete dropdown */}
                <AnimatePresence>
                  {suggestions.length > 0 && (
                    <motion.ul
                      role="listbox"
                      initial={{ opacity: 0, y: -8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.97 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute left-0 right-0 z-10 rounded-2xl border border-[var(--rule-strong)] overflow-hidden"
                      style={{
                        top:        'calc(100% + 8px)',
                        background: th.bgCard,
                        boxShadow:  th.isDark
                          ? '0 8px 24px rgba(0,0,0,.55)'
                          : '0 4px 16px rgba(0,0,0,.12)',
                      }}
                    >
                      {suggestions.map((s, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                        >
                          <button
                            onClick={() => pickSuggestion(s, acField)}
                            className="w-full text-left flex items-center gap-3 px-4 py-3 border-b last:border-0 active:opacity-70 transition-opacity cursor-pointer"
                            style={{ borderColor: th.borderFaint }}
                          >
                            <span className="flex-shrink-0 mt-0.5" style={{ color: TYPE_COLOR[s.type] ?? '#FF5A1F' }}>
                              <PinIcon color={TYPE_COLOR[s.type] ?? '#FF5A1F'} />
                            </span>
                            <div className="flex flex-col min-w-0 flex-1">
                              <span className="text-sm font-semibold truncate" style={{ color: th.inkFull }}>
                                {s.name}
                              </span>
                              {s.city && (
                                <span className="text-xs truncate mt-px" style={{ color: th.inkMuted }}>
                                  {s.city}
                                </span>
                              )}
                            </div>
                          </button>
                        </motion.li>
                      ))}
                      {acLoading && (
                        <li className="flex justify-center py-2">
                          <span className="w-3 h-3 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                        </li>
                      )}
                    </motion.ul>
                  )}
                </AnimatePresence>
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
                  <span className="font-brand font-bold text-accent text-base tnum">{price.final.toFixed(2)} €</span>
                </div>
              )}

              {/* Date/time */}
              <div>
                <div
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-200"
                  style={{
                    background: th.bgInput,
                    border: depart && arrive && !pickup
                      ? '1px solid rgba(255,90,31,.4)'
                      : `1px solid ${th.border}`,
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                    stroke={depart && arrive && !pickup ? '#FF5A1F' : 'rgba(255,90,31,.55)'}
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    style={{ flexShrink: 0 }}
                  >
                    <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                  </svg>
                  <input
                    type="datetime-local"
                    value={pickup ?? ''}
                    min={new Date().toISOString().slice(0, 16)}
                    onChange={(e) => useBookingStore.getState().setPickup(e.target.value || null)}
                    className="flex-1 bg-transparent text-sm outline-none"
                    style={{ color: pickup ? th.inkHigh : th.inkMuted, colorScheme: th.inputScheme }}
                    aria-label="Date et heure de prise en charge"
                    aria-required="true"
                  />
                </div>
                {depart && arrive && !pickup && (
                  <p className="text-xs px-1 mt-1.5" style={{ color: 'rgba(255,90,31,.8)' }}>
                    Sélectionnez une date et heure pour continuer
                  </p>
                )}
              </div>

              {/* Reserve CTA */}
              <button
                onClick={handleReserve}
                disabled={!depart || !arrive || !pickup || routeLoading}
                className="cta-glow w-full py-4 rounded-[18px] font-bold text-white text-sm tracking-wide uppercase
                  cursor-pointer select-none active:scale-[.97] transition-transform duration-150
                  disabled:cursor-not-allowed relative overflow-hidden cta-pill"
              >
                <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px pointer-events-none"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.28), transparent)' }} />
                {ctaLabel}
              </button>

            </div>
          </div>
        </div>
      </div>
    </>
  )
}
