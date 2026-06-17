import { useEffect, useState } from 'react'

const LOGO = '/inrunparis/icons/icon-512.png'

// ── Official FIFA World Cup 2026 palette ──────────────────────────────────
const WC_BLUE = '#1C4FAF'
const WC_RED  = '#C8102E'
const WC_GOLD = '#F5C518'
const BG      = '#060C1A'   // deep navy — official dark background

const IN_MS   = 2500
const EXIT_MS = 520
const TOTAL   = IN_MS + EXIT_MS

const CSS = `
  @keyframes sp-logo {
    0%   { transform: scale(0.26); opacity: 0; filter: blur(8px); }
    58%  { transform: scale(1.08); opacity: 1; filter: blur(0); }
    78%  { transform: scale(0.96); }
    100% { transform: scale(1); }
  }
  @keyframes sp-spin-cw  { to { transform: rotate(360deg); } }
  @keyframes sp-spin-ccw { to { transform: rotate(-360deg); } }
  @keyframes sp-ring-in {
    0%   { opacity: 0; transform: scale(0.5) rotate(-60deg); }
    100% { opacity: 1; transform: scale(1)   rotate(0deg); }
  }
  @keyframes sp-text {
    0%   { opacity: 0; transform: translateY(18px); filter: blur(4px); }
    100% { opacity: 1; transform: translateY(0);    filter: blur(0); }
  }
  @keyframes sp-badge {
    0%   { opacity: 0; transform: translateY(18px) scale(0.86); filter: blur(4px); }
    100% { opacity: 1; transform: translateY(0)    scale(1);    filter: blur(0); }
  }
  @keyframes sp-orbit {
    from { transform: translate(-50%,-50%) rotate(0deg)   translateX(72px) rotate(0deg);   }
    to   { transform: translate(-50%,-50%) rotate(360deg) translateX(72px) rotate(-360deg); }
  }
  @keyframes sp-glow-blue {
    0%,100% { opacity: .18; transform: scale(1); }
    50%     { opacity: .28; transform: scale(1.12); }
  }
  @keyframes sp-glow-red {
    0%,100% { opacity: .13; transform: scale(1); }
    50%     { opacity: .22; transform: scale(1.1); }
  }
  @keyframes sp-star {
    0%,100% { opacity: .75; transform: scale(1)    rotate(0deg); }
    50%     { opacity: 1;   transform: scale(1.28) rotate(18deg); }
  }
  @keyframes sp-divider {
    0%   { transform: scaleX(0); opacity: 0; }
    100% { transform: scaleX(1); opacity: 1; }
  }
  @keyframes sp-trophy {
    0%   { opacity: 0; transform: translateY(-10px) scale(0.8); }
    100% { opacity: 1; transform: translateY(0)     scale(1); }
  }
  @keyframes sp-sweep {
    0%   { transform: translateX(-130%) skewX(-12deg); }
    100% { transform: translateX(260%)  skewX(-12deg); }
  }
  @keyframes sp-progress {
    0%   { transform: scaleX(0); }
    100% { transform: scaleX(1); }
  }
  @keyframes sp-progress-glow {
    0%, 100% { opacity: .5; }
    50%      { opacity: 1;  }
  }
`

// ── SVG Trophy (FIFA WC 2026 style) ──────────────────────────────────────
function TrophySVG() {
  return (
    <svg width="36" height="42" viewBox="0 0 36 42" fill="none" aria-hidden="true">
      {/* Bowl */}
      <path
        d="M6 3 L30 3 L28 19 Q27 26 18 26 Q9 26 8 19 Z"
        fill="white" opacity=".92"
      />
      {/* Left handle */}
      <path
        d="M8 6 Q1 6 1 15 Q1 23 8 22"
        stroke="rgba(255,255,255,.5)" strokeWidth="2.2" fill="none" strokeLinecap="round"
      />
      {/* Right handle */}
      <path
        d="M28 6 Q35 6 35 15 Q35 23 28 22"
        stroke="rgba(255,255,255,.5)" strokeWidth="2.2" fill="none" strokeLinecap="round"
      />
      {/* Stem */}
      <rect x="14.5" y="26" width="7" height="9" rx="1.5" fill="rgba(255,255,255,.75)"/>
      {/* Foot */}
      <rect x="8" y="35" width="20" height="5" rx="2.5" fill={WC_GOLD}/>
      {/* Shine on cup */}
      <ellipse cx="14" cy="11" rx="3.5" ry="5" fill="rgba(255,255,255,.22)" transform="rotate(-12 14 11)"/>
    </svg>
  )
}

