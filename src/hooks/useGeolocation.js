import { useState, useCallback } from 'react'

async function reverseGeocode(lat, lng) {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&accept-language=fr`
  const r = await fetch(url, { headers: { 'Accept-Language': 'fr' } })
  const d = await r.json()

  // Use structured address fields so "35, Rue..." becomes "35 Rue..." (no comma mid-street)
  const addr   = d.address || {}
  const num    = addr.house_number || ''
  const road   = addr.road || addr.pedestrian || addr.path || addr.neighbourhood || ''
  const city   = addr.city || addr.town || addr.village || addr.municipality || addr.suburb || ''

  const street = num && road ? `${num} ${road}` : road || num
  const name   = street
    ? (city ? `${street}, ${city}` : street)
    : (d.display_name || '').split(',').slice(0, 2).join(', ').trim() || `GPS ${lat.toFixed(4)}`

  return { name, city, lat, lng }
}

export default function useGeolocation() {
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [error,  setError]  = useState(null)

  const detect = useCallback(async (onResult) => {
    if (!navigator.geolocation) {
      setStatus('error')
      setError('GPS non disponible sur cet appareil')
      return
    }
    setStatus('loading')
    setError(null)

    const getPos = () => new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject({ code: 3 }), 12000)
      navigator.geolocation.getCurrentPosition(
        pos => { clearTimeout(timer); resolve(pos) },
        err => { clearTimeout(timer); reject(err) },
        { enableHighAccuracy: true, timeout: 11000, maximumAge: 30000 },
      )
    })

    try {
      const pos    = await getPos()
      const result = await reverseGeocode(pos.coords.latitude, pos.coords.longitude)
      setStatus('success')
      onResult(result)
      setTimeout(() => setStatus('idle'), 3000)
    } catch (err) {
      const msgs = {
        1: 'Autorisez la localisation dans les réglages',
        2: 'Signal GPS indisponible',
        3: 'Délai dépassé — réessayez',
      }
      setStatus('error')
      setError(msgs[err.code] || 'Géolocalisation impossible')
      setTimeout(() => setStatus('idle'), 4000)
    }
  }, [])

  return { status, error, detect }
}
