export const PRESETS = [
  { name: 'Charles de Gaulle (CDG)', city: 'Roissy-en-France',  lat: 49.0097, lng: 2.5479,  type: 'airport'  },
  { name: 'CDG · Terminal 1',        city: 'Roissy-en-France',  lat: 49.0097, lng: 2.5479,  type: 'terminal' },
  { name: 'CDG · Terminal 2E',       city: 'Roissy-en-France',  lat: 49.0056, lng: 2.5693,  type: 'terminal' },
  { name: 'CDG · Terminal 2F',       city: 'Roissy-en-France',  lat: 49.0064, lng: 2.5683,  type: 'terminal' },
  { name: 'Orly (ORY)',              city: 'Orly',              lat: 48.7233, lng: 2.3795,  type: 'airport'  },
  { name: 'Orly · Terminal 1-2',    city: 'Orly',              lat: 48.7260, lng: 2.3653,  type: 'terminal' },
  { name: 'Orly · Terminal 3-4',    city: 'Orly',              lat: 48.7281, lng: 2.3594,  type: 'terminal' },
  { name: 'Beauvais (BVA)',          city: 'Beauvais',          lat: 49.4544, lng: 2.1128,  type: 'airport'  },
  { name: 'Gare du Nord',           city: 'Paris 10e',         lat: 48.8809, lng: 2.3553,  type: 'gare'     },
  { name: 'Gare de Lyon',           city: 'Paris 12e',         lat: 48.8443, lng: 2.3738,  type: 'gare'     },
  { name: 'Gare Montparnasse',      city: 'Paris 14e',         lat: 48.8410, lng: 2.3216,  type: 'gare'     },
  { name: 'Gare Saint-Lazare',      city: 'Paris 8e',          lat: 48.8754, lng: 2.3255,  type: 'gare'     },
  { name: "Gare de l'Est",          city: 'Paris 10e',         lat: 48.8767, lng: 2.3589,  type: 'gare'     },
  { name: 'La Défense · CNIT',      city: 'La Défense',        lat: 48.8897, lng: 2.2378,  type: 'poi'      },
  { name: 'Disneyland Paris',       city: 'Marne-la-Vallée',   lat: 48.8722, lng: 2.7758,  type: 'poi'      },
  { name: 'Versailles',             city: 'Versailles',        lat: 48.8049, lng: 2.1204,  type: 'city'     },
  { name: 'Ris-Orangis (91)',       city: 'Ris-Orangis',       lat: 48.6468, lng: 2.4185,  type: 'city'     },
]

export const TYPE_COLOR = {
  airport:   '#3b82f6',
  terminal:  '#3b82f6',
  gare:      '#8b5cf6',
  poi:       '#f59e0b',
  city:      '#10b981',
  nominatim: '#ff4103',
}

function norm(s) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

export function displayAddr(item) {
  return item?.city ? `${item.name}, ${item.city}` : (item?.name || '')
}

export async function searchPlaces(q) {
  const matched = PRESETS.filter(p => norm(p.name).includes(norm(q))).slice(0, 5)
  if (matched.length >= 5 || q.length < 3) return matched

  const qNum = q.match(/^(\d+)\s/)?.[1] || ''

  try {
    const url  = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=6&lang=fr&bbox=-5.14,41.33,9.56,51.09`
    const r    = await fetch(url, { headers: { 'Accept-Language': 'fr' } })
    const data = await r.json()
    const seen    = new Set(matched.map(p => norm(p.name)))
    const seenNom = new Set()
    const nom = (data.features || []).flatMap(f => {
      const p    = f.properties
      const num  = p.housenumber || qNum
      const road = p.street || (p.type === 'house' ? '' : p.name) || ''
      const name = num && road ? `${num} ${road}` : road || p.name || ''
      const city = p.city || p.town || p.village || p.municipality || p.county || ''
      if (!name) return []
      const key = norm(name) + '|' + norm(city)
      if (seenNom.has(key) || seen.has(norm(name))) return []
      seenNom.add(key)
      return [{ name, city, lat: f.geometry.coordinates[1], lng: f.geometry.coordinates[0], type: 'nominatim' }]
    })
    return [...matched, ...nom].slice(0, 6)
  } catch {
    return matched
  }
}
