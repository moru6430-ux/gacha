import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'

// 拉某个矿物下的 active listings；listingsByMineral 嵌进 DetailPanel 用
export function useListings(mineralId) {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(false)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!mineralId) {
      setListings([])
      return
    }
    let cancelled = false
    setLoading(true)
    supabase
      .from('listings')
      .select('*, listing_certificates(*), seller:profiles(display_name)')
      .eq('mineral_id', mineralId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) {
          console.warn('[listings] fetch failed', error.message)
        }
        setListings(data || [])
        setLoading(false)
      })
      .catch((err) => {
        if (cancelled) return
        console.warn('[listings] fetch threw', err.message)
        setListings([])
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [mineralId, tick])

  const refresh = useCallback(() => setTick((t) => t + 1), [])

  return { listings, loading, refresh }
}
