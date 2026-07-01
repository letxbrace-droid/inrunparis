import { motion } from 'framer-motion'
import useBookingStore from '../../store/useBookingStore'
import useAppTheme from '../../hooks/useAppTheme'
import { haptic } from '../../utils/haptics'
import SignatureTrace from '../ui/SignatureTrace'

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function ShortName(name = '') {
  return name.split(',').slice(0, 2).join(',')
}

function RefreshIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
      <path d="M3 3v5h5"/>
    </svg>
  )
}

export default function MesCoursesView({ open, onClose, onReserve }) {
  const th = useAppTheme()
  const bookingHistory = useBookingStore((s) => s.bookingHistory)
  const redoBooking    = useBookingStore((s) => s.redoBooking)

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Mes courses"
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
        {/* Ambient accent glow */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(70% 120% at 18% -20%, color-mix(in srgb, var(--accent) 13%, transparent), transparent 55%)',
        }} />

        {/* Back button */}
        <button
          onClick={onClose}
          aria-label="Retour"
          className="relative w-11 h-11 flex items-center justify-center rounded-full cursor-pointer active:scale-90 transition-transform flex-shrink-0"
          style={{ background: th.bgCard, border: `1px solid ${th.border}` }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={th.inkHigh} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>

        <div className="relative">
          <SignatureTrace width={52} loop={false} strokeOpacity={0.5} style={{ marginBottom: 7 }} />
          <h1 className="text-[17px] font-bold" style={{ color: th.inkFull }}>Mes courses</h1>
          <p className="text-xs" style={{ color: th.inkMuted }}>
            {bookingHistory.length} course{bookingHistory.length !== 1 ? 's' : ''} enregistrée{bookingHistory.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div
        key={open}
        className="flex-1 overflow-y-auto px-5 scrollbar-thin relative z-10"
        style={{ paddingBottom: 'calc(var(--safe-bot) + 32px)' }}
      >
        {bookingHistory.length === 0 ? (
          /* ── Empty state ── */
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center justify-center gap-5 pt-24 px-6"
          >
            <div
              className="flex items-center justify-center rounded-2xl overflow-hidden"
              style={{
                width: 216, height: 96,
                background: th.bgCard,
                border: `1px solid ${th.borderFaint}`,
                boxShadow: th.isDark
                  ? 'inset 0 1px 0 rgba(255,255,255,.04)'
                  : 'inset 0 1px 0 rgba(255,255,255,.9), 0 1px 4px rgba(0,0,0,.06)',
              }}
            >
              <svg width="196" height="84" viewBox="0 0 196 84" fill="none">
                <ellipse cx="98" cy="80" rx="76" ry="2.5" style={{ fill: 'color-mix(in srgb, var(--accent) 6%, transparent)' }} />
                <circle cx="44" cy="66" r="13" strokeWidth="2" style={{ fill: 'color-mix(in srgb, var(--accent) 7%, transparent)', stroke: 'color-mix(in srgb, var(--accent) 44%, transparent)' }} />
                <circle cx="44" cy="66" r="5" strokeWidth="1.2" style={{ fill: 'color-mix(in srgb, var(--accent) 14%, transparent)', stroke: 'color-mix(in srgb, var(--accent) 30%, transparent)' }} />
                {[0,72,144,216,288].map(deg => { const r1=5.8,r2=12,a=(deg*Math.PI)/180; return <line key={deg} x1={44+r1*Math.cos(a)} y1={66+r1*Math.sin(a)} x2={44+r2*Math.cos(a)} y2={66+r2*Math.sin(a)} strokeWidth="1.2" strokeLinecap="round" style={{ stroke: 'color-mix(in srgb, var(--accent) 24%, transparent)' }} /> })}
                <circle cx="152" cy="66" r="13" strokeWidth="2" style={{ fill: 'color-mix(in srgb, var(--accent) 7%, transparent)', stroke: 'color-mix(in srgb, var(--accent) 44%, transparent)' }} />
                <circle cx="152" cy="66" r="5" strokeWidth="1.2" style={{ fill: 'color-mix(in srgb, var(--accent) 14%, transparent)', stroke: 'color-mix(in srgb, var(--accent) 30%, transparent)' }} />
                {[0,72,144,216,288].map(deg => { const r1=5.8,r2=12,a=(deg*Math.PI)/180; return <line key={deg} x1={152+r1*Math.cos(a)} y1={66+r1*Math.sin(a)} x2={152+r2*Math.cos(a)} y2={66+r2*Math.sin(a)} strokeWidth="1.2" strokeLinecap="round" style={{ stroke: 'color-mix(in srgb, var(--accent) 24%, transparent)' }} /> })}
                <line x1="2" y1="79" x2="194" y2="79" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="10 8" style={{ stroke: 'color-mix(in srgb, var(--accent) 11%, transparent)' }} />
                <path d="M 58 46 L 62 24 Q 65 17 72 17 L 126 17 Q 133 17 136 24 L 140 46 L 168 46 Q 180 46 180 56 L 180 66 L 166 66 A 14 14 0 0 0 138 66 L 58 66 A 14 14 0 0 0 30 66 L 14 66 Q 12 66 12 64 L 12 55 Q 12 46 16 46 Z" strokeWidth="1.6" strokeLinejoin="round" style={{ fill: 'color-mix(in srgb, var(--accent) 8%, transparent)', stroke: 'color-mix(in srgb, var(--accent) 40%, transparent)' }} />
                <path d="M 61 46 L 65 26 Q 68 20 74 20 L 124 20 Q 130 20 133 26 L 137 46 Z" strokeWidth="1.1" strokeLinejoin="round" style={{ fill: 'color-mix(in srgb, var(--accent) 5%, transparent)', stroke: 'color-mix(in srgb, var(--accent) 26%, transparent)' }} />
                <line x1="98" y1="20" x2="98" y2="46" strokeWidth="1.2" style={{ stroke: 'color-mix(in srgb, var(--accent) 20%, transparent)' }} />
                <rect x="10" y="48" width="3" height="14" rx="1.5" style={{ fill: 'color-mix(in srgb, var(--accent) 62%, transparent)' }} />
                <line x1="180" y1="51" x2="187" y2="50" strokeWidth="2.2" strokeLinecap="round" style={{ stroke: 'color-mix(in srgb, var(--accent) 76%, transparent)' }} />
                <line x1="180" y1="56" x2="186" y2="55.5" strokeWidth="1.2" strokeLinecap="round" style={{ stroke: 'color-mix(in srgb, var(--accent) 44%, transparent)' }} />
                <line x1="58" y1="59" x2="165" y2="59" strokeWidth="0.9" style={{ stroke: 'color-mix(in srgb, var(--accent) 14%, transparent)' }} />
                <line x1="98" y1="46" x2="98" y2="66" strokeWidth="1" strokeDasharray="3.5 2.5" style={{ stroke: 'color-mix(in srgb, var(--accent) 13%, transparent)' }} />
                <path d="M 137 38 L 145 38 L 145 44 L 137 44" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ stroke: 'color-mix(in srgb, var(--accent) 32%, transparent)' }} />
              </svg>
            </div>

            <div className="flex flex-col items-center gap-2 text-center">
              <p className="text-[15px] font-bold" style={{ color: th.inkFull }}>Aucune course pour le moment</p>
              <p className="text-[13px] leading-relaxed" style={{ color: th.inkMuted, maxWidth: 240 }}>
                Vos réservations envoyées sur WhatsApp apparaîtront ici automatiquement.
              </p>
            </div>

            {onReserve && (
              <button
                onClick={onReserve}
                className="flex items-center gap-2 px-6 py-3.5 rounded-2xl cursor-pointer active:scale-[.97] transition-transform duration-150 select-none"
                style={{
                  background: 'var(--accent)', color: '#fff',
                  fontSize: 14, fontWeight: 700, letterSpacing: '0.01em',
                  boxShadow: '0 4px 16px color-mix(in srgb, var(--accent) 35%, transparent)',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
                Réserver une course
              </button>
            )}
          </motion.div>
        ) : (
          /* ── Course cards ── */
          <div className="flex flex-col gap-3 pt-4">
            {bookingHistory.map((booking, i) => (
              <motion.div
                key={booking.bonNumber ?? i}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1], delay: i * 0.055 }}
                className="rounded-[18px] overflow-hidden"
                style={{
                  background: th.bgCard,
                  border: `1px solid ${th.borderFaint}`,
                  boxShadow: th.isDark
                    ? 'inset 0 1px 0 rgba(255,255,255,.04)'
                    : '0 1px 4px rgba(0,0,0,.06)',
                }}
              >
                {/* Accent line */}
                <div style={{ height: 2, background: 'linear-gradient(90deg, var(--accent) 0%, transparent 55%)' }} />

                {/* Bon + date */}
                <div className="flex items-center justify-between px-4 pt-3 pb-2.5"
                  style={{ borderBottom: `1px solid ${th.borderFaint}` }}>
                  <span className="font-mono text-[11px] font-bold tracking-wide px-2 py-0.5 rounded-full"
                    style={{ background: 'color-mix(in srgb, var(--accent) 10%, transparent)', color: 'var(--accent)' }}>
                    {booking.bonNumber ?? '—'}
                  </span>
                  <span className="text-[11px]" style={{ color: th.inkDim }}>
                    {formatDate(booking.date)}
                  </span>
                </div>

                {/* Route A → B */}
                <div className="px-4 pt-3 pb-2.5">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full flex-shrink-0 mt-0.5" style={{ background: 'var(--accent)' }} />
                    <p className="text-[13px] font-semibold truncate" style={{ color: th.inkFull }}>
                      {ShortName(booking.depart?.name ?? '—')}
                    </p>
                  </div>
                  <div className="flex items-stretch gap-3 my-1.5">
                    <div className="flex justify-center" style={{ width: 8, flexShrink: 0 }}>
                      <div className="w-px flex-1" style={{ background: 'linear-gradient(to bottom, color-mix(in srgb, var(--accent) 45%, transparent), color-mix(in srgb, var(--accent) 10%, transparent))' }} />
                    </div>
                    <div style={{ height: 10 }} />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full border-[2px] flex-shrink-0 mt-0.5"
                      style={{ borderColor: 'color-mix(in srgb, var(--accent) 65%, transparent)', background: th.bgCard }} />
                    <p className="text-[13px] font-semibold truncate" style={{ color: th.inkFull }}>
                      {ShortName(booking.arrive?.name ?? '—')}
                    </p>
                  </div>
                </div>

                {/* Footer: price hero + stats + refaire */}
                <div className="flex items-center gap-2 px-4 py-2.5"
                  style={{ borderTop: `1px solid ${th.borderFaint}` }}>

                  {/* Price — hero */}
                  <span className="font-bold text-[17px] tabular-nums" style={{ color: 'var(--accent)' }}>
                    {booking.price?.final ?? '—'} €
                  </span>

                  {/* Secondary stats */}
                  <span className="text-[11px] ml-0.5" style={{ color: th.inkMuted }}>
                    {booking.price?.km ?? '—'} km · {booking.price?.mins ?? '—'} min
                  </span>

                  {booking.price?.isAirport && (
                    <span style={{ fontSize: 13 }}>✈</span>
                  )}
                  {booking.promoCode && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: 'color-mix(in srgb, var(--positive) 12%, transparent)', color: 'var(--positive)' }}>
                      {booking.promoCode}
                    </span>
                  )}

                  {/* Refaire */}
                  {booking.depart?.lat && (
                    <button
                      onClick={() => {
                        haptic.light()
                        const ok = redoBooking(booking)
                        if (ok) { onClose(); onReserve?.() }
                      }}
                      className="ml-auto flex items-center gap-1.5 text-[12px] font-bold cursor-pointer active:scale-95 transition-transform px-3 py-1.5 rounded-full flex-shrink-0"
                      style={{
                        background: 'color-mix(in srgb, var(--accent) 12%, transparent)',
                        color: 'var(--accent)',
                        border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)',
                      }}
                      aria-label="Refaire ce trajet"
                    >
                      <RefreshIcon />
                      Refaire
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
