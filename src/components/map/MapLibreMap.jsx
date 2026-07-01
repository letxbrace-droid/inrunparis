import { useEffect, useRef, useCallback } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

// MapLibre uses [lng, lat]
const PARIS = [2.3522, 48.8566]

// Vector styles. Dark = custom AMOLED style (self-hosted JSON on OpenFreeMap
// tiles). Light = OpenFreeMap Positron. Both keyless, free, unlimited.
const DARK_STYLE  = '/inrunparis/mapstyle-dark.json'
const LIGHT_STYLE = 'https://tiles.openfreemap.org/styles/positron'

const REDUCED = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

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
    map.addLayer({ id: 'route-glow2', type: 'line', source: 'route',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': '#FF5A1F', 'line-width': 24, 'line-opacity': 0.11, 'line-blur': 8 } }, before)
    map.addLayer({ id: 'route-glow', type: 'line', source: 'route',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': '#FF5A1F', 'line-width': 14, 'line-opacity': 0.22, 'line-blur': 3 } }, before)
    map.addLayer({ id: 'route-core', type: 'line', source: 'route',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': '#FF5A1F', 'line-width': 4.5, 'line-opacity': 0.95 } }, before)
    map.addLayer({ id: 'route-dash', type: 'line', source: 'route',
      layout: { 'line-cap': 'round' },
      paint: { 'line-color': 'rgba(255,228,196,0.8)', 'line-width': 2, 'line-dasharray': [2, 4] } }, before)
  }, [])

  // Init map once
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: isDark ? DARK_STYLE : LIGHT_STYLE,
      center: PARIS,
      zoom: 12,
      attributionControl: false,
      dragRotate: false,
      pitchWithRotate: false,
      maxZoom: 19,
    })
    mapRef.current = map

    // MapLibre measures the container at construction; in an absolutely-
    // positioned flex/PWA shell that size can be wrong until layout settles,
    // leaving the canvas rendering only a thin strip. Force resize() the way
    // Leaflet's invalidateSize did — on load, next frame, and after a beat.
    const bump = () => { try { map.resize() } catch {} }
    map.on('load', () => { onMapReady?.(map); syncRoute(); bump() })

    const raf = requestAnimationFrame(bump)
    const t0  = setTimeout(bump, 0)
    const t1  = setTimeout(bump, 300)

    const observer = new ResizeObserver(bump)
    observer.observe(containerRef.current)

    return () => {
      cancelAnimationFrame(raf); clearTimeout(t0); clearTimeout(t1)
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
    map.setStyle(isDark ? DARK_STYLE : LIGHT_STYLE)
    map.once('idle', () => syncRoute())
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
          if (REDUCED()) map.jumpTo({ center: pos, zoom: 15.5 })
          else           map.flyTo({ center: pos, zoom: 15.5, duration: 2600, essential: true })
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
    if (depart) {
      map.jumpTo({ center: [depart.lng, depart.lat], zoom: 15 })
      setTimeout(() => map.fitBounds(b, { padding: pad, duration: REDUCED() ? 0 : 1600 }), 180)
    } else {
      map.fitBounds(b, { padding: pad, duration: 0 })
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
        map.flyTo({ center: [depart.lng, depart.lat], zoom: 14, duration: REDUCED() ? 0 : 800 })
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
