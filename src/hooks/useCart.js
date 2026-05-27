import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from './useAuth.jsx'

// 购物车：登录后才有，跨设备同步（Supabase 后端 + RLS 锁到用户自己）
// 数据只存 listing_id 引用；展示时需要的话由调用方 join listings 拉详情。
export function useCart() {
  const { user } = useAuth()
  const [items, setItems] = useState(() => new Map()) // listing_id -> { added_at, notes }
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setItems(new Map())
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    supabase
      .from('cart_items')
      .select('listing_id, added_at, notes')
      .order('added_at', { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) {
          console.warn('[cart] fetch failed', error.message)
          setLoading(false)
          return
        }
        const m = new Map()
        ;(data || []).forEach((r) => m.set(r.listing_id, { added_at: r.added_at, notes: r.notes }))
        setItems(m)
        setLoading(false)
      })
      .catch((err) => {
        if (cancelled) return
        console.warn('[cart] fetch threw', err.message)
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [user])

  const add = useCallback(
    async (listingId) => {
      if (!user) return false
      const next = new Map(items)
      next.set(listingId, { added_at: new Date().toISOString(), notes: null })
      setItems(next)
      const { error } = await supabase
        .from('cart_items')
        .insert({ user_id: user.id, listing_id: listingId })
      if (error) {
        // 回滚
        const back = new Map(items)
        back.delete(listingId)
        setItems(back)
        console.warn('[cart] add failed', error.message)
        return false
      }
      return true
    },
    [user, items],
  )

  const remove = useCallback(
    async (listingId) => {
      if (!user) return false
      const prev = items.get(listingId)
      const next = new Map(items)
      next.delete(listingId)
      setItems(next)
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)
        .eq('listing_id', listingId)
      if (error) {
        // 回滚
        if (prev) {
          const back = new Map(items)
          back.set(listingId, prev)
          setItems(back)
        }
        console.warn('[cart] remove failed', error.message)
        return false
      }
      return true
    },
    [user, items],
  )

  const toggle = useCallback(
    (listingId) => {
      if (items.has(listingId)) return remove(listingId)
      return add(listingId)
    },
    [items, add, remove],
  )

  const clear = useCallback(async () => {
    if (!user || items.size === 0) return false
    const snapshot = new Map(items)
    setItems(new Map())
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id)
    if (error) {
      setItems(snapshot)
      console.warn('[cart] clear failed', error.message)
      return false
    }
    return true
  }, [user, items])

  return {
    cartIds: items,
    count: items.size,
    loading,
    add,
    remove,
    toggle,
    clear,
    isInCart: (id) => items.has(id),
  }
}
