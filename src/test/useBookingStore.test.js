import { describe, it, expect, beforeEach } from 'vitest'
import useBookingStore from '../store/useBookingStore'

// Reset store to initial state before each test
beforeEach(() => {
  useBookingStore.setState({
    depart:         null,
    arrive:         null,
    pickup:         null,
    clientName:     '',
    clientEmail:    '',
    ambiance:       'musique',
    volume:         50,
    clim:           21,
    options:        { wifi: false, eau: true, usb: true, confiseries: false, siege: false },
    payment:        'Carte',
    note:           '',
    promo:          null,
    vehicleType:    'berline',
    price:          null,
    routeGeometry:  null,
    bonNumber:      null,
    bookingHistory: [],
    awaitingReturn: false,
  })
})

// ─── Initial state ────────────────────────────────────────────────────────────

describe('initial state', () => {
  it('has null depart and arrive', () => {
    const { depart, arrive } = useBookingStore.getState()
    expect(depart).toBeNull()
    expect(arrive).toBeNull()
  })

  it('defaults payment to Carte', () => {
    expect(useBookingStore.getState().payment).toBe('Carte')
  })

  it('defaults ambiance to musique', () => {
    expect(useBookingStore.getState().ambiance).toBe('musique')
  })

  it('awaitingReturn starts false', () => {
    expect(useBookingStore.getState().awaitingReturn).toBe(false)
  })
})

// ─── Route actions ────────────────────────────────────────────────────────────

describe('route actions', () => {
  it('setDepart updates depart', () => {
    const place = { name: 'Gare de Lyon', lat: 48.84, lng: 2.37 }
    useBookingStore.getState().setDepart(place)
    expect(useBookingStore.getState().depart).toEqual(place)
  })

  it('setArrive updates arrive', () => {
    const place = { name: 'Tour Eiffel', lat: 48.858, lng: 2.294 }
    useBookingStore.getState().setArrive(place)
    expect(useBookingStore.getState().arrive).toEqual(place)
  })

  it('clearRoute resets depart, arrive and price', () => {
    useBookingStore.getState().setDepart({ name: 'A', lat: 1, lng: 1 })
    useBookingStore.getState().setArrive({ name: 'B', lat: 2, lng: 2 })
    useBookingStore.getState().setPrice({ final: 40, km: 10, mins: 20 })
    useBookingStore.getState().clearRoute()
    const { depart, arrive, price } = useBookingStore.getState()
    expect(depart).toBeNull()
    expect(arrive).toBeNull()
    expect(price).toBeNull()
  })
})

// ─── Client actions ───────────────────────────────────────────────────────────

describe('client actions', () => {
  it('setClientName updates name', () => {
    useBookingStore.getState().setClientName('Alice')
    expect(useBookingStore.getState().clientName).toBe('Alice')
  })

  it('setClientEmail updates email', () => {
    useBookingStore.getState().setClientEmail('alice@test.com')
    expect(useBookingStore.getState().clientEmail).toBe('alice@test.com')
  })
})

// ─── Preferences ─────────────────────────────────────────────────────────────

describe('preferences', () => {
  it('setAmbiance updates ambiance', () => {
    useBookingStore.getState().setAmbiance('silence')
    expect(useBookingStore.getState().ambiance).toBe('silence')
  })

  it('setVolume clamps any value', () => {
    useBookingStore.getState().setVolume(80)
    expect(useBookingStore.getState().volume).toBe(80)
  })

  it('setClim updates clim', () => {
    useBookingStore.getState().setClim(19)
    expect(useBookingStore.getState().clim).toBe(19)
  })

  it('toggleOption flips a single option', () => {
    useBookingStore.getState().toggleOption('wifi')
    expect(useBookingStore.getState().options.wifi).toBe(true)
    useBookingStore.getState().toggleOption('wifi')
    expect(useBookingStore.getState().options.wifi).toBe(false)
  })

  it('toggleOption does not affect sibling options', () => {
    useBookingStore.getState().toggleOption('wifi')
    expect(useBookingStore.getState().options.eau).toBe(true) // unchanged default
  })

  it('setPayment updates payment', () => {
    useBookingStore.getState().setPayment('Espèces')
    expect(useBookingStore.getState().payment).toBe('Espèces')
  })

  it('setVehicleType updates vehicleType', () => {
    useBookingStore.getState().setVehicleType('van')
    expect(useBookingStore.getState().vehicleType).toBe('van')
  })
})

// ─── Bon number ───────────────────────────────────────────────────────────────

