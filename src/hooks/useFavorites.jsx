import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from './useAuth.jsx'

export function useFavorites() {
  const { user } = useAuth()
  const [ids, setIds] = useState(() => new Set())
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) {
      setIds(new Set())
      return
    }
    let cancelled = false
    setLoading(true)
    supabase
      .from('favorites')
      .select('mineral_id')
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) {
          console.warn('[favorites] fetch failed', error.message)
        } else if (data) {
          setIds(new Set(data.map((r) => r.mineral_id)))
        }
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [user])

  const toggle = useCallback(
    async (mineralId) => {
      if (!user) return { ok: false, reason: 'unauthenticated' }
      const has = ids.has(mineralId)
      // optimistic
      setIds((s) => {
        const n = new Set(s)
        has ? n.delete(mineralId) : n.add(mineralId)
        return n
      })
      const op = has
        ? supabase
            .from('favorites')
            .delete()
            .eq('mineral_id', mineralId)
            .eq('user_id', user.id)
        : supabase
            .from('favorites')
            .insert({ mineral_id: mineralId, user_id: user.id })
      const { error } = await op
      if (error) {
        // revert
        setIds((s) => {
          const n = new Set(s)
          has ? n.add(mineralId) : n.delete(mineralId)
          return n
        })
        console.warn('[favorites] toggle failed', error.message)
        return { ok: false, reason: error.message }
      }
      return { ok: true, favorited: !has }
    },
    [user, ids],
  )

  return { favoriteIds: ids, loading, toggle, isFavorited: (id) => ids.has(id) }
}
