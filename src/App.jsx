import { lazy, Suspense, useMemo, useState } from 'react'
import MapView from './components/MapView.jsx'
import SearchBar from './components/SearchBar.jsx'
import DetailPanel from './components/DetailPanel.jsx'
import CategoryFilter from './components/CategoryFilter.jsx'
import UserMenu from './components/UserMenu.jsx'
import { useMinerals } from './hooks/useMinerals.js'
import { useFavorites } from './hooks/useFavorites.jsx'
import { useCart } from './hooks/useCart.js'
import { useListingFavorites } from './hooks/useListingFavorites.js'
import { useAuth } from './hooks/useAuth.jsx'
import {
  getContinents,
  CONTINENT_MAP,
} from './data/continents.js'

const AuthModal = lazy(() => import('./components/AuthModal.jsx'))
const SellModal = lazy(() => import('./components/SellModal.jsx'))
const MyListingsModal = lazy(() => import('./components/MyListingsModal.jsx'))
const CartModal = lazy(() => import('./components/CartModal.jsx'))
const FavoriteListingsModal = lazy(() => import('./components/FavoriteListingsModal.jsx'))
const TimelineModal = lazy(() => import('./components/TimelineModal.jsx'))
const UserProfileModal = lazy(() => import('./components/UserProfileModal.jsx'))

