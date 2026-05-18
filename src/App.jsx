import { useState } from 'react'
import LeafletMap   from './components/map/LeafletMap'
import TopBar       from './components/layout/TopBar'
import SideDrawer   from './components/layout/SideDrawer'
import BottomSheet  from './components/tunnel/BottomSheet'
import TarifsView   from './components/views/TarifsView'
import HomePill     from './components/home/HomePill'
import useBookingStore from './store/useBookingStore'

export default function App() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [sheetOpen,  setSheetOpen]  = useState(false)
  const [sheetStep,  setSheetStep]  = useState(1)
  const [activeView, setActiveView] = useState('home')

  const depart        = useBookingStore((s) => s.depart)
  const arrive        = useBookingStore((s) => s.arrive)
  const routeGeometry = useBookingStore((s) => s.routeGeometry)

  const route = routeGeometry ? { geometry: routeGeometry } : null

  const handleNavigate = (view) => {
    setActiveView(view)
    if (view === 'reserve') {
      setSheetOpen(true)
      setSheetStep(1)
    }
  }

  const handleTarifsReserve = () => {
    setActiveView('home')
    setSheetOpen(true)
    setSheetStep(1)
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-bg-base">
      {/* Map — always rendered beneath everything */}
      <LeafletMap
        depart={depart}
        arrive={arrive}
        route={route}
      />

      {/* Bottom vignette for readability */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, rgba(0,22,33,.55) 0%, transparent 28%, transparent 58%, rgba(0,22,33,.9) 100%)',
        }}
      />

      {/* Top bar */}
      <TopBar
        onBurgerClick={() => setDrawerOpen(true)}
        burgerOpen={drawerOpen}
      />

      {/* Home pill — collapsed/expanded booking entry point */}
      {activeView === 'home' && (
        <HomePill
          onOpenSheet={(step) => { setSheetOpen(true); setSheetStep(step) }}
        />
      )}

      {/* Tarifs view — slides in from right */}
      <TarifsView
        open={activeView === 'tarifs'}
        onClose={() => setActiveView('home')}
        onReserve={handleTarifsReserve}
      />

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
