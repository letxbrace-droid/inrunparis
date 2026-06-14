import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useBookingStore from '../../store/useBookingStore'
import GlowingCTA    from '../ui/GlowingCTA'
import FloatingInput from '../ui/FloatingInput'
import useAppTheme   from '../../hooks/useAppTheme'

// ── Stagger variants ──────────────────────────────────────────────────────────
const containerV = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
}
const sectionV = {
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.36, ease: [0.16, 1, 0.3, 1] } },
}

// ── Ambiance icons (theme-aware inactive) ─────────────────────────────────────
const BAR_KF = [
  { heights: [6, 16, 9, 18, 6],   ys: [16, 6, 13, 4, 16]  },
  { heights: [12, 5, 18, 8, 12],  ys: [10, 17, 4, 14, 10] },
  { heights: [17, 10, 5, 13, 17], ys: [5, 12, 17, 9, 5]   },
]

function MusiqueIcon({ active, th }) {
  const dim = active ? '#FF5A1F' : (th?.inkMuted || 'rgba(245,241,232,.4)')
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      {BAR_KF.map(({ heights, ys }, i) => (
        <motion.rect
          key={i}
          x={3 + i * 7}
          width={4}
          rx={1.5}
          animate={active ? { height: heights, y: ys } : { height: 4, y: 18 }}
          transition={
            active
              ? { duration: 0.65, repeat: Infinity, ease: 'easeInOut', delay: i * 0.15 }
              : { duration: 0.25, ease: 'easeOut' }
          }
          fill={dim}
        />
      ))}
    </svg>
  )
}

function RadioIcon({ active, th }) {
  const dot  = active ? '#FF5A1F' : (th?.inkMuted || 'rgba(245,241,232,.68)')
  const wav1 = active ? 'color-mix(in srgb, var(--accent) 85%, transparent)'  : (th?.inkMuted || 'rgba(245,241,232,.55)')
  const wav2 = active ? 'color-mix(in srgb, var(--accent) 55%, transparent)'  : (th?.inkDim   || 'rgba(245,241,232,.22)')
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="2" fill={dot}/>
      <motion.g
        animate={active ? { opacity: [0.4, 1, 0.4] } : { opacity: 0.45 }}
        transition={{ duration: 0.85, repeat: Infinity, ease: 'easeInOut', delay: 0.1 }}
      >
        <path d="M8.5 8.5a5 5 0 0 0 0 7"  stroke={wav1} strokeWidth="1.8"/>
        <path d="M15.5 8.5a5 5 0 0 1 0 7" stroke={wav1} strokeWidth="1.8"/>
      </motion.g>
      <motion.g
        animate={active ? { opacity: [0.15, 0.65, 0.15] } : { opacity: 0.22 }}
        transition={{ duration: 0.85, repeat: Infinity, ease: 'easeInOut', delay: 0.35 }}
      >
        <path d="M5.6 5.6a9 9 0 0 0 0 12.8"  stroke={wav2} strokeWidth="1.5"/>
        <path d="M18.4 5.6a9 9 0 0 1 0 12.8" stroke={wav2} strokeWidth="1.5"/>
      </motion.g>
    </svg>
  )
}

function SilenceIcon({ active, th }) {
  const c = active ? '#FF5A1F' : (th?.inkMuted || 'rgba(245,241,232,.65)')
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" stroke={c} fill={active ? 'color-mix(in srgb, var(--accent) 12%, transparent)' : 'none'}/>
      <line x1="23" y1="9"  x2="17" y2="15" stroke={c}/>
      <line x1="17" y1="9"  x2="23" y2="15" stroke={c}/>
    </svg>
  )
}

// ── Volume icon ───────────────────────────────────────────────────────────────
function VolumeIcon({ level, th }) {
  const c = th?.isDark ? 'color-mix(in srgb, var(--accent) 75%, transparent)' : 'color-mix(in srgb, var(--accent) 85%, transparent)'
  if (level === 0) return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
      <line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>
    </svg>
  )
  if (level < 40) return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
    </svg>
  )
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
    </svg>
  )
}

