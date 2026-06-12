import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useAppTheme from '../../hooks/useAppTheme'

const DISMISS_KEY = 'inr-coupe26-banner'
const GOLD = '#E8B84B'

// Floating campaign teaser shown above the HomePill until dismissed
// or until the offer expires.
export default function CampaignBanner({ onOpen }) {
  const th = useAppTheme()
  const [hidden, setHidden] = useState(() => {
    try { return localStorage.getItem(DISMISS_KEY) === '1' } catch { return false }
  })

  const expired = Date.now() > new Date('2026-07-19T23:59:59Z').getTime()
  if (expired) return null

  const dismiss = (e) => {
    e.stopPropagation()
    setHidden(true)
    try { localStorage.setItem(DISMISS_KEY, '1') } catch {}
  }

  return (
    <AnimatePresence>
      {!hidden && (
        <motion.div
          initial={{ opacity: 0, y: 14, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.97 }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1], delay: 0.5 }}
          className="fixed z-[19] flex justify-center left-0 right-0 pointer-events-none"
          style={{ bottom: 'calc(var(--safe-bot) + 86px)' }}
        >
          <button
            onClick={onOpen}
            aria-label="Voir l'offre Coupe du Monde 2026"
            className="pointer-events-auto flex items-center gap-2.5 pl-3.5 pr-2 py-2 rounded-full cursor-pointer active:scale-[.97] transition-transform select-none"
            style={{
              background: th.isDark ? 'rgba(22,17,8,.92)' : 'rgba(255,250,238,.95)',
              border: `1px solid color-mix(in srgb, ${GOLD} ${th.isDark ? 35 : 55}%, transparent)`,
              boxShadow: th.isDark
                ? '0 8px 28px rgba(0,0,0,.7)'
                : '0 6px 20px rgba(0,0,0,.12)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          >
            <span aria-hidden="true" className="text-[13px]">⚽</span>
            <span className="text-[12px] font-semibold whitespace-nowrap" style={{ color: th.inkFull }}>
              Coupe du Monde 2026
            </span>
            <span
              className="font-mono font-bold text-[11px] tracking-wider px-2 py-0.5 rounded-full"
              style={{ color: GOLD, border: `1px solid color-mix(in srgb, ${GOLD} 40%, transparent)` }}
            >
              −10%
            </span>
            <span
              role="button"
              aria-label="Masquer"
              onClick={dismiss}
              className="w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0"
              style={{ background: th.isDark ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.06)' }}
            >
              <svg width="9" height="9" viewBox="0 0 14 14" fill="none" stroke={th.inkMuted} strokeWidth="2.2" strokeLinecap="round">
                <path d="M1 1l12 12M13 1L1 13"/>
              </svg>
            </span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
