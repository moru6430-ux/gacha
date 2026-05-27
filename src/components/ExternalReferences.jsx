import { PLATFORMS } from '../lib/affiliates.js'

export default function ExternalReferences({ mineral }) {
  if (!mineral) return null

  return (
    <section className="px-5 py-5 border-t border-ink-700">
      <h3 className="text-[10px] tracking-[0.25em] text-stone-500 uppercase mb-3">
        外部参考 · 在别处找类似的
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {PLATFORMS.map((p) => (
          <a
            key={p.id}
            href={p.build(mineral)}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="flex flex-col gap-0.5 px-3 py-2.5 rounded-md border border-ink-700 bg-ink-800/40 hover:border-amber-glow/40 hover:bg-ink-800 transition-colors"
          >
            <span className="text-sm text-stone-100">{p.label}</span>
            <span className="text-[10px] text-stone-500">{p.note}</span>
          </a>
        ))}
      </div>
      <p className="text-[10px] text-stone-600 mt-3 leading-relaxed">
        ⓘ 这些是合作平台的跳转链接。如果你从这里跳过去并下单，我们可能拿到一点联盟佣金——
        这是我们维持本站不收发布费的方式。价格和你直接去买完全一样。
      </p>
    </section>
  )
}
