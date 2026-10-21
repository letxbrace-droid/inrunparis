import { chromium } from 'playwright'
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' })
const pg = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
const errs = [], fonts = []
pg.on('pageerror', e => errs.push('PAGEERROR: ' + e.message))
pg.on('console', m => { const t = m.text(); if (m.type() === 'error' && !/TUNNEL|frame-ancestors/.test(t)) errs.push(t.slice(0, 120)) })
pg.on('request', r => { if (/\.woff2?/.test(r.url())) fonts.push(r.url().split('/').pop()) })
pg.on('requestfailed', r => { if (/\.woff2?/.test(r.url())) errs.push('FONT ÉCHEC: ' + r.url().split('/').pop()) })
await pg.goto('http://127.0.0.1:4179/inrunparis/', { waitUntil: 'networkidle' })
await pg.waitForTimeout(900)
const nonOutfit = await pg.evaluate(() => {
  let n = 0
  for (const el of document.querySelectorAll('body *')) {
    if (!el.firstChild || el.firstChild.nodeType !== 3 || !el.textContent.trim()) continue
    if (getComputedStyle(el).fontFamily.split(',')[0].replace(/["']/g, '') !== 'Outfit') n++
  }
  return n
})
console.log('polices téléchargées  :', [...new Set(fonts)].join(', '))
console.log('éléments texte hors Outfit :', nonOutfit)
console.log('erreurs :', errs.length ? errs : 'aucune')
await pg.screenshot({ path: '/home/user/inrunparis/apercu-typo-unique.png' })
await b.close()
