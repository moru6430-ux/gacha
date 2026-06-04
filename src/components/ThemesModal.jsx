import { useEffect, useMemo, useRef } from 'react'
import { categoryColor } from '../data/categories.js'
import { THEMES, themeLabel, themeEmoji } from '../data/themes.js'

export default function ThemesModal({ open, onClose, minerals, onSelectMineral }) {
  const scrollRef = useRef(null)

  useEffect(() => {
    if (!open) return
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // 按意象分组：每个意象 → 它的矿物列表
  const grouped = useMemo(() => {
    return THEMES.map((t) => {
      const items = minerals
        .filter((m) => Array.isArray(m.themes) && m.themes.includes(t.key))
        // 按时间线排序，老的在前
        .sort((a, b) => (a.earliest_year ?? 9999) - (b.earliest_year ?? 9999))
      return { theme: t, items }
    }).filter((g) => g.items.length > 0)
  }, [minerals])

  // 无意象的矿物（待补强）——只在底部诚实提示，不占主视野
  const unclassified = useMemo(
    () => minerals.filter((m) => !Array.isArray(m.themes) || m.themes.length === 0),
    [minerals],
  )

  if (!open) return null

  const totalTagged = grouped.reduce((acc, g) => acc + g.items.length, 0)

  return (
    <div
      className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-sm flex flex-col"
      onClick={onClose}
    >
      <div className="flex-1 flex flex-col" onClick={(e) => e.stopPropagation()}>
        <header className="px-8 py-5 border-b border-ink-700 flex items-center justify-between bg-ink-900">
          <div>
            <h2 className="text-xl font-serif text-amber-glow">意象浏览 · Themes</h2>
            <p className="text-xs text-stone-500 mt-1">
              {grouped.length} 个意象 · 共 {totalTagged} 个标签
              {unclassified.length > 0 && (
                <span className="ml-2 text-stone-600">
                  · {unclassified.length} 条未分类待补
                </span>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-stone-500 hover:text-stone-200"
            aria-label="关闭"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto thin-scroll bg-ink-950">
          <div className="px-6 py-6 space-y-6 max-w-[1400px] mx-auto">
            {grouped.map(({ theme, items }) => (
              <section key={theme.key} className="rounded-lg border border-ink-800 bg-ink-900/40">
                <div className="px-5 py-3 border-b border-ink-800 flex items-baseline justify-between">
                  <div className="flex items-baseline gap-3">
                    <span className="text-2xl">{theme.emoji}</span>
                    <span className="text-amber-glow text-lg font-serif tracking-wide">
                      {theme.label}
                    </span>
                    <span className="text-[11px] text-stone-500">{items.length} 条</span>
                  </div>
                  <span className="text-[10px] text-stone-600 italic max-w-md text-right">
                    {theme.desc}
                  </span>
                </div>
                <div className="px-4 py-4 flex gap-3 overflow-x-auto thin-scroll">
                  {items.map((m) => {
                    const color = m.marker_color || categoryColor(m.category)
                    const otherThemes = (m.themes || []).filter((k) => k !== theme.key)
                    return (
                      <button
                        key={m.id}
                        onClick={() => {
                          onSelectMineral(m.id)
                          onClose()
                        }}
                        className="group flex-shrink-0 w-44 text-left bg-ink-800/40 border border-ink-700 rounded-md p-3 hover:border-amber-glow/40 hover:bg-ink-800 transition-colors"
                      >
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span
                            className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ background: color, boxShadow: `0 0 8px ${color}66` }}
                          />
                          {m.earliest_year != null && (
                            <span className="text-[10px] text-stone-500 tracking-wider">
                              {m.earliest_year < 0
                                ? `前 ${Math.abs(m.earliest_year)}`
                                : m.earliest_year}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-stone-100 leading-snug group-hover:text-amber-glow transition-colors">
                          {m.name}
                        </div>
                        <div className="text-[10px] text-stone-500 mt-1 truncate">
                          {m.region}
                        </div>
                        {otherThemes.length > 0 && (
                          <div className="text-[10px] text-stone-600 mt-1.5 truncate">
                            {otherThemes.map((k) => themeEmoji(k) + themeLabel(k)).join(' · ')}
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </section>
            ))}

            {unclassified.length > 0 && (
              <section className="rounded-lg border border-dashed border-ink-700 bg-ink-900/30">
                <div className="px-5 py-3 text-[11px] text-stone-500">
                  ⚠️ 暂无意象（待神话补强）· {unclassified.length} 条
                </div>
                <div className="px-4 py-3 flex gap-2 flex-wrap">
                  {unclassified.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        onSelectMineral(m.id)
                        onClose()
                      }}
                      className="text-xs px-3 py-1.5 rounded-full border border-ink-700 text-stone-400 hover:border-amber-glow/40 hover:text-amber-glow transition-colors"
                    >
                      {m.name}
                    </button>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
