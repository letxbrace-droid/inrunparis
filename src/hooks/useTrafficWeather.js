import { useState, useCallback } from 'react'
import { PRICE } from '../utils/priceEngine'

const RISO = { lat: 48.6468, lng: 2.4185 }

const WX_ICONS = {
  0: '☀️', 1: '🌤', 2: '⛅', 3: '☁️',
  45: '🌫', 48: '🌫', 51: '🌦', 53: '🌦', 55: '🌧',
  61: '🌧', 63: '🌧', 65: '🌧', 71: '🌨', 73: '🌨',
  80: '🌦', 81: '🌧', 82: '⛈', 95: '⛈', 99: '⛈',
}
const WX_DESC = {
  0: 'Ciel dégagé', 1: 'Peu nuageux', 2: 'Partiellement nuageux',
  3: 'Couvert', 45: 'Brouillard', 51: 'Bruine légère',
  61: 'Pluie légère', 63: 'Pluie modérée', 65: 'Pluie forte',
  80: 'Averses légères', 81: 'Averses', 82: 'Averses fortes',
  95: 'Orage', 99: 'Orage fort',
}

const DESTINATIONS = [
  { name: 'CDG',   via: 'A1 · Roissy', lat: 49.0097, lng: 2.5479, baseMins: 52, baseKm: 52 },
  { name: 'Orly',  via: 'A6 · 91',     lat: 48.7233, lng: 2.3795, baseMins: 22, baseKm: 17 },
  { name: 'Paris', via: 'N7 · Périph', lat: 48.8566, lng: 2.3522, baseMins: 40, baseKm: 36 },
]

async function osrmRoute(from, to) {
  const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=false`
  try {
    const ctrl = new AbortController()
    const tid  = setTimeout(() => ctrl.abort(), 6000)
    const r    = await fetch(url, { signal: ctrl.signal })
    clearTimeout(tid)
    const data = await r.json()
    if (!data.routes?.length) return null
    return {
      km:   data.routes[0].distance / 1000,
      mins: (data.routes[0].duration / 60) * PRICE.trafficBuffer,
    }
  } catch { return null }
}

export default function useTrafficWeather() {
  const [weather, setWeather] = useState(null)
  const [traffic, setTraffic] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchAll = useCallback(async () => {
    setLoading(true)

    const [wxData, ...routes] = await Promise.allSettled([
      fetch('https://api.open-meteo.com/v1/forecast?latitude=48.6468&longitude=2.4185&current_weather=true&hourly=relative_humidity_2m,precipitation_probability', { signal: AbortSignal.timeout(8000) })
        .then((r) => r.json()),
      ...DESTINATIONS.map((d) => osrmRoute(RISO, d)),
    ])

    if (wxData.status === 'fulfilled') {
      const cw = wxData.value?.current_weather
      if (cw) {
        setWeather({
          temp: Math.round(cw.temperature),
          desc: WX_DESC[cw.weathercode] ?? '—',
          icon: WX_ICONS[cw.weathercode] ?? '🌡',
          wind: Math.round(cw.windspeed),
          code: cw.weathercode,
        })
      }
    }

    const h       = new Date().getHours()
    const isPeak  = (h >= 7 && h <= 10) || (h >= 16 && h <= 20)
    const isWeekend = [0, 6].includes(new Date().getDay())
    const peakMult  = isPeak && !isWeekend ? 1.45 : isWeekend ? 0.82 : 1.0

    const trafficItems = DESTINATIONS.map((dest, i) => {
      const r = routes[i].status === 'fulfilled' ? routes[i].value : null
      const mins = r ? r.mins : dest.baseMins * peakMult
      const km   = r ? r.km   : dest.baseKm
      const congestion = mins > dest.baseMins * 1.3 ? 'dense' : mins > dest.baseMins * 1.1 ? 'fluide' : 'rapide'
      return { ...dest, mins: Math.round(mins), km: Math.round(km), congestion, live: !!r }
    })
    setTraffic(trafficItems)

    setLoading(false)
  }, [])

  return { weather, traffic, loading, fetchAll }
}
