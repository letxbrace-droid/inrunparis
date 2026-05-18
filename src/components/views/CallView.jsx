const PHONE      = '+33767742220'
const PHONE_HREF = 'tel:+33767742220'
const WA_HREF    = `https://wa.me/33767742220?text=${encodeURIComponent("Bonjour Nourdine, je souhaite réserver une course avec I&N RUN.")}`

const BADGES = [
  { label: 'Réponse < 2 min', icon: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
    </svg>
  )},
  { label: 'Prise en charge garantie', icon: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  )},
  { label: 'Devis gratuit & sans engagement', icon: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>
  )},
]

export default function CallView({ open, onClose }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Appeler le chauffeur"
      aria-hidden={!open}
      className="fixed inset-0 z-[80] flex flex-col will-change-transform"
      style={{
        background:    'linear-gradient(180deg, #001f30 0%, #001621 55%)',
        transform:     open ? 'translateX(0)' : 'translateX(100%)',
        visibility:    open ? 'visible' : 'hidden',
        pointerEvents: open ? 'auto' : 'none',
        transition:    open
          ? 'transform .34s cubic-bezier(.16,1,.3,1), visibility 0s linear 0s'
          : 'transform .28s cubic-bezier(.55,0,.1,1), visibility 0s linear .28s',
      }}
    >
      {/* Ambient top glow */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 45% at 50% 0%, rgba(255,65,3,.07), transparent 65%)' }}
      />

      {/* Header */}
      <div
        className="flex items-center gap-4 px-5 flex-shrink-0 relative z-10"
        style={{ paddingTop: 'calc(var(--safe-top) + 18px)', paddingBottom: 14 }}
      >
        <button
          onClick={onClose}
          aria-label="Retour"
          className="w-9 h-9 flex items-center justify-center rounded-full cursor-pointer active:scale-90 transition-transform"
          style={{
            background: 'linear-gradient(145deg, #002535, #001a28)',
            boxShadow: '3px 3px 10px rgba(0,0,0,.5), -1px -1px 4px rgba(255,255,255,.03)',
            border: '1px solid rgba(255,255,255,.07)',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(245,241,232,.8)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <div>
          <h1 className="text-[17px] font-bold" style={{ color: '#F5F1E8' }}>Appeler</h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: '#34d399', boxShadow: '0 0 6px rgba(52,211,153,.8)' }}
            />
            <span className="text-xs font-medium" style={{ color: 'rgba(52,211,153,.85)' }}>
              Disponible maintenant
            </span>
          </div>
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto px-5 relative z-10"
        style={{ paddingBottom: 'calc(var(--safe-bot) + 28px)' }}
      >

        {/* Driver card */}
        <div
          className="rounded-3xl p-5 mb-6 mt-2 relative overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, #002535 0%, #001a28 100%)',
            boxShadow: '5px 5px 20px rgba(0,0,0,.6), -2px -2px 8px rgba(255,255,255,.025)',
            border: '1px solid rgba(255,255,255,.07)',
            borderTop: '1px solid rgba(255,255,255,.10)',
          }}
        >
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div
              className="relative flex-shrink-0 w-[68px] h-[68px] rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(255,65,3,.25) 0%, rgba(255,65,3,.08) 100%)',
                border: '1.5px solid rgba(255,65,3,.35)',
                boxShadow: '0 0 24px rgba(255,65,3,.15), inset 0 1px 0 rgba(255,255,255,.1)',
              }}
            >
              <span
                className="font-bold"
                style={{ fontSize: 28, color: '#ff4103', fontFamily: "'Inter', sans-serif" }}
              >
                N
              </span>
              {/* Online dot */}
              <span
                className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full"
                style={{
                  background: '#34d399',
                  border: '2px solid #001621',
                  boxShadow: '0 0 8px rgba(52,211,153,.8)',
                }}
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[17px]" style={{ color: '#F5F1E8' }}>Nourdine</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(245,241,232,.45)' }}>
                Chauffeur VTC certifié · Paris
              </p>
              {/* Stars */}
              <div className="flex items-center gap-1 mt-2">
                {[1,2,3,4,5].map(i => (
                  <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill="#ff4103" className="flex-shrink-0">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                ))}
                <span className="text-xs font-semibold ml-1" style={{ color: 'rgba(245,241,232,.6)' }}>5.0</span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="my-4" style={{ borderTop: '1px solid rgba(255,255,255,.06)' }} />

          {/* Meta badges */}
          <div className="flex gap-2 flex-wrap">
            {['EVTC', '24h/7j', 'Assurance pro'].map(tag => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold"
                style={{
                  background: 'rgba(255,65,3,.1)',
                  border: '1px solid rgba(255,65,3,.22)',
                  color: 'rgba(255,65,3,.85)',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Phone number display */}
        <div className="flex justify-center mb-5">
          <div
            className="px-5 py-2 rounded-2xl"
            style={{
              background: 'rgba(0,10,18,.5)',
              boxShadow: 'inset 2px 2px 8px rgba(0,0,0,.45), inset -1px -1px 3px rgba(255,255,255,.03)',
              border: '1px solid rgba(255,255,255,.06)',
            }}
          >
            <span
              className="font-mono text-[17px] font-bold tracking-wide"
              style={{ color: 'rgba(245,241,232,.8)' }}
            >
              {PHONE.replace('+33', '+33 ').replace(/(\d{1})(\d{2})(\d{2})(\d{2})(\d{2})$/, '$1 $2 $3 $4 $5')}
            </span>
          </div>
        </div>

        {/* Phone CTA */}
        <a
          href={PHONE_HREF}
          className="relative flex items-center justify-center gap-3 w-full py-5 rounded-2xl mb-3 select-none active:scale-[.97] transition-transform overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #ff5a1f 0%, #ff4103 45%, #e83800 100%)',
            boxShadow: '0 0 0 1px rgba(255,65,3,.35), 0 0 36px rgba(255,65,3,.6), 0 0 80px rgba(255,65,3,.22), 0 8px 24px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.2)',
            animation: 'cta-breathe 3.5s ease-in-out infinite',
            textDecoration: 'none',
          }}
        >
          {/* Specular */}
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-px pointer-events-none"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.3), transparent)' }}
          />
          {/* Pulse rings */}
          <span
            aria-hidden="true"
            className="absolute w-12 h-12 rounded-full"
            style={{
              background: 'rgba(255,255,255,.15)',
              animation: 'pulse-ring 2s ease-out infinite',
            }}
          />
          <span
            aria-hidden="true"
            className="absolute w-12 h-12 rounded-full"
            style={{
              background: 'rgba(255,255,255,.1)',
              animation: 'pulse-ring 2s ease-out infinite .6s',
            }}
          />
          {/* Icon */}
          <svg
            width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ animation: 'phone-ring 2.5s ease-in-out infinite', flexShrink: 0, position: 'relative', zIndex: 1 }}
          >
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.66 3.55a2 2 0 0 1 2-2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9a16 16 0 0 0 6.91 6.91l.82-.82a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.02z"/>
          </svg>
          <span className="font-bold text-[17px] text-white relative z-[1]" style={{ letterSpacing: '.02em' }}>
            Appeler maintenant
          </span>
        </a>

        {/* WhatsApp CTA */}
        <a
          href={WA_HREF}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl mb-6 select-none active:scale-[.97] transition-transform"
          style={{
            background: 'rgba(37,211,102,.1)',
            border: '1px solid rgba(37,211,102,.3)',
            boxShadow: '0 0 20px rgba(37,211,102,.12)',
            textDecoration: 'none',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#25d366">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.118 1.531 5.845L0 24l6.335-1.507A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.895 0-3.666-.53-5.177-1.449l-.371-.22-3.763.895.955-3.646-.242-.381A9.955 9.955 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
          </svg>
          <span className="font-semibold text-[15px]" style={{ color: '#25d366' }}>
            Envoyer un message WhatsApp
          </span>
        </a>

        {/* Reassurance badges */}
        <div className="flex flex-col gap-2">
          {BADGES.map(({ label, icon }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-xl px-4 py-3"
              style={{
                background: 'rgba(255,65,3,.04)',
                border: '1px solid rgba(255,65,3,.1)',
              }}
            >
              <span style={{ color: 'rgba(255,65,3,.7)', flexShrink: 0 }}>{icon}</span>
              <span className="text-sm" style={{ color: 'rgba(245,241,232,.55)' }}>{label}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
