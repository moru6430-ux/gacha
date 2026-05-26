const TYPE_LABEL = {
  primary: '一手',
  secondary: '学术',
  museum: '馆藏',
  web: '在线',
}

const TYPE_ACCENT = {
  primary: 'text-amber-glow border-amber-glow/40',
  secondary: 'text-sky-300 border-sky-400/40',
  museum: 'text-rose-300 border-rose-400/40',
  web: 'text-stone-400 border-ink-600',
}

export default function SourcesList({ sources }) {
  if (!sources?.length) return null

  return (
    <section className="px-5 py-5 border-t border-ink-700 mt-2">
      <h3 className="text-[10px] tracking-[0.25em] text-stone-500 uppercase mb-3">
        参考文献 · Sources
      </h3>
      <ol className="space-y-2.5 text-xs text-stone-400 leading-relaxed">
        {sources.map((s, idx) => {
          const accent = TYPE_ACCENT[s.type] || TYPE_ACCENT.web
          const typeLabel = TYPE_LABEL[s.type] || '参考'
          const body = (
            <>
              {s.author && (
                <span className="text-stone-300">{s.author}</span>
              )}
              {s.author && s.title && <span className="text-stone-600">. </span>}
              {s.title && (
                <span className="italic text-stone-300">{s.title}</span>
              )}
              {s.year && <span className="text-stone-500"> ({s.year})</span>}
              {s.locator && (
                <span className="text-stone-500">. {s.locator}</span>
              )}
            </>
          )
          return (
            <li key={idx} className="flex gap-2">
              <span className="text-stone-600 mt-0.5">{idx + 1}.</span>
              <div className="flex-1 min-w-0">
                <span
                  className={`inline-block text-[9px] tracking-widest px-1.5 py-0.5 rounded-sm border mr-1.5 ${accent}`}
                >
                  {typeLabel}
                </span>
                {s.url ? (
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-amber-glow transition-colors"
                  >
                    {body}
                  </a>
                ) : (
                  body
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
