import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import localData from '../data/minerals.json'

// 立即以本地 JSON 渲染，待 Supabase 数据回来再替换——避免 loading 闪烁。
export function useMinerals() {
  const [minerals, setMinerals] = useState(localData)
  const [source, setSource] = useState('local')

  useEffect(() => {
    let cancelled = false
    supabase
      .from('minerals')
      .select('*')
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) {
          console.warn('[minerals] supabase fetch failed, keeping local', error.message)
          return
        }
        if (data?.length) {
          setMinerals(data)
          setSource('supabase')
        }
      })
      .catch((err) => {
        if (cancelled) return
        console.warn('[minerals] supabase fetch threw, keeping local', err.message)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { minerals, source }
}
