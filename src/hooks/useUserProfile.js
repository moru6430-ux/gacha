import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'

// 抓任一用户的公开档案 + 他们 active 的 listings + （如果他们设公开）收藏的图鉴
// reloadToken 变化时强制重新拉取（用于编辑资料保存后刷新，避免整页 reload）
export function useUserProfile(userId, reloadToken = 0) {
  const [profile, setProfile] = useState(null)
  const [listings, setListings] = useState([])
  const [favoriteMineralIds, setFavoriteMineralIds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!userId) {
      setProfile(null)
      setListings([])
      setFavoriteMineralIds([])
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)

    Promise.all([
      supabase
        .from('profiles')
        .select('id, display_name, bio, avatar_url, public_favorites, created_at')
        .eq('id', userId)
        .maybeSingle(),
      supabase
        .from('listings')
        .select(
          `id, mineral_id, title, description, price_cents, currency, condition,
           images, contact_method, contact_value, status, seller_id,
           seller:profiles(id, display_name),
           listing_certificates(cert_org, cert_number)`,
        )
        .eq('seller_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false }),
      supabase.from('favorites').select('mineral_id').eq('user_id', userId),
    ])
      .then(([profRes, listRes, favRes]) => {
        if (cancelled) return
        if (profRes.error) {
          setError(profRes.error.message)
          setLoading(false)
          return
        }
        setProfile(profRes.data || null)
        setListings(listRes.data || [])
        // favRes 可能因为 RLS 返回空（如果对方没设公开）—— 这是正常的
        setFavoriteMineralIds((favRes.data || []).map((r) => r.mineral_id))
        setLoading(false)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err.message)
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [userId, reloadToken])

  return { profile, listings, favoriteMineralIds, loading, error }
}
