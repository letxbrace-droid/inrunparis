import { motion } from 'framer-motion'

const BAR = {
  display:         'block',
  width:           24,
  height:          2.5,
  borderRadius:    99,
  background:      '#F5F1E8',
  transformOrigin: 'center',
  filter:          'drop-shadow(0 1px 4px rgba(0,0,0,.75))',
}

export default function TopBar({ onBurgerClick, burgerOpen }) {
  return (
    <header
      className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-5 pointer-events-none"
      style={{ paddingTop: `calc(var(--safe-top) + 14px)` }}
    >
      {/* Burger — sans fond, 3 traits gras posés directement sur la carte */}
      <button
        onClick={onBurgerClick}
        aria-label="Menu principal"
        aria-expanded={burgerOpen}
        aria-controls="side-drawer"
        className="pointer-events-auto flex flex-col items-center justify-center cursor-pointer active:scale-90 transition-transform duration-100 select-none"
        style={{ width: 44, height: 44, gap: 6 }}
      >
        {/* Trait haut */}
        <motion.span
          initial={false}
          animate={burgerOpen ? { rotate: 45, y: 8.5 } : { rotate: 0, y: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          style={BAR}
        />
        {/* Trait milieu */}
        <motion.span
          initial={false}
          animate={burgerOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.18 }}
          style={BAR}
        />
        {/* Trait bas */}
        <motion.span
          initial={false}
          animate={burgerOpen ? { rotate: -45, y: -8.5 } : { rotate: 0, y: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          style={BAR}
        />
      </button>

      {/* Spacer right */}
      <div className="w-11 h-11" aria-hidden="true" />
    </header>
  )
}
