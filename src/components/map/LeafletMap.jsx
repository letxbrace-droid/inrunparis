import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const TILES = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
const PARIS = [48.8566, 2.3522]

export default function LeafletMap({ route, depart, arrive, onMapReady }) {
  const containerRef = useRef(null)
  const mapRef       = useRef(null)
  const routeRef     = useRef(null)
  const markersRef   = useRef([])

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return

    const map = L.map(containerRef.current, {
      center:          PARIS,
      zoom:            12,
      zoomControl:     false,
      attributionControl: false,
    })

    L.tileLayer(TILES, {
      attribution: '',
      subdomains:  'abcd',
      maxZoom:     20,
    }).addTo(map)

    mapRef.current = map
    onMapReady?.(map)

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  // Draw route
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    routeRef.current?.forEach((l) => map.removeLayer(l))
    routeRef.current = []
    markersRef.current.forEach((m) => map.removeLayer(m))
    markersRef.current = []

    if (!route?.geometry) return

    const coords = route.geometry.coordinates.map(([lng, lat]) => [lat, lng])

    const glow1 = L.polyline(coords, { color: '#ff4103', weight: 18, opacity: 0.06 })
    const glow2 = L.polyline(coords, { color: '#ff4103', weight: 8,  opacity: 0.18 })
    const line  = L.polyline(coords, { color: '#ff4103', weight: 3,  opacity: 0.9 })

    glow1.addTo(map)
    glow2.addTo(map)
    line.addTo(map)
    routeRef.current = [glow1, glow2, line]

    if (depart) {
      const m = L.marker([depart.lat, depart.lng], {
        icon: L.divIcon({
          html: `<div style="width:10px;height:10px;border-radius:50%;background:#ff4103;box-shadow:0 0 14px rgba(255,65,3,.9),0 0 4px rgba(255,65,3,.5);border:2px solid rgba(255,255,255,.9)"></div>`,
          iconSize: [10, 10], iconAnchor: [5, 5], className: '',
        }),
      }).addTo(map)
      markersRef.current.push(m)
    }

    if (arrive) {
      const m = L.marker([arrive.lat, arrive.lng], {
        icon: L.divIcon({
          html: `<div style="width:10px;height:10px;border-radius:50%;background:#F5F1E8;box-shadow:0 0 10px rgba(245,241,232,.8);border:2px solid rgba(255,65,3,.7)"></div>`,
          iconSize: [10, 10], iconAnchor: [5, 5], className: '',
        }),
      }).addTo(map)
      markersRef.current.push(m)
    }

    const allCoords = [...coords]
    if (allCoords.length) map.fitBounds(L.latLngBounds(allCoords), { padding: [60, 60] })
  }, [route, depart, arrive])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-0"
      aria-label="Carte de Paris"
    />
  )
}
