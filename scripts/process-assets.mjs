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

// ── In-app line illustrations (empty state, vehicle card, success) ──────────
// The AI export bakes a grey/white checkerboard into the PNG instead of true
// transparency. Chroma-key by saturation: grey/white pixels (low sat) → alpha 0,
// orange line pixels (high sat) → kept, with soft anti-aliased edges.
async function keyToTransparent(srcPath) {
  const { data, info } = await sharp(srcPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const ch = info.channels
  for (let i = 0; i < data.length; i += ch) {
    const r = data[i], g = data[i + 1], b = data[i + 2]
    const sat = Math.max(r, g, b) - Math.min(r, g, b)
    data[i + 3] = Math.max(0, Math.min(255, (sat - 18) * 3))
  }
  return sharp(data, { raw: { width: info.width, height: info.height, channels: ch } }).png().toBuffer()
}

async function buildLineArt(name, width) {
  const keyed = await keyToTransparent(`${SRC}/${name}.png`)
  const buf = await sharp(keyed).trim().resize({ width }).png().toBuffer()
  await sharp(buf).toFile(`public/brand/${name}.png`)
  console.log(`${name} ✓`)
}

// ── iOS launch images (apple-touch-startup-image) ───────────────────────────
// splash-trace.png is a portrait AMOLED plate; cover-fit to common iPhone
// device resolutions and bury the corner watermark.
const IOS = [
  [1170, 2532], [1179, 2556], [1290, 2796], [1284, 2778], [1125, 2436],
]
async function buildSplash() {
  for (const [w, h] of IOS) {
    const base = await sharp(`${SRC}/splash-trace.png`).resize(w, h, { fit: 'cover', position: 'center' }).png().toBuffer()
    const scrim = Buffer.from(
      `<svg width="${w}" height="${h}"><defs><radialGradient id="g" cx="90%" cy="94%" r="16%">
         <stop offset="0%" stop-color="#050505" stop-opacity="0.98"/>
         <stop offset="65%" stop-color="#050505" stop-opacity="0.7"/>
         <stop offset="100%" stop-color="#050505" stop-opacity="0"/>
       </radialGradient></defs><rect width="${w}" height="${h}" fill="url(#g)"/></svg>`)
    await sharp(base).composite([{ input: scrim }]).png().toFile(`public/brand/splash-${w}x${h}.png`)
  }
  console.log('ios splash ✓')
}

await buildIcons()
await buildOG()
await buildLineArt('swace-side', 640)
await buildLineArt('swace-hybrid', 760)
await buildLineArt('trace-success', 560)
await buildSplash()
console.log('done')
