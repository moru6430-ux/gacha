import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'

export default function AuthModal({ open, onClose, defaultMode = 'signin' }) {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState(defaultMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState(null)
  const [info, setInfo] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setMode(defaultMode)
      setError(null)
      setInfo(null)
    }
  }, [open, defaultMode])

  if (!open) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setSubmitting(true)
    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password)
        if (error) throw error
        onClose()
      } else {
        const { data, error } = await signUp(email, password, displayName)
        if (error) throw error
        if (data?.user && !data.session) {
          setInfo('注册成功，请到邮箱完成验证后再登录。')
        } else {
          onClose()
        }
      }
    } catch (err) {
      setError(err.message || String(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-ink-900 border border-ink-700 rounded-lg shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-serif text-amber-glow">
            {mode === 'signin' ? '登录' : '注册'}
          </h2>
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

        <div className="flex gap-2 mb-4 text-xs">
          <button
            type="button"
            onClick={() => setMode('signin')}
            className={
              'px-3 py-1 rounded-full transition-colors ' +
              (mode === 'signin'
                ? 'bg-amber-glow/15 text-amber-glow border border-amber-glow/40'
                : 'text-stone-500 hover:text-stone-300')
            }
          >
            已有账户
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={
              'px-3 py-1 rounded-full transition-colors ' +
              (mode === 'signup'
                ? 'bg-amber-glow/15 text-amber-glow border border-amber-glow/40'
                : 'text-stone-500 hover:text-stone-300')
            }
          >
            注册新账户
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs text-stone-400 mb-1">昵称（可选）</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-ink-800 border border-ink-700 rounded-md px-3 py-2 text-sm text-stone-200 focus:outline-none focus:border-amber-glow/60"
                autoComplete="nickname"
                maxLength={40}
              />
            </div>
          )}
          <div>
            <label className="block text-xs text-stone-400 mb-1">邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-ink-800 border border-ink-700 rounded-md px-3 py-2 text-sm text-stone-200 focus:outline-none focus:border-amber-glow/60"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block text-xs text-stone-400 mb-1">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-ink-800 border border-ink-700 rounded-md px-3 py-2 text-sm text-stone-200 focus:outline-none focus:border-amber-glow/60"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            />
          </div>

          {error && (
            <div className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded px-3 py-2">
              {error}
            </div>
          )}
          {info && (
            <div className="text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded px-3 py-2">
              {info}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-amber-glow/20 hover:bg-amber-glow/30 disabled:opacity-50 border border-amber-glow/50 text-amber-glow rounded-md py-2 text-sm font-medium transition-colors"
          >
            {submitting ? '处理中…' : mode === 'signin' ? '登录' : '注册'}
          </button>
        </form>
      </div>
    </div>
  )
}
