import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useBookingStore from '../../store/useBookingStore'

function IconHome() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  )
}

function IconCar() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="17" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8"  y1="2" x2="8"  y2="6"/>
      <line x1="3"  y1="10" x2="21" y2="10"/>
      <path d="M9 16l2 2 4-4"/>
    </svg>
  )
}

function IconTag() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
      <line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>
  )
}

function IconPhone() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.66 3.55a2 2 0 0 1 2-2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9a16 16 0 0 0 6.91 6.91l.82-.82a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.02z"/>
    </svg>
  )
}

function IconHistory() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4"/>
    </svg>
  )
}

function IconPromo() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
      <line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>
  )
}

function IconHelp() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  )
}

function IconShield() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  )
}

// ── Theme icons ───────────────────────────────────────────────────────────────
function IconSun({ active }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1"  x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22"  y1="4.22"  x2="5.64"  y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1"  y1="12" x2="3"  y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22"  y1="19.78" x2="5.64"  y2="18.36"/>
      <line x1="18.36" y1="5.64"  x2="19.78" y2="4.22"/>
    </svg>
  )
}

function IconMoon({ active }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  )
}

function IconAuto({ active }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 18a5 5 0 0 0-10 0"/>
      <line x1="12" y1="9" x2="12" y2="2"/>
      <line x1="4.22" y1="10.22" x2="5.64" y2="11.64"/>
      <line x1="1" y1="18" x2="3" y2="18"/>
      <line x1="21" y1="18" x2="23" y2="18"/>
      <line x1="18.36" y1="11.64" x2="19.78" y2="10.22"/>
      <line x1="23" y1="22" x2="1" y2="22"/>
      <polyline points="16 5 12 1 8 5"/>
    </svg>
  )
}

const THEME_OPTIONS = [
  { value: 'light',  Icon: IconSun,  label: 'Mode clair'  },
  { value: 'dark',   Icon: IconMoon, label: 'Mode sombre' },
  { value: 'system', Icon: IconAuto, label: 'Automatique' },
]

const SLOT_W = 46

function ThemeSwitcher({ theme, onChange }) {
  const idx = Math.max(0, THEME_OPTIONS.findIndex(t => t.value === theme))
  return (
    <div
      role="radiogroup"
      aria-label="Thème de l'interface"
      style={{
        position:     'relative',
        display:      'flex',
        width:        SLOT_W * 3,
        height:       44,
        borderRadius: 999,
        background:   '#091520',
        border:       '1px solid rgba(255,255,255,.08)',
        flexShrink:   0,
      }}
    >
      {/* Sliding glass indicator — perfect circle, centered in each slot */}
      <motion.div
        aria-hidden="true"
        initial={false}
        animate={{ x: 4 + idx * SLOT_W }}
        transition={{ type: 'spring', damping: 28, stiffness: 320, restDelta: 0.5 }}
        style={{
          position:     'absolute',
          top:          3,
          left:         0,
          width:        38,
          height:       38,
          borderRadius: '50%',
          background:   'linear-gradient(145deg, rgba(255,255,255,.18), rgba(255,255,255,.07))',
          border:       '1px solid rgba(255,255,255,.18)',
          boxShadow:    '0 2px 8px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.18)',
          pointerEvents:'none',
        }}
      />

      {/* Option buttons */}
      {THEME_OPTIONS.map((t) => {
        const active = theme === t.value
        return (
          <button
            key={t.value}
            role="radio"
            aria-checked={active}
            aria-label={t.label}
            onClick={() => onChange(t.value)}
            style={{
              position:        'relative',
              zIndex:          1,
              width:           SLOT_W,
              height:          44,
              display:         'flex',
              alignItems:      'center',
              justifyContent:  'center',
              cursor:          'pointer',
              background:      'none',
              border:          'none',
              padding:         0,
              color:           active ? '#F5F1E8' : 'rgba(245,241,232,.28)',
              transition:      'color .25s',
            }}
          >
            <t.Icon active={active} />
          </button>
        )
      })}
    </div>
  )
}

const NAV_ITEMS = [
  { view: 'home',    label: 'Accueil',          Icon: IconHome  },
  { view: 'reserve', label: 'Réserver',          Icon: IconCar,  accent: true },
  { view: 'tarifs',  label: 'Tarifs & services', Icon: IconTag   },
  { view: 'call',    label: 'Appeler',           Icon: IconPhone },
]

