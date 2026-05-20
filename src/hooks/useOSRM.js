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
// Returns a multiplier applied to OSRM's free-flow duration.
function trafficFactor() {
  const h = new Date().getHours()
  if ((h >= 7 && h <= 9) || (h >= 17 && h <= 20)) return 1.35  // AM/PM peak Paris
  if (h >= 22 || h < 6)                            return 1.08  // night, low traffic
  return 1.20                                                    // off-peak daytime
}

// ─── Fallback straight-line estimate ─────────────────────────────────────────
// Used when OSRM is unreachable after retry.
function fallbackEstimate(from, to) {
  const straight = haversineKm(from, to)
  const routeKm  = straight * 1.40          // Paris urban routing factor ≈ +40%
  const tf       = trafficFactor()
  const mins     = (routeKm / 28) * 60 * tf // avg 28 km/h with traffic
  return {
    km:       Math.round(routeKm * 10) / 10,
    mins:     Math.round(mins),
    rawMins:  Math.round((routeKm / 28) * 60),
    geometry: null,   // no polyline on fallback — map won't draw route
    source:   'fallback',
  }
}

// ─── OSRM request with one retry ─────────────────────────────────────────────
async function osrmRoute(from, to, attempt = 0) {
  const coords = `${from.lng},${from.lat};${to.lng},${to.lat}`
  const url    = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson&exclude=ferry&steps=false`
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
    if (attempt === 0) {
      await new Promise(res => setTimeout(res, 700))
      return osrmRoute(from, to, 1)
    }
    return null  // signal caller to use fallback
  }
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
      // OSRM down — give price estimate via haversine so the user isn't blocked
      result = fallbackEstimate(from, to)
      setError('Estimation (OSRM indisponible)')
      // Auto-clear the warning after 4s
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
