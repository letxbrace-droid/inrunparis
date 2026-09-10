import { useEffect, useRef, useCallback, useState } from 'react'
// v6 is ESM-only and dropped its default export — the namespace import keeps
// every maplibregl.Map / .Marker / .LngLatBounds call site working unchanged.
import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

// MapLibre uses [lng, lat]
const PARIS = [2.3522, 48.8566]

// Vector styles, keyless and free. Light is OpenFreeMap's own published style.
// Dark is our AMOLED layer design — but it deliberately does NOT hard-code the
// tile endpoints: an earlier version hand-wrote a `sources` URL that turned out
// to be wrong, which renders as a black map (the canvas mounts, markers draw,
// but no tiles ever arrive). Instead we graft our layers onto the sources,
// glyphs and sprite declared by OpenFreeMap's published style, so the endpoints
// are correct by construction and survive any change on their side.
const DARK_LAYERS = '/inrunparis/mapstyle-dark.json'
const LIGHT_STYLE = 'https://tiles.openfreemap.org/styles/positron'

/**
 * Last-resort basemap: the CartoDB raster tiles this app used successfully for
 * its whole life before the vector migration. Vector styling is nicer, but a
 * map that renders beats a beautiful one that doesn't — if the vector stack
 * fails for any reason (unreachable host, wrong endpoint, CSP, DNS), we fall
 * back to tiles already proven to work on real devices.
 */
const CARTO_SUBS = ['a', 'b', 'c', 'd']
function rasterFallbackStyle(dark) {
  const set = dark ? 'dark_all' : 'rastertiles/voyager'
  return {
    version: 8,
    sources: {
      base: {
        type: 'raster',
        tiles: CARTO_SUBS.map(s => `https://${s}.basemaps.cartocdn.com/${set}/{z}/{x}/{y}@2x.png`),
        tileSize: 256,
        maxzoom: 20,
        attribution: '© OpenStreetMap · © CARTO',
      },
    },
    layers: [
      { id: 'bg',   type: 'background', paint: { 'background-color': dark ? '#0b0c0e' : '#eae7e2' } },
      { id: 'base', type: 'raster', source: 'base' },
    ],
  }
}

/**
 * Absolutise every URL a style points at, against the URL it was fetched from.
 *
 * This is the whole reason the map stayed empty. When MapLibre loads a style
 * from a URL it resolves the style's relative references against that URL. Hand
 * it an already-parsed OBJECT and it has no base, so it resolves them against
 * the PAGE origin instead — a relative source URL becomes a path on our own
 * domain, where the service worker answers with index.html. MapLibre then gets
 * HTML where it expected TileJSON, builds no tile source, and requests nothing:
 * no tiles and, tellingly, no error either. Exactly what the device reported.
 */
function absolutiseStyle(style, baseUrl) {
  const abs = (u) => {
    if (typeof u !== 'string') return u
    // new URL() percent-encodes the {fontstack}/{range}/{z}/{x}/{y} placeholders,
    // and MapLibre then rejects the style as invalid — which creates no sources,
    // so no tiles are ever requested AND no network error is raised. Restore them.
    return new URL(u, baseUrl).href.replace(/%7B/gi, '{').replace(/%7D/gi, '}')
  }
  const out = { ...style }
  if (out.glyphs) out.glyphs = abs(out.glyphs)
  if (out.sprite) {
    out.sprite = Array.isArray(out.sprite)
      ? out.sprite.map(sp => ({ ...sp, url: abs(sp.url) }))
      : abs(out.sprite)
  }
  out.sources = Object.fromEntries(Object.entries(style.sources || {}).map(([k, src]) => {
    const n = { ...src }
    if (n.url)   n.url   = abs(n.url)
    if (n.tiles) n.tiles = n.tiles.map(abs)
    return [k, n]
  }))
  return out
}

// Cache the resolved vector style per theme. (This used to be a single promise
// that ignored `dark`, so a style resolved for one theme was handed to the other.)
const vectorStyleCache = { true: null, false: null }

/**
 * Resolve the vector style for a theme, or null if it isn't usable.
 *
 * Light mode returns the style URL itself — letting MapLibre fetch it means it
 * resolves the style's own relative URLs correctly, which is the safest path.
 * Dark mode has to merge our AMOLED layers in, so it must build an object; that
 * object is absolutised first.
 *
 * Returning null rather than throwing lets the caller simply keep the raster
 * basemap it booted with, so the map is never left without a style.
 */
