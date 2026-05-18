import { motion } from 'framer-motion'
import useBookingStore from '../../store/useBookingStore'
import { sendWhatsApp, generateBonNumber } from '../../utils/whatsappEncoder'
import GlowingCTA    from '../ui/GlowingCTA'
import iOSToggle     from '../ui/iOSToggle'
import FloatingInput from '../ui/FloatingInput'

// ─── Animated ambiance icons ────────────────────────────────────────────────

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
      <circle cx="12" cy="12" r="2" fill={active ? '#ff4103' : 'rgba(245,241,232,.5)'}/>
      <motion.g
        animate={active ? { opacity: [0.4, 1, 0.4] } : { opacity: 0.35 }}
        transition={{ duration: 0.85, repeat: Infinity, ease: 'easeInOut', delay: 0.1 }}
      >
        <path d="M8.5 8.5a5 5 0 0 0 0 7"  stroke={active ? 'rgba(255,65,3,.85)' : 'rgba(245,241,232,.35)'} strokeWidth="1.8"/>
        <path d="M15.5 8.5a5 5 0 0 1 0 7" stroke={active ? 'rgba(255,65,3,.85)' : 'rgba(245,241,232,.35)'} strokeWidth="1.8"/>
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
  const c = active ? '#ff4103' : 'rgba(245,241,232,.45)'
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" stroke={c} fill={active ? 'rgba(255,65,3,.12)' : 'none'}/>
      <line x1="23" y1="9"  x2="17" y2="15" stroke={c}/>
      <line x1="17" y1="9"  x2="23" y2="15" stroke={c}/>
    </svg>
  )
}

// ─── Payment icons ───────────────────────────────────────────────────────────

function CardIcon({ active }) {
  const s = active ? '#F5F1E8' : 'rgba(245,241,232,.45)'
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={s} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
      <line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  )
}

function CashIcon({ active }) {
  const s = active ? '#F5F1E8' : 'rgba(245,241,232,.45)'
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={s} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="6" width="20" height="12" rx="2"/>
      <circle cx="12" cy="12" r="2.5"/>
      <path d="M6 12h.01M18 12h.01"/>
    </svg>
  )
}

function TransferIcon({ active }) {
  const s = active ? '#F5F1E8' : 'rgba(245,241,232,.45)'
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={s} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="17 1 21 5 17 9"/>
      <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
      <polyline points="7 23 3 19 7 15"/>
      <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
    </svg>
  )
}

// ─── Dynamic thermometer ─────────────────────────────────────────────────────

function ThermometerIcon({ clim }) {
  const ratio      = (clim - 16) / 12
  const fillColor  = ratio < 0.3 ? 'rgba(130,200,255,.95)' : ratio < 0.65 ? 'rgba(255,175,70,.9)' : 'rgba(255,65,3,.95)'
  const shellColor = ratio < 0.3 ? 'rgba(130,200,255,.5)'  : ratio < 0.65 ? 'rgba(255,175,70,.45)' : 'rgba(255,65,3,.5)'
  const mercuryY2  = 15 - ratio * 9
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path
        d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"
        stroke={shellColor}
        strokeWidth="1.8"
      />
      <motion.line
        x1="12" x2="12"
        y1="17"
        animate={{ y2: mercuryY2 }}
        initial={{ y2: 15 }}
        transition={{ type: 'spring', stiffness: 90, damping: 18 }}
        stroke={fillColor}
        strokeWidth="2.5"
      />
      <circle cx="12" cy="17" r="2" fill={fillColor}/>
    </svg>
  )
}

// ─── Data ────────────────────────────────────────────────────────────────────

const AMBIANCE_OPTS = [
  { value: 'musique', label: 'Musique', Icon: MusiqueIcon },
  { value: 'radio',   label: 'Radio',   Icon: RadioIcon },
  { value: 'silence', label: 'Silence', Icon: SilenceIcon },
]

const PAYMENT_OPTS = [
  { value: 'Carte',    label: 'Carte',    Icon: CardIcon },
  { value: 'Espèces',  label: 'Espèces',  Icon: CashIcon },
  { value: 'Virement', label: 'Virement', Icon: TransferIcon },
]

const OPTION_LIST = [
  { key: 'wifi',        label: 'Wi-Fi 5G' },
  { key: 'eau',         label: "Eau minérale" },
  { key: 'usb',         label: 'Recharge USB' },
  { key: 'confiseries', label: 'Confiseries' },
  { key: 'siege',       label: 'Siège enfant' },
]

// ─── Sub-components ──────────────────────────────────────────────────────────

function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span
        className="text-[10px] font-bold uppercase tracking-[.12em]"
        style={{ color: 'rgba(255,65,3,.7)' }}
      >
        {children}
      </span>
      <div className="flex-1 h-px" style={{ background: 'rgba(255,65,3,.15)' }} />
    </div>
  )
}

