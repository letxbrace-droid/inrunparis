import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useBookingStore from '../../store/useBookingStore'
import useOSRM         from '../../hooks/useOSRM'
import useGeolocation  from '../../hooks/useGeolocation'
import { computePriceForBooking } from '../../utils/priceEngine'
import { searchPlaces, displayAddr, TYPE_COLOR } from '../../utils/geocoder'
import useAppTheme from '../../hooks/useAppTheme'
import GlowingCTA from '../ui/GlowingCTA'
import { useFavorites } from '../../hooks/useFavorites'
import { haptic } from '../../utils/haptics'

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

  // Last known GPS position — used as POI search center when depart isn't set yet
  const gpsCenter = useRef(null)

  // Favoris (Maison / Travail)
  const { favs, saveFav, removeFav } = useFavorites()
  const [savingFor, setSavingFor] = useState(null) // 'depart' | 'arrive' | null

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

  // Autocomplete trigger — passes a nearby center for location-biased / POI searches
  const triggerAC = useCallback((q, field) => {
    clearTimeout(acTimer.current)
    setSuggestions([])
    setAcField(field)
    if (q.length < 2) return
    // Use depart coords when searching arrive, otherwise last GPS fix
    const center = (field === 'arrive' && depart?.lat)
      ? { lat: depart.lat, lng: depart.lng }
      : gpsCenter.current
    acTimer.current = setTimeout(async () => {
      setAcLoading(true)
      try   { setSuggestions(await searchPlaces(q, center)) }
      finally { setAcLoading(false) }
    }, 350)
  }, [depart])

  const pickSuggestion = useCallback((item, field) => {
    haptic.select()
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
    setSavingFor(null)
  }, [setDepart, setArrive, setRouteGeometry])

  const handleSaveFav = (slot) => {
    const place = savingFor === 'depart' ? depart : arrive
    if (place) { saveFav(slot, place); navigator.vibrate?.(10) }
    setSavingFor(null)
  }

  const fillFav = (fav) => {
    // Fill active field, or first empty one
    const target = acField || (!depart ? 'depart' : 'arrive')
    if (target === 'depart') {
      setDepartQuery(displayAddr(fav)); setDepart(fav); setRouteGeometry(null)
    } else {
      setArriveQuery(displayAddr(fav)); setArrive(fav); setRouteGeometry(null)
    }
    setSuggestions([])
    setSavingFor(null)
  }

  const handleGPS = useCallback(() => {
    detect(result => {
      setDepartQuery(displayAddr(result))
      setDepart(result)
      setRouteGeometry(null)
      gpsCenter.current = { lat: result.lat, lng: result.lng }
    })
  }, [detect, setDepart, setRouteGeometry])

  const handleReserve = useCallback(() => {
    haptic.medium()
    setOpen(false)
    setSuggestions([])
    onOpenSheet(price ? 2 : 1)
  }, [price, onOpenSheet])

  const openCard  = () => { haptic.select(); setOpen(true);  setSuggestions([]); setSavingFor(null) }
  const closeCard = () => { setOpen(false); setSuggestions([]); setSavingFor(null) }

  // CTA label
  const ctaLabel = !depart ? 'Entrez votre départ'
    : !arrive ? 'Entrez votre destination'
    : depart && arrive && !pickup ? 'Choisir une date'
    : routeLoading ? 'Calcul…'
    : route && price ? 'Réserver ce trajet →'
    : 'Calculer le trajet…'

  // Autocomplete dropdown — rendered inside the active field row so it drops
  // directly beneath the input the user is typing in (not below the whole card).
  const renderAutocomplete = (field) => (
    <AnimatePresence>
      {acField === field && suggestions.length > 0 && (
        <motion.ul
          role="listbox"
          initial={{ opacity: 0, y: -8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute left-0 right-0 z-30 rounded-2xl border border-[var(--rule-strong)] overflow-hidden"
          style={{
            top:        'calc(100% + 6px)',
            maxHeight:  'min(300px, 42vh)',
            overflowY:  'auto',
            background: th.bgCard,
            boxShadow:  th.isDark
              ? '0 12px 32px rgba(0,0,0,.6)'
              : '0 8px 24px rgba(0,0,0,.14)',
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
                onClick={() => pickSuggestion(s, field)}
                className="w-full text-left flex items-center gap-3 px-4 py-3 border-b last:border-0 active:opacity-70 transition-opacity cursor-pointer"
                style={{ borderColor: th.borderFaint }}
              >
                {/* Icon — emoji pill for POIs, pin for addresses */}
                {s.poiIcon ? (
                  <span
                    className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-[15px] leading-none"
                    style={{ background: (s.poiColor || '#666') + '22' }}
                    aria-hidden="true"
                  >
                    {s.poiIcon}
                  </span>
                ) : (
                  <span className="flex-shrink-0 mt-0.5" style={{ color: TYPE_COLOR[s.type] ?? 'var(--accent)' }}>
                    <PinIcon color={TYPE_COLOR[s.type] ?? 'var(--accent)'} />
                  </span>
                )}
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
              <span className="w-3 h-3 border-2 rounded-full animate-spin"
                style={{ borderColor: 'color-mix(in srgb, var(--accent) 28%, transparent)', borderTopColor: 'var(--accent)' }} />
            </li>
          )}
        </motion.ul>
      )}
    </AnimatePresence>
  )


  return (
    <>
      {/* ──────────── PILL (collapsed) ──────────── */}
      <div
        className="fixed z-[20] pointer-events-none"
        style={{
          bottom:        'calc(var(--safe-bot) + 20px)',
          left:          0,
          right:         0,
          marginLeft:    20,
          marginRight:   20,
          maxWidth:      560,
          marginInline:  'auto',
          opacity:       open ? 0 : 1,
          transition:    'opacity .22s ease',
        }}
      >
        {/* Halo accent — signature lumineuse animée sous la pilule */}
        <motion.div
          aria-hidden="true"
          className="absolute pointer-events-none"
          style={{
            inset:        -10,
            borderRadius: depart && arrive ? 30 : 999,
            background:   'radial-gradient(60% 80% at 50% 60%, color-mix(in srgb, var(--accent) 32%, transparent), transparent 75%)',
            filter:       'blur(14px)',
            opacity:      th.isDark ? 1 : 0.55,
          }}
          animate={{ opacity: th.isDark ? [0.55, 0.95, 0.55] : [0.35, 0.6, 0.35], scale: [1, 1.04, 1] }}
          transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
        />

        <button
          onClick={openCard}
          aria-label={depart && arrive ? 'Modifier la réservation' : 'Ouvrir la réservation'}
          aria-expanded={open}
          className="relative w-full flex items-center cursor-pointer active:scale-[.98] transition-transform duration-150 select-none overflow-hidden"
          style={{
            borderRadius:  depart && arrive ? 22 : 999,
            background:    th.isDark ? th.bgPanel : th.bgCard,
            border:        '1px solid var(--separator-strong)',
            boxShadow: th.isDark
              ? '0 14px 40px rgba(0,0,0,.88), 0 4px 14px rgba(0,0,0,.72), inset 0 1px 0 rgba(255,255,255,.10)'
              : '0 6px 24px rgba(0,0,0,.13), 0 2px 8px rgba(0,0,0,.08), inset 0 1px 0 rgba(255,255,255,.9)',
            pointerEvents: open ? 'none' : 'auto',
            transition:    'border-radius .25s ease',
          }}
        >
          {/* Liseré spéculaire haut — touche premium */}
          <span aria-hidden="true" className="absolute inset-x-6 top-0 h-px" style={{
            background: th.isDark
              ? 'linear-gradient(90deg, transparent, rgba(255,140,60,.45), transparent)'
              : 'linear-gradient(90deg, transparent, rgba(255,255,255,.9), transparent)',
          }} />

          {depart && arrive ? (
            /* ───── Aperçu du trajet ───── */
            <span className="flex items-center gap-3 w-full px-4 py-3">
              {/* A→B indicator */}
              <span className="flex flex-col items-center flex-shrink-0" aria-hidden="true">
                {/* Pin de départ pulsant */}
                <span className="relative flex items-center justify-center" style={{ width: 8, height: 8 }}>
                  <motion.span
                    className="absolute rounded-full"
                    style={{ width: 8, height: 8, background: 'var(--accent)' }}
                    animate={{ scale: [1, 2.4], opacity: [0.5, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
                  />
                  <span className="relative w-2 h-2 rounded-full" style={{ background: 'var(--accent)' }} />
                </span>
                <span className="relative overflow-hidden my-[3px] flex-shrink-0" style={{ width: 1, height: 16 }}>
                  <span className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, color-mix(in srgb, var(--accent) 55%, transparent), color-mix(in srgb, var(--accent) 15%, transparent))' }} />
                  <motion.span
                    className="absolute left-0 right-0"
                    style={{ height: 7, background: 'linear-gradient(to bottom, transparent, var(--accent), transparent)' }}
                    animate={{ y: [-7, 18] }}
                    transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.7 }}
                  />
                </span>
                <span className="w-2 h-2 rounded-full border-2 flex-shrink-0"
                  style={{ borderColor: 'color-mix(in srgb, var(--accent) 70%, transparent)', background: th.isDark ? th.bgBase : th.bgCard }} />
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
            /* ───── Invite — signature : typo massive + profondeur + micro-motion ───── */
            <span className="flex items-center gap-3.5 w-full px-4 py-3.5">
              {/* Tuile loupe — cœur niché accent, respiration idle */}
              <span
                className="flex items-center justify-center flex-shrink-0 relative"
                style={{
                  width: 42, height: 42, borderRadius: 14,
                  background: 'linear-gradient(145deg, color-mix(in srgb, var(--accent) 22%, transparent), color-mix(in srgb, var(--accent) 9%, transparent))',
                  border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
                  boxShadow: 'inset 0 1px 0 color-mix(in srgb, var(--accent) 30%, transparent), 0 4px 14px color-mix(in srgb, var(--accent) 24%, transparent)',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF5A1F" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="11" cy="11" r="7.5"/><path d="M21 21l-4.35-4.35"/>
                </svg>
              </span>

              {/* Prompt dominant — typo massive + tag micro */}
              <span className="flex flex-col flex-1 min-w-0 text-left gap-1">
                <span className="leading-none" style={{ fontFamily: 'var(--font-display)', color: th.inkFull, fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>
                  Où allons-nous&nbsp;?
                </span>
                <span className="flex items-center gap-1.5 overflow-hidden">
                  <span
                    className={`w-1.5 h-1.5 rounded-full bg-positive flex-shrink-0 transition-opacity duration-300 ${tagVisible ? 'opacity-100' : 'opacity-0'}`}
                  />
                  <span className={`text-[11.5px] tracking-wide truncate transition-opacity duration-300 ${tagVisible ? 'opacity-100' : 'opacity-0'}`}
                    style={{ color: th.inkMuted }}>
                    {TAGS[tagIdx]}
                  </span>
                </span>
              </span>

              {/* Flèche niche — pastille accent, nudge + halo pulsant */}
              <span
                className="flex items-center justify-center flex-shrink-0 relative"
                style={{
                  width: 36, height: 36, borderRadius: 999, background: 'var(--accent)',
                  boxShadow: '0 3px 14px color-mix(in srgb, var(--accent) 45%, transparent)',
                }}
              >
                <span aria-hidden="true" className="absolute inset-0 rounded-full" style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,.35)' }} />
                <svg
                  width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"
                >
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </span>
            </span>
          )}
        </button>
      </div>

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

              {/* ── Favoris rapides (Maison / Travail) ─────────── */}
              {(favs.home || favs.work) && (
                <div className="flex gap-2 -mt-1">
                  {[
                    { slot: 'home', icon: '🏠', label: 'Domicile' },
                    { slot: 'work', icon: '💼', label: 'Travail'  },
                  ].map(({ slot, icon, label }) => {
                    const fav = favs[slot]
                    if (!fav) return null
                    return (
                      <button
                        key={slot}
                        onClick={() => fillFav(fav)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer active:scale-95 transition-transform select-none overflow-hidden"
                        style={{
                          maxWidth: 'calc(50% - 4px)',
                          background: th.isDark ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.05)',
                          border: `1px solid ${th.border}`,
                          color: th.inkMid,
                        }}
                        aria-label={`Utiliser ${label} : ${fav.name}`}
                      >
                        <span aria-hidden="true" className="flex-shrink-0">{icon}</span>
                        <span className="truncate">{fav.name.split(',')[0]}</span>
                        <span
                          role="button"
                          aria-label={`Supprimer ${label}`}
                          onClick={e => { e.stopPropagation(); removeFav(slot) }}
                          className="ml-0.5 flex-shrink-0 opacity-40 hover:opacity-90 active:opacity-100 transition-opacity"
                        >
                          <svg width="7" height="7" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <path d="M1 1l8 8M9 1l-8 8"/>
                          </svg>
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Fields card */}
              <div className="relative rounded-2xl" style={{
                background: th.bgCard,
                border: `1px solid ${th.borderStrong}`,
                boxShadow: th.isDark
                  ? 'inset 0 1px 0 rgba(255,255,255,.06)'
                  : 'inset 0 1px 0 rgba(255,255,255,.95), 0 0 0 1px rgba(0,0,0,.04)',
              }}>
                {/* Departure row */}
                <div className="relative flex items-center gap-3 px-4 pt-3.5 pb-3">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: 'var(--accent)' }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold tracking-[.12em] uppercase mb-1.5" style={{ color: th.inkMuted }}>Départ</div>
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
                  {/* Save as favourite ★ */}
                  {depart && (
                    <button
                      onClick={() => setSavingFor(savingFor === 'depart' ? null : 'depart')}
                      aria-label="Enregistrer comme favori"
                      className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg cursor-pointer transition-all"
                      style={{
                        background: savingFor === 'depart' ? 'rgba(245,197,24,.15)' : 'transparent',
                        border: `1px solid ${savingFor === 'depart' ? 'rgba(245,197,24,.4)' : 'transparent'}`,
                        color: savingFor === 'depart' ? '#b5960c' : th.inkDim,
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24"
                        fill={savingFor === 'depart' ? 'currentColor' : 'none'}
                        stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26"/>
                      </svg>
                    </button>
                  )}

                  {/* GPS button */}
                  <button
                    onClick={handleGPS}
                    disabled={geoStatus === 'loading'}
                    aria-label="Détecter ma position GPS"
                    className="w-11 h-11 flex-shrink-0 rounded-xl flex items-center justify-center border cursor-pointer active:scale-95 transition-all duration-200"
                    style={{
                      borderColor: geoStatus === 'success'
                        ? 'var(--positive-dim)'
                        : geoStatus === 'loading'
                        ? 'color-mix(in srgb, var(--accent) 30%, transparent)'
                        : 'var(--separator-strong)',
                      background: geoStatus === 'success'
                        ? 'color-mix(in srgb, var(--positive) 10%, transparent)'
                        : geoStatus === 'loading'
                        ? 'color-mix(in srgb, var(--accent) 8%, transparent)'
                        : 'transparent',
                    }}
                  >
                    {geoStatus === 'loading' ? (
                      <span className="w-3 h-3 border-2 rounded-full animate-spin flex-shrink-0"
                        style={{ borderColor: 'color-mix(in srgb, var(--accent) 28%, transparent)', borderTopColor: 'var(--accent)' }} />
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                        style={{ stroke: geoStatus === 'success' ? 'var(--positive)' : 'var(--accent)' }}
                      >
                        <circle cx="12" cy="12" r="7"/>
                        <circle cx="12" cy="12" r="2.5"
                          style={{ fill: geoStatus === 'success' ? 'var(--positive)' : 'var(--accent)' }} stroke="none"/>
                        <line x1="12" y1="1"  x2="12" y2="5"/>
                        <line x1="12" y1="19" x2="12" y2="23"/>
                        <line x1="1"  y1="12" x2="5"  y2="12"/>
                        <line x1="19" y1="12" x2="23" y2="12"/>
                      </svg>
                    )}
                  </button>

                  {renderAutocomplete('depart')}
                </div>

                {/* Connector */}
                <div className="flex items-start px-4 -my-1">
                  <div className="relative flex-shrink-0 overflow-hidden" style={{ width: 2, height: 28, marginLeft: 4 }}>
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, color-mix(in srgb, var(--accent) 55%, transparent), color-mix(in srgb, var(--accent) 18%, transparent))' }} />
                    <motion.div
                      className="absolute left-0 right-0"
                      style={{ height: 12, background: 'linear-gradient(to bottom, transparent, var(--accent), transparent)', borderRadius: 4 }}
                      animate={{ y: [-12, 30] }}
                      transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.8 }}
                    />
                  </div>
                  <div className="flex-1 border-t ml-3" style={{ borderColor: th.borderFaint, marginTop: 13 }} />
                </div>

                {/* Arrival row */}
                <div className="relative flex items-center gap-3 px-4 pt-3 pb-3.5">
                  <div className="w-2.5 h-2.5 rounded-full border-2 flex-shrink-0"
                    style={{ borderColor: 'color-mix(in srgb, var(--accent) 75%, transparent)', background: th.bgBase }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold tracking-[.12em] uppercase mb-1.5" style={{ color: th.inkMuted }}>Arrivée</div>
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

                  {/* Save as favourite ★ */}
                  {arrive && (
                    <button
                      onClick={() => setSavingFor(savingFor === 'arrive' ? null : 'arrive')}
                      aria-label="Enregistrer comme favori"
                      className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg cursor-pointer transition-all"
                      style={{
                        background: savingFor === 'arrive' ? 'rgba(245,197,24,.15)' : 'transparent',
                        border: `1px solid ${savingFor === 'arrive' ? 'rgba(245,197,24,.4)' : 'transparent'}`,
                        color: savingFor === 'arrive' ? '#b5960c' : th.inkDim,
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24"
                        fill={savingFor === 'arrive' ? 'currentColor' : 'none'}
                        stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26"/>
                      </svg>
                    </button>
                  )}

                  {renderAutocomplete('arrive')}
                </div>
              </div>

              {/* ── Panneau sauvegarde favori ──────────────────── */}
              <AnimatePresence>
                {savingFor && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div
                      className="flex items-center gap-2 px-3 py-2.5 rounded-2xl"
                      style={{
                        background: th.isDark ? 'rgba(245,197,24,.07)' : 'rgba(245,197,24,.09)',
                        border: '1px solid rgba(245,197,24,.25)',
                      }}
                    >
                      <span className="text-[11px] font-medium flex-shrink-0" style={{ color: th.inkMuted }}>
                        Enregistrer comme :
                      </span>
                      <button
                        onClick={() => handleSaveFav('home')}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer active:scale-95 transition-transform"
                        style={{ background: 'rgba(245,197,24,.18)', color: '#8a6e00', border: '1px solid rgba(245,197,24,.35)' }}
                      >
                        🏠 Domicile
                      </button>
                      <button
                        onClick={() => handleSaveFav('work')}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer active:scale-95 transition-transform"
                        style={{ background: 'rgba(99,102,241,.12)', color: '#5558e3', border: '1px solid rgba(99,102,241,.3)' }}
                      >
                        💼 Travail
                      </button>
                      <button
                        onClick={() => setSavingFor(null)}
                        className="ml-auto flex-shrink-0 opacity-40 hover:opacity-70 transition-opacity cursor-pointer"
                        aria-label="Annuler"
                      >
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                          <path d="M1 1l10 10M11 1l-10 10"/>
                        </svg>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Route info */}
              {routeLoading && (
                <div className="flex items-center justify-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 rounded-full animate-spin flex-shrink-0"
                    style={{ borderColor: 'color-mix(in srgb, var(--accent) 28%, transparent)', borderTopColor: 'var(--accent)' }} />
                  <span className="text-xs" style={{ color: 'var(--ink-muted)' }}>Calcul du trajet…</span>
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
                      ? '1px solid color-mix(in srgb, var(--accent) 40%, transparent)'
                      : `1px solid ${th.border}`,
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                    stroke={depart && arrive && !pickup ? '#FF5A1F' : 'color-mix(in srgb, var(--accent) 55%, transparent)'}
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
                  <p className="text-xs px-1 mt-1.5" style={{ color: 'color-mix(in srgb, var(--accent) 80%, transparent)' }}>
                    Sélectionnez une date et heure pour continuer
                  </p>
                )}
              </div>

              {/* Reserve CTA */}
              <GlowingCTA
                onClick={handleReserve}
                disabled={!depart || !arrive || !pickup || routeLoading}
              >
                {ctaLabel}
              </GlowingCTA>

            </div>
          </div>
        </div>
      </div>
    </>
  )
}
