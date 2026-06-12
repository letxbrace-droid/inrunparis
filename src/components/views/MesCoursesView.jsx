import { motion } from 'framer-motion'
import useBookingStore from '../../store/useBookingStore'
import useAppTheme from '../../hooks/useAppTheme'

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function ShortName(name = '') {
  return name.split(',').slice(0, 2).join(',')
}

function BackBtn({ onClose, th }) {
  return (
    <button
      onClick={onClose}
      aria-label="Retour"
      className="w-11 h-11 flex items-center justify-center rounded-full cursor-pointer active:scale-90 transition-transform flex-shrink-0"
      style={{ background: th.bgCard, border: `1px solid ${th.border}` }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={th.inkHigh} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7"/>
      </svg>
    </button>
  )
}

export default function MesCoursesView({ open, onClose, onReserve }) {
  const th = useAppTheme()
  const bookingHistory = useBookingStore((s) => s.bookingHistory)

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Mes courses"
      aria-hidden={!open}
      className="fixed inset-0 z-[80] flex flex-col will-change-transform"
      style={{
        background: th.bgBase,
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
        className="flex items-center gap-4 px-5 flex-shrink-0 relative z-10"
        style={{
          paddingTop:    'calc(var(--safe-top) + 16px)',
          paddingBottom: 14,
          background:    th.bgHeader,
          borderBottom:  `1px solid ${th.divider}`,
        }}
      >
        <BackBtn onClose={onClose} th={th} />
        <div>
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
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center justify-center gap-5 pt-24 px-6"
          >
            <div
              className="flex items-center justify-center rounded-2xl overflow-hidden"
              style={{
                width: 216,
                height: 96,
                background: th.bgCard,
                border: `1px solid ${th.borderFaint}`,
                boxShadow: th.isDark
                  ? 'inset 0 1px 0 rgba(255,255,255,.04)'
                  : 'inset 0 1px 0 rgba(255,255,255,.9), 0 1px 4px rgba(0,0,0,.06)',
              }}
            >
              {/* Premium sedan — proportional, CSS-variable themed */}
              <svg width="196" height="84" viewBox="0 0 196 84" fill="none" xmlns="http://www.w3.org/2000/svg">

                {/* Ground shadow */}
                <ellipse cx="98" cy="80" rx="76" ry="2.5"
                  style={{ fill: 'color-mix(in srgb, var(--accent) 6%, transparent)' }} />

                {/* Wheels — drawn before body so body overlaps upper half */}

                {/* Rear wheel */}
                <circle cx="44" cy="66" r="13" strokeWidth="2"
                  style={{ fill: 'color-mix(in srgb, var(--accent) 7%, transparent)', stroke: 'color-mix(in srgb, var(--accent) 44%, transparent)' }} />
                <circle cx="44" cy="66" r="5" strokeWidth="1.2"
                  style={{ fill: 'color-mix(in srgb, var(--accent) 14%, transparent)', stroke: 'color-mix(in srgb, var(--accent) 30%, transparent)' }} />
                {/* 5-spoke rear */}
                {[0, 72, 144, 216, 288].map((deg) => {
                  const r1 = 5.8, r2 = 12, a = (deg * Math.PI) / 180
                  return <line key={deg}
                    x1={44 + r1 * Math.cos(a)} y1={66 + r1 * Math.sin(a)}
                    x2={44 + r2 * Math.cos(a)} y2={66 + r2 * Math.sin(a)}
                    strokeWidth="1.2" strokeLinecap="round"
                    style={{ stroke: 'color-mix(in srgb, var(--accent) 24%, transparent)' }} />
                })}

                {/* Front wheel */}
                <circle cx="152" cy="66" r="13" strokeWidth="2"
                  style={{ fill: 'color-mix(in srgb, var(--accent) 7%, transparent)', stroke: 'color-mix(in srgb, var(--accent) 44%, transparent)' }} />
                <circle cx="152" cy="66" r="5" strokeWidth="1.2"
                  style={{ fill: 'color-mix(in srgb, var(--accent) 14%, transparent)', stroke: 'color-mix(in srgb, var(--accent) 30%, transparent)' }} />
                {/* 5-spoke front */}
                {[0, 72, 144, 216, 288].map((deg) => {
                  const r1 = 5.8, r2 = 12, a = (deg * Math.PI) / 180
                  return <line key={deg}
                    x1={152 + r1 * Math.cos(a)} y1={66 + r1 * Math.sin(a)}
                    x2={152 + r2 * Math.cos(a)} y2={66 + r2 * Math.sin(a)}
                    strokeWidth="1.2" strokeLinecap="round"
                    style={{ stroke: 'color-mix(in srgb, var(--accent) 24%, transparent)' }} />
                })}

                {/* Road centre dashes */}
                <line x1="2" y1="79" x2="194" y2="79" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="10 8"
                  style={{ stroke: 'color-mix(in srgb, var(--accent) 11%, transparent)' }} />

                {/* Car body — unified silhouette with wheel arches */}
                {/* Rear arch: centre x=44, r=14 → from 58 to 30 */}
                {/* Front arch: centre x=152, r=14 → from 166 to 138 */}
                <path
                  d="M 58 46 L 62 24 Q 65 17 72 17 L 126 17 Q 133 17 136 24 L 140 46 L 168 46 Q 180 46 180 56 L 180 66 L 166 66 A 14 14 0 0 0 138 66 L 58 66 A 14 14 0 0 0 30 66 L 14 66 Q 12 66 12 64 L 12 55 Q 12 46 16 46 Z"
                  strokeWidth="1.6" strokeLinejoin="round"
                  style={{ fill: 'color-mix(in srgb, var(--accent) 8%, transparent)', stroke: 'color-mix(in srgb, var(--accent) 40%, transparent)' }} />

                {/* Cabin glass */}
                <path
                  d="M 61 46 L 65 26 Q 68 20 74 20 L 124 20 Q 130 20 133 26 L 137 46 Z"
                  strokeWidth="1.1" strokeLinejoin="round"
                  style={{ fill: 'color-mix(in srgb, var(--accent) 5%, transparent)', stroke: 'color-mix(in srgb, var(--accent) 26%, transparent)' }} />

                {/* B-pillar */}
                <line x1="98" y1="20" x2="98" y2="46" strokeWidth="1.2"
                  style={{ stroke: 'color-mix(in srgb, var(--accent) 20%, transparent)' }} />

                {/* Tail light — vertical LED strip */}
                <rect x="10" y="48" width="3" height="14" rx="1.5"
                  style={{ fill: 'color-mix(in srgb, var(--accent) 62%, transparent)' }} />

                {/* Headlight — upper LED */}
                <line x1="180" y1="51" x2="187" y2="50" strokeWidth="2.2" strokeLinecap="round"
                  style={{ stroke: 'color-mix(in srgb, var(--accent) 76%, transparent)' }} />
                {/* Headlight — DRL lower */}
                <line x1="180" y1="56" x2="186" y2="55.5" strokeWidth="1.2" strokeLinecap="round"
                  style={{ stroke: 'color-mix(in srgb, var(--accent) 44%, transparent)' }} />

                {/* Door sill trim */}
                <line x1="58" y1="59" x2="165" y2="59" strokeWidth="0.9"
                  style={{ stroke: 'color-mix(in srgb, var(--accent) 14%, transparent)' }} />

                {/* Door split */}
                <line x1="98" y1="46" x2="98" y2="66" strokeWidth="1" strokeDasharray="3.5 2.5"
                  style={{ stroke: 'color-mix(in srgb, var(--accent) 13%, transparent)' }} />

                {/* Side mirror */}
                <path d="M 137 38 L 145 38 L 145 44 L 137 44" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"
                  style={{ stroke: 'color-mix(in srgb, var(--accent) 32%, transparent)' }} />

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
                  background: '#FF5A1F',
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: '0.01em',
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
          <div className="flex flex-col gap-3 pt-4">
            {bookingHistory.map((booking, i) => (
              <motion.div
                key={booking.bonNumber ?? i}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1], delay: i * 0.055 }}
                className="overflow-hidden"
                style={{ background: th.bgCard, border: `1px solid ${th.borderFaint}`, borderRadius: 16 }}
              >
                <div className="flex items-center justify-between px-4 py-2.5"
                  style={{ borderBottom: `1px solid ${th.borderFaint}` }}>
                  <span className="font-mono text-xs font-bold" style={{ color: '#FF5A1F' }}>
                    {booking.bonNumber ?? '—'}
                  </span>
                  <span className="text-xs" style={{ color: th.inkDim }}>
                    {formatDate(booking.date)}
                  </span>
                </div>

                <div className="px-4 py-3 flex flex-col gap-1.5">
                  <div className="flex items-start gap-2">
                    <div className="mt-1 w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#FF5A1F' }} />
                    <p className="text-xs leading-snug" style={{ color: th.inkMid }}>
                      {ShortName(booking.depart?.name ?? '—')}
                    </p>
                  </div>
                  <div className="ml-[3px] w-px h-3" style={{ background: 'linear-gradient(to bottom, color-mix(in srgb, var(--accent) 40%, transparent), transparent)' }} />
                  <div className="flex items-start gap-2">
                    <div className="mt-1 w-2 h-2 rounded-full border flex-shrink-0" style={{ borderColor: 'color-mix(in srgb, var(--accent) 65%, transparent)' }} />
                    <p className="text-xs leading-snug" style={{ color: th.inkMid }}>
                      {ShortName(booking.arrive?.name ?? '—')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 px-4 py-2.5"
                  style={{ borderTop: `1px solid ${th.borderFaint}` }}>
                  <span className="font-mono font-bold text-sm" style={{ color: th.inkFull }}>
                    {booking.price?.final ?? '—'} €
                  </span>
                  <span style={{ color: th.borderStrong }}>·</span>
                  <span className="font-mono text-xs" style={{ color: th.inkMuted }}>
                    {booking.price?.km ?? '—'} km
                  </span>
                  <span style={{ color: th.borderStrong }}>·</span>
                  <span className="font-mono text-xs" style={{ color: th.inkMuted }}>
                    {booking.price?.mins ?? '—'} min
                  </span>
                  {booking.price?.isAirport && (
                    <span className="ml-auto text-xs" style={{ color: 'color-mix(in srgb, var(--accent) 65%, transparent)' }}>✈</span>
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
