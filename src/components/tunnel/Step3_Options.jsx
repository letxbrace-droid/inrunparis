import { useState } from 'react'
import { motion } from 'framer-motion'
import useBookingStore from '../../store/useBookingStore'
import GlowingCTA    from '../ui/GlowingCTA'
import FloatingInput from '../ui/FloatingInput'

// ─── Animated ambiance icons ─────────────────────────────────────────────────

const BAR_KF = [
  { heights: [6, 16, 9, 18, 6],   ys: [16, 6, 13, 4, 16] },
  { heights: [12, 5, 18, 8, 12],  ys: [10, 17, 4, 14, 10] },
  { heights: [17, 10, 5, 13, 17], ys: [5, 12, 17, 9, 5] },
]

function MusiqueIcon({ active }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
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
          fill={active ? '#ff4103' : 'rgba(245,241,232,.4)'}
        />
      ))}
    </svg>
  )
}

function RadioIcon({ active }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="2" fill={active ? '#ff4103' : 'rgba(245,241,232,.68)'}/>
      <motion.g
        animate={active ? { opacity: [0.4, 1, 0.4] } : { opacity: 0.35 }}
        transition={{ duration: 0.85, repeat: Infinity, ease: 'easeInOut', delay: 0.1 }}
      >
        <path d="M8.5 8.5a5 5 0 0 0 0 7"  stroke={active ? 'rgba(255,65,3,.85)' : 'rgba(245,241,232,.55)'} strokeWidth="1.8"/>
        <path d="M15.5 8.5a5 5 0 0 1 0 7" stroke={active ? 'rgba(255,65,3,.85)' : 'rgba(245,241,232,.55)'} strokeWidth="1.8"/>
      </motion.g>
      <motion.g
        animate={active ? { opacity: [0.1, 0.65, 0.1] } : { opacity: 0.18 }}
        transition={{ duration: 0.85, repeat: Infinity, ease: 'easeInOut', delay: 0.35 }}
      >
        <path d="M5.6 5.6a9 9 0 0 0 0 12.8"  stroke={active ? 'rgba(255,65,3,.55)' : 'rgba(245,241,232,.2)'} strokeWidth="1.5"/>
        <path d="M18.4 5.6a9 9 0 0 1 0 12.8" stroke={active ? 'rgba(255,65,3,.55)' : 'rgba(245,241,232,.2)'} strokeWidth="1.5"/>
      </motion.g>
    </svg>
  )
}

function SilenceIcon({ active }) {
  const c = active ? '#ff4103' : 'rgba(245,241,232,.65)'
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" stroke={c} fill={active ? 'rgba(255,65,3,.12)' : 'none'}/>
      <line x1="23" y1="9"  x2="17" y2="15" stroke={c}/>
      <line x1="17" y1="9"  x2="23" y2="15" stroke={c}/>
    </svg>
  )
}

// ─── Volume icon ─────────────────────────────────────────────────────────────

function VolumeIcon({ level }) {
  const c = 'rgba(255,65,3,.7)'
  if (level === 0) return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
      <line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>
    </svg>
  )
  if (level < 40) return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
    </svg>
  )
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
    </svg>
  )
}

// ─── Payment icons ────────────────────────────────────────────────────────────

function CardIcon({ active }) {
  const s = active ? '#F5F1E8' : 'rgba(245,241,232,.65)'
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={s} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
      <line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  )
}

function CashIcon({ active }) {
  const s = active ? '#F5F1E8' : 'rgba(245,241,232,.65)'
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={s} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="12" rx="2"/>
      <circle cx="12" cy="12" r="2.5"/>
      <path d="M6 12h.01M18 12h.01"/>
    </svg>
  )
}

function TransferIcon({ active }) {
  const s = active ? '#F5F1E8' : 'rgba(245,241,232,.65)'
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={s} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="17 1 21 5 17 9"/>
      <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
      <polyline points="7 23 3 19 7 15"/>
      <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
    </svg>
  )
}

// ─── Thermometer ──────────────────────────────────────────────────────────────

function ThermometerIcon({ clim }) {
  const ratio     = (clim - 16) / 12
  const fillColor = ratio < 0.3 ? 'rgba(130,200,255,.95)' : ratio < 0.65 ? 'rgba(255,175,70,.9)' : 'rgba(255,65,3,.95)'
  const shellColor= ratio < 0.3 ? 'rgba(130,200,255,.5)'  : ratio < 0.65 ? 'rgba(255,175,70,.45)' : 'rgba(255,65,3,.5)'
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

// ─── Prestation icons ─────────────────────────────────────────────────────────

function WifiIcon({ active }) {
  const c = active ? '#ff4103' : 'rgba(245,241,232,.68)'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.55a11 11 0 0 1 14.08 0"/>
      <path d="M1.42 9a16 16 0 0 1 21.16 0"/>
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
      <circle cx="12" cy="20" r="1" fill={c} stroke="none"/>
    </svg>
  )
}

