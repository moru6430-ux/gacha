// 意象 / 象征主题：跨矿物的"故事维度"
// 用来给 114 条矿物打标签，让浏览能按"和月亮相关的"/"和爱有关的"组织
//
// 设计原则：
// 1. 只标真正在故事里出现的意象，不强行赋值
// 2. "modern"（现代发现）是诚实标签——给那些没有古神话的新矿（1900+）用
// 3. 每条矿物可有 0-3 个意象；0 个的会出现在"待补强"清单里

export const THEMES = [
  { key: 'sun',          emoji: '☀️',  label: '太阳',         desc: '太阳神 / 金色 / 光明的化身' },
  { key: 'moon',          emoji: '🌙',  label: '月亮',         desc: '月神 / 月光 / 夜晚' },
  { key: 'stars',         emoji: '⭐',  label: '星辰',         desc: '星光效应 / 极光 / 天空之石' },
  { key: 'sea',           emoji: '🌊',  label: '海与水',       desc: '海神 / 水的化身 / 海洋生物' },
  { key: 'fire',          emoji: '🔥',  label: '火',           desc: '火神 / 红色火彩 / 燃烧' },
  { key: 'flora',         emoji: '🌳',  label: '草木',         desc: '植物意象 / 花园 / 生命之木' },
  { key: 'love',          emoji: '❤️',  label: '爱与美',       desc: '爱神 / 婚约 / 美的化身' },
  { key: 'war',           emoji: '⚔️',  label: '战争勇气',     desc: '战士 / 护身上战场 / 武器' },
  { key: 'sovereignty',   emoji: '👑',  label: '王权',         desc: '皇室 / 国玺 / 加冕' },
  { key: 'blood',         emoji: '🩸',  label: '血与殉道',     desc: '神之血 / 殉道者 / 红色源神话' },
  { key: 'astrology',     emoji: '🔮',  label: '占星',         desc: '九曜 / 行星石 / 命盘' },
  { key: 'protection',    emoji: '🛡️',  label: '守护护身',     desc: '护身符 / 辟邪 / 印章' },
  { key: 'mourning',      emoji: '⚱️',  label: '哀悼丧葬',     desc: '丧礼用石 / 殡葬 / 怀念' },
  { key: 'rebirth',       emoji: '🌅',  label: '重生',         desc: 'Isis / 凤凰 / 来世信仰' },
  { key: 'wine',          emoji: '🍷',  label: '酒神狂欢',     desc: 'Dionysus / 醉与醒' },
  { key: 'creature',      emoji: '🐉',  label: '神兽精灵',     desc: '龙 / 蛇 / 鸟 / 精怪' },
  { key: 'mine_lore',     emoji: '⛏️',  label: '矿场传奇',     desc: '发现现场 / 矿工传说 / 矿主故事' },
  { key: 'modern',        emoji: '🔬',  label: '现代发现',     desc: '1900 年后的科学发现，无古神话（诚实标签）' },
]

export const THEME_MAP = Object.fromEntries(THEMES.map((t) => [t.key, t]))

export function themeLabel(key) {
  return THEME_MAP[key]?.label ?? key
}
export function themeEmoji(key) {
  return THEME_MAP[key]?.emoji ?? '•'
}
