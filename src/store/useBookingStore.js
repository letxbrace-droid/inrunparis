import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
      isDark:      true,       // carte sombre/claire
      options: {
        wifi:        false,
        eau:         true,
        usb:         true,
        confiseries: false,
        siege:       false,
      },
      payment:     'Carte',   // 'Carte' | 'Espèces' | 'Virement'
      note:        '',
      promo:       null,      // { code, discount }
      vehicleType: 'berline', // 'berline' | 'van'

      // Computed
      price:         null,  // { final, km, mins, isNight, isAirport, savings }
      routeGeometry: null,  // GeoJSON LineString — not persisted
      bonNumber:     null,

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

      // Reset booking (keep prefs)
      resetBooking: () => set({
        depart: null, arrive: null, pickup: null,
        clientName: '', clientEmail: '',
        price: null, routeGeometry: null, bonNumber: null, note: '',
      }),
    }),
    {
      name: 'inrun-booking',
      partialize: (s) => ({
        promo: s.promo,
        ambiance: s.ambiance,
        volume: s.volume,
        clim: s.clim,
        isDark: s.isDark,
        options: s.options,
        payment: s.payment,
        vehicleType: s.vehicleType,
      }),
    }
  )
)

export default useBookingStore
