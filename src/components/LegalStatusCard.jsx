const STATUS_META = {
  safe: {
    label: '合法流通',
    accent: 'text-emerald-300 border-emerald-500/40 bg-emerald-500/5',
    icon: '✓',
  },
  restricted: {
    label: '受限 · 注意',
    accent: 'text-amber-300 border-amber-500/40 bg-amber-500/5',
    icon: '⚠',
  },
  prohibited: {
    label: '禁止交易',
    accent: 'text-rose-300 border-rose-500/40 bg-rose-500/5',
    icon: '✕',
  },
}

export default function LegalStatusCard({ status }) {
  if (!status) return null
  const meta = STATUS_META[status.commerce] || STATUS_META.safe

  return (
    <div className={`mt-4 mx-5 rounded-md border px-3 py-2 ${meta.accent}`}>
      <div className="flex items-center gap-2 text-xs font-medium">
        <span className="text-base leading-none">{meta.icon}</span>
        <span>{meta.label}</span>
        {status.required_cert?.length > 0 && (
          <span className="ml-auto text-[10px] tracking-widest text-stone-400">
            需 {status.required_cert.join(' / ')} 证书
          </span>
        )}
      </div>
      {status.notes && (
        <p className="mt-1.5 text-xs text-stone-400 leading-relaxed">
          {status.notes}
        </p>
      )}
    </div>
  )
}
