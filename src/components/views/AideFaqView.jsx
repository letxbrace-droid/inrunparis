import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const FAQ = [
  {
    q: "Comment réserver une course ?",
    a: "Depuis l'accueil, saisissez votre départ et destination puis appuyez sur « Calculer le trajet ». Le tarif s'affiche avant confirmation. La réservation s'envoie directement sur WhatsApp.",
  },
  {
    q: "Les tarifs sont-ils fixes ?",
    a: "Oui. Le prix affiché est le prix final. Aucune surprise. Supplément aéroport (CDG, Orly, Beauvais) et tarif nuit (22h–6h) sont inclus dans le calcul.",
  },
  {
    q: "Puis-je annuler ou modifier ma réservation ?",
    a: "Oui, contactez-nous sur WhatsApp le plus tôt possible. Annulation gratuite jusqu'à 1h avant la prise en charge.",
  },
  {
    q: "Quels modes de paiement acceptez-vous ?",
    a: "Carte bancaire, espèces ou virement bancaire. Précisez votre préférence lors de la réservation.",
  },
  {
    q: "Proposez-vous des trajets longue distance ?",
    a: "Oui — Province, Côte d'Azur, Genève, Monaco. Contactez-nous pour un devis personnalisé.",
  },
  {
    q: "Le chauffeur peut-il attendre si mon vol est retardé ?",
    a: "Absolument. Nous suivons les arrivées en temps réel. Votre chauffeur s'adapte sans frais pour les retards inférieurs à 60 minutes.",
  },
  {
    q: "Y a-t-il un siège enfant disponible ?",
    a: "Oui, sur demande à l'étape Options. Précisez l'âge et le poids de l'enfant dans la note.",
  },
  {
    q: "Puis-je avoir une facture ?",
    a: "Oui. Mentionnez-le dans la note ou demandez-le sur WhatsApp. La facture est envoyée par email sous 24h.",
  },
]

const WA_SUPPORT = `https://wa.me/33767742220?text=${encodeURIComponent("Bonjour, j'ai une question concernant I&N RUN.")}`

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.16, 1, 0.3, 1], delay: i * 0.045 } }),
}

export default function AideFaqView({ open, onClose }) {
  const [expanded, setExpanded] = useState(null)

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Aide et FAQ"
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
          <h1 className="text-[17px] font-bold" style={{ color: '#F5F1E8' }}>Aide & FAQ</h1>
          <p className="text-xs" style={{ color: 'rgba(245,241,232,.38)' }}>Questions fréquentes</p>
        </div>
      </div>

      <div
        key={open}
        className="flex-1 overflow-y-auto px-5 scrollbar-thin relative z-10"
        style={{ paddingBottom: 'calc(var(--safe-bot) + 32px)' }}
      >
        <div className="flex flex-col gap-2 pt-4">
          {FAQ.map((item, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={itemVariants}
              initial="hidden"
              animate={open ? 'visible' : 'hidden'}
              className="rounded-2xl overflow-hidden"
              style={{
                background: expanded === i
                  ? 'linear-gradient(145deg, #002d3a 0%, #001e2a 100%)'
                  : 'linear-gradient(145deg, #002535 0%, #001a28 100%)',
                boxShadow: expanded === i
                  ? '4px 4px 16px rgba(0,0,0,.55), -2px -2px 6px rgba(255,255,255,.02), 0 0 20px rgba(255,65,3,.06)'
                  : '4px 4px 16px rgba(0,0,0,.55), -2px -2px 6px rgba(255,255,255,.02)',
                border: `1px solid ${expanded === i ? 'rgba(255,65,3,.25)' : 'rgba(255,255,255,.06)'}`,
                transition: 'border-color .2s, background .2s, box-shadow .2s',
              }}
            >
              <button
                onClick={() => setExpanded(expanded === i ? null : i)}
                className="flex items-center justify-between w-full px-4 py-4 text-left cursor-pointer"
                aria-expanded={expanded === i}
              >
                <span
                  className="text-sm font-semibold pr-4 leading-snug"
                  style={{ color: expanded === i ? '#F5F1E8' : 'rgba(245,241,232,.72)' }}
                >
                  {item.q}
                </span>
                <motion.svg
                  width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="rgba(255,65,3,.7)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  animate={{ rotate: expanded === i ? 180 : 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  style={{ flexShrink: 0 }}
                >
                  <path d="M6 9l6 6 6-6"/>
                </motion.svg>
              </button>

              <AnimatePresence initial={false}>
                {expanded === i && (
                  <motion.div
                    key="answer"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                    style={{ overflow: 'hidden', borderTop: '1px solid rgba(255,65,3,.12)' }}
                  >
                    <p className="text-sm px-4 py-4 leading-relaxed" style={{ color: 'rgba(245,241,232,.52)' }}>
                      {item.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Support CTA */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={open ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
          transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1], delay: FAQ.length * 0.045 }}
          className="mt-5 mb-2 rounded-2xl px-4 py-5 flex flex-col gap-3"
          style={{
            background: 'rgba(37,211,102,.06)',
            boxShadow: '4px 4px 16px rgba(0,0,0,.4)',
            border: '1px solid rgba(37,211,102,.2)',
          }}
        >
          <p className="text-sm font-semibold" style={{ color: 'rgba(245,241,232,.7)' }}>
            Vous ne trouvez pas votre réponse ?
          </p>
          <a
            href={WA_SUPPORT}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-4 py-3 rounded-xl active:scale-95 transition-transform"
            style={{
              background: 'rgba(37,211,102,.13)',
              border: '1px solid rgba(37,211,102,.3)',
              color: '#25d366',
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#25d366">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.118 1.531 5.845L0 24l6.335-1.507A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.895 0-3.666-.53-5.177-1.449l-.371-.22-3.763.895.955-3.646-.242-.381A9.955 9.955 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
            </svg>
            Contacter le support WhatsApp
          </a>
        </motion.div>
      </div>
    </div>
  )
}
