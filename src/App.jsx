import { useState } from 'react'
import LeafletMap      from './components/map/LeafletMap'
import TopBar          from './components/layout/TopBar'
import SideDrawer      from './components/layout/SideDrawer'
import BottomSheet     from './components/tunnel/BottomSheet'
import TarifsView      from './components/views/TarifsView'
import CallView        from './components/views/CallView'
import MesCoursesView  from './components/views/MesCoursesView'
import CodePromoView   from './components/views/CodePromoView'
import AideFaqView     from './components/views/AideFaqView'
import LegalView       from './components/views/LegalView'
import HomePill        from './components/home/HomePill'
import useBookingStore from './store/useBookingStore'

const OVERLAY_VIEWS = ['tarifs', 'call', 'courses', 'promo', 'faq', 'legal']

export default function App() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [sheetOpen,  setSheetOpen]  = useState(false)
  const [sheetStep,  setSheetStep]  = useState(1)
  const [activeView, setActiveView] = useState('home')

  const depart        = useBookingStore((s) => s.depart)
  const arrive        = useBookingStore((s) => s.arrive)
  const routeGeometry = useBookingStore((s) => s.routeGeometry)
  const isDark        = useBookingStore((s) => s.isDark)

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

  const handleTarifsReserve = () => {
    setActiveView('home')
    setSheetOpen(true)
    setSheetStep(1)
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-bg-base">
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
            ? 'linear-gradient(to bottom, rgba(0,22,33,.55) 0%, transparent 28%, transparent 58%, rgba(0,22,33,.9) 100%)'
            : 'linear-gradient(to bottom, rgba(240,240,240,.45) 0%, transparent 28%, transparent 58%, rgba(240,240,240,.85) 100%)',
        }}
      />

      {/* Top bar */}
      <TopBar
        onBurgerClick={() => setDrawerOpen(true)}
        burgerOpen={drawerOpen}
      />

      {/* Home pill — hidden while overlay is active */}
      {!OVERLAY_VIEWS.includes(activeView) && (
        <HomePill
          onOpenSheet={(step) => { setSheetOpen(true); setSheetStep(step) }}
        />
      )}

      {/* Slide-in views */}
      <TarifsView     open={activeView === 'tarifs'}  onClose={handleClose} onReserve={handleTarifsReserve} />
      <CallView       open={activeView === 'call'}    onClose={handleClose} />
      <MesCoursesView open={activeView === 'courses'} onClose={handleClose} />
      <CodePromoView  open={activeView === 'promo'}   onClose={handleClose} />
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
    </div>
  )
}
