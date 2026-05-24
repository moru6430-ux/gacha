import { CATEGORIES } from '../data/categories.js'

export default function CategoryFilter({ active, onChange, counts }) {
  const totalCount = Object.values(counts || {}).reduce((a, b) => a + b, 0)

  const Pill = ({ k, label, color, count }) => {
    const isActive = active === k
    const disabled = count === 0 && k !== 'all'
    return (
      <button
        type="button"
        onClick={() => onChange(k)}
        disabled={disabled}
        className={
          'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border transition-colors ' +
          (isActive
            ? 'border-amber-glow/70 bg-amber-glow/10 text-amber-glow'
            : disabled
              ? 'border-ink-700 text-stone-600 cursor-not-allowed'
              : 'border-ink-700 text-stone-400 hover:text-stone-200 hover:border-ink-600')
        }
      >
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
