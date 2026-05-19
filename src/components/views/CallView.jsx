const PHONE      = '+33767742220'
const PHONE_HREF = 'tel:+33767742220'
const WA_HREF    = `https://wa.me/33767742220?text=${encodeURIComponent("Bonjour Nourdine, je souhaite réserver une course avec I&N RUN.")}`

const REASSURANCE = [
  {
    label: 'Réponse rapide — réservation à l\'avance',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
      </svg>
    ),
  },
  {
    label: 'Prise en charge garantie & devis gratuit',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    ),
  },
  {
    label: 'Sans engagement — annulation gratuite',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
  },
]

const FORMATTED_PHONE = '+33 7 67 74 22 20'

export default function CallView({ open, onClose }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Contacter le chauffeur"
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

      {/* Header */}
      <div
        className="flex items-center gap-4 px-5 flex-shrink-0 relative z-10"
        style={{
          paddingTop: 'calc(var(--safe-top) + 16px)',
          paddingBottom: 14,
          background: 'rgba(0,15,28,.65)',
          
          
          borderBottom: '1px solid rgba(255,255,255,.06)',
        }}
      >
        <button
          onClick={onClose}
          aria-label="Retour"
          className="w-9 h-9 flex items-center justify-center rounded-full cursor-pointer active:scale-90 transition-transform"
          style={{ background: '#111111', border: '1px solid rgba(255,255,255,.07)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(245,241,232,.8)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <div>
          <h1 className="text-[17px] font-bold" style={{ color: '#F5F1E8' }}>Contacter</h1>
          <p className="text-xs font-medium mt-0.5" style={{ color: 'rgba(245,241,232,.38)' }}>
            Réservation à l'avance
          </p>
        </div>
      </div>

      <div
        key={open}
        className="flex-1 overflow-y-auto px-5 relative z-10"
        style={{ paddingBottom: 'calc(var(--safe-bot) + 28px)' }}
      >

        {/* Driver card — fond uniforme, aucune bordure */}
        <div
          className="rounded-3xl px-5 pt-5 pb-4 mb-5 mt-4"
          style={{ background: '#111111' }}
        >
          <div className="flex items-center gap-4">
            {/* Avatar — carré sombre, "N" crème, point vert coin bas-droit */}
            <div
              className="relative flex-shrink-0 w-[64px] h-[64px] rounded-2xl flex items-center justify-center"
              style={{ background: '#0a1828' }}
            >
              <span
                className="font-bold select-none"
                style={{ fontSize: 26, color: '#F5F1E8', fontFamily: "'Inter', sans-serif", letterSpacing: '-.01em' }}
              >
                N
              </span>
              {/* Online dot — coin bas-droit */}
              <span
                className="absolute bottom-[-3px] right-[-3px] w-3 h-3 rounded-full"
                style={{
                  background: '#34d399',
                  border: '2px solid #111111',
                }}
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[17px]" style={{ color: '#F5F1E8' }}>Nourdine</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(245,241,232,.4)' }}>
                Chauffeur VTC certifié · Paris
              </p>
              {/* Stars — subtiles, pas orange */}
              <div className="flex items-center gap-0.5 mt-2">
                {[1,2,3,4,5].map(i => (
                  <svg key={i} width="11" height="11" viewBox="0 0 24 24" fill="rgba(245,241,232,.55)" className="flex-shrink-0">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                ))}
                <span className="text-xs font-semibold ml-1.5" style={{ color: 'rgba(245,241,232,.45)' }}>5.0</span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="mt-4 mb-3.5" style={{ height: 1, background: 'rgba(255,255,255,.06)' }} />

          {/* Meta badges — ultra-discrets */}
          <div className="flex gap-2 flex-wrap">
            {['EVTC', '24h/7j', 'Assurance pro'].map(tag => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded-lg text-[11px] font-medium tracking-wide"
                style={{
                  background: '#0a1828',
                  color: 'rgba(245,241,232,.38)',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Numéro de téléphone — posé directement sur le fond */}
        <div className="flex justify-center mb-6">
          <span
            className="font-mono font-bold tracking-wider select-all"
            style={{ fontSize: 22, color: '#F5F1E8', letterSpacing: '.04em' }}
          >
            {FORMATTED_PHONE}
          </span>
        </div>

        {/* CTA Appeler — seul élément orange */}
        <a
          href={PHONE_HREF}
          className="relative flex items-center justify-center gap-3 w-full py-5 rounded-2xl mb-3 select-none active:scale-[.97] transition-transform overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #ff5a1f 0%, #ff4103 45%, #e83800 100%)',
            boxShadow: '0 4px 16px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.18)',
            animation: 'cta-breathe 3.5s ease-in-out infinite',
            textDecoration: 'none',
          }}
        >
          <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px pointer-events-none"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.3), transparent)' }} />
          <span aria-hidden="true" className="absolute w-12 h-12 rounded-full"
            style={{ background: 'rgba(255,255,255,.12)', animation: 'pulse-ring 2s ease-out infinite' }} />
          <span aria-hidden="true" className="absolute w-12 h-12 rounded-full"
            style={{ background: 'rgba(255,255,255,.08)', animation: 'pulse-ring 2s ease-out infinite .65s' }} />
          <svg
            width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white"
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ animation: 'phone-ring 2.5s ease-in-out infinite', flexShrink: 0, position: 'relative', zIndex: 1 }}
          >
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.66 3.55a2 2 0 0 1 2-2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9a16 16 0 0 0 6.91 6.91l.82-.82a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.02z"/>
          </svg>
          <span className="font-bold text-[17px] text-white relative z-[1]" style={{ letterSpacing: '.02em' }}>
            Appeler pour réserver
          </span>
        </a>

        {/* WhatsApp — fond sombre, icône verte, texte blanc */}
        <a
          href={WA_HREF}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl mb-8 select-none active:scale-[.97] transition-transform"
          style={{
            background: '#111111',
            border: '1px solid rgba(255,255,255,.08)',
            textDecoration: 'none',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#25d366">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.118 1.531 5.845L0 24l6.335-1.507A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.895 0-3.666-.53-5.177-1.449l-.371-.22-3.763.895.955-3.646-.242-.381A9.955 9.955 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
          </svg>
          <span className="font-semibold text-[15px]" style={{ color: 'rgba(245,241,232,.82)' }}>
            Écrire sur WhatsApp
          </span>
        </a>

        {/* Réassurance — posée directement sur le fond, sans carte */}
        <div className="flex flex-col gap-4 px-1">
          {REASSURANCE.map(({ label, icon }) => (
            <div key={label} className="flex items-center gap-3">
              <span style={{ color: 'rgba(245,241,232,.25)', flexShrink: 0 }}>{icon}</span>
              <span className="text-sm leading-snug" style={{ color: 'rgba(245,241,232,.45)' }}>{label}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
