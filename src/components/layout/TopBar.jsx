import { motion } from 'framer-motion'

function barStyle(isDark) {
  return {
    display:         'block',
    width:           20,
    height:          2.5,
    borderRadius:    99,
    background:      isDark ? '#F5F1E8' : '#0c1e2e',
    transformOrigin: 'center',
  }
}

export default function TopBar({ onBurgerClick, burgerOpen, isDark = true }) {
  const BAR = barStyle(isDark)

  // Glass pill — constant contrast for the bars over any map background
  const pillBg = isDark
    ? 'rgba(10,14,24,.62)'
    : 'rgba(255,255,255,.72)'
  const pillBorder = isDark
    ? '1px solid rgba(255,255,255,.14)'
    : '1px solid rgba(0,0,0,.08)'
  const pillShadow = isDark
    ? '0 6px 20px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.10)'
    : '0 4px 16px rgba(0,0,0,.14), inset 0 1px 0 rgba(255,255,255,.85)'

  return (
    <header
      className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-5 pointer-events-none"
      style={{ paddingTop: `calc(var(--safe-top) + 14px)` }}
    >
      {/* Burger — pastille glass, traits toujours lisibles sur la carte */}
      <button
        onClick={onBurgerClick}
        aria-label="Menu principal"
        aria-expanded={burgerOpen}
        aria-controls="side-drawer"
        className="pointer-events-auto flex flex-col items-center justify-center cursor-pointer active:scale-90 transition-transform duration-150 select-none"
        style={{
          width:          44,
          height:         44,
          gap:            5.5,
          borderRadius:   '50%',
          background:     pillBg,
          border:         pillBorder,
          boxShadow:      pillShadow,
          backdropFilter:       'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
        }}
      >
        {/* Trait haut */}
        <motion.span
          initial={false}
          animate={burgerOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
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
          animate={burgerOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          style={BAR}
        />
      </button>

      {/* Spacer right */}
      <div className="w-11 h-11" aria-hidden="true" />
    </header>
  )
}
