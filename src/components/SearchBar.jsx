import { useState } from 'react'

export default function SearchBar({ value, onChange, results, onSelect, visibleResults }) {
  const [focused, setFocused] = useState(false)
  const showDropdown = visibleResults && focused && results.length > 0

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder="搜索矿物或地区，例如：珍珠、缅甸、青金石"
          className="w-full bg-ink-800 border border-ink-700 rounded-md pl-9 pr-3 py-2 text-sm text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-glow/60 focus:ring-1 focus:ring-amber-glow/30"
        />
        <svg
          className="absolute left-2.5 top-2.5 w-4 h-4 text-stone-500"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>
      </div>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-ink-800 border border-ink-700 rounded-md shadow-2xl max-h-72 overflow-y-auto thin-scroll z-[1100]">
          {results.map((r) => (
            <button
              key={r.id}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onSelect(r.id)
                onChange('')
              }}
              className="w-full text-left px-3 py-2 hover:bg-ink-700 border-b border-ink-700 last:border-b-0 transition-colors"
            >
              <div className="text-sm text-stone-200">{r.name}</div>
              <div className="text-xs text-stone-500 mt-0.5">
                {r.region} · {r.mineral_type}
              </div>
            </button>
          ))}
        </div>
      )}

      {visibleResults && focused && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-ink-800 border border-ink-700 rounded-md px-3 py-3 text-sm text-stone-500 z-[1100]">
          没有匹配的记录
        </div>
      )}
    </div>
  )
}
