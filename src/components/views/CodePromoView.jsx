import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useBookingStore, { getPromoCodes } from '../../store/useBookingStore'
import useAppTheme from '../../hooks/useAppTheme'
import { haptic } from '../../utils/haptics'
import SignatureTrace from '../ui/SignatureTrace'

const HINTS = [
  { icon: '🏅', text: 'Fidélité — après votre 5ème course' },
  { icon: '👥', text: 'Parrainage — invitez un ami à réserver' },
  { icon: '📬', text: 'Newsletter I&N RUN' },
]

export default function CodePromoView({ open, onClose }) {
  const th       = useAppTheme()
  const promo    = useBookingStore((s) => s.promo)
  const setPromo = useBookingStore((s) => s.setPromo)

  const [input,  setInput]  = useState('')
  const [status, setStatus] = useState(null) // null | 'ok' | 'error'

  const handleApply = () => {
    const code = input.trim().toUpperCase()
    if (!code) return
    const found = getPromoCodes()[code]
    if (found) { haptic.medium(); setPromo({ code, ...found }); setStatus('ok') }
    else        { haptic.error(); setStatus('error') }
  }

  const handleRemove = () => { setPromo(null); setInput(''); setStatus(null) }

  const inputBorder = status === 'error'
    ? 'color-mix(in srgb, var(--danger) 55%, transparent)'
    : status === 'ok'
    ? 'color-mix(in srgb, var(--positive) 45%, transparent)'
    : input.length > 0
    ? 'color-mix(in srgb, var(--accent) 40%, transparent)'
    : th.borderFaint

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Code promo"
      aria-hidden={!open}
      className="fixed inset-0 z-[80] flex flex-col will-change-transform"
      style={{
        background:    th.bgBase,
        transform:     open ? 'translateX(0)' : 'translateX(100%)',
        visibility:    open ? 'visible' : 'hidden',
        pointerEvents: open ? 'auto' : 'none',
        transition:    open
          ? 'transform .34s cubic-bezier(.16,1,.3,1), visibility 0s linear 0s'
          : 'transform .28s cubic-bezier(.55,0,.1,1), visibility 0s linear .28s',
      }}
    >
      {/* Header */}
      <div
        className="relative flex items-center gap-4 px-5 flex-shrink-0 overflow-hidden"
        style={{
          paddingTop:    'calc(var(--safe-top) + 16px)',
          paddingBottom: 14,
          background:    th.bgHeader,
          borderBottom:  `1px solid ${th.divider}`,
        }}
      >
        {/* Ambient glow */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(70% 120% at 18% -20%, color-mix(in srgb, var(--accent) 13%, transparent), transparent 55%)',
        }} />

        <button
          onClick={onClose}
          aria-label="Retour"
          className="relative w-11 h-11 flex items-center justify-center rounded-full cursor-pointer active:scale-90 transition-transform"
          style={{ background: th.bgCard, border: `1px solid ${th.border}` }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={th.inkHigh} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>

        <div className="relative">
          <SignatureTrace width={52} loop={false} strokeOpacity={0.5} style={{ marginBottom: 7 }} />
          <h1 className="text-[19px] font-display font-bold" style={{ color: th.inkFull, letterSpacing: '-0.02em' }}>Code promo</h1>
          <p className="text-xs" style={{ color: th.inkMuted }}>Réduisez votre tarif</p>
        </div>
      </div>

      <div
        key={open}
        className="flex-1 px-5 pt-7 overflow-y-auto scrollbar-thin"
        style={{ paddingBottom: 'calc(var(--safe-bot) + 32px)' }}
      >

        {/* ── Hero icon ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, ease: [0.23, 1, 0.32, 1] }}
          className="flex flex-col items-center mb-8"
        >
          <div
            className="flex items-center justify-center w-16 h-16 rounded-[18px] mb-4"
            style={{
              background: 'linear-gradient(145deg, color-mix(in srgb, var(--accent) 18%, transparent), color-mix(in srgb, var(--accent) 7%, transparent))',
              border: '1px solid color-mix(in srgb, var(--accent) 28%, transparent)',
              boxShadow: '0 0 32px color-mix(in srgb, var(--accent) 14%, transparent)',
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF5A1F" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
              <line x1="7" y1="7" x2="7.01" y2="7" strokeWidth="2.5"/>
            </svg>
          </div>
          <p className="text-[13px] text-center" style={{ color: th.inkMuted, maxWidth: 220, lineHeight: 1.55 }}>
            Entrez votre code pour obtenir une réduction sur votre prochain trajet.
          </p>
        </motion.div>

        {/* ── Active promo card ── */}
        <AnimatePresence>
          {promo && (
            <motion.div
              key="active-promo"
              initial={{ opacity: 0, scale: 0.95, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.34, ease: [0.23, 1, 0.32, 1] }}
              className="relative rounded-[18px] p-5 mb-6 overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, color-mix(in srgb, var(--positive) 12%, transparent), color-mix(in srgb, var(--positive) 5%, transparent))',
                border: '1px solid color-mix(in srgb, var(--positive) 35%, transparent)',
              }}
            >
              {/* Decorative % watermark */}
              <div aria-hidden="true" style={{
                position: 'absolute', right: 18, top: '50%', transform: 'translateY(-50%)',
                fontSize: 72, fontWeight: 900, opacity: 0.05,
                color: 'var(--positive)', lineHeight: 1, pointerEvents: 'none',
              }}>%</div>

              <div className="relative flex items-center gap-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'color-mix(in srgb, var(--positive) 18%, transparent)',
                    border: '1px solid color-mix(in srgb, var(--positive) 35%, transparent)',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--positive)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-bold truncate" style={{ color: 'var(--positive)' }}>{promo.code}</p>
                  <p className="text-[12px] mt-0.5 truncate" style={{ color: 'color-mix(in srgb, var(--positive) 65%, transparent)' }}>{promo.label}</p>
                </div>
                <button
                  onClick={handleRemove}
                  className="text-[11px] font-semibold cursor-pointer underline flex-shrink-0"
                  style={{ color: 'color-mix(in srgb, var(--positive) 48%, transparent)' }}
                >
                  Retirer
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Unified input + button bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, ease: [0.23, 1, 0.32, 1], delay: 0.06 }}
        >
          <div
            className="flex items-center gap-2 p-1.5 rounded-[18px] mb-2 transition-all duration-200"
            style={{
              background: th.bgInput,
              border: `1.5px solid ${inputBorder}`,
              boxShadow: input.length > 0 && status !== 'error'
                ? '0 0 0 3px color-mix(in srgb, var(--accent) 8%, transparent)'
                : status === 'error'
                ? '0 0 0 3px color-mix(in srgb, var(--danger) 8%, transparent)'
                : 'none',
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => { setInput(e.target.value.toUpperCase()); setStatus(null) }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleApply() }}
              placeholder="CODE PROMO"
              maxLength={20}
              className="flex-1 px-3 py-2.5 bg-transparent text-sm font-mono font-bold tracking-widest outline-none"
              style={{ color: th.inkFull }}
              aria-label="Code promotionnel"
            />
            <button
              onClick={handleApply}
              disabled={!input.trim()}
              className="px-5 py-2.5 rounded-[12px] text-sm font-bold text-white cursor-pointer disabled:opacity-35 active:scale-95 transition-all duration-150"
              style={{
                background: 'var(--accent)',
                boxShadow: input.trim() ? '0 2px 12px color-mix(in srgb, var(--accent) 40%, transparent)' : 'none',
              }}
            >
              Appliquer
            </button>
          </div>

          <AnimatePresence mode="wait">
            {status === 'error' && (
              <motion.p key="err"
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-xs px-2 mt-1.5"
                style={{ color: 'color-mix(in srgb, var(--danger) 80%, transparent)' }}
              >
                Code invalide. Vérifiez l'orthographe ou contactez-nous.
              </motion.p>
            )}
            {status === 'ok' && (
              <motion.p key="ok"
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-xs px-2 mt-1.5"
                style={{ color: 'color-mix(in srgb, var(--positive) 80%, transparent)' }}
              >
                ✓ Code appliqué — la réduction apparaît à l'étape Tarif.
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Hint card ── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, ease: [0.23, 1, 0.32, 1], delay: 0.12 }}
          className="rounded-[18px] px-5 py-5 mt-6"
          style={{
            background: th.bgCard,
            border: `1px solid ${th.borderFaint}`,
            boxShadow: th.isDark
              ? 'inset 0 1px 0 rgba(255,255,255,.04)'
              : 'inset 0 1px 0 rgba(255,255,255,.9)',
          }}
        >
          <p className="text-[10px] font-bold uppercase tracking-[.10em] mb-4" style={{ color: th.inkMuted }}>
            Comment obtenir un code ?
          </p>
          <div className="flex flex-col gap-3.5">
            {HINTS.map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3.5">
                <span className="text-[17px] flex-shrink-0" aria-hidden="true">{icon}</span>
                <span className="text-[12.5px] leading-relaxed" style={{ color: th.inkMid }}>{text}</span>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  )
}
