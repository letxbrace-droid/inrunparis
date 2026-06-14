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
  airport:     '#3b82f6',
  terminal:    '#3b82f6',
  gare:        '#8b5cf6',
  poi:         '#f59e0b',
  city:        '#10b981',
  nominatim:   '#FF5A1F',
  // POI categories
  bank:        '#22c55e',
  atm:         '#22c55e',
  bakery:      '#f97316',
  pharmacy:    '#ef4444',
  supermarket: '#0ea5e9',
  doctors:     '#06b6d4',
  hospital:    '#ef4444',
  restaurant:  '#f59e0b',
  parking:     '#8b5cf6',
  fuel:        '#6b7280',
  post_office: '#eab308',
}

/*
 * POI_CATEGORIES — keyword → Photon osm_tag + optional Overpass query
 * typeOnly = true  → user wants "nearest of this type", not a specific named place
 *                    → use Overpass when center is available
 */
const POI_CATEGORIES = [
  // Named banks
  { keys: ['bnp', 'bnp paribas'],                photonTag: 'amenity:bank', icon: '🏦', color: '#00A551', typeKey: 'bank' },
  { keys: ['société générale', 'sogecc', ' sg '], photonTag: 'amenity:bank', icon: '🏦', color: '#E10019', typeKey: 'bank' },
  { keys: ['crédit agricole', 'credit agricole'], photonTag: 'amenity:bank', icon: '🏦', color: '#00813A', typeKey: 'bank' },
  { keys: ["caisse d'épargne", 'caisse epargne'], photonTag: 'amenity:bank', icon: '🏦', color: '#005CA9', typeKey: 'bank' },
  { keys: ['lcl'],                                photonTag: 'amenity:bank', icon: '🏦', color: '#003E7E', typeKey: 'bank' },
  { keys: ['hsbc'],                               photonTag: 'amenity:bank', icon: '🏦', color: '#DB0011', typeKey: 'bank' },
  { keys: ['boursorama'],                         photonTag: 'amenity:bank', icon: '🏦', color: '#38a169', typeKey: 'bank' },
  // Generic bank / ATM  (typeOnly → Overpass)
  { keys: ['banque', 'bank'],                     photonTag: 'amenity:bank',        overpassTag: { key: 'amenity', val: 'bank' },         icon: '🏦', color: '#6366f1', typeKey: 'bank',        typeOnly: true },
  { keys: ['distributeur', 'dab', 'retrait cash', 'retrait'],
                                                  photonTag: 'amenity:atm',         overpassTag: { key: 'amenity', val: 'atm' },          icon: '💳', color: '#22c55e', typeKey: 'atm',         typeOnly: true },
  // Food
  { keys: ['boulangerie', 'boulanger', 'pain', 'bakery'],
                                                  photonTag: 'shop:bakery',         overpassTag: { key: 'shop',    val: 'bakery' },        icon: '🥖', color: '#f97316', typeKey: 'bakery',      typeOnly: true },
  { keys: ['pharmacie', 'pharmacy'],              photonTag: 'amenity:pharmacy',    overpassTag: { key: 'amenity', val: 'pharmacy' },      icon: '💊', color: '#ef4444', typeKey: 'pharmacy',    typeOnly: true },
  // Named supermarkets
  { keys: ['carrefour'],                          photonTag: 'shop:supermarket',    icon: '🛒', color: '#0050A0', typeKey: 'supermarket' },
  { keys: ['lidl'],                               photonTag: 'shop:supermarket',    icon: '🛒', color: '#EE1C25', typeKey: 'supermarket' },
  { keys: ['monoprix'],                           photonTag: 'shop:supermarket',    icon: '🛒', color: '#1a1a1a', typeKey: 'supermarket' },
  { keys: ['franprix'],                           photonTag: 'shop:supermarket',    icon: '🛒', color: '#FF4900', typeKey: 'supermarket' },
  { keys: ['intermarché', 'intermarche'],         photonTag: 'shop:supermarket',    icon: '🛒', color: '#e53e3e', typeKey: 'supermarket' },
  { keys: ['aldi'],                               photonTag: 'shop:supermarket',    icon: '🛒', color: '#1e40af', typeKey: 'supermarket' },
  // Generic supermarket
  { keys: ['supermarché', 'supermarche', 'supermarket'],
                                                  photonTag: 'shop:supermarket',    overpassTag: { key: 'shop',    val: 'supermarket' },   icon: '🛒', color: '#0ea5e9', typeKey: 'supermarket', typeOnly: true },
  // Health
  { keys: ['médecin', 'medecin', 'docteur', 'généraliste', 'doctor'],
                                                  photonTag: 'amenity:doctors',     overpassTag: { key: 'amenity', val: 'doctors' },       icon: '🩺', color: '#06b6d4', typeKey: 'doctors',     typeOnly: true },
  { keys: ['hôpital', 'hopital', 'urgences'],    photonTag: 'amenity:hospital',    overpassTag: { key: 'amenity', val: 'hospital' },      icon: '🏥', color: '#ef4444', typeKey: 'hospital',    typeOnly: true },
  { keys: ['clinique'],                           photonTag: 'amenity:clinic',      overpassTag: { key: 'amenity', val: 'clinic' },        icon: '🏥', color: '#ef4444', typeKey: 'hospital',    typeOnly: true },
  // Services
  { keys: ['la poste', 'bureau de poste', 'poste'],
                                                  photonTag: 'amenity:post_office', overpassTag: { key: 'amenity', val: 'post_office' },   icon: '📮', color: '#FBBA00', typeKey: 'post_office', typeOnly: true },
  { keys: ['parking', 'stationnement'],           photonTag: 'amenity:parking',     overpassTag: { key: 'amenity', val: 'parking' },       icon: '🅿️', color: '#8b5cf6', typeKey: 'parking',     typeOnly: true },
  { keys: ['station', 'essence', 'carburant'],    photonTag: 'amenity:fuel',        overpassTag: { key: 'amenity', val: 'fuel' },          icon: '⛽', color: '#6b7280', typeKey: 'fuel',        typeOnly: true },
  // Food & drink generic
  { keys: ['restaurant', 'resto'],                photonTag: 'amenity:restaurant',  overpassTag: { key: 'amenity', val: 'restaurant' },    icon: '🍽️', color: '#f59e0b', typeKey: 'restaurant',  typeOnly: true },
  { keys: ['café', 'cafe'],                       photonTag: 'amenity:cafe',        overpassTag: { key: 'amenity', val: 'cafe' },          icon: '☕', color: '#a16207', typeKey: 'restaurant',  typeOnly: true },
]

