import { useMemo } from 'react'
import { Marker } from 'react-leaflet'
import L from 'leaflet'
import { CONTINENTS } from '../data/continents.js'
import { toAMapCoords } from '../lib/coords.js'

function buildBadge(continent, count) {
  return L.divIcon({
    className: 'continent-badge-wrap',
    html: `
      <div class="continent-badge" style="--c:${continent.color}">
        <div class="continent-count">${count}</div>
        <div class="continent-label-zh">${continent.label_zh}</div>
        <div class="continent-label-en">${continent.label_en}</div>
      </div>
    `,
    iconSize: [140, 140],
    iconAnchor: [70, 70],
  })
}

export default function ContinentLayer({ counts, onPick }) {
  const icons = useMemo(() => {
    return CONTINENTS.map((c) => ({
      continent: c,
      count: counts[c.id] || 0,
      icon: buildBadge(c, counts[c.id] || 0),
    }))
  }, [counts])

  return (
    <>
      {icons.map(({ continent, icon }) => (
        <Marker
          key={continent.id}
          position={toAMapCoords(continent.center)}
          icon={icon}
          eventHandlers={{ click: () => onPick(continent.id) }}
        />
      ))}
    </>
  )
}
