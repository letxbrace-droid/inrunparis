import { chromium } from 'playwright'
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' })
const pg = await b.newPage({ viewport: { width: 390, height: 844 } })
await pg.goto('http://127.0.0.1:4179/inrunparis/', { waitUntil: 'networkidle' })
await pg.waitForTimeout(600)
const odd = await pg.evaluate(() => {
  const out = []
  for (const el of document.querySelectorAll('body, body *')) {
    if (!el.textContent?.trim()) continue
    const cs = getComputedStyle(el)
    const f = cs.fontFamily.split(',')[0].replace(/["']/g, '')
    if (f !== 'Outfit') out.push({
      tag: el.tagName, cls: (el.className || '').toString().slice(0, 50),
      famille: cs.fontFamily.slice(0, 60), inline: el.getAttribute('style')?.slice(0, 70) || '',
      texte: el.textContent.trim().slice(0, 40),
    })
  }
  return out
})
console.log(JSON.stringify(odd, null, 1))
await b.close()
