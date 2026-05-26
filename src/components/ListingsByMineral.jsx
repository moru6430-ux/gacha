import { useListings } from '../hooks/useListings.js'
import ListingCard from './ListingCard.jsx'

export default function ListingsByMineral({ mineralId, onSellClick, canSell }) {
  const { listings, loading } = useListings(mineralId)

  return (
    <section className="px-5 py-5 border-t border-ink-700">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[10px] tracking-[0.25em] text-stone-500 uppercase">
          市集 · 在售 {listings.length > 0 && <span className="text-stone-400">({listings.length})</span>}
        </h3>
        {canSell && (
          <button
            onClick={onSellClick}
            className="text-[11px] px-2 py-0.5 rounded-full border border-amber-glow/40 text-amber-glow hover:bg-amber-glow/10 transition-colors"
          >
            + 挂一件
          </button>
        )}
      </div>
      {loading ? (
        <p className="text-xs text-stone-500">读取中…</p>
      ) : listings.length === 0 ? (
        <p className="text-xs text-stone-500">
          还没有人挂这块石头{canSell ? '——你也可以做第一个' : ''}。
        </p>
      ) : (
        <div className="space-y-2">
          {listings.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      )}
    </section>
  )
}