function WaterIcon({ active }) {
  const c = active ? '#ff4103' : 'rgba(245,241,232,.68)'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C6 8 4 12.5 4 15a8 8 0 0 0 16 0c0-2.5-2-7-8-13z"/>
    </svg>
  )
}

function ChargerIcon({ active }) {
  const c = active ? '#ff4103' : 'rgba(245,241,232,.68)'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="2" width="12" height="20" rx="2"/>
      <line x1="12" y1="6" x2="12" y2="10"/>
      <polyline points="9 14 12 11 15 14"/>
      <line x1="9"  y1="18" x2="15" y2="18"/>
    </svg>
  )
}

// ─── Data ─────────────────────────────────────────────────────────────────────

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
  { key: 'wifi', label: 'Wi-Fi 5G',    Icon: WifiIcon    },
  { key: 'eau',  label: 'Eau minérale',Icon: WaterIcon   },
  { key: 'usb',  label: 'Chargeur',    Icon: ChargerIcon },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span
        className="text-[10px] font-bold uppercase tracking-[.14em]"
        style={{ color: 'rgba(255,90,31,.85)' }}
      >
        {children}
      </span>
      <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,.06)' }} />
    </div>
  )
}

function PillButton({ active, onClick, icon: Icon, children }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex-1 py-2.5 rounded-xl text-xs font-semibold cursor-pointer active:scale-95 transition-transform duration-150 select-none"
      style={{
        background: active ? 'rgba(255,90,31,.14)' : hovered ? '#1A1A1A' : '#141414',
        border: active
          ? '1px solid rgba(255,90,31,.40)'
          : hovered
          ? '1px solid rgba(255,255,255,.12)'
          : '1px solid rgba(255,255,255,.07)',
        color: active ? '#F5F1E8' : hovered ? 'rgba(245,241,232,.80)' : 'rgba(245,241,232,.60)',
        transition: 'background .15s, border .15s, color .15s',
      }}
    >
      <span className="flex items-center justify-center gap-1.5">
        {Icon && <Icon active={active} />}
        {children}
      </span>
    </button>
  )
}

