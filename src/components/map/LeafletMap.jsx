import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

delete L.Icon.Default.prototype._getIconUrl

const PARIS       = [48.8566, 2.3522]
const TILES_DARK  = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
const TILES_LIGHT = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'

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
  const tileRef       = useRef(null)
  const routeRef      = useRef([])
  const markersRef    = useRef([])
  const userMarkerRef = useRef(null)
  const didFlyRef     = useRef(false)

  // Initialize map — call invalidateSize after mount and on every resize
  // so the map always fills its container (fixes partial-render on Android Chrome)
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return
    const map = L.map(containerRef.current, {
      center: PARIS, zoom: 12, zoomControl: false, attributionControl: false,
    })
    mapRef.current = map
    onMapReady?.(map)

    // Let the browser finish layout, then fix tile grid
    setTimeout(() => map.invalidateSize({ animate: false }), 0)

    // Keep map sized correctly if the container ever resizes
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

  // Switch tile layer on isDark change (also runs on first mount)
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    if (tileRef.current) { try { map.removeLayer(tileRef.current) } catch {} }
    tileRef.current = L.tileLayer(isDark ? TILES_DARK : TILES_LIGHT, {
      attribution: '', subdomains: 'abcd', maxZoom: 20,
    }).addTo(map)
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
        // Cinematic fly-in to the user's position once, on app open
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

    // Wide diffuse halo — adds cinematic depth beneath the line
    const outerGlow = L.polyline(coords, {
      color: 'color-mix(in srgb, var(--accent) 11%, transparent)', weight: 24, opacity: 1,
      lineCap: 'round', lineJoin: 'round',
    }).addTo(map)

    // Soft halo underneath
    const glow = L.polyline(coords, {
      color: 'color-mix(in srgb, var(--accent) 22%, transparent)', weight: 14, opacity: 1,
      lineCap: 'round', lineJoin: 'round',
    }).addTo(map)

    // Core branded line
    const core = L.polyline(coords, {
      color: '#FF5A1F', weight: 5, opacity: 0.95,
      lineCap: 'round', lineJoin: 'round',
    }).addTo(map)

    // Traveling dashes (light cream passes filter in both themes)
    const dash = L.polyline(coords, {
      color: 'rgba(255,228,196,0.80)', weight: 2,
      dashArray: '8 18', lineCap: 'round',
    }).addTo(map)

    // Staggered draw-in on all route layers + pulse on outerGlow
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
      // Breathing glow pulse after draw-in settles
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
    <div
      ref={containerRef}
      className="absolute inset-0 z-0"
      aria-label="Carte de Paris"
      style={{
        pointerEvents: frozen ? 'none' : 'auto',
        filter: isDark
          ? 'brightness(1.72) contrast(0.88) saturate(0.75)'
          : 'saturate(0.92) brightness(0.97)',
      }}
    />
  )
}