const SECONDARY = [
  { label: 'Mes courses',      view: 'courses', Icon: IconHistory },
  { label: 'Code promo',       view: 'promo',   Icon: IconPromo   },
  { label: 'Aide & FAQ',       view: 'faq',     Icon: IconHelp    },
  { label: 'Mentions légales', view: 'legal',   Icon: IconShield  },
]

// ── Animation variants ────────────────────────────────────────────────────────
// Power4.easeOut ≈ [0.22, 1, 0.36, 1]
const EXPO = [0.22, 1, 0.36, 1]

// X close button — each arm enters from its corner
const arm1Var = {
  closed: { x: -12, y: -12, opacity: 0, transition: { duration: 0.1 } },
  open:   { x: 0,   y: 0,   opacity: 1, transition: { duration: 0.58, ease: EXPO, delay: 0.28 } },
}
const arm2Var = {
  closed: { x: 12,  y: -12, opacity: 0, transition: { duration: 0.1 } },
  open:   { x: 0,   y: 0,   opacity: 1, transition: { duration: 0.58, ease: EXPO, delay: 0.38 } },
}

// Primary nav rows — stagger from bottom of panel
const navListVar = {
  closed: { transition: { staggerChildren: 0.025, staggerDirection: -1 } },
  open:   { transition: { staggerChildren: 0.07,  delayChildren: 0.14 } },
}

// Secondary nav rows — later cascade
const secListVar = {
  closed: { transition: { staggerChildren: 0.02, staggerDirection: -1 } },
  open:   { transition: { staggerChildren: 0.05, delayChildren: 0.40 } },
}

const rowVar = {
  closed: { opacity: 0, y: 18, transition: { duration: 0.14 } },
  open:   { opacity: 1, y: 0,  transition: { duration: 0.52, ease: EXPO } },
}

const footerVar = {
  closed: { opacity: 0, y: 10, transition: { duration: 0.12 } },
  open:   { opacity: 1, y: 0,  transition: { duration: 0.42, ease: EXPO, delay: 0.58 } },
}
// ─────────────────────────────────────────────────────────────────────────────

