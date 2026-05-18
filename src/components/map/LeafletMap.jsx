import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

delete L.Icon.Default.prototype._getIconUrl

const TILES = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
const PARIS = [48.8566, 2.3522]

const userPosIcon = L.divIcon({
  html: `<div class="gps-user-dot" style="width:14px;height:14px;border-radius:50%;background:#3b82f6;border:2.5px solid white;box-shadow:0 0 12px rgba(59,130,246,.8)"></div>`,
  iconSize: [14, 14], iconAnchor: [7, 7], className: '',
})

const departIcon = L.divIcon({
  html: `<div style="width:12px;height:12px;border-radius:50%;background:#ff4103;box-shadow:0 0 18px rgba(255,65,3,.95),0 0 6px rgba(255,65,3,.6);border:2px solid rgba(255,255,255,.9)"></div>`,
  iconSize: [12, 12], iconAnchor: [6, 6], className: '',
})

const arriveIcon = L.divIcon({
  html: `<div style="width:12px;height:12px;border-radius:50%;background:#F5F1E8;box-shadow:0 0 14px rgba(245,241,232,.8);border:2.5px solid rgba(255,65,3,.85)"></div>`,
  iconSize: [12, 12], iconAnchor: [6, 6], className: '',
})

export default function LeafletMap({ route, depart, arrive, onMapReady }) {
  const containerRef  = useRef(null)
  const mapRef        = useRef(null)
  const routeRef      = useRef([])
  const markersRef    = useRef([])
  const userMarkerRef = useRef(null)
  const watchIdRef    = useRef(null)

  // Initialize map once
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return

    const map = L.map(containerRef.current, {
      center:             PARIS,
      zoom:               12,
      zoomControl:        false,
      attributionControl: false,
    })

    L.tileLayer(TILES, { attribution: '', subdomains: 'abcd', maxZoom: 20 }).addTo(map)

    mapRef.current = map
    onMapReady?.(map)

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  // Live user position blue dot
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
      },
      () => {},
      { enableHighAccuracy: false, maximumAge: 30000, timeout: 20000 },
    )
    watchIdRef.current = id
    return () => {
      navigator.geolocation.clearWatch(id)
      if (userMarkerRef.current && mapRef.current) {
        mapRef.current.removeLayer(userMarkerRef.current)
        userMarkerRef.current = null
      }
    }
  }, [])

  // Draw triple-layer luminous route
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    routeRef.current.forEach(l => map.removeLayer(l))
    routeRef.current = []

    if (!route?.geometry) return

    const coords = route.geometry.coordinates.map(([lng, lat]) => [lat, lng])

    const glow1 = L.polyline(coords, { color: '#ff4103', weight: 20, opacity: 0.06 })
    const glow2 = L.polyline(coords, { color: '#ff4103', weight: 8,  opacity: 0.20 })
    const core  = L.polyline(coords, { color: '#ff4103', weight: 3,  opacity: 0.92 })

    glow1.addTo(map)
    glow2.addTo(map)
    core.addTo(map)
    routeRef.current = [glow1, glow2, core]

    // Animate: start from depart zoom then fly to full route (Uber style)
    if (coords.length) {
      const bounds = L.latLngBounds(coords)
      if (depart) {
        map.setView([depart.lat, depart.lng], 15, { animate: false })
        setTimeout(() => {
          map.flyToBounds(bounds, { padding: [56, 56], animate: true, duration: 1.6, easeLinearity: 0.12 })
        }, 180)
      } else {
        map.fitBounds(bounds, { padding: [60, 60] })
      }
    }
  }, [route])

  // Place / update point A & B markers independently
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    markersRef.current.forEach(m => map.removeLayer(m))
    markersRef.current = []

    if (depart) {
      markersRef.current.push(L.marker([depart.lat, depart.lng], { icon: departIcon }).addTo(map))
    }
    if (arrive) {
      markersRef.current.push(L.marker([arrive.lat, arrive.lng], { icon: arriveIcon }).addTo(map))
    }

    // Move camera only when no route is drawn yet
    if (!route?.geometry) {
      if (depart && arrive) {
        map.fitBounds(
          [[depart.lat, depart.lng], [arrive.lat, arrive.lng]],
          { padding: [80, 80], animate: true },
        )
      } else if (depart) {
        map.flyTo([depart.lat, depart.lng], 14, { animate: true, duration: 0.8 })
      }
    }
  }, [depart, arrive])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-0"
      aria-label="Carte de Paris"
    />
  )
}
