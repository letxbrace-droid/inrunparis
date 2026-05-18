import { useState } from 'react'
import LeafletMap  from './components/map/LeafletMap'
import TopBar      from './components/layout/TopBar'
import SideDrawer  from './components/layout/SideDrawer'
import BottomSheet from './components/tunnel/BottomSheet'
import useBookingStore from './store/useBookingStore'

export default function App() {
  const [drawerOpen,  setDrawerOpen]  = useState(false)
  const [sheetOpen,   setSheetOpen]   = useState(false)
  const [sheetStep,   setSheetStep]   = useState(1)
  const [activeView,  setActiveView]  = useState('home')

  const { depart, arrive } = useBookingStore()

  const route = useBookingStore((s) => s.price ? {
    geometry: null,  // geometry stored separately via useOSRM in Step1
  } : null)

  const handleNavigate = (view) => {
    setActiveView(view)
    if (view === 'reserve') {
      setSheetOpen(true)
      setSheetStep(1)
    }
  }

  const handleSheetClose = () => setSheetOpen(false)

  return (
    <div className="relative w-full h-full overflow-hidden bg-bg-base">
      {/* Map layer — always rendered */}
      <LeafletMap
        depart={depart}
        arrive={arrive}
        route={null}
      />

      {/* Overlay gradient for readability */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, rgba(12,12,14,.6) 0%, transparent 30%, transparent 60%, rgba(12,12,14,.9) 100%)',
        }}
      />

      {/* Top bar */}
      <TopBar
        onBurgerClick={() => setDrawerOpen(true)}
        burgerOpen={drawerOpen}
      />

      {/* Floating CTA — reserve button on home */}
      {activeView === 'home' && !sheetOpen && (
        <div
          className="absolute bottom-0 left-0 right-0 z-[10] flex justify-center pb-safe px-5"
          style={{ paddingBottom: `calc(var(--safe-bot) + 24px)` }}
        >
          <button
            onClick={() => handleNavigate('reserve')}
            className="
              w-full max-w-[420px] py-5 rounded-[22px]
              font-bold text-white text-base tracking-wide uppercase
              cursor-pointer select-none
              active:scale-[.97] transition-transform duration-150
            "
            style={{
              background: '#ff4103',
              boxShadow: '0 0 32px rgba(255,65,3,0.45), 0 6px 24px rgba(0,0,0,.5)',
            }}
            aria-label="Réserver un chauffeur"
          >
            Réserver
          </button>
        </div>
      )}

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
        onClose={handleSheetClose}
      />
    </div>
  )
}
