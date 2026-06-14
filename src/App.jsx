import { useState, useEffect } from 'react'
import { AnimatePresence, MotionConfig } from 'framer-motion'
import LeafletMap          from './components/map/LeafletMap'
import TopBar              from './components/layout/TopBar'
import SideDrawer          from './components/layout/SideDrawer'
import BottomSheet         from './components/tunnel/BottomSheet'
import TarifsView          from './components/views/TarifsView'
import CallView            from './components/views/CallView'
import MesCoursesView      from './components/views/MesCoursesView'
import CodePromoView       from './components/views/CodePromoView'
import Coupe2026View       from './components/views/Coupe2026View'
import AideFaqView         from './components/views/AideFaqView'
import LegalView           from './components/views/LegalView'
import HomePill            from './components/home/HomePill'
import CampaignBanner      from './components/home/CampaignBanner'
import AwaitingCard        from './components/home/AwaitingCard'
import BookingConfirmToast from './components/ui/BookingConfirmToast'
import InstallPrompt       from './components/ui/InstallPrompt'
import SplashScreen        from './components/ui/SplashScreen'
import useBookingStore     from './store/useBookingStore'

const OVERLAY_VIEWS = ['tarifs', 'call', 'courses', 'promo', 'coupe26', 'faq', 'legal']

const SPLASH_KEY = 'inr-splash'