// ── Single star ───────────────────────────────────────────────────────────
function Star({ size = 13, delay = 0 }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      style={{ animation: `sp-star 2s ease-in-out ${delay}s infinite`, fill: WC_GOLD }}
    >
      <polygon points="12,2 15.1,8.6 22.5,9.7 17.2,14.8 18.5,22.2 12,18.8 5.5,22.2 6.8,14.8 1.5,9.7 8.9,8.6"/>
    </svg>
  )
}

// ── WC 2026 Emblem ────────────────────────────────────────────────────────
function WC2026Emblem() {
  return (
    <div style={{
      display:       'flex',
      flexDirection: 'column',
      alignItems:    'center',
      gap:           0,
      animation:     'sp-badge .7s cubic-bezier(.34,1.56,.64,1) .05s both',
    }}>
      {/* Stars — 3 host nations */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 6 }}>
        <Star size={10} delay={0.1} />
        <Star size={14} delay={0}   />
        <Star size={10} delay={0.2} />
      </div>

      {/* Trophy */}
      <div style={{ animation: 'sp-trophy .55s cubic-bezier(.34,1.56,.64,1) .18s both', marginBottom: 4 }}>
        <TrophySVG />
      </div>

      {/* Big "26" — split blue / red, with cinematic light-sweep */}
      <div style={{ position: 'relative', overflow: 'hidden', padding: '0 4px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', lineHeight: 0.82 }}>
          <span style={{
            fontFamily:    "'Outfit', sans-serif",
            fontSize:      64,
            fontWeight:    900,
            letterSpacing: '-5px',
            color:         WC_BLUE,
            textShadow:    `0 0 32px ${WC_BLUE}99, 0 0 8px ${WC_BLUE}55`,
          }}>2</span>
          <span style={{
            fontFamily:    "'Outfit', sans-serif",
            fontSize:      64,
            fontWeight:    900,
            letterSpacing: '-5px',
            color:         WC_RED,
            textShadow:    `0 0 32px ${WC_RED}88, 0 0 8px ${WC_RED}44`,
          }}>6</span>
        </div>
        {/* Reflet lumineux qui traverse le 26 */}
        <div style={{
          position:      'absolute',
          top:           0, bottom: 0,
          left:          0,
          width:         '45%',
          pointerEvents: 'none',
          background:    'linear-gradient(100deg, transparent, rgba(255,255,255,.65) 50%, transparent)',
          animation:     'sp-sweep 1.7s cubic-bezier(.23,1,.32,1) 1.15s infinite',
        }} />
      </div>

      {/* Gradient rule */}
      <div style={{
        height:          1.5,
        width:           88,
        borderRadius:    999,
        marginTop:       6,
        background:      `linear-gradient(90deg, ${WC_BLUE}, ${WC_GOLD} 50%, ${WC_RED})`,
        transformOrigin: 'center',
        animation:       'sp-divider .65s cubic-bezier(.23,1,.32,1) .5s both',
      }} />

      {/* Label */}
      <p style={{
        marginTop:     6,
        fontSize:      9.5,
        fontWeight:    700,
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color:         'rgba(255,255,255,.48)',
      }}>
        FIFA World Cup
      </p>

      {/* Hosts */}
      <p style={{
        marginTop:     2,
        fontSize:      8,
        fontWeight:    600,
        letterSpacing: '0.14em',
        color:         'rgba(255,255,255,.28)',
        textTransform: 'uppercase',
      }}>
        Canada · Mexico · USA
      </p>
    </div>
  )
}

