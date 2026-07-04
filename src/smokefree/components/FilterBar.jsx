import { POLICY_LABEL, LEGEND_STOPS } from '../lib/score.js'

const POLICY_CHIPS = [
  { id: 'all', label: '全部' },
  { id: 'none', label: '完全无烟' },
  { id: 'zoned', label: '独立烟区' },
  { id: 'outdoor', label: '户外可选' },
  { id: 'lax', label: '室内允许' },
  { id: 'unknown', label: '未标注' },
]

const TAG_CHIPS = ['儿童友好', '孕妇友好', '哮喘友好', '宠物友好']

export default function FilterBar({
  query,
  onQuery,
  policy,
  onPolicy,
  tag,
  onTag,
}) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <input
          type="text"
          placeholder="搜店名 / 商圈 / 菜系"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          className="w-full rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {POLICY_CHIPS.map((c) => (
          <button
            key={c.id}
            onClick={() => onPolicy(c.id)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              policy === c.id
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {TAG_CHIPS.map((t) => (
          <button
            key={t}
            onClick={() => onTag(tag === t ? null : t)}
            className={`rounded-full px-3 py-1 text-xs transition ${
              tag === t
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="pt-1">
        <div className="mb-1 flex items-center justify-between text-[11px] text-slate-500">
          <span>无烟</span>
          <span>浓烟</span>
        </div>
        <div
          className="h-2 rounded-full"
          style={{
            background: `linear-gradient(to right, ${LEGEND_STOPS.map((s) => s.color).join(', ')})`,
          }}
        />
      </div>
    </div>
  )
}
