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

export default function TarifsView({ open, onClose, onReserve }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Tarifs et services"
      aria-hidden={!open}
      className="fixed inset-0 z-[80] flex flex-col will-change-transform"
      style={{
        background:  '#001621',
        transform:   open ? 'translateX(0)' : 'translateX(100%)',
        visibility:  open ? 'visible' : 'hidden',
        pointerEvents: open ? 'auto' : 'none',
        transition:  open
          ? 'transform .34s cubic-bezier(.16,1,.3,1), visibility 0s linear 0s'
          : 'transform .34s cubic-bezier(.16,1,.3,1), visibility 0s linear .34s',
      }}
    >
      {/* ── Header ── */}
      <div
        className="flex-shrink-0 flex items-center gap-3 px-4 border-b"
        style={{
          paddingTop:    'calc(var(--safe-top) + 14px)',
          paddingBottom: 14,
          borderColor:   'rgba(245,241,232,.08)',
          background:    'rgba(0,22,33,.95)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <button
          onClick={onClose}
          aria-label="Retour"
          className="w-9 h-9 flex items-center justify-center rounded-xl cursor-pointer active:scale-90 transition-transform flex-shrink-0"
          style={{ background: 'rgba(245,241,232,.07)', border: '1px solid rgba(245,241,232,.12)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(245,241,232,.8)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <span className="font-brand font-bold text-sm tracking-wider" style={{ color: '#F5F1E8' }}>
          Tarifs &amp; services
        </span>
      </div>

      {/* ── Scrollable body ── */}
      <div
        className="flex-1 overflow-y-auto overscroll-contain"
        style={{ paddingBottom: 'calc(var(--safe-bot) + 100px)' }}
      >

        {/* ── Hero card ── */}
        <div className="px-4 pt-5 pb-2">
          <div
            className="relative rounded-2xl overflow-hidden p-5"
            style={{
              background:  'linear-gradient(135deg, #001e30 0%, #002840 60%, #001e30 100%)',
              border:      '1px solid rgba(255,65,3,.3)',
              borderTop:   '3px solid #ff4103',
              boxShadow:   '0 4px 32px rgba(255,65,3,.08)',
            }}
          >
            {/* Glow blob */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute', top: 0, right: 0,
                width: 160, height: 160,
                background: 'radial-gradient(circle, rgba(255,65,3,.12) 0%, transparent 70%)',
                borderRadius: '50%',
                transform: 'translate(30%, -30%)',
                pointerEvents: 'none',
              }}
            />

            {/* Badge */}
            <span
              className="inline-block font-mono text-[10px] font-semibold tracking-widest uppercase mb-3 px-3 py-1 rounded-full"
              style={{ background: 'rgba(255,65,3,.18)', color: '#ff4103', border: '1px solid rgba(255,65,3,.35)' }}
            >
              Tarifs
            </span>

            {/* Headline */}
            <h1
              className="font-brand font-bold leading-snug mb-2"
              style={{ fontSize: 'clamp(1.2rem, 5vw, 1.5rem)', color: '#F5F1E8' }}
            >
              Réservez avec une<br />estimation connue<br />à l'avance
            </h1>

            {/* Subtitle */}
            <p style={{ fontSize: 13, color: 'rgba(245,241,232,.5)', lineHeight: 1.5 }}>
              Aéroports, longue distance et mise à disposition
            </p>

            {/* Stats row */}
            <div className="flex items-center gap-4 mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,65,3,.15)' }}>
              {[
                { val: '5/5',   lab: 'Excellence' },
                { val: '2 min', lab: 'Confirmation' },
                { val: 'EVTC',  lab: 'Certifié' },
              ].map(s => (
                <div key={s.lab} className="flex flex-col items-center gap-0.5">
                  <span className="font-brand font-bold text-sm" style={{ color: '#ff4103' }}>{s.val}</span>
                  <span className="font-mono text-[9px] tracking-widest uppercase" style={{ color: 'rgba(245,241,232,.4)' }}>{s.lab}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Trajets fixes ── */}
        <section className="px-4 pt-5 pb-2">
          <p className="font-mono text-[10px] tracking-widest uppercase mb-3" style={{ color: 'rgba(245,241,232,.4)' }}>
            Trajets fixes
          </p>
          <div className="grid grid-cols-2 gap-3">
            {TRAJETS.map((t) => (
              <div
                key={t.title}
                className="rounded-2xl p-4 flex flex-col gap-2"
                style={{
                  background: 'rgba(0,32,48,.7)',
                  border:     '1px solid rgba(245,241,232,.09)',
                }}
              >
                <span>{t.icon}</span>
                <div>
                  <div className="font-semibold text-sm leading-tight mb-0.5" style={{ color: '#F5F1E8' }}>{t.title}</div>
                  <div className="font-mono text-[10px]" style={{ color: 'rgba(245,241,232,.45)' }}>{t.subtitle}</div>
                </div>
                <div style={{ fontSize: 11, color: 'rgba(245,241,232,.35)', lineHeight: 1.4 }}>{t.detail}</div>
                <div className="font-brand font-bold text-base mt-auto" style={{ color: '#ff4103' }}>{t.price}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Mise à disposition ── */}
        <section className="px-4 pt-5 pb-2">
          <p className="font-mono text-[10px] tracking-widest uppercase mb-1" style={{ color: 'rgba(245,241,232,.4)' }}>
            Mise à disposition
          </p>
          <p className="text-sm font-semibold mb-4" style={{ color: '#F5F1E8' }}>
            Un chauffeur dédié, selon votre rythme
          </p>

          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: '1px solid rgba(245,241,232,.09)', background: 'rgba(0,28,42,.6)' }}
          >
            {MAD_ROWS.map((row, i) => (
              <div
                key={row.duration}
                className="flex items-center justify-between px-4 py-4"
                style={{
                  borderBottom: i < MAD_ROWS.length - 1 ? '1px solid rgba(245,241,232,.07)' : 'none',
                  background: row.highlight ? 'rgba(255,65,3,.07)' : 'transparent',
                }}
              >
                <div className="flex flex-col gap-0.5">
                  <span
                    className="font-semibold text-sm"
                    style={{ color: row.highlight ? '#ff4103' : '#F5F1E8' }}
                  >
                    {row.duration}
                  </span>
                  <span style={{ fontSize: 11, color: 'rgba(245,241,232,.38)' }}>{row.note}</span>
                </div>
                <span
                  className="font-brand font-bold text-base"
                  style={{ color: row.highlight ? '#ff4103' : '#F5F1E8' }}
                >
                  {row.price}
                </span>
              </div>
            ))}
          </div>

          <p
            className="font-mono text-center mt-3"
            style={{ fontSize: 10, color: 'rgba(245,241,232,.28)' }}
          >
            Tarifs TTC · Sans frais cachés · Attentes incluses
          </p>
        </section>

        {/* ── Comparison table snippet ── */}
        <section className="px-4 pt-4 pb-2">
          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: '1px solid rgba(245,241,232,.09)' }}
          >
            <div className="grid grid-cols-2">
              <div
                className="px-4 py-3"
                style={{ background: 'rgba(255,65,3,.08)', borderRight: '1px solid rgba(255,65,3,.15)', borderBottom: '1px solid rgba(245,241,232,.07)' }}
              >
                <div className="text-xs font-semibold" style={{ color: '#ff4103' }}>I&amp;N RUN</div>
                <div style={{ fontSize: 10, color: 'rgba(245,241,232,.38)', marginTop: 2 }}>Prix fixe garanti</div>
              </div>
              <div
                className="px-4 py-3"
                style={{ borderBottom: '1px solid rgba(245,241,232,.07)' }}
              >
                <div className="text-xs font-semibold" style={{ color: 'rgba(245,241,232,.5)' }}>Applications</div>
                <div style={{ fontSize: 10, color: 'rgba(245,241,232,.3)', marginTop: 2 }}>Prix variable</div>
              </div>
            </div>
            {[
              ['Prix annoncé avant départ',  'Estimatif, peut augmenter'],
              ['Aucune commission cachée',   'Surge pricing possible'],
              ['Confirmation WhatsApp 2 min', 'Attribution aléatoire'],
            ].map(([a, b], i, arr) => (
              <div key={i} className="grid grid-cols-2" style={{ borderBottom: i < arr.length - 1 ? '1px solid rgba(245,241,232,.07)' : 'none' }}>
                <div
                  className="px-4 py-3 text-xs leading-snug"
                  style={{ color: '#F5F1E8', borderRight: '1px solid rgba(245,241,232,.07)', background: 'rgba(255,65,3,.03)' }}
                >
                  {a}
                </div>
                <div
                  className="px-4 py-3 text-xs leading-snug"
                  style={{ color: 'rgba(245,241,232,.38)' }}
                >
                  {b}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Avis clients ── */}
        <section className="px-4 pt-5 pb-2">
          <p className="font-mono text-[10px] tracking-widest uppercase mb-3" style={{ color: 'rgba(245,241,232,.4)' }}>
            Avis clients
          </p>
          <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {[
              { init: 'SM', name: 'Sophie M.', route: 'CDG → Paris 8e', text: 'Chauffeur ponctuel, tarif honoré sans discussion. Le service premium sans l\'attente des applis.' },
              { init: 'TR', name: 'Thomas R.', route: 'Ris-Orangis → La Défense', text: 'Réservation WhatsApp, confirmation rapide, devis garanti. Ponctuel, discret, professionnel.' },
              { init: 'AK', name: 'Amina K.', route: 'Orly → Versailles', text: 'Service courtois, conduite souple. Une vraie alternative premium aux grandes plateformes.' },
            ].map((r) => (
              <div
                key={r.name}
                className="flex-shrink-0 rounded-2xl p-4"
                style={{
                  width: 240,
                  background: 'rgba(0,28,42,.6)',
                  border: '1px solid rgba(245,241,232,.09)',
                }}
              >
                <div className="text-sm mb-2" style={{ color: '#ff4103' }}>★★★★★</div>
                <p style={{ fontSize: 12, color: 'rgba(245,241,232,.55)', lineHeight: 1.55, marginBottom: 12 }}>{r.text}</p>
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(255,65,3,.15)', border: '1px solid rgba(255,65,3,.3)' }}
                  >
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
        </section>

      </div>

      {/* ── Sticky footer CTAs ── */}
      <div
        className="flex-shrink-0 px-4 pt-3 flex flex-col gap-2"
        style={{
          paddingBottom:  'calc(var(--safe-bot) + 12px)',
          borderTop:      '1px solid rgba(245,241,232,.08)',
          background:     'rgba(0,22,33,.97)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <button
          onClick={onReserve}
          className="w-full py-4 rounded-2xl font-bold text-sm tracking-wide uppercase text-white cursor-pointer active:scale-[.97] transition-transform duration-150 select-none"
          style={{
            background: '#ff4103',
            boxShadow:  '0 0 24px rgba(255,65,3,.35), 0 4px 16px rgba(0,0,0,.4)',
          }}
        >
          Réserver ma course
        </button>
        <a
          href={WA_MAD}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer active:scale-[.98] transition-transform duration-150 select-none"
          style={{
            background: 'rgba(37,211,102,.07)',
            border:     '1px solid rgba(37,211,102,.22)',
            color:      '#25d366',
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
