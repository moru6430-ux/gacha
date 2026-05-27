// 联盟分成：用户在外部市场买东西，咱们抽佣金。零牌照、零库存、零客服。
// 所有 affiliate ID 都从 env 读，没配就走纯搜索 URL（用户能用、但咱们拿不到佣金）。
//
// 申请联盟账号的入口（用户起量后再申请）：
//   · Etsy:   https://www.awin.com/  (Etsy 走 Awin，搜 Etsy ID 6220)
//   · eBay:   https://partnernetwork.ebay.com/
//   · 淘宝:    https://pub.alimama.com/  (淘宝客 PID)
//   · 1688:    同上（阿里妈妈）
//   · Amazon: https://affiliate-program.amazon.com/

function encode(q) {
  return encodeURIComponent(q || '')
}

const ETSY_AFFID = import.meta.env.VITE_ETSY_AFFID || ''
const EBAY_CAMPID = import.meta.env.VITE_EBAY_CAMPID || ''
const TAOBAO_PID = import.meta.env.VITE_TAOBAO_PID || ''

// 输入英文名给国际平台、中文名给国内平台——更容易匹配商品
export const PLATFORMS = [
  {
    id: 'etsy',
    label: 'Etsy',
    note: '国际手作 / 标本',
    build: (mineral) => {
      const q = encode(mineral.name_en || mineral.name)
      const base = `https://www.etsy.com/search?q=${q}`
      // Etsy 联盟通过 Awin，最终 URL 是 awin1.com/cread.php?...&p=ENCODED_TARGET
      if (ETSY_AFFID) {
        return `https://www.awin1.com/cread.php?awinmid=6220&awinaffid=${ETSY_AFFID}&p=${encode(base)}`
      }
      return base
    },
  },
  {
    id: 'ebay',
    label: 'eBay',
    note: '国际拍卖 / 老料',
    build: (mineral) => {
      const q = encode(mineral.name_en || mineral.name)
      const base = `https://www.ebay.com/sch/i.html?_nkw=${q}`
      if (EBAY_CAMPID) {
        // EPN (eBay Partner Network) 用 rover.ebay.com 跳转
        return `https://rover.ebay.com/rover/1/711-53200-19255-0/1?campid=${EBAY_CAMPID}&toolid=10001&mpre=${encode(base)}`
      }
      return base
    },
  },
  {
    id: 'taobao',
    label: '淘宝',
    note: '国内 C2C',
    build: (mineral) => {
      const q = encode(mineral.name)
      // 淘宝客的链转换需要后端 + PID，前端只能给纯搜索 URL
      // 等申请了再用 https://uland.taobao.com/coupon/edetail?... 之类
      return `https://s.taobao.com/search?q=${q}`
    },
  },
  {
    id: '1688',
    label: '1688',
    note: '原矿 / 批发',
    build: (mineral) => {
      const q = encode(mineral.name)
      return `https://s.1688.com/selloffer/offer_search.htm?keywords=${q}`
    },
  },
]
