import { useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import { categoryColor } from '../data/categories.js'
import { CONTINENT_MAP } from '../data/continents.js'
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
    map.flyTo(coordinates, Math.max(map.getZoom(), 5), { duration: 1.2 })
  }, [coordinates, map])
  return null
}

// 切换视图层级时的过场。
// continent 模式优先用「实际矿物的外接框」(dynamicBounds)，
// 没有的话退回到 continents.js 里写死的 bounds——这样像大溪地这种
// 在 oceania 框外的远岛也能被纳入视野。
function ViewTransition({ viewMode, continentId, dynamicBounds }) {
  const map = useMap()
  useEffect(() => {
    if (viewMode === 'continent' && continentId) {
      const bounds =
        dynamicBounds || (CONTINENT_MAP[continentId] && CONTINENT_MAP[continentId].bounds)
      if (bounds) {
        map.flyToBounds(bounds, {
          duration: 1.6,
          easeLinearity: 0.25,
          padding: [40, 40],
        })
      }
    } else if (viewMode === 'world') {
      map.flyTo([20, 30], 2, { duration: 1.6, easeLinearity: 0.25 })
    }
  }, [viewMode, continentId, dynamicBounds, map])
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

  // 进入大洲后，按当前可见的矿物动态算外接框，这样像大溪地这种远岛也能
  // 入镜。Leaflet 不知道地球是圆的，所以横跨 180° 经线的大洋洲（澳洲
  // lng 130 + 大溪地 lng -149）要先把负经度 +360 偏移到 211，外接框才会
  // 收紧在太平洋这一段，而不是把整个地球都框进来。
  const dynamicBounds = useMemo(() => {
    if (viewMode !== 'continent' || !selectedContinent || entries.length === 0) {
      return null
    }
    const coords = entries.map((e) => e.coordinates)
    const lngs = coords.map(([, lng]) => lng)
    const span = Math.max(...lngs) - Math.min(...lngs)
    const shifted =
      span > 180
        ? coords.map(([lat, lng]) => [lat, lng < 0 ? lng + 360 : lng])
        : coords
    return L.latLngBounds(shifted).pad(0.25)
  }, [viewMode, selectedContinent, entries])

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

      {showContinents && (
        <ContinentLayer counts={continentCounts} onPick={onPickContinent} />
      )}

      {showMarkers &&
        entries.map((entry) => (
          <Marker
            key={entry.id}
            position={entry.coordinates}
            icon={icons(entry)}
            eventHandlers={{
              click: () => onSelect(entry.id),
            }}
          />
        ))}

      <ViewTransition
        viewMode={viewMode}
        continentId={selectedContinent}
        dynamicBounds={dynamicBounds}
      />
      {selected && <FlyTo coordinates={selected.coordinates} />}
    </MapContainer>
  )
}