function norm(s) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

function detectPOI(q) {
  const n = norm(q)
  for (const cat of POI_CATEGORIES) {
    if (cat.keys.some(k => n.includes(norm(k)))) return cat
  }
  return null
}

/* Overpass — finds nearest POIs of a given type around a center point */
async function searchOverpass(poi, center, radius = 2000) {
  const { key, val } = poi.overpassTag
  const query = `[out:json][timeout:8];(node["${key}"="${val}"](around:${radius},${center.lat},${center.lng});way["${key}"="${val}"](around:${radius},${center.lat},${center.lng}););out body center 8;`
  const r = await Promise.race([
    fetch('https://overpass-api.de/api/interpreter', {
      method:  'POST',
      body:    `data=${encodeURIComponent(query)}`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }),
    new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 7000)),
  ])
  const data = await r.json()
  return (data.elements || []).map(el => {
    const lat  = el.lat  ?? el.center?.lat
    const lng  = el.lon  ?? el.center?.lon
    const name = el.tags?.name || poi.keys[0]
    const num  = el.tags?.['addr:housenumber'] || ''
    const st   = el.tags?.['addr:street'] || ''
    const addr = num && st ? `${num} ${st}` : st
    const city = el.tags?.['addr:city'] || ''
    return {
      name,
      city:     addr && city ? `${addr}, ${city}` : addr || city,
      lat, lng,
      type:     poi.typeKey,
      poiIcon:  poi.icon,
      poiColor: poi.color,
    }
  }).filter(el => el.lat && el.lng)
}

export function displayAddr(item) {
  return item?.city ? `${item.name}, ${item.city}` : (item?.name || '')
}

/*
 * searchPlaces(q, center?)
 * center = { lat, lng } — user's current/departure position for location-biased results
 */
export async function searchPlaces(q, center = null) {
  const matched = PRESETS.filter(p => norm(p.name).includes(norm(q))).slice(0, 5)
  if (matched.length >= 5 || q.length < 2) return matched

  const poi  = q.length >= 2 ? detectPOI(q) : null
  const qNum = q.match(/^(\d+)\s/)?.[1] || ''

  // "Type-only" searches with a nearby center → Overpass (nearest results)
  if (poi?.typeOnly && poi.overpassTag && center) {
    try {
      const nearby = await searchOverpass(poi, center)
      if (nearby.length > 0) return [...matched, ...nearby].slice(0, 6)
    } catch { /* fall through to Photon */ }
  }

  // Photon — with location bias and optional POI tag filter
  try {
    const params = new URLSearchParams({ q, limit: '6', lang: 'fr' })
    if (center) {
      params.set('lat', String(center.lat))
      params.set('lon', String(center.lng))
    } else {
      params.set('bbox', '-5.14,41.33,9.56,51.09') // Metropolitan France
    }
    if (poi?.photonTag) params.set('osm_tag', poi.photonTag)

    const r    = await fetch(`https://photon.komoot.io/api/?${params}`, { headers: { 'Accept-Language': 'fr' } })
    const data = await r.json()

    const seen    = new Set(matched.map(p => norm(p.name)))
    const seenKey = new Set()

    const nom = (data.features || []).flatMap(f => {
      const p = f.properties
      let name, city

      if (poi) {
        // POI mode: preserve the place name, show address as subtitle
        name           = p.name
        const num      = p.housenumber || ''
        const street   = p.street || ''
        const addr     = num && street ? `${num} ${street}` : street
        const cityName = p.city || p.town || p.village || ''
        city           = addr && cityName ? `${addr}, ${cityName}` : addr || cityName
      } else {
        // Address mode: show the formatted address
        const num  = p.housenumber || qNum
        const road = p.street || (p.type === 'house' ? '' : p.name) || ''
        name       = num && road ? `${num} ${road}` : road || p.name || ''
        city       = p.city || p.town || p.village || p.municipality || p.county || ''
      }

      if (!name) return []

      // Dedup: use lat/lng for POIs (many branches, same name), name+city for addresses
      const dk = poi
        ? `${f.geometry.coordinates[0].toFixed(4)},${f.geometry.coordinates[1].toFixed(4)}`
        : norm(name) + '|' + norm(city)
      if (seenKey.has(dk) || (!poi && seen.has(norm(name)))) return []
      seenKey.add(dk)

      return [{
        name, city,
        lat:      f.geometry.coordinates[1],
        lng:      f.geometry.coordinates[0],
        type:     poi ? poi.typeKey : 'nominatim',
        poiIcon:  poi?.icon  ?? null,
        poiColor: poi?.color ?? null,
      }]
    })

    return [...matched, ...nom].slice(0, 6)
  } catch {
    return matched
  }
}
