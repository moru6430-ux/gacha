import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from './useAuth.jsx'

// 拉当前用户名下所有 listing（任何状态），用于「我的发布」面板
export function useUserListings() {
  const { user } = useAuth()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(false)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!user) {
      setListings([])
      return
    }
    let cancelled = false
    setLoading(true)
    supabase
      .from('listings')
      .select('*, listing_certificates(*), mineral:minerals(name)')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) console.warn('[user listings] fetch failed', error.message)
        setListings(data || [])
        setLoading(false)
      })
      .catch((err) => {
        if (cancelled) return
        console.warn('[user listings] fetch threw', err.message)
        setListings([])
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [user, tick])

  const refresh = useCallback(() => setTick((t) => t + 1), [])

  const setStatus = useCallback(
    async (id, status) => {
      const { error } = await supabase
        .from('listings')
        .update({ status })
        .eq('id', id)
      if (error) {
        console.warn('[user listings] setStatus failed', error.message)
        return { ok: false, reason: error.message }
      }
      // optimistic update
      setListings((ls) => ls.map((l) => (l.id === id ? { ...l, status } : l)))
      return { ok: true }
    },
    [],
  )

  return { listings, loading, refresh, setStatus }
}
