import { useAuth } from '../hooks/useAuth.jsx'

export default function FavoriteButton({ mineralId, favorited, onToggle, onRequireAuth }) {
  const { user } = useAuth()

  const handleClick = () => {
    if (!user) {
      onRequireAuth?.()
      return
    }
    onToggle?.(mineralId)
  }

  return (
    <button
      onClick={handleClick}
      title={favorited ? '取消收藏' : '加入我的图鉴'}
      className={
        'inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border transition-colors ' +
        (favorited
          ? 'border-rose-400/50 bg-rose-400/10 text-rose-300'
          : 'border-ink-700 text-stone-400 hover:text-rose-300 hover:border-rose-400/40')
      }
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill={favorited ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
      >
        <path
          d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>{favorited ? '已收藏' : '收藏'}</span>
    </button>
  )
}
