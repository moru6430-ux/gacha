import { useMemo, useState } from 'react'

const QUICK_TAGS = [
  '有人室内抽烟',
  '员工不劝阻',
  '二手烟味浓',
  '包间烟味外飘',
  '无禁烟标识',
  '电子烟被允许',
]

const SLOT_LABELS = { lunch: '午餐时段', tea: '下午茶', dinner: '晚餐时段' }

function buildComplaint(venue, tags, note, slot) {
  const now = new Date()
  const time = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${SLOT_LABELS[slot]}`
  return `投诉对象：${venue.name}（${venue.address}）
投诉时间：${time}
投诉事项：本人于上述时间在该餐饮场所就餐，发现存在违反《公共场所控制吸烟条例》相关规定的情形，具体如下——
${tags.map((t, i) => `  ${i + 1}. ${t}`).join('\n')}
${note ? `\n补充说明：${note}\n` : ''}
根据现行控烟规定，室内公共场所应全面禁烟，经营者负有劝阻义务并应设置明显禁烟标识。请贵部门依法调查处理并将处理结果反馈举报人。

举报渠道：12345 政务服务便民热线 / 卫生健康监督部门`
}

export default function ReportModal({ venue, onClose, onSubmit }) {
  const [tags, setTags] = useState([])
  const [note, setNote] = useState('')
  const [slot, setSlot] = useState('dinner')
  const [anon, setAnon] = useState(true)
  const [showComplaint, setShowComplaint] = useState(false)
  const [copied, setCopied] = useState(false)

  const toggle = (t) =>
    setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))

  const complaint = useMemo(
    () => buildComplaint(venue, tags.length ? tags : ['室内二手烟'], note, slot),
    [venue, tags, note, slot],
  )

  const canSubmit = tags.length > 0

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(complaint)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-end justify-center bg-slate-900/50 p-3 sm:items-center">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900">举报烟情</h3>
            <p className="text-xs text-slate-500">{venue.name}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="关闭"
          >
            ✕
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-4">
          <section>
            <label className="mb-1.5 block text-xs font-semibold text-slate-500">
              发生时段
            </label>
            <div className="flex gap-1.5">
              {Object.entries(SLOT_LABELS).map(([k, v]) => (
                <button
                  key={k}
                  onClick={() => setSlot(k)}
                  className={`flex-1 rounded-full py-1.5 text-xs transition ${
                    slot === k
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </section>

          <section className="mt-4">
            <label className="mb-1.5 block text-xs font-semibold text-slate-500">
              情形（可多选）
            </label>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_TAGS.map((t) => (
                <button
                  key={t}
                  onClick={() => toggle(t)}
                  className={`rounded-full px-3 py-1.5 text-xs transition ${
                    tags.includes(t)
                      ? 'bg-red-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </section>

          <section className="mt-4">
            <label className="mb-1.5 block text-xs font-semibold text-slate-500">
              补充（选填）
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="比如：邻桌 3 人抽烟，服务员经过未劝阻"
              rows={3}
              className="w-full rounded-lg border border-slate-200 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </section>

          <section className="mt-3 flex items-center justify-between rounded-lg bg-slate-50 p-2.5 text-xs">
            <label className="flex items-center gap-2 text-slate-700">
              <input
                type="checkbox"
                checked={anon}
                onChange={(e) => setAnon(e.target.checked)}
                className="h-4 w-4 rounded"
              />
              匿名提交（隐藏昵称/位置）
            </label>
          </section>

          {showComplaint && (
            <section className="mt-4">
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-500">
                  12345 规范投诉文本
                </label>
                <button
                  onClick={copy}
                  className="rounded bg-emerald-600 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-emerald-700"
                >
                  {copied ? '已复制' : '复制文本'}
                </button>
              </div>
              <pre className="max-h-52 overflow-y-auto whitespace-pre-wrap rounded-lg bg-slate-900 p-3 text-[11px] leading-relaxed text-slate-100">
                {complaint}
              </pre>
              <div className="mt-2 flex gap-2">
                <a
                  href="tel:12345"
                  className="flex-1 rounded-lg bg-slate-900 py-2 text-center text-xs font-medium text-white hover:bg-slate-800"
                >
                  📞 拨打 12345
                </a>
                <a
                  href="https://www.12345.gov.cn/"
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 rounded-lg border border-slate-300 py-2 text-center text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  🌐 网上办事
                </a>
              </div>
            </section>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 border-t border-slate-100 p-3">
          <button
            disabled={!canSubmit}
            onClick={() => setShowComplaint((s) => !s)}
            className="rounded-lg border border-slate-300 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {showComplaint ? '收起投诉文本' : '生成 12345 文本'}
          </button>
          <button
            disabled={!canSubmit}
            onClick={() => onSubmit({ venueId: venue.id, tags, note, slot, anon })}
            className="rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            提交举报
          </button>
        </div>
      </div>
    </div>
  )
}
