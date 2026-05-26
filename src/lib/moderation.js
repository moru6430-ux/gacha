import { supabase } from './supabase.js'

// Cache rules per session — they change rarely
let cache = null

export async function getModerationRules() {
  if (cache) return cache
  const [{ data: keywords }, { data: restricted }] = await Promise.all([
    supabase.from('prohibited_keywords').select('*'),
    supabase.from('restricted_categories').select('*'),
  ])
  cache = {
    keywords: keywords || [],
    restricted: Object.fromEntries((restricted || []).map((r) => [r.category, r])),
  }
  return cache
}

// Scan a text for keyword hits. Returns array of { keyword, severity, reason, category }.
export function scanKeywords(text, keywords) {
  if (!text) return []
  const t = text.toLowerCase()
  const hits = []
  const seen = new Set()
  for (const kw of keywords) {
    if (seen.has(kw.keyword)) continue
    if (t.includes(kw.keyword.toLowerCase())) {
      hits.push(kw)
      seen.add(kw.keyword)
    }
  }
  return hits
}

// High-level helper used by the publish form.
// Returns: { ok, blockedHits, warnHits, needsCert, restrictedRule }
export function evaluateListing({ title, description, mineralName, category }, rules) {
  const combined = [title, description, mineralName].filter(Boolean).join(' \n ')
  const hits = scanKeywords(combined, rules.keywords)
  const blockedHits = hits.filter((h) => h.severity === 'block')
  const warnHits = hits.filter((h) => h.severity === 'warn')
  const restrictedRule = category ? rules.restricted[category] : null
  return {
    ok: blockedHits.length === 0,
    blockedHits,
    warnHits,
    needsCert: !!restrictedRule?.requires_cert,
    restrictedRule,
  }
}
