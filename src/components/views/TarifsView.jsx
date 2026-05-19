import useAppTheme from '../../hooks/useAppTheme'

const WA_MAD = `https://wa.me/33767742220?text=${encodeURIComponent('*DEMANDE DE DEVIS — MISE À DISPOSITION*\n\nBonjour Nourdine,\n\nJe souhaite réserver votre service de mise à disposition :\n\n📅 Date : \n🕒 Horaires : \n⏱️ Durée estimée : \n📍 Point de départ : \n🎯 Type de prestation : (Business / Mariage / Tourisme / Autre)\n👥 Nombre de passagers : \n\nMerci de me confirmer votre disponibilité et le tarif final.')}`

const ICON_STROKE_DARK  = 'rgba(245,241,232,.5)'
const ICON_STROKE_LIGHT = 'rgba(17,17,17,.45)'

function makeTrajets(iconStroke) {
  return [
    {
      title:    'Aéroports & gares',
      subtitle: 'CDG · Orly · Beauvais · Gares TGV',
      price:    'dès 45 €',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={iconStroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
        </svg>
      ),
    },
    {
      title:    'Longue distance',
      subtitle: 'Province · Côte d\'Azur · Genève',
      price:    'Sur devis',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={iconStroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      ),
    },
  ]
}

const MAD_ROWS = [
  { duration: '2 heures', note: 'Forfait court',   price: '80 €'      },
  { duration: '4 heures', note: 'Demi-journée',    price: '150 €'     },
  { duration: 'Journée',  note: '8h · Conseillé',  price: 'Sur devis' },
]

const REVIEWS = [
  { init: 'SM', name: 'Sophie M.', route: 'CDG → Paris 8e',            text: "Chauffeur ponctuel, tarif honoré sans discussion. Le service premium sans l'attente des applis." },
  { init: 'TR', name: 'Thomas R.', route: 'Ris-Orangis → La Défense',  text: 'Réservation WhatsApp, confirmation rapide, devis garanti. Ponctuel, discret, professionnel.' },
  { init: 'AK', name: 'Amina K.',  route: 'Orly → Versailles',         text: 'Service courtois, conduite souple. Une vraie alternative premium aux grandes plateformes.' },
]

const COMPARE = [
  'Prix annoncé avant le départ',
  'Aucune commission cachée',
  'Confirmation WhatsApp en 2 min',
  'Chauffeur unique & connu',
]

function SectionLabel({ children, th }) {
  return (
    <p
      className="text-[11px] font-semibold uppercase tracking-[.08em] mb-2.5 px-1"
      style={{ color: th.inkMuted }}
    >
      {children}
    </p>
  )
}

function CheckIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5"/>
    </svg>
  )
}

