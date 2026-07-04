import { scoreColor, scoreLabel, POLICY_LABEL, CERT_META } from '../lib/score.js'

export default function VenueList({ venues, selectedId, onSelect }) {
  if (venues.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
        没有符合条件的餐厅
      </div>
    )
  }
  return (
    <ul className="space-y-2">
      {venues.map((v) => {
        const active = v.id === selectedId
        const cert = CERT_META[v.certified]
        return (
          <li key={v.id}>
            <button
              onClick={() => onSelect(v.id)}
              className={`group w-full rounded-xl border p-3 text-left transition ${
                active
                  ? 'border-emerald-500 bg-emerald-50/50 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className="mt-0.5 inline-block h-3 w-3 shrink-0 rounded-full ring-2 ring-white"
                  style={{ backgroundColor: scoreColor(v.smokeScore) }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="truncate text-sm font-semibold text-slate-900">
                      {v.name}
                    </h3>
                    <span
                      className="shrink-0 text-[11px] font-medium"
                      style={{ color: scoreColor(v.smokeScore) }}
                    >
                      {scoreLabel(v.smokeScore)}
                    </span>
                  </div>
                  <div className="mt-0.5 truncate text-xs text-slate-500">
                    {v.cuisine} · {v.area} · {POLICY_LABEL[v.policy]}
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${cert.tone}`}
                    >
                      {cert.label}
                    </span>
                    {v.tags.slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600"
                      >
                        {t}
                      </span>
                    ))}
                    {v.reports7d > 0 && (
                      <span className="rounded bg-red-50 px-1.5 py-0.5 text-[10px] text-red-600">
                        7天 {v.reports7d} 举报
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
