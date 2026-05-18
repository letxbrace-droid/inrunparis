import { useEffect } from 'react'
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
      <path d="M5 17H3a2 2 0 0 1-2-2V9l3-6h12l3 6v6a2 2 0 0 1-2 2h-2"/>
      <circle cx="7.5" cy="17" r="2.5"/>
      <circle cx="16.5" cy="17" r="2.5"/>
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

function DarkToggle({ isDark, onToggle }) {
  return (
    <button
      onClick={onToggle}
      role="switch"
      aria-checked={isDark}
      aria-label="Basculer le mode sombre"
      style={{
        position:   'relative',
        width:      68,
        height:     36,
        borderRadius: 99,
        background: '#0d1f2d',
        border:     `1.5px solid ${isDark ? 'rgba(255,65,3,.6)' : 'rgba(255,65,3,.3)'}`,
        boxShadow:  isDark
          ? '0 0 18px rgba(255,65,3,.45), inset 0 2px 4px rgba(0,0,0,.55)'
          : '0 0 6px rgba(255,65,3,.15), inset 0 2px 4px rgba(0,0,0,.3)',
        cursor:     'pointer',
        flexShrink: 0,
        transition: 'border-color .3s, box-shadow .3s',
        overflow:   'hidden',
        padding:    0,
      }}
    >
      <span style={{
        position:  'absolute',
        left:      9,
        top:       '50%',
        transform: 'translateY(-50%)',
        display:   'flex',
        opacity:   isDark ? 0.9 : 0.3,
        transition: 'opacity .25s',
        pointerEvents: 'none',
      }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="rgba(180,190,255,.95)">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      </span>

      <span style={{
        position:  'absolute',
        right:     9,
        top:       '50%',
        transform: 'translateY(-50%)',
        display:   'flex',
        opacity:   isDark ? 0.3 : 0.85,
        transition: 'opacity .25s',
        pointerEvents: 'none',
      }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,200,50,.95)" strokeWidth="2.5" strokeLinecap="round">
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
      </span>

      <span style={{
        position:   'absolute',
        top:        2,
        left:       0,
        width:      30,
        height:     30,
        borderRadius: '50%',
        background: 'radial-gradient(circle at 34% 30%, #ffffff 0%, #e8e8e8 38%, #c4c4c4 68%, #969696 100%)',
        boxShadow:  '0 3px 10px rgba(0,0,0,.55), 0 1px 3px rgba(0,0,0,.4), inset 0 1.5px 2px rgba(255,255,255,.9)',
        transform:  isDark ? 'translateX(36px)' : 'translateX(2px)',
        transition: 'transform .28s cubic-bezier(.34,1.56,.64,1)',
        pointerEvents: 'none',
      }} />
    </button>
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

export default function SideDrawer({ open, onClose, activeView, onNavigate }) {
  const isDark    = useBookingStore(s => s.isDark)
  const setIsDark = useBookingStore(s => s.setIsDark)

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
      <nav
        id="side-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Menu principal"
        aria-hidden={!open}
        className="fixed top-0 left-0 bottom-0 z-[99999] flex flex-col overflow-hidden will-change-transform"
        style={{
          width:        'min(78vw, 320px)',
          background:   'linear-gradient(180deg, #001f30 0%, #001621 100%)',
          transform:    open ? 'translateX(0)' : 'translateX(-100%)',
          visibility:   open ? 'visible' : 'hidden',
          pointerEvents: open ? 'auto' : 'none',
          transition:   `transform .32s cubic-bezier(.16,1,.3,1), visibility 0s linear ${open ? '0s' : '.32s'}`,
          boxShadow:    open ? '8px 0 48px rgba(0,0,0,.6)' : 'none',
        }}
      >
        {/* Ambient top halo */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 100% 55% at 50% 0%, rgba(255,65,3,.08), transparent 70%)' }}
        />

        <div
          className="relative z-10 flex flex-col h-full"
          style={{ paddingTop: 'calc(var(--safe-top) + 18px)' }}
        >
          {/* Header — close button only, no logo */}
          <div className="flex items-center justify-end px-5 pb-6">
            <button
              onClick={onClose}
              aria-label="Fermer le menu"
              className="w-9 h-9 flex items-center justify-center rounded-full cursor-pointer active:scale-90 transition-transform select-none"
              style={{
                background: 'linear-gradient(145deg, #002535, #001a28)',
                boxShadow: '3px 3px 10px rgba(0,0,0,.5), -1px -1px 4px rgba(255,255,255,.03)',
                border: '1px solid rgba(255,255,255,.07)',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="rgba(245,241,232,.7)" strokeWidth="2" strokeLinecap="round">
                <path d="M1 1l12 12M13 1L1 13"/>
              </svg>
            </button>
          </div>

          {/* Primary nav */}
          <ul className="flex flex-col px-3 list-none" style={{ gap: 3 }}>
            {NAV_ITEMS.map((item) => {
              const isActive = activeView === item.view
              const highlight = isActive || item.accent
              return (
                <li key={item.view}>
                  <button
                    onClick={() => { onNavigate(item.view); onClose() }}
                    className="flex items-center gap-3.5 w-full rounded-xl px-3.5 py-3.5 cursor-pointer select-none transition-all duration-150 active:scale-[.97]"
                    style={{
                      background: highlight ? 'rgba(255,65,3,.1)' : 'transparent',
                      border:     highlight ? '1px solid rgba(255,65,3,.22)' : '1px solid transparent',
                    }}
                  >
                    <span style={{ color: highlight ? '#ff4103' : 'rgba(245,241,232,.42)', flexShrink: 0 }}>
                      <item.Icon />
                    </span>
                    <span
                      className="text-[15px] font-semibold leading-none"
                      style={{ color: highlight ? '#F5F1E8' : 'rgba(245,241,232,.62)' }}
                    >
                      {item.label}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>

          {/* Separator */}
          <div className="mx-5 mt-4 mb-3" style={{ height: 1, background: 'rgba(255,65,3,.12)' }} />

          {/* Secondary links — redesigned with proper size & icons */}
          <ul className="flex flex-col px-3 list-none" style={{ gap: 1 }}>
            {SECONDARY.map((item) => (
              <li key={item.label}>
                <button
                  onClick={() => { if (item.view) onNavigate(item.view); onClose() }}
                  className="flex items-center gap-3 w-full rounded-xl px-3.5 py-3 cursor-pointer active:scale-[.97] transition-all duration-150 select-none"
                  style={{
                    background: 'transparent',
                    border: '1px solid transparent',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(255,65,3,.06)'
                    e.currentTarget.style.border = '1px solid rgba(255,65,3,.12)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.border = '1px solid transparent'
                  }}
                >
                  <span style={{ color: 'rgba(255,65,3,.45)', flexShrink: 0 }}>
                    <item.Icon />
                  </span>
                  <span
                    className="text-sm font-medium leading-none"
                    style={{ color: 'rgba(245,241,232,.65)' }}
                  >
                    {item.label}
                  </span>
                  <svg className="ml-auto" width="12" height="12" viewBox="0 0 24 24" fill="none"
                    stroke="rgba(255,65,3,.3)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </button>
              </li>
            ))}
          </ul>

          {/* Footer: Mode sombre toggle */}
          <div
            className="flex items-center justify-between px-5 mt-auto"
            style={{
              borderTop:     '1px solid rgba(245,241,232,.07)',
              paddingTop:    16,
              paddingBottom: 'calc(var(--safe-bot) + 16px)',
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 500, color: 'rgba(245,241,232,.55)', userSelect: 'none' }}>
              Mode sombre
            </span>
            <DarkToggle isDark={isDark} onToggle={() => setIsDark(!isDark)} />
          </div>
        </div>
      </nav>
    </>
  )
}
