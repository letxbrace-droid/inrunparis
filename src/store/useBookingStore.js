import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const PROMO_CODES = {
  'BIENVENUE': { discount: 10, label: '10% de réduction' },
  'VIP15':     { discount: 15, label: '15% de réduction' },
  'PARIS25':   { discount: 25, label: '25% sur votre 1ère course' },
}

export { PROMO_CODES }

const useBookingStore = create(
  persist(
    (set, get) => ({
      // Route
      depart:  null,  // { name, lat, lng }
      arrive:  null,
      pickup:  null,  // ISO datetime string or null (ASAP)

      // Client
      clientName:  '',
      clientEmail: '',

      // Preferences
      ambiance:    'musique',  // 'musique' | 'radio' | 'silence'
      volume:      50,
      clim:        21,
      isDark:      true,
      options: {
        wifi:        false,
        eau:         true,
        usb:         true,
        confiseries: false,
        siege:       false,
      },
      payment:     'Carte',
      note:        '',
      promo:       null,      // { code, discount, label }
      vehicleType: 'berline',

      // Computed
      price:         null,  // { final, km, mins, isNight, isAirport, savings }
      routeGeometry: null,
      bonNumber:     null,

      // History (persisted)
      bookingHistory: [], // [{ bonNumber, depart, arrive, price, date }]

      // Transient — WhatsApp round-trip tracking (not persisted)
      awaitingReturn: false,
      setAwaitingReturn: (v) => set({ awaitingReturn: v }),

      // Actions — route
      setDepart:  (depart)  => set({ depart }),
      setArrive:  (arrive)  => set({ arrive }),
      setPickup:  (pickup)  => set({ pickup }),
      clearRoute: ()        => set({ depart: null, arrive: null, price: null }),

      // Actions — client
      setClientName:  (v) => set({ clientName: v }),
      setClientEmail: (v) => set({ clientEmail: v }),

      // Actions — preferences
      setAmbiance:     (v) => set({ ambiance: v }),
      setVolume:       (v) => set({ volume: v }),
      setClim:         (v) => set({ clim: v }),
      setIsDark:       (v) => set({ isDark: v }),
      toggleOption:    (key) => set((s) => ({ options: { ...s.options, [key]: !s.options[key] } })),
      setPayment:      (v) => set({ payment: v }),
      setNote:         (v) => set({ note: v }),
      setPromo:        (v) => set({ promo: v }),
      setVehicleType:  (v) => set({ vehicleType: v }),

      // Actions — price + geometry
      setPrice:         (price)    => set({ price }),
      setRouteGeometry: (geometry) => set({ routeGeometry: geometry }),

      // Actions — bon
      generateBonNumber: () => {
        const num = `INR-${Date.now().toString(36).toUpperCase().slice(-5)}`
        set({ bonNumber: num })
        return num
      },

      // Actions — history
      addToHistory: () => {
        const s = get()
        if (!s.depart || !s.arrive || !s.price) return
        const entry = {
          bonNumber: s.bonNumber,
          depart:    { name: s.depart.name },
          arrive:    { name: s.arrive.name },
          price:     s.price,
          date:      new Date().toISOString(),
        }
        set((prev) => ({
          bookingHistory: [entry, ...prev.bookingHistory].slice(0, 20),
        }))
      },

      // Reset booking (keep prefs + history)
      resetBooking: () => set({
        depart: null, arrive: null, pickup: null,
        clientName: '', clientEmail: '',
        price: null, routeGeometry: null, bonNumber: null, note: '',
      }),
    }),
    {
      name: 'inrun-booking',
      partialize: (s) => ({
        promo:          s.promo,
        ambiance:       s.ambiance,
        volume:         s.volume,
        clim:           s.clim,
        isDark:         s.isDark,
        options:        s.options,
        payment:        s.payment,
        vehicleType:    s.vehicleType,
        bookingHistory: s.bookingHistory,
      }),
    }
  )
)

export default useBookingStore
