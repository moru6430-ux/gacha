export default function DetailPanel({ entry, onClose }) {
  if (!entry) return null

  return (
    <aside className="absolute top-0 right-0 h-full w-full sm:w-[420px] bg-ink-900/95 backdrop-blur border-l border-ink-700 shadow-[-10px_0_40px_rgba(0,0,0,0.4)] z-[1000] flex flex-col">
      <div className="flex items-start justify-between px-5 py-4 border-b border-ink-700">
        <div>
          <div className="text-xs text-stone-500 tracking-widest uppercase">
            {entry.region_en || entry.region}
          </div>
          <h2 className="text-2xl font-serif text-amber-glow mt-0.5">{entry.name}</h2>
          <div className="text-xs text-stone-400 mt-1">
            {entry.mineral_type}
            {entry.color && <span className="text-stone-500"> · {entry.color}</span>}
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-stone-500 hover:text-stone-200 transition-colors -mr-1"
          aria-label="关闭"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto thin-scroll">
        {entry.image && (
          <div className="px-5 pt-5">
            <img
              src={entry.image}
              alt={entry.name}
              className="w-full h-48 object-cover rounded-md border border-ink-700"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          </div>
        )}

        <div className="px-5 py-5 space-y-5">
          {entry.stories?.map((story, idx) => (
            <article key={idx} className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-[10px] tracking-widest text-amber-glow/70 uppercase">
                  {story.culture}
                </span>
                <span className="h-px flex-1 bg-ink-700" />
              </div>
              <h3 className="font-serif text-lg text-stone-100">{story.title}</h3>
              <p className="text-sm text-stone-300 leading-relaxed whitespace-pre-line">
                {story.content}
              </p>
            </article>
          ))}
        </div>
      </div>

      <footer className="px-5 py-3 border-t border-ink-700 text-xs text-stone-500">
        坐标 {entry.coordinates[0].toFixed(4)}, {entry.coordinates[1].toFixed(4)}
      </footer>
    </aside>
  )
}
