import { useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import { categoryColor } from '../data/categories.js'
import { CONTINENT_MAP } from '../data/continents.js'
import { toAMapCoords, toAMapBounds } from '../lib/coords.js'
import ContinentLayer from './ContinentLayer.jsx'

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
    map.flyTo(toAMapCoords(coordinates), Math.max(map.getZoom(), 5), { duration: 1.2 })
  }, [coordinates, map])
  return null
}

function ViewTransition({ viewMode, continentId }) {
  const map = useMap()
  useEffect(() => {
    if (viewMode === 'continent' && continentId) {
      const c = CONTINENT_MAP[continentId]
      if (c) {
        map.flyToBounds(toAMapBounds(c.bounds), {
          duration: 1.6,
          easeLinearity: 0.25,
          padding: [40, 40],
        })
      }
    } else if (viewMode === 'world') {
      map.flyTo([20, 30], 2, { duration: 1.6, easeLinearity: 0.25 })
    }
  }, [viewMode, continentId, map])
  return null
}

export default function MapView({
  entries,
  selectedId,
  onSelect,
  favoriteIds,
  viewMode,
  selectedContinent,
  continentCounts,
  onPickContinent,
}) {
  const selected = entries.find((e) => e.id === selectedId)

  const icons = useMemo(() => {
    const cache = new Map()
    return (entry) => {
      const isSelected = entry.id === selectedId
      const isFavorited = favoriteIds?.has(entry.id) || false
      const color = entry.marker_color || categoryColor(entry.category)
      const key = color + (isSelected ? ':sel' : '') + (isFavorited ? ':fav' : '')
      if (!cache.has(key)) {
        cache.set(key, buildIcon(color, isSelected, isFavorited))
      }
      return cache.get(key)
    }
  }, [selectedId, favoriteIds])

  const showContinents = viewMode === 'world'
  const showMarkers = !showContinents

  return (
    <MapContainer
      center={[20, 30]}
      zoom={2}
      minZoom={2}
      maxZoom={8}
      worldCopyJump
      className="h-full w-full"
    >
      {/* 高德地图瓦片（国内合规底图）+ CSS 滤镜做暗色艺术化处理 */}
      <TileLayer
        attribution='&copy; <a href="https://amap.com/">高德 AMap</a>'
        url="https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}"
        subdomains="1234"
        className="amap-stylized"
      />

      {showContinents && (
        <ContinentLayer counts={continentCounts} onPick={onPickContinent} />
      )}

      {showMarkers &&
        entries.map((entry) => (
          <Marker
            key={entry.id}
            position={toAMapCoords(entry.coordinates)}
            icon={icons(entry)}
            eventHandlers={{
              click: () => onSelect(entry.id),
            }}
          />
        ))}

      <ViewTransition viewMode={viewMode} continentId={selectedContinent} />
      {selected && <FlyTo coordinates={selected.coordinates} />}
    </MapContainer>
  )
}
