import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function InstallPrompt() {
  const [prompt,  setPrompt]  = useState(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) return
    if (sessionStorage.getItem('pwa-dismissed')) return

    const handler = (e) => {
      e.preventDefault()
      setPrompt(e)
      setTimeout(() => setVisible(true), 4500)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const install = async () => {
    if (!prompt) return
    prompt.prompt()
    await prompt.userChoice
    setPrompt(null)
    setVisible(false)
  }

  const dismiss = () => {
    sessionStorage.setItem('pwa-dismissed', '1')
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 72, opacity: 0, scale: 0.96 }}
          animate={{ y: 0,  opacity: 1, scale: 1    }}
          exit={{    y: 72, opacity: 0, scale: 0.96 }}
          transition={{ type: 'spring', damping: 26, stiffness: 260 }}
          style={{
            position:  'fixed',
            bottom:    'calc(var(--safe-bot) + 96px)',
            left:      16,
            right:     16,
            maxWidth:  500,
            marginInline: 'auto',
            zIndex:    19,
          }}
        >
          <div style={{
            display:        'flex',
            alignItems:     'center',
            gap:            12,
            padding:        '11px 12px 11px 14px',
            borderRadius:   20,
            background:     'rgba(0,16,26,0.90)',
            border:         '1px solid rgba(255,65,3,.28)',
            backdropFilter: 'blur(24px) saturate(1.5)',
            WebkitBackdropFilter: 'blur(24px) saturate(1.5)',
            boxShadow:      '0 12px 40px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.07)',
          }}>
            {/* App icon */}
            <img
              src="/inrunparis/icon-192.png"
              alt=""
              aria-hidden="true"
              style={{ width: 42, height: 42, borderRadius: 11, flexShrink: 0 }}
            />

            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#F5F1E8', lineHeight: 1.25, margin: 0 }}>
                Installer I&amp;N RUN
              </p>
              <p style={{ fontSize: 11, color: 'rgba(245,241,232,.48)', marginTop: 2, margin: 0 }}>
                Accès direct depuis votre écran d'accueil
              </p>
            </div>

            {/* Install CTA */}
            <button
              onClick={install}
              style={{
                flexShrink:   0,
                padding:      '8px 15px',
                borderRadius: 11,
                background:   '#ff4103',
                border:       'none',
                color:        '#fff',
                fontSize:     12,
                fontWeight:   700,
                cursor:       'pointer',
                letterSpacing: '.02em',
                boxShadow:    '0 2px 10px rgba(255,65,3,.45)',
              }}
            >
              Installer
            </button>

            {/* Dismiss */}
            <button
              onClick={dismiss}
              aria-label="Fermer"
              style={{
                flexShrink:     0,
                width:          28,
                height:         28,
                borderRadius:   '50%',
                background:     'rgba(255,255,255,.06)',
                border:         '1px solid rgba(255,255,255,.08)',
                color:          'rgba(245,241,232,.35)',
                cursor:         'pointer',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                padding:        0,
              }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6"  x2="6"  y2="18"/>
                <line x1="6"  y1="6"  x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
