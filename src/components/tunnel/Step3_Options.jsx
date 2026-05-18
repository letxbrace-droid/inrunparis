import useBookingStore from '../../store/useBookingStore'
import { sendWhatsApp, generateBonNumber } from '../../utils/whatsappEncoder'
import GlowingCTA from '../ui/GlowingCTA'
import iOSToggle  from '../ui/iOSToggle'
import FloatingInput from '../ui/FloatingInput'

const AMBIANCE_OPTS = [
  { value: 'musique', label: 'Musique', icon: '♪' },
  { value: 'radio',   label: 'Radio',   icon: '◉' },
  { value: 'silence', label: 'Silence', icon: '◌' },
]
const PAYMENT_OPTS = ['Carte', 'Espèces', 'Virement']

const OPTION_LIST = [
  { key: 'wifi',        label: 'Wi-Fi 5G' },
  { key: 'eau',         label: "Eau minérale" },
  { key: 'usb',         label: 'Recharge USB' },
  { key: 'confiseries', label: 'Confiseries' },
  { key: 'siege',       label: 'Siège enfant' },
]

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

function PillButton({ active, onClick, children }) {
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
          : 'inset 2px 2px 6px rgba(0,0,0,.45), inset -1px -1px 3px rgba(255,255,255,.03)',
        border: active
          ? '1px solid rgba(255,65,3,.4)'
          : '1px solid rgba(255,255,255,.05)',
        color: active ? '#F5F1E8' : 'rgba(245,241,232,.4)',
      }}
    >
      {children}
    </button>
  )
}

export default function Step3Options({ onBack }) {
  const ambiance     = useBookingStore((s) => s.ambiance)
  const setAmbiance  = useBookingStore((s) => s.setAmbiance)
  const volume       = useBookingStore((s) => s.volume)
  const setVolume    = useBookingStore((s) => s.setVolume)
  const clim         = useBookingStore((s) => s.clim)
  const setClim      = useBookingStore((s) => s.setClim)
  const options      = useBookingStore((s) => s.options)
  const toggleOption = useBookingStore((s) => s.toggleOption)
  const payment      = useBookingStore((s) => s.payment)
  const setPayment   = useBookingStore((s) => s.setPayment)
  const clientName   = useBookingStore((s) => s.clientName)
  const setClientName  = useBookingStore((s) => s.setClientName)
  const clientEmail  = useBookingStore((s) => s.clientEmail)
  const setClientEmail = useBookingStore((s) => s.setClientEmail)
  const note         = useBookingStore((s) => s.note)
  const setNote      = useBookingStore((s) => s.setNote)

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
            >
              {opt.icon} {opt.label}
            </PillButton>
          ))}
        </div>
        {ambiance !== 'silence' && (
          <div className="flex items-center gap-3 mt-3 px-1">
            <span className="font-mono text-xs w-14" style={{ color: 'rgba(245,241,232,.5)' }}>
              {volume}%
            </span>
            <div className="flex-1 relative">
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
            boxShadow: 'inset 2px 2px 8px rgba(0,0,0,.45), inset -1px -1px 3px rgba(255,255,255,.03)',
            border: '1px solid rgba(255,255,255,.05)',
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(130,200,255,.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="2" x2="12" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
              <span className="text-sm font-semibold" style={{ color: 'rgba(245,241,232,.7)' }}>Température</span>
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
            background: 'linear-gradient(145deg, #002535, #001a28)',
            boxShadow: '5px 5px 18px rgba(0,0,0,.55), -2px -2px 8px rgba(255,255,255,.025)',
            border: '1px solid rgba(255,255,255,.05)',
          }}
        >
          {OPTION_LIST.map(({ key, label }, i) => (
            <div
              key={key}
              className="px-4 py-3"
              style={{
                borderBottom: i < OPTION_LIST.length - 1 ? '1px solid rgba(255,255,255,.05)' : 'none',
              }}
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
            <PillButton key={p} active={payment === p} onClick={() => setPayment(p)}>
              {p}
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
            boxShadow: 'inset 3px 3px 10px rgba(0,0,0,.5), inset -1px -1px 4px rgba(255,255,255,.03)',
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
