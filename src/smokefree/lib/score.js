// 绿→深红 sequential palette，专门为二手烟浓度设计
// 0-19 全绿 · 20-39 黄绿 · 40-59 橙 · 60-79 深橙 · 80-100 深红
const STEPS = [
  { max: 19, color: '#16a34a', ring: '#166534', label: '完全无烟', tone: 'text-emerald-700 bg-emerald-50 ring-emerald-200' },
  { max: 39, color: '#84cc16', ring: '#4d7c0f', label: '基本无烟', tone: 'text-lime-700 bg-lime-50 ring-lime-200' },
  { max: 59, color: '#f59e0b', ring: '#b45309', label: '偶有烟味', tone: 'text-amber-700 bg-amber-50 ring-amber-200' },
  { max: 79, color: '#ea580c', ring: '#9a3412', label: '烟味明显', tone: 'text-orange-700 bg-orange-50 ring-orange-200' },
  { max: 100, color: '#b91c1c', ring: '#7f1d1d', label: '烟味浓重', tone: 'text-red-700 bg-red-50 ring-red-200' },
]

export function scoreBand(score) {
  return STEPS.find((s) => score <= s.max) || STEPS[STEPS.length - 1]
}

export function scoreColor(score) {
  return scoreBand(score).color
}

export function scoreLabel(score) {
  return scoreBand(score).label
}

export function scoreTone(score) {
  return scoreBand(score).tone
}

// policy → 中文标签
export const POLICY_LABEL = {
  none: '完全无烟',
  zoned: '有独立烟区',
  outdoor: '户外可抽',
  lax: '室内允许',
  unknown: '未标注',
}

// 认证等级
export const CERT_META = {
  official: { label: '官方认证', tone: 'bg-emerald-600 text-white' },
  owner: { label: '商家自证', tone: 'bg-sky-600 text-white' },
  crowd: { label: '用户众包', tone: 'bg-slate-500 text-white' },
  none: { label: '未认证', tone: 'bg-slate-200 text-slate-600' },
}

// 时段标签
export const SLOT_LABEL = { lunch: '午餐', tea: '下午茶', dinner: '晚餐' }

// 图例梯度色（用于 legend bar）
export const LEGEND_STOPS = STEPS
