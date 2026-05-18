export const PRICE = {
  base:         13,
  perKm:        0.82,
  perMin:       0.16,
  min:          32,
  nightPct:     0.15,
  nightStart:   22,
  nightEnd:     6,
  trafficBuffer: 1.2,
  airportFlat:  6,
  vanPct:       0.25,
  ref: { base: 14.5, perKm: 0.92, perMin: 0.18 },
}

const AIRPORTS = ['cdg', 'roissy', 'orly', 'beauvais', 'tille', 'charles de gaulle', 'aéroport']

export function isNightTime(isoDatetime) {
  if (!isoDatetime) {
    const h = new Date().getHours()
    return h >= PRICE.nightStart || h < PRICE.nightEnd
  }
  const h = new Date(isoDatetime).getHours()
  return h >= PRICE.nightStart || h < PRICE.nightEnd
}

export function isAirportAddr(name = '') {
  const lower = name.toLowerCase()
  return AIRPORTS.some((a) => lower.includes(a))
}

export function computePrice(km, mins, pickupTime, vehicleType = 'berline') {
  let price = PRICE.base + km * PRICE.perKm + mins * PRICE.perMin
  const night   = isNightTime(pickupTime)
  const airport = isAirportAddr('')  // called with actual address strings at component level

  if (night)   price *= 1 + PRICE.nightPct
  if (airport) price += PRICE.airportFlat
  if (vehicleType === 'van') price *= 1 + PRICE.vanPct
  if (price < PRICE.min) price = PRICE.min

  const refPrice = PRICE.ref.base + km * PRICE.ref.perKm + mins * PRICE.ref.perMin
  const savings  = Math.max(0, Math.round(refPrice - price))

  return {
    final:    Math.round(price),
    km:       Math.round(km * 10) / 10,
    mins:     Math.round(mins),
    isNight:  night,
    isAirport: airport,
    savings,
  }
}

export function computePriceForBooking(km, mins, { pickup, depart, arrive, vehicleType }) {
  let price = PRICE.base + km * PRICE.perKm + mins * PRICE.perMin
  const night   = isNightTime(pickup)
  const airport = isAirportAddr(depart?.name ?? '') || isAirportAddr(arrive?.name ?? '')

  if (night)   price *= 1 + PRICE.nightPct
  if (airport) price += PRICE.airportFlat
  if (vehicleType === 'van') price *= 1 + PRICE.vanPct
  if (price < PRICE.min) price = PRICE.min

  const refPrice = PRICE.ref.base + km * PRICE.ref.perKm + mins * PRICE.ref.perMin
  const savings  = Math.max(0, Math.round(refPrice - price))

  return {
    final:     Math.round(price),
    km:        Math.round(km * 10) / 10,
    mins:      Math.round(mins),
    isNight:   night,
    isAirport: airport,
    savings,
  }
}
