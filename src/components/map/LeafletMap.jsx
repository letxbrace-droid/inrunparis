import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

delete L.Icon.Default.prototype._getIconUrl

const PARIS = [48.8566, 2.3522]

// Split tile strategy: terrain filtered for aesthetics, labels unfiltered for legibility
const TILES = {
  darkBase:   'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png',
  darkLabels: 'https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png',
  lightBase:   'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png',
  lightLabels: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png',
}

const TILE_OPTS = { attribution: '', subdomains: 'abcd', maxZoom: 20 }

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
  const tileLabelRef  = useRef(null)
  const routeRef      = useRef([])
  const markersRef    = useRef([])
  const userMarkerRef = useRef(null)
  const didFlyRef     = useRef(false)

  // Initialize map — creates custom pane for base tiles so the aesthetic filter
  // applies only to terrain, leaving label tiles unfiltered and crisp
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return
    const map = L.map(containerRef.current, {
      center: PARIS, zoom: 12, zoomControl: false, attributionControl: false,
    })
    mapRef.current = map
    onMapReady?.(map)

    // baseTilesPane sits under the default tilePane (z-index 200) so labels
    // rendered at 200 are always above the filtered terrain
    map.createPane('baseTilesPane')
    map.getPane('baseTilesPane').style.zIndex = 199
    map.getPane('baseTilesPane').style.pointerEvents = 'none'

    // labelPane sits above polylines (overlayPane = 400) but below markers (600)
    // so street names are readable through the route overlay
    map.createPane('labelPane')
    map.getPane('labelPane').style.zIndex = 450
    map.getPane('labelPane').style.pointerEvents = 'none'

    setTimeout(() => map.invalidateSize({ animate: false }), 0)

    const observer = new ResizeObserver(() => {
      mapRef.current?.invalidateSize({ animate: false })
    })
    observer.observe(containerRef.current)

    return () => {
      observer.disconnect()
      map.remove()
      mapRef.current = null
    }
  }, []) // eslint-disable-line

  // Switch tile layers on isDark change — filter applied to baseTilesPane only
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    if (tileBaseRef.current)  { try { map.removeLayer(tileBaseRef.current)  } catch {} }
    if (tileLabelRef.current) { try { map.removeLayer(tileLabelRef.current) } catch {} }

    // Aesthetic filter stays on the terrain pane — labels are never filtered.
    // Because labels live on their own unfiltered pane, we can grade the terrain
    // far more aggressively (deep AMOLED blacks, punchy contrast) for a cinematic
    // look without ever hurting street-name / POI legibility.
    const basePaneEl = map.getPane('baseTilesPane')
    if (basePaneEl) {
      basePaneEl.style.filter = isDark
        ? 'brightness(0.82) contrast(1.28) saturate(0.6)'
        : 'saturate(0.74) brightness(0.98) contrast(1.06)'
    }

    tileBaseRef.current = L.tileLayer(
      isDark ? TILES.darkBase : TILES.lightBase,
      { ...TILE_OPTS, pane: 'baseTilesPane' },
    ).addTo(map)

    tileLabelRef.current = L.tileLayer(
      isDark ? TILES.darkLabels : TILES.lightLabels,
      { ...TILE_OPTS, pane: 'labelPane' },
    ).addTo(map)
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

      {/* ── Cinematic compositing — pure presentation, never intercepts touch ── */}
      {isDark && (
        <>
          {/* Brand warmth — orange glow rising from where the HomePill lives.
              soft-light keeps it as a grade, not a wash, so the route stays vivid. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(120% 78% at 50% 92%, rgba(255,116,40,0.13) 0%, rgba(255,116,40,0.04) 28%, transparent 50%)',
              mixBlendMode: 'soft-light',
              zIndex: 500,
            }}
          />
          {/* Cool counter-grade at the top edge for cinematic colour separation */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(120% 60% at 50% 0%, rgba(60,90,160,0.10) 0%, transparent 46%)',
              mixBlendMode: 'soft-light',
              zIndex: 500,
            }}
          />
          {/* Lens vignette — edges fall into black, centre pops, tile seams vanish */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(135% 108% at 50% 40%, transparent 48%, rgba(3,3,3,0.30) 78%, rgba(3,3,3,0.55) 100%)',
              zIndex: 501,
            }}
          />
        </>
      )}
    </div>
  )
}
