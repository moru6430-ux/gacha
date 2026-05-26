// 大洲元数据 + 坐标 → 大洲分类
// CONTINENT_BOUNDS 用于 flyToBounds，center 用于备用 + 入口徽章定位

export const CONTINENTS = [
  {
    id: 'asia',
    label_zh: '亚洲',
    label_en: 'ASIA',
    center: [32, 95],
    bounds: [
      [-10, 30],
      [60, 150],
    ],
    color: '#fbbf24', // amber
  },
  {
    id: 'europe',
    label_zh: '欧洲',
    label_en: 'EUROPE',
    center: [52, 18],
    bounds: [
      [36, -10],
      [70, 55],
    ],
    color: '#a78bfa', // violet
  },
  {
    id: 'africa',
    label_zh: '非洲',
    label_en: 'AFRICA',
    center: [3, 22],
    bounds: [
      [-35, -20],
      [38, 52],
    ],
    color: '#f87171', // rose
  },
  {
    id: 'north_america',
    label_zh: '北美洲',
    label_en: 'N. AMERICA',
    center: [42, -100],
    bounds: [
      [10, -160],
      [70, -55],
    ],
    color: '#60a5fa', // sky
  },
  {
    id: 'south_america',
    label_zh: '南美洲',
    label_en: 'S. AMERICA',
    center: [-15, -60],
    bounds: [
      [-55, -82],
      [13, -34],
    ],
    color: '#34d399', // emerald
  },
  {
    id: 'oceania',
    label_zh: '大洋洲',
    label_en: 'OCEANIA',
    center: [-22, 140],
    bounds: [
      [-50, 110],
      [10, 180],
    ],
    color: '#f472b6', // pink
  },
]

export const CONTINENT_MAP = Object.fromEntries(CONTINENTS.map((c) => [c.id, c]))

// 通过坐标推断大洲。每条矿物也可以显式带 continent 字段做覆盖。
// 顺序：先窄后宽，先确定的后兜底。Europe 提到 Africa 前面是为了让希腊
// 这类地中海北岸不被吞进 Africa；东边界设到 55E 把伊朗留给 Asia。
function classify(coordinates) {
  if (!coordinates) return 'asia'
  const [lat, lng] = coordinates
  if (lat <= 15 && lng >= -82 && lng <= -34) return 'south_america'
  if (lat >= 7 && lng >= -170 && lng <= -50) return 'north_america'
  if (
    (lat <= 0 && lng >= 110) ||
    (lat >= -50 && lat <= 25 && lng <= -120)
  ) {
    return 'oceania'
  }
  if (lat >= 35 && lng >= -25 && lng <= 55) return 'europe'
  if (lat >= -35 && lat <= 38 && lng >= -20 && lng <= 52) return 'africa'
  return 'asia'
}

// 返回该矿物所属的大洲数组。多数矿物一个；边界矿物（如乌拉尔横跨欧亚）
// 可以在数据里设 continent: ['europe', 'asia']，两边的入口都会计数 + 出现。
export function getContinents(coordinates, override) {
  if (Array.isArray(override) && override.length > 0) return override
  if (typeof override === 'string') return [override]
  return [classify(coordinates)]
}

// 兼容旧调用：取第一个作为主要归属
export function getContinent(coordinates, override) {
  return getContinents(coordinates, override)[0]
}

export function continentLabel(id) {
  return CONTINENT_MAP[id]?.label_zh ?? '未知'
}
