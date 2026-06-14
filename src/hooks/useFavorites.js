import { useState } from 'react'

const FAV_KEY = 'inr-places'

const load = () => {
  try { return JSON.parse(localStorage.getItem(FAV_KEY) || '{}') } catch { return {} }
}

export function useFavorites() {
  const [favs, setFavs] = useState(load)

  const saveFav = (slot, place) => {
    const next = {
      ...favs,
      [slot]: { name: place.name, city: place.city || '', lat: place.lat, lng: place.lng },
    }
    setFavs(next)
    try { localStorage.setItem(FAV_KEY, JSON.stringify(next)) } catch {}
  }

  const removeFav = (slot) => {
    const { [slot]: _removed, ...rest } = favs
    setFavs(rest)
    try { localStorage.setItem(FAV_KEY, JSON.stringify(rest)) } catch {}
  }

  return { favs, saveFav, removeFav }
}