async function resolveVectorStyle(dark) {
  const key = String(!!dark)
  if (vectorStyleCache[key]) return vectorStyleCache[key]
  vectorStyleCache[key] = (async () => {
    // Light: hand back the URL so MapLibre does its own base-relative resolution.
    if (!dark) {
      const probe = await fetch(LIGHT_STYLE, { method: 'GET' })
      if (!probe.ok) throw new Error(`style HTTP ${probe.status}`)
      await probe.json()                       // must be parseable, not an HTML fallback
      return LIGHT_STYLE
    }

    const [base, mine] = await Promise.all([
      fetch(LIGHT_STYLE).then(r => { if (!r.ok) throw new Error(`style HTTP ${r.status}`); return r.json() }),
      fetch(DARK_LAYERS).then(r => r.json()),
    ])
    const vectorKey = Object.keys(base.sources || {}).find(k => base.sources[k].type === 'vector')
    if (!vectorKey) throw new Error('no vector source in base style')
    return absolutiseStyle({
      ...mine,
      sources: base.sources,
      glyphs:  base.glyphs ?? mine.glyphs,
      sprite:  base.sprite,
      layers:  mine.layers.map(l => (l.source ? { ...l, source: vectorKey } : l)),
    }, LIGHT_STYLE)
  })().catch(err => {
    vectorStyleCache[key] = null
    console.warn('[map] vector style unavailable, staying on raster basemap:', err?.message || err)
    return null
  })
  return vectorStyleCache[key]
}

const REDUCED = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

// v6 dropped WebGL1 and requires WebGL2. It's near-universal (iOS 15+, Android
// Chrome for years), but on a device without it the map would just render a
// silent black rectangle — so detect it once and show the reason instead.
const HAS_WEBGL2 = (() => {
  if (typeof document === 'undefined') return true
  try { return !!document.createElement('canvas').getContext('webgl2') } catch { return false }
})()

const DEPART_HTML = `
  <div style="position:relative;width:20px;height:20px;">
    <div class="map-ping"  style="position:absolute;inset:-2px;border-radius:50%;background:#FF5A1F;"></div>
    <div class="map-ping2" style="position:absolute;inset:-2px;border-radius:50%;background:#FF5A1F;"></div>
    <div style="position:absolute;inset:0;border-radius:50%;background:radial-gradient(circle at 36% 32%,#ff8c55 0%,#FF5A1F 48%,#cc3800 100%);border:2px solid rgba(255,255,255,.88);box-shadow:0 0 20px rgba(255,90,31,.9),0 0 8px rgba(255,90,31,.5),0 3px 10px rgba(0,0,0,.7);"></div>
  </div>`

const ARRIVE_HTML = `
  <div style="position:relative;width:24px;height:32px;">
    <svg width="24" height="32" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;filter:drop-shadow(0 0 8px rgba(255,90,31,.6)) drop-shadow(0 4px 10px rgba(0,0,0,.75))">
      <path d="M12 1C5.925 1 1 5.925 1 12c0 8.25 11 19.5 11 19.5S23 20.25 23 12C23 5.925 18.075 1 12 1z" fill="#0D0D0D" stroke="rgba(255,255,255,0.16)" stroke-width="1.5"/>
      <circle cx="12" cy="12" r="5.5" fill="#FF5A1F"/>
      <circle cx="12" cy="12" r="2.5" fill="white" opacity="0.92"/>
    </svg>
  </div>`

const GPS_HTML = `<div class="gps-user-dot" style="width:12px;height:12px;border-radius:50%;background:var(--info);border:2px solid #fff"></div>`

/**
 * Wipe the installed app and reload from the network.
 *
 * A PWA caches itself, which means a bad service worker or a poisoned cache
 * entry survives every reload the user can perform by hand — the app keeps
 * serving itself the broken version. Uninstalling and reinstalling the PWA is
 * the only other way out, and nobody should have to know that. This button is
 * the way out.
 */
async function hardReset() {
  try {
    const regs = await navigator.serviceWorker?.getRegistrations?.() ?? []
    await Promise.all(regs.map(r => r.unregister()))
  } catch {}
  try {
    const keys = await caches.keys()
    await Promise.all(keys.map(k => caches.delete(k)))
  } catch {}
  location.reload()
}

