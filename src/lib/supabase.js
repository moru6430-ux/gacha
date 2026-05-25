import { createClient } from '@supabase/supabase-js'

// 默认值是 mineral-atlas 项目的 publishable key（设计上可公开，配合 RLS 使用）。
// 通过 .env 覆盖以连接其他环境。
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://xmejqnlituqhrvielcgu.supabase.co'

const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_ev32698PirTFiNJQWRVq0g_GcwmLfZT'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
