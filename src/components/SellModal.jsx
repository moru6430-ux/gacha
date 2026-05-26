import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../hooks/useAuth.jsx'
import { getModerationRules, evaluateListing } from '../lib/moderation.js'

const CONDITIONS = [
  { value: 'new', label: '全新' },
  { value: 'used', label: '二手' },
  { value: 'vintage', label: 'Vintage' },
  { value: 'antique', label: '古董' },
]

const CONTACT_METHODS = [
  { value: 'email', label: '邮箱' },
  { value: 'wechat', label: '微信号' },
  { value: 'other', label: '其他' },
]

export default function SellModal({ open, onClose, minerals, defaultMineralId, onPublished }) {
  const { user } = useAuth()

  const [mineralId, setMineralId] = useState(defaultMineralId || '')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [currency] = useState('CNY')
  const [condition, setCondition] = useState('used')
  const [contactMethod, setContactMethod] = useState('email')
  const [contactValue, setContactValue] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [uploadedImageUrl, setUploadedImageUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const [certOrg, setCertOrg] = useState('NGTC')
  const [certNumber, setCertNumber] = useState('')
  const [certImageUrl, setCertImageUrl] = useState('')

  const [rules, setRules] = useState(null)
  const [error, setError] = useState(null)
  const [warnings, setWarnings] = useState([])
  const [info, setInfo] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setMineralId(defaultMineralId || '')
      setTitle('')
      setDescription('')
      setPrice('')
      setCondition('used')
      setContactMethod('email')
      setContactValue(user?.email || '')
      setImageUrl('')
      setUploadedImageUrl('')
      setUploading(false)
      setUploadError(null)
      setCertOrg('NGTC')
      setCertNumber('')
      setCertImageUrl('')
      setError(null)
      setWarnings([])
      setInfo(null)
      getModerationRules().then(setRules).catch(() => setRules({ keywords: [], restricted: {} }))
    }
  }, [open, defaultMineralId, user])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const mineral = minerals.find((m) => m.id === mineralId) || null
  const category = mineral?.category || null
  const evaluation = useMemo(() => {
    if (!rules) return null
    return evaluateListing(
      { title, description, mineralName: mineral?.name, category },
      rules,
    )
  }, [rules, title, description, mineral, category])

  if (!open) return null

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!user) {
      setUploadError('请先登录')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('图片不能超过 5 MB')
      return
    }
    setUploadError(null)
    setUploading(true)
    try {
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`
      const { error: upErr } = await supabase.storage
        .from('listing-images')
        .upload(path, file, { contentType: file.type, upsert: false })
      if (upErr) throw upErr
      const { data } = supabase.storage.from('listing-images').getPublicUrl(path)
      setUploadedImageUrl(data.publicUrl)
    } catch (err) {
      setUploadError(err.message || String(err))
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setWarnings([])

    if (!user) {
      setError('请先登录')
      return
    }
    if (!mineralId) {
      setError('请选择关联的矿物')
      return
    }
    if (!title.trim()) {
      setError('标题不能为空')
      return
    }
    if (!contactValue.trim()) {
      setError('请填写联系方式')
      return
    }

    const cents = Math.round(parseFloat(price) * 100)
    if (!Number.isFinite(cents) || cents < 0) {
      setError('价格不对')
      return
    }

    const ev = evaluation
    if (ev?.blockedHits.length) {
      setError(
        `不能上架——命中禁售：「${ev.blockedHits.map((h) => h.keyword).join('、')}」。${ev.blockedHits[0].reason}`,
      )
      return
    }

    const needsCert = ev?.needsCert
    if (needsCert && !certNumber.trim()) {
      setError(
        `${mineral?.name} 属限售品类，必须填写 ${ev.restrictedRule.requires_org?.join(' / ') || ''} 证书编号才能上架`,
      )
      return
    }

    setSubmitting(true)
    try {
      const moderation_flags = (ev?.warnHits || []).map((h) => ({
        keyword: h.keyword,
        category: h.category,
        reason: h.reason,
      }))
      const status = ev?.warnHits.length ? 'pending' : 'active'

      const finalImageUrl = uploadedImageUrl || imageUrl.trim()
      const { data: inserted, error: insErr } = await supabase
        .from('listings')
        .insert({
          seller_id: user.id,
          mineral_id: mineralId,
          category,
          title: title.trim(),
          description: description.trim(),
          price_cents: cents,
          currency,
          condition,
          images: finalImageUrl ? [finalImageUrl] : [],
          contact_method: contactMethod,
          contact_value: contactValue.trim(),
          moderation_flags,
          status,
        })
        .select('id')
        .single()

      if (insErr) throw insErr

      if (needsCert && inserted) {
        const { error: certErr } = await supabase.from('listing_certificates').insert({
          listing_id: inserted.id,
          cert_org: certOrg,
          cert_number: certNumber.trim(),
          cert_image_url: certImageUrl.trim() || null,
        })
        if (certErr) throw certErr
      }

      if (status === 'pending') {
        setInfo(
          `已提交，但描述里含警示词（${ev.warnHits.map((h) => h.keyword).join('、')}），需要人工审核后才公开显示。`,
        )
        setWarnings(ev.warnHits)
      } else {
        setInfo('已上架！')
      }

      onPublished?.(inserted?.id)
      // close after a brief delay if active
      if (status === 'active') {
        setTimeout(() => onClose(), 800)
      }
    } catch (err) {
      setError(err.message || String(err))
    } finally {
      setSubmitting(false)
    }
  }

  const liveWarnings = evaluation?.warnHits || []
  const liveBlocks = evaluation?.blockedHits || []

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg my-8 bg-ink-900 border border-ink-700 rounded-lg shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-serif text-amber-glow">挂一件 · 发布商品</h2>
            <p className="text-[11px] text-stone-500 mt-0.5">
              二手 / 收藏 / 原创首饰皆可。涉及保护物种、化石、文物的物品禁止上架。
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-stone-500 hover:text-stone-200"
            aria-label="关闭"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Field label="关联矿物 *">
            <select
              value={mineralId}
              onChange={(e) => setMineralId(e.target.value)}
              className="w-full bg-ink-800 border border-ink-700 rounded-md px-3 py-2 text-sm text-stone-200 focus:outline-none focus:border-amber-glow/60"
              required
            >
              <option value="">— 选一个 —</option>
              {minerals.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} · {m.region}
                </option>
              ))}
            </select>
          </Field>

          <Field label="标题 *">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={80}
              className="w-full bg-ink-800 border border-ink-700 rounded-md px-3 py-2 text-sm text-stone-200 focus:outline-none focus:border-amber-glow/60"
              required
            />
          </Field>

          <Field label="描述">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={1000}
              rows={4}
              className="w-full bg-ink-800 border border-ink-700 rounded-md px-3 py-2 text-sm text-stone-200 focus:outline-none focus:border-amber-glow/60 resize-none"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="价格 (CNY) *">
              <input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-ink-800 border border-ink-700 rounded-md px-3 py-2 text-sm text-stone-200 focus:outline-none focus:border-amber-glow/60"
                required
              />
            </Field>
            <Field label="成色">
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full bg-ink-800 border border-ink-700 rounded-md px-3 py-2 text-sm text-stone-200 focus:outline-none focus:border-amber-glow/60"
              >
                {CONDITIONS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="图片">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleFile}
                  disabled={uploading}
                  className="text-xs text-stone-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border file:border-ink-700 file:bg-ink-800 file:text-stone-300 file:text-xs hover:file:bg-ink-700 disabled:opacity-50"
                />
                {uploading && <span className="text-xs text-stone-500">上传中…</span>}
                {uploadedImageUrl && !uploading && (
                  <button
                    type="button"
                    onClick={() => setUploadedImageUrl('')}
                    className="text-[11px] text-stone-500 hover:text-rose-300"
                  >
                    移除
                  </button>
                )}
              </div>
              {uploadedImageUrl && (
                <img
                  src={uploadedImageUrl}
                  alt="preview"
                  className="w-24 h-24 object-cover rounded border border-ink-700"
                />
              )}
              {uploadError && (
                <p className="text-xs text-rose-300">{uploadError}</p>
              )}
              {!uploadedImageUrl && (
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="或贴一个外链 URL（如 Wikimedia Commons）"
                  className="w-full bg-ink-800 border border-ink-700 rounded-md px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-amber-glow/60"
                />
              )}
            </div>
          </Field>

          <div className="grid grid-cols-3 gap-3">
            <Field label="联系方式">
              <select
                value={contactMethod}
                onChange={(e) => setContactMethod(e.target.value)}
                className="w-full bg-ink-800 border border-ink-700 rounded-md px-3 py-2 text-sm text-stone-200 focus:outline-none focus:border-amber-glow/60"
              >
                {CONTACT_METHODS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </Field>
            <div className="col-span-2">
              <Field label="账号 / 邮箱 *">
                <input
                  type="text"
                  value={contactValue}
                  onChange={(e) => setContactValue(e.target.value)}
                  className="w-full bg-ink-800 border border-ink-700 rounded-md px-3 py-2 text-sm text-stone-200 focus:outline-none focus:border-amber-glow/60"
                  required
                />
              </Field>
            </div>
          </div>

          {evaluation?.needsCert && (
            <div className="rounded-md border border-amber-glow/40 bg-amber-glow/5 p-3 space-y-3">
              <p className="text-xs text-amber-glow">
                ⚠ {mineral?.name} 属限售品类，必须填写
                <strong> {evaluation.restrictedRule.requires_org?.join(' / ')} </strong>
                证书信息才能上架（{evaluation.restrictedRule.notes}）。
              </p>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={certOrg}
                  onChange={(e) => setCertOrg(e.target.value)}
                  className="bg-ink-800 border border-ink-700 rounded-md px-2 py-1.5 text-xs text-stone-200"
                >
                  {(evaluation.restrictedRule.requires_org || ['NGTC']).map((org) => (
                    <option key={org} value={org}>{org}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={certNumber}
                  onChange={(e) => setCertNumber(e.target.value)}
                  placeholder="证书编号"
                  className="bg-ink-800 border border-ink-700 rounded-md px-2 py-1.5 text-xs text-stone-200"
                />
              </div>
              <input
                type="url"
                value={certImageUrl}
                onChange={(e) => setCertImageUrl(e.target.value)}
                placeholder="证书扫描图 URL（可选）"
                className="w-full bg-ink-800 border border-ink-700 rounded-md px-2 py-1.5 text-xs text-stone-200"
              />
            </div>
          )}

          {liveBlocks.length > 0 && (
            <div className="rounded-md border border-rose-500/40 bg-rose-500/5 p-3 text-xs text-rose-300">
              <p className="font-medium mb-1">⛔ 不能上架</p>
              {liveBlocks.map((h, i) => (
                <p key={i}>「{h.keyword}」: {h.reason}</p>
              ))}
            </div>
          )}

          {liveWarnings.length > 0 && (
            <div className="rounded-md border border-amber-glow/40 bg-amber-glow/5 p-3 text-xs text-amber-glow">
              <p className="font-medium mb-1">⚠ 含警示词，提交后需人工审核：</p>
              {liveWarnings.map((h, i) => (
                <p key={i}>「{h.keyword}」: {h.reason}</p>
              ))}
            </div>
          )}

          {error && (
            <div className="rounded-md border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-300">
              {error}
            </div>
          )}
          {info && (
            <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs text-emerald-300">
              {info}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || liveBlocks.length > 0}
            className="w-full bg-amber-glow/20 hover:bg-amber-glow/30 disabled:opacity-40 disabled:cursor-not-allowed border border-amber-glow/50 text-amber-glow rounded-md py-2 text-sm font-medium transition-colors"
          >
            {submitting ? '提交中…' : '挂上市集'}
          </button>
        </form>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs text-stone-400 mb-1">{label}</span>
      {children}
    </label>
  )
}
