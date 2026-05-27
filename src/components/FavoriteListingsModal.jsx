import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import ListingCard from './ListingCard.jsx'

export default function FavoriteListingsModal({
  open,
  onClose,
  favoriteListingIds,
  onToggleFavorite,
  cartIds,
  onToggleCart,
  canCart,
}) {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (!open) return
    const ids = Array.from(favoriteListingIds)
    if (ids.length === 0) {
      setListings([])
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    supabase
      .from('listings')
      .select(
        `id, mineral_id, title, description, price_cents, currency, condition,
         images, contact_method, contact_value, status, seller_id,
         seller:profiles(display_name),
         listing_certificates(cert_org, cert_number)`,
      )
      .in('id', ids)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) {
          setError(error.message)
          setLoading(false)
          return
        }
        setListings(data || [])
        setLoading(false)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err.message)
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [open, favoriteListingIds])

  useEffect(() => {
    if (!open) return
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const q = query.trim().toLowerCase()
  const filtered = q
    ? listings.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          (l.seller?.display_name || '').toLowerCase().includes(q) ||
          (l.description || '').toLowerCase().includes(q),
      )
    : listings

  return (
    <div
      className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-ink-900 border border-ink-700 rounded-lg shadow-2xl w-full max-w-2xl max-h-[88vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="px-6 pt-4 pb-3 border-b border-ink-700">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-serif text-amber-glow">收藏的商品</h2>
              <p className="text-[11px] text-stone-500 mt-0.5">
                {listings.length} 件 · 你收藏过的全部 listing
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-stone-500 hover:text-stone-200"
              aria-label="关闭"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          {listings.length > 0 && (
            <div className="mt-3 relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜：标题 · 卖家 · 描述"
                className="w-full bg-ink-800/60 border border-ink-700 rounded-md px-3 py-1.5 pr-8 text-xs text-stone-200 placeholder:text-stone-600 focus:outline-none focus:border-amber-glow/60"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-200 text-xs"
                  aria-label="清除搜索"
                >
                  ×
                </button>
              )}
            </div>
          )}
        </header>

        <div className="flex-1 overflow-y-auto thin-scroll px-6 py-5">
          {loading ? (
            <p className="text-sm text-stone-500">读取中…</p>
          ) : error ? (
            <p className="text-sm text-rose-400">读取失败：{error}</p>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-stone-500">
              {q ? (
                <>
                  <p className="text-sm">没搜到「{query}」相关</p>
                </>
              ) : (
                <>
                  <p className="text-sm">还没有收藏的商品</p>
                  <p className="text-xs mt-2 text-stone-600">
                    在矿物详情页 · 市集区，点 listing 旁的 ♡
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((l) => (
                <ListingCard
                  key={l.id}
                  listing={l}
                  inCart={cartIds?.has(l.id) || false}
                  onToggleCart={onToggleCart}
                  favorited={true}
                  onToggleFavorite={onToggleFavorite}
                  canCart={canCart}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