// ── Main Splash ───────────────────────────────────────────────────────────
export default function SplashScreen({ onDone }) {
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onDone(); return
    }
    const t1 = setTimeout(() => setExiting(true), IN_MS)
    const t2 = setTimeout(onDone, TOTAL)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [onDone])

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden select-none"
      style={{
        background: BG,
        opacity:    exiting ? 0 : 1,
        transform:  exiting ? 'scale(1.14)' : 'scale(1)',
        filter:     exiting ? 'blur(7px)' : 'blur(0px)',
        transition: `opacity ${EXIT_MS}ms cubic-bezier(.6,0,.2,1), transform ${EXIT_MS}ms cubic-bezier(.6,0,.2,1), filter ${EXIT_MS}ms cubic-bezier(.6,0,.2,1)`,
        willChange: 'transform, opacity, filter',
      }}
    >
      <style>{CSS}</style>

      {/* Blue ambient — left */}
      <div style={{
        position:     'absolute',
        inset:        0,
        pointerEvents:'none',
        background:   `radial-gradient(ellipse 65% 55% at 18% 58%, ${WC_BLUE}38 0%, transparent 68%)`,
        animation:    'sp-glow-blue 3.4s ease-in-out infinite',
      }} />

      {/* Red ambient — right */}
      <div style={{
        position:     'absolute',
        inset:        0,
        pointerEvents:'none',
        background:   `radial-gradient(ellipse 60% 50% at 82% 58%, ${WC_RED}2E 0%, transparent 68%)`,
        animation:    'sp-glow-red 3.4s ease-in-out .7s infinite',
      }} />

      {/* Gold center halo */}
      <div style={{
        position:     'absolute',
        width:        280,
        height:       280,
        borderRadius: '50%',
        pointerEvents:'none',
        background:   `radial-gradient(ellipse at center, ${WC_GOLD}10 0%, transparent 72%)`,
      }} />

      <div style={{
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        gap:            0,
        position:       'relative',
      }}>

        {/* ── WC 2026 Emblem ── */}
        <WC2026Emblem />

        {/* Spacer */}
        <div style={{ height: 24 }} />

        {/* ── I&N RUN logo + rings ── */}
        <div style={{ position: 'relative', width: 100, height: 100 }}>

          {/* Outer conic ring — blue → gold — CW */}
          <div style={{
            position:     'absolute',
            inset:        -11,
            borderRadius: '50%',
            background:   `conic-gradient(from 0deg, transparent 0%, ${WC_BLUE} 30%, ${WC_GOLD} 55%, transparent 80%)`,
            WebkitMask:   'radial-gradient(farthest-side, transparent calc(100% - 3.5px), white calc(100% - 2.5px))',
            mask:         'radial-gradient(farthest-side, transparent calc(100% - 3.5px), white calc(100% - 2.5px))',
            animation:    'sp-ring-in .55s cubic-bezier(.34,1.6,.64,1) .38s both, sp-spin-cw 3s linear .93s infinite',
          }} />

          {/* Inner conic ring — red — CCW */}
          <div style={{
            position:     'absolute',
            inset:        -22,
            borderRadius: '50%',
            opacity:      0.38,
            background:   `conic-gradient(from 90deg, transparent 0%, ${WC_RED} 24%, transparent 52%)`,
            WebkitMask:   'radial-gradient(farthest-side, transparent calc(100% - 2.5px), white calc(100% - 2px))',
            mask:         'radial-gradient(farthest-side, transparent calc(100% - 2.5px), white calc(100% - 2px))',
            animation:    'sp-ring-in .55s cubic-bezier(.34,1.6,.64,1) .48s both, sp-spin-ccw 5s linear .93s infinite',
          }} />

          {/* Orbiting football */}
          <div style={{
            position:  'absolute',
            top:       '50%',
            left:      '50%',
            fontSize:  19,
            lineHeight:1,
            zIndex:    2,
            animation: 'sp-ring-in .4s ease .56s both, sp-orbit 2.4s cubic-bezier(.23,1,.32,1) 1s infinite',
          }}>⚽</div>

          {/* App icon */}
          <img
            src={LOGO}
            alt=""
            width={100}
            height={100}
            style={{
              borderRadius: 22,
              display:      'block',
              position:     'relative',
              zIndex:       3,
              animation:    'sp-logo .72s cubic-bezier(.34,1.6,.64,1) .28s both',
            }}
          />
        </div>

        {/* ── Brand name ── */}
        <p style={{
          marginTop:     18,
          fontSize:      24,
          fontWeight:    900,
          letterSpacing: '-.04em',
          color:         '#ffffff',
          animation:     'sp-text .52s cubic-bezier(.23,1,.32,1) .52s both',
        }}>
          I<em style={{ fontStyle: 'italic', fontWeight: 400 }}>&amp;</em>N RUN
        </p>

        {/* ── Subtitle ── */}
        <p style={{
          marginTop:     5,
          fontSize:      10.5,
          fontWeight:    600,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color:         'rgba(255,255,255,.35)',
          animation:     'sp-text .52s cubic-bezier(.23,1,.32,1) .66s both',
        }}>
          Chauffeur Privé · Paris
        </p>

        {/* ── Barre de progression cinématique ── */}
        <div style={{
          marginTop:     22,
          width:         136,
          height:        2.5,
          borderRadius:  999,
          overflow:      'hidden',
          background:    'rgba(255,255,255,.08)',
          animation:     'sp-text .5s ease .8s both',
        }}>
          <div style={{
            height:          '100%',
            borderRadius:    999,
            transformOrigin: 'left',
            background:       `linear-gradient(90deg, ${WC_BLUE}, ${WC_GOLD} 50%, ${WC_RED})`,
            boxShadow:       `0 0 10px ${WC_GOLD}99`,
            animation:       `sp-progress ${IN_MS - 600}ms cubic-bezier(.4,0,.2,1) .6s both, sp-progress-glow 1.4s ease-in-out infinite`,
          }} />
        </div>

      </div>
    </div>
  )
}
