const MAD_WA = encodeURIComponent(
  '*DEMANDE DE DEVIS — MISE À DISPOSITION*\n\nBonjour Nourdine,\n\nJe souhaite réserver votre service de mise à disposition :\n\n📅 Date : \n🕒 Horaires : \n⏱️ Durée estimée : \n📍 Point de départ : \n🎯 Type de prestation : (Business / Mariage / Tourisme / Autre)\n👥 Nombre de passagers : \n\nMerci de me confirmer votre disponibilité et le tarif final.',
)

const MAD_PLANS = [
  { name: "À l'heure",     duration: 'Min. 3h',      price: '65',  rate: 'par heure'  },
  { name: 'Demi-journée',  duration: '4 heures',     price: '240', rate: 'soit 60€/h' },
  { name: 'Journée',       duration: '8 heures',     price: '450', rate: 'soit 56€/h', featured: true },
  { name: 'Soirée',        duration: '18h – minuit', price: '320', rate: '6 heures'   },
]

const REVIEWS = [
  {
    initials: 'SM', name: 'Sophie M.', route: 'CDG → Paris 8e · Avril 2026',
    text: '"Chauffeur ponctuel, véhicule impeccable, tarif honoré sans discussion. Le service premium sans l\'attente des applications."',
  },
  {
    initials: 'TR', name: 'Thomas R.', route: 'Ris-Orangis → La Défense · Mars 2026',
    text: '"Réservation via WhatsApp, confirmation rapide et devis garanti. Ponctuel, discret, professionnel."',
  },
  {
    initials: 'AK', name: 'Amina K.', route: 'Orly → Versailles · Fév. 2026',
    text: '"Service courtois, conduite souple, sièges confortables. Une vraie alternative premium aux grandes plateformes."',
  },
]

const TABLE_ROWS = [
  ['Prix annoncé avant de monter',      'Estimatif, peut augmenter en route'],
  ['Aucune commission cachée',          'Surge pricing aux heures de pointe'],
  ['Confirmation WhatsApp immédiate',   'Attribution aléatoire du chauffeur'],
  ['Chauffeur VTC dédié, certifié',     'Profil variable selon disponibilité'],
]