export default function SideDrawer({ open, onClose, activeView, onNavigate }) {
  const theme    = useBookingStore(s => s.theme)
  const setTheme = useBookingStore(s => s.setTheme)

  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const ani = open ? 'open' : 'closed'

  return (
    <>
      {/* Dark overlay */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className="fixed inset-0 z-[99998] bg-black/60 transition-opacity duration-300"
        style={{ opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none' }}
      />

      {/* Drawer panel */}
      <motion.nav
        id="side-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Menu principal"
        aria-hidden={!open}
        initial={false}
        animate={{ x: open ? 0 : '-110%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 280, restDelta: 0.5 }}
        drag={open ? 'x' : false}
        dragConstraints={{ right: 0, left: -350 }}
        dragElastic={{ left: 0.25, right: 0 }}
        onDragEnd={(_, info) => {
          if (info.offset.x < -70 || info.velocity.x < -400) onClose()
        }}
        className="fixed top-0 left-0 bottom-0 z-[99999] flex flex-col overflow-hidden"
        style={{
          width:        'min(78vw, 320px)',
          background:   'rgba(0,17,28,0.88)',
          backdropFilter: 'blur(28px) saturate(1.5)',
          WebkitBackdropFilter: 'blur(28px) saturate(1.5)',
          borderRight:  '1px solid rgba(255,255,255,.07)',
          pointerEvents: open ? 'auto' : 'none',
          boxShadow:    open ? '8px 0 60px rgba(0,0,0,.7), 2px 0 0 rgba(255,65,3,.04)' : 'none',
          willChange:   'transform',
        }}
      >
        {/* Ambient top halo */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 120% 50% at 0% 0%, rgba(255,65,3,.14), transparent 65%)' }}
        />

        <div
          className="relative z-10 flex flex-col h-full"
          style={{ paddingTop: 'calc(var(--safe-top) + 18px)' }}
        >
          {/* Header — close button, arms enter from corners */}
          <div className="flex items-center justify-end px-5 pb-6">
            <button
              onClick={onClose}
              aria-label="Fermer le menu"
              className="w-9 h-9 flex items-center justify-center rounded-full cursor-pointer active:scale-90 transition-transform select-none"
              style={{
                background: 'var(--fill-secondary)',
                border: '1px solid var(--separator)',
              }}
            >
              <svg
                width="12" height="12" viewBox="0 0 14 14"
                fill="none" strokeWidth="2" strokeLinecap="round"
                overflow="visible"
              >
                <motion.g initial="closed" animate={ani} variants={arm1Var}>
                  <path d="M1 1l12 12" stroke="rgba(245,241,232,.8)" />
                </motion.g>
                <motion.g initial="closed" animate={ani} variants={arm2Var}>
                  <path d="M13 1L1 13" stroke="rgba(245,241,232,.8)" />
                </motion.g>
              </svg>
            </button>
          </div>

          {/* Primary nav */}
          <motion.ul
            initial="closed"
            animate={ani}
            variants={navListVar}
            className="flex flex-col px-3 list-none"
            style={{ gap: 3 }}
          >
            {NAV_ITEMS.map((item) => {
              const isActive  = activeView === item.view
              const highlight = isActive || item.accent
              return (
                <motion.li key={item.view} variants={rowVar}>
                  <button
                    onClick={() => { onNavigate(item.view); onClose() }}
                    className="flex items-center gap-3.5 w-full rounded-xl px-3.5 py-3.5 cursor-pointer select-none transition-all duration-150 active:scale-[.97]"
                    style={{
                      background: highlight
                        ? 'linear-gradient(135deg, rgba(255,90,31,.16) 0%, rgba(255,65,3,.09) 100%)'
                        : 'transparent',
                      border:    highlight ? '1px solid rgba(255,65,3,.3)' : '1px solid transparent',
                      boxShadow: highlight ? '0 0 18px rgba(255,65,3,.1), inset 0 1px 0 rgba(255,255,255,.05)' : 'none',
                    }}
                  >
                    <span style={{
                      color:      highlight ? '#ff6120' : 'rgba(245,241,232,.38)',
                      flexShrink: 0,
                      filter:     highlight ? 'drop-shadow(0 0 5px rgba(255,80,10,.9))' : 'none',
                      transition: 'filter .2s, color .2s',
                    }}>
                      <item.Icon />
                    </span>
                    <span
                      className="text-[15px] font-semibold leading-none"
                      style={{ color: highlight ? '#F5F1E8' : 'rgba(245,241,232,.62)' }}
                    >
                      {item.label}
                    </span>
                  </button>
                </motion.li>
              )
            })}
          </motion.ul>

          {/* Separator */}
          <div className="mx-5 mt-4 mb-3" style={{ height: 1, background: 'rgba(255,65,3,.12)' }} />

          {/* Secondary links */}
          <motion.ul
            initial="closed"
            animate={ani}
            variants={secListVar}
            className="flex flex-col px-3 list-none"
            style={{ gap: 1 }}
          >
            {SECONDARY.map((item) => (
              <motion.li key={item.label} variants={rowVar}>
                <button
                  onClick={() => { if (item.view) onNavigate(item.view); onClose() }}
                  className="flex items-center gap-3 w-full rounded-xl px-3.5 py-3 cursor-pointer active:scale-[.97] transition-all duration-150 select-none"
                  style={{ background: 'transparent', border: '1px solid transparent' }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(255,65,3,.06)'
                    e.currentTarget.style.border = '1px solid rgba(255,65,3,.12)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.border = '1px solid transparent'
                  }}
                >
                  <span style={{ color: 'rgba(255,80,20,.65)', flexShrink: 0 }}>
                    <item.Icon />
                  </span>
                  <span
                    className="text-sm font-medium leading-none"
                    style={{ color: 'rgba(245,241,232,.72)' }}
                  >
                    {item.label}
                  </span>
                  <svg className="ml-auto" width="12" height="12" viewBox="0 0 24 24" fill="none"
                    stroke="rgba(255,65,3,.3)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </button>
              </motion.li>
            ))}
          </motion.ul>

          {/* Footer — theme switcher */}
          <motion.div
            initial="closed"
            animate={ani}
            variants={footerVar}
            className="flex items-center justify-between px-5 mt-auto"
            style={{
              borderTop:     '1px solid rgba(245,241,232,.07)',
              paddingTop:    16,
              paddingBottom: 'calc(var(--safe-bot) + 16px)',
            }}
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={theme}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.18 }}
                style={{ fontSize: 14, fontWeight: 500, color: 'rgba(245,241,232,.55)', userSelect: 'none' }}
              >
                {THEME_OPTIONS.find(t => t.value === theme)?.label ?? 'Mode sombre'}
              </motion.span>
            </AnimatePresence>
            <ThemeSwitcher theme={theme} onChange={setTheme} />
          </motion.div>
        </div>
      </motion.nav>
    </>
  )
}
