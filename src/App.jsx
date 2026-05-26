import { lazy, Suspense, useMemo, useState } from 'react'
import MapView from './components/MapView.jsx'
import SearchBar from './components/SearchBar.jsx'
import DetailPanel from './components/DetailPanel.jsx'
import CategoryFilter from './components/CategoryFilter.jsx'
import UserMenu from './components/UserMenu.jsx'
import { useMinerals } from './hooks/useMinerals.js'
import { useFavorites } from './hooks/useFavorites.jsx'
import { useAuth } from './hooks/useAuth.jsx'

const AuthModal = lazy(() => import('./components/AuthModal.jsx'))
const SellModal = lazy(() => import('./components/SellModal.jsx'))
const MyListingsModal = lazy(() => import('./components/MyListingsModal.jsx'))

export default function App() {
  const { minerals, source } = useMinerals()
  const { favoriteIds, toggle } = useFavorites()
  const { user } = useAuth()

  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [selectedId, setSelectedId] = useState(null)
  const [authOpen, setAuthOpen] = useState(false)
  const [sellOpen, setSellOpen] = useState(false)
  const [myListingsOpen, setMyListingsOpen] = useState(false)
  const [listingsRefreshKey, setListingsRefreshKey] = useState(0)

  const counts = useMemo(() => {
    const acc = {}
    minerals.forEach((m) => {
      const k = m.category || 'other'
      acc[k] = (acc[k] || 0) + 1
    })
    return acc
  }, [minerals])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return minerals.filter((m) => {
      if (category === 'favorites') {
        if (!favoriteIds.has(m.id)) return false
      } else if (category !== 'all' && (m.category || 'other') !== category) {
        return false
      }
      if (!q) return true
      return (
        m.name.toLowerCase().includes(q) ||
        m.name_en?.toLowerCase().includes(q) ||
        m.region.toLowerCase().includes(q) ||
        m.region_en?.toLowerCase().includes(q) ||
        m.mineral_type?.toLowerCase().includes(q)
      )
    })
  }, [query, category, minerals, favoriteIds])

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
          {filtered.length} / {minerals.length}
          <span className="ml-1 text-stone-600">{source === 'supabase' ? '· 云端' : '· 本地'}</span>
        </div>
        <UserMenu
          onSignInClick={() => setAuthOpen(true)}
          onMyListingsClick={() => setMyListingsOpen(true)}
        />
        {user && (
          <button
            onClick={() => setSellOpen(true)}
            className="hidden sm:inline text-xs px-3 py-1.5 rounded-full bg-amber-glow/15 text-amber-glow border border-amber-glow/40 hover:bg-amber-glow/25 transition-colors"
          >
            + 挂一件
          </button>
        )}
      </header>

      <CategoryFilter
        active={category}
        onChange={setCategory}
        counts={counts}
        showFavorites={!!user}
        favoritesCount={favoriteIds.size}
      />

      <main className="flex-1 relative">
        <MapView
          entries={filtered}
          selectedId={selectedId}
          onSelect={setSelectedId}
          favoriteIds={favoriteIds}
        />
        <DetailPanel
          entry={selected}
          onClose={() => setSelectedId(null)}
          favorited={selected ? favoriteIds.has(selected.id) : false}
          onToggleFavorite={toggle}
          onRequireAuth={() => setAuthOpen(true)}
          canSell={!!user}
          onSellClick={() => setSellOpen(true)}
          listingsRefreshKey={listingsRefreshKey}
        />
      </main>

      {authOpen && (
        <Suspense fallback={null}>
          <AuthModal open onClose={() => setAuthOpen(false)} />
        </Suspense>
      )}

      {sellOpen && (
        <Suspense fallback={null}>
          <SellModal
            open
            onClose={() => setSellOpen(false)}
            minerals={minerals}
            defaultMineralId={selectedId}
            onPublished={() => setListingsRefreshKey((k) => k + 1)}
          />
        </Suspense>
      )}

      {myListingsOpen && (
        <Suspense fallback={null}>
          <MyListingsModal
            open
            onClose={() => {
              setMyListingsOpen(false)
              setListingsRefreshKey((k) => k + 1)
            }}
          />
        </Suspense>
      )}
    </div>
  )
}
