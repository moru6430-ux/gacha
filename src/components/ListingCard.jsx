function formatPrice(cents, currency) {
  const yuan = (cents / 100).toLocaleString('zh-CN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
  const symbol = currency === 'CNY' ? '¥' : currency === 'USD' ? '$' : currency + ' '
  return `${symbol}${yuan}`
}

const CONDITION_LABEL = {
  new: '全新',
  used: '二手',
  vintage: 'Vintage',
  antique: '古董',
}

function contactHref(method, value) {
  if (method === 'email') return `mailto:${value}`
  return null
}

export default function ListingCard({
  listing,
  inCart,
  onToggleCart,
  favorited,
  onToggleFavorite,
  onRequireAuth,
  canCart,
}) {
  const cert = listing.listing_certificates?.[0]
  const sellerName = listing.seller?.display_name || '匿名卖家'
  const firstImage = Array.isArray(listing.images) ? listing.images[0] : null
  const href = contactHref(listing.contact_method, listing.contact_value)

  function handleCart() {
    if (!canCart) {
      onRequireAuth?.()
      return
    }
    onToggleCart?.(listing.id)
  }

  function handleFavorite() {
    if (!canCart) {
      onRequireAuth?.()
      return
    }
    onToggleFavorite?.(listing.id)
  }

  return (
    <article className="bg-ink-800/60 border border-ink-700 rounded-md p-3 flex gap-3">
      {firstImage && (
        <img
          src={firstImage}
          alt=""
          className="w-16 h-16 object-cover rounded border border-ink-700 flex-shrink-0"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm text-stone-100 font-medium truncate">{listing.title}</h4>
          <span className="text-sm text-amber-glow font-medium whitespace-nowrap">
            {formatPrice(listing.price_cents, listing.currency)}
          </span>
        </div>
        <div className="text-[11px] text-stone-500 mt-1 flex flex-wrap items-center gap-1.5">
          <span>{sellerName}</span>
          <span className="text-stone-600">·</span>
          <span>{CONDITION_LABEL[listing.condition] || listing.condition}</span>
          {cert && (
            <span className="px-1.5 py-0.5 rounded-sm border border-emerald-500/40 text-emerald-300 text-[9px] tracking-wider">
              {cert.cert_org} 证书
            </span>
          )}
        </div>
        {listing.description && (
          <p className="text-xs text-stone-400 mt-1.5 leading-relaxed line-clamp-2">
            {listing.description}
          </p>
        )}
        <div className="mt-2 flex items-center gap-3 flex-wrap">
          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-amber-glow hover:underline"
            >
              联系卖家 →
            </a>
          ) : (
            <span className="text-[11px] text-stone-500">
              {listing.contact_method}: {listing.contact_value}
            </span>
          )}
          {onToggleFavorite && (
            <button
              onClick={handleFavorite}
              className={
                'text-[13px] leading-none transition-colors ' +
                (favorited ? 'text-rose-400' : 'text-stone-500 hover:text-rose-300')
              }
              aria-label={favorited ? '已收藏' : '收藏'}
              aria-pressed={favorited}
              title={favorited ? '已收藏' : '收藏'}
            >
              {favorited ? '♥' : '♡'}
            </button>
          )}
          {onToggleCart && (
            <button
              onClick={handleCart}
              className={
                'text-[11px] px-2 py-0.5 rounded-full border transition-colors ' +
                (inCart
                  ? 'border-amber-glow/60 text-amber-glow bg-amber-glow/10'
                  : 'border-ink-600 text-stone-400 hover:border-amber-glow/40 hover:text-amber-glow')
              }
              aria-pressed={inCart}
            >
              {inCart ? '✓ 已在购物车' : '+ 加入购物车'}
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
