import { useUserListings } from '../hooks/useUserListings.js'

const STATUS_META = {
  draft:    { label: '草稿',     color: 'text-stone-400 border-stone-500/40' },
  pending:  { label: '待审',     color: 'text-amber-glow border-amber-glow/40 bg-amber-glow/5' },
  active:   { label: '在售',     color: 'text-emerald-300 border-emerald-500/40 bg-emerald-500/5' },
  sold:     { label: '已售',     color: 'text-sky-300 border-sky-400/40 bg-sky-400/5' },
  removed:  { label: '已撤架',   color: 'text-stone-500 border-ink-600' },
  rejected: { label: '被拒',     color: 'text-rose-300 border-rose-400/40 bg-rose-400/5' },
}

function formatPrice(cents, currency) {
  const yuan = (cents / 100).toLocaleString('zh-CN', { maximumFractionDigits: 2 })
  const symbol = currency === 'CNY' ? '¥' : currency === 'USD' ? '$' : currency + ' '
  return `${symbol}${yuan}`
}

function formatDate(s) {
  if (!s) return ''
  const d = new Date(s)
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

export default function MyListingsModal({ open, onClose }) {
  const { listings, loading, setStatus } = useUserListings()

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl my-8 bg-ink-900 border border-ink-700 rounded-lg shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-serif text-amber-glow">我的发布</h2>
            <p className="text-[11px] text-stone-500 mt-0.5">
              管理你的市集挂件。撤架后矿物详情页就看不到了；标记已售后保留在你这里，但前台不再显示。
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-stone-500 hover:text-stone-200"
            aria-label="关闭"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-stone-500 py-8 text-center">读取中…</p>
        ) : listings.length === 0 ? (
          <p className="text-sm text-stone-500 py-8 text-center">
            你还没有发布任何商品。在矿物详情页点「+ 挂一件」开始。
          </p>
        ) : (
          <div className="space-y-2 max-h-[60vh] overflow-y-auto thin-scroll -mx-1 px-1">
            {listings.map((l) => {
              const meta = STATUS_META[l.status] || STATUS_META.draft
              const firstImage = Array.isArray(l.images) ? l.images[0] : null
              return (
                <article
                  key={l.id}
                  className="border border-ink-700 rounded-md p-3 bg-ink-800/40"
                >
                  <div className="flex gap-3">
                    {firstImage && (
                      <img
                        src={firstImage}
                        alt=""
                        className="w-14 h-14 object-cover rounded border border-ink-700 flex-shrink-0"
                        loading="lazy"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm text-stone-100 font-medium truncate">
                          {l.title}
                        </h4>
                        <span
                          className={`text-[10px] tracking-widest px-1.5 py-0.5 rounded-sm border ${meta.color}`}
                        >
                          {meta.label}
                        </span>
                      </div>
                      <div className="text-[11px] text-stone-500 mt-1 flex flex-wrap items-center gap-1.5">
                        <span>{l.mineral?.name || '未关联'}</span>
                        <span className="text-stone-600">·</span>
                        <span className="text-amber-glow">{formatPrice(l.price_cents, l.currency)}</span>
                        <span className="text-stone-600">·</span>
                        <span>{formatDate(l.created_at)}</span>
                      </div>
                      {l.moderation_flags?.length > 0 && (
                        <p className="text-[10px] text-amber-glow/80 mt-1">
                          ⚠ 含警示词：{l.moderation_flags.map((f) => f.keyword).join('、')}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3 pl-0">
                    {l.status === 'active' && (
                      <>
                        <button
                          onClick={() => setStatus(l.id, 'sold')}
                          className="text-[11px] px-2 py-1 rounded-sm border border-sky-400/40 text-sky-300 hover:bg-sky-400/10"
                        >
                          标记已售
                        </button>
                        <button
                          onClick={() => setStatus(l.id, 'removed')}
                          className="text-[11px] px-2 py-1 rounded-sm border border-ink-700 text-stone-400 hover:text-rose-300 hover:border-rose-400/40"
                        >
                          撤架
                        </button>
                      </>
                    )}
                    {(l.status === 'removed' || l.status === 'sold') && (
                      <button
                        onClick={() => setStatus(l.id, 'active')}
                        className="text-[11px] px-2 py-1 rounded-sm border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10"
                      >
                        重新上架
                      </button>
                    )}
                    {l.status === 'pending' && (
                      <span className="text-[11px] text-stone-500 italic">
                        等待人工审核中
                      </span>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