export default function App() {
  const { minerals, source } = useMinerals()
  const { favoriteIds, toggle } = useFavorites()
  const { cartIds, count: cartCount, toggle: toggleCart, clear: clearCart } = useCart()
  const {
    favoriteListingIds,
    toggle: toggleListingFavorite,
  } = useListingFavorites()
  const { user } = useAuth()

  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [selectedId, setSelectedId] = useState(null)
  const [selectedContinent, setSelectedContinent] = useState(null)
  const [authOpen, setAuthOpen] = useState(false)
  const [sellOpen, setSellOpen] = useState(false)
  const [myListingsOpen, setMyListingsOpen] = useState(false)
  const [favListingsOpen, setFavListingsOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [timelineOpen, setTimelineOpen] = useState(false)
  const [profileUserId, setProfileUserId] = useState(null)
  const [listingsRefreshKey, setListingsRefreshKey] = useState(0)

  // 类别计数（用于 CategoryFilter）
  const counts = useMemo(() => {
    const acc = {}
    minerals.forEach((m) => {
      const k = m.category || 'other'
      acc[k] = (acc[k] || 0) + 1
    })
    return acc
  }, [minerals])

  // 大洲计数（用于入口徽章）。横跨多洲的矿物在每个所属大洲各计一次。
  const continentCounts = useMemo(() => {
    const acc = {}
    minerals.forEach((m) => {
      getContinents(m.coordinates, m.continent).forEach((cid) => {
        acc[cid] = (acc[cid] || 0) + 1
      })
    })
    return acc
  }, [minerals])

  // 横跨大洲的矿物数量（信息提示用）
  const borderCount = useMemo(
    () => minerals.filter((m) => getContinents(m.coordinates, m.continent).length > 1).length,
    [minerals],
  )

  const hasFilter = !!query.trim() || category !== 'all'
  // 世界视图 = 没选大洲、没搜、没分类筛选。其他情况都是「展开看点」。
  const viewMode =
    !selectedContinent && !hasFilter ? 'world' : 'continent'

  const filtered = useMemo(() => {
    if (viewMode === 'world') return []
    const q = query.trim().toLowerCase()
    return minerals.filter((m) => {
      // 大洲过滤（只在选中大洲、且没用搜索 / 分类时启用，否则全局搜）
      if (selectedContinent && !hasFilter) {
        if (!getContinents(m.coordinates, m.continent).includes(selectedContinent))
          return false
      }
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
  }, [
    viewMode,
    query,
    category,
    minerals,
    favoriteIds,
    selectedContinent,
    hasFilter,
  ])

  const selected = minerals.find((m) => m.id === selectedId) || null

  function handlePickContinent(id) {
    setSelectedContinent(id)
    setSelectedId(null)
    setQuery('')
    setCategory('all')
  }

  function handleReturnToWorld() {
    setSelectedContinent(null)
    setSelectedId(null)
    setQuery('')
    setCategory('all')
  }

  // 从时间线 / 用户主页里点矿物：确保它一定出现在地图上。
  // 清掉搜索 / 分类筛选，并切到它所属大洲——否则在别的大洲 / 筛选态下
  // 这颗矿物不在 entries 里，标记不渲染、FlyTo 也不触发（空地图 bug）。
  function focusMineral(id) {
    const m = minerals.find((x) => x.id === id)
    setSelectedId(id)
    if (!m) return
    if (query) setQuery('')
    if (category !== 'all') setCategory('all')
    const cs = getContinents(m.coordinates, m.continent)
    if (cs[0]) setSelectedContinent(cs[0])
  }

  const currentContinent = selectedContinent
    ? CONTINENT_MAP[selectedContinent]
    : null

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
          {viewMode === 'world'
            ? `${minerals.length} 条 · 选一片大洲${borderCount > 0 ? `（${borderCount} 条跨边界两边都出现）` : ''}`
            : `${filtered.length} / ${minerals.length}`}
          <span className="ml-1 text-stone-600">{source === 'supabase' ? '· 云端' : '· 本地'}</span>
        </div>
        <button
          onClick={() => setTimelineOpen(true)}
          className="text-stone-300 hover:text-amber-glow transition-colors"
          aria-label="时间线"
          title="矿物时间线"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M3 12h18" strokeLinecap="round" />
            <circle cx="6" cy="12" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="18" cy="12" r="1.5" />
          </svg>
        </button>
        <UserMenu
          onSignInClick={() => setAuthOpen(true)}
          onMyListingsClick={() => setMyListingsOpen(true)}
          onFavoriteListingsClick={() => setFavListingsOpen(true)}
          onMyProfileClick={() => user && setProfileUserId(user.id)}
        />
        {user && (
          <button
            onClick={() => setCartOpen(true)}
            className="relative text-stone-300 hover:text-amber-glow transition-colors"
            aria-label="购物车"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M3 3h2l.6 3M7 13h10l3-8H6" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="9" cy="20" r="1.4" />
              <circle cx="17" cy="20" r="1.4" />
              <path d="M7 13l-1.4-7" strokeLinecap="round" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-amber-glow text-ink-950 text-[10px] font-medium rounded-full px-1.5 min-w-[18px] h-[18px] flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        )}
        {user && (
          <button
            onClick={() => setSellOpen(true)}
            className="hidden sm:inline text-xs px-3 py-1.5 rounded-full bg-amber-glow/15 text-amber-glow border border-amber-glow/40 hover:bg-amber-glow/25 transition-colors"
          >
            + 挂一件
          </button>
        )}
      </header>

      {viewMode !== 'world' && (
        <CategoryFilter
          active={category}
          onChange={setCategory}
          counts={counts}
          showFavorites={!!user}
          favoritesCount={favoriteIds.size}
        />
      )}

      <main className="flex-1 relative">
        <MapView
          entries={filtered}
          selectedId={selectedId}
          onSelect={setSelectedId}
          favoriteIds={favoriteIds}
          viewMode={viewMode}
          selectedContinent={selectedContinent}
          continentCounts={continentCounts}
          onPickContinent={handlePickContinent}
        />

        {viewMode !== 'world' && (
          <button
            onClick={handleReturnToWorld}
            className="absolute top-4 left-4 z-[1000] flex items-center gap-2 px-3 py-2 rounded-full bg-ink-900/85 border border-ink-700 backdrop-blur text-stone-200 hover:bg-ink-800 transition-colors shadow-lg"
          >
            <span className="text-sm">←</span>
            <span className="text-xs tracking-wide">
              {currentContinent ? `${currentContinent.label_zh} · 返回大洲` : '返回大洲'}
            </span>
          </button>
        )}

        <DetailPanel
          entry={selected}
          onClose={() => setSelectedId(null)}
          favorited={selected ? favoriteIds.has(selected.id) : false}
          onToggleFavorite={toggle}
          onRequireAuth={() => setAuthOpen(true)}
          canSell={!!user}
          onSellClick={() => setSellOpen(true)}
          listingsRefreshKey={listingsRefreshKey}
          cartIds={cartIds}
          onToggleCart={toggleCart}
          favoriteListingIds={favoriteListingIds}
          onToggleListingFavorite={toggleListingFavorite}
          canCart={!!user}
          onOpenSeller={(sid) => setProfileUserId(sid)}
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

      {cartOpen && (
        <Suspense fallback={null}>
          <CartModal
            open
            onClose={() => setCartOpen(false)}
            cartIds={cartIds}
            onRemove={(id) => toggleCart(id)}
            onClear={clearCart}
            onOpenSeller={(sid) => setProfileUserId(sid)}
          />
        </Suspense>
      )}

      {favListingsOpen && (
        <Suspense fallback={null}>
          <FavoriteListingsModal
            open
            onClose={() => setFavListingsOpen(false)}
            favoriteListingIds={favoriteListingIds}
            onToggleFavorite={toggleListingFavorite}
            cartIds={cartIds}
            onToggleCart={toggleCart}
            canCart={!!user}
            onOpenSeller={(sid) => setProfileUserId(sid)}
          />
        </Suspense>
      )}

      {timelineOpen && (
        <Suspense fallback={null}>
          <TimelineModal
            open
            onClose={() => setTimelineOpen(false)}
            minerals={minerals}
            onSelectMineral={focusMineral}
          />
        </Suspense>
      )}

      {profileUserId && (
        <Suspense fallback={null}>
          <UserProfileModal
            open
            onClose={() => setProfileUserId(null)}
            userId={profileUserId}
            minerals={minerals}
            onSelectMineral={focusMineral}
            cartIds={cartIds}
            onToggleCart={toggleCart}
            favoriteListingIds={favoriteListingIds}
            onToggleListingFavorite={toggleListingFavorite}
            canCart={!!user}
          />
        </Suspense>
      )}
    </div>
  )
}
