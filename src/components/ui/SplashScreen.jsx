import { useEffect, useState } from 'react'

// Evergreen launch — the brand's own signature (Suzuki Swace, night Paris,
// the orange trace). No time-boxed World Cup theming.
const BG   = '/inrunparis/brand/splash-evergreen.jpg'
const LOGO = '/inrunparis/icons/icon-192.png'

const IN_MS   = 2400
const EXIT_MS = 560
const TOTAL   = IN_MS + EXIT_MS

const CSS = `
  @keyframes sp-in   { 0% { opacity: 0; transform: translateY(16px); filter: blur(6px); } 100% { opacity: 1; transform: translateY(0); filter: blur(0); } }
  @keyframes sp-logo { 0% { opacity: 0; transform: scale(.7); } 100% { opacity: 1; transform: scale(1); } }
  @keyframes sp-prog { from { transform: scaleX(0); } to { transform: scaleX(1); } }
  @keyframes sp-glow { 0%,100% { opacity: .5; } 50% { opacity: 1; } }
`

export default function SplashScreen({ onDone }) {
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { onDone(); return }
    const t1 = setTimeout(() => setExiting(true), IN_MS)
    const t2 = setTimeout(onDone, TOTAL)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [onDone])

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 overflow-hidden select-none"
      style={{
        zIndex:     2147483000,
        background: `#050505 url(${BG}) center / cover no-repeat`,
        opacity:    exiting ? 0 : 1,
        transform:  exiting ? 'scale(1.08)' : 'scale(1)',
        filter:     exiting ? 'blur(6px)' : 'blur(0px)',
        transition: `opacity ${EXIT_MS}ms cubic-bezier(.6,0,.2,1), transform ${EXIT_MS}ms cubic-bezier(.6,0,.2,1), filter ${EXIT_MS}ms cubic-bezier(.6,0,.2,1)`,
        willChange: 'transform, opacity, filter',
      }}
    >
      <style>{CSS}</style>

      {/* Top scrim for legibility over the photo */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'linear-gradient(to bottom, rgba(5,5,5,.6) 0%, transparent 36%)' }} />

      {/* Brand lockup — sits in the photo's negative space at the top */}
      <div style={{
        position: 'absolute', top: 'calc(var(--safe-top, 0px) + 60px)', left: 0, right: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>
        <img
          src={LOGO} width={72} height={72} alt=""
          style={{ borderRadius: 18, boxShadow: '0 10px 30px rgba(0,0,0,.6)', animation: 'sp-logo .7s cubic-bezier(.34,1.56,.64,1) both' }}
        />
        <p style={{
          marginTop: 16, fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800,
          letterSpacing: '-.04em', color: '#F5F1E8', lineHeight: 1,
          animation: 'sp-in .6s cubic-bezier(.23,1,.32,1) .25s both',
        }}>
          I<em style={{ fontStyle: 'italic', fontWeight: 400 }}>&amp;</em>N <span style={{ color: '#FF5A1F' }}>RUN</span>
        </p>
        <p style={{
          marginTop: 8, fontSize: 10.5, fontWeight: 600, letterSpacing: '.22em',
          textTransform: 'uppercase', color: 'rgba(245,241,232,.5)',
          animation: 'sp-in .6s cubic-bezier(.23,1,.32,1) .38s both',
        }}>
          Chauffeur Privé · Paris
        </p>

        {/* Progress bar */}
        <div style={{
          marginTop: 24, width: 132, height: 2.5, borderRadius: 999, overflow: 'hidden',
          background: 'rgba(255,255,255,.1)', animation: 'sp-in .5s ease .5s both',
        }}>
          <div style={{
            height: '100%', borderRadius: 999, transformOrigin: 'left',
            background: 'linear-gradient(90deg, #FF5A1F, #ff8c3f)', boxShadow: '0 0 10px rgba(255,90,31,.7)',
            animation: `sp-prog ${IN_MS - 500}ms cubic-bezier(.4,0,.2,1) .35s both, sp-glow 1.4s ease-in-out infinite`,
          }} />
        </div>
      </div>
    </div>
  )
}
