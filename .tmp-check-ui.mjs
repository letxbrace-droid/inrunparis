import { chromium } from 'playwright'
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' })
const pg = await b.newPage({ viewport: { width: 390, height: 844 } })
const errs = [], fonts = []
pg.on('pageerror', e => errs.push('PAGEERROR: ' + e.message))
pg.on('console', m => { const t = m.text(); if (m.type() === 'error' && !/TUNNEL|frame-ancestors/.test(t)) errs.push(t.slice(0, 120)) })
pg.on('request', r => { if (/\.woff2?/.test(r.url())) fonts.push(r.url().split('/').pop()) })
pg.on('requestfailed', r => { if (/\.woff2?/.test(r.url())) errs.push('FONT ÉCHEC: ' + r.url().split('/').pop()) })
await pg.goto('http://127.0.0.1:4179/inrunparis/', { waitUntil: 'networkidle' })
await pg.waitForTimeout(800)
console.log('polices téléchargées :', [...new Set(fonts)].join(', ') || '(aucune)')
const fams = await pg.evaluate(() => {
  const m = new Map()
  for (const el of document.querySelectorAll('body, body *')) {
    if (!el.textContent?.trim()) continue
    const f = getComputedStyle(el).fontFamily.split(',')[0].replace(/["']/g, '')
    m.set(f, (m.get(f) || 0) + 1)
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1])
})
console.log('familles peintes :', fams.map(([f, n]) => `${f} ×${n}`).join(' | '))
await pg.screenshot({ path: '/tmp/claude-0/-home-user-inrunparis/4d1ac96a-921c-574e-8037-6df377bbb33e/scratchpad/apres.png' })
console.log('erreurs :', errs.length ? errs : 'aucune')
await b.close()