describe('generateBonNumber (store action)', () => {
  it('sets bonNumber on the store', () => {
    useBookingStore.getState().generateBonNumber()
    expect(useBookingStore.getState().bonNumber).toMatch(/^INR-[0-9A-Z]{5}$/)
  })

  it('returns the generated bon number', () => {
    const bon = useBookingStore.getState().generateBonNumber()
    expect(bon).toMatch(/^INR-[0-9A-Z]{5}$/)
    expect(useBookingStore.getState().bonNumber).toBe(bon)
  })
})

// ─── awaitingReturn ───────────────────────────────────────────────────────────

describe('setAwaitingReturn', () => {
  it('sets awaitingReturn to true', () => {
    useBookingStore.getState().setAwaitingReturn(true)
    expect(useBookingStore.getState().awaitingReturn).toBe(true)
  })

  it('sets awaitingReturn back to false', () => {
    useBookingStore.getState().setAwaitingReturn(true)
    useBookingStore.getState().setAwaitingReturn(false)
    expect(useBookingStore.getState().awaitingReturn).toBe(false)
  })
})

// ─── addToHistory ─────────────────────────────────────────────────────────────

describe('addToHistory', () => {
  it('does nothing without depart/arrive/price', () => {
    useBookingStore.getState().addToHistory()
    expect(useBookingStore.getState().bookingHistory).toHaveLength(0)
  })

  it('adds an entry when booking is complete', () => {
    useBookingStore.setState({
      depart:    { name: 'Gare du Nord, Paris' },
      arrive:    { name: 'Aéroport CDG' },
      price:     { final: 55, km: 27, mins: 32, isNight: false, isAirport: true },
      bonNumber: 'INR-TEST1',
    })
    useBookingStore.getState().addToHistory()
    expect(useBookingStore.getState().bookingHistory).toHaveLength(1)
  })

  it('stores the correct bon number in history', () => {
    useBookingStore.setState({
      depart:    { name: 'A' },
      arrive:    { name: 'B' },
      price:     { final: 40, km: 10, mins: 20, isNight: false, isAirport: false },
      bonNumber: 'INR-TESTX',
    })
    useBookingStore.getState().addToHistory()
    expect(useBookingStore.getState().bookingHistory[0].bonNumber).toBe('INR-TESTX')
  })

  it('prepends new entries (most recent first)', () => {
    const setup = (bon) => {
      useBookingStore.setState({
        depart: { name: 'A' }, arrive: { name: 'B' },
        price: { final: 40, km: 10, mins: 20, isNight: false, isAirport: false },
        bonNumber: bon,
      })
      useBookingStore.getState().addToHistory()
    }
    setup('INR-FIRST')
    setup('INR-SECOND')
    expect(useBookingStore.getState().bookingHistory[0].bonNumber).toBe('INR-SECOND')
    expect(useBookingStore.getState().bookingHistory[1].bonNumber).toBe('INR-FIRST')
  })

  it('caps history at 20 entries', () => {
    useBookingStore.setState({
      depart: { name: 'A' }, arrive: { name: 'B' },
      price:  { final: 40, km: 10, mins: 20, isNight: false, isAirport: false },
    })
    for (let i = 0; i < 25; i++) {
      useBookingStore.setState({ bonNumber: `INR-${String(i).padStart(5, '0')}` })
      useBookingStore.getState().addToHistory()
    }
    expect(useBookingStore.getState().bookingHistory.length).toBe(20)
  })
})

// ─── resetBooking ─────────────────────────────────────────────────────────────

describe('resetBooking', () => {
  it('clears route and client fields', () => {
    useBookingStore.setState({
      depart:     { name: 'A' },
      arrive:     { name: 'B' },
      clientName: 'Bob',
      price:      { final: 40, km: 10, mins: 20 },
      bonNumber:  'INR-RESET',
    })
    useBookingStore.getState().resetBooking()
    const { depart, arrive, clientName, price, bonNumber } = useBookingStore.getState()
    expect(depart).toBeNull()
    expect(arrive).toBeNull()
    expect(clientName).toBe('')
    expect(price).toBeNull()
    expect(bonNumber).toBeNull()
  })

  it('preserves user preferences after reset', () => {
    useBookingStore.setState({ payment: 'Espèces', ambiance: 'silence', clim: 19 })
    useBookingStore.getState().resetBooking()
    const { payment, ambiance, clim } = useBookingStore.getState()
    expect(payment).toBe('Espèces')
    expect(ambiance).toBe('silence')
    expect(clim).toBe(19)
  })

  it('preserves bookingHistory after reset', () => {
    useBookingStore.setState({
      depart: { name: 'A' }, arrive: { name: 'B' },
      price:  { final: 40, km: 10, mins: 20, isNight: false, isAirport: false },
      bonNumber: 'INR-HIST1',
    })
    useBookingStore.getState().addToHistory()
    useBookingStore.getState().resetBooking()
    expect(useBookingStore.getState().bookingHistory).toHaveLength(1)
  })
})
