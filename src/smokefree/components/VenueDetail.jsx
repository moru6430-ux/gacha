import {
  scoreColor,
  scoreLabel,
  scoreTone,
  POLICY_LABEL,
  CERT_META,
  SLOT_LABEL,
} from '../lib/score.js'

function SlotBar({ label, value }) {
  const color = scoreColor(value)
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[11px] text-slate-500">
        <span>{label}</span>
        <span className="font-mono" style={{ color }}>
          {value}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-100">
        <div
          className="h-full rounded-full"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

function ZoneCell({ name, value }) {
  if (value == null) {
    return (
      <div className="rounded-lg border border-dashed border-slate-200 p-2 text-center">
        <div className="text-[11px] text-slate-400">{name}</div>
        <div className="text-xs text-slate-400">无</div>
      </div>
    )
  }
  return (
    <div
      className="rounded-lg p-2 text-center ring-1"
      style={{
        backgroundColor: scoreColor(value) + '18',
        boxShadow: `inset 0 0 0 1px ${scoreColor(value)}55`,
      }}
    >
      <div className="text-[11px] text-slate-600">{name}</div>
      <div
        className="text-sm font-semibold"
        style={{ color: scoreColor(value) }}
      >
        {scoreLabel(value)}
      </div>
    </div>
  )
}

export default function VenueDetail({
  venue,
  alternatives,
  onSelectAlt,
  onReport,
  onClose,
}) {
  if (!venue) return null
  const cert = CERT_META[venue.certified]
  const tone = scoreTone(venue.smokeScore)
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-2 border-b border-slate-100 p-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-lg font-semibold text-slate-900">
              {venue.name}
            </h2>
            <span
              className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${cert.tone}`}
            >
              {cert.label}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            {venue.cuisine} · {venue.area} · {venue.address}
          </p>
        </div>
        <button
          onClick={onClose}
          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          aria-label="关闭"
        >
          ✕
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="p-4">
          <div
            className={`flex items-center justify-between rounded-xl p-3 ring-1 ${tone}`}
          >
            <div>
              <div className="text-[11px] uppercase tracking-wide">综合评级</div>
              <div className="mt-0.5 text-xl font-bold">
                {scoreLabel(venue.smokeScore)}
              </div>
              <div className="mt-0.5 text-xs opacity-80">
                政策：{POLICY_LABEL[venue.policy]}
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold leading-none">
                {venue.smokeScore}
              </div>
              <div className="text-[10px] opacity-70">/100</div>
            </div>
          </div>

          <section className="mt-4">
            <h3 className="mb-2 text-xs font-semibold text-slate-500">
              时段烟情
            </h3>
            <div className="space-y-2">
              {['lunch', 'tea', 'dinner'].map((k) => (
                <SlotBar
                  key={k}
                  label={SLOT_LABEL[k]}
                  value={venue.timeSlots[k]}
                />
              ))}
            </div>
          </section>

          <section className="mt-4">
            <h3 className="mb-2 text-xs font-semibold text-slate-500">
              区域细分
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <ZoneCell name="大厅" value={venue.zones.indoor} />
              <ZoneCell name="露天/阳台" value={venue.zones.patio} />
              <ZoneCell name="包间" value={venue.zones.private} />
            </div>
          </section>

          {venue.tags.length > 0 && (
            <section className="mt-4">
              <h3 className="mb-2 text-xs font-semibold text-slate-500">
                场景友好
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {venue.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs text-emerald-700 ring-1 ring-emerald-200"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </section>
          )}

          <section className="mt-4 rounded-xl bg-slate-50 p-3">
            <div className="flex items-center justify-between text-xs">
              <div className="text-slate-500">
                本月打卡确认 <span className="font-semibold text-slate-900">{venue.checkinsThisMonth}</span> 次
              </div>
              <div className={venue.reports7d > 0 ? 'text-red-600' : 'text-emerald-600'}>
                {venue.reports7d > 0
                  ? `7 天内 ${venue.reports7d} 起举报`
                  : '7 天内无举报'}
              </div>
            </div>
          </section>

          {alternatives.length > 0 && (
            <section className="mt-4">
              <h3 className="mb-2 text-xs font-semibold text-slate-500">
                同商圈无烟替代
              </h3>
              <ul className="space-y-1.5">
                {alternatives.map((a) => (
                  <li key={a.id}>
                    <button
                      onClick={() => onSelectAlt(a.id)}
                      className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white p-2.5 text-left text-xs hover:border-emerald-400 hover:shadow-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: scoreColor(a.smokeScore) }}
                        />
                        <span className="font-medium text-slate-900">
                          {a.name}
                        </span>
                        <span className="text-slate-400">{a.cuisine}</span>
                      </div>
                      <span
                        className="text-[11px] font-medium"
                        style={{ color: scoreColor(a.smokeScore) }}
                      >
                        {scoreLabel(a.smokeScore)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>

      <div className="border-t border-slate-100 p-3">
        <button
          onClick={() => onReport(venue)}
          className="w-full rounded-xl bg-red-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 active:scale-[0.99]"
        >
          🚨 一键举报 · 有人抽烟
        </button>
        <p className="mt-1.5 text-center text-[11px] text-slate-400">
          可选匿名 · 一键生成 12345 规范投诉文本
        </p>
      </div>
    </div>
  )
}
