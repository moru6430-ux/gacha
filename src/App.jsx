import { useMemo, useState } from 'react'
import MapView from './components/MapView.jsx'
import SearchBar from './components/SearchBar.jsx'
import DetailPanel from './components/DetailPanel.jsx'
import minerals from './data/minerals.json'

export default function App() {
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return minerals
    return minerals.filter((m) => {
      return (
        m.name.toLowerCase().includes(q) ||
        m.name_en?.toLowerCase().includes(q) ||
        m.region.toLowerCase().includes(q) ||
        m.region_en?.toLowerCase().includes(q) ||
        m.mineral_type?.toLowerCase().includes(q)
      )
    })
  }, [query])

  const selected = minerals.find((m) => m.id === selectedId) || null

  return (
    <div className="h-full w-full flex flex-col bg-ink-950 text-stone-200">
      <header className="px-6 py-4 border-b border-ink-700 flex items-center gap-6 bg-ink-900/80 backdrop-blur z-[1000]">
        <div className="flex flex-col">
          <h1 className="text-xl tracking-wide text-amber-glow font-serif">矿物神话地图</h1>
          <p className="text-xs text-stone-500 tracking-widest">Mineral Mythology Atlas</p>
        </div>
        <div className="flex-1 max-w-xl">
          <SearchBar
            value={query}
            onChange={setQuery}
            results={filtered}
            onSelect={(id) => setSelectedId(id)}
            visibleResults={query.trim().length > 0}
          />
        </div>
        <div className="text-xs text-stone-500 hidden sm:block">
          {filtered.length} / {minerals.length} 条记录
        </div>
      </header>

      <main className="flex-1 relative">
        <MapView
          entries={filtered}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
        <DetailPanel
          entry={selected}
          onClose={() => setSelectedId(null)}
        />
      </main>
    </div>
  )
}
