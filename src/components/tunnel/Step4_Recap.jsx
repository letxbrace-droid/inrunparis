import { useState } from 'react'
import { motion } from 'framer-motion'
import useBookingStore from '../../store/useBookingStore'
import { sendWhatsApp, generateBonNumber } from '../../utils/whatsappEncoder'
import useAppTheme from '../../hooks/useAppTheme'
import GlowingCTA from '../ui/GlowingCTA'

const AMBIANCE_LABEL  = { musique: 'Musique', radio: 'Radio', silence: 'Silence' }
const PAYMENT_LABEL   = { Espèces: 'Espèces', Carte: 'Carte',  Virement: 'Virement' }

function fmtPickup(pickup) {
  if (!pickup) return '—'
  const d = new Date(pickup)
  const day  = d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
  const time = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  return `${day} · ${time}`
}

// ─── Hairline divider ────────────────────────────────────────────────────────
function Div({ th }) {
  return <div style={{ height: 1, background: th.borderFaint, marginLeft: 16, marginRight: 16 }} />
}

export default function Step4Recap({ onBack }) {
  const th = useAppTheme()
  const [sent, setSent] = useState(false)
  const { depart, arrive, pickup, price, ambiance, clim, options, clientName, payment } = useBookingStore()

  const optionChips = [
    clientName,
    options.wifi        && 'Wi-Fi',
    options.eau         && 'Eau',
    options.usb         && 'USB',
    options.confiseries && 'Confiseries',
    options.siege       && 'Siège enfant',
  ].filter(Boolean)

  const detailLine = [
    AMBIANCE_LABEL[ambiance],
    clim && `${clim}°C`,
    PAYMENT_LABEL[payment],
  ].filter(Boolean).join(' · ')

  const handleSend = () => {
    if (sent) return
    const booking = useBookingStore.getState()
    if (!booking.bonNumber) useBookingStore.setState({ bonNumber: generateBonNumber() })
    useBookingStore.getState().addToHistory()
    useBookingStore.getState().setAwaitingReturn(true)
    sendWhatsApp(useBookingStore.getState())
    setSent(true)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-3 px-4 pb-5 pt-0"
    >
      {/* ── SINGLE RECEIPT CARD ──────────────────────────────────── */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: th.bgCard, border: `1px solid ${th.border}` }}
      >

        {/* PRIX — compact inline, not a hero */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-baseline gap-1">
            <span style={{ fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1, color: th.inkFull }}>
              {price?.final ?? '—'}
            </span>
            <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ff4103', letterSpacing: '-0.02em' }}>€</span>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold" style={{ color: th.inkMuted }}>{price?.km} km</span>
              <span style={{ color: th.inkDim }}>·</span>
              <span className="text-xs font-semibold" style={{ color: th.inkMuted }}>≈ {price?.mins} min</span>
            </div>
            {(price?.isNight || price?.isAirport) && (
              <div className="flex gap-1">
                {price.isNight && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: 'rgba(255,65,3,.12)', color: '#ff4103' }}>Nuit</span>
                )}
                {price.isAirport && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: 'rgba(255,65,3,.12)', color: '#ff4103' }}>✈</span>
                )}
              </div>
            )}
          </div>
        </div>

        <Div th={th} />

        {/* ROUTE A → B — compact */}
        <div className="flex items-stretch gap-3 px-4 py-3">
          {/* Timeline */}
          <div className="flex flex-col items-center flex-shrink-0 mt-1">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#ff4103' }} />
            <div className="w-px flex-1 my-1" style={{ minHeight: 20, background: 'linear-gradient(to bottom, rgba(255,65,3,.45), rgba(255,65,3,.10))' }} />
            <div className="w-2 h-2 rounded-full flex-shrink-0 border-2" style={{ borderColor: 'rgba(255,65,3,.65)', background: th.bgCard }} />
          </div>
          {/* Addresses */}
          <div className="flex flex-col flex-1 min-w-0" style={{ gap: 10 }}>
            <div className="min-w-0">
              <div className="text-[13px] font-bold truncate" style={{ color: th.inkFull }}>
                {depart?.name ?? '—'}
              </div>
              {depart?.city && (
                <div className="text-[11px] truncate leading-snug" style={{ color: th.inkMuted }}>{depart.city}</div>
              )}
            </div>
            <div className="min-w-0">
              <div className="text-[13px] font-bold truncate" style={{ color: th.inkFull }}>
                {arrive?.name ?? '—'}
              </div>
              {arrive?.city && (
                <div className="text-[11px] truncate leading-snug" style={{ color: th.inkMuted }}>{arrive.city}</div>
              )}
            </div>
          </div>
        </div>

        <Div th={th} />

        {/* DATE + DÉTAILS — single dense row */}
        <div className="flex items-center gap-2.5 px-4 py-2.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke="rgba(255,65,3,.65)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
          </svg>
          <span className="text-[12px] font-semibold truncate" style={{ color: th.inkMid }}>
            {fmtPickup(pickup)}
          </span>
          {detailLine && (
            <>
              <span style={{ color: th.inkDim, flexShrink: 0 }}>·</span>
              <span className="text-[12px] font-medium truncate" style={{ color: th.inkMuted }}>{detailLine}</span>
            </>
          )}
        </div>

        {/* OPTIONS CHIPS — inside card, tight */}
        {optionChips.length > 0 && (
          <>
            <Div th={th} />
            <div className="flex flex-wrap gap-1.5 px-4 py-2.5">
              {optionChips.map((chip, i) => (
                <span
                  key={chip}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                  style={{
                    background: i === 0 && clientName === chip
                      ? 'rgba(255,65,3,.10)'
                      : th.bgInput,
                    color: i === 0 && clientName === chip ? '#ff4103' : th.inkMid,
                    border: `1px solid ${i === 0 && clientName === chip ? 'rgba(255,65,3,.22)' : th.borderFaint}`,
                  }}
                >
                  {chip}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      {sent ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center gap-3"
        >
          <div
            className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl"
            style={{
              background: 'rgba(37,211,102,.09)',
              border:     '1px solid rgba(37,211,102,.25)',
            }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 14, stiffness: 320, delay: 0.08 }}
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: '#25d366' }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                <motion.path
                  d="M4 12.5l5 5L20 6"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.38, delay: 0.22, ease: 'easeOut' }}
                />
              </svg>
            </motion.div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold leading-tight" style={{ color: th.inkFull }}>
                Message envoyé sur WhatsApp
              </p>
              <p className="text-[11px] leading-snug mt-0.5" style={{ color: th.inkMuted }}>
                Nourdine revient vers vous pour confirmer votre course
              </p>
            </div>
          </div>
          <p className="text-[11px] text-center" style={{ color: th.inkDim }}>
            Fermez ce panneau pour voir la carte
          </p>
        </motion.div>
      ) : (
        <>
          <GlowingCTA onClick={handleSend}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style={{ flexShrink: 0 }}>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Confirmer &amp; envoyer sur WhatsApp
          </GlowingCTA>
          <button
            onClick={onBack}
            className="text-[12px] text-center py-1 cursor-pointer active:opacity-60 transition-opacity"
            style={{ color: th.inkDim }}
          >
            ← Modifier les options
          </button>
        </>
      )}
    </motion.div>
  )
}
