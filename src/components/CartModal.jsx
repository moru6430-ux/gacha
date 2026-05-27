import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'

const CONDITION_LABEL = {
  new: '全新',
  used: '二手',
  vintage: 'Vintage',
  antique: '古董',
}

function formatPrice(cents, currency) {
  const yuan = (cents / 100).toLocaleString('zh-CN', { maximumFractionDigits: 2 })
  const symbol = currency === 'CNY' ? '¥' : currency === 'USD' ? '$' : currency + ' '
  return `${symbol}${yuan}`
}

function contactHref(method, value) {
  if (method === 'email') return `mailto:${value}`
  return null
}

// 把后端 listings 列表按 seller 分组——同一卖家的多件可以一次性联系
function groupBySeller(listings) {
  const map = new Map()
  for (const l of listings) {
    const sellerId = l.seller_id || l.seller?.id || 'anon'
    if (!map.has(sellerId)) {
      map.set(sellerId, {
        sellerId,
        sellerName: l.seller?.display_name || '匿名卖家',
        contactMethod: l.contact_method,
        contactValue: l.contact_value,
        items: [],
      })
    }
    map.get(sellerId).items.push(l)
  }
  return Array.from(map.values())
}

export default function CartModal({ open, onClose, cartIds, onRemove, onClear }) {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (!open) return
    const ids = Array.from(cartIds.keys())
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
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) {
          setError(error.message)
          setLoading(false)
          return
        }
        // 只显示仍 active 的；其他状态（已售 / 撤架 / 被拒）标灰
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
  }, [open, cartIds])

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
    ? listings.filter((l) => {
        const sellerName = (l.seller?.display_name || '').toLowerCase()
        return (
          l.title.toLowerCase().includes(q) ||
          sellerName.includes(q) ||
          (l.description || '').toLowerCase().includes(q)
        )
      })
    : listings
  const groups = groupBySeller(filtered)
  const total = filtered
    .filter((l) => l.status === 'active')
    .reduce((sum, l) => sum + (l.price_cents || 0), 0)
  const currency = listings[0]?.currency || 'CNY'

  async function handleClear() {
    if (!onClear) return
    if (!confirm(`确认清空购物车里全部 ${listings.length} 件？`)) return
    await onClear()
  }

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
              <h2 className="text-lg font-serif text-amber-glow">购物车</h2>
              <p className="text-[11px] text-stone-500 mt-0.5">
                {listings.length} 件 · 此处仅汇总待联系，付款 / 邮寄请直接和卖家沟通
              </p>
            </div>
            <div className="flex items-center gap-3">
              {listings.length > 0 && (
                <button
                  onClick={handleClear}
                  className="text-[11px] text-stone-500 hover:text-rose-400 transition-colors"
                >
                  清空
                </button>
              )}
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
          </div>
          {listings.length > 0 && (
            <div className="mt-3 relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="在购物车里搜：标题 · 卖家 · 描述"
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
          ) : groups.length === 0 ? (
            <div className="text-center py-12 text-stone-500">
              {q ? (
                <>
                  <p className="text-sm">没搜到「{query}」相关</p>
                  <p className="text-xs mt-2 text-stone-600">
                    清空搜索词看全部 {listings.length} 件
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm">购物车空空的</p>
                  <p className="text-xs mt-2 text-stone-600">
                    去矿物详情页 · 市集区，看到喜欢的点「+ 加入购物车」
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              {groups.map((g) => {
                const href = contactHref(g.contactMethod, g.contactValue)
                const sellerSum = g.items
                  .filter((i) => i.status === 'active')
                  .reduce((s, i) => s + (i.price_cents || 0), 0)
                return (
                  <div key={g.sellerId} className="border border-ink-700 rounded-md">
                    <div className="px-4 py-2.5 border-b border-ink-700 flex items-center justify-between bg-ink-800/40">
                      <div className="text-xs text-stone-300">
                        卖家：{g.sellerName}
                        <span className="text-stone-600 ml-2">· {g.items.length} 件</span>
                      </div>
                      {href ? (
                        <a
                          href={href}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-amber-glow hover:underline"
                        >
                          一次性联系 →
                        </a>
                      ) : (
                        <span className="text-[11px] text-stone-500">
                          {g.contactMethod}: {g.contactValue}
                        </span>
                      )}
                    </div>
                    <div className="divide-y divide-ink-700">
                      {g.items.map((l) => {
                        const isInactive = l.status !== 'active'
                        const cert = l.listing_certificates?.[0]
                        const firstImage = Array.isArray(l.images) ? l.images[0] : null
                        return (
                          <div
                            key={l.id}
                            className={
                              'px-4 py-3 flex gap-3 ' +
                              (isInactive ? 'opacity-50' : '')
                            }
                          >
                            {firstImage && (
                              <img
                                src={firstImage}
                                alt=""
                                className="w-14 h-14 object-cover rounded border border-ink-700 flex-shrink-0"
                                loading="lazy"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none'
                                }}
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="text-sm text-stone-100 truncate">{l.title}</h4>
                                <span className="text-sm text-amber-glow whitespace-nowrap">
                                  {formatPrice(l.price_cents, l.currency)}
                                </span>
                              </div>
                              <div className="text-[10px] text-stone-500 mt-1 flex flex-wrap items-center gap-1.5">
                                <span>{CONDITION_LABEL[l.condition] || l.condition}</span>
                                {cert && (
                                  <span className="px-1.5 py-0.5 rounded-sm border border-emerald-500/40 text-emerald-300 text-[9px]">
                                    {cert.cert_org}
                                  </span>
                                )}
                                {isInactive && (
                                  <span className="px-1.5 py-0.5 rounded-sm border border-rose-500/40 text-rose-300 text-[9px]">
                                    {l.status === 'sold'
                                      ? '已售'
                                      : l.status === 'removed'
                                        ? '已撤架'
                                        : l.status === 'rejected'
                                          ? '被拒'
                                          : l.status}
                                  </span>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => onRemove(l.id)}
                              className="text-[11px] text-stone-500 hover:text-rose-400 self-start"
                              aria-label="从购物车移除"
                            >
                              移除
                            </button>
                          </div>
                        )
                      })}
                    </div>
                    {sellerSum > 0 && (
                      <div className="px-4 py-2 border-t border-ink-700 text-[11px] text-stone-400 flex justify-end">
                        小计 {formatPrice(sellerSum, currency)}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {groups.length > 0 && total > 0 && (
          <footer className="px-6 py-4 border-t border-ink-700 flex items-center justify-between">
            <span className="text-xs text-stone-500">在售合计</span>
            <span className="text-lg text-amber-glow font-medium">
              {formatPrice(total, currency)}
            </span>
          </footer>
        )}
      </div>
    </div>
  )
}
