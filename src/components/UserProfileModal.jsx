import { useEffect, useState } from 'react'
import { useUserProfile } from '../hooks/useUserProfile.js'
import { useAuth } from '../hooks/useAuth.jsx'
import { supabase } from '../lib/supabase.js'
import { categoryColor, categoryLabel } from '../data/categories.js'
import ListingCard from './ListingCard.jsx'

function formatJoinDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export default function UserProfileModal({
  open,
  onClose,
  userId,
  minerals,
  onSelectMineral,
  cartIds,
  onToggleCart,
  favoriteListingIds,
  onToggleListingFavorite,
  canCart,
}) {
  const { user } = useAuth()
  const [reloadToken, setReloadToken] = useState(0)
  const { profile, listings, favoriteMineralIds, loading, error } = useUserProfile(
    open ? userId : null,
    reloadToken,
  )
  const isOwn = user && profile && user.id === profile.id
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    if (!open) return
    function onKey(e) {
      if (e.key === 'Escape') {
        if (editing) setEditing(false)
        else onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, editing, onClose])

  if (!open) return null

  const favorited = (minerals || []).filter((m) => favoriteMineralIds.includes(m.id))

  return (
    <div
      className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-ink-900 border border-ink-700 rounded-lg shadow-2xl w-full max-w-3xl max-h-[88vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="px-6 pt-5 pb-4 border-b border-ink-700 flex items-start justify-between">
          {loading ? (
            <div className="text-sm text-stone-500">读取档案…</div>
          ) : error ? (
            <div className="text-sm text-rose-400">读取失败：{error}</div>
          ) : !profile ? (
            <div className="text-sm text-stone-500">未找到该用户</div>
          ) : (
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <div className="w-14 h-14 rounded-full bg-amber-glow/20 border border-amber-glow/40 text-amber-glow flex items-center justify-center text-xl flex-shrink-0">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.display_name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  (profile.display_name || '?').charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-serif text-amber-glow">
                  {profile.display_name || '匿名用户'}
                </h2>
                {profile.bio && (
                  <p className="text-xs text-stone-400 mt-1.5 leading-relaxed whitespace-pre-wrap">
                    {profile.bio}
                  </p>
                )}
                <div className="text-[10px] text-stone-600 mt-2 flex items-center gap-3">
                  {profile.created_at && <span>{formatJoinDate(profile.created_at)} 加入</span>}
                  <span className="text-stone-700">·</span>
                  <span>{listings.length} 件在售</span>
                  {(profile.public_favorites || isOwn) && (
                    <>
                      <span className="text-stone-700">·</span>
                      <span>
                        {favorited.length} 个公开图鉴
                        {!profile.public_favorites && isOwn && (
                          <span className="text-stone-700 ml-1">(私密)</span>
                        )}
                      </span>
                    </>
                  )}
                </div>
                {isOwn && (
                  <button
                    onClick={() => setEditing((v) => !v)}
                    className="mt-3 text-[11px] px-2.5 py-1 rounded-full border border-ink-600 text-stone-400 hover:border-amber-glow/40 hover:text-amber-glow transition-colors"
                  >
                    {editing ? '取消' : '编辑资料'}
                  </button>
                )}
              </div>
            </div>
          )}
          <button
            onClick={onClose}
            className="text-stone-500 hover:text-stone-200 ml-3"
            aria-label="关闭"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto thin-scroll px-6 py-5">
          {editing && profile && (
            <ProfileEditor
              profile={profile}
              onCancel={() => setEditing(false)}
              onSaved={() => {
                setEditing(false)
                setReloadToken((t) => t + 1) // 只重拉档案，不刷整页
              }}
            />
          )}

          {!editing && profile && (
            <>
              <section className="mb-6">
                <h3 className="text-[10px] tracking-[0.25em] text-stone-500 uppercase mb-3">
                  在售 ({listings.length})
                </h3>
                {listings.length === 0 ? (
                  <p className="text-xs text-stone-600">没在售商品</p>
                ) : (
                  <div className="space-y-2">
                    {listings.map((l) => (
                      <ListingCard
                        key={l.id}
                        listing={l}
                        inCart={cartIds?.has(l.id) || false}
                        onToggleCart={onToggleCart}
                        favorited={favoriteListingIds?.has(l.id) || false}
                        onToggleFavorite={onToggleListingFavorite}
                        canCart={canCart}
                      />
                    ))}
                  </div>
                )}
              </section>

              {(profile.public_favorites || isOwn) && (
                <section>
                  <h3 className="text-[10px] tracking-[0.25em] text-stone-500 uppercase mb-3">
                    收藏的图鉴 ({favorited.length})
                    {!profile.public_favorites && isOwn && (
                      <span className="ml-2 normal-case tracking-normal text-stone-700">
                        · 仅你可见（编辑资料里开公开）
                      </span>
                    )}
                  </h3>
                  {favorited.length === 0 ? (
                    <p className="text-xs text-stone-600">还没收藏</p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {favorited.map((m) => {
                        const color = m.marker_color || categoryColor(m.category)
                        return (
                          <button
                            key={m.id}
                            onClick={() => {
                              onSelectMineral(m.id)
                              onClose()
                            }}
                            className="text-left bg-ink-800/40 border border-ink-700 rounded-md p-3 hover:border-amber-glow/40 hover:bg-ink-800 transition-colors"
                          >
                            <div className="flex items-center gap-1.5 mb-1">
                              <span
                                className="inline-block w-2 h-2 rounded-full"
                                style={{ background: color, boxShadow: `0 0 6px ${color}66` }}
                              />
                              <span className="text-[10px] text-stone-500">
                                {categoryLabel(m.category)}
                              </span>
                            </div>
                            <div className="text-sm text-stone-100 truncate">{m.name}</div>
                            <div className="text-[10px] text-stone-500 truncate mt-0.5">
                              {m.region}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function ProfileEditor({ profile, onCancel, onSaved }) {
  const [displayName, setDisplayName] = useState(profile.display_name || '')
  const [bio, setBio] = useState(profile.bio || '')
  const [publicFavs, setPublicFavs] = useState(!!profile.public_favorites)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState(null)

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setErr(null)
    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: displayName.trim() || null,
        bio: bio.trim() || null,
        public_favorites: publicFavs,
      })
      .eq('id', profile.id)
    setSaving(false)
    if (error) {
      setErr(error.message)
      return
    }
    onSaved?.()
  }

  return (
    <form onSubmit={handleSave} className="space-y-4 max-w-lg">
      <div>
        <label className="block text-[10px] tracking-widest text-stone-500 uppercase mb-1.5">
          显示名
        </label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          maxLength={40}
          className="w-full bg-ink-800/60 border border-ink-700 rounded-md px-3 py-2 text-sm text-stone-100 focus:outline-none focus:border-amber-glow/60"
        />
      </div>

      <div>
        <label className="block text-[10px] tracking-widest text-stone-500 uppercase mb-1.5">
          简介
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          maxLength={240}
          placeholder="一句话介绍你 / 关注什么矿物 / 收藏方向…"
          className="w-full bg-ink-800/60 border border-ink-700 rounded-md px-3 py-2 text-sm text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-amber-glow/60 resize-none"
        />
        <p className="text-[10px] text-stone-600 mt-1">{bio.length} / 240</p>
      </div>

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={publicFavs}
          onChange={(e) => setPublicFavs(e.target.checked)}
          className="mt-0.5 accent-amber-glow"
        />
        <div>
          <div className="text-sm text-stone-200">公开我收藏的图鉴</div>
          <div className="text-[11px] text-stone-500 mt-0.5">
            勾上后，访客在你的主页能看到你收藏了哪些矿物。市集购物车永远私密。
          </div>
        </div>
      </label>

      {err && <p className="text-xs text-rose-400">{err}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="text-xs px-4 py-2 rounded-full bg-amber-glow/20 text-amber-glow border border-amber-glow/40 hover:bg-amber-glow/30 transition-colors disabled:opacity-50"
        >
          {saving ? '保存中…' : '保存'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs px-4 py-2 rounded-full border border-ink-600 text-stone-400 hover:text-stone-200 transition-colors"
        >
          取消
        </button>
      </div>
    </form>
  )
}
