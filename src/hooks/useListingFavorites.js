import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from './useAuth.jsx'

// 商品收藏夹：跟"想买的"购物车并行存在，但语义不同——
// 收藏 = 想留着以后看，不一定买；购物车 = 准备联系卖家。
export function useListingFavorites() {
  const { user } = useAuth()
  const [ids, setIds] = useState(() => new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setIds(new Set())
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    supabase
      .from('listing_favorites')
      .select('listing_id')
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) {
          console.warn('[listing_favorites] fetch failed', error.message)
          setLoading(false)
          return
        }
        setIds(new Set((data || []).map((r) => r.listing_id)))
        setLoading(false)
      })
      .catch((err) => {
        if (cancelled) return
        console.warn('[listing_favorites] threw', err.message)
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [user])

  const toggle = useCallback(
    async (listingId) => {
      if (!user) return false
      const snapshot = new Set(ids)
      const next = new Set(ids)
      if (next.has(listingId)) {
        next.delete(listingId)
        setIds(next)
        const { error } = await supabase
          .from('listing_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('listing_id', listingId)
        if (error) {
          setIds(snapshot)
          console.warn('[listing_favorites] remove failed', error.message)
          return false
        }
      } else {
        next.add(listingId)
        setIds(next)
        const { error } = await supabase
          .from('listing_favorites')
          .insert({ user_id: user.id, listing_id: listingId })
        if (error) {
          setIds(snapshot)
          console.warn('[listing_favorites] add failed', error.message)
          return false
        }
      }
      return true
    },
    [user, ids],
  )

  return {
    favoriteListingIds: ids,
    count: ids.size,
    loading,
    toggle,
    isFavorited: (id) => ids.has(id),
  }
}
