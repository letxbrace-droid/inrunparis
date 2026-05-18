import { useEffect } from 'react'

const NAV_ITEMS = [
  { view: 'home',    label: 'Accueil',  arrow: '→' },
  { view: 'reserve', label: 'Réserver', arrow: '→', accent: true },
  { view: 'tarifs',  label: 'Tarifs',   arrow: '→' },
  { view: 'call',    label: 'Appeler',  arrow: '→' },
]

export default function SideDrawer({ open, onClose, activeView, onNavigate }) {
  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`
          fixed inset-0 z-[99999] bg-black/50
          transition-opacity duration-300
          ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
      />

      {/* Drawer panel */}
      <nav
        id="side-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Menu principal"
        aria-hidden={!open}
        className="
          fixed inset-0 z-[100000] flex flex-col
          bg-[#06070D] overflow-hidden
          transition-[transform,visibility] duration-[340ms]
          ease-[cubic-bezier(.16,1,.3,1)]
          will-change-transform
        "
        style={{
          transform:  open ? 'translateX(0)' : 'translateX(-100%)',
          visibility: open ? 'visible' : 'hidden',
        }}
      >
        {/* Ambient halo */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255,65,3,.05), transparent 70%)' }}
        />

        {/* Inner */}
        <div className="relative z-10 flex flex-col h-full pt-safe" style={{ paddingTop: `calc(var(--safe-top) + 16px)` }}>

          {/* Header */}
          <div className="flex items-center justify-between px-6 pb-4">
            <span className="font-brand font-bold text-ink-primary text-base tracking-widest uppercase">
              I&amp;N RUN
            </span>
            <button
              onClick={onClose}
              aria-label="Fermer le menu"
              className="w-9 h-9 flex items-center justify-center glass rounded-xl cursor-pointer active:scale-95 transition-transform"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M1 1l12 12M13 1L1 13" />
              </svg>
            </button>
          </div>

          {/* Main nav */}
          <ul className="flex-1 flex flex-col justify-center px-6 list-none">
            {NAV_ITEMS.map((item, i) => (
              <li
                key={item.view}
                className="border-b border-[var(--rule)]"
                style={{ animationDelay: open ? `${i * 0.05 + 0.04}s` : '0s' }}
              >
                <button
                  onClick={() => { onNavigate(item.view); onClose() }}
                  className="
                    flex items-center gap-4 w-full py-[22px]
                    bg-transparent border-none text-left cursor-pointer
                    group transition-transform duration-150 active:scale-[.98]
                    -webkit-tap-highlight-color-transparent
                  "
                >
                  <span
                    className="flex-1 font-[Outfit,system-ui,sans-serif] font-bold uppercase tracking-[0.04em] leading-none"
                    style={{
                      fontSize: 'clamp(1.8rem, 7vw, 2.4rem)',
                      color: item.accent
                        ? '#ff4103'
                        : activeView === item.view
                          ? 'var(--ink-primary)'
                          : 'rgba(245,241,232,.5)',
                      textShadow: item.accent ? '0 0 28px rgba(255,65,3,.4)' : 'none',
                    }}
                  >
                    {item.label}
                  </span>
                  <span
                    className="text-lg opacity-0 group-active:opacity-100 transition-opacity"
                    style={{ color: item.accent ? '#ff4103' : 'var(--ink-muted)' }}
                    aria-hidden="true"
                  >
                    {item.arrow}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          {/* Footer */}
          <div className="px-6 pb-safe" style={{ paddingBottom: `calc(var(--safe-bot) + 24px)` }}>
            <p className="font-mono text-[10px] text-ink-muted tracking-widest text-center uppercase">
              I&amp;N RUN · Paris &amp; Île-de-France
            </p>
          </div>
        </div>
      </nav>
    </>
  )
}
