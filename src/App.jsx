import { useState, useEffect, lazy, Suspense } from 'react'
import { AnimatePresence, MotionConfig } from 'framer-motion'
// Code-split the vector map (maplibre-gl ~280kb gzip) into its own chunk — it
// loads during the splash, so the initial bundle stays lean.
const LeafletMap = lazy(() => import('./components/map/LeafletMap'))
import TopBar              from './components/layout/TopBar'
import SideDrawer          from './components/layout/SideDrawer'
import BottomSheet         from './components/tunnel/BottomSheet'
// Les cinq vues en plein écran vivent derrière le menu : la grande majorité
// des visites ne va jamais plus loin que l'accueil. Les charger d'emblée, c'est
// faire payer à tout le monde du code que presque personne n'ouvre.
//
// Elles restent montées une fois ouvertes, parce qu'elles gèrent leur propre
// animation de sortie : les démonter dès la fermeture supprimerait cette
// sortie. Seule la toute première ouverture attend son morceau de code — et le
// service worker l'a déjà en cache dès la seconde visite.
const TarifsView     = lazy(() => import('./components/views/TarifsView'))
const CallView       = lazy(() => import('./components/views/CallView'))
const MesCoursesView = lazy(() => import('./components/views/MesCoursesView'))
const AideFaqView    = lazy(() => import('./components/views/AideFaqView'))
const LegalView      = lazy(() => import('./components/views/LegalView'))
import HomePill            from './components/home/HomePill'
import AwaitingCard        from './components/home/AwaitingCard'
import BookingConfirmToast from './components/ui/BookingConfirmToast'
import InstallPrompt       from './components/ui/InstallPrompt'
import SplashScreen        from './components/ui/SplashScreen'
import useBookingStore     from './store/useBookingStore'
import useWakeLock         from './hooks/useWakeLock'

const OVERLAY_VIEWS = ['tarifs', 'call', 'courses', 'faq', 'legal']

const SPLASH_KEY = 'inr-splash'

export default function App() {
  const [splash,      setSplash]      = useState(() => !sessionStorage.getItem(SPLASH_KEY))
  const [drawerOpen,  setDrawerOpen]  = useState(false)
  const [sheetOpen,   setSheetOpen]   = useState(false)
  const [sheetStep,   setSheetStep]   = useState(1)
  const [activeView,  setActiveView]  = useState('home')
  // Les vues déjà ouvertes au moins une fois, donc à garder montées.
  const [seenViews,   setSeenViews]   = useState(() => new Set())
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
    // La barre d'état du téléphone suit le thème de l'app. Figée en noir, elle
    // reste noire par-dessus un écran clair : la coupure entre le système et
    // l'application est le premier détail qui signale « ceci est un site web ».
    document.querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', isDark ? '#050505' : '#F7F5F0')
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

  // Deep link /?view=courses → open courses view (from home-screen shortcut)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)

    const view = params.get('view')
    if (view && ['courses', 'tarifs', 'faq', 'legal'].includes(view)) {
      setActiveView(view)
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

  // Keep the screen awake while the client waits on their driver — that card
  // is the one thing they're watching, so it shouldn't black out.
  useWakeLock(Boolean(confirmBon))

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

  useEffect(() => {
    if (activeView === 'home' || seenViews.has(activeView)) return
    setSeenViews((prev) => new Set(prev).add(activeView))
  }, [activeView, seenViews])

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
      {/* La couche d'accueil, et sa parallaxe.
          Quand une vue est poussée par-dessus, celle qui reste dessous recule
          et s'assombrit. Sans ce recul, une vue qui glisse ne se lit pas comme
          une pile mais comme un panneau qui passe devant — c'est la moitié du
          geste natif, et c'est celle qu'on ne remarque que par son absence.
          --push-in est posée par <PushView> à chaque frame du glissement, donc
          l'accueil suit le doigt sans qu'aucun composant ne se re-rende. */}
      <div
        className="absolute inset-0"
        style={{
          transform: 'translateX(calc(var(--push-in, 0) * -14%)) scale(calc(1 - var(--push-in, 0) * 0.04))',
          transformOrigin: 'center left',
          transition: 'transform .34s cubic-bezier(.16,1,.3,1)',
          willChange: 'transform',
        }}
      >
      {/* Map — frozen (pointer-events-none) when any overlay is open.
          Lazy chunk; dark placeholder matches the map bg while it loads. */}
      <Suspense fallback={<div className="absolute inset-0 z-0" style={{ background: '#0b0c0e' }} />}>
        <LeafletMap
          depart={depart}
          arrive={arrive}
          route={route}
          isDark={isDark}
          frozen={mapFrozen}
        />
      </Suspense>

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
        onBurgerClick={() => setDrawerOpen((o) => !o)}
        burgerOpen={drawerOpen}
        isDark={isDark}
      />

      {/* Home pill — hidden while overlay is active or a booking is pending confirmation */}
      {!OVERLAY_VIEWS.includes(activeView) && !confirmBon && (
        <>
          <HomePill
            onOpenSheet={(step) => { setSheetOpen(true); setSheetStep(step) }}
          />
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

        {/* Le voile qui accompagne le recul. Un scrim coûte une seule couche
            composée ; passer la couche entière en filter: brightness ferait
            repeindre la carte à chaque frame. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background: '#000',
            opacity: 'calc(var(--push-in, 0) * 0.46)',
            transition: 'opacity .34s cubic-bezier(.16,1,.3,1)',
            zIndex: 60,
          }}
        />
      </div>

      {/* Slide-in views */}
      <Suspense fallback={null}>
        {seenViews.has('tarifs')  && <TarifsView     open={activeView === 'tarifs'}  onClose={handleClose} onReserve={handleTarifsReserve} />}
        {seenViews.has('call')    && <CallView       open={activeView === 'call'}    onClose={handleClose} />}
        {seenViews.has('courses') && <MesCoursesView open={activeView === 'courses'} onClose={handleClose} onReserve={() => { handleClose(); setSheetOpen(true); setSheetStep(1) }} />}
        {seenViews.has('faq')     && <AideFaqView    open={activeView === 'faq'}     onClose={handleClose} />}
        {seenViews.has('legal')   && <LegalView      open={activeView === 'legal'}   onClose={handleClose} />}
      </Suspense>

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
