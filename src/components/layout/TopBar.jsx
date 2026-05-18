import { motion } from 'framer-motion'

export default function TopBar({ onBurgerClick, burgerOpen }) {
  return (
    <header
      className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-5 pointer-events-none"
      style={{ paddingTop: `calc(var(--safe-top) + 12px)` }}
    >
      {/* Burger — pilule glassmorphism très subtile */}
      <button
        onClick={onBurgerClick}
        aria-label="Menu principal"
        aria-expanded={burgerOpen}
        aria-controls="side-drawer"
        className="pointer-events-auto flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-transform duration-100 select-none"
        style={{
          width: 44,
          height: 44,
          gap: 5,
          background: 'rgba(0,18,28,0.58)',
          backdropFilter: 'blur(20px) saturate(1.4)',
          WebkitBackdropFilter: 'blur(20px) saturate(1.4)',
          borderRadius: 13,
          border: '1px solid rgba(255,255,255,.1)',
          boxShadow: '0 2px 14px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.06)',
        }}
      >
        {/* Trait haut — 100% */}
        <motion.span
          initial={false}
          animate={burgerOpen
            ? { rotate: 45, y: 6.5, width: 18 }
            : { rotate: 0,  y: 0,   width: 18 }
          }
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          style={{
            display: 'block',
            height: 1.5,
            borderRadius: 99,
            background: 'rgba(245,241,232,.9)',
            transformOrigin: 'center',
          }}
        />
        {/* Trait milieu — 75% (signature premium) */}
        <motion.span
          initial={false}
          animate={burgerOpen
            ? { opacity: 0, scaleX: 0 }
            : { opacity: 1, scaleX: 1 }
          }
          transition={{ duration: 0.18 }}
          style={{
            display: 'block',
            width: 13,
            height: 1.5,
            borderRadius: 99,
            background: 'rgba(245,241,232,.9)',
            transformOrigin: 'center',
          }}
        />
        {/* Trait bas — 100% */}
        <motion.span
          initial={false}
          animate={burgerOpen
            ? { rotate: -45, y: -6.5, width: 18 }
            : { rotate: 0,   y: 0,    width: 18 }
          }
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          style={{
            display: 'block',
            height: 1.5,
            borderRadius: 99,
            background: 'rgba(245,241,232,.9)',
            transformOrigin: 'center',
          }}
        />
      </button>

      {/* Spacer right */}
      <div className="w-11 h-11" aria-hidden="true" />
    </header>
  )
}
