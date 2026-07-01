import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useBookingStore from '../../store/useBookingStore'
import { subscribeToVapid, isPushSupported, encodeSubscription, registerWithWorker } from '../../utils/pushNotifications'
import SignatureTrace from '../ui/SignatureTrace'

// ── Icons ─────────────────────────────────────────────────────────────────────

function IconSun() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  )
}
function IconMoon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  )
}
function IconAuto() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 18a5 5 0 0 0-10 0"/>
      <line x1="12" y1="9" x2="12" y2="2"/>
      <line x1="4.22" y1="10.22" x2="5.64" y2="11.64"/>
      <line x1="1" y1="18" x2="3" y2="18"/><line x1="21" y1="18" x2="23" y2="18"/>
      <line x1="18.36" y1="11.64" x2="19.78" y2="10.22"/>
      <line x1="23" y1="22" x2="1" y2="22"/>
      <polyline points="16 5 12 1 8 5"/>
    </svg>
  )
}

const THEME_OPTIONS = [
  { value: 'light',  Icon: IconSun,  label: 'Clair'   },
  { value: 'dark',   Icon: IconMoon, label: 'Sombre'  },
  { value: 'system', Icon: IconAuto, label: 'Auto'    },
]

const SLOT_W = 46

function ThemeSwitcher({ theme, onChange, isDark }) {
  const idx = Math.max(0, THEME_OPTIONS.findIndex(t => t.value === theme))
  return (
    <div
      role="radiogroup"
      aria-label="Thème"
      style={{
        position:     'relative',
        display:      'flex',
        width:        SLOT_W * 3,
        height:       44,
        borderRadius: 999,
        background:   isDark ? '#111111' : '#E8E5E0',
        border:       `1px solid ${isDark ? 'rgba(255,255,255,.10)' : 'rgba(0,0,0,.10)'}`,
        flexShrink:   0,
      }}
    >
      <motion.div
        aria-hidden="true"
        initial={false}
        animate={{ x: 4 + idx * SLOT_W }}
        transition={{ type: 'spring', damping: 28, stiffness: 320, restDelta: 0.5 }}
        style={{
          position:     'absolute',
          top:          3, left: 0,
          width:        38, height: 38,
          borderRadius: '50%',
          background:   isDark
            ? 'linear-gradient(145deg, rgba(255,255,255,.20), rgba(255,255,255,.08))'
            : 'linear-gradient(145deg, #FFFFFF, #F0EDE8)',
          border:       `1px solid ${isDark ? 'rgba(255,255,255,.20)' : 'rgba(0,0,0,.12)'}`,
          boxShadow:    isDark
            ? '0 2px 8px rgba(0,0,0,.5)'
            : '0 2px 8px rgba(0,0,0,.15)',
          pointerEvents:'none',
        }}
      />
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
              position: 'relative', zIndex: 1,
              width: SLOT_W, height: 44,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', background: 'none', border: 'none', padding: 0,
              color: active
                ? (isDark ? '#F5F1E8' : '#111111')
                : (isDark ? 'rgba(245,241,232,.30)' : 'rgba(17,17,17,.30)'),
              transition: 'color .25s',
            }}
          >
            <t.Icon />
          </button>
        )
      })}
    </div>
  )
}

// ── Nav config ────────────────────────────────────────────────────────────────
// Jobs hierarchy: the primary list is ONLY the actions a rider actually comes
// here to do. Everything reference/occasional lives in secondary. The campaign
// gets its own offer card so it never competes as a peer with "Mentions légales".

const NAV_ITEMS = [
  { view: 'reserve', label: 'Réserver'    },
  { view: 'courses', label: 'Mes courses' },
  { view: 'call',    label: 'Appeler'     },
]

const SECONDARY = [
  { label: 'Tarifs',           view: 'tarifs' },
  { label: 'Code promo',       view: 'promo'  },
  { label: 'Aide & FAQ',       view: 'faq'    },
  { label: 'Mentions légales', view: 'legal'  },
]

// ── Animations ────────────────────────────────────────────────────────────────

const EXPO = [0.22, 1, 0.36, 1]

const arm1Var = {
  closed: { x: -12, y: -12, opacity: 0, transition: { duration: 0.1 } },
  open:   { x: 0,   y: 0,   opacity: 1, transition: { duration: 0.58, ease: EXPO, delay: 0.28 } },
}
const arm2Var = {
  closed: { x: 12,  y: -12, opacity: 0, transition: { duration: 0.1 } },
  open:   { x: 0,   y: 0,   opacity: 1, transition: { duration: 0.58, ease: EXPO, delay: 0.38 } },
}