export default function TarifsView({ open, onClose, onReserve }) {
  const th = useAppTheme()
  const HAIRLINE = `1px solid ${th.divider}`
  const CARD = { background: th.bgCard, borderRadius: 16, border: `1px solid ${th.borderFaint}` }
  const TRAJETS = makeTrajets(th.isDark ? ICON_STROKE_DARK : ICON_STROKE_LIGHT)

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Tarifs et services"
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
        className="flex-shrink-0 flex items-center gap-3 px-5 relative z-10"
        style={{
          paddingTop:    'calc(var(--safe-top) + 16px)',
          paddingBottom: 14,
          background:    th.bgHeader,
          borderBottom:  `1px solid ${th.divider}`,
        }}
      >
        <button
          onClick={onClose}
          aria-label="Retour"
          className="w-9 h-9 flex items-center justify-center rounded-full cursor-pointer active:scale-90 transition-transform flex-shrink-0"
          style={{ background: th.bgCard, border: `1px solid ${th.border}` }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={th.inkHigh} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <div>
          <h1 className="text-[17px] font-bold" style={{ color: th.inkFull }}>Tarifs & services</h1>
          <p className="text-xs" style={{ color: th.inkMuted }}>Transparents · Sans surprise</p>
        </div>
      </div>

      {/* Body */}
      <div
        key={open}
        className="flex-1 overflow-y-auto overscroll-contain scrollbar-thin relative z-10"
        style={{ paddingBottom: 'calc(var(--safe-bot) + 120px)' }}
      >
        {/* Hero */}
        <section className="px-5 pt-6" style={{ animation: 'fade-up .38s ease both 0ms' }}>
          <div className="rounded-2xl p-5" style={CARD}>
            <h2 className="font-brand font-bold leading-snug mb-1.5" style={{ fontSize: 'clamp(1.15rem,4.8vw,1.4rem)', color: th.inkFull }}>
              Estimation connue avant chaque course
            </h2>
            <p style={{ fontSize: 13, color: th.inkMuted, lineHeight: 1.5 }}>
              Aéroports, longue distance et mise à disposition.
            </p>
            <div className="grid grid-cols-3 gap-2 mt-4 pt-4" style={{ borderTop: HAIRLINE }}>
              {[{ val: '5/5', lab: 'Excellence' }, { val: '2 min', lab: 'Réponse' }, { val: 'EVTC', lab: 'Certifié' }].map(s => (
                <div key={s.lab} className="flex flex-col gap-1">
                  <span className="font-brand font-bold text-[15px]" style={{ color: th.inkFull }}>{s.val}</span>
                  <span className="text-[10px] uppercase tracking-wider" style={{ color: th.inkDim }}>{s.lab}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trajets fixes */}
        <section className="px-5 pt-7" style={{ animation: 'fade-up .38s ease both 60ms' }}>
          <SectionLabel th={th}>Trajets fixes</SectionLabel>
          <div className="overflow-hidden" style={CARD}>
            {TRAJETS.map((t, i) => (
              <div
                key={t.title}
                className="flex items-center gap-3.5 px-4 py-4"
                style={{ borderBottom: i < TRAJETS.length - 1 ? HAIRLINE : 'none' }}
              >
                <span className="flex-shrink-0">{t.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm leading-tight" style={{ color: th.inkFull }}>{t.title}</div>
                  <div className="text-xs mt-0.5 truncate" style={{ color: th.inkMuted }}>{t.subtitle}</div>
                </div>
                <span className="font-brand font-bold text-[15px] whitespace-nowrap" style={{ color: '#ff4103' }}>{t.price}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Mise à disposition */}
        <section className="px-5 pt-7" style={{ animation: 'fade-up .38s ease both 120ms' }}>
          <SectionLabel th={th}>Mise à disposition</SectionLabel>
          <div className="overflow-hidden" style={CARD}>
            {MAD_ROWS.map((row, i) => (
              <div
                key={row.duration}
                className="flex items-center justify-between px-4 py-4"
                style={{ borderBottom: i < MAD_ROWS.length - 1 ? HAIRLINE : 'none' }}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold text-sm" style={{ color: th.inkFull }}>{row.duration}</span>
                  <span className="text-[11px]" style={{ color: th.inkMuted }}>{row.note}</span>
                </div>
                <span className="font-brand font-bold text-[15px]" style={{ color: '#ff4103' }}>{row.price}</span>
              </div>
            ))}
          </div>
          <p className="text-center mt-2.5 px-1" style={{ fontSize: 11, color: th.inkDim }}>
            Tarifs TTC · Sans frais cachés · Attentes incluses
          </p>
        </section>

        {/* Pourquoi I&N RUN */}
        <section className="px-5 pt-7" style={{ animation: 'fade-up .38s ease both 180ms' }}>
          <SectionLabel th={th}>Pourquoi I&N RUN</SectionLabel>
          <div className="overflow-hidden" style={CARD}>
            {COMPARE.map((adv, i) => (
              <div
                key={adv}
                className="flex items-center gap-3 px-4 py-3.5"
                style={{ borderBottom: i < COMPARE.length - 1 ? HAIRLINE : 'none' }}
              >
                <span className="flex-shrink-0"><CheckIcon /></span>
                <span className="text-sm" style={{ color: th.inkHigh }}>{adv}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Avis clients */}
        <section className="pt-7" style={{ animation: 'fade-up .38s ease both 240ms' }}>
          <div className="px-5">
            <SectionLabel th={th}>Avis clients</SectionLabel>
          </div>
          <div className="flex gap-3 overflow-x-auto px-5 pb-2" style={{ scrollbarWidth: 'none' }}>
            {REVIEWS.map((r) => (
              <div
                key={r.name}
                className="flex-shrink-0 rounded-2xl p-4 flex flex-col gap-3"
                style={{ width: 244, ...CARD }}
              >
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(s => (
                    <svg key={s} width="11" height="11" viewBox="0 0 24 24" fill={th.inkLow}>
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  ))}
                </div>
                <p style={{ fontSize: 12, color: th.inkLow, lineHeight: 1.55 }}>{r.text}</p>
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: th.bgAvatar }}
                  >
                    <span className="text-[10px] font-bold" style={{ color: th.inkMid }}>{r.init}</span>
                  </div>
                  <div>
                    <div className="text-xs font-semibold" style={{ color: th.inkFull }}>{r.name}</div>
                    <div style={{ fontSize: 10, color: th.inkDim }}>{r.route}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Sticky footer */}
      <div
        className="flex-shrink-0 px-5 pt-3 flex flex-col gap-2 relative z-10"
        style={{
          paddingBottom:  'calc(var(--safe-bot) + 12px)',
          borderTop:      `1px solid ${th.divider}`,
          background:     th.bgGrouped,
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
          className="w-full py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2.5 cursor-pointer active:scale-[.98] transition-transform select-none"
          style={{
            background:     th.bgCard,
            border:         `1px solid ${th.border}`,
            color:          th.inkHigh,
            textDecoration: 'none',
          }}
        >
          <svg viewBox="0 0 24 24" width="15" height="15" fill="#25d366">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Demander mon estimation
        </a>
      </div>
    </div>
  )
}
