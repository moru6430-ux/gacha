import { useState } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'

function initial(user) {
  const meta = user.user_metadata || {}
  const name = meta.display_name || user.email || '?'
  return name.charAt(0).toUpperCase()
}

export default function UserMenu({
  onSignInClick,
  onMyListingsClick,
  onFavoriteListingsClick,
  onMyProfileClick,
}) {
  const { user, signOut } = useAuth()
  const [open, setOpen] = useState(false)

  if (!user) {
    return (
      <button
        onClick={onSignInClick}
        className="text-xs px-3 py-1.5 rounded-full border border-ink-700 text-stone-300 hover:border-amber-glow/50 hover:text-amber-glow transition-colors"
      >
        登录 / 注册
      </button>
    )
  }

  const name = user.user_metadata?.display_name || user.email?.split('@')[0]

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="flex items-center gap-2 text-xs text-stone-300 hover:text-stone-100 transition-colors"
      >
        <span className="w-7 h-7 rounded-full bg-amber-glow/20 border border-amber-glow/40 text-amber-glow flex items-center justify-center text-sm">
          {initial(user)}
        </span>
        <span className="hidden sm:inline">{name}</span>
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-44 bg-ink-800 border border-ink-700 rounded-md shadow-2xl py-1 z-[1500]">
          <div className="px-3 py-2 text-[11px] text-stone-500 border-b border-ink-700">
            {user.email}
          </div>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              onMyProfileClick?.()
              setOpen(false)
            }}
            className="w-full text-left px-3 py-2 text-xs text-stone-300 hover:bg-ink-700 transition-colors"
          >
            我的主页
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              onMyListingsClick?.()
              setOpen(false)
            }}
            className="w-full text-left px-3 py-2 text-xs text-stone-300 hover:bg-ink-700 transition-colors"
          >
            我的发布
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              onFavoriteListingsClick?.()
              setOpen(false)
            }}
            className="w-full text-left px-3 py-2 text-xs text-stone-300 hover:bg-ink-700 transition-colors"
          >
            收藏的商品
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={async () => {
              await signOut()
              setOpen(false)
            }}
            className="w-full text-left px-3 py-2 text-xs text-stone-300 hover:bg-ink-700 transition-colors border-t border-ink-700"
          >
            登出
          </button>
        </div>
      )}
    </div>
  )
}
