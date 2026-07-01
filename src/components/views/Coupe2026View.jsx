import { useState, useEffect } from 'react'
import useBookingStore from '../../store/useBookingStore'
import useAppTheme from '../../hooks/useAppTheme'

const LANDING_URL = 'https://letxbrace-droid.github.io/inrunparis/coupe2026.html'
const vibe = () => navigator.vibrate?.(10)

const FINALE = new Date('2026-07-19T21:00:00Z')
const GOLD   = '#E8B84B'

const MATCHES = [
  { date: '11 juin',    label: 'Match d’ouverture · Mexico'        },
  { date: '13 juin',    label: 'Premiers matchs des Bleus'              },
  { date: '28 juin',    label: 'Phase à élimination directe'            },
  { date: '14 juillet', label: 'Demi-finales'                           },
  { date: '19 juillet', label: 'Finale · MetLife Stadium', gold: true   },
]

function pad(n) { return String(n).padStart(2, '0') }

function useCountdown(open) {
  const [t, setT] = useState(() => FINALE - Date.now())
  useEffect(() => {
    if (!open) return
    const id = setInterval(() => setT(FINALE - Date.now()), 1000)
    return () => clearInterval(id)
  }, [open])
  if (t <= 0) return null
  return {
    d: Math.floor(t / 86400000),
    h: Math.floor(t / 3600000) % 24,
    m: Math.floor(t / 60000) % 60,
    s: Math.floor(t / 1000) % 60,
  }
}

