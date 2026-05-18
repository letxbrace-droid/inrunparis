import useBookingStore from '../../store/useBookingStore'
import { sendWhatsApp, generateBonNumber } from '../../utils/whatsappEncoder'
import GlowingCTA from '../ui/GlowingCTA'
import iOSToggle  from '../ui/iOSToggle'
import FloatingInput from '../ui/FloatingInput'

const AMBIANCE_OPTS = [
  { value: 'musique', label: '🎵 Musique' },
  { value: 'radio',   label: '📻 Radio' },
  { value: 'silence', label: '🔇 Silence' },
]
const PAYMENT_OPTS = ['Carte', 'Espèces', 'Virement']

export default function Step3Options({ onBack }) {
  const store = useBookingStore()
  const {
    ambiance, setAmbiance, volume, setVolume, clim, setClim,
    options, toggleOption, payment, setPayment,
    clientName, setClientName, clientEmail, setClientEmail,
    note, setNote,
  } = store

  const handleSend = () => {
    const booking = useBookingStore.getState()
    if (!booking.bonNumber) {
      const num = generateBonNumber()
      useBookingStore.setState({ bonNumber: num })
    }
    sendWhatsApp(useBookingStore.getState())
  }

  const OPTION_LIST = [
    { key: 'wifi',        label: 'Wi-Fi 5G' },
    { key: 'eau',         label: "Eau minérale" },
    { key: 'usb',         label: 'Recharge USB' },
    { key: 'confiseries', label: 'Confiseries' },
    { key: 'siege',       label: 'Siège enfant' },
  ]

  return (
    <div className="flex flex-col gap-5 px-5 pb-6">

      {/* Identité */}
      <section>
        <h3 className="text-xs text-ink-muted uppercase tracking-widest mb-3">Votre identité</h3>
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
        <h3 className="text-xs text-ink-muted uppercase tracking-widest mb-3">Ambiance</h3>
        <div className="flex gap-2">
          {AMBIANCE_OPTS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setAmbiance(opt.value)}
              className={`
                flex-1 py-2.5 rounded-xl text-xs font-medium cursor-pointer
                transition-all duration-200 border
                ${ambiance === opt.value
                  ? 'bg-accent/15 border-accent/50 text-ink-primary'
                  : 'bg-bg-elevated border-[var(--rule-strong)] text-ink-muted'}
              `}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {ambiance !== 'silence' && (
          <div className="flex items-center gap-3 mt-3">
            <span className="text-xs text-ink-muted w-12">Vol. {volume}%</span>
            <input
              type="range" min="0" max="100" value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="flex-1 accent-[#ff4103] h-1"
              aria-label="Volume"
            />
          </div>
        )}
      </section>

      {/* Climatisation */}
      <section>
        <div className="flex items-center justify-between">
          <h3 className="text-xs text-ink-muted uppercase tracking-widest">Clim ❄️ {clim}°C</h3>
          <div className="flex gap-2">
            <button onClick={() => setClim(Math.max(16, clim - 1))} className="w-7 h-7 rounded-lg bg-bg-elevated text-ink-secondary cursor-pointer">−</button>
            <button onClick={() => setClim(Math.min(28, clim + 1))} className="w-7 h-7 rounded-lg bg-bg-elevated text-ink-secondary cursor-pointer">+</button>
          </div>
        </div>
      </section>

      {/* Options */}
      <section>
        <h3 className="text-xs text-ink-muted uppercase tracking-widest mb-3">Prestations à bord</h3>
        <div className="flex flex-col gap-3 bg-bg-elevated rounded-2xl p-4 border border-[var(--rule-strong)]">
          {OPTION_LIST.map(({ key, label }) => (
            <iOSToggle
              key={key}
              id={`opt-${key}`}
              label={label}
              checked={options[key]}
              onChange={() => toggleOption(key)}
            />
          ))}
        </div>
      </section>

      {/* Règlement */}
      <section>
        <h3 className="text-xs text-ink-muted uppercase tracking-widest mb-3">Règlement</h3>
        <div className="flex gap-2">
          {PAYMENT_OPTS.map((p) => (
            <button
              key={p}
              onClick={() => setPayment(p)}
              className={`
                flex-1 py-2.5 rounded-xl text-xs font-medium cursor-pointer
                transition-all duration-200 border
                ${payment === p
                  ? 'bg-accent/15 border-accent/50 text-ink-primary'
                  : 'bg-bg-elevated border-[var(--rule-strong)] text-ink-muted'}
              `}
            >
              {p}
            </button>
          ))}
        </div>
      </section>

      {/* Note */}
      <section>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Note (vol, bagages, instructions...)"
          rows={2}
          className="
            w-full px-4 py-3 rounded-2xl resize-none
            bg-bg-elevated border border-[var(--rule-strong)]
            text-ink-primary text-sm placeholder-ink-muted
            focus:outline-none focus:border-accent
            transition-colors duration-200
          "
          aria-label="Note complémentaire"
        />
      </section>

      {/* CTA */}
      <div className="flex flex-col gap-3">
        <GlowingCTA onClick={handleSend}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.118 1.531 5.845L0 24l6.335-1.507A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.895 0-3.666-.53-5.177-1.449l-.371-.22-3.763.895.955-3.646-.242-.381A9.955 9.955 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
          </svg>
          Envoyer sur WhatsApp
        </GlowingCTA>
        <button
          onClick={onBack}
          className="text-sm text-ink-muted cursor-pointer text-center"
        >
          ← Modifier le tarif
        </button>
      </div>

    </div>
  )
}