// ── Payment icons (theme-aware) ───────────────────────────────────────────────
function CardIcon({ active, th }) {
  const s = active ? '#FF5A1F' : (th?.inkMid || 'rgba(13,13,13,.78)')
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={s} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2"/>
      <line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  )
}

function CashIcon({ active, th }) {
  const s = active ? '#FF5A1F' : (th?.inkMid || 'rgba(13,13,13,.78)')
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={s} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="12" rx="2"/>
      <circle cx="12" cy="12" r="2.5"/>
      <path d="M6 12h.01M18 12h.01"/>
    </svg>
  )
}

function TransferIcon({ active, th }) {
  const s = active ? '#FF5A1F' : (th?.inkMid || 'rgba(13,13,13,.78)')
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={s} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="17 1 21 5 17 9"/>
      <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
      <polyline points="7 23 3 19 7 15"/>
      <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
    </svg>
  )
}

// ── Thermometer ───────────────────────────────────────────────────────────────
function ThermometerIcon({ clim }) {
  const ratio      = (clim - 16) / 12
  const fillColor  = ratio < 0.3 ? 'rgba(130,200,255,.95)' : ratio < 0.65 ? 'rgba(255,175,70,.9)' : 'color-mix(in srgb, var(--accent) 95%, transparent)'
  const shellColor = ratio < 0.3 ? 'rgba(130,200,255,.55)'  : ratio < 0.65 ? 'rgba(255,175,70,.50)' : 'color-mix(in srgb, var(--accent) 55%, transparent)'
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" stroke={shellColor} strokeWidth="1.8"/>
      <motion.line
        x1="12" x2="12" y1="17"
        animate={{ y2: 15 - ratio * 9 }}
        initial={{ y2: 15 }}
        transition={{ type: 'spring', stiffness: 90, damping: 18 }}
        stroke={fillColor} strokeWidth="2.5"
      />
      <circle cx="12" cy="17" r="2" fill={fillColor}/>
    </svg>
  )
}

// ── Prestation icons ──────────────────────────────────────────────────────────
function WifiIcon({ th }) {
  const c = th?.inkMid || 'rgba(13,13,13,.78)'
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.55a11 11 0 0 1 14.08 0"/>
      <path d="M1.42 9a16 16 0 0 1 21.16 0"/>
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
      <circle cx="12" cy="20" r="1" fill={c} stroke="none"/>
    </svg>
  )
}

function WaterIcon({ th }) {
  const c = th?.inkMid || 'rgba(13,13,13,.78)'
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C6 8 4 12.5 4 15a8 8 0 0 0 16 0c0-2.5-2-7-8-13z"/>
    </svg>
  )
}

function ChargerIcon({ th }) {
  const c = th?.inkMid || 'rgba(13,13,13,.78)'
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="2" width="12" height="20" rx="2"/>
      <line x1="12" y1="6" x2="12" y2="10"/>
      <polyline points="9 14 12 11 15 14"/>
      <line x1="9" y1="18" x2="15" y2="18"/>
    </svg>
  )
}

// ── Data ──────────────────────────────────────────────────────────────────────
const AMBIANCE_OPTS = [
  { value: 'musique', label: 'Musique', Icon: MusiqueIcon },
  { value: 'radio',   label: 'Radio',   Icon: RadioIcon   },
  { value: 'silence', label: 'Silence', Icon: SilenceIcon },
]

const PAYMENT_OPTS = [
  { value: 'Carte',    label: 'Carte',    Icon: CardIcon    },
  { value: 'Espèces',  label: 'Espèces',  Icon: CashIcon    },
  { value: 'Virement', label: 'Virement', Icon: TransferIcon },
]

