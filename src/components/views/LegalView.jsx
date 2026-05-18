export default function LegalView({ open, onClose }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Mentions légales"
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
        style={{
          paddingTop: 'calc(var(--safe-top) + 18px)',
          paddingBottom: 16,
          borderBottom: '1px solid rgba(245,241,232,.07)',
        }}
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
        <h1 className="text-[17px] font-bold" style={{ color: '#F5F1E8' }}>Mentions légales</h1>
      </div>

      <div
        className="flex-1 overflow-y-auto px-5 py-6"
        style={{ paddingBottom: 'calc(var(--safe-bot) + 32px)' }}
      >
        <LegalSection title="Éditeur">
          <LegalRow label="Société">I&N RUN — Entreprise individuelle</LegalRow>
          <LegalRow label="SIRET">En cours d'immatriculation</LegalRow>
          <LegalRow label="Activité">Transport de voyageurs — VTC (Voiture de Tourisme avec Chauffeur)</LegalRow>
          <LegalRow label="Carte professionnelle">Délivrée par la préfecture d'Île-de-France</LegalRow>
          <LegalRow label="Responsable">Nourdine — Dirigeant</LegalRow>
          <LegalRow label="Contact">+33 7 67 74 22 20</LegalRow>
          <LegalRow label="Email">contact@inrun.fr</LegalRow>
        </LegalSection>

        <LegalSection title="Hébergement">
          <LegalRow label="Service">GitHub Pages</LegalRow>
          <LegalRow label="Exploitant">GitHub, Inc. · 88 Colin P Kelly Jr St · San Francisco, CA 94107 · USA</LegalRow>
        </LegalSection>

        <LegalSection title="Données personnelles (RGPD)">
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(245,241,232,.5)' }}>
            Les informations collectées lors d'une réservation (prénom, email, adresses) sont utilisées uniquement pour traiter votre course. Elles ne sont ni vendues ni transmises à des tiers. Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Exercez ce droit à l'adresse : contact@inrun.fr.
          </p>
        </LegalSection>

        <LegalSection title="Cookies">
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(245,241,232,.5)' }}>
            Cette application utilise le stockage local (localStorage) pour mémoriser vos préférences (ambiance, climatisation, mode sombre). Aucun cookie de tracking tiers n'est utilisé.
          </p>
        </LegalSection>

        <LegalSection title="Responsabilité">
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(245,241,232,.5)' }}>
            I&N RUN s'engage à fournir des informations aussi précises que possible. Les tarifs sont donnés à titre indicatif et peuvent varier en fonction des conditions de circulation. I&N RUN ne peut être tenu responsable des imprécisions de l'itinéraire fourni par les services de cartographie tiers (OpenStreetMap, OSRM).
          </p>
        </LegalSection>

        <LegalSection title="Propriété intellectuelle">
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(245,241,232,.5)' }}>
            L'ensemble des éléments graphiques, textuels et fonctionnels de cette application est la propriété exclusive de I&N RUN. Toute reproduction, même partielle, est interdite sans autorisation écrite préalable.
          </p>
        </LegalSection>

        <p className="text-xs mt-8 text-center" style={{ color: 'rgba(245,241,232,.2)' }}>
          Mise à jour : mai 2026 · I&N RUN © 2026
        </p>
      </div>
    </div>
  )
}

function LegalSection({ title, children }) {
  return (
    <div className="mb-6">
      <h2
        className="text-xs font-bold uppercase tracking-widest mb-3"
        style={{ color: '#ff4103' }}
      >
        {title}
      </h2>
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(245,241,232,.03)',
          border: '1px solid rgba(245,241,232,.08)',
        }}
      >
        <div className="px-4 py-4 flex flex-col gap-0">
          {children}
        </div>
      </div>
    </div>
  )
}

function LegalRow({ label, children }) {
  return (
    <div className="flex flex-col gap-0.5 py-2" style={{ borderBottom: '1px solid rgba(245,241,232,.05)' }}>
      <span className="text-xs font-medium" style={{ color: 'rgba(245,241,232,.35)' }}>{label}</span>
      <span className="text-sm" style={{ color: 'rgba(245,241,232,.72)' }}>{children}</span>
    </div>
  )
}
