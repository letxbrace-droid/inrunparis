import { motion } from 'framer-motion'
import useBookingStore from '../../store/useBookingStore'

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function ShortName(name = '') {
  return name.split(',').slice(0, 2).join(',')
}

function BackBtn({ onClose }) {
  return (
    <button
      onClick={onClose}
      aria-label="Retour"
      className="w-9 h-9 flex items-center justify-center rounded-full cursor-pointer active:scale-90 transition-transform flex-shrink-0"
      style={{
        background: '#111111',
        border: '1px solid rgba(255,255,255,.07)',
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(245,241,232,.8)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7"/>
      </svg>
    </button>
  )
}

export default function MesCoursesView({ open, onClose }) {
  const bookingHistory = useBookingStore((s) => s.bookingHistory)

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Mes courses"
      aria-hidden={!open}
      className="fixed inset-0 z-[80] flex flex-col will-change-transform"
      style={{
        background: '#050505',
        transform:     open ? 'translateX(0)' : 'translateX(100%)',
        visibility:    open ? 'visible' : 'hidden',
        pointerEvents: open ? 'auto' : 'none',
        transition:    open
          ? 'transform .34s cubic-bezier(.16,1,.3,1), visibility 0s linear 0s'
          : 'transform .28s cubic-bezier(.55,0,.1,1), visibility 0s linear .28s',
      }}
    >
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 40% at 50% 0%, rgba(255,65,3,.07), transparent 65%)' }} />

      {/* Header */}
      <div
        className="flex items-center gap-4 px-5 flex-shrink-0 relative z-10"
        style={{
          paddingTop: 'calc(var(--safe-top) + 16px)',
          paddingBottom: 14,
          background: '#0D0D0D',
          
          
          borderBottom: '1px solid rgba(255,255,255,.06)',
        }}
      >
        <BackBtn onClose={onClose} />
        <div>
          <h1 className="text-[17px] font-bold" style={{ color: '#F5F1E8' }}>Mes courses</h1>
          <p className="text-xs" style={{ color: 'rgba(245,241,232,.38)' }}>
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
          <div className="flex flex-col items-center justify-center gap-4 pt-28" style={{ animation: 'fade-up .4s ease both' }}>
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                background: '#111111',
                border: '1px solid rgba(255,255,255,.05)',
              }}
            >
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="rgba(255,65,3,.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 17H3a2 2 0 0 1-2-2V9l3-6h12l3 6v6a2 2 0 0 1-2 2h-2"/><circle cx="7.5" cy="17" r="2.5"/><circle cx="16.5" cy="17" r="2.5"/>
              </svg>
            </div>
            <p className="text-sm font-semibold" style={{ color: 'rgba(245,241,232,.55)' }}>Aucune course pour le moment</p>
            <p className="text-xs text-center" style={{ color: 'rgba(245,241,232,.28)', maxWidth: 220, lineHeight: 1.6 }}>
              Vos réservations envoyées sur WhatsApp apparaîtront ici.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 pt-4">
            {bookingHistory.map((booking, i) => (
              <motion.div
                key={booking.bonNumber ?? i}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1], delay: i * 0.055 }}
                className="overflow-hidden"
                style={{
                  background: '#111111',
                  border: '1px solid rgba(255,255,255,.05)',
                  borderRadius: 16,
                }}
              >
                {/* Bon + date */}
                <div className="flex items-center justify-between px-4 py-2.5"
                  style={{ borderBottom: '1px solid rgba(255,255,255,.05)' }}>
                  <span className="font-mono text-xs font-bold" style={{ color: '#ff4103' }}>
                    {booking.bonNumber ?? '—'}
                  </span>
                  <span className="text-xs" style={{ color: 'rgba(245,241,232,.28)' }}>
                    {formatDate(booking.date)}
                  </span>
                </div>

                {/* Route */}
                <div className="px-4 py-3 flex flex-col gap-1.5">
                  <div className="flex items-start gap-2">
                    <div className="mt-1 w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#ff4103' }} />
                    <p className="text-xs leading-snug" style={{ color: 'rgba(245,241,232,.68)' }}>
                      {ShortName(booking.depart?.name ?? '—')}
                    </p>
                  </div>
                  <div className="ml-[3px] w-px h-3" style={{ background: 'linear-gradient(to bottom, rgba(255,65,3,.4), transparent)' }} />
                  <div className="flex items-start gap-2">
                    <div className="mt-1 w-2 h-2 rounded-full border flex-shrink-0" style={{ borderColor: 'rgba(255,65,3,.65)' }} />
                    <p className="text-xs leading-snug" style={{ color: 'rgba(245,241,232,.68)' }}>
                      {ShortName(booking.arrive?.name ?? '—')}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-3 px-4 py-2.5"
                  style={{ borderTop: '1px solid rgba(255,255,255,.05)' }}>
                  <span className="font-mono font-bold text-sm" style={{ color: '#F5F1E8' }}>
                    {booking.price?.final ?? '—'} €
                  </span>
                  <span style={{ color: 'rgba(255,255,255,.2)' }}>·</span>
                  <span className="font-mono text-xs" style={{ color: 'rgba(245,241,232,.38)' }}>
                    {booking.price?.km ?? '—'} km
                  </span>
                  <span style={{ color: 'rgba(255,255,255,.2)' }}>·</span>
                  <span className="font-mono text-xs" style={{ color: 'rgba(245,241,232,.38)' }}>
                    {booking.price?.mins ?? '—'} min
                  </span>
                  {booking.price?.isAirport && (
                    <span className="ml-auto text-xs" style={{ color: 'rgba(255,65,3,.65)' }}>✈</span>
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