const PRESTATIONS = [
  { key: 'wifi', label: 'Wi-Fi 5G',     Icon: WifiIcon    },
  { key: 'eau',  label: 'Eau minérale', Icon: WaterIcon   },
  { key: 'usb',  label: 'Chargeur',     Icon: ChargerIcon },
]

// ── Premium custom slider ─────────────────────────────────────────────────────
function PremiumSlider({ min, max, step = 1, value, onChange, label, gradient, th }) {
  const [active, setActive] = useState(false)
  const pct = ((value - min) / (max - min)) * 100
  const THUMB = 22

  const thumbBg = th.isDark
    ? 'radial-gradient(circle at 38% 32%, #2A2A2A, #111111)'
    : 'radial-gradient(circle at 38% 32%, #FFFFFF, #EAE7E1)'

  const thumbShadow = `0 0 0 2.5px #FF5A1F, 0 2px 10px rgba(0,0,0,.28), inset 0 1px 0 ${
    th.isDark ? 'rgba(255,255,255,.14)' : 'rgba(255,255,255,.90)'
  }`

  return (
    <div className="relative" style={{ height: THUMB + 8, userSelect: 'none' }}>
      {/* Track background */}
      <div
        className="absolute rounded-full"
        style={{
          left: THUMB / 2, right: THUMB / 2,
          top: '50%', transform: 'translateY(-50%)',
          height: 5,
          background: th.isDark ? 'rgba(255,255,255,.18)' : 'rgba(0,0,0,.20)',
          overflow: 'visible',
        }}
      />
      {/* Track fill — follows value directly (no spring lag during drag) */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          left: THUMB / 2,
          top: '50%', transform: 'translateY(-50%)',
          height: 5,
          width: `calc(${pct / 100} * (100% - ${THUMB}px))`,
          background: gradient,
          transition: 'width .04s linear',
        }}
      />
      {/* Thumb — wrapper handles position, motion.div handles scale only */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: `calc(${pct / 100} * (100% - ${THUMB}px))`,
          top: '50%',
          transform: 'translateY(-50%)',
          width: THUMB,
          height: THUMB,
        }}
      >
        <motion.div
          animate={{ scale: active ? 1.18 : 1 }}
          transition={{ type: 'spring', stiffness: 600, damping: 28 }}
          style={{
            width: '100%', height: '100%',
            borderRadius: '50%',
            background: thumbBg,
            boxShadow: thumbShadow,
          }}
        />
      </div>
      {/* Native range — invisible, handles all events */}
      <input
        type="range"
        min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        onPointerDown={() => setActive(true)}
        onPointerUp={()   => setActive(false)}
        onPointerLeave={() => setActive(false)}
        className="absolute inset-0 w-full opacity-0 cursor-pointer"
        style={{ margin: 0, padding: 0, height: '100%' }}
        aria-label={label}
      />
    </div>
  )
}

// ── Section label ─────────────────────────────────────────────────────────────
function SectionLabel({ children, th }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-[11px] font-bold uppercase tracking-[.14em]" style={{ color: 'color-mix(in srgb, var(--accent) 85%, transparent)' }}>
        {children}
      </span>
      <div className="flex-1 h-px" style={{ background: th.divider }} />
    </div>
  )
}

