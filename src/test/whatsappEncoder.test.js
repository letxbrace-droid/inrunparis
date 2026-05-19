import { describe, it, expect, vi } from 'vitest'
import { buildWhatsAppMessage, generateBonNumber } from '../utils/whatsappEncoder'

const BASE_BOOKING = {
  bonNumber:   'INR-ABCDE',
  clientName:  'Marie Dupont',
  clientEmail: '',
  pickup:      '2024-06-15T14:30:00',
  depart:      { name: '15 rue de la Paix, Paris' },
  arrive:      { name: 'Aéroport CDG Terminal 2' },
  price:       { final: 58, km: 28.4, mins: 35, isNight: false, isAirport: true },
  promo:       null,
  ambiance:    'musique',
  volume:      65,
  clim:        22,
  options:     { wifi: true, eau: true, usb: false, confiseries: false, siege: false },
  payment:     'Carte',
  note:        '',
}

// ─── buildWhatsAppMessage ────────────────────────────────────────────────────

describe('buildWhatsAppMessage', () => {
  it('contains the bon number', () => {
    const msg = buildWhatsAppMessage(BASE_BOOKING)
    expect(msg).toContain('INR-ABCDE')
  })

  it('contains the client name', () => {
    const msg = buildWhatsAppMessage(BASE_BOOKING)
    expect(msg).toContain('Marie Dupont')
  })

  it('contains departure address', () => {
    const msg = buildWhatsAppMessage(BASE_BOOKING)
    expect(msg).toContain('15 rue de la Paix, Paris')
  })

  it('contains arrival address', () => {
    const msg = buildWhatsAppMessage(BASE_BOOKING)
    expect(msg).toContain('Aéroport CDG Terminal 2')
  })

  it('contains price and distance', () => {
    const msg = buildWhatsAppMessage(BASE_BOOKING)
    expect(msg).toContain('58€')
    expect(msg).toContain('28.4 km')
  })

  it('shows airport supplement when isAirport', () => {
    const msg = buildWhatsAppMessage(BASE_BOOKING)
    expect(msg).toContain('Supplément aéroport inclus')
  })

  it('does not show night surcharge when isNight false', () => {
    const msg = buildWhatsAppMessage(BASE_BOOKING)
    expect(msg).not.toContain('Tarif nuit')
  })

  it('shows night surcharge when isNight true', () => {
    const booking = { ...BASE_BOOKING, price: { ...BASE_BOOKING.price, isNight: true } }
    const msg = buildWhatsAppMessage(booking)
    expect(msg).toContain('Tarif nuit appliqué')
  })

  it('shows active options', () => {
    const msg = buildWhatsAppMessage(BASE_BOOKING)
    expect(msg).toContain('Wi-Fi 5G')
    expect(msg).toContain("Bouteille d'eau")
    expect(msg).not.toContain('Chargeur USB')
  })

  it('shows payment method', () => {
    const msg = buildWhatsAppMessage(BASE_BOOKING)
    expect(msg).toContain('Carte')
  })

  it('shows silence ambiance label', () => {
    const booking = { ...BASE_BOOKING, ambiance: 'silence' }
    const msg = buildWhatsAppMessage(booking)
    expect(msg).toContain('silence demandé')
  })

  it('shows radio ambiance label', () => {
    const booking = { ...BASE_BOOKING, ambiance: 'radio' }
    const msg = buildWhatsAppMessage(booking)
    expect(msg).toContain('Radio')
  })

  it('shows volume for musique/radio', () => {
    const msg = buildWhatsAppMessage(BASE_BOOKING)
    expect(msg).toContain('Volume 65%')
  })

  it('shows clim temperature', () => {
    const msg = buildWhatsAppMessage(BASE_BOOKING)
    expect(msg).toContain('22°C')
  })

  it('includes promo code when present', () => {
    const booking = { ...BASE_BOOKING, promo: { code: 'BIENVENUE', discount: 10 } }
    const msg = buildWhatsAppMessage(booking)
    expect(msg).toContain('BIENVENUE')
  })

  it('includes note when present', () => {
    const booking = { ...BASE_BOOKING, note: 'Sonnez à l\'interphone' }
    const msg = buildWhatsAppMessage(booking)
    expect(msg).toContain("Sonnez à l'interphone")
  })

  it('strips markdown formatting from client name', () => {
    const booking = { ...BASE_BOOKING, clientName: '*Evil* _name_' }
    const msg = buildWhatsAppMessage(booking)
    expect(msg).not.toContain('*Evil*')
    expect(msg).toContain('Evil name')
  })

  it('strips HTML-like characters from note', () => {
    const booking = { ...BASE_BOOKING, note: '<script>alert(1)</script>' }
    const msg = buildWhatsAppMessage(booking)
    expect(msg).not.toContain('<script>')
    expect(msg).toContain('scriptalert(1)/script')
  })

  it('handles missing bon number gracefully', () => {
    const booking = { ...BASE_BOOKING, bonNumber: null }
    const msg = buildWhatsAppMessage(booking)
    expect(msg).toContain('—')
  })

  it('shows ASAP when pickup is null', () => {
    const booking = { ...BASE_BOOKING, pickup: null }
    const msg = buildWhatsAppMessage(booking)
    expect(msg).toContain('Dès que possible')
  })

  it('shows formatted date when pickup is set', () => {
    const msg = buildWhatsAppMessage(BASE_BOOKING)
    expect(msg).toContain('15/06/2024')
  })

  it('includes confirmation request line', () => {
    const msg = buildWhatsAppMessage(BASE_BOOKING)
    expect(msg).toContain('confirmer ma réservation')
  })

  it('includes optional email when provided', () => {
    const booking = { ...BASE_BOOKING, clientEmail: 'marie@example.com' }
    const msg = buildWhatsAppMessage(booking)
    expect(msg).toContain('marie@example.com')
  })

  it('omits email line when email is empty', () => {
    const msg = buildWhatsAppMessage(BASE_BOOKING)
    expect(msg).not.toContain('Email')
  })
})

// ─── generateBonNumber ───────────────────────────────────────────────────────

describe('generateBonNumber', () => {
  it('starts with INR- prefix', () => {
    expect(generateBonNumber()).toMatch(/^INR-/)
  })

  it('has exactly 5 chars after prefix', () => {
    const bon = generateBonNumber()
    const suffix = bon.replace('INR-', '')
    expect(suffix).toHaveLength(5)
  })

  it('uses uppercase alphanumeric chars', () => {
    const bon = generateBonNumber()
    expect(bon).toMatch(/^INR-[0-9A-Z]{5}$/)
  })

  it('generates unique values across different timestamps', () => {
    // generateBonNumber slices the last 5 chars of Date.now().toString(36).
    // Advance fake time by 1ms between calls to guarantee different timestamps.
    vi.useFakeTimers()
    const bons = Array.from({ length: 20 }, (_, i) => {
      vi.setSystemTime(new Date(1_700_000_000_000 + i))
      return generateBonNumber()
    })
    vi.useRealTimers()
    expect(new Set(bons).size).toBe(20)
  })
})
