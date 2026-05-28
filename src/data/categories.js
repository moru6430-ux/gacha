// 矿物大类枚举：同时用于地图标记上色、筛选条、市集分类
// 配色在暗色底图（CARTO Dark Matter）上选过，整体偏柔和不刺眼
export const CATEGORIES = [
  { key: 'pearl', label: '珍珠', color: '#e7e5e4' },
  { key: 'ruby', label: '红宝石', color: '#fb7185' },
  { key: 'sapphire', label: '蓝宝石', color: '#60a5fa' },
  { key: 'emerald', label: '祖母绿', color: '#34d399' },
  { key: 'jade', label: '翡翠', color: '#a3e635' },
  { key: 'nephrite', label: '和田玉', color: '#e4e4d0' },
  { key: 'lapis', label: '青金石', color: '#818cf8' },
  { key: 'turquoise', label: '绿松石', color: '#22d3ee' },
  { key: 'amber', label: '琥珀', color: '#fbbf24' },
  { key: 'opal', label: '欧泊', color: '#c4b5fd' },
  { key: 'quartz', label: '水晶', color: '#cbd5e1' },
  { key: 'tourmaline', label: '碧玺', color: '#f472b6' },
  { key: 'topaz', label: '托帕石', color: '#fcd34d' },
  { key: 'malachite', label: '孔雀石', color: '#16a34a' },
  { key: 'moonstone', label: '月光石', color: '#bae6fd' },
  { key: 'agate', label: '玛瑙', color: '#c2410c' },
  { key: 'diamond', label: '钻石', color: '#f0f4ff' },
  { key: 'amethyst', label: '紫水晶', color: '#a855f7' },
  { key: 'garnet', label: '石榴石', color: '#dc2626' },
  { key: 'beryl', label: '绿柱石', color: '#5bc0be' },
  { key: 'peridot', label: '橄榄石', color: '#9bc94c' },
  { key: 'spinel', label: '尖晶石', color: '#e0506a' },
  { key: 'other', label: '其他', color: '#f5c97a' },
]

export const CATEGORY_MAP = Object.fromEntries(
  CATEGORIES.map((c) => [c.key, c]),
)

export function categoryColor(key) {
  return CATEGORY_MAP[key]?.color || CATEGORY_MAP.other.color
}

export function categoryLabel(key) {
  return CATEGORY_MAP[key]?.label || '其他'
}
