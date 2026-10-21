/**
 * Audit de contraste — I&N RUN
 *
 * Parcourt chaque élément visible porteur de texte ou d'icône, recompose le
 * fond réellement peint derrière lui (en empilant les couches translucides
 * jusqu'à la racine) et mesure le rapport WCAG. Les deux thèmes sont testés.
 *
 *   npm run build && npm run audit:contrast
 *
 * Le thème se bascule par le store persisté, PAS par l'attribut data-theme :
 * les composants qui lisent th.isDark en JS ignorent un attribut forcé, et
 * l'audit mesurerait une page à moitié basculée.
 *
 * Faux positif connu : l'attribution OpenStreetMap porte une ombre portée
 * que ce calcul ne sait pas compter.
 */
import { chromium } from 'playwright'
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' })

const AUDIT = () => {
  const lum = (r, g, b) => {
    const f = c => { c /= 255; return c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4 }
    return .2126 * f(r) + .7152 * f(g) + .0722 * f(b)
  }
  const parse = s => {
    const m = s.match(/rgba?\(([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+))?/)
    return m ? { r: +m[1], g: +m[2], b: +m[3], a: m[4] === undefined ? 1 : +m[4] } : null
  }
  const over = (fg, bg) => ({ r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1 })
  const effBg = el => {
    let acc = { r: 255, g: 255, b: 255, a: 1 }, chain = []
    for (let n = el; n && n !== document.documentElement; n = n.parentElement) {
      const c = parse(getComputedStyle(n).backgroundColor)
      if (c && c.a > 0) chain.unshift(c)
    }
    const root = parse(getComputedStyle(document.documentElement).backgroundColor)
    if (root && root.a > 0) chain.unshift(root)
    acc = { r: 0, g: 0, b: 0, a: 1 }
    for (const c of chain) acc = over(c, acc)
    return acc
  }
  const bad = []
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el)
    if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) continue
    const r = el.getBoundingClientRect()
    if (r.width < 2 || r.height < 2) continue
    const txt = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join(' ').trim()
    const isIcon = el.tagName === 'svg' || el.tagName === 'SVG'
    if (!txt && !isIcon) continue
    const fgRaw = parse(isIcon ? (cs.stroke !== 'none' ? cs.stroke : cs.fill) : cs.color)
    if (!fgRaw) continue
    const bg = effBg(el)
    const fg = over(fgRaw, bg)
    const l1 = lum(fg.r, fg.g, fg.b), l2 = lum(bg.r, bg.g, bg.b)
    const ratio = (Math.max(l1, l2) + .05) / (Math.min(l1, l2) + .05)
    const size = parseFloat(cs.fontSize), bold = +cs.fontWeight >= 700
    const need = isIcon ? 3 : (size >= 24 || (size >= 18.66 && bold)) ? 3 : 4.5
    if (ratio < need) bad.push({
      quoi: isIcon ? 'icône' : txt.slice(0, 34), ratio: +ratio.toFixed(2), exige: need,
      px: Math.round(size), fg: isIcon ? ((cs.stroke !== 'none' && cs.stroke) || cs.fill) : cs.color, bg: `rgb(${Math.round(bg.r)},${Math.round(bg.g)},${Math.round(bg.b)})`,
      ou: el.className?.toString?.().slice(0, 42) || el.tagName,
    })
  }
  return bad
}

for (const theme of ['dark', 'light']) {
  const pg = await b.newPage({ viewport: { width: 390, height: 844 } })
  // Le thème se pilote par le store persisté, pas par l'attribut : les
  // composants qui lisent th.isDark en JS ignorent un data-theme forcé à la
  // main, et l'audit mesure alors une page à moitié basculée.
  await pg.goto('http://127.0.0.1:4179/inrunparis/', { waitUntil: 'domcontentloaded' })
  await pg.evaluate(t => {
    const raw = localStorage.getItem('inrun-booking')
    const o = raw ? JSON.parse(raw) : { state: {}, version: 0 }
    o.state = { ...o.state, theme: t, isDark: t === 'dark' }
    localStorage.setItem('inrun-booking', JSON.stringify(o))
  }, theme)
  await pg.reload({ waitUntil: 'networkidle' })
  await pg.waitForTimeout(800)
  const applied = await pg.evaluate(() => document.documentElement.dataset.theme)
  if (applied !== theme) { console.log(`  ⚠ thème demandé ${theme}, appliqué ${applied} — audit non fiable`); }
  const bad = await pg.evaluate(AUDIT)
  console.log(`\n═══ thème ${theme} : ${bad.length} élément(s) sous le seuil ═══`)
  for (const x of bad.slice(0, 14)) console.log(`  ${x.ratio}:1 (exige ${x.exige}) ${x.px}px  « ${x.quoi} »  fg=${x.fg} bg=${x.bg}  ${x.ou}`)
  await pg.screenshot({ path: `/tmp/claude-0/-home-user-inrunparis/4d1ac96a-921c-574e-8037-6df377bbb33e/scratchpad/nb-${theme}.png` })
  await pg.close()
}
await b.close()
