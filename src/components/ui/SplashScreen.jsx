import { useEffect, useState } from 'react'

const LOGO   = '/inrunparis/icons/icon-512.png'
const GOLD   = '#E8B84B'
const ACCENT = '#FF5A1F'

const IN_MS   = 1900   // hold before exit
const EXIT_MS = 420    // exit animation duration
const TOTAL   = IN_MS + EXIT_MS

const CSS = `
  @keyframes sp-logo {
    0%   { transform: scale(0.28); opacity: 0; }
    55%  { transform: scale(1.07); opacity: 1; }
    75%  { transform: scale(0.97); }
    100% { transform: scale(1); }
  }
  @keyframes sp-spin-cw {
    to { transform: rotate(360deg); }
  }
  @keyframes sp-spin-ccw {
    to { transform: rotate(-360deg); }
  }
  @keyframes sp-ring-in {
    0%   { opacity: 0; transform: scale(0.55); }
    100% { opacity: 1; transform: scale(1); }
  }
  @keyframes sp-text {
    0%   { opacity: 0; transform: translateY(14px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  @keyframes sp-badge {
    0%   { opacity: 0; transform: translateY(10px) scale(0.93); }
    100% { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes sp-orbit {
    from { transform: translate(-50%,-50%) rotate(0deg)   translateX(70px) rotate(0deg);   }
    to   { transform: translate(-50%,-50%) rotate(360deg) translateX(70px) rotate(-360deg); }
  }
  @keyframes sp-glow-pulse {
    0%,100% { opacity: .10; transform: scale(1); }
    50%     { opacity: .20; transform: scale(1.08); }
  }
`

export default function SplashScreen({ onDone }) {
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    // Respect prefers-reduced-motion — skip instantly
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onDone(); return
    }
    const t1 = setTimeout(() => setExiting(true), IN_MS)
    const t2 = setTimeout(onDone, TOTAL)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [onDone])

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden select-none"
      aria-hidden="true"
      style={{
        background:  '#000000',
        opacity:     exiting ? 0 : 1,
        transform:   exiting ? 'scale(1.05)' : 'scale(1)',
        transition:  `opacity ${EXIT_MS}ms cubic-bezier(.23,1,.32,1), transform ${EXIT_MS}ms cubic-bezier(.23,1,.32,1)`,
        willChange:  'transform, opacity',
      }}
    >
      <style>{CSS}</style>

      {/* Ambient radial glow */}
      <div
        style={{
          position: 'absolute',
          width: 360, height: 360,
          borderRadius: '50%',
          background: `radial-gradient(ellipse at center, ${GOLD}1A 0%, transparent 68%)`,
          animation: 'sp-glow-pulse 2.8s ease-in-out infinite',
        }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, position: 'relative' }}>

        {/* ── Logo + rings + ball ── */}
        <div style={{ position: 'relative', width: 120, height: 120 }}>

          {/* Outer gold conic ring — clockwise */}
          <div style={{
            position:     'absolute',
            inset:        -11,
            borderRadius: '50%',
            background:   `conic-gradient(from 0deg, transparent 0%, ${GOLD} 28%, ${ACCENT} 56%, transparent 82%)`,
            WebkitMask:   'radial-gradient(farthest-side, transparent calc(100% - 3.5px), white calc(100% - 3px))',
            mask:         'radial-gradient(farthest-side, transparent calc(100% - 3.5px), white calc(100% - 3px))',
            animation:    'sp-ring-in .55s cubic-bezier(.34,1.6,.64,1) .15s both, sp-spin-cw 2.8s linear .7s infinite',
          }} />

          {/* Inner counter ring — counter-clockwise */}
          <div style={{
            position:     'absolute',
            inset:        -22,
            borderRadius: '50%',
            opacity:      0.35,
            background:   `conic-gradient(from 90deg, transparent 0%, ${ACCENT} 22%, transparent 55%)`,
            WebkitMask:   'radial-gradient(farthest-side, transparent calc(100% - 2.5px), white calc(100% - 2px))',
            mask:         'radial-gradient(farthest-side, transparent calc(100% - 2.5px), white calc(100% - 2px))',
            animation:    'sp-ring-in .55s cubic-bezier(.34,1.6,.64,1) .25s both, sp-spin-ccw 4.5s linear .7s infinite',
          }} />

          {/* Orbiting football ⚽ */}
          <div style={{
            position:   'absolute',
            top:        '50%',
            left:       '50%',
            fontSize:   22,
            lineHeight: 1,
            animation:  'sp-ring-in .4s ease .5s both, sp-orbit 2.2s cubic-bezier(.23,1,.32,1) .9s infinite',
            zIndex:     2,
          }}>
            ⚽
          </div>

          {/* Logo */}
          <img
            src={LOGO}
            alt=""
            width={120}
            height={120}
            style={{
              borderRadius: 26,
              display:      'block',
              position:     'relative',
              zIndex:       3,
              animation:    'sp-logo .72s cubic-bezier(.34,1.6,.64,1) both',
            }}
          />
        </div>

        {/* Brand name */}
        <p style={{
          marginTop:     22,
          fontSize:      24,
          fontWeight:    900,
          letterSpacing: '-.04em',
          color:         '#ffffff',
          animation:     'sp-text .52s cubic-bezier(.23,1,.32,1) .38s both',
        }}>
          I<em style={{ fontStyle:'italic', fontWeight: 400 }}>&amp;</em>N RUN
        </p>

        {/* Campaign badge */}
        <div style={{
          marginTop:     10,
          display:       'inline-flex',
          alignItems:    'center',
          gap:           6,
          padding:       '5px 14px',
          borderRadius:  999,
          border:        `1px solid ${GOLD}66`,
          background:    `${GOLD}12`,
          animation:     'sp-badge .5s cubic-bezier(.23,1,.32,1) .62s both',
        }}>
          <span style={{
            fontSize:      10,
            fontWeight:    700,
            letterSpacing: '.18em',
            textTransform: 'uppercase',
            color:         GOLD,
          }}>
            Coupe du Monde 2026
          </span>
        </div>
      </div>
    </div>
  )
}
