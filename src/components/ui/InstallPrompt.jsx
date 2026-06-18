import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
const isInStandalone =
  window.matchMedia('(display-mode: standalone)').matches ||
  window.navigator.standalone === true

// Shared animation
const SPRING = { type: 'spring', damping: 26, stiffness: 260 }
const SLIDE  = { initial: { y: 72, opacity: 0, scale: 0.96 }, animate: { y: 0, opacity: 1, scale: 1 }, exit: { y: 72, opacity: 0, scale: 0.96 }, transition: SPRING }

// iOS share icon (SF-style, outline)
function ShareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"
      style={{ display: 'inline-block', verticalAlign: '-2px', margin: '0 2px' }}>
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
      <polyline points="16 6 12 2 8 6"/>
      <line x1="12" y1="2" x2="12" y2="15"/>
    </svg>
  )
}

function PillBase({ children }) {
  return (
    <div style={{
      display:      'flex',
      alignItems:   'center',
      gap:          12,
      padding:      '11px 12px 11px 14px',
      borderRadius: 20,
      background:   '#0F0F0F',
      border:       '1px solid color-mix(in srgb, var(--accent) 28%, transparent)',
      boxShadow:    '0 12px 40px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.07)',
    }}>
      {children}
    </div>
  )
}

function DismissBtn({ onClick }) {
  return (
    <button onClick={onClick} aria-label="Fermer" style={{
      flexShrink: 0, width: 28, height: 28, borderRadius: '50%',
      background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.08)',
      color: 'rgba(245,241,232,.35)', cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
    }}>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <line x1="18" y1="6"  x2="6"  y2="18"/>
        <line x1="6"  y1="6"  x2="18" y2="18"/>
      </svg>
    </button>
  )
}

function AppIcon() {
  return (
    <img src="/inrunparis/icon-192.png" alt="" aria-hidden="true"
      style={{ width: 42, height: 42, borderRadius: 11, flexShrink: 0 }} />
  )
}

// ── Android / Desktop banner ──────────────────────────────────────────────────
function AndroidBanner({ onInstall, onDismiss }) {
  return (
    <PillBase>
      <AppIcon />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#F5F1E8', lineHeight: 1.25, margin: 0 }}>
          Installer I&amp;N RUN
        </p>
        <p style={{ fontSize: 11, color: 'rgba(245,241,232,.48)', marginTop: 2, margin: 0 }}>
          Accès direct depuis votre écran d'accueil
        </p>
      </div>
      <button onClick={onInstall} style={{
        flexShrink: 0, padding: '8px 15px', borderRadius: 11,
        background: 'var(--accent)', border: 'none', color: '#fff',
        fontSize: 12, fontWeight: 700, cursor: 'pointer', letterSpacing: '.02em',
        boxShadow: '0 2px 10px color-mix(in srgb, var(--accent) 45%, transparent)',
      }}>
        Installer
      </button>
      <DismissBtn onClick={onDismiss} />
    </PillBase>
  )
}

// ── iOS banner ────────────────────────────────────────────────────────────────
function IOSBanner({ onDismiss }) {
  return (
    <PillBase>
      <AppIcon />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#F5F1E8', lineHeight: 1.25, margin: 0 }}>
          Installer I&amp;N RUN
        </p>
        <p style={{ fontSize: 11, color: 'rgba(245,241,232,.52)', marginTop: 2, margin: '2px 0 0' }}>
          Appuyez sur <ShareIcon /> puis <strong style={{ color: '#F5F1E8' }}>« Sur l'écran d'accueil »</strong>
        </p>
      </div>
      <DismissBtn onClick={onDismiss} />
    </PillBase>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function InstallPrompt() {
  const [prompt,  setPrompt]  = useState(null)   // Android deferred prompt
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isInStandalone) return
    if (sessionStorage.getItem('pwa-dismissed')) return

    if (isIOS) {
      // iOS never fires beforeinstallprompt — show the guide directly
      const t = setTimeout(() => setVisible(true), 5000)
      return () => clearTimeout(t)
    }

    // Android / Chrome
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

  const wrapperStyle = {
    position: 'fixed',
    bottom:   'calc(var(--safe-bot) + 96px)',
    left:     16,
    right:    16,
    maxWidth: 500,
    marginInline: 'auto',
    zIndex:   19,
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div {...SLIDE} style={wrapperStyle}>
          {isIOS
            ? <IOSBanner onDismiss={dismiss} />
            : <AndroidBanner onInstall={install} onDismiss={dismiss} />
          }
        </motion.div>
      )}
    </AnimatePresence>
  )
}