export default function Coupe2026View({ open, onClose, onReserve }) {
  const th       = useAppTheme()
  const promo    = useBookingStore((s) => s.promo)
  const setPromo = useBookingStore((s) => s.setPromo)
  const cd       = useCountdown(open)

  const [shared, setShared] = useState(false)
  const applied = promo?.code === 'COUPE26'

  const handleApply = () => {
    if (applied) return
    vibe()
    setPromo({ code: 'COUPE26', discount: 10, label: 'Coupe du Monde 2026 — −10%' })
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: 'I&N RUN · Coupe du Monde 2026', text: '−10% sur tous vos trajets avec le code COUPE26', url: LANDING_URL })
      } else {
        await navigator.clipboard.writeText(LANDING_URL)
        setShared(true)
        setTimeout(() => setShared(false), 2000)
      }
    } catch {}
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Offre Coupe du Monde 2026"
      aria-hidden={!open}
      className="fixed inset-0 z-[80] flex flex-col will-change-transform"
      style={{
        background:    th.bgBase,
        transform:     open ? 'translateX(0)' : 'translateX(100%)',
        visibility:    open ? 'visible' : 'hidden',
        pointerEvents: open ? 'auto' : 'none',
        transition:    open
          ? 'transform .34s cubic-bezier(.16,1,.3,1), visibility 0s linear 0s'
          : 'transform .28s cubic-bezier(.55,0,.1,1), visibility 0s linear .28s',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-4 px-5 flex-shrink-0 relative z-10"
        style={{
          paddingTop:    'calc(var(--safe-top) + 16px)',
          paddingBottom: 14,
          background:    th.bgHeader,
          borderBottom:  `1px solid ${th.divider}`,
        }}
      >
        <button onClick={onClose} aria-label="Retour"
          className="w-11 h-11 flex items-center justify-center rounded-full cursor-pointer active:scale-90 transition-transform"
          style={{ background: th.bgCard, border: `1px solid ${th.border}` }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={th.inkHigh} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <div>
          <h1 className="text-[19px] font-display font-bold" style={{ color: th.inkFull, letterSpacing: '-0.02em' }}>Coupe du Monde 2026</h1>
          <p className="text-xs" style={{ color: th.inkMuted }}>Offre spéciale I&N RUN</p>
        </div>
      </div>

      <div
        key={open}
        className="flex-1 px-5 pt-6 overflow-y-auto scrollbar-thin relative z-10"
        style={{ paddingBottom: 'calc(var(--safe-bot) + 32px)' }}
      >

        {/* Hero card */}
        <div
          className="rounded-3xl px-5 py-6 mb-5 relative overflow-hidden"
          style={{
            background: th.isDark
              ? 'linear-gradient(150deg, #161108 0%, #0d0d0d 55%)'
              : 'linear-gradient(150deg, #FFF6E0 0%, #FFFFFF 60%)',
            border: `1px solid color-mix(in srgb, ${GOLD} ${th.isDark ? 28 : 45}%, transparent)`,
            animation: 'fade-up .38s ease both',
          }}
        >
          <span
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-4"
            style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase',
              color: GOLD, border: `1px solid color-mix(in srgb, ${GOLD} 40%, transparent)`,
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: GOLD }} />
            11 juin — 19 juillet 2026
          </span>
          <h2
            style={{
              fontSize: 26, fontWeight: 900, lineHeight: 1.1,
              letterSpacing: '-0.03em', textTransform: 'uppercase', color: th.inkFull,
            }}
          >
            −10% sur tous<br />vos trajets
          </h2>
          <p className="text-[13px] mt-2" style={{ color: th.inkMuted, lineHeight: 1.5 }}>
            Aéroports, gares, fan zones : I&N RUN vous emmène partout pendant toute la compétition.
          </p>

          {/* Countdown to the finale */}
          {cd && (
            <div className="flex gap-2 mt-5">
              {[[cd.d, 'jours'], [cd.h, 'h'], [cd.m, 'min'], [cd.s, 'sec']].map(([v, u]) => (
                <div key={u} className="flex-1 rounded-xl py-2.5 text-center"
                  style={{ background: th.bgInset, border: `1px solid ${th.borderFaint}` }}>
                  <div className="font-mono font-bold text-[17px] tnum" style={{ color: th.inkFull }}>{pad(v)}</div>
                  <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: th.inkDim }}>{u}</div>
                </div>
              ))}
            </div>
          )}
          <p className="text-[10px] mt-2 text-center" style={{ color: th.inkDim }}>
            avant la finale
          </p>
        </div>

        {/* Promo code ticket */}
        <div
          className="rounded-2xl px-5 py-5 mb-5 flex items-center justify-between gap-4"
          style={{
            background: th.bgCard,
            border: applied
              ? '1px solid color-mix(in srgb, var(--positive) 45%, transparent)'
              : `1px dashed color-mix(in srgb, ${GOLD} 55%, transparent)`,
            animation: 'fade-up .38s ease both 60ms',
            transition: 'border-color .25s',
          }}
        >
          <div className="min-w-0">
            <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: th.inkMuted }}>
              Votre code
            </p>
            <p className="font-mono font-bold tracking-[.14em] text-[20px] mt-1" style={{ color: applied ? 'var(--positive)' : GOLD }}>
              COUPE26
            </p>
          </div>
          <button
            onClick={handleApply}
            disabled={applied}
            className="flex-shrink-0 px-4 py-3 rounded-xl text-[13px] font-bold cursor-pointer active:scale-95 transition-transform disabled:cursor-default"
            style={applied
              ? { background: 'color-mix(in srgb, var(--positive) 14%, transparent)', color: 'var(--positive)', border: '1px solid color-mix(in srgb, var(--positive) 35%, transparent)' }
              : { background: GOLD, color: '#161108', border: '1px solid transparent' }}
          >
            {applied ? 'Appliqué ✓' : 'Appliquer'}
          </button>
        </div>

        {applied && (
          <p className="text-xs px-1 -mt-2 mb-5" style={{ color: 'color-mix(in srgb, var(--positive) 80%, transparent)', animation: 'fade-in .2s ease' }}>
            La réduction sera visible à l'étape Tarif de votre réservation.
          </p>
        )}

        {/* Key dates */}
        <div
          className="rounded-2xl px-4 py-4 mb-5"
          style={{
            background: th.bgCard,
            border: `1px solid ${th.borderFaint}`,
            animation: 'fade-up .38s ease both 120ms',
          }}
        >
          <p className="mb-3" style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', color: th.inkMuted }}>
            Dates clés
          </p>
          {MATCHES.map((m) => (
            <div key={m.label} className="flex items-center gap-3 py-2">
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: m.gold ? GOLD : 'var(--accent)' }} />
              <span className="font-mono text-xs flex-shrink-0 tnum" style={{ color: m.gold ? GOLD : th.inkMid, width: 72 }}>
                {m.date}
              </span>
              <span className="text-[13px] truncate" style={{ color: th.inkMuted }}>{m.label}</span>
            </div>
          ))}
        </div>

        {/* Reserve CTA */}
        <button
          onClick={() => { vibe(); handleApply(); onReserve?.() }}
          className="cta-glow w-full py-4 rounded-2xl text-[15px] font-bold text-white cursor-pointer active:scale-[.98] transition-transform relative overflow-hidden"
          style={{ animation: 'fade-up .38s ease both 180ms' }}
        >
          <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.25), transparent)' }} />
          Réserver avec −10% →
        </button>

        {/* Share CTA */}
        <button
          onClick={handleShare}
          className="w-full py-3 rounded-2xl text-[13px] font-semibold cursor-pointer active:scale-[.98] transition-transform flex items-center justify-center gap-2 mt-2"
          style={{
            background: th.bgCard, border: `1px solid ${th.borderFaint}`, color: th.inkMid,
            animation: 'fade-up .38s ease both 220ms',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
          {shared ? 'Lien copié ✓' : 'Partager l\'offre'}
        </button>

        <p className="text-[11px] text-center mt-3" style={{ color: th.inkDim }}>
          Offre valable jusqu'au 19 juillet 2026 · non cumulable
        </p>

      </div>
    </div>
  )
}
