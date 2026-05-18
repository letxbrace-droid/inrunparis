const WA_NUMBER = '33767742220'

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
    `🎫 N° BON : ${bonNumber || '—'}`,
    '',
    `👤 Client : ${sanitize(clientName) || '—'}`,
  ]

  if (clientEmail) lines.push(`📧 Email : ${sanitize(clientEmail)}`)

  lines.push(
    '',
    `🕒 Prise en charge : ${formatDate(pickup)}`,
    `📍 Départ : ${depart?.name || '—'}`,
    `🏁 Arrivée : ${arrive?.name || '—'}`,
    '',
  )

  if (price) {
    lines.push(`💰 Tarif : ${price.final}€ (${price.km} km · ${price.mins} min)`)
    if (price.isNight) lines.push('🌙 Tarif nuit appliqué')
    if (price.isAirport) lines.push('✈️ Supplément aéroport inclus')
    if (promo) lines.push(`🎁 Code : ${sanitize(promo.code)}`)
    lines.push('')
  }

  if (ambiance === 'silence') lines.push('🔇 Ambiance : silence demandé')
  else lines.push(`🎵 ${ambiance === 'musique' ? 'Musique' : 'Radio'} · Volume ${volume}%`)

  lines.push(`❄️ Climatisation : ${clim}°C`)

  const optNames = []
  if (options?.wifi)        optNames.push('Wi-Fi 5G')
  if (options?.eau)         optNames.push("Bouteille d'eau")
  if (options?.usb)         optNames.push('USB recharge')
  if (options?.confiseries) optNames.push('Confiseries')
  if (options?.siege)       optNames.push('Siège enfant')
  if (optNames.length)      lines.push(`✨ Prestations : ${optNames.join(', ')}`)

  lines.push(`💳 Règlement : ${payment || 'Carte'}`)

  const cleanNote = sanitize(note)
  if (cleanNote) lines.push('', `📝 Note : ${cleanNote}`)

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