export default function App() {
  const [splash,      setSplash]      = useState(() => !sessionStorage.getItem(SPLASH_KEY))
  const [drawerOpen,  setDrawerOpen]  = useState(false)
  const [sheetOpen,   setSheetOpen]   = useState(false)
  const [sheetStep,   setSheetStep]   = useState(1)
  const [activeView,  setActiveView]  = useState('home')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmBon,  setConfirmBon]  = useState(null)

  const depart        = useBookingStore((s) => s.depart)
  const arrive        = useBookingStore((s) => s.arrive)
  const routeGeometry = useBookingStore((s) => s.routeGeometry)
  const isDark        = useBookingStore((s) => s.isDark)
  const theme         = useBookingStore((s) => s.theme)
  const setIsDark     = useBookingStore((s) => s.setIsDark)

  // Sync theme to <html data-theme> so CSS variables switch globally
  useEffect(() => {
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light'
  }, [isDark])

  // Auto mode: Paris sunrise/sunset by month [rise_h, set_h] local time
  useEffect(() => {
    if (theme !== 'system') return
    const PARIS_SUN = [
      [8,17],[8,18],[7,19],[7,21],[6,22],[6,22],
      [6,22],[7,21],[7,20],[8,19],[8,17],[8,17],
    ]
    const check = () => {
      const h = parseInt(
        new Intl.DateTimeFormat('fr-FR', {
          timeZone: 'Europe/Paris', hour: 'numeric', hour12: false,
        }).format(new Date()), 10
      )
      const [rise, set] = PARIS_SUN[new Date().getMonth()]
      setIsDark(h < rise || h >= set)
    }
    check()
    const id = setInterval(check, 60_000)
    return () => clearInterval(id)
  }, [theme, setIsDark])

  const route      = routeGeometry ? { geometry: routeGeometry } : null
  const mapFrozen  = drawerOpen || sheetOpen || OVERLAY_VIEWS.includes(activeView)

  const handleNavigate = (view) => {
    setActiveView(view)
    if (view === 'reserve') {
      setSheetOpen(true)
      setSheetStep(1)
    }
  }

  const handleClose = () => setActiveView('home')

  // Deep link /?promo=COUPE26 → open offer view + auto-apply code
  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get('promo')
    if (param?.toUpperCase() === 'COUPE26') {
      setActiveView('coupe26')
      const st = useBookingStore.getState()
      if (!st.promo) st.setPromo({ code: 'COUPE26', discount: 10, label: 'Coupe du Monde 2026 — −10%' })
      window.history.replaceState(null, '', window.location.pathname)
    }
  }, [])

  // App badge — show when a booking is awaiting WhatsApp return
  const awaitingReturn = useBookingStore((s) => s.awaitingReturn)
  useEffect(() => {
    if (awaitingReturn) {
      navigator.setAppBadge?.(1).catch?.(() => {})
    } else {
      navigator.clearAppBadge?.().catch?.(() => {})
    }
  }, [awaitingReturn])

  // Detect return from WhatsApp → confirm booking + back to home.
  // Requires a real hidden→visible round-trip so a blocked window.open
  // never triggers a spurious toast.
  useEffect(() => {
    let sawHidden = false
    const onChange = () => {
      if (document.visibilityState === 'hidden') {
        sawHidden = true
        return
      }
      if (!sawHidden) return
      sawHidden = false
      const st = useBookingStore.getState()
      if (!st.awaitingReturn) return
      st.setAwaitingReturn(false)
      setConfirmBon(st.bonNumber)
      setSheetOpen(false)
      setSheetStep(1)
      setActiveView('home')
      setConfirmOpen(true)
    }
    document.addEventListener('visibilitychange', onChange)
    return () => document.removeEventListener('visibilitychange', onChange)
  }, [])

  // Auto-dismiss the confirmation toast
  useEffect(() => {
    if (!confirmOpen) return
    const t = setTimeout(() => setConfirmOpen(false), 5500)
    return () => clearTimeout(t)
  }, [confirmOpen])

  const handleTarifsReserve = () => {
    setActiveView('home')
    setSheetOpen(true)
    setSheetStep(1)
  }

  return (
    <MotionConfig reducedMotion="user">
    <div className="relative w-full h-full overflow-hidden bg-bg-base">
      {/* Splash screen — plays once per browser session */}
      {splash && (
        <SplashScreen onDone={() => {
          sessionStorage.setItem(SPLASH_KEY, '1')
          setSplash(false)
        }} />
      )}
      {/* Map — frozen (pointer-events-none) when any overlay is open */}
      <LeafletMap
        depart={depart}
        arrive={arrive}
        route={route}
        isDark={isDark}
        frozen={mapFrozen}
      />

      {/* Vignette overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background: isDark
            ? 'linear-gradient(to bottom, rgba(5,5,5,.55) 0%, transparent 18%, transparent 60%, rgba(5,5,5,.92) 100%)'
            : 'linear-gradient(to bottom, rgba(240,238,232,.50) 0%, transparent 22%, transparent 58%, rgba(240,238,232,.88) 100%)',
        }}
      />

      {/* Top bar */}
      <TopBar
        onBurgerClick={() => setDrawerOpen(true)}
        burgerOpen={drawerOpen}
        isDark={isDark}
      />

      {/* Home pill — hidden while overlay is active or a booking is pending confirmation */}
      {!OVERLAY_VIEWS.includes(activeView) && !confirmBon && (
        <>
          <HomePill
            onOpenSheet={(step) => { setSheetOpen(true); setSheetStep(step) }}
          />
          {!sheetOpen && <CampaignBanner onOpen={() => setActiveView('coupe26')} />}
        </>
      )}

      {/* Awaiting-confirmation card — shown after toast dismisses, replaces HomePill */}
      <AnimatePresence>
        {confirmBon && !confirmOpen && !OVERLAY_VIEWS.includes(activeView) && (
          <AwaitingCard
            bonNumber={confirmBon}
            onDismiss={() => {
              setConfirmBon(null)
              // Reset full booking so the previous route/price don't linger on the map
              const st = useBookingStore.getState()
              st.resetBooking()
              st.setAwaitingReturn(false)
            }}
          />
        )}
      </AnimatePresence>

      {/* Slide-in views */}
      <TarifsView     open={activeView === 'tarifs'}  onClose={handleClose} onReserve={handleTarifsReserve} />
      <CallView       open={activeView === 'call'}    onClose={handleClose} />
      <MesCoursesView open={activeView === 'courses'} onClose={handleClose} onReserve={() => { handleClose(); setSheetOpen(true); setSheetStep(1) }} />
      <CodePromoView  open={activeView === 'promo'}   onClose={handleClose} />
      <Coupe2026View  open={activeView === 'coupe26'} onClose={handleClose} onReserve={() => { handleClose(); setSheetOpen(true); setSheetStep(1) }} />
      <AideFaqView    open={activeView === 'faq'}     onClose={handleClose} />
      <LegalView      open={activeView === 'legal'}   onClose={handleClose} />

      {/* Side drawer */}
      <SideDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        activeView={activeView}
        onNavigate={handleNavigate}
      />

      {/* Booking bottom sheet */}
      <BottomSheet
        open={sheetOpen}
        step={sheetStep}
        onStepChange={setSheetStep}
        onClose={() => setSheetOpen(false)}
      />

      {/* PWA install pill — only in browser, not in standalone */}
      <InstallPrompt />

      {/* Booking-sent confirmation toast */}
      <BookingConfirmToast
        open={confirmOpen}
        bonNumber={confirmBon}
        onClose={() => setConfirmOpen(false)}
      />
    </div>
    </MotionConfig>
  )
}
