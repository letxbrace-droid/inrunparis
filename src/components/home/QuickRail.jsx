import { motion } from 'framer-motion'
import Icon from '../ui/Icon'
import useAppTheme from '../../hooks/useAppTheme'
import { useFavorites } from '../../hooks/useFavorites'
import useBookingStore from '../../store/useBookingStore'

const AIRPORTS = [
  { key: 'CDG',  label: 'CDG',  name: 'Aéroport Paris-Charles de Gaulle', city: 'Roissy',   lat: 49.0097, lng: 2.5479 },
  { key: 'Orly', label: 'Orly', name: 'Aéroport de Paris-Orly',           city: 'Orly',     lat: 48.7233, lng: 2.3795 },
]

function Chip({ children, onClick, label, th, accent = false }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="flex items-center gap-2 flex-shrink-0 cursor-pointer active:scale-[.96] transition-transform duration-150 select-none"
      style={{
        padding: '9px 14px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: 'nowrap',
        color: accent ? 'var(--accent)' : th.inkFull,
        // Une puce posée sur la carte ne peut pas emprunter son contraste au
        // fond : la carte change de couleur à chaque déplacement, et en mode
        // clair un voile à 4 % disparaît purement et simplement. Elle porte
        // donc la même matière que la pastille en dessous — presque opaque,
        // liseré net, ombre courte — pour rester lisible sur n'importe quoi.
        background: th.isDark ? 'rgba(14,12,10,.88)' : 'rgba(255,255,255,.92)',
        border: `1px solid ${accent ? 'color-mix(in srgb, var(--accent) 34%, transparent)' : 'var(--separator-strong)'}`,
        boxShadow: th.isDark
          ? '0 6px 18px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.07)'
          : '0 4px 14px rgba(0,0,0,.14), inset 0 1px 0 rgba(255,255,255,.9)',
        backdropFilter: 'blur(16px)',
      }}
    >
      {children}
    </button>
  )
}

/**
 * Le rail de départ — ce que l'app sait déjà, posé devant.
 *
 * La pastille demandait « Où allons-nous ? » et attendait qu'on tape. Or
 * l'application connaît déjà le domicile, le travail, les derniers trajets et
 * le temps réel vers les aéroports : rien de tout cela n'était visible avant
 * d'avoir ouvert la carte, c'est-à-dire après avoir déjà décidé.
 *
 * Un contrôle d'accueil premium ne demande pas, il propose. Chaque puce
 * remplit la destination et ouvre la réservation d'un seul geste — le chemin
 * le plus court entre l'envie de partir et le prix affiché.
 *
 * Le rail ne s'affiche que s'il a quelque chose de vrai à dire : sans favori
 * ni historique, il ne reste que les deux aéroports, et sans eux il disparaît
 * plutôt que de meubler.
 */
export default function QuickRail({ onPick, traffic }) {
  const th = useAppTheme()
  const { favs } = useFavorites()
  const history = useBookingStore((s) => s.bookingHistory)
  const redoBooking = useBookingStore((s) => s.redoBooking)

  const last = history?.[0]
  // `live` n'est vrai que si le routage a répondu. Sans lui, le hook retombe
  // sur une durée de catalogue ajustée d'un coefficient de congestion : une
  // estimation parfaitement honnête tant qu'on ne la présente pas comme une
  // mesure. Affichée telle quelle sur une puce, elle se lit comme du direct —
  // et le client qui la vérifie découvre qu'elle ne l'était pas.
  const minsFor = (key) => {
    const t = traffic?.find((x) => x.name === key)
    return t?.live ? t.mins : null
  }

  const items = []

  if (favs.home) items.push({
    id: 'home', label: `Aller à ${favs.home.name.split(',')[0]}`,
    icon: 'home', text: 'Maison',
    onClick: () => onPick(favs.home),
  })
  if (favs.work) items.push({
    id: 'work', label: `Aller à ${favs.work.name.split(',')[0]}`,
    icon: 'work', text: 'Travail',
    onClick: () => onPick(favs.work),
  })
  for (const a of AIRPORTS) {
    const mins = minsFor(a.key)
    items.push({
      id: a.key,
      // Le temps n'apparaît que s'il a été mesuré. Un « 52 min » de catalogue
      // affiché comme une donnée vivante serait exactement le genre de détail
      // qui ruine la confiance quand le client le vérifie.
      label: mins ? `Aller à ${a.label}, ${mins} minutes actuellement` : `Aller à ${a.label}`,
      icon: 'plane',
      text: mins ? `${a.label} · ${mins} min` : a.label,
      onClick: () => onPick(a),
    })
  }
  if (last?.arrive?.lat) items.push({
    id: 'redo', label: `Refaire le trajet vers ${last.arrive.name}`,
    icon: null, text: 'Refaire', accent: true,
    onClick: () => { redoBooking(last); onPick(null) },
  })

  if (!items.length) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
      className="flex gap-2 overflow-x-auto px-1 pb-2.5 scroll-area"
      style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
    >
      {items.map((it) => (
        <Chip key={it.id} onClick={it.onClick} label={it.label} th={th} accent={it.accent}>
          {it.icon ? (
            <Icon name={it.icon} size={14} style={{ color: 'var(--accent)' }} />
          ) : (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true"
                 stroke="var(--accent)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
                 style={{ flexShrink: 0 }}>
              <path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5"/>
            </svg>
          )}
          {it.text}
        </Chip>
      ))}
    </motion.div>
  )
}
