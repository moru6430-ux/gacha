import { useEffect, useMemo, useRef } from 'react'
import { categoryColor } from '../data/categories.js'

// 把"年份"分段成几个文化时代——线性年份会被远古挤压，分段更易读
const ERAS = [
  { id: 'ancient',    label: '上古',   sublabel: 'Antiquity',     range: [-3500, -500] },
  { id: 'classical',  label: '古典',   sublabel: 'Classical',     range: [-500, 500] },
  { id: 'medieval',   label: '中世纪', sublabel: 'Medieval',      range: [500, 1500] },
  { id: 'discovery',  label: '大航海', sublabel: 'Age of Discovery', range: [1500, 1800] },
  { id: 'industrial', label: '工业',   sublabel: 'Industrial',    range: [1800, 1950] },
  { id: 'modern',     label: '现代',   sublabel: 'Modern',        range: [1950, 2026] },
]

function eraOf(year) {
  for (const e of ERAS) {
    if (year >= e.range[0] && year < e.range[1]) return e
  }
  return ERAS[ERAS.length - 1]
}

function formatYear(y) {
  if (y < 0) return `公元前 ${Math.abs(y)}`
  if (y < 1000) return `公元 ${y}`
  return `${y}`
}

export default function TimelineModal({ open, onClose, minerals, onSelectMineral }) {
  const scrollRef = useRef(null)

  useEffect(() => {
    if (!open) return
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const grouped = useMemo(() => {
    const buckets = ERAS.map((e) => ({ era: e, items: [] }))
    minerals.forEach((m) => {
      if (m.earliest_year == null) return
      const era = eraOf(m.earliest_year)
      const bucket = buckets.find((b) => b.era.id === era.id)
      if (bucket) bucket.items.push(m)
    })
    buckets.forEach((b) => b.items.sort((a, b2) => a.earliest_year - b2.earliest_year))
    return buckets
  }, [minerals])

  if (!open) return null

  function handleWheel(e) {
    // 鼠标滚轮垂直 → 横向滚动
    if (e.deltaY !== 0 && scrollRef.current) {
      e.preventDefault()
      scrollRef.current.scrollLeft += e.deltaY
    }
  }

  return (
    <div
      className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-sm flex flex-col"
      onClick={onClose}
    >
      <div
        className="flex-1 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="px-8 py-5 border-b border-ink-700 flex items-center justify-between bg-ink-900">
          <div>
            <h2 className="text-xl font-serif text-amber-glow">矿物时间线</h2>
            <p className="text-xs text-stone-500 mt-1">
              按已知最早的文化记载排列 · 公元前 3000 → 现代 · 共 {minerals.filter((m) => m.earliest_year != null).length} 条
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

        <div
          ref={scrollRef}
          onWheel={handleWheel}
          className="flex-1 overflow-x-auto overflow-y-hidden thin-scroll bg-ink-950"
        >
          <div className="inline-flex h-full min-w-full items-stretch">
            {grouped.map(({ era, items }) => (
              <div
                key={era.id}
                className="flex flex-col border-r border-ink-800 flex-shrink-0"
                style={{ minWidth: Math.max(320, items.length * 180 + 60) }}
              >
                <div className="sticky top-0 px-5 py-3 bg-ink-900/95 border-b border-ink-800 backdrop-blur z-10">
                  <div className="text-amber-glow text-base font-serif">{era.label}</div>
                  <div className="text-[10px] text-stone-500 tracking-widest mt-0.5">
                    {era.sublabel} · {formatYear(era.range[0])} – {formatYear(era.range[1])}
                  </div>
                  <div className="text-[10px] text-stone-600 mt-1">{items.length} 条</div>
                </div>
                <div className="flex-1 px-5 py-6 flex gap-4 items-start">
                  {items.length === 0 ? (
                    <p className="text-xs text-stone-700 italic self-center">（暂无）</p>
                  ) : (
                    items.map((m) => {
                      const color = m.marker_color || categoryColor(m.category)
                      return (
                        <button
                          key={m.id}
                          onClick={() => {
                            onSelectMineral(m.id)
                            onClose()
                          }}
                          className="group flex-shrink-0 w-40 text-left bg-ink-900/60 border border-ink-700 rounded-md p-3 hover:border-amber-glow/40 hover:bg-ink-800 transition-colors"
                        >
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <span
                              className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                              style={{ background: color, boxShadow: `0 0 8px ${color}66` }}
                            />
                            <span className="text-[10px] text-stone-500 tracking-wider">
                              {formatYear(m.earliest_year)}
                            </span>
                          </div>
                          <div className="text-sm text-stone-100 leading-snug group-hover:text-amber-glow transition-colors">
                            {m.name}
                          </div>
                          <div className="text-[10px] text-stone-500 mt-1 truncate">
                            {m.region}
                          </div>
                          {m.stories?.[0] && (
                            <div className="text-[10px] text-stone-600 mt-2 line-clamp-2 leading-relaxed">
                              {m.stories[0].culture}
                            </div>
                          )}
                        </button>
                      )
                    })
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <footer className="px-8 py-2.5 border-t border-ink-700 bg-ink-900 text-[10px] text-stone-600">
          ← → 鼠标滚轮 / 拖动滚动条横向浏览 · 点卡片跳到矿物详情
        </footer>
      </div>
    </div>
  )
}