function PrestationCard({ active, onClick, Icon, label }) {
  const [hovered, setHovered] = useState(false)
  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileTap={{ scale: 0.94 }}
      animate={{
        background: active ? 'rgba(255,90,31,.12)' : hovered ? '#1A1A1A' : '#141414',
        borderColor: active ? 'rgba(255,90,31,.38)' : hovered ? 'rgba(255,255,255,.12)' : 'rgba(255,255,255,.07)',
      }}
      transition={{ duration: 0.18 }}
      className="flex flex-col items-center justify-center gap-2 py-4 rounded-2xl cursor-pointer select-none flex-1"
      style={{
        border: '1px solid rgba(255,255,255,.06)',
        minHeight: 90,
      }}
    >
      <Icon active={active} />
      <span
        className="text-[11px] font-semibold text-center leading-tight"
        style={{ color: active ? '#F5F1E8' : 'rgba(245,241,232,.65)' }}
      >
        {label}
      </span>
      <motion.div
        animate={{ scale: active ? 1 : 0, opacity: active ? 1 : 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: '#FF5A1F' }}
      />
    </motion.button>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Step3Options({ onNext, onBack }) {
  const ambiance       = useBookingStore((s) => s.ambiance)
  const setAmbiance    = useBookingStore((s) => s.setAmbiance)
  const volume         = useBookingStore((s) => s.volume)
  const setVolume      = useBookingStore((s) => s.setVolume)
  const clim           = useBookingStore((s) => s.clim)
  const setClim        = useBookingStore((s) => s.setClim)
  const options        = useBookingStore((s) => s.options)
  const toggleOption   = useBookingStore((s) => s.toggleOption)
  const payment        = useBookingStore((s) => s.payment)
  const setPayment     = useBookingStore((s) => s.setPayment)
  const clientName     = useBookingStore((s) => s.clientName)
  const setClientName  = useBookingStore((s) => s.setClientName)
  const clientEmail    = useBookingStore((s) => s.clientEmail)
  const setClientEmail = useBookingStore((s) => s.setClientEmail)
  const note           = useBookingStore((s) => s.note)
  const setNote        = useBookingStore((s) => s.setNote)

  const handleSend = () => onNext?.()

  return (
    <div className="flex flex-col gap-5 px-5 pb-6">

      {/* Identité */}
      <section>
        <SectionLabel>Votre identité</SectionLabel>
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
      </section>

      {/* Ambiance */}
      <section>
        <SectionLabel>Ambiance sonore</SectionLabel>
        <div className="flex gap-2">
          {AMBIANCE_OPTS.map((opt) => (
            <PillButton
              key={opt.value}
              active={ambiance === opt.value}
              onClick={() => setAmbiance(opt.value)}
              icon={opt.Icon}
            >
              {opt.label}
            </PillButton>
          ))}
        </div>

        {/* Volume slider */}
        {ambiance !== 'silence' && (
          <div className="flex items-center gap-3 mt-3 px-1">
            <VolumeIcon level={volume} />
            <div className="flex-1">
              <input
                type="range" min="0" max="100" value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full h-1 rounded-full outline-none cursor-pointer appearance-none"
                style={{ accentColor: '#ff4103' }}
                aria-label="Volume"
              />
            </div>
            <span className="font-mono text-xs w-8 text-right" style={{ color: 'rgba(245,241,232,.68)' }}>
              {volume}%
            </span>
          </div>
        )}
      </section>

      {/* Climatisation */}
      <section>
        <SectionLabel>Climatisation</SectionLabel>
        <div
          className="px-4 py-4 rounded-2xl flex flex-col gap-3"
          style={{ background: '#161616', border: '1px solid rgba(255,255,255,.07)' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ThermometerIcon clim={clim} />
              <span className="text-sm font-semibold" style={{ color: 'rgba(245,241,232,.85)' }}>
                Température
              </span>
            </div>
            <span className="font-mono font-bold text-[15px]" style={{ color: '#F5F1E8', minWidth: 44, textAlign: 'right' }}>
              {clim}°C
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px]" style={{ color: 'rgba(245,241,232,.55)' }}>16°</span>
            <input
              type="range" min={16} max={28} step={1} value={clim}
              onChange={(e) => setClim(Number(e.target.value))}
              className="flex-1 cursor-pointer"
              style={{ accentColor: '#ff4103', height: 4 }}
              aria-label="Température climatisation"
            />
            <span className="font-mono text-[10px]" style={{ color: 'rgba(245,241,232,.55)' }}>28°</span>
          </div>
        </div>
      </section>

      {/* Prestations à bord */}
      <section>
        <SectionLabel>Prestations à bord</SectionLabel>
        <div className="flex gap-3">
          {PRESTATIONS.map(({ key, label, Icon }) => (
            <PrestationCard
              key={key}
              active={!!options[key]}
              onClick={() => toggleOption(key)}
              Icon={Icon}
              label={label}
            />
          ))}
        </div>
      </section>

      {/* Règlement */}
      <section>
        <SectionLabel>Mode de règlement</SectionLabel>
        <div className="flex gap-2">
          {PAYMENT_OPTS.map((p) => (
            <PillButton
              key={p.value}
              active={payment === p.value}
              onClick={() => setPayment(p.value)}
              icon={p.Icon}
            >
              {p.label}
            </PillButton>
          ))}
        </div>
      </section>

      {/* Note */}
      <section>
        <SectionLabel>Note (facultatif)</SectionLabel>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Vol, bagages, instructions particulières…"
          rows={2}
          className="w-full px-4 py-3 rounded-2xl resize-none text-sm outline-none"
          style={{
            background: '#161616',
            border:     '1px solid rgba(255,255,255,.07)',
            color:      '#F5F1E8',
            transition: 'border-color .2s',
          }}
          onFocus={e  => e.target.style.borderColor = 'rgba(255,90,31,.40)'}
          onBlur={e   => e.target.style.borderColor = 'rgba(255,255,255,.07)'}
          aria-label="Note complémentaire"
        />
      </section>

      {/* CTA */}
      <div className="flex flex-col gap-3 pt-1">
        <GlowingCTA onClick={handleSend}>
          Voir le récapitulatif →
        </GlowingCTA>
        <button
          onClick={onBack}
          className="text-sm text-center cursor-pointer py-2 active:opacity-60 transition-opacity"
          style={{ color: 'rgba(245,241,232,.55)' }}
        >
          ← Modifier le tarif
        </button>
      </div>

    </div>
  )
}
