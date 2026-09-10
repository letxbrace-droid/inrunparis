import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

delete L.Icon.Default.prototype._getIconUrl

const PARIS = [48.8566, 2.3522]

/**
 * Wipe the installed app and reload from the network.
 *
 * A PWA caches itself, which means a bad service worker or a poisoned cache
 * entry survives every reload the user can perform by hand — the app keeps
 * serving itself the broken version. Uninstalling and reinstalling the PWA is
 * the only other way out, and nobody should have to know that.
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

// ── Fond de carte ───────────────────────────────────────────────────────────
// CARTO stamped "API KEY REQUIRED" across its keyless basemaps, so the default
// here is OpenStreetMap's own raster tiles: no key, no signup, works today.
// They are a light-coloured map, so dark mode is produced by inverting them —
// invert() flips the luminance and hue-rotate(180deg) puts the hues back where
// they were. It is the classic dark-OSM grade: not as refined as a
// purpose-built dark basemap, but legible and honest.
//
// To get a real dark basemap back, paste a free Geoapify key below and the
// tile URLs switch automatically. Their free plan allows commercial use and
// their "dark-matter" / "positron" styles are the same designs this app used
// before. Two minutes at https://myprojects.geoapify.com — restrict the key to
// your domain in their dashboard. A web-map key is always visible in the
// bundle; every provider expects that and rate-limits by referring domain, not
// by secrecy.
const TILE_KEY = ''

function basemap(dark) {
  if (TILE_KEY) {
    return {
      url: `https://maps.geoapify.com/v1/tile/${dark ? 'dark-matter' : 'positron'}/{z}/{x}/{y}.png?apiKey=${TILE_KEY}`,
      options: { maxZoom: 20, crossOrigin: true },
      // Purpose-built dark tiles only need lifting, never inverting.
      filter: dark ? 'brightness(1.42) contrast(.95) saturate(.85)'
                   : 'saturate(.8) contrast(1.03)',
      attribution: '\u00a9 Geoapify \u00b7 \u00a9 OpenStreetMap',
    }
  }
  return {
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    options: { maxZoom: 19, crossOrigin: true },
    filter: dark ? 'invert(1) hue-rotate(180deg) brightness(.92) contrast(.9) saturate(.55)'
                 : 'saturate(.82) contrast(1.03)',
    attribution: '\u00a9 OpenStreetMap',
  }
}

const userPosIcon = L.divIcon({
  html: `<div class="gps-user-dot" style="width:12px;height:12px;border-radius:50%;background:var(--info);border:2px solid #fff"></div>`,
  iconSize: [12, 12], iconAnchor: [6, 6], className: '',
})

const departIcon = L.divIcon({
  html: `
    <div style="position:relative;width:20px;height:20px;">
      <div class="map-ping"  style="position:absolute;inset:-2px;border-radius:50%;background:#FF5A1F;"></div>
      <div class="map-ping2" style="position:absolute;inset:-2px;border-radius:50%;background:#FF5A1F;"></div>
      <div style="position:absolute;inset:0;border-radius:50%;background:radial-gradient(circle at 36% 32%,#ff8c55 0%,#FF5A1F 48%,#cc3800 100%);border:2px solid rgba(255,255,255,.88);box-shadow:0 0 20px rgba(255,90,31,.9),0 0 8px rgba(255,90,31,.5),0 3px 10px rgba(0,0,0,.7);"></div>
    </div>`,
  iconSize: [20, 20], iconAnchor: [10, 10], className: '',
})

const arriveIcon = L.divIcon({
  html: `
    <div style="position:relative;width:24px;height:32px;">
      <svg width="24" height="32" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;filter:drop-shadow(0 0 8px rgba(255,90,31,.6)) drop-shadow(0 4px 10px rgba(0,0,0,.75))">
        <path d="M12 1C5.925 1 1 5.925 1 12c0 8.25 11 19.5 11 19.5S23 20.25 23 12C23 5.925 18.075 1 12 1z" fill="#0D0D0D" stroke="rgba(255,255,255,0.16)" stroke-width="1.5"/>
        <circle cx="12" cy="12" r="5.5" fill="#FF5A1F"/>
        <circle cx="12" cy="12" r="2.5" fill="white" opacity="0.92"/>
      </svg>
    </div>`,
  iconSize: [24, 32], iconAnchor: [12, 32], className: '',
})

export default function LeafletMap({ route, depart, arrive, onMapReady, isDark = true, frozen = false }) {
  const containerRef  = useRef(null)
  const mapRef        = useRef(null)
  const tileBaseRef   = useRef(null)
  const routeRef      = useRef([])
  const markersRef    = useRef([])
  const userMarkerRef = useRef(null)
  const didFlyRef     = useRef(false)
  // Tile accounting. `asked` is what Leaflet decided to fetch, `got` is what
  // arrived. The gap is the whole diagnosis: asked 0 means the map never tried,
  // asked N with got 0 means the requests left and nothing came back.
  const askedRef      = useRef(0)
  const gotRef        = useRef(0)
  const errsRef       = useRef([])
  const [diag, setDiag] = useState(null)

  // Initialize map — creates custom pane for base tiles so the aesthetic filter
  // applies only to terrain, leaving label tiles unfiltered and crisp
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return
    const map = L.map(containerRef.current, {
      center: PARIS, zoom: 12, zoomControl: false, attributionControl: true,
    })
    // OpenStreetMap's licence requires visible credit. Keep it discreet, but
    // keep it: the previous build hid it, which was not ours to do.
    map.attributionControl.setPrefix('')
    const attrEl = map.attributionControl.getContainer()
    if (attrEl) Object.assign(attrEl.style, {
      background: 'transparent', padding: '0 6px 2px 0',
      font: '9.5px/1.4 system-ui, sans-serif', color: 'rgba(150,150,158,.9)',
      // The credit sits directly on map tiles that can be light or dark, so it
      // carries its own contrast rather than relying on whatever is behind it.
      textShadow: '0 1px 2px rgba(0,0,0,.45), 0 0 3px rgba(255,255,255,.25)',
      // Lift it clear of the search pill that owns the bottom of the screen —
      // credit pinned underneath the UI is credit nobody can read.
      marginBottom: 'calc(env(safe-area-inset-bottom, 0px) + 100px)',
    })
    mapRef.current = map
    onMapReady?.(map)

    // baseTilesPane sits under the default tilePane (z-index 200) so labels
    // rendered at 200 are always above the filtered terrain
    map.createPane('baseTilesPane')
    map.getPane('baseTilesPane').style.zIndex = 199
    map.getPane('baseTilesPane').style.pointerEvents = 'none'

    setTimeout(() => map.invalidateSize({ animate: false }), 0)

    const observer = new ResizeObserver(() => {
      mapRef.current?.invalidateSize({ animate: false })
    })
    observer.observe(containerRef.current)

    // Leaflet measures its container once, at construction. In an absolutely
    // positioned PWA shell that measurement can be taken mid-layout — and the
    // container never changes size afterwards, so no ResizeObserver fires to
    // correct it. Poll briefly instead of hoping.
    const sizePoll = setInterval(() => {
      const el = containerRef.current
      if (!el || !el.clientWidth || !el.clientHeight) return
      const s = map.getSize()
      if (Math.abs(s.x - el.clientWidth) > 1 || Math.abs(s.y - el.clientHeight) > 1) {
        map.invalidateSize({ animate: false })
      }
    }, 400)
    const stopPoll = setTimeout(() => clearInterval(sizePoll), 10000)

    // If no tile has painted after 8s, say why instead of showing a void the
    // user can only screenshot and wonder about.
    const diagTimer = setTimeout(() => {
      if (mapRef.current !== map || gotRef.current > 0) return
      const el = containerRef.current
      const s = map.getSize()
      setDiag({
        asked: askedRef.current,
        got:   gotRef.current,
        size:  `${s.x}x${s.y}`,
        box:   el ? `${el.clientWidth}x${el.clientHeight}` : 'absent',
        errs:  errsRef.current.slice(0, 3),
      })
    }, 8000)

    return () => {
      observer.disconnect()
      clearInterval(sizePoll); clearTimeout(stopPoll); clearTimeout(diagTimer)
      map.remove()
      mapRef.current = null
    }
  }, []) // eslint-disable-line

  // Swap the basemap on isDark change. There is one tile layer now: the
  // nolabels / only-labels pair this used to stack was a CARTO-only luxury,
  // and no keyless provider serves it. Labels are baked into the tiles, so the
  // grade has to stay gentle enough to keep street names readable.
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    if (tileBaseRef.current) { try { map.removeLayer(tileBaseRef.current) } catch {} }

    const bm = basemap(isDark)
    const pane = map.getPane('baseTilesPane')
    if (pane) pane.style.filter = bm.filter

    tileBaseRef.current = L.tileLayer(bm.url, {
      ...bm.options,
      pane: 'baseTilesPane',
      attribution: bm.attribution,
    })
      .on('tileloadstart', () => { askedRef.current++ })
      .on('tileload',      () => { gotRef.current++; setDiag(null) })
      .on('tileerror',     (ev) => {
        const url = ev?.tile?.src || '(url inconnue)'
        console.warn('[map] tuile en \u00e9chec', url)
        if (errsRef.current.length < 4 && !errsRef.current.includes(url)) errsRef.current.push(url)
      })
      .addTo(map)
  }, [isDark])

  // Live GPS user position blue dot + animated zoom-in on first fix
  useEffect(() => {
    if (!navigator.geolocation) return
    const id = navigator.geolocation.watchPosition(
      ({ coords }) => {
        const m = mapRef.current
        if (!m) return
        const pos = [coords.latitude, coords.longitude]
        if (userMarkerRef.current) {
          userMarkerRef.current.setLatLng(pos)
        } else {
          userMarkerRef.current = L.marker(pos, { icon: userPosIcon, zIndexOffset: -100 }).addTo(m)
        }
        if (!didFlyRef.current && !depart && !route?.geometry) {
          didFlyRef.current = true
          const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
          if (reduced) m.setView(pos, 15.5, { animate: false })
          else         m.flyTo(pos, 15.5, { animate: true, duration: 2.6, easeLinearity: 0.1 })
        }
      },
      () => {},
      { enableHighAccuracy: false, maximumAge: 30000, timeout: 20000 },
    )
    return () => {
      navigator.geolocation.clearWatch(id)
      if (userMarkerRef.current && mapRef.current) {
        try { mapRef.current.removeLayer(userMarkerRef.current) } catch {}
        userMarkerRef.current = null
      }
    }
  }, [])

  // Draw triple-layer animated route
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    routeRef.current.forEach(l => { try { map.removeLayer(l) } catch {} })
    routeRef.current = []
    if (!route?.geometry) return
    const coords = route.geometry.coordinates.map(([lng, lat]) => [lat, lng])

    const outerGlow = L.polyline(coords, {
      color: 'color-mix(in srgb, var(--accent) 11%, transparent)', weight: 24, opacity: 1,
      lineCap: 'round', lineJoin: 'round',
    }).addTo(map)

    const glow = L.polyline(coords, {
      color: 'color-mix(in srgb, var(--accent) 22%, transparent)', weight: 14, opacity: 1,
      lineCap: 'round', lineJoin: 'round',
    }).addTo(map)

    const core = L.polyline(coords, {
      color: '#FF5A1F', weight: 5, opacity: 0.95,
      lineCap: 'round', lineJoin: 'round',
    }).addTo(map)

    const dash = L.polyline(coords, {
      color: 'rgba(255,228,196,0.80)', weight: 2,
      dashArray: '8 18', lineCap: 'round',
    }).addTo(map)

    // Staggered draw-in on all route layers + breathing pulse on outerGlow
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!reduced) {
      ;[
        [outerGlow.getElement(),   0],
        [glow.getElement(),       90],
        [core.getElement(),      180],
      ].forEach(([el, delay]) => {
        if (!el) return
        const len = el.getTotalLength?.() ?? 5000
        el.style.strokeDasharray  = len
        el.style.strokeDashoffset = len
        el.style.transition = `stroke-dashoffset 1.8s cubic-bezier(0.23,1,0.32,1) ${delay}ms`
        requestAnimationFrame(() => requestAnimationFrame(() => {
          el.style.strokeDashoffset = '0'
        }))
      })
      const outerEl = outerGlow.getElement()
      if (outerEl) outerEl.style.animation = 'route-glow 4s ease-in-out 2s infinite'

      const dashEl = dash.getElement()
      if (dashEl) dashEl.style.animation = 'route-dash 1.4s linear infinite'
    }

    routeRef.current = [outerGlow, glow, core, dash]
    if (coords.length) {
      const bounds = L.latLngBounds(coords)
      if (depart) {
        map.setView([depart.lat, depart.lng], 15, { animate: false })
        setTimeout(() => {
          map.flyToBounds(bounds, {
            paddingTopLeft: [52, 64],
            paddingBottomRight: [52, 148],
            animate: true, duration: 1.6, easeLinearity: 0.12,
          })
        }, 180)
      } else {
        map.fitBounds(bounds, { paddingTopLeft: [56, 64], paddingBottomRight: [56, 148] })
      }
    }
  }, [route]) // eslint-disable-line

  // Place / update markers A & B independently
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    markersRef.current.forEach(m => { try { map.removeLayer(m) } catch {} })
    markersRef.current = []
    if (depart) markersRef.current.push(L.marker([depart.lat, depart.lng], { icon: departIcon }).addTo(map))
    if (arrive) markersRef.current.push(L.marker([arrive.lat, arrive.lng], { icon: arriveIcon }).addTo(map))
    if (!route?.geometry) {
      if (depart && arrive) {
        map.fitBounds([[depart.lat, depart.lng], [arrive.lat, arrive.lng]], { padding: [80, 80], animate: true })
      } else if (depart) {
        map.flyTo([depart.lat, depart.lng], 14, { animate: true, duration: 0.8 })
      }
    }
  }, [depart, arrive]) // eslint-disable-line

  return (
    <div className="absolute inset-0 z-0" style={{ pointerEvents: frozen ? 'none' : 'auto' }}>
      <div ref={containerRef} className="absolute inset-0" aria-label="Carte de Paris" />

      {diag && (
        <div
          className="absolute inset-x-3 top-24 rounded-2xl px-4 py-3"
          style={{ zIndex: 503, background: 'rgba(10,10,12,.94)', border: '1px solid rgba(255,90,31,.35)',
                   font: '11.5px/1.5 ui-monospace,monospace', color: 'rgba(245,241,232,.82)' }}
          role="status"
        >
          <div style={{ fontWeight: 700, color: 'var(--accent)', marginBottom: 4 }}>
            Carte indisponible — diagnostic
          </div>
          <div>tuiles demandées : {diag.asked} · reçues : {diag.got}</div>
          <div>carte : {diag.size} · conteneur : {diag.box}</div>
          {diag.errs.length
            ? diag.errs.map((e, i) => <div key={i} style={{ marginTop: 3, opacity: .75, wordBreak: 'break-all' }}>• {e}</div>)
            : <div style={{ marginTop: 3, opacity: .75 }}>• aucune erreur remontée</div>}
          <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
            <button onClick={hardReset}
              style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', background: 'none', border: 'none', padding: 0 }}
            >Réinitialiser</button>
            <button onClick={() => setDiag(null)}
              style={{ fontSize: 11, fontWeight: 700, color: 'rgba(245,241,232,.5)', background: 'none', border: 'none', padding: 0 }}
            >Masquer</button>
          </div>
        </div>
      )}

      {/* ── Cinematic compositing — pure presentation, never intercepts touch ── */}
      {isDark && (
        <>
          {/* Brand warmth — faint orange lift from where the HomePill lives.
              soft-light keeps it a grade, never a wash that hides streets. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(120% 76% at 50% 94%, rgba(255,122,46,0.10) 0%, rgba(255,122,46,0.03) 26%, transparent 48%)',
              mixBlendMode: 'soft-light',
              zIndex: 500,
            }}
          />
          {/* Lens vignette — only the extreme corners settle, keeping the road
              network and every label in the usable area fully visible */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(150% 120% at 50% 44%, transparent 70%, rgba(4,4,4,0.10) 88%, rgba(4,4,4,0.26) 100%)',
              zIndex: 501,
            }}
          />
        </>
      )}
    </div>
  )
}
