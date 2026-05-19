import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  PRICE,
  isNightTime,
  isAirportAddr,
  computePrice,
  computePriceForBooking,
} from '../utils/priceEngine'

// ─── isNightTime ──────────────────────────────────────────────────────────────

describe('isNightTime', () => {
  it('returns true for 22h (nightStart)', () => {
    expect(isNightTime('2024-06-15T22:00:00')).toBe(true)
  })

  it('returns true for 23h', () => {
    expect(isNightTime('2024-06-15T23:30:00')).toBe(true)
  })

  it('returns true for 02h (before nightEnd)', () => {
    expect(isNightTime('2024-06-15T02:00:00')).toBe(true)
  })

  it('returns true for 05:59 (still night)', () => {
    expect(isNightTime('2024-06-15T05:59:00')).toBe(true)
  })

  it('returns false for 06h (nightEnd boundary)', () => {
    expect(isNightTime('2024-06-15T06:00:00')).toBe(false)
  })

  it('returns false for 12h (midday)', () => {
    expect(isNightTime('2024-06-15T12:00:00')).toBe(false)
  })

  it('returns false for 21:59 (one minute before nightStart)', () => {
    expect(isNightTime('2024-06-15T21:59:00')).toBe(false)
  })

  it('uses current time when null is passed', () => {
    const fakeDate = new Date('2024-06-15T03:00:00')
    vi.setSystemTime(fakeDate)
    expect(isNightTime(null)).toBe(true)
    vi.useRealTimers()
  })

  it('uses current time when undefined is passed', () => {
    const fakeDate = new Date('2024-06-15T14:00:00')
    vi.setSystemTime(fakeDate)
    expect(isNightTime(undefined)).toBe(false)
    vi.useRealTimers()
  })
})

// ─── isAirportAddr ────────────────────────────────────────────────────────────

describe('isAirportAddr', () => {
  it('detects CDG', () => {
    expect(isAirportAddr('Aéroport CDG Terminal 2')).toBe(true)
  })

  it('detects Roissy', () => {
    expect(isAirportAddr('Roissy-en-France')).toBe(true)
  })

  it('detects Orly', () => {
    expect(isAirportAddr('Aéroport de Paris-Orly')).toBe(true)
  })

  it('detects Beauvais', () => {
    expect(isAirportAddr('Aéroport Beauvais-Tillé')).toBe(true)
  })

  it('detects generic "aéroport" keyword', () => {
    expect(isAirportAddr('Aéroport international')).toBe(true)
  })

  it('is case-insensitive', () => {
    expect(isAirportAddr('AÉROPORT CDG')).toBe(true)
  })

  it('returns false for regular address', () => {
    expect(isAirportAddr('15 rue de la Paix, Paris')).toBe(false)
  })

  it('returns false for empty string', () => {
    expect(isAirportAddr('')).toBe(false)
  })

  it('returns false for undefined (default param)', () => {
    expect(isAirportAddr()).toBe(false)
  })
})

// ─── computePrice ─────────────────────────────────────────────────────────────

describe('computePrice', () => {
  beforeEach(() => {
    // Lock time to a daytime hour so night surcharge is predictable
    vi.setSystemTime(new Date('2024-06-15T10:00:00'))
  })
  afterEach(() => vi.useRealTimers())

  it('applies base fare for long trip above minimum', () => {
    const result = computePrice(30, 40, '2024-06-15T10:00:00')
    // base + 30*0.82 + 40*0.16 = 13 + 24.6 + 6.4 = 44 → 44 (above min 32)
    expect(result.final).toBe(44)
  })

  it('enforces minimum fare', () => {
    // 1km, 3min, day → 13 + 0.82 + 0.48 = 14.3 → rounds to 14, below min 32
    const result = computePrice(1, 3, '2024-06-15T10:00:00')
    expect(result.final).toBe(PRICE.min)
  })

  it('applies night surcharge (+15%)', () => {
    // Use a trip long enough that both day and night are above the minimum,
    // so the 15% night premium is visible in the final rounded price.
    const day   = computePrice(30, 40, '2024-06-15T10:00:00')
    const night = computePrice(30, 40, '2024-06-15T23:00:00')
    expect(night.final).toBeGreaterThan(day.final)
    expect(night.isNight).toBe(true)
    expect(day.isNight).toBe(false)
  })

  it('applies van surcharge (+25%)', () => {
    const berline = computePrice(20, 30, '2024-06-15T10:00:00', 'berline')
    const van     = computePrice(20, 30, '2024-06-15T10:00:00', 'van')
    expect(van.final).toBeGreaterThan(berline.final)
  })

  it('rounds km to 1 decimal', () => {
    const result = computePrice(12.678, 25, '2024-06-15T10:00:00')
    expect(result.km).toBe(12.7)
  })

  it('rounds mins to integer', () => {
    const result = computePrice(10, 22.7, '2024-06-15T10:00:00')
    expect(result.mins).toBe(23)
  })

  it('computes positive savings vs reference tariff on long trips', () => {
    const result = computePrice(30, 40, '2024-06-15T10:00:00')
    // price    = 13 + 30*0.82 + 40*0.16 = 13 + 24.6 + 6.4 = 44
    // refPrice = 14.5 + 30*0.92 + 40*0.18 = 14.5 + 27.6 + 7.2 = 49.3 → 49
    // savings  = 49 - 44 = 5
    expect(result.savings).toBe(5)
  })

  it('savings is never negative', () => {
    // Very short trip that hits minimum: savings could theoretically be negative
    const result = computePrice(0.5, 2, '2024-06-15T10:00:00')
    expect(result.savings).toBeGreaterThanOrEqual(0)
  })
})

// ─── computePriceForBooking ───────────────────────────────────────────────────

describe('computePriceForBooking', () => {
  it('detects airport from depart name', () => {
    const result = computePriceForBooking(20, 30, {
      pickup:      '2024-06-15T10:00:00',
      depart:      { name: 'Aéroport Charles de Gaulle Terminal 1' },
      arrive:      { name: '15 rue de Rivoli, Paris' },
      vehicleType: 'berline',
    })
    expect(result.isAirport).toBe(true)
  })

  it('detects airport from arrive name', () => {
    const result = computePriceForBooking(18, 25, {
      pickup:      '2024-06-15T10:00:00',
      depart:      { name: '8 avenue Montaigne, Paris' },
      arrive:      { name: 'Orly Sud, Terminal 4' },
      vehicleType: 'berline',
    })
    expect(result.isAirport).toBe(true)
    expect(result.final).toBeGreaterThan(
      computePriceForBooking(18, 25, {
        pickup: '2024-06-15T10:00:00',
        depart: { name: 'Paris' },
        arrive: { name: 'Lyon' },
        vehicleType: 'berline',
      }).final
    )
  })

  it('handles null depart/arrive gracefully', () => {
    expect(() =>
      computePriceForBooking(10, 15, {
        pickup: '2024-06-15T10:00:00',
        depart: null,
        arrive: null,
        vehicleType: 'berline',
      })
    ).not.toThrow()
  })

  it('returns all expected fields', () => {
    const result = computePriceForBooking(8, 12, {
      pickup:      '2024-06-15T10:00:00',
      depart:      { name: 'Gare de Lyon, Paris' },
      arrive:      { name: 'Tour Eiffel, Paris' },
      vehicleType: 'berline',
    })
    expect(result).toMatchObject({
      final:     expect.any(Number),
      km:        expect.any(Number),
      mins:      expect.any(Number),
      isNight:   expect.any(Boolean),
      isAirport: expect.any(Boolean),
      savings:   expect.any(Number),
    })
  })
})
