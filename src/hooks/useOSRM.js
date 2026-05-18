import { useState, useCallback } from 'react'
import { PRICE } from '../utils/priceEngine'

async function osrmRoute(from, to) {
  const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`
  const ctrl = new AbortController()
  const tid  = setTimeout(() => ctrl.abort(), 8000)
  try {
    const r    = await fetch(url, { signal: ctrl.signal })
    clearTimeout(tid)
    const data = await r.json()
    if (!data.routes?.length) return null
    const route = data.routes[0]
    return {
      km:       route.distance / 1000,
      mins:     (route.duration / 60) * PRICE.trafficBuffer,
      rawMins:  route.duration / 60,
      geometry: route.geometry,
    }
  } catch {
    clearTimeout(tid)
    return null
  }
}

export default function useOSRM() {
  const [route,   setRoute]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const fetchRoute = useCallback(async (from, to) => {
    if (!from || !to) return null
    setLoading(true)
    setError(null)
    const result = await osrmRoute(from, to)
    setLoading(false)
    if (!result) {
      setError('Impossible de calculer le trajet')
      return null
    }
    setRoute(result)
    return result
  }, [])

  const clearRoute = useCallback(() => {
    setRoute(null)
    setError(null)
  }, [])

  return { route, loading, error, fetchRoute, clearRoute }
}
