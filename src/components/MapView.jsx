import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'

const pulseIcon = L.divIcon({
  className: 'mineral-marker',
  html: '<div class="marker-pulse"></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
})

const selectedIcon = L.divIcon({
  className: 'mineral-marker-selected',
  html: '<div class="marker-pulse" style="background:#fff7d6;width:18px;height:18px;"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
})

function FlyTo({ coordinates }) {
  const map = useMap()
  useEffect(() => {
    if (!coordinates) return
    map.flyTo(coordinates, Math.max(map.getZoom(), 5), { duration: 1.2 })
  }, [coordinates, map])
  return null
}

export default function MapView({ entries, selectedId, onSelect }) {
  const selected = entries.find((e) => e.id === selectedId)

  return (
    <MapContainer
      center={[20, 30]}
      zoom={2}
      minZoom={2}
      maxZoom={8}
      worldCopyJump
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
      />
      {entries.map((entry) => (
        <Marker
          key={entry.id}
          position={entry.coordinates}
          icon={entry.id === selectedId ? selectedIcon : pulseIcon}
          eventHandlers={{
            click: () => onSelect(entry.id),
          }}
        />
      ))}
      {selected && <FlyTo coordinates={selected.coordinates} />}
    </MapContainer>
  )
}
