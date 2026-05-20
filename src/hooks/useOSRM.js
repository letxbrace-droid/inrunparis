import { useState, useCallback } from 'react'

// ─── Haversine straight-line distance (km) ────────────────────────────────────
function haversineKm(a, b) {
  const R    = 6371
  const dLat = (b.lat - a.lat) * Math.PI / 180
  const dLng = (b.lng - a.lng) * Math.PI / 180
  const sin2 = Math.sin(dLat / 2) ** 2
    + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(sin2), Math.sqrt(1 - sin2))
}

// ─── Time-aware traffic buffer ────────────────────────────────────────────────
function trafficFactor() {
  const h = new Date().getHours()
  if ((h >= 7 && h <= 9) || (h >= 17 && h <= 20)) return 1.35  // AM/PM peak Paris
  if (h >= 22 || h < 6)                            return 1.08  // night, low traffic
  return 1.20                                                    // off-peak daytime
}

// ─── Fallback straight-line estimate ─────────────────────────────────────────
// Used only when all OSRM endpoints are unreachable.
function fallbackEstimate(from, to) {
  const straight = haversineKm(from, to)
  const routeKm  = straight * 1.40
  const tf       = trafficFactor()
  const mins     = (routeKm / 28) * 60 * tf
  return {
    km:       Math.round(routeKm * 10) / 10,
    mins:     Math.round(mins),
    rawMins:  Math.round((routeKm / 28) * 60),
    geometry: { type: 'LineString', coordinates: [[from.lng, from.lat], [to.lng, to.lat]] },
    source:   'fallback',
  }
}

// ─── Try one OSRM endpoint ────────────────────────────────────────────────────
async function tryEndpoint(base, from, to) {
  const coords = `${from.lng},${from.lat};${to.lng},${to.lat}`
  const url    = `${base}/route/v1/driving/${coords}?overview=full&geometries=geojson&steps=false`
  const ctrl   = new AbortController()
  const tid    = setTimeout(() => ctrl.abort(), 9000)
  try {
    const r    = await fetch(url, { signal: ctrl.signal })
    clearTimeout(tid)
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    const data = await r.json()
    if (!data.routes?.length) throw new Error('no routes')
    const route = data.routes[0]
    const tf    = trafficFactor()
    return {
      km:       route.distance / 1000,
      mins:     (route.duration / 60) * tf,
      rawMins:  route.duration / 60,
      geometry: route.geometry,
      source:   'osrm',
    }
  } catch {
    clearTimeout(tid)
    return null
  }
}

// ─── OSRM with multi-endpoint fallback ───────────────────────────────────────
// Tries two independent public OSRM servers before giving up.
const OSRM_SERVERS = [
  'https://router.project-osrm.org',
  'https://routing.openstreetmap.de/routed-car',
]

async function osrmRoute(from, to, attempt = 0) {
  for (const base of OSRM_SERVERS) {
    const result = await tryEndpoint(base, from, to)
    if (result) return result
  }
  // Both servers failed — retry once after a short pause
  if (attempt === 0) {
    await new Promise(res => setTimeout(res, 700))
    return osrmRoute(from, to, 1)
  }
  return null
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export default function useOSRM() {
  const [route,   setRoute]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const fetchRoute = useCallback(async (from, to) => {
    if (!from || !to) return null
    setLoading(true)
    setError(null)

    let result = await osrmRoute(from, to)
    if (!result) {
      result = fallbackEstimate(from, to)
      setError('Estimation (OSRM indisponible)')
      setTimeout(() => setError(null), 4000)
    }

    setLoading(false)
    setRoute(result)
    return result
  }, [])

  const clearRoute = useCallback(() => {
    setRoute(null)
    setError(null)
  }, [])

  return { route, loading, error, fetchRoute, clearRoute }
}