// ── Ambiance pill — 3D UHD ────────────────────────────────────────────────────
function AmbiancePill({ active, onClick, Icon, label, th }) {
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)

  const bg = active
    ? `linear-gradient(180deg, color-mix(in srgb, var(--accent) 20%, transparent) 0%, color-mix(in srgb, var(--accent) 11%, transparent) 100%)`
    : hovered
    ? th.bgHover
    : th.bgInput

  const border = active
    ? '1.5px solid color-mix(in srgb, var(--accent) 48%, transparent)'
    : hovered
    ? `1px solid ${th.borderStrong}`
    : `1px solid ${th.border}`

  const shadow = active
    ? `inset 0 1px 0 rgba(255,140,60,.28), 0 6px 20px color-mix(in srgb, var(--accent) 18%, transparent), 0 2px 6px rgba(0,0,0,.14)`
    : hovered
    ? `inset 0 1px 0 ${th.isDark ? 'rgba(255,255,255,.10)' : 'rgba(255,255,255,.70)'}, 0 6px 18px rgba(0,0,0,.12), 0 2px 6px rgba(0,0,0,.08)`
    : `inset 0 1px 0 ${th.isDark ? 'rgba(255,255,255,.06)' : 'rgba(255,255,255,.55)'}, 0 1px 4px rgba(0,0,0,.08)`

  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false) }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={()   => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={()   => setPressed(false)}
      animate={{
        y:     pressed ? 1 : hovered ? -2 : 0,
        scale: pressed ? 0.965 : 1,
      }}
      transition={{ type: 'spring', stiffness: 500, damping: 28 }}
      className="flex-1 rounded-2xl cursor-pointer select-none"
      style={{
        background: bg,
        border,
        boxShadow: shadow,
        padding: '12px 6px 10px',
        transition: 'background .15s, border .15s, box-shadow .15s',
      }}
    >
      <span className="flex flex-col items-center gap-1.5">
        <Icon active={active} th={th} />
        <span
          className="text-[11px] font-bold tracking-wide"
          style={{ color: active ? '#FF5A1F' : hovered ? th.inkHigh : th.inkMid }}
        >
          {label}
        </span>
      </span>
    </motion.button>
  )
}

// ── Prestation card — 3D tilt hover, indicative only ─────────────────────────
function PrestationCard({ Icon, label, th }) {
  const cardRef  = useRef(null)
  const [tilt,   setTilt]   = useState({ x: 0, y: 0 })
  const [hovered, setHovered] = useState(false)

  const handleMove = useCallback((e) => {
    if (!cardRef.current) return
    const r  = cardRef.current.getBoundingClientRect()
    const cx = (e.clientX - r.left  - r.width  / 2) / (r.width  / 2)
    const cy = (e.clientY - r.top   - r.height / 2) / (r.height / 2)
    setTilt({ x: -cy * 8, y: cx * 8 })
  }, [])

  const handleLeave = useCallback(() => {
    setHovered(false)
    setTilt({ x: 0, y: 0 })
  }, [])

  const shadow = hovered
    ? `0 12px 28px rgba(0,0,0,.16), 0 4px 10px rgba(0,0,0,.10), inset 0 1px 0 ${th.isDark ? 'rgba(255,255,255,.10)' : 'rgba(255,255,255,.75)'}`
    : `0 1px 4px rgba(0,0,0,.08), inset 0 1px 0 ${th.isDark ? 'rgba(255,255,255,.05)' : 'rgba(255,255,255,.55)'}`

  return (
    <div style={{ perspective: '700px', flex: 1 }}>
      <motion.div
        ref={cardRef}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={handleLeave}
        onMouseMove={handleMove}
        animate={{
          rotateX: tilt.x,
          rotateY: tilt.y,
          scale:   hovered ? 1.04 : 1,
          boxShadow: shadow,
        }}
        transition={{ type: 'spring', stiffness: 380, damping: 26 }}
        className="flex flex-col items-center justify-center gap-2 py-4 rounded-2xl select-none"
        style={{
          background: th.bgInput,
          border:   `1px solid ${th.border}`,
          minHeight: 90,
          cursor:    'default',
          transformStyle: 'preserve-3d',
        }}
      >
        <motion.div
          animate={{ z: hovered ? 10 : 0 }}
          style={{ transform: hovered ? 'translateZ(10px)' : 'translateZ(0)' }}
          transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        >
          <Icon th={th} />
        </motion.div>

        <span
          className="text-[11px] font-semibold text-center leading-tight"
          style={{ color: th.inkLow }}
        >
          {label}
        </span>

        <span
          className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
          style={{
            background: th.isDark ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.06)',
            color: th.inkDim,
          }}
        >
          Inclus
        </span>
      </motion.div>
    </div>
  )
}

