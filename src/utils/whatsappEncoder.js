import { applyPromoDiscount } from './priceEngine'

const WA_NUMBER = '33767742220'

// Unicode escapes — immune to file encoding / build tool issues
const E = {
  ticket:    '\u{1F3AB}',
  person:    '\u{1F464}',
  email:     '\u{1F4E7}',
  clock:     '\u{1F552}',
  pin:       '\u{1F4CD}',
  flag:      '\u{1F3C1}',
  money:     '\u{1F4B0}',
  moon:      '\u{1F319}',
  plane:     '✈️',
  gift:      '\u{1F381}',
  music:     '\u{1F3B5}',
  snowflake: '❄️',
  sparkles:  '\u{2728}',
  card:      '\u{1F4B3}',
  memo:      '\u{1F4DD}',
  mute:      '\u{1F507}',
}

function sanitize(str = '') {
  return String(str)
    .replace(/[<>]/g, '')
    .replace(/\*|_|~|`/g, '')
    .trim()
    .slice(0, 500)
}

function formatDate(isoDatetime) {
  if (!isoDatetime) return 'Dès que possible'
  return new Date(isoDatetime).toLocaleString('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

export function buildWhatsAppMessage(booking) {
  const {
    bonNumber, clientName, clientEmail, pickup,
    depart, arrive, price, promo,
    ambiance, volume, clim, options, payment, note,
  } = booking

  const lines = [
    '*NOUVELLE RÉSERVATION I&N RUN*',
    '',
    `${E.ticket} N° BON : ${bonNumber || '—'}`,
    '',
    `${E.person} Client : ${sanitize(clientName) || '—'}`,
  ]

  if (clientEmail) lines.push(`${E.email} Email : ${sanitize(clientEmail)}`)

  lines.push(
    '',
    `${E.clock} Prise en charge : ${formatDate(pickup)}`,
    `${E.pin} Départ : ${depart?.name || '—'}${depart?.city ? ', ' + depart.city : ''}`,
    `${E.flag} Arrivée : ${arrive?.name || '—'}${arrive?.city ? ', ' + arrive.city : ''}`,
    '',
  )

  if (price) {
    const finalPrice = applyPromoDiscount(price.final, promo)
    lines.push(`${E.money} Tarif : ${finalPrice}€ (${price.km} km · ${price.mins} min)`)
    if (promo)           lines.push(`${E.gift} Code promo : ${sanitize(promo.code)} — ${sanitize(promo.label)}`)
    if (price.isNight)   lines.push(`${E.moon} Tarif nuit appliqué`)
    if (price.isAirport) lines.push(`${E.plane} Supplément aéroport inclus`)
    lines.push('')
  }

  if (ambiance === 'silence') lines.push(`${E.mute} Ambiance : silence demandé`)
  else lines.push(`${E.music} ${ambiance === 'musique' ? 'Musique' : 'Radio'} · Volume ${volume}%`)

  lines.push(`${E.snowflake} Climatisation : ${clim}°C`)

  const optNames = []
  if (options?.wifi)        optNames.push('Wi-Fi 5G')
  if (options?.eau)         optNames.push("Bouteille d'eau")
  if (options?.usb)         optNames.push('Chargeur USB')
  if (options?.confiseries) optNames.push('Confiseries')
  if (options?.siege)       optNames.push('Siège enfant')
  if (optNames.length)      lines.push(`${E.sparkles} Prestations : ${optNames.join(', ')}`)

  lines.push(`${E.card} Règlement : ${payment || 'Carte'}`)

  const cleanNote = sanitize(note)
  if (cleanNote) lines.push('', `${E.memo} Note : ${cleanNote}`)

  lines.push('', 'Merci de bien vouloir confirmer ma réservation.')

  return lines.join('\n')
}

export function sendWhatsApp(booking) {
  const msg = encodeURIComponent(buildWhatsAppMessage(booking))
  window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, '_blank')
}

export function generateBonNumber() {
  return `INR-${Date.now().toString(36).toUpperCase().slice(-5)}`
}
