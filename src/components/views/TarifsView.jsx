const WA_COURSE = `https://wa.me/33767742220?text=${encodeURIComponent('Bonjour, je souhaite réserver une course avec I&N RUN.')}`
const WA_MAD    = `https://wa.me/33767742220?text=${encodeURIComponent('*DEMANDE DE DEVIS — MISE À DISPOSITION*\n\nBonjour Nourdine,\n\nJe souhaite réserver votre service de mise à disposition :\n\n📅 Date : \n🕒 Horaires : \n⏱️ Durée estimée : \n📍 Point de départ : \n🎯 Type de prestation : (Business / Mariage / Tourisme / Autre)\n👥 Nombre de passagers : \n\nMerci de me confirmer votre disponibilité et le tarif final.')}`

const TRAJETS = [
  {
    title:    'Aéroports & gares',
    subtitle: 'CDG · Orly · Beauvais',
    detail:   'Tarif fixe avant validation',
    price:    'dès 45 €',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ff4103" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
      </svg>
    ),
  },
  {
    title:    'Longue distance',
    subtitle: 'Province · Gares TGV',
    detail:   'Devis personnalisé · Confort garanti',
    price:    'Sur devis',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ff4103" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
  },
]

const MAD_ROWS = [
  { duration: '2 heures',  note: 'À partir de',   price: '80 €',     highlight: false },
  { duration: '4 heures',  note: 'Demi-journée',   price: '150 €',    highlight: false },
  { duration: 'Journée',   note: '8h · Conseillé', price: 'Sur devis', highlight: true  },
]

const REVIEWS = [
  { init: 'SM', name: 'Sophie M.', route: 'CDG → Paris 8e', text: "Chauffeur ponctuel, tarif honoré sans discussion. Le service premium sans l'attente des applis." },
  { init: 'TR', name: 'Thomas R.', route: 'Ris-Orangis → La Défense', text: 'Réservation WhatsApp, confirmation rapide, devis garanti. Ponctuel, discret, professionnel.' },
  { init: 'AK', name: 'Amina K.', route: 'Orly → Versailles', text: 'Service courtois, conduite souple. Une vraie alternative premium aux grandes plateformes.' },
]

const COMPARE = [
  ['Prix annoncé avant départ',  'Estimatif, peut augmenter'],
  ['Aucune commission cachée',   'Surge pricing possible'],
  ['Confirmation WhatsApp 2 min', 'Attribution aléatoire'],
]

function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="font-mono text-[10px] font-bold uppercase tracking-[.12em]" style={{ color: 'rgba(255,65,3,.7)' }}>
        {children}
      </span>
      <div className="flex-1 h-px" style={{ background: 'rgba(255,65,3,.15)' }} />
    </div>
  )
}

