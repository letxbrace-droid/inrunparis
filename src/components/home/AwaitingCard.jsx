import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useBookingStore from '../../store/useBookingStore'
import useAppTheme from '../../hooks/useAppTheme'

const WA_BASE = 'https://wa.me/33767742220'

function fmtPickup(pickup) {
  if (!pickup) return null
  const d = new Date(pickup)
  return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
    + ' · '
    + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

export default function AwaitingCard({ bonNumber, onDismiss }) {
  const th       = useAppTheme()
  const [done, setDone] = useState(false)

  const depart = useBookingStore(s => s.depart)
  const arrive = useBookingStore(s => s.arrive)
  const price  = useBookingStore(s => s.price)
  const pickup = useBookingStore(s => s.pickup)

  const waUrl = `${WA_BASE}?text=${encodeURIComponent(
    `Bonjour Nourdine, je reviens au sujet de ma réservation ${bonNumber}.`
  )}`

  const handleConfirm = () => setDone(true)

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 340, damping: 30 }}
      className="fixed left-4 right-4 z-[85]"
      style={{ bottom: 'calc(var(--safe-bot, 0px) + 20px)', maxWidth: 540, marginLeft: 'auto', marginRight: 'auto' }}
    >
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: th.bgCard,
          border:     done
            ? '1px solid rgba(52,211,153,.38)'
            : `1px solid ${th.border}`,
          boxShadow: done
            ? '0 -4px 32px rgba(16,185,129,.12), 0 8px 32px rgba(0,0,0,.22)'
            : '0 -4px 32px rgba(0,0,0,.32), 0 8px 32px rgba(0,0,0,.22)',
          transition: 'border .4s, box-shadow .4s',
        }}
      >
        {/* Specular top line — orange en attente, vert si confirmé */}
        <span
          aria-hidden="true"
          className="block h-px transition-all duration-500"
          style={{
            background: done
              ? 'linear-gradient(90deg, transparent, rgba(52,211,153,.65), transparent)'
              : 'linear-gradient(90deg, transparent, rgba(255,90,31,.55), transparent)',
          }}
        />

        <AnimatePresence mode="wait">
          {done ? (
            /* ── État CONFIRMÉ ────────────────────────────────── */
            <motion.div
              key="confirmed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Header vert */}
              <div className="flex items-center gap-3 px-4 pt-4 pb-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 360, damping: 22, delay: 0.06 }}
                  className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: '#10b981' }}
                >
                  <motion.svg
                    width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="#04221b" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"
                  >
                    <motion.path
                      d="M4 12.5l5 5L20 6"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.38, delay: 0.22, ease: 'easeOut' }}
                    />
                  </motion.svg>
                </motion.div>

                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold leading-tight" style={{ color: '#10b981' }}>
                    Course confirmée !
                  </p>
                  <p className="text-[11px] leading-snug mt-0.5" style={{ color: th.inkMuted }}>
                    {bonNumber} · Nourdine sera à l'heure
                  </p>
                </div>

                <button
                  onClick={onDismiss}
                  aria-label="Fermer"
                  className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full cursor-pointer active:scale-90 transition-transform"
                  style={{ background: th.isDark ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.06)' }}
                >
                  <svg width="11" height="11" viewBox="0 0 14 14" fill="none"
                    stroke={th.inkMuted} strokeWidth="2" strokeLinecap="round">
                    <path d="M1 1l12 12M13 1L1 13" />
                  </svg>
                </button>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: th.divider, marginLeft: 16, marginRight: 16 }} />

              {/* Récapitulatif */}
              <div className="flex items-center gap-3 px-4 py-3">
                {/* Timeline A→B */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full" style={{ background: '#FF5A1F' }} />
                  <div className="w-px my-1" style={{ height: 16, background: 'linear-gradient(to bottom, rgba(255,90,31,.5), rgba(255,90,31,.12))' }} />
                  <div className="w-2 h-2 rounded-full border-2" style={{ borderColor: 'rgba(255,90,31,.65)', background: th.bgCard }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold truncate" style={{ color: th.inkFull }}>
                    {depart?.name?.split(',')[0] ?? '—'}
                  </p>
                  <p className="text-[11px] font-medium truncate mt-1" style={{ color: th.inkMuted }}>
                    {arrive?.name?.split(',')[0] ?? '—'}
                  </p>
                </div>
                <div className="flex flex-col items-end flex-shrink-0 gap-1">
                  {price && (
                    <div className="flex items-baseline gap-0.5">
                      <span style={{ fontSize: '1.8rem', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1, color: th.inkFull }}>
                        {price.final}
                      </span>
                      <span style={{ fontSize: '1rem', fontWeight: 800, color: '#FF5A1F' }}>€</span>
                    </div>
                  )}
                  {pickup && (
                    <span className="text-[10px] font-semibold" style={{ color: th.inkMuted }}>
                      {fmtPickup(pickup)}
                    </span>
                  )}
                </div>
              </div>

              {/* Bouton fermer */}
              <div className="px-4 pb-4">
                <button
                  onClick={onDismiss}
                  className="w-full py-3 rounded-xl text-[13px] font-bold cursor-pointer active:scale-[.97] transition-transform select-none"
                  style={{
                    background: th.isDark ? 'rgba(16,185,129,.12)' : 'rgba(5,150,105,.10)',
                    color:      'var(--positive)',
                    border:     '1px solid var(--positive-dim)',
                  }}
                >
                  Fermer
                </button>
              </div>
            </motion.div>

          ) : (
            /* ── État EN ATTENTE ──────────────────────────────── */
            <motion.div
              key="waiting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Status header */}
              <div className="flex items-center gap-3 px-4 pt-4 pb-3">
                <div className="relative flex-shrink-0 w-2.5 h-2.5">
                  <div className="absolute inset-0 rounded-full" style={{ background: '#FF5A1F' }} />
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{ background: 'rgba(255,90,31,.5)' }}
                    animate={{ scale: [1, 2.6, 1], opacity: [0.7, 0, 0.7] }}
                    transition={{ duration: 2.1, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold leading-tight" style={{ color: th.inkFull }}>
                    En attente de confirmation
                  </p>
                  <p className="text-[11px] leading-snug mt-0.5" style={{ color: th.inkMuted }}>
                    {bonNumber} · Nourdine confirme votre course sous peu
                  </p>
                </div>

                <button
                  onClick={onDismiss}
                  aria-label="Fermer"
                  className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full cursor-pointer active:scale-90 transition-transform"
                  style={{ background: th.isDark ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.06)' }}
                >
                  <svg width="11" height="11" viewBox="0 0 14 14" fill="none"
                    stroke={th.inkMuted} strokeWidth="2" strokeLinecap="round">
                    <path d="M1 1l12 12M13 1L1 13" />
                  </svg>
                </button>
              </div>

              {/* Hairline */}
              <div style={{ height: 1, background: th.divider, marginLeft: 16, marginRight: 16 }} />

              {/* Route + price */}
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold truncate" style={{ color: th.inkFull }}>
                    {depart?.name?.split(',')[0] ?? '—'}
                  </p>
                  <p className="text-[11px] font-medium truncate mt-0.5" style={{ color: th.inkMuted }}>
                    → {arrive?.name?.split(',')[0] ?? '—'}
                  </p>
                </div>
                {price && (
                  <div className="flex items-baseline gap-0.5 flex-shrink-0">
                    <span style={{ fontSize: '1.9rem', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1, color: th.inkFull }}>
                      {price.final}
                    </span>
                    <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FF5A1F' }}>€</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="px-4 pb-4 flex flex-col gap-2">
                {/* Voir WhatsApp */}
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-bold cursor-pointer active:scale-[.97] transition-transform select-none"
                  style={{ background: '#25d366', color: '#fff', textDecoration: 'none' }}
                >
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" style={{ flexShrink: 0 }}>
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Voir dans WhatsApp
                </a>

                {/* Course confirmée */}
                <button
                  onClick={handleConfirm}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-bold cursor-pointer active:scale-[.97] transition-transform select-none"
                  style={{
                    background: th.isDark ? 'rgba(16,185,129,.10)' : 'rgba(5,150,105,.08)',
                    color:      'var(--positive)',
                    border:     '1px solid var(--positive-dim)',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  Nourdine a confirmé ma course
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
