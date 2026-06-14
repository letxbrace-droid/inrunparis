import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useAppTheme from '../../hooks/useAppTheme'

const DISMISS_KEY = 'inr-coupe26-banner'

const WC_BLUE = '#1C4FAF'
const WC_RED  = '#C8102E'
const WC_GOLD = '#F5C518'

const MATCH_DAYS = ['2026-06-11','2026-06-13','2026-06-28','2026-07-14','2026-07-19']
const todayISO  = () => new Date().toLocaleDateString('en-CA')

function isMatchDay() { return MATCH_DAYS.includes(todayISO()) }

/* ─── tiny star SVG ─────────────────────────────────────────────── */
const Star = ({ size = 10 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={WC_GOLD}>
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
  </svg>
)

/* ─── animated shimmer overlay ──────────────────────────────────── */
const Shimmer = () => (
  <motion.span
    aria-hidden="true"
    className="pointer-events-none absolute inset-0 rounded-full overflow-hidden"
    initial={false}
  >
    <motion.span
      className="absolute inset-0"
      style={{
        background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,.18) 50%, transparent 60%)',
        backgroundSize: '200% 100%',
      }}
      animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
      transition={{ repeat: Infinity, duration: 2.8, ease: 'linear', repeatDelay: 1.2 }}
    />
  </motion.span>
)

/* ─── main component ─────────────────────────────────────────────── */
export default function CampaignBanner({ onOpen }) {
  const th = useAppTheme()
  const matchDay = isMatchDay()

  const [hidden, setHidden] = useState(() => {
    try { return localStorage.getItem(DISMISS_KEY) === '1' } catch { return false }
  })
  const [copied, setCopied] = useState(false)
  const copyTimer = useRef(null)

  const expired = Date.now() > new Date('2026-07-19T23:59:59Z').getTime()
  if (expired || hidden) return null

  const dismiss = (e) => {
    e.stopPropagation()
    setHidden(true)
    try { localStorage.setItem(DISMISS_KEY, '1') } catch {}
  }

  const copyCode = (e) => {
    e.stopPropagation()
    navigator.clipboard?.writeText('COUPE26').catch(() => {})
    setCopied(true)
    clearTimeout(copyTimer.current)
    copyTimer.current = setTimeout(() => setCopied(false), 2000)
  }

  /* gradient border colour stops */
  const borderGrad = matchDay
    ? `conic-gradient(from 180deg, ${WC_RED}, ${WC_GOLD}, ${WC_RED})`
    : `conic-gradient(from 200deg, ${WC_BLUE}, ${WC_GOLD}, ${WC_RED}, ${WC_BLUE})`

  /* inner card bg */
  const cardBg = th.isDark
    ? 'rgba(8, 10, 20, 0.93)'
    : 'rgba(248, 247, 243, 0.96)'

  return (
    <AnimatePresence>
      <motion.div
        key="campaign-banner"
        initial={{ opacity: 0, y: 18, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.96 }}
        transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1], delay: 0.5 }}
        className="fixed z-[19] flex justify-center left-0 right-0 pointer-events-none px-4"
        style={{ bottom: 'calc(var(--safe-bot) + 90px)' }}
      >
        {/* ── gradient border shell ── */}
        <motion.div
          className="pointer-events-auto relative p-[1.5px] rounded-2xl"
          style={{ background: borderGrad }}
          animate={matchDay ? { opacity: [1, 0.7, 1] } : {}}
          transition={matchDay ? { repeat: Infinity, duration: 1.6, ease: 'easeInOut' } : {}}
        >
          {/* ── inner card ── */}
          <div
            className="relative flex items-center gap-2 pl-3 pr-2 py-2.5 rounded-[calc(1rem-1.5px)] overflow-hidden"
            style={{ background: cardBg, backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' }}
          >
            <Shimmer />

            {/* left accent bar */}
            <span
              aria-hidden="true"
              className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full"
              style={{ background: matchDay ? WC_RED : WC_BLUE }}
            />

            {/* ⚽ icon */}
            <span aria-hidden="true" className="text-[16px] ml-1 flex-shrink-0">⚽</span>

            {/* label block */}
            <div className="flex flex-col leading-tight min-w-0">
              <span
                className="text-[11px] font-bold tracking-wide uppercase truncate"
                style={{ color: matchDay ? WC_RED : WC_BLUE }}
              >
                {matchDay ? 'Match ce soir !' : 'Coupe du Monde 2026'}
              </span>
              {/* stars row */}
              <span className="flex items-center gap-[2px] mt-[1px]">
                <Star size={7} /><Star size={7} /><Star size={7} />
                <span className="text-[10px] ml-1 font-medium" style={{ color: th.inkMuted }}>
                  Canada · Mexico · USA
                </span>
              </span>
            </div>

            {/* spacer */}
            <div className="flex-1" />

            {/* code + copy */}
            <motion.button
              onClick={copyCode}
              aria-label={copied ? 'Code copié' : 'Copier le code COUPE26'}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg flex-shrink-0 relative overflow-hidden"
              style={{
                background: `color-mix(in srgb, ${WC_GOLD} 14%, transparent)`,
                border: `1px solid color-mix(in srgb, ${WC_GOLD} 40%, transparent)`,
              }}
              whileTap={{ scale: 0.94 }}
            >
              <AnimatePresence mode="wait" initial={false}>
                {copied ? (
                  <motion.span
                    key="ok"
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    transition={{ duration: 0.18 }}
                    className="text-[11px] font-bold"
                    style={{ color: WC_GOLD }}
                  >
                    ✓ Copié
                  </motion.span>
                ) : (
                  <motion.span
                    key="code"
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    transition={{ duration: 0.18 }}
                    className="flex items-center gap-1.5"
                  >
                    <span className="font-mono font-bold text-[11px] tracking-widest" style={{ color: WC_GOLD }}>
                      COUPE26
                    </span>
                    {/* copy icon */}
                    <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke={WC_GOLD} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="5" y="5" width="9" height="9" rx="1.5"/>
                      <path d="M11 5V3a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h2"/>
                    </svg>
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {/* −10% badge */}
            <motion.button
              onClick={onOpen}
              aria-label="Voir l'offre Coupe du Monde 2026"
              className="flex items-center justify-center px-2.5 py-1 rounded-lg font-mono font-bold text-[12px] tracking-wider flex-shrink-0 relative overflow-hidden"
              style={{
                background: `color-mix(in srgb, ${WC_RED} 16%, transparent)`,
                border: `1px solid color-mix(in srgb, ${WC_RED} 45%, transparent)`,
                color: WC_RED,
              }}
              whileTap={{ scale: 0.94 }}
            >
              −10%
              {/* shimmer on badge */}
              <motion.span
                aria-hidden="true"
                className="absolute inset-0 rounded-lg"
                style={{
                  background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,.25) 50%, transparent 65%)',
                  backgroundSize: '200% 100%',
                }}
                animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
                transition={{ repeat: Infinity, duration: 2.2, ease: 'linear', repeatDelay: 2 }}
              />
            </motion.button>

            {/* dismiss */}
            <button
              onClick={dismiss}
              aria-label="Masquer"
              className="w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0 ml-0.5"
              style={{ background: th.isDark ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.06)' }}
            >
              <svg width="9" height="9" viewBox="0 0 14 14" fill="none" stroke={th.inkMuted} strokeWidth="2.2" strokeLinecap="round">
                <path d="M1 1l12 12M13 1L1 13"/>
              </svg>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
