import useBookingStore from '../../store/useBookingStore'

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function ShortName(name = '') {
  return name.split(',').slice(0, 2).join(',')
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
        background:    '#001621',
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
        className="flex items-center gap-4 px-5 flex-shrink-0"
        style={{ paddingTop: 'calc(var(--safe-top) + 18px)', paddingBottom: 16 }}
      >
        <button
          onClick={onClose}
          aria-label="Retour"
          className="w-9 h-9 flex items-center justify-center rounded-full cursor-pointer active:scale-90 transition-transform"
          style={{ background: 'rgba(245,241,232,.07)', border: '1px solid rgba(245,241,232,.12)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(245,241,232,.8)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <div>
          <h1 className="text-[17px] font-bold" style={{ color: '#F5F1E8' }}>Mes courses</h1>
          <p className="text-xs" style={{ color: 'rgba(245,241,232,.38)' }}>
            {bookingHistory.length} course{bookingHistory.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-8" style={{ paddingBottom: 'calc(var(--safe-bot) + 32px)' }}>
        {bookingHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 pt-24">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255,65,3,.08)', border: '1px solid rgba(255,65,3,.15)' }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,65,3,.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 17H3a2 2 0 0 1-2-2V9l3-6h12l3 6v6a2 2 0 0 1-2 2h-2"/>
                <circle cx="7.5" cy="17" r="2.5"/>
                <circle cx="16.5" cy="17" r="2.5"/>
              </svg>
            </div>
            <p className="text-sm font-semibold" style={{ color: 'rgba(245,241,232,.6)' }}>Aucune course pour le moment</p>
            <p className="text-xs text-center" style={{ color: 'rgba(245,241,232,.3)', maxWidth: 220 }}>
              Vos prochaines réservations apparaîtront ici après envoi sur WhatsApp.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 pt-2">
            {bookingHistory.map((booking, i) => (
              <div
                key={booking.bonNumber ?? i}
                className="rounded-2xl overflow-hidden"
                style={{
                  background: 'rgba(245,241,232,.04)',
                  border: '1px solid rgba(245,241,232,.09)',
                }}
              >
                {/* Top bar */}
                <div
                  className="flex items-center justify-between px-4 py-2"
                  style={{ borderBottom: '1px solid rgba(245,241,232,.07)' }}
                >
                  <span className="font-mono text-xs font-bold" style={{ color: '#ff4103' }}>
                    {booking.bonNumber ?? '—'}
                  </span>
                  <span className="text-xs" style={{ color: 'rgba(245,241,232,.3)' }}>
                    {formatDate(booking.date)}
                  </span>
                </div>

                {/* Route */}
                <div className="px-4 py-3 flex flex-col gap-1.5">
                  <div className="flex items-start gap-2">
                    <div
                      className="mt-1 w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: '#ff4103' }}
                    />
                    <p className="text-xs leading-snug" style={{ color: 'rgba(245,241,232,.7)' }}>
                      {ShortName(booking.depart?.name ?? '—')}
                    </p>
                  </div>
                  <div className="ml-1 w-px h-3 bg-gradient-to-b from-accent/30 to-transparent" />
                  <div className="flex items-start gap-2">
                    <div
                      className="mt-1 w-2 h-2 rounded-full border flex-shrink-0"
                      style={{ borderColor: 'rgba(255,65,3,.7)', background: 'transparent' }}
                    />
                    <p className="text-xs leading-snug" style={{ color: 'rgba(245,241,232,.7)' }}>
                      {ShortName(booking.arrive?.name ?? '—')}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div
                  className="flex items-center gap-3 px-4 py-2.5"
                  style={{ borderTop: '1px solid rgba(245,241,232,.07)' }}
                >
                  <span
                    className="font-mono font-bold text-sm"
                    style={{ color: '#F5F1E8' }}
                  >
                    {booking.price?.final ?? '—'} €
                  </span>
                  <span style={{ color: 'rgba(245,241,232,.2)' }}>·</span>
                  <span className="font-mono text-xs" style={{ color: 'rgba(245,241,232,.4)' }}>
                    {booking.price?.km ?? '—'} km
                  </span>
                  <span style={{ color: 'rgba(245,241,232,.2)' }}>·</span>
                  <span className="font-mono text-xs" style={{ color: 'rgba(245,241,232,.4)' }}>
                    {booking.price?.mins ?? '—'} min
                  </span>
                  {booking.price?.isAirport && (
                    <span className="ml-auto text-xs" style={{ color: 'rgba(255,65,3,.7)' }}>✈</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