function el(html) {
  const d = document.createElement('div')
  d.innerHTML = html.trim()
  return d.firstChild
}

function whenReady(map, cb) {
  if (map.isStyleLoaded()) cb()
  else map.once('idle', cb)
}

function firstSymbolId(map) {
  const layers = map.getStyle()?.layers || []
  for (const l of layers) if (l.type === 'symbol') return l.id
  return undefined
}

const ROUTE_LAYERS = ['route-glow2', 'route-glow', 'route-core', 'route-dash']

export default function MapLibreMap({ route, depart, arrive, onMapReady, isDark = true, frozen = false }) {
  const containerRef  = useRef(null)
  const mapRef        = useRef(null)
  const coordsRef     = useRef(null)          // current route coords [[lng,lat],...]
  const departMkRef   = useRef(null)
  const arriveMkRef   = useRef(null)
  const userMkRef     = useRef(null)
  const didFlyRef     = useRef(false)
  const usingVectorRef  = useRef(false)         // vector style successfully applied
  const tileOkRef       = useRef(false)         // at least one basemap tile painted
  const errsRef         = useRef([])            // recent map errors, for the panel
  // Request accounting. MapLibre calls transformRequest for every URL it
  // decides to fetch, before any network work — so `asked` counts what MapLibre
  // WANTED and `got` counts what actually came back. The gap between the two is
  // the whole diagnosis: asked=0 means the map never even tried (style or
  // render-loop problem), asked>0 with got=0 means the requests went out and
  // nothing returned (network, CSP or service-worker problem).
  const askedRef        = useRef(0)
  const gotRef          = useRef(0)
  const framesRef       = useRef(0)
  const upgradedRef     = useRef(false)
  // Shown only when the basemap never appears — turns a silent black rectangle
  // into something a user can screenshot and send.
  const [diag, setDiag] = useState(null)
  const isDarkRef     = useRef(isDark)          // for camera pitch inside []-dep effects
  isDarkRef.current   = isDark

  // Add / refresh the route layers (below the first label so street names stay legible)
  const syncRoute = useCallback(() => {
    const map = mapRef.current
    if (!map) return
    ROUTE_LAYERS.forEach(id => { if (map.getLayer(id)) map.removeLayer(id) })
    if (map.getSource('route')) map.removeSource('route')

    const coords = coordsRef.current
    if (!coords || coords.length < 2) return

    map.addSource('route', {
      type: 'geojson',
      data: { type: 'Feature', geometry: { type: 'LineString', coordinates: coords } },
    })
    const before = firstSymbolId(map)
    // The two glow layers use v6's `line-layer-opacity`, not `line-opacity`.
    // `line-opacity` blends per segment, so wherever the route bends back on
    // itself the translucent halo stacks with itself into bright blotches.
    // `line-layer-opacity` draws the line opaque into an offscreen texture and
    // composites the layer as a whole — no self-blending. It costs one extra
    // render pass each, which is why the near-opaque core below keeps the
    // cheaper per-segment path.
    map.addLayer({ id: 'route-glow2', type: 'line', source: 'route',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': '#FF5A1F', 'line-width': 24, 'line-layer-opacity': 0.11, 'line-blur': 8 } }, before)
    map.addLayer({ id: 'route-glow', type: 'line', source: 'route',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': '#FF5A1F', 'line-width': 14, 'line-layer-opacity': 0.22, 'line-blur': 3 } }, before)
    map.addLayer({ id: 'route-core', type: 'line', source: 'route',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': '#FF5A1F', 'line-width': 4.5, 'line-opacity': 0.95 } }, before)
    map.addLayer({ id: 'route-dash', type: 'line', source: 'route',
      layout: { 'line-cap': 'round' },
      paint: { 'line-color': 'rgba(255,228,196,0.8)', 'line-width': 2, 'line-dasharray': [2, 4] } }, before)
  }, [])

  // Init map once
  useEffect(() => {
    if (mapRef.current || !containerRef.current || !HAS_WEBGL2) return
    const map = new maplibregl.Map({
      container: containerRef.current,
      // Boot on the raster basemap. It is a plain inline object, so the map
      // ALWAYS gets a valid style and `load` always fires — no remote fetch
      // stands between the user and a visible map. Vector is layered on after.
      style: rasterFallbackStyle(isDark),
      center: PARIS,
      zoom: 12,
      attributionControl: false,
      dragRotate: false,
      pitchWithRotate: false,
      maxZoom: 19,
      transformRequest: (url, resourceType) => {
        if (resourceType === 'Tile') askedRef.current++
        return { url }
      },
    })
    mapRef.current = map

    // MapLibre measures the container at construction; in an absolutely-
    // positioned flex/PWA shell that size can be wrong until layout settles,
    // leaving the canvas rendering only a thin strip. Force resize() the way
    // Leaflet's invalidateSize did — on load, next frame, and after a beat.
    // MapLibre measures its container once, at construction. If that
    // measurement is wrong — a not-yet-settled 100dvh, the splash overlay, a
    // mid-layout frame — the canvas keeps a tiny backing store which CSS then
    // stretches over the full container, rendering the map as a smooth blurred
    // gradient. A ResizeObserver does NOT rescue this: the container never
    // changed size, only MapLibre's idea of it was wrong. So instead of firing
    // resize() at a few hopeful moments, verify the canvas actually matches the
    // container and correct it until it does.
    const sizeMatches = () => {
      const el = containerRef.current
      const cv = map.getCanvas?.()
      if (!el || !cv) return true
      const w = el.clientWidth, h = el.clientHeight
      if (!w || !h) return true                       // not laid out yet
      const cw = parseFloat(cv.style.width)  || cv.clientWidth
      const ch = parseFloat(cv.style.height) || cv.clientHeight
      return Math.abs(cw - w) <= 1 && Math.abs(ch - h) <= 1
    }
    const bump = () => { try { map.resize() } catch {} }
    const ensureSize = () => { if (!sizeMatches()) bump() }
    // Progressive upgrade to the vector style — but NOT before the raster
    // basemap has actually painted. setStyle() tears down the current sources
    // and cancels their in-flight tile requests, so upgrading eagerly could
    // cancel a raster map that was about to appear and replace it with a vector
    // style that then fails quietly, leaving nothing on screen and no error to
    // explain it. Waiting for proof that the basemap works means the upgrade
    // can only ever trade one working map for another.
    const upgradeToVector = () => {
      if (upgradedRef.current || mapRef.current !== map) return
      upgradedRef.current = true
      resolveVectorStyle(isDark).then(style => {
        if (!style || mapRef.current !== map) return
        usingVectorRef.current = true
        map.setStyle(style)
        map.once('idle', () => syncRoute())
      })
    }

    map.on('load', () => { onMapReady?.(map); syncRoute(); bump() })
    // A failing style or tile endpoint is otherwise completely silent — the
    // map just stays black. Surface it so it's diagnosable on a real device.
    map.on('error', (e) => {
      const msg = e?.error?.message || String(e?.error || e)
      console.warn('[map]', msg)
      if (errsRef.current.length < 4 && !errsRef.current.includes(msg)) errsRef.current.push(msg)
    })
    map.on('render', () => { framesRef.current++ })
    map.on('data', (ev) => {
      if (ev.dataType !== 'source' || ev.sourceId === 'route' || !ev.tile) return
      gotRef.current++
      if (!tileOkRef.current) {
        tileOkRef.current = true
        // The basemap is alive. Only now is it safe to try the vector upgrade.
        upgradeToVector()
      }
    })

    // If no basemap tile has painted after 8s, surface why instead of a void.
    const diagTimer = setTimeout(() => {
      if (mapRef.current !== map) return
      const fits = sizeMatches()
      if (tileOkRef.current && fits) return          // map is fine
      const el = containerRef.current, cv = map.getCanvas?.()
      setDiag({
        webgl2: HAS_WEBGL2,
        vector: usingVectorRef.current,
        asked:  askedRef.current,
        got:    gotRef.current,
        frames: framesRef.current,
        canvas: cv ? `${cv.style.width || cv.clientWidth}x${cv.style.height || cv.clientHeight}` : 'absent',
        box:    el ? `${el.clientWidth}x${el.clientHeight}` : 'absent',
        errs: errsRef.current.slice(0, 3),
      })
    }, 8000)


    // Fallback: if no raster tile has painted after 6s the raster basemap is
    // the thing that's broken, so try vector anyway rather than show nothing.
    const upgradeTimer = setTimeout(upgradeToVector, 6000)

    const raf = requestAnimationFrame(bump)
    const t0  = setTimeout(bump, 0)
    const t1  = setTimeout(bump, 300)
    // Poll briefly — covers the case where the container was always correct and
    // only MapLibre's measurement was stale, which no event would report.
    const sizePoll = setInterval(ensureSize, 400)
    const stopPoll = setTimeout(() => clearInterval(sizePoll), 10000)

    const observer = new ResizeObserver(bump)
    observer.observe(containerRef.current)
    window.addEventListener('resize', ensureSize)
    window.addEventListener('orientationchange', ensureSize)
    document.addEventListener('visibilitychange', ensureSize)

    return () => {
      cancelAnimationFrame(raf); clearTimeout(t0); clearTimeout(t1); clearTimeout(diagTimer)
      clearInterval(sizePoll); clearTimeout(stopPoll); clearTimeout(upgradeTimer)
      window.removeEventListener('resize', ensureSize)
      window.removeEventListener('orientationchange', ensureSize)
      document.removeEventListener('visibilitychange', ensureSize)
      observer.disconnect()
      map.remove()
      mapRef.current = null
    }
  }, []) // eslint-disable-line

  // Theme switch — replace the whole style, then re-add the route layers
  const firstStyle = useRef(true)
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    if (firstStyle.current) { firstStyle.current = false; return }  // initial style set in init

    // Light (Positron) has no extrusions — flatten if we were tilted.
    if (!isDark && map.getPitch() > 0) map.easeTo({ pitch: 0, duration: 300 })

    const apply = (style) => {
      if (mapRef.current !== map) return
      map.setStyle(style)
      map.once('idle', () => syncRoute())
    }
    // Repaint immediately with the raster basemap for the new theme, then
    // upgrade to vector again if it's available — never leaves a blank map.
    apply(rasterFallbackStyle(isDark))
    resolveVectorStyle(isDark).then(style => { if (style) apply(style) })
  }, [isDark, syncRoute])

  // Live GPS user dot + cinematic fly-in on first fix
  useEffect(() => {
    if (!navigator.geolocation) return
    const id = navigator.geolocation.watchPosition(
      ({ coords }) => {
        const map = mapRef.current
        if (!map) return
        const pos = [coords.longitude, coords.latitude]
        if (userMkRef.current) {
          userMkRef.current.setLngLat(pos)
        } else {
          userMkRef.current = new maplibregl.Marker({ element: el(GPS_HTML) }).setLngLat(pos).addTo(map)
        }
        if (!didFlyRef.current && !depart && !route?.geometry) {
          didFlyRef.current = true
          // Tilt into 3D only in dark mode at this close zoom — the "here you
          // are, in the city" moment. Extruded buildings live in the dark style.
          const pitch = isDarkRef.current ? 55 : 0
          if (REDUCED()) map.jumpTo({ center: pos, zoom: 15.5, pitch })
          else           map.flyTo({ center: pos, zoom: 15.5, pitch, duration: 2600, essential: true })
        }
      },
      () => {},
      { enableHighAccuracy: false, maximumAge: 30000, timeout: 20000 },
    )
    return () => {
      navigator.geolocation.clearWatch(id)
      if (userMkRef.current) { try { userMkRef.current.remove() } catch {} userMkRef.current = null }
    }
  }, [])

  // Route → update layers + fit camera
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    coordsRef.current = route?.geometry?.coordinates ?? null
    whenReady(map, syncRoute)

    const coords = coordsRef.current
    if (!coords || !coords.length) return
    const b = coords.reduce((acc, c) => acc.extend(c), new maplibregl.LngLatBounds(coords[0], coords[0]))
    const pad = { top: 64, bottom: 148, left: 52, right: 52 }
    // Route overview is always flat — the whole trajet must read clearly.
    if (depart) {
      map.jumpTo({ center: [depart.lng, depart.lat], zoom: 15, pitch: 0 })
      setTimeout(() => map.fitBounds(b, { padding: pad, pitch: 0, duration: REDUCED() ? 0 : 1600 }), 180)
    } else {
      map.fitBounds(b, { padding: pad, pitch: 0, duration: 0 })
    }
  }, [route, depart, syncRoute])

  // Markers A & B
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    if (departMkRef.current) { departMkRef.current.remove(); departMkRef.current = null }
    if (arriveMkRef.current) { arriveMkRef.current.remove(); arriveMkRef.current = null }
    if (depart) departMkRef.current = new maplibregl.Marker({ element: el(DEPART_HTML) }).setLngLat([depart.lng, depart.lat]).addTo(map)
    if (arrive) arriveMkRef.current = new maplibregl.Marker({ element: el(ARRIVE_HTML), anchor: 'bottom' }).setLngLat([arrive.lng, arrive.lat]).addTo(map)

    if (!route?.geometry) {
      if (depart && arrive) {
        const b = new maplibregl.LngLatBounds([depart.lng, depart.lat], [depart.lng, depart.lat]).extend([arrive.lng, arrive.lat])
        map.fitBounds(b, { padding: 80, duration: REDUCED() ? 0 : 900 })
      } else if (depart) {
        map.flyTo({ center: [depart.lng, depart.lat], zoom: 14, pitch: 0, duration: REDUCED() ? 0 : 800 })
      }
    }
  }, [depart, arrive]) // eslint-disable-line

  return (
    <div className="absolute inset-0 z-0" style={{ pointerEvents: frozen ? 'none' : 'auto' }}>
      {/* Inline position — maplibre-gl.css's `.maplibregl-map{position:relative}`
          loads after Tailwind and overrides `.absolute`, collapsing the height
          to 0 (the "thin strip" bug). Inline style beats any stylesheet class. */}
      <div
        ref={containerRef}
        style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
        aria-label="Carte de Paris"
      />

      {diag && (
        <div
          className="absolute inset-x-3 top-24 rounded-2xl px-4 py-3"
          style={{ zIndex: 503, background: 'rgba(10,10,12,.94)', border: '1px solid rgba(255,90,31,.35)',
                   font: '11.5px/1.5 ui-monospace,monospace', color: 'rgba(245,241,232,.82)' }}
          role="status"
        >
          <div style={{ fontWeight: 700, color: 'var(--accent)', marginBottom: 4, fontFamily: 'inherit' }}>
            Carte indisponible — diagnostic
          </div>
          <div>WebGL2 : {diag.webgl2 ? 'oui' : 'NON'} · vecteur : {diag.vector ? 'oui' : 'non'} · images rendues : {diag.frames}</div>
          <div>tuiles demandées : {diag.asked} · reçues : {diag.got}</div>
          <div>canvas : {diag.canvas} · conteneur : {diag.box}</div>
          {diag.errs.length
            ? diag.errs.map((e, i) => <div key={i} style={{ marginTop: 3, opacity: .75, wordBreak: 'break-all' }}>• {e}</div>)
            : <div style={{ marginTop: 3, opacity: .75 }}>• aucune erreur remontée</div>}
          <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
            <button
              onClick={hardReset}
              style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', background: 'none', border: 'none', padding: 0 }}
            >Réinitialiser</button>
            <button
              onClick={() => setDiag(null)}
              style={{ fontSize: 11, fontWeight: 700, color: 'rgba(245,241,232,.5)', background: 'none', border: 'none', padding: 0 }}
            >Masquer</button>
          </div>
        </div>
      )}

      {!HAS_WEBGL2 && (
        <div
          className="absolute inset-0 flex items-center justify-center px-8 text-center"
          style={{ background: '#0b0c0e', zIndex: 502 }}
          role="status"
        >
          <p style={{ fontSize: 13, lineHeight: 1.6, color: 'rgba(245,241,232,.5)' }}>
            La carte n'est pas disponible sur cet appareil.<br />
            Vous pouvez réserver normalement.
          </p>
        </div>
      )}

      {/* Cinematic compositing — pure presentation, never intercepts touch */}
      {isDark && (
        <>
          <div aria-hidden="true" className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(120% 76% at 50% 94%, rgba(255,122,46,0.10) 0%, rgba(255,122,46,0.03) 26%, transparent 48%)', mixBlendMode: 'soft-light', zIndex: 500 }} />
          <div aria-hidden="true" className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(150% 120% at 50% 44%, transparent 70%, rgba(4,4,4,0.10) 88%, rgba(4,4,4,0.26) 100%)', zIndex: 501 }} />
        </>
      )}
    </div>
  )
}
