import { CATEGORIES } from '../data/categories.js'

export default function CategoryFilter({
  active,
  onChange,
  counts,
  showFavorites = false,
  favoritesCount = 0,
}) {
  const totalCount = Object.values(counts || {}).reduce((a, b) => a + b, 0)

  const Pill = ({ k, label, color, count, icon, accent }) => {
    const isActive = active === k
    const disabled = count === 0 && k !== 'all' && k !== 'favorites'
    return (
      <button
        type="button"
        onClick={() => onChange(k)}
        disabled={disabled}
        className={
          'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border transition-colors ' +
          (isActive
            ? accent === 'rose'
              ? 'border-rose-400/70 bg-rose-400/10 text-rose-300'
              : 'border-amber-glow/70 bg-amber-glow/10 text-amber-glow'
            : disabled
              ? 'border-ink-700 text-stone-600 cursor-not-allowed'
              : 'border-ink-700 text-stone-400 hover:text-stone-200 hover:border-ink-600')
        }
      >
        {icon}
        {color && (
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: color, boxShadow: `0 0 6px ${color}88` }}
          />
        )}
        <span>{label}</span>
        <span className="text-[10px] text-stone-500">{count}</span>
      </button>
    )
  }

  return (
    <div className="px-6 py-2 border-b border-ink-700 bg-ink-900/60 flex flex-wrap gap-1.5 overflow-x-auto thin-scroll z-[999]">
      <Pill k="all" label="全部" count={totalCount} />
      {showFavorites && (
        <Pill
          k="favorites"
          label="我的收藏"
          count={favoritesCount}
          accent="rose"
          icon={
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
        />
      )}
      {CATEGORIES.map((c) => (
        <Pill
          key={c.key}
          k={c.key}
          label={c.label}
          color={c.color}
          count={counts?.[c.key] || 0}
        />
      ))}
    </div>
  )
}
