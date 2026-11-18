import { useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, CircleMarker, useMap, Tooltip } from 'react-leaflet'
import { scoreColor, scoreLabel } from '../lib/score.js'

function FlyTo({ coordinates }) {
  const map = useMap()
  useEffect(() => {
    if (!coordinates) return
    map.flyTo(coordinates, Math.max(map.getZoom(), 15), { duration: 0.9 })
  }, [coordinates, map])
  return null
}

// 一个半透明大圆代表「烟雾扩散范围」，中心一颗实心小点便于精确点击。
function VenueBubble({ v, selected, onSelect }) {
  const color = scoreColor(v.smokeScore)
  const halo = 60 + v.smokeScore * 1.6 // 越烟越大
  return (
    <>
      <CircleMarker
        center={v.coordinates}
        radius={halo / 6}
        pathOptions={{
          color,
          weight: selected ? 2 : 0,
          fillColor: color,
          fillOpacity: 0.18,
        }}
        interactive={false}
      />
      <CircleMarker
        center={v.coordinates}
        radius={selected ? 11 : 7}
        pathOptions={{
          color: '#ffffff',
          weight: 2,
          fillColor: color,
          fillOpacity: 1,
        }}
        eventHandlers={{ click: () => onSelect(v.id) }}
      >
        <Tooltip direction="top" offset={[0, -8]} opacity={0.95}>
          <div className="text-xs">
            <div className="font-semibold">{v.name}</div>
            <div className="text-slate-500">
              {scoreLabel(v.smokeScore)} · {v.cuisine}
            </div>
          </div>
        </Tooltip>
      </CircleMarker>
    </>
  )
}

export default function SmokeMap({ venues, selectedId, onSelect }) {
  const selected = useMemo(
    () => venues.find((v) => v.id === selectedId),
    [venues, selectedId],
  )
  return (
    <MapContainer
      center={[31.2280, 121.4530]}
      zoom={13}
      scrollWheelZoom
      className="h-full w-full rounded-2xl overflow-hidden"
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {venues.map((v) => (
        <VenueBubble
          key={v.id}
          v={v}
          selected={v.id === selectedId}
          onSelect={onSelect}
        />
      ))}
      {selected && <FlyTo coordinates={selected.coordinates} />}
    </MapContainer>
  )
}
