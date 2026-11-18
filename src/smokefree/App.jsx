import { useMemo, useState } from 'react'
import SmokeMap from './components/SmokeMap.jsx'
import FilterBar from './components/FilterBar.jsx'
import VenueList from './components/VenueList.jsx'
import VenueDetail from './components/VenueDetail.jsx'
import ReportModal from './components/ReportModal.jsx'
import { VENUES } from './data/venues.js'
import { useReports } from './hooks/useReports.js'

export default function App() {
  const [query, setQuery] = useState('')
  const [policy, setPolicy] = useState('all')
  const [tag, setTag] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const [reportingVenue, setReportingVenue] = useState(null)
  const [toast, setToast] = useState(null)
  const { reports, submit } = useReports()

  // 举报数叠加到基础 reports7d（本地举报即时反映）
  const enriched = useMemo(() => {
    const counts = reports.reduce((acc, r) => {
      acc[r.venueId] = (acc[r.venueId] || 0) + 1
      return acc
    }, {})
    return VENUES.map((v) => ({
      ...v,
      reports7d: v.reports7d + (counts[v.id] || 0),
    }))
  }, [reports])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return enriched.filter((v) => {
      if (policy !== 'all' && v.policy !== policy) return false
      if (tag && !v.tags.includes(tag)) return false
      if (!q) return true
      return (
        v.name.toLowerCase().includes(q) ||
        v.area.toLowerCase().includes(q) ||
        v.cuisine.toLowerCase().includes(q)
      )
    })
  }, [enriched, query, policy, tag])

  const selected = useMemo(
    () => enriched.find((v) => v.id === selectedId) || null,
    [enriched, selectedId],
  )

  // 同商圈的绿色替代（政策为完全无烟，且不是自己）
  const alternatives = useMemo(() => {
    if (!selected) return []
    return enriched
      .filter(
        (v) =>
          v.id !== selected.id &&
          v.area === selected.area &&
          v.policy === 'none',
      )
      .sort((a, b) => a.smokeScore - b.smokeScore)
      .slice(0, 3)
  }, [enriched, selected])

  const stats = useMemo(() => {
    const total = enriched.length
    const green = enriched.filter((v) => v.smokeScore < 20).length
    return { total, green, greenPct: Math.round((green / total) * 100) }
  }, [enriched])

  const handleSubmit = (payload) => {
    submit(payload)
    setReportingVenue(null)
    setToast('举报已记录，将参与地图评级更新')
    setTimeout(() => setToast(null), 2500)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow">
              <span className="text-lg">🌿</span>
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900">
                清风 · 无烟餐厅地图
              </h1>
              <p className="text-[11px] text-slate-500">
                {stats.total} 家 · 完全无烟 {stats.green} 家（{stats.greenPct}%）
              </p>
            </div>
          </div>
          <a
            href="/"
            className="hidden text-xs text-slate-500 hover:text-slate-800 sm:block"
          >
            ← 返回主站
          </a>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-3 p-3 lg:grid-cols-[320px_1fr_360px]">
        <section className="space-y-3 lg:h-[calc(100vh-92px)] lg:overflow-y-auto lg:pr-1">
          <FilterBar
            query={query}
            onQuery={setQuery}
            policy={policy}
            onPolicy={setPolicy}
            tag={tag}
            onTag={setTag}
          />
          <VenueList
            venues={filtered}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </section>

        <section className="h-[50vh] lg:h-[calc(100vh-92px)]">
          <SmokeMap
            venues={filtered}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </section>

        <section className="h-[60vh] lg:h-[calc(100vh-92px)]">
          {selected ? (
            <VenueDetail
              venue={selected}
              alternatives={alternatives}
              onSelectAlt={setSelectedId}
              onReport={setReportingVenue}
              onClose={() => setSelectedId(null)}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center">
              <div className="text-3xl">🍃</div>
              <h3 className="mt-2 text-sm font-semibold text-slate-700">
                在地图或列表选一家餐厅
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                查看时段烟情、区域细分、举报直达
              </p>
            </div>
          )}
        </section>
      </main>

      {reportingVenue && (
        <ReportModal
          venue={reportingVenue}
          onClose={() => setReportingVenue(null)}
          onSubmit={handleSubmit}
        />
      )}

      {toast && (
        <div className="fixed inset-x-0 bottom-6 z-[1100] flex justify-center px-3">
          <div className="rounded-full bg-slate-900 px-4 py-2 text-xs font-medium text-white shadow-lg">
            {toast}
          </div>
        </div>
      )}
    </div>
  )
}