export default function TarifsView({ open, onClose, onReserve }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Tarifs et services"
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
      {/* Ambient glow */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 40% at 50% 0%, rgba(255,65,3,.07), transparent 65%)' }} />

      {/* Header */}
      <div
        className="flex-shrink-0 flex items-center gap-3 px-5 relative z-10"
        style={{
          paddingTop:    'calc(var(--safe-top) + 16px)',
          paddingBottom: 14,
          background:    'rgba(0,26,40,.65)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom:  '1px solid rgba(255,255,255,.07)',
        }}
      >
        <button
          onClick={onClose}
          aria-label="Retour"
          className="w-9 h-9 flex items-center justify-center rounded-full cursor-pointer active:scale-90 transition-transform flex-shrink-0"
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
          <h1 className="text-[17px] font-bold" style={{ color: '#F5F1E8' }}>Tarifs & services</h1>
          <p className="text-xs" style={{ color: 'rgba(245,241,232,.38)' }}>Transparents · Sans surprise</p>
        </div>
      </div>

      {/* Body */}
      <div
        key={open}
        className="flex-1 overflow-y-auto overscroll-contain scrollbar-thin relative z-10"
        style={{ paddingBottom: 'calc(var(--safe-bot) + 110px)' }}
      >
        {/* Hero card */}
        <div className="px-5 pt-5" style={{ animation: 'fade-up .38s ease both 0ms' }}>
          <div
            className="relative rounded-3xl overflow-hidden p-5"
            style={{
              background: 'linear-gradient(145deg, #002535 0%, #001a28 100%)',
              boxShadow: '5px 5px 20px rgba(0,0,0,.6), -2px -2px 8px rgba(255,255,255,.025), 0 0 50px rgba(255,65,3,.08)',
              border: '1px solid rgba(255,255,255,.05)',
              borderTop: '3px solid #ff4103',
            }}
          >
            <div aria-hidden="true" className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(255,65,3,.1), transparent 70%)' }} />
            <span
              className="inline-block font-mono text-[10px] font-semibold tracking-widest uppercase mb-3 px-3 py-1 rounded-full"
              style={{ background: 'rgba(255,65,3,.15)', color: '#ff4103', border: '1px solid rgba(255,65,3,.3)' }}
            >
              I&N RUN
            </span>
            <h1 className="font-brand font-bold leading-snug mb-2" style={{ fontSize: 'clamp(1.2rem,5vw,1.5rem)', color: '#F5F1E8' }}>
              Estimation connue<br />avant chaque course
            </h1>
            <p style={{ fontSize: 13, color: 'rgba(245,241,232,.5)', lineHeight: 1.5 }}>
              Aéroports, longue distance et mise à disposition
            </p>
            <div className="flex items-center gap-6 mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,65,3,.15)' }}>
              {[{ val: '5/5', lab: 'Excellence' }, { val: '2 min', lab: 'Réponse' }, { val: 'EVTC', lab: 'Certifié' }].map(s => (
                <div key={s.lab} className="flex flex-col gap-0.5">
                  <span className="font-brand font-bold text-sm" style={{ color: '#ff4103' }}>{s.val}</span>
                  <span className="font-mono text-[9px] tracking-widest uppercase" style={{ color: 'rgba(245,241,232,.35)' }}>{s.lab}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trajets fixes */}
        <div className="px-5 pt-6" style={{ animation: 'fade-up .38s ease both 60ms' }}>
          <SectionLabel>Trajets fixes</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            {TRAJETS.map((t) => (
              <div
                key={t.title}
                className="rounded-2xl p-4 flex flex-col gap-3"
                style={{
                  background: 'linear-gradient(145deg, #002535 0%, #001a28 100%)',
                  boxShadow: '4px 4px 16px rgba(0,0,0,.55), -2px -2px 6px rgba(255,255,255,.02)',
                  border: '1px solid rgba(255,255,255,.06)',
                }}
              >
                <span>{t.icon}</span>
                <div>
                  <div className="font-semibold text-sm leading-tight mb-0.5" style={{ color: '#F5F1E8' }}>{t.title}</div>
                  <div className="font-mono text-[10px]" style={{ color: 'rgba(245,241,232,.4)' }}>{t.subtitle}</div>
                </div>
                <div style={{ fontSize: 11, color: 'rgba(245,241,232,.35)', lineHeight: 1.4 }}>{t.detail}</div>
                <div className="font-brand font-bold text-base mt-auto" style={{ color: '#ff4103' }}>{t.price}</div>
              </div>
            ))}
          </div>
        </div>

        {/* MAD */}
        <div className="px-5 pt-6" style={{ animation: 'fade-up .38s ease both 120ms' }}>
          <SectionLabel>Mise à disposition</SectionLabel>
          <p className="text-sm font-semibold mb-4" style={{ color: 'rgba(245,241,232,.7)' }}>
            Un chauffeur dédié, selon votre rythme
          </p>
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, #002535 0%, #001a28 100%)',
              boxShadow: '4px 4px 16px rgba(0,0,0,.55), -2px -2px 6px rgba(255,255,255,.02)',
              border: '1px solid rgba(255,255,255,.06)',
            }}
          >
            {MAD_ROWS.map((row, i) => (
              <div
                key={row.duration}
                className="flex items-center justify-between px-4 py-4"
                style={{
                  borderBottom: i < MAD_ROWS.length - 1 ? '1px solid rgba(255,255,255,.05)' : 'none',
                  background: row.highlight ? 'rgba(255,65,3,.07)' : 'transparent',
                }}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold text-sm" style={{ color: row.highlight ? '#ff4103' : '#F5F1E8' }}>{row.duration}</span>
                  <span style={{ fontSize: 11, color: 'rgba(245,241,232,.35)' }}>{row.note}</span>
                </div>
                <span className="font-brand font-bold text-[15px]" style={{ color: row.highlight ? '#ff4103' : '#F5F1E8' }}>{row.price}</span>
              </div>
            ))}
          </div>
          <p className="font-mono text-center mt-3" style={{ fontSize: 10, color: 'rgba(245,241,232,.25)' }}>
            Tarifs TTC · Sans frais cachés · Attentes incluses
          </p>
        </div>

        {/* Comparison */}
        <div className="px-5 pt-6" style={{ animation: 'fade-up .38s ease both 180ms' }}>
          <SectionLabel>I&N RUN vs Plateformes</SectionLabel>
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, #002535 0%, #001a28 100%)',
              boxShadow: '4px 4px 16px rgba(0,0,0,.55), -2px -2px 6px rgba(255,255,255,.02)',
              border: '1px solid rgba(255,255,255,.06)',
            }}
          >
            <div className="grid grid-cols-2">
              <div className="px-4 py-3" style={{ background: 'rgba(255,65,3,.08)', borderRight: '1px solid rgba(255,65,3,.15)', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
                <div className="text-xs font-bold" style={{ color: '#ff4103' }}>I&N RUN</div>
                <div style={{ fontSize: 10, color: 'rgba(245,241,232,.35)', marginTop: 2 }}>Prix fixe garanti</div>
              </div>
              <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,.06)' }}>
                <div className="text-xs font-semibold" style={{ color: 'rgba(245,241,232,.45)' }}>Plateformes</div>
                <div style={{ fontSize: 10, color: 'rgba(245,241,232,.28)', marginTop: 2 }}>Prix variable</div>
              </div>
            </div>
            {COMPARE.map(([a, b], i) => (
              <div key={i} className="grid grid-cols-2" style={{ borderBottom: i < COMPARE.length - 1 ? '1px solid rgba(255,255,255,.05)' : 'none' }}>
                <div className="px-4 py-3 text-xs leading-snug" style={{ color: '#F5F1E8', borderRight: '1px solid rgba(255,255,255,.05)', background: 'rgba(255,65,3,.03)' }}>{a}</div>
                <div className="px-4 py-3 text-xs leading-snug" style={{ color: 'rgba(245,241,232,.38)' }}>{b}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews */}
        <div className="pt-6" style={{ animation: 'fade-up .38s ease both 240ms' }}>
          <div className="px-5 mb-4">
            <SectionLabel>Avis clients</SectionLabel>
          </div>
          <div className="flex gap-3 overflow-x-auto px-5 pb-2" style={{ scrollbarWidth: 'none' }}>
            {REVIEWS.map((r, i) => (
              <div
                key={r.name}
                className="flex-shrink-0 rounded-2xl p-4 flex flex-col gap-3"
                style={{
                  width: 240,
                  background: 'linear-gradient(145deg, #002535 0%, #001a28 100%)',
                  boxShadow: '4px 4px 16px rgba(0,0,0,.55), -2px -2px 6px rgba(255,255,255,.02)',
                  border: '1px solid rgba(255,255,255,.06)',
                  animation: `fade-up .38s ease both ${300 + i * 60}ms`,
                }}
              >
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(s => (
                    <svg key={s} width="11" height="11" viewBox="0 0 24 24" fill="#ff4103">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  ))}
                </div>
                <p style={{ fontSize: 12, color: 'rgba(245,241,232,.55)', lineHeight: 1.55 }}>{r.text}</p>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(255,65,3,.15)', border: '1px solid rgba(255,65,3,.3)' }}>
                    <span className="text-[10px] font-bold" style={{ color: '#ff4103' }}>{r.init}</span>
                  </div>
                  <div>
                    <div className="text-xs font-semibold" style={{ color: '#F5F1E8' }}>{r.name}</div>
                    <div className="font-mono" style={{ fontSize: 9, color: 'rgba(245,241,232,.35)' }}>{r.route}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky footer */}
      <div
        className="flex-shrink-0 px-5 pt-3 flex flex-col gap-2 relative z-10"
        style={{
          paddingBottom:  'calc(var(--safe-bot) + 12px)',
          borderTop:      '1px solid rgba(255,255,255,.07)',
          background:     'rgba(0,22,33,.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        <button
          onClick={onReserve}
          className="cta-glow w-full py-4 rounded-2xl font-bold text-[15px] tracking-wide text-white cursor-pointer active:scale-[.97] transition-transform duration-150 select-none relative overflow-hidden"
        >
          <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px pointer-events-none"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.3), transparent)' }} />
          Réserver ma course
        </button>
        <a
          href={WA_MAD}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer active:scale-[.98] transition-transform select-none"
          style={{
            background: 'rgba(37,211,102,.08)',
            border: '1px solid rgba(37,211,102,.25)',
            color: '#25d366',
            textDecoration: 'none',
          }}
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Demander mon estimation
        </a>
      </div>
    </div>
  )
}
