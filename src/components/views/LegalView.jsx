import { motion } from 'framer-motion'

const sectionVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.16, 1, 0.3, 1], delay: i * 0.055 } }),
}

export default function LegalView({ open, onClose }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Mentions légales"
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
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 40% at 50% 0%, rgba(255,65,3,.07), transparent 65%)' }} />

      {/* Header */}
      <div
        className="flex items-center gap-4 px-5 flex-shrink-0 relative z-10"
        style={{
          paddingTop: 'calc(var(--safe-top) + 16px)',
          paddingBottom: 14,
          background: 'rgba(0,26,40,.65)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,.07)',
        }}
      >
        <button onClick={onClose} aria-label="Retour"
          className="w-9 h-9 flex items-center justify-center rounded-full cursor-pointer active:scale-90 transition-transform"
          style={{ background: 'linear-gradient(145deg, #002535, #001a28)', boxShadow: '3px 3px 10px rgba(0,0,0,.5), -1px -1px 4px rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(245,241,232,.8)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <div>
          <h1 className="text-[17px] font-bold" style={{ color: '#F5F1E8' }}>Mentions légales</h1>
          <p className="text-xs" style={{ color: 'rgba(245,241,232,.38)' }}>Informations réglementaires</p>
        </div>
      </div>

      <div
        key={open}
        className="flex-1 overflow-y-auto px-5 scrollbar-thin relative z-10"
        style={{ paddingBottom: 'calc(var(--safe-bot) + 32px)' }}
      >
        <div className="flex flex-col gap-5 pt-4">

          <LegalSection title="Éditeur" index={0} open={open} variants={sectionVariants}>
            <LegalRow label="Société">I&N RUN — Entreprise individuelle</LegalRow>
            <LegalRow label="SIRET">En cours d'immatriculation</LegalRow>
            <LegalRow label="Activité">Transport de voyageurs — VTC</LegalRow>
            <LegalRow label="Carte professionnelle">Délivrée par la préfecture d'Île-de-France</LegalRow>
            <LegalRow label="Responsable" last={false}>Nourdine — Dirigeant</LegalRow>
            <LegalRow label="Téléphone" last={false}>+33 7 67 74 22 20</LegalRow>
            <LegalRow label="Email" last>contact@inrun.fr</LegalRow>
          </LegalSection>

          <LegalSection title="Hébergement" index={1} open={open} variants={sectionVariants}>
            <LegalRow label="Service">GitHub Pages</LegalRow>
            <LegalRow label="Exploitant" last>GitHub, Inc. · 88 Colin P Kelly Jr St · San Francisco, CA 94107 · USA</LegalRow>
          </LegalSection>

          <LegalSection title="Données personnelles (RGPD)" index={2} open={open} variants={sectionVariants}>
            <p className="text-sm leading-relaxed py-1" style={{ color: 'rgba(245,241,232,.52)' }}>
              Les informations collectées lors d'une réservation (prénom, email, adresses) sont utilisées uniquement pour traiter votre course. Elles ne sont ni vendues ni transmises à des tiers. Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données en écrivant à : contact@inrun.fr.
            </p>
          </LegalSection>

          <LegalSection title="Cookies & stockage local" index={3} open={open} variants={sectionVariants}>
            <p className="text-sm leading-relaxed py-1" style={{ color: 'rgba(245,241,232,.52)' }}>
              Cette application utilise le stockage local (localStorage) pour mémoriser vos préférences (ambiance, climatisation, mode sombre). Aucun cookie de tracking tiers n'est utilisé.
            </p>
          </LegalSection>

          <LegalSection title="Responsabilité" index={4} open={open} variants={sectionVariants}>
            <p className="text-sm leading-relaxed py-1" style={{ color: 'rgba(245,241,232,.52)' }}>
              I&N RUN s'engage à fournir des informations aussi précises que possible. Les tarifs sont donnés à titre indicatif. I&N RUN ne peut être tenu responsable des imprécisions de l'itinéraire fourni par les services de cartographie tiers (OpenStreetMap, OSRM).
            </p>
          </LegalSection>

          <LegalSection title="Propriété intellectuelle" index={5} open={open} variants={sectionVariants}>
            <p className="text-sm leading-relaxed py-1" style={{ color: 'rgba(245,241,232,.52)' }}>
              L'ensemble des éléments graphiques, textuels et fonctionnels de cette application est la propriété exclusive de I&N RUN. Toute reproduction, même partielle, est interdite sans autorisation écrite préalable.
            </p>
          </LegalSection>

          <motion.p
            custom={6}
            variants={sectionVariants}
            initial="hidden"
            animate={open ? 'visible' : 'hidden'}
            className="text-xs text-center pb-2"
            style={{ color: 'rgba(245,241,232,.18)' }}
          >
            Mise à jour : mai 2026 · I&N RUN © 2026
          </motion.p>

        </div>
      </div>
    </div>
  )
}

function LegalSection({ title, children, index, open, variants }) {
  return (
    <motion.div
      custom={index}
      variants={variants}
      initial="hidden"
      animate={open ? 'visible' : 'hidden'}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] font-bold uppercase tracking-[.12em]" style={{ color: 'rgba(255,65,3,.7)' }}>
          {title}
        </span>
        <div className="flex-1 h-px" style={{ background: 'rgba(255,65,3,.15)' }} />
      </div>
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #002535 0%, #001a28 100%)',
          boxShadow: '4px 4px 16px rgba(0,0,0,.55), -2px -2px 6px rgba(255,255,255,.02)',
          border: '1px solid rgba(255,255,255,.06)',
        }}
      >
        <div className="px-4 py-3 flex flex-col">
          {children}
        </div>
      </div>
    </motion.div>
  )
}

function LegalRow({ label, children, last = false }) {
  return (
    <div
      className="flex flex-col gap-0.5 py-2.5"
      style={{ borderBottom: last ? 'none' : '1px solid rgba(255,255,255,.05)' }}
    >
      <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,65,3,.55)' }}>
        {label}
      </span>
      <span className="text-sm leading-snug" style={{ color: 'rgba(245,241,232,.7)' }}>{children}</span>
    </div>
  )
}