export default function TarifsView({ open, onClose, onReserve }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Tarifs et services"
      aria-hidden={!open}
      className="fixed inset-0 z-[80] bg-bg-base flex flex-col will-change-transform"
      style={{
        transform:  open ? 'translateX(0)' : 'translateX(100%)',
        visibility: open ? 'visible' : 'hidden',
        transition: open
          ? 'transform .34s cubic-bezier(.16,1,.3,1), visibility 0s linear 0s'
          : 'transform .34s cubic-bezier(.16,1,.3,1), visibility 0s linear .34s',
      }}
    >
      {/* Sticky header */}
      <div
        className="flex-shrink-0 bg-bg-base/95 backdrop-blur-sm border-b border-[var(--rule)] px-5 flex items-center gap-3"
        style={{ paddingTop: 'calc(var(--safe-top) + 14px)', paddingBottom: '14px' }}
      >
        <button
          onClick={onClose}
          aria-label="Retour"
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-bg-elevated border border-[var(--rule-strong)] cursor-pointer active:scale-95 transition-transform"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <div>
          <div className="font-brand font-bold text-ink-primary text-sm tracking-wider">Tarifs &amp; Services</div>
          <div className="font-mono text-[10px] text-ink-muted tracking-widest uppercase">I&amp;N RUN · Prix fixes garantis</div>
        </div>
      </div>

      {/* Scrollable body */}
      <div
        className="flex-1 overflow-y-auto overscroll-contain"
        style={{ paddingBottom: 'calc(var(--safe-bot) + 90px)' }}
      >
        {/* ── Proof bar ── */}
        <div className="px-5 pt-5 pb-1">
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {[
              { top: <>5<sup className="text-[9px]">/5</sup></>, bot: 'Excellence' },
              { top: <>2<sup className="text-[9px]">min</sup></>, bot: 'Confirm.' },
              {
                top: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff4103" strokeWidth="1.8" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
                bot: 'EVTC',
              },
              {
                top: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="1.8" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
                bot: 'RC Pro',
              },
              {
                top: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff4103" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
                bot: 'Avance',
              },
            ].map((item, i) => (
              <div key={i} className="flex-shrink-0 flex flex-col items-center gap-1 bg-bg-elevated rounded-2xl px-4 py-3 border border-[var(--rule)]">
                <span className="font-brand font-bold text-ink-primary text-lg leading-none flex items-baseline gap-0.5">{item.top}</span>
                <span className="font-mono text-[9px] text-ink-muted tracking-widest uppercase">{item.bot}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── How it works ── */}
        <section className="px-5 pt-6 pb-4">
          <div className="font-mono text-[10px] text-accent tracking-widest uppercase mb-2">En 3 étapes</div>
          <h2 className="font-brand text-2xl font-bold text-ink-primary mb-1">Un service sans mauvaise surprise.</h2>
          <p className="text-sm text-ink-muted mb-5">De la réservation à l'arrivée, vous savez exactement à quoi vous attendre.</p>
          <div className="flex flex-col gap-4">
            {[
              { num: '1', title: 'Saisissez votre trajet',   desc: 'Départ, destination, date. Sans compte à créer.',            badge: '30 secondes'      },
              { num: '2', title: 'Votre tarif fixe s\'affiche', desc: 'Calculé en temps réel, sans commission. Ce que vous voyez est ce que vous payez.', badge: 'Prix garanti' },
              { num: '3', title: 'Chauffeur à l\'heure convenue', desc: 'Confirmation WhatsApp en moins de 2 minutes. Chauffeur certifié VTC.', badge: '< 2 min' },
            ].map((step) => (
              <div key={step.num} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center">
                  <span className="font-bold text-accent text-sm">{step.num}</span>
                </div>
                <div className="flex-1 pt-1">
                  <div className="text-ink-primary font-semibold text-sm mb-0.5">{step.title}</div>
                  <div className="text-ink-muted text-xs mb-2 leading-relaxed">{step.desc}</div>
                  <span className="inline-block font-mono text-[10px] text-accent bg-accent/10 border border-accent/20 rounded-full px-2.5 py-0.5">{step.badge}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Tarif comparison table ── */}
        <section className="px-5 pt-2 pb-4">
          <div className="font-mono text-[10px] text-accent tracking-widest uppercase mb-2">Tarification</div>
          <h2 className="font-brand text-2xl font-bold text-ink-primary mb-4">
            Tarif fixe contre<br /><span className="text-accent">prix variable.</span>
          </h2>
          <div className="rounded-2xl border border-[var(--rule-strong)] overflow-hidden">
            <div className="grid grid-cols-2">
              <div className="bg-accent/10 border-b border-r border-accent/20 px-4 py-3">
                <div className="text-accent text-xs font-semibold">I&amp;N RUN · Tarif fixe</div>
                <div className="text-ink-muted text-[10px] mt-0.5">Prix connu avant de partir</div>
              </div>
              <div className="border-b border-[var(--rule)] px-4 py-3">
                <div className="text-ink-secondary text-xs font-semibold">Applications classiques</div>
                <div className="text-ink-muted text-[10px] mt-0.5">Prix estimatif, variable</div>
              </div>
            </div>
            {TABLE_ROWS.map(([a, b], i) => (
              <div key={i} className="grid grid-cols-2 border-b border-[var(--rule)] last:border-0">
                <div className="border-r border-[var(--rule)] px-4 py-3 text-xs text-ink-primary bg-accent/[.03] leading-snug">{a}</div>
                <div className="px-4 py-3 text-xs text-ink-muted leading-snug">{b}</div>
              </div>
            ))}
          </div>
          <p className="text-center font-mono text-[9px] text-ink-muted mt-3 leading-relaxed">
            Calculez votre tarif · Confirmé par WhatsApp · Garanti sans surprise
          </p>
        </section>

        {/* ── MAD — Mise à disposition ── */}
        <section className="px-5 pt-2 pb-4">
          <div className="font-mono text-[10px] text-accent tracking-widest uppercase mb-2">Service Premium</div>
          <h2 className="font-brand text-2xl font-bold text-ink-primary mb-1">Mise à disposition</h2>
          <p className="text-sm text-ink-muted mb-1">Chauffeur privé à l'heure ou à la journée</p>
          <p className="text-xs text-ink-secondary mb-4 leading-relaxed">
            Pour vos <strong className="text-ink-primary">rendez-vous business</strong>,{' '}
            <strong className="text-ink-primary">mariages</strong>,{' '}
            <strong className="text-ink-primary">visites touristiques</strong> ou{' '}
            <strong className="text-ink-primary">journées VIP</strong>.
          </p>

          <div className="flex gap-2 flex-wrap mb-4">
            {['Sans km limités', 'Attentes incluses', 'Discrétion absolue', 'Tenue élégante'].map(f => (
              <span key={f} className="font-mono text-[10px] text-ink-secondary bg-bg-elevated border border-[var(--rule-strong)] rounded-full px-3 py-1">{f}</span>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {MAD_PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-4 ${
                  plan.featured ? 'border-accent/40 bg-accent/[.06]' : 'border-[var(--rule-strong)] bg-bg-elevated'
                }`}
              >
                {plan.featured && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 font-mono text-[9px] text-white bg-accent rounded-full px-2.5 py-0.5 whitespace-nowrap">
                    Populaire
                  </span>
                )}
                <div className="font-mono text-[9px] text-ink-muted tracking-widest uppercase mb-1">Formule</div>
                <div className="font-semibold text-ink-primary text-sm mb-0.5">{plan.name}</div>
                <div className="font-mono text-[10px] text-ink-muted mb-2">{plan.duration}</div>
                <div className="font-brand text-2xl font-bold text-accent leading-none">
                  {plan.price}<span className="text-base font-bold">€</span>
                </div>
                <div className="font-mono text-[10px] text-ink-muted mt-0.5">{plan.rate}</div>
              </div>
            ))}
          </div>

          <p className="font-mono text-[9px] text-ink-muted text-center mb-4">
            Tarifs TTC · Sans frais cachés · TVA non applicable, art. 293 B du CGI
          </p>

          <a
            href={`https://wa.me/33767742220?text=${MAD_WA}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl text-sm font-semibold transition-colors cursor-pointer active:scale-[.98] select-none"
            style={{
              background: 'rgba(37,211,102,.08)',
              border:     '1px solid rgba(37,211,102,.25)',
              color:      '#25d366',
            }}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Réserver mon chauffeur à l'heure
          </a>
        </section>

        {/* ── Reviews ── */}
        <section className="px-5 pt-2 pb-4">
          <div className="font-mono text-[10px] text-accent tracking-widest uppercase mb-4">Paroles de clients</div>
          <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
            {REVIEWS.map((r) => (
              <div key={r.name} className="flex-shrink-0 w-72 bg-bg-elevated rounded-2xl border border-[var(--rule-strong)] p-4">
                <div className="text-accent text-sm mb-2" aria-label="5 étoiles sur 5">★★★★★</div>
                <p className="text-xs text-ink-secondary leading-relaxed mb-3">{r.text}</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center">
                    <span className="text-accent text-[10px] font-bold">{r.initials}</span>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-ink-primary">{r.name}</div>
                    <div className="font-mono text-[9px] text-ink-muted">{r.route}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="px-5 pt-4 pb-4 text-center border-t border-[var(--rule)]">
          <div className="font-brand font-bold text-ink-primary text-xl mb-1">I&amp;N RUN</div>
          <div className="text-xs text-ink-muted mb-3">Chauffeur privé · Paris &amp; Île-de-France</div>
          <div className="flex items-center justify-center gap-3 mb-3 flex-wrap">
            <a href="mailto:contact.inrun@gmail.com" className="font-mono text-[11px] text-ink-muted">contact.inrun@gmail.com</a>
            <span className="text-ink-muted">·</span>
            <a href="tel:+33767742220" className="font-mono text-[11px] text-ink-muted">07 67 74 22 20</a>
          </div>
          <p className="font-mono text-[9px] text-ink-muted leading-loose">
            © 2026 I&amp;N RUN · SIREN 993 776 467 · SIRET 993 776 467 00017<br />
            Entreprise de transport public routier de personnes · Carte pro VTC
          </p>
        </footer>
      </div>

      {/* ── Sticky reserve CTA ── */}
      <div
        className="flex-shrink-0 px-5 pt-4 border-t border-[var(--rule)] bg-bg-base"
        style={{ paddingBottom: 'calc(var(--safe-bot) + 16px)' }}
      >
        <button
          onClick={onReserve}
          className="w-full py-4 rounded-[22px] font-bold text-white text-sm tracking-wide uppercase cursor-pointer active:scale-[.97] transition-transform duration-150"
          style={{
            background:  '#ff4103',
            boxShadow:   '0 0 24px rgba(255,65,3,0.35), 0 4px 16px rgba(0,0,0,.4)',
          }}
        >
          Réserver ma course
        </button>
      </div>
    </div>
  )
}
