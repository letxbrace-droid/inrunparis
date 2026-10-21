import { chromium } from 'playwright'
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' })
const pg = await b.newPage({ viewport: { width: 390, height: 844 } })
await pg.goto('http://127.0.0.1:4179/inrunparis/', { waitUntil: 'networkidle' })
await pg.waitForTimeout(800)
const v = await pg.evaluate(() => {
  const out = []
  const VP = 390 * 844
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el)
    if (cs.display === 'none' || +cs.opacity === 0) continue
    const r = el.getBoundingClientRect()
    const area = r.width * r.height
    if (area < VP * 0.12) continue                 // au moins 12 % de l'écran
    const bgi = cs.backgroundImage, bdf = cs.backdropFilter || cs.webkitBackdropFilter
    const bgc = cs.backgroundColor
    const translucide = /rgba\([^)]+,\s*0?\.\d+\)/.test(bgc)
    const gradient = bgi !== 'none' && /gradient/.test(bgi)
    if (!gradient && !translucide && (!bdf || bdf === 'none')) continue
    out.push({
      pctEcran: Math.round(area / VP * 100),
      tag: el.tagName, cls: (el.className?.toString?.() || '').slice(0, 44),
      fond: gradient ? bgi.slice(0, 74) : bgc,
      verre: bdf && bdf !== 'none' ? bdf : '—',
      opacite: cs.opacity,
    })
  }
  return out.sort((a, b) => b.pctEcran - a.pctEcran)
})
for (const x of v) console.log(`  ${String(x.pctEcran).padStart(3)}%  verre=${x.verre}  op=${x.opacite}\n        ${x.cls || x.tag}\n        ${x.fond}`)
console.log(`\n  ${v.length} couche(s) couvrant ≥12 % de l'écran`)
await b.close()