function PillButton({ active, onClick, icon: Icon, children }) {
  return (
    <button
      onClick={onClick}
      className="flex-1 py-2.5 rounded-xl text-xs font-semibold cursor-pointer active:scale-95 transition-all duration-200 select-none"
      style={{
        background: active
          ? 'linear-gradient(135deg, rgba(255,90,31,.18), rgba(255,65,3,.12))'
          : 'rgba(0,10,18,.45)',
        boxShadow: active
          ? '0 0 16px rgba(255,65,3,.2), inset 0 1px 0 rgba(255,255,255,.08)'
          : 'inset 0 1px 2px rgba(0,0,0,.3)',
        border: active
          ? '1px solid rgba(255,65,3,.4)'
          : '1px solid rgba(255,255,255,.05)',
        color: active ? '#F5F1E8' : 'rgba(245,241,232,.4)',
      }}
    >
      <span className="flex items-center justify-center gap-1.5">
        {Icon && <Icon active={active} />}
        {children}
      </span>
    </button>
  )
}

// ─── Main ────────────────────────────────────────────────────────────────────

export default function Step3Options({ onBack }) {
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

  const handleSend = () => {
    const booking = useBookingStore.getState()
    if (!booking.bonNumber) {
      const num = generateBonNumber()
      useBookingStore.setState({ bonNumber: num })
    }
    useBookingStore.getState().addToHistory()
    useBookingStore.getState().setAwaitingReturn(true)
    sendWhatsApp(useBookingStore.getState())
  }

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
        {ambiance !== 'silence' && (
          <div className="flex items-center gap-3 mt-3 px-1">
            <span className="font-mono text-xs w-14" style={{ color: 'rgba(245,241,232,.5)' }}>
              {volume}%
            </span>
            <div className="flex-1">
              <input
                type="range" min="0" max="100" value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full h-1 rounded-full outline-none cursor-pointer appearance-none"
                style={{ accentColor: '#ff4103' }}
                aria-label="Volume"
              />
            </div>
          </div>
        )}
      </section>

      {/* Climatisation */}
      <section>
        <SectionLabel>Climatisation</SectionLabel>
        <div
          className="px-4 py-4 rounded-2xl flex flex-col gap-3"
          style={{
            background: 'rgba(0,10,18,.45)',
            border: '1px solid rgba(255,255,255,.05)',
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ThermometerIcon clim={clim} />
              <span className="text-sm font-semibold" style={{ color: 'rgba(245,241,232,.7)' }}>
                Température
              </span>
            </div>
            <span
              className="font-mono font-bold text-[15px]"
              style={{ color: '#F5F1E8', minWidth: 44, textAlign: 'right' }}
            >
              {clim}°C
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px]" style={{ color: 'rgba(245,241,232,.3)' }}>16°</span>
            <input
              type="range"
              min={16}
              max={28}
              step={1}
              value={clim}
              onChange={(e) => setClim(Number(e.target.value))}
              className="flex-1 cursor-pointer"
              style={{ accentColor: '#ff4103', height: 4 }}
              aria-label="Température climatisation"
            />
            <span className="font-mono text-[10px]" style={{ color: 'rgba(245,241,232,.3)' }}>28°</span>
          </div>
        </div>
      </section>

      {/* Prestations */}
      <section>
        <SectionLabel>Prestations à bord</SectionLabel>
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: '#0c1e2e',
            border: '1px solid rgba(255,255,255,.05)',
          }}
        >
          {OPTION_LIST.map(({ key, label }, i) => (
            <div
              key={key}
              className="px-4 py-3"
              style={{ borderBottom: i < OPTION_LIST.length - 1 ? '1px solid rgba(255,255,255,.05)' : 'none' }}
            >
              <iOSToggle
                id={`opt-${key}`}
                label={label}
                checked={options[key]}
                onChange={() => toggleOption(key)}
              />
            </div>
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
          className="w-full px-4 py-3 rounded-2xl resize-none text-sm outline-none transition-all duration-200"
          style={{
            background: 'rgba(0,10,18,.55)',
            border: '1px solid rgba(255,255,255,.05)',
            color: '#F5F1E8',
          }}
          aria-label="Note complémentaire"
        />
      </section>

      {/* CTA */}
      <div className="flex flex-col gap-3 pt-1">
        <GlowingCTA onClick={handleSend}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="flex-shrink-0">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.118 1.531 5.845L0 24l6.335-1.507A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.895 0-3.666-.53-5.177-1.449l-.371-.22-3.763.895.955-3.646-.242-.381A9.955 9.955 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
          </svg>
          Envoyer sur WhatsApp
        </GlowingCTA>
        <button
          onClick={onBack}
          className="text-sm text-center cursor-pointer py-2 active:opacity-60 transition-opacity"
          style={{ color: 'rgba(245,241,232,.35)' }}
        >
          ← Modifier le tarif
        </button>
      </div>

    </div>
  )
}
