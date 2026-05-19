import { motion } from 'framer-motion'
import useBookingStore from '../../store/useBookingStore'
import { sendWhatsApp, generateBonNumber } from '../../utils/whatsappEncoder'
import useAppTheme from '../../hooks/useAppTheme'
import GlowingCTA from '../ui/GlowingCTA'

function fmt(pickup) {
  if (!pickup) return { date: '—', time: '—' }
  const d = new Date(pickup)
  return {
    date: d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }),
    time: d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
  }
}

const AMBIANCE_LABEL = { musique: 'Musique', radio: 'Radio', silence: 'Silence' }

export default function Step4Recap({ onBack }) {
  const th = useAppTheme()
  const {
    depart, arrive, pickup, price,
    ambiance, clim, options, clientName, payment,
  } = useBookingStore()

  const { date, time } = fmt(pickup)

  const optionChips = [
    options.wifi        && 'Wi-Fi',
    options.eau         && 'Eau',
    options.usb         && 'USB',
    options.confiseries && 'Confiseries',
    options.siege       && 'Siège enfant',
  ].filter(Boolean)

  const PAYMENT_LABEL = { especes: 'Espèces', carte: 'Carte', virement: 'Virement' }

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
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-3 px-5 pb-6 pt-1"
    >

      {/* ── PRIX HERO ─────────────────────────────────────────── */}
      <div className="flex flex-col items-center py-5">
        <div className="flex items-baseline gap-1.5">
          <span
            style={{
              fontSize: '5rem',
              fontWeight: 900,
              letterSpacing: '-0.05em',
              lineHeight: 1,
              color: th.inkFull,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {price?.final ?? '—'}
          </span>
          <span style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ff4103', letterSpacing: '-0.03em' }}>€</span>
        </div>
        {price && (
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs font-semibold" style={{ color: th.inkMuted }}>{price.km} km</span>
            <span style={{ color: th.inkDim }}>·</span>
            <span className="text-xs font-semibold" style={{ color: th.inkMuted }}>≈ {price.mins} min</span>
            {price.isNight && (
              <>
                <span style={{ color: th.inkDim }}>·</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(255,65,3,.12)', color: '#ff4103' }}>
                  Tarif nuit
                </span>
              </>
            )}
            {price.isAirport && (
              <>
                <span style={{ color: th.inkDim }}>·</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(255,65,3,.12)', color: '#ff4103' }}>
                  ✈ Aéroport
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── ROUTE A → B ────────────────────────────────────────── */}
      <div
        className="rounded-2xl px-4 py-4"
        style={{ background: th.bgCard, border: `1px solid ${th.border}` }}
      >
        <div className="flex items-stretch gap-4">
          {/* Timeline dots + line */}
          <div className="flex flex-col items-center flex-shrink-0 pt-1 pb-1">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#ff4103' }} />
            <div
              className="flex-1 w-px my-1.5"
              style={{
                minHeight: 28,
                background: `linear-gradient(to bottom, rgba(255,65,3,.50), rgba(255,65,3,.12))`,
              }}
            />
            <div className="w-2.5 h-2.5 rounded-full border-2" style={{ borderColor: 'rgba(255,65,3,.70)', background: th.bgCard }} />
          </div>

          {/* Addresses */}
          <div className="flex flex-col justify-between flex-1 min-w-0" style={{ gap: 12 }}>
            <div>
              <div className="text-[9px] font-bold uppercase tracking-[.12em] mb-0.5" style={{ color: th.inkDim }}>
                Départ
              </div>
              <div className="text-[15px] font-bold truncate leading-tight" style={{ color: th.inkFull }}>
                {depart?.name ?? '—'}
              </div>
              {depart?.city && (
                <div className="text-xs truncate mt-0.5" style={{ color: th.inkMuted }}>{depart.city}</div>
              )}
            </div>
            <div>
              <div className="text-[9px] font-bold uppercase tracking-[.12em] mb-0.5" style={{ color: th.inkDim }}>
                Arrivée
              </div>
              <div className="text-[15px] font-bold truncate leading-tight" style={{ color: th.inkFull }}>
                {arrive?.name ?? '—'}
              </div>
              {arrive?.city && (
                <div className="text-xs truncate mt-0.5" style={{ color: th.inkMuted }}>{arrive.city}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── DATE/HEURE + DÉTAILS ──────────────────────────────── */}
      <div
        className="rounded-2xl divide-y"
        style={{
          background: th.bgCard,
          border: `1px solid ${th.border}`,
          divideColor: th.borderFaint,
        }}
      >
        {/* Date/heure */}
        <div className="flex items-center gap-3 px-4 py-3">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="rgba(255,65,3,.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
          </svg>
          <span className="text-sm font-semibold" style={{ color: th.inkFull }}>
            {date} &nbsp;·&nbsp; {time}
          </span>
        </div>

        {/* Ambiance + clim */}
        <div className="flex items-center gap-3 px-4 py-3" style={{ borderTop: `1px solid ${th.borderFaint}` }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="rgba(255,65,3,.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
          </svg>
          <span className="text-sm font-semibold" style={{ color: th.inkFull }}>
            {AMBIANCE_LABEL[ambiance] ?? 'Musique'}
            {clim && <span style={{ color: th.inkMuted }}> &nbsp;·&nbsp; {clim}°C</span>}
          </span>
        </div>

        {/* Payment */}
        <div className="flex items-center gap-3 px-4 py-3" style={{ borderTop: `1px solid ${th.borderFaint}` }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="rgba(255,65,3,.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
          </svg>
          <span className="text-sm font-semibold" style={{ color: th.inkFull }}>
            {PAYMENT_LABEL[payment] ?? 'Espèces'}
          </span>
        </div>
      </div>

      {/* ── OPTIONS CHIPS ─────────────────────────────────────── */}
      {(optionChips.length > 0 || clientName) && (
        <div className="flex flex-wrap gap-2">
          {clientName && (
            <span
              className="px-3 py-1 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(255,65,3,.10)', color: '#ff4103', border: '1px solid rgba(255,65,3,.22)' }}
            >
              {clientName}
            </span>
          )}
          {optionChips.map(chip => (
            <span
              key={chip}
              className="px-3 py-1 rounded-full text-xs font-semibold"
              style={{ background: th.bgInput, color: th.inkMid, border: `1px solid ${th.borderFaint}` }}
            >
              {chip}
            </span>
          ))}
        </div>
      )}

      {/* ── CTA ───────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2 pt-1">
        <GlowingCTA onClick={handleSend}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" className="flex-shrink-0">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Confirmer &amp; envoyer sur WhatsApp
        </GlowingCTA>
        <button
          onClick={onBack}
          className="text-sm text-center py-2 cursor-pointer active:opacity-60 transition-opacity"
          style={{ color: th.inkMuted }}
        >
          ← Modifier les options
        </button>
      </div>

    </motion.div>
  )
}
