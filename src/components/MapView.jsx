import { useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import { categoryColor } from '../data/categories.js'

function hexToRgba(hex, alpha) {
  const m = hex.replace('#', '')
  const full = m.length === 3 ? m.split('').map((c) => c + c).join('') : m
  const n = parseInt(full, 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`
}

function buildIcon(color, selected, favorited) {
  const halo = hexToRgba(color, 0.55)
  const style = `--marker-color:${color};--marker-halo:${halo};`
  const classes = ['marker-pulse']
  if (selected) classes.push('is-selected')
  if (favorited) classes.push('is-favorited')
  const size = selected ? 18 : 14
  return L.divIcon({
    className: 'mineral-marker',
    html: `<div class="${classes.join(' ')}" style="${style}"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

function FlyTo({ coordinates }) {
  const map = useMap()
  useEffect(() => {
    if (!coordinates) return
    map.flyTo(coordinates, Math.max(map.getZoom(), 5), { duration: 1.2 })
  }, [coordinates, map])
  return null
}

export default function MapView({ entries, selectedId, onSelect, favoriteIds }) {
  const selected = entries.find((e) => e.id === selectedId)

  const icons = useMemo(() => {
    const cache = new Map()
    return (entry) => {
      const isSelected = entry.id === selectedId
      const isFavorited = favoriteIds?.has(entry.id) || false
      const key =
        (entry.category || 'other') +
        (isSelected ? ':sel' : '') +
        (isFavorited ? ':fav' : '')
      if (!cache.has(key)) {
        cache.set(
          key,
          buildIcon(categoryColor(entry.category), isSelected, isFavorited),
        )
      }
      return cache.get(key)
    }
  }, [selectedId, favoriteIds])

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
          icon={icons(entry)}
          eventHandlers={{
            click: () => onSelect(entry.id),
          }}
        />
      ))}
      {selected && <FlyTo coordinates={selected.coordinates} />}
    </MapContainer>
  )
}
