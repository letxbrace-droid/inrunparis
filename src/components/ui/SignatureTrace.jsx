import { motion } from 'framer-motion'

/**
 * I&N RUN signature — « Le Tracé ».
 *
 * The brand's griffe: every ride is a single line between two points.
 * Origin (filled dot) → route (a line that draws itself in) → destination
 * (hollow ring), with a light pulse travelling the route on a loop.
 *
 * Colour comes from `currentColor` so the trace inherits `--accent` (or any
 * colour set via `style.color`) — this sidesteps the SVG `var()` attribute
 * limitation. Reuse this one canonical mark everywhere the A→B idea appears.
 */
export default function SignatureTrace({
  width = 132,
  animate = true,
  loop = true,
  strokeOpacity = 0.34,
  style,
  className = '',
}) {
  const H   = 14
  const mid = H / 2
  const x0  = 5              // origin dot centre
  const x1  = width - 5      // destination ring centre
  const lx0 = x0 + 5         // line start (clears the dot)
  const lx1 = x1 - 5         // line end (clears the ring)

  return (
    <svg
      width={width}
      height={H}
      viewBox={`0 0 ${width} ${H}`}
      fill="none"
      className={className}
      style={{ color: 'var(--accent)', overflow: 'visible', display: 'block', ...style }}
      aria-hidden="true"
    >
      {/* Route — draws itself in */}
      <motion.path
        d={`M ${lx0} ${mid} L ${lx1} ${mid}`}
        stroke="currentColor"
        strokeOpacity={strokeOpacity}
        strokeWidth="1.5"
        strokeLinecap="round"
        initial={animate ? { pathLength: 0 } : false}
        animate={animate ? { pathLength: 1 } : false}
        transition={{ duration: 0.9, ease: [0.23, 1, 0.32, 1], delay: 0.1 }}
      />

      {/* Travelling light pulse */}
      {loop && (
        <motion.circle
          cy={mid}
          r="2"
          fill="currentColor"
          initial={{ cx: lx0, opacity: 0 }}
          animate={{ cx: [lx0, lx1], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1.7, repeat: Infinity, repeatDelay: 2.6, ease: [0.4, 0, 0.2, 1], delay: 1 }}
        />
      )}

      {/* Origin — filled dot */}
      <motion.circle
        cx={x0} cy={mid} r="3.4" fill="currentColor"
        initial={animate ? { scale: 0 } : false}
        animate={animate ? { scale: 1 } : false}
        transition={{ type: 'spring', stiffness: 420, damping: 20, delay: 0.05 }}
        style={{ transformOrigin: `${x0}px ${mid}px` }}
      />

      {/* Destination — hollow ring */}
      <motion.circle
        cx={x1} cy={mid} r="3.4" fill="none" stroke="currentColor" strokeWidth="1.6"
        initial={animate ? { scale: 0 } : false}
        animate={animate ? { scale: 1 } : false}
        transition={{ type: 'spring', stiffness: 420, damping: 20, delay: 0.9 }}
        style={{ transformOrigin: `${x1}px ${mid}px` }}
      />
    </svg>
  )
}