const navListVar = {
  closed: { transition: { staggerChildren: 0.02,  staggerDirection: -1 } },
  open:   { transition: { staggerChildren: 0.08,  delayChildren: 0.10 } },
}
const secListVar = {
  closed: { transition: { staggerChildren: 0.015, staggerDirection: -1 } },
  open:   { transition: { staggerChildren: 0.045, delayChildren: 0.44 } },
}
const rowVar = {
  closed: { opacity: 0, y: 22, transition: { duration: 0.14 } },
  open:   { opacity: 1, y: 0,  transition: { duration: 0.54, ease: EXPO } },
}
const footerVar = {
  closed: { opacity: 0, y: 10, transition: { duration: 0.12 } },
  open:   { opacity: 1, y: 0,  transition: { duration: 0.42, ease: EXPO, delay: 0.60 } },
}
const offerVar = {
  closed: { opacity: 0, y: 16, transition: { duration: 0.12 } },
  open:   { opacity: 1, y: 0,  transition: { duration: 0.52, ease: EXPO, delay: 0.40 } },
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function SideDrawer({ open, onClose, activeView, onNavigate }) {
  const theme    = useBookingStore(s => s.theme)
  const setTheme = useBookingStore(s => s.setTheme)
  const isDark   = useBookingStore(s => s.isDark)

  const pushSupported = isPushSupported()
  const isIOSBrowser  = /iPad|iPhone|iPod/.test(navigator.userAgent) &&
                        !window.matchMedia('(display-mode: standalone)').matches &&
                        !window.navigator.standalone

  const [notifPerm,    setNotifPerm]    = useState(() => pushSupported ? Notification.permission : 'unsupported')
  const [notifPending, setNotifPending] = useState(false)
  const [subEncoded,   setSubEncoded]   = useState(null)

  const handleNotifToggle = async () => {
    if (notifPerm === 'granted' || notifPending) return
    if (isIOSBrowser) {
      alert('Pour activer les notifications sur iPhone, installez d\'abord l\'app : Safari → Partager → Sur l\'écran d\'accueil, puis ouvrez-la depuis l\'icône.')
      return
    }
    setNotifPending(true)
    try {
      const perm = await Notification.requestPermission()
      setNotifPerm(perm)
      if (perm === 'granted') {
        const sub = await subscribeToVapid()
        if (sub) {
          // Auto-register with the hub Worker; only fall back to the
          // manual WhatsApp share if the Worker is unreachable.
          const registered = await registerWithWorker(sub)
          if (!registered) setSubEncoded(encodeSubscription(sub))
        }
      }
    } catch {
      setNotifPerm('Notification' in window ? Notification.permission : 'default')
    } finally {
      setNotifPending(false)
    }
  }

  const bg      = isDark ? '#0A0A0A' : '#FAFAF8'
  const inkFull = isDark ? '#F5F1E8' : '#0D0D0D'
  const inkDim  = isDark ? 'rgba(245,241,232,.42)' : 'rgba(13,13,13,.62)'
  const border  = isDark ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.08)'

  useEffect(() => {
    if (!open) return
    const h = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [open, onClose])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const ani = open ? 'open' : 'closed'

  return (
    <>
      {/* Scrim */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className="fixed inset-0 z-[99998] transition-opacity duration-300"
        style={{
          background:    isDark ? 'rgba(0,0,0,.65)' : 'rgba(0,0,0,.35)',
          opacity:       open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
        }}
      />

      {/* Panel */}
      <motion.nav
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
          width:               'min(82vw, 310px)',
          background:          isDark ? 'rgba(6,7,14,0.84)' : 'rgba(252,251,248,0.90)',
          backdropFilter:      'blur(28px) saturate(160%)',
          WebkitBackdropFilter:'blur(28px) saturate(160%)',
          borderRight:         `1px solid ${border}`,
          pointerEvents:       open ? 'auto' : 'none',
          boxShadow:           open
            ? (isDark ? '20px 0 60px rgba(0,0,0,.95)' : '20px 0 60px rgba(0,0,0,.18)')
            : 'none',
          willChange:          'transform',
        }}
      >
        {/* Accent top line */}
        <div
          aria-hidden="true"
          className="absolute top-0 left-0 right-0 h-[2px] pointer-events-none"
          style={{ background: 'linear-gradient(90deg, var(--accent) 0%, transparent 55%)' }}
        />
        {/* Ambient mesh gradient */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background: isDark
              ? 'radial-gradient(ellipse 200% 140px at 55% 0, rgba(255,90,31,0.11), transparent 55%)'
              : 'radial-gradient(ellipse 200% 120px at 55% 0, rgba(255,90,31,0.06), transparent 55%)',
          }}
        />

        <div
          className="relative z-10 flex flex-col h-full"
          style={{ paddingTop: 'calc(var(--safe-top) + 14px)' }}
        >
          {/* Close */}
          <div className="flex justify-end px-5 pb-6">
            <button
              onClick={onClose}
              aria-label="Fermer le menu"
              className="w-10 h-10 flex items-center justify-center rounded-full cursor-pointer active:scale-90 transition-transform select-none"
              style={{
                background: isDark ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.06)',
                border:     `1px solid ${border}`,
              }}
            >
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none" strokeWidth="2.2" strokeLinecap="round" overflow="visible">
                <motion.g initial="closed" animate={ani} variants={arm1Var}>
                  <path d="M1 1l12 12" stroke={inkFull} />
                </motion.g>
                <motion.g initial="closed" animate={ani} variants={arm2Var}>
                  <path d="M13 1L1 13" stroke={inkFull} />
                </motion.g>
              </svg>
            </button>
          </div>

          {/* ── BRAND LOCKUP — the signature answers « à qui c'est ? » ── */}
          <motion.div
            initial="closed"
            animate={ani}
            variants={rowVar}
            className="px-6 pb-7 flex flex-col gap-2.5"
          >
            <span style={{ fontSize: 21, fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1, color: inkFull }}>
              I&amp;N<span style={{ color: 'var(--accent)' }}> RUN</span>
            </span>
            {open && <SignatureTrace width={140} />}
          </motion.div>

          {/* ── PRIMARY NAV — Heetch-style editorial ── */}
          <motion.ul
            initial="closed"
            animate={ani}
            variants={navListVar}
            className="flex flex-col list-none px-6"
            style={{ gap: 0 }}
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeView === item.view
              return (
                <motion.li key={item.view} variants={rowVar}>
                  <button
                    onClick={() => { onNavigate(item.view); onClose() }}
                    className="w-full text-left cursor-pointer select-none active:scale-[.97] transition-transform duration-100 py-3"
                    style={{ background: 'none', border: 'none', padding: '14px 0' }}
                  >
                    <span
                      style={{
                        display:       'block',
                        fontSize:      isActive ? 28 : 26,
                        fontWeight:    isActive ? 900 : 800,
                        letterSpacing: isActive ? '-0.03em' : '-0.02em',
                        lineHeight:    1.08,
                        textTransform: 'uppercase',
                        color:         isActive ? inkFull : inkDim,
                        transition:    'color .22s, font-size .22s',
                      }}
                    >
                      {item.label}
                    </span>
                    {/* Active indicator — thin orange line under text */}
                    {isActive && (
                      <motion.div
                        layoutId="activeBar"
                        style={{
                          height:     2,
                          width:      28,
                          marginTop:  6,
                          background: 'var(--accent)',
                          borderRadius: 999,
                        }}
                      />
                    )}
                  </button>
                </motion.li>
              )
            })}
          </motion.ul>

          {/* Separator */}
          <div className="mx-6 my-4" style={{ height: 1, background: border }} />

          {/* ── OFFER CARD — campaign, quarantined to its own surface ── */}
          <motion.button
            initial="closed"
            animate={ani}
            variants={offerVar}
            onClick={() => { onNavigate('coupe26'); onClose() }}
            className="relative flex items-center gap-3 mx-6 mb-4 rounded-2xl px-3.5 py-3 cursor-pointer select-none active:scale-[.98] transition-transform duration-100 overflow-hidden"
            style={{
              background: isDark
                ? 'linear-gradient(135deg, rgba(245,197,24,.10), rgba(245,197,24,.03))'
                : 'linear-gradient(135deg, rgba(245,197,24,.16), rgba(245,197,24,.06))',
              border: '1px solid rgba(245,197,24,.30)',
            }}
            aria-label="Coupe du Monde 2026 — offre −10%"
          >
            {/* Icon tile */}
            <span
              className="flex items-center justify-center flex-shrink-0 rounded-xl text-[17px] leading-none"
              style={{
                width: 38, height: 38,
                background: 'rgba(245,197,24,.16)',
                border: '1px solid rgba(245,197,24,.30)',
              }}
              aria-hidden="true"
            >
              ⚽
            </span>
            <span className="flex flex-col flex-1 min-w-0 text-left">
              <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em', color: isDark ? '#F5F1E8' : '#1a1505' }}>
                Coupe du Monde 2026
              </span>
              <span style={{ fontSize: 11.5, fontWeight: 500, color: isDark ? 'rgba(245,197,24,.78)' : 'rgba(160,120,10,.95)' }}>
                −10% sur vos trajets
              </span>
            </span>
            <span
              className="flex-shrink-0"
              style={{
                fontSize: 11, fontWeight: 800, letterSpacing: '.03em',
                color: '#0D0D0D', background: '#F5C518',
                borderRadius: 999, padding: '3px 9px',
              }}
            >
              −10%
            </span>
          </motion.button>

          {/* ── SECONDARY NAV ── */}
          <motion.ul
            initial="closed"
            animate={ani}
            variants={secListVar}
            className="flex flex-col px-6 list-none"
            style={{ gap: 0 }}
          >
            {SECONDARY.map((item) => (
              <motion.li key={item.label} variants={rowVar}>
                <button
                  onClick={() => { if (item.view) onNavigate(item.view); onClose() }}
                  className="flex items-center justify-between w-full cursor-pointer select-none active:scale-[.98] transition-transform duration-100"
                  style={{ background: 'none', border: 'none', padding: '10px 0' }}
                >
                  <span className="flex items-center gap-2">
                    <span style={{
                      fontSize:      15,
                      fontWeight:    500,
                      letterSpacing: '-0.01em',
                      color:         isDark ? 'rgba(245,241,232,.72)' : 'rgba(17,17,17,.68)',
                    }}>
                      {item.label}
                    </span>
                    {item.badge && (
                      <span style={{
                        fontSize:      10,
                        fontWeight:    700,
                        letterSpacing: '.04em',
                        color:         '#E8B84B',
                        border:        '1px solid rgba(232,184,75,.4)',
                        borderRadius:  999,
                        padding:       '2px 7px',
                      }}>
                        {item.badge}
                      </span>
                    )}
                  </span>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                    stroke={isDark ? 'rgba(245,241,232,.28)' : 'rgba(17,17,17,.25)'}
                    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </button>
              </motion.li>
            ))}

            {/* Push notifications opt-in */}
            {(pushSupported || isIOSBrowser) && notifPerm !== 'denied' && (
              <motion.li variants={rowVar}>
                <button
                  onClick={handleNotifToggle}
                  disabled={notifPerm === 'granted'}
                  className="flex items-center justify-between w-full cursor-pointer select-none active:scale-[.98] transition-transform duration-100 disabled:cursor-default"
                  style={{ background: 'none', border: 'none', padding: '10px 0' }}
                  aria-label={notifPerm === 'granted' ? 'Notifications activées' : 'Activer les notifications'}
                >
                  <span style={{
                    fontSize:      15,
                    fontWeight:    500,
                    letterSpacing: '-0.01em',
                    color:         isDark ? 'rgba(245,241,232,.72)' : 'rgba(17,17,17,.68)',
                  }}>
                    Notifications
                  </span>
                  <span style={{
                    fontSize:      11,
                    fontWeight:    600,
                    letterSpacing: '0.03em',
                    textTransform: 'uppercase',
                    color: notifPerm === 'granted' ? 'var(--positive)' : 'var(--accent)',
                    opacity: notifPending ? 0.5 : 1,
                    transition: 'opacity .2s',
                  }}>
                    {notifPerm === 'granted' ? 'Activées' : notifPending ? 'En cours…' : isIOSBrowser ? 'Installer' : 'Activer'}
                  </span>
                </button>
                {/* WhatsApp share button — shown once after successful subscription */}
                {notifPerm === 'granted' && subEncoded && (
                  <a
                    href={`https://wa.me/33767742220?text=${encodeURIComponent('NOTIF:' + subEncoded)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display:        'flex',
                      alignItems:     'center',
                      gap:            8,
                      marginTop:      4,
                      marginBottom:   8,
                      padding:        '9px 14px',
                      borderRadius:   12,
                      background:     '#25D366',
                      color:          '#fff',
                      fontSize:       13,
                      fontWeight:     600,
                      textDecoration: 'none',
                      cursor:         'pointer',
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    Envoyer mon abonnement au chauffeur
                  </a>
                )}
              </motion.li>
            )}
          </motion.ul>

          {/* ── FOOTER — theme switcher ── */}
          <motion.div
            initial="closed"
            animate={ani}
            variants={footerVar}
            className="flex items-center justify-between px-6 mt-auto"
            style={{
              borderTop:     `1px solid ${border}`,
              paddingTop:    16,
              paddingBottom: 'calc(var(--safe-bot) + 16px)',
            }}
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={theme}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
                style={{
                  fontSize:   13,
                  fontWeight: 500,
                  color:      isDark ? 'rgba(245,241,232,.45)' : 'rgba(17,17,17,.42)',
                  userSelect: 'none',
                }}
              >
                {THEME_OPTIONS.find(t => t.value === theme)?.label ?? 'Sombre'}
              </motion.span>
            </AnimatePresence>
            <ThemeSwitcher theme={theme} onChange={setTheme} isDark={isDark} />
          </motion.div>
        </div>
      </motion.nav>
    </>
  )
}