// ── Payment button — UHD animated ─────────────────────────────────────────────
function PaymentButton({ active, onClick, Icon, label, th }) {
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)

  const bg = active
    ? `linear-gradient(180deg, color-mix(in srgb, var(--accent) 18%, transparent) 0%, color-mix(in srgb, var(--accent) 10%, transparent) 100%)`
    : hovered
    ? th.bgHover
    : th.bgInput

  const border = active
    ? '1.5px solid color-mix(in srgb, var(--accent) 50%, transparent)'
    : hovered
    ? `1px solid ${th.borderStrong}`
    : `1px solid ${th.border}`

  const shadow = active
    ? `inset 0 1px 0 rgba(255,140,60,.22), 0 4px 16px color-mix(in srgb, var(--accent) 16%, transparent), 0 1px 4px rgba(0,0,0,.12)`
    : hovered
    ? `inset 0 1px 0 ${th.isDark ? 'rgba(255,255,255,.10)' : 'rgba(255,255,255,.72)'}, 0 5px 14px rgba(0,0,0,.10), 0 1px 3px rgba(0,0,0,.07)`
    : `inset 0 1px 0 ${th.isDark ? 'rgba(255,255,255,.05)' : 'rgba(255,255,255,.52)'}, 0 1px 3px rgba(0,0,0,.07)`

  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false) }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={()   => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={()   => setPressed(false)}
      animate={{
        y:     pressed ? 1 : hovered ? -2 : 0,
        scale: pressed ? 0.965 : active ? 1.02 : 1,
      }}
      transition={{ type: 'spring', stiffness: 500, damping: 28 }}
      className="flex-1 rounded-2xl cursor-pointer select-none"
      style={{
        background: bg,
        border,
        boxShadow: shadow,
        padding:   '14px 6px 12px',
        transition: 'background .15s, border .15s, box-shadow .15s',
      }}
    >
      <div className="flex flex-col items-center gap-1.5">
        <Icon active={active} th={th} />
        <span
          className="text-[11px] font-bold tracking-wide"
          style={{ color: active ? '#FF5A1F' : hovered ? th.inkHigh : th.inkMid }}
        >
          {label}
        </span>
      </div>
    </motion.button>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Step3Options({ onNext, onBack }) {
  const th             = useAppTheme()
  const ambiance       = useBookingStore((s) => s.ambiance)
  const setAmbiance    = useBookingStore((s) => s.setAmbiance)
  const volume         = useBookingStore((s) => s.volume)
  const setVolume      = useBookingStore((s) => s.setVolume)
  const clim           = useBookingStore((s) => s.clim)
  const setClim        = useBookingStore((s) => s.setClim)
  const payment        = useBookingStore((s) => s.payment)
  const setPayment     = useBookingStore((s) => s.setPayment)
  const clientName     = useBookingStore((s) => s.clientName)
  const setClientName  = useBookingStore((s) => s.setClientName)
  const clientEmail    = useBookingStore((s) => s.clientEmail)
  const setClientEmail = useBookingStore((s) => s.setClientEmail)
  const note           = useBookingStore((s) => s.note)
  const setNote        = useBookingStore((s) => s.setNote)

  const canSend = clientName.trim().length > 0
  const handleSend = () => { if (canSend) onNext?.() }

  // Temp gradient: cool → warm → hot based on position
  const tempRatio   = (clim - 16) / 12
  const tempGradient = tempRatio < 0.3
    ? 'linear-gradient(90deg, rgba(130,200,255,.95) 0%, rgba(255,190,80,.85) 100%)'
    : tempRatio < 0.65
    ? 'linear-gradient(90deg, rgba(255,190,80,.90) 0%, rgba(255,130,40,.95) 100%)'
    : 'linear-gradient(90deg, rgba(255,130,40,.90) 0%, color-mix(in srgb, var(--accent) 98%, transparent) 100%)'

  const volGradient = 'linear-gradient(90deg, color-mix(in srgb, var(--accent) 60%, transparent) 0%, color-mix(in srgb, var(--accent) 95%, transparent) 100%)'

  return (
    <motion.div
      className="flex flex-col gap-5 px-5 pb-6"
      variants={containerV}
      initial="hidden"
      animate="show"
    >

      {/* ── Identité ────────────────────────────────────────────── */}
      <motion.section variants={sectionV}>
        <SectionLabel th={th}>Votre identité</SectionLabel>
        <div className="flex flex-col gap-3">
          <FloatingInput
            label="Prénom"
            value={clientName}
            onChange={setClientName}
            autoComplete="given-name"
          />
          <FloatingInput
            label="Email (facultatif)"
            value={clientEmail}
            onChange={setClientEmail}
            type="email"
            autoComplete="email"
            inputMode="email"
          />
        </div>
      </motion.section>

      {/* ── Ambiance sonore ─────────────────────────────────────── */}
      <motion.section variants={sectionV}>
        <SectionLabel th={th}>Ambiance sonore</SectionLabel>
        <div className="flex gap-2.5">
          {AMBIANCE_OPTS.map((opt) => (
            <AmbiancePill
              key={opt.value}
              active={ambiance === opt.value}
              onClick={() => setAmbiance(opt.value)}
              Icon={opt.Icon}
              label={opt.label}
              th={th}
            />
          ))}
        </div>

        {/* Volume — premium card, animates in/out */}
        <AnimatePresence>
          {ambiance !== 'silence' && (
            <motion.div
              initial={{ opacity: 0, y: -6, height: 0 }}
              animate={{ opacity: 1, y: 0,  height: 'auto' }}
              exit={{    opacity: 0, y: -4,  height: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              style={{ overflow: 'hidden' }}
            >
              <div
                className="px-4 py-4 rounded-2xl flex flex-col gap-3 mt-2.5"
                style={{
                  background: th.bgInput,
                  border: `1px solid ${th.border}`,
                  boxShadow: `inset 0 1px 0 ${th.isDark ? 'rgba(255,255,255,.05)' : 'rgba(255,255,255,.60)'}`,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <VolumeIcon level={volume} th={th} />
                    <span className="text-sm font-semibold" style={{ color: th.inkHigh }}>
                      Volume
                    </span>
                  </div>
                  <span
                    className="text-[15px] font-bold tabular-nums"
                    style={{ color: th.inkFull, minWidth: 40, textAlign: 'right' }}
                  >
                    {volume}%
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-bold tabular-nums flex-shrink-0" style={{ color: th.inkMuted }}>0</span>
                  <div className="flex-1">
                    <PremiumSlider
                      min={0} max={100} step={1}
                      value={volume}
                      onChange={setVolume}
                      gradient={volGradient}
                      label="Volume"
                      th={th}
                    />
                  </div>
                  <span className="text-[11px] font-bold tabular-nums flex-shrink-0" style={{ color: th.inkMuted }}>100</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>

      {/* ── Climatisation ───────────────────────────────────────── */}
      <motion.section variants={sectionV}>
        <SectionLabel th={th}>Climatisation</SectionLabel>
        <div
          className="px-4 py-4 rounded-2xl flex flex-col gap-3"
          style={{
            background: th.bgInput,
            border: `1px solid ${th.border}`,
            boxShadow: `inset 0 1px 0 ${th.isDark ? 'rgba(255,255,255,.05)' : 'rgba(255,255,255,.60)'}`,
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ThermometerIcon clim={clim} />
              <span className="text-sm font-semibold" style={{ color: th.inkHigh }}>
                Température
              </span>
            </div>
            <span
              className="text-[15px] font-bold tabular-nums"
              style={{ color: th.inkFull, minWidth: 44, textAlign: 'right' }}
            >
              {clim}°C
            </span>
          </div>
          <div className="flex items-center gap-3">
            {/* Froid */}
            <span className="flex items-center gap-1 flex-shrink-0">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(130,200,255,.85)" strokeWidth="2.2" strokeLinecap="round">
                <line x1="12" y1="2"  x2="12" y2="22"/>
                <line x1="2"  y1="12" x2="22" y2="12"/>
                <line x1="6"  y1="6"  x2="18" y2="18"/>
                <line x1="18" y1="6"  x2="6"  y2="18"/>
              </svg>
              <span className="text-[11px] font-bold tabular-nums" style={{ color: 'rgba(130,200,255,.85)' }}>16°</span>
            </span>
            <div className="flex-1">
              <PremiumSlider
                min={16} max={28} step={1}
                value={clim}
                onChange={setClim}
                gradient={tempGradient}
                label="Température climatisation"
                th={th}
              />
            </div>
            {/* Chaud */}
            <span className="flex items-center gap-1 flex-shrink-0">
              <span className="text-[11px] font-bold tabular-nums" style={{ color: 'rgba(255,100,30,.85)' }}>28°</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,100,30,.85)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2c0 0-5 6-5 10a5 5 0 0 0 10 0c0-3-2-5-2-5s-1 3-3 3c-1.1 0-2-.9-2-2 0-2 2-6 2-6z"/>
              </svg>
            </span>
          </div>
        </div>
      </motion.section>

      {/* ── Prestations à bord ──────────────────────────────────── */}
      <motion.section variants={sectionV}>
        <SectionLabel th={th}>Prestations à bord</SectionLabel>
        <div className="flex gap-3">
          {PRESTATIONS.map(({ key, label, Icon }) => (
            <PrestationCard
              key={key}
              Icon={Icon}
              label={label}
              th={th}
            />
          ))}
        </div>
      </motion.section>

      {/* ── Mode de règlement ────────────────────────────────────── */}
      <motion.section variants={sectionV}>
        <SectionLabel th={th}>Mode de règlement</SectionLabel>
        <div className="flex gap-2.5">
          {PAYMENT_OPTS.map((p) => (
            <PaymentButton
              key={p.value}
              active={payment === p.value}
              onClick={() => setPayment(p.value)}
              Icon={p.Icon}
              label={p.label}
              th={th}
            />
          ))}
        </div>
      </motion.section>

      {/* ── Note ────────────────────────────────────────────────── */}
      <motion.section variants={sectionV}>
        <SectionLabel th={th}>Note (facultatif)</SectionLabel>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Vol, bagages, instructions particulières…"
          rows={2}
          className="w-full px-4 py-3 rounded-2xl resize-none text-sm outline-none"
          style={{
            background:  th.bgInput,
            border:      `1px solid ${th.border}`,
            color:       th.inkFull,
            boxShadow:   `inset 0 1px 0 ${th.isDark ? 'rgba(255,255,255,.04)' : 'rgba(255,255,255,.55)'}`,
            transition:  'border-color .2s',
          }}
          onFocus={e => e.target.style.borderColor = 'color-mix(in srgb, var(--accent) 42%, transparent)'}
          onBlur={e  => { e.target.style.borderColor = th.border }}
          aria-label="Note complémentaire"
        />
      </motion.section>

      {/* ── CTA ─────────────────────────────────────────────────── */}
      <motion.div variants={sectionV} className="flex flex-col gap-3 pt-1">
        <GlowingCTA onClick={handleSend} disabled={!canSend}>
          Voir le récapitulatif →
        </GlowingCTA>
        {!canSend && (
          <p className="text-center text-[11px] font-semibold -mt-1" style={{ color: 'color-mix(in srgb, var(--accent) 72%, transparent)' }}>
            Renseignez votre prénom pour continuer
          </p>
        )}
        <button
          onClick={onBack}
          className="text-sm text-center cursor-pointer py-2 active:opacity-60 transition-opacity"
          style={{ color: th.backLink }}
        >
          ← Modifier le tarif
        </button>
      </motion.div>

    </motion.div>
  )
}
