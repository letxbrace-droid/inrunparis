import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import useOSRM from '../hooks/useOSRM'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PARIS   = { lat: 48.8566, lng: 2.3522 }
const CDG     = { lat: 49.0097, lng: 2.5479 }

function osrmOk(km = 28000, duration = 2100) {
  return {
    ok:   true,
    json: async () => ({
      routes: [{
        distance: km,
        duration,
        geometry: { type: 'LineString', coordinates: [[2.35, 48.85], [2.55, 49.01]] },
      }],
    }),
  }
}

function osrmEmpty() {
  return { ok: true, json: async () => ({ routes: [] }) }
}

// ─── trafficFactor behaviour ──────────────────────────────────────────────────

describe('traffic factor (via fetchRoute mins)', () => {
  afterEach(() => vi.useRealTimers())

  it('applies higher buffer during morning peak (8h)', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-06-17T08:00:00'))
    global.fetch = vi.fn().mockResolvedValue(osrmOk(28000, 2000))

    const { result } = renderHook(() => useOSRM())
    await act(async () => { await result.current.fetchRoute(PARIS, CDG) })
    // rawMins = 2000/60 ≈ 33.3 · 1.35 peak = 45 min
    expect(result.current.route.mins).toBeGreaterThan(35)
  })

  it('applies lower buffer at night (2h)', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-06-17T02:00:00'))
    global.fetch = vi.fn().mockResolvedValue(osrmOk(28000, 2000))

    const { result } = renderHook(() => useOSRM())
    await act(async () => { await result.current.fetchRoute(PARIS, CDG) })
    // rawMins ≈ 33.3 · 1.08 night = 36 min
    expect(result.current.route.mins).toBeLessThan(40)
  })
})

// ─── Happy path ───────────────────────────────────────────────────────────────

describe('fetchRoute — OSRM success', () => {
  beforeEach(() => { global.fetch = vi.fn().mockResolvedValue(osrmOk()) })
  afterEach(() => vi.restoreAllMocks())

  it('sets route with km, mins, geometry and source=osrm', async () => {
    const { result } = renderHook(() => useOSRM())
    await act(async () => { await result.current.fetchRoute(PARIS, CDG) })
    expect(result.current.route).toMatchObject({
      km:       expect.any(Number),
      mins:     expect.any(Number),
      geometry: expect.any(Object),
      source:   'osrm',
    })
  })

  it('km is distance/1000', async () => {
    const { result } = renderHook(() => useOSRM())
    await act(async () => { await result.current.fetchRoute(PARIS, CDG) })
    expect(result.current.route.km).toBeCloseTo(28, 0)
  })

  it('returns the result object from fetchRoute', async () => {
    const { result } = renderHook(() => useOSRM())
    let returned
    await act(async () => { returned = await result.current.fetchRoute(PARIS, CDG) })
    expect(returned).not.toBeNull()
    expect(returned.source).toBe('osrm')
  })

  it('sets loading false after completion', async () => {
    const { result } = renderHook(() => useOSRM())
    await act(async () => { await result.current.fetchRoute(PARIS, CDG) })
    expect(result.current.loading).toBe(false)
  })

  it('clears route on clearRoute()', async () => {
    const { result } = renderHook(() => useOSRM())
    await act(async () => { await result.current.fetchRoute(PARIS, CDG) })
    act(() => { result.current.clearRoute() })
    expect(result.current.route).toBeNull()
  })

  it('returns null without calling fetch when from/to are null', async () => {
    const { result } = renderHook(() => useOSRM())
    let returned
    await act(async () => { returned = await result.current.fetchRoute(null, CDG) })
    expect(returned).toBeNull()
    expect(global.fetch).not.toHaveBeenCalled()
  })
})

// ─── Fallback behaviour ───────────────────────────────────────────────────────

describe('fetchRoute — OSRM fallback (both attempts fail)', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockRejectedValue(new Error('network error'))
    vi.useFakeTimers()
  })
  afterEach(() => { vi.restoreAllMocks(); vi.useRealTimers() })

  it('falls back to haversine estimate after two failures', async () => {
    const { result } = renderHook(() => useOSRM())
    await act(async () => {
      const p = result.current.fetchRoute(PARIS, CDG)
      await vi.runAllTimersAsync()
      await p
    })
    expect(result.current.route).not.toBeNull()
    expect(result.current.route.source).toBe('fallback')
  })

  it('fallback km is greater than straight-line distance', async () => {
    const { result } = renderHook(() => useOSRM())
    await act(async () => {
      const p = result.current.fetchRoute(PARIS, CDG)
      await vi.runAllTimersAsync()
      await p
    })
    // Straight-line Paris→CDG ≈ 24 km, routed ≈ 34 km (+40%)
    expect(result.current.route.km).toBeGreaterThan(24)
  })

  it('fallback geometry is a straight-line LineString (map always draws something)', async () => {
    const { result } = renderHook(() => useOSRM())
    await act(async () => {
      const p = result.current.fetchRoute(PARIS, CDG)
      await vi.runAllTimersAsync()
      await p
    })
    expect(result.current.route.geometry).not.toBeNull()
    expect(result.current.route.geometry.type).toBe('LineString')
    expect(result.current.route.geometry.coordinates).toHaveLength(2)
  })

  it('still returns a result object from fetchRoute on fallback', async () => {
    const { result } = renderHook(() => useOSRM())
    let returned
    await act(async () => {
      const p = result.current.fetchRoute(PARIS, CDG).then(r => { returned = r })
      await vi.runAllTimersAsync()
      await p
    })
    expect(returned).not.toBeNull()
    expect(returned.source).toBe('fallback')
  })
})

// ─── OSRM empty routes array ──────────────────────────────────────────────────

describe('fetchRoute — OSRM returns empty routes', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce(osrmEmpty())   // first attempt
      .mockResolvedValueOnce(osrmEmpty())   // retry
  })
  afterEach(() => vi.restoreAllMocks())

  it('falls back to haversine when routes array is empty', async () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useOSRM())
    await act(async () => {
      const p = result.current.fetchRoute(PARIS, CDG)
      await vi.runAllTimersAsync()
      await p
    })
    vi.useRealTimers()
    expect(result.current.route?.source).toBe('fallback')
  })
})
