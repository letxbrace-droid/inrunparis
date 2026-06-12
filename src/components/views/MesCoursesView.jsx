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
              className="flex items-center justify-center rounded-2xl"
              style={{
                width: 136,
                height: 72,
                background: th.bgCard,
                border: `1px solid ${th.borderFaint}`,
                boxShadow: th.isDark
                  ? 'inset 0 1px 0 rgba(255,255,255,.04)'
                  : 'inset 0 1px 0 rgba(255,255,255,.9), 0 1px 4px rgba(0,0,0,.06)',
              }}
            >
              {/* Luxury sedan side profile */}
              <svg width="100" height="50" viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Road dashes */}
                <line x1="2" y1="44" x2="98" y2="44" stroke="rgba(255,90,31,.12)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="6 5"/>

                {/* Car body */}
                <path d="M8 38 L8 28 Q8 26 10 26 L90 26 Q92 26 92 28 L92 38 Z"
                  fill="rgba(255,90,31,.07)" stroke="rgba(255,90,31,.45)" strokeWidth="1.3" strokeLinejoin="round"/>

                {/* Cabin / roofline — elegant fastback */}
                <path d="M26 26 L30 13 Q32 10 36 10 L62 10 Q66 10 68 13 L74 26 Z"
                  fill="rgba(255,90,31,.05)" stroke="rgba(255,90,31,.45)" strokeWidth="1.3" strokeLinejoin="round"/>

                {/* B-pillar */}
                <line x1="50" y1="10.5" x2="50" y2="26" stroke="rgba(255,90,31,.22)" strokeWidth="1"/>

                {/* Front bumper + headlight */}
                <path d="M92 30 L95 31 L95 36 L92 37" stroke="rgba(255,90,31,.35)" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="94" y1="32" x2="97" y2="32" stroke="rgba(255,90,31,.65)" strokeWidth="1.6" strokeLinecap="round"/>

                {/* Tail light */}
                <rect x="6.5" y="28" width="2" height="7" rx="1" fill="rgba(255,90,31,.38)"/>

                {/* Rear wheel */}
                <circle cx="25" cy="40" r="6.5" fill="rgba(255,90,31,.07)" stroke="rgba(255,90,31,.5)" strokeWidth="1.3"/>
                <circle cx="25" cy="40" r="3.2" fill="rgba(255,90,31,.12)" stroke="rgba(255,90,31,.35)" strokeWidth="1"/>
                <line x1="25" y1="37.2" x2="25" y2="42.8" stroke="rgba(255,90,31,.28)" strokeWidth="0.9"/>
                <line x1="22.2" y1="40" x2="27.8" y2="40" stroke="rgba(255,90,31,.28)" strokeWidth="0.9"/>

                {/* Front wheel */}
                <circle cx="75" cy="40" r="6.5" fill="rgba(255,90,31,.07)" stroke="rgba(255,90,31,.5)" strokeWidth="1.3"/>
                <circle cx="75" cy="40" r="3.2" fill="rgba(255,90,31,.12)" stroke="rgba(255,90,31,.35)" strokeWidth="1"/>
                <line x1="75" y1="37.2" x2="75" y2="42.8" stroke="rgba(255,90,31,.28)" strokeWidth="0.9"/>
                <line x1="72.2" y1="40" x2="77.8" y2="40" stroke="rgba(255,90,31,.28)" strokeWidth="0.9"/>

                {/* Door line */}
                <line x1="50" y1="26" x2="50" y2="38" stroke="rgba(255,90,31,.18)" strokeWidth="0.9" strokeDasharray="2 1.5"/>

                {/* Mirror */}
                <path d="M74 22 L77 22 L77 25 L74 25" stroke="rgba(255,90,31,.35)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
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
