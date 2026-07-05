// Build-time asset processing for the generated brand set.
// Reads raw sources from scripts/src/ (versioned, not deployed) and emits the
// runtime assets: every icon size, the maskable icon, the OG image, and the
// in-app Suzuki Swace line illustration. Run once after adding new sources:
//   npm i -D sharp && node scripts/process-assets.mjs   (sharp not shipped)
import sharp from 'sharp'
import { mkdirSync } from 'fs'

const SRC = 'scripts/src'
mkdirSync('public/icons', { recursive: true })
mkdirSync('public/brand', { recursive: true })

// ── App icon ────────────────────────────────────────────────────────────────
// icon.png is 1408×768 with the rounded-square icon centred and an AI watermark
// in the far bottom-right. A centred 720×720 crop captures the icon cleanly.
const ICON = `${SRC}/icon.png`
const CROP = { left: Math.round((1408 - 720) / 2), top: Math.round((768 - 720) / 2), width: 720, height: 720 }
const SIZES = [48, 72, 96, 144, 152, 180, 192, 384, 512]

async function buildIcons() {
  const master = await sharp(ICON).extract(CROP).resize(512, 512).png().toBuffer()
  for (const s of SIZES) {
    await sharp(master).resize(s, s).png().toFile(`public/icons/icon-${s}.png`)
  }
  for (const s of [180, 192, 512]) {
    await sharp(master).resize(s, s).png().toFile(`public/icon-${s}.png`)
  }
  // Maskable: content scaled to ~78% on a solid AMOLED-black square so
  // Android's circular safe-zone never clips the "I&N R".
  const inner = await sharp(master).resize(400, 400).png().toBuffer()
  const maskable = await sharp({ create: { width: 512, height: 512, channels: 4, background: { r: 5, g: 5, b: 5, alpha: 1 } } })
    .composite([{ input: inner, gravity: 'center' }]).png().toBuffer()
  await sharp(maskable).toFile('public/icons/icon-maskable-512.png')
  await sharp(maskable).toFile('public/icon-maskable-512.png')
  console.log('icons ✓')
}

// ── OG / social image ─────────────────────────────────────────────────────
async function buildOG() {
  const base = await sharp(`${SRC}/og.png`).resize(1200, 630, { fit: 'cover', position: 'center' }).png().toBuffer()
  const scrim = Buffer.from(
    `<svg width="1200" height="630"><defs><radialGradient id="g" cx="94%" cy="88%" r="13%">
       <stop offset="0%" stop-color="#050505" stop-opacity="0.96"/>
       <stop offset="60%" stop-color="#050505" stop-opacity="0.7"/>
       <stop offset="100%" stop-color="#050505" stop-opacity="0"/>
     </radialGradient></defs><rect width="1200" height="630" fill="url(#g)"/></svg>`)
  await sharp(base).composite([{ input: scrim }]).jpeg({ quality: 88 }).toFile('public/og-image.jpg')
  console.log('og-image.jpg ✓')
}

// ── In-app Suzuki Swace (empty state) ───────────────────────────────────────
async function buildSwace() {
  const buf = await sharp(`${SRC}/swace-side.png`).trim({ threshold: 20 }).resize({ width: 640 }).png().toBuffer()
  await sharp(buf).toFile('public/brand/swace-side.png')
  console.log('swace-side ✓')
}

await buildIcons()
await buildOG()
await buildSwace()
console.log('done')
