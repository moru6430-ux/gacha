# 矿物神话内容采集 · 目标清单

> 命名规则：`id` 全小写下划线，国际命名沿用矿物学惯例。
> 优先级：⭐⭐⭐ = 文化深 + 故事好 + 填补类别空缺；⭐⭐ = 经典；⭐ = 锦上添花。

## 第一批：填补类别 / 文化空缺（接下来要做的 8 条）

| ID | 名字 | 类别 | 文化 | 优先级 | 说明 |
|---|---|---|---|---|---|
| `ural_malachite` | 乌拉尔孔雀石 | malachite | 俄罗斯 · 乌拉尔山 | ⭐⭐⭐ | Bazhov《孔雀石匣》民间传说，铜山女主人。19 世纪欧洲贵族 obsession |
| `tibetan_dzi` | 西藏天珠 | agate | 藏地 | ⭐⭐⭐ | 苯教 + 藏传佛教，「天降石」传说，唐代以来稀世 |
| `meso_obsidian` | 中美洲黑曜石 | other | 阿兹特克 / 玛雅 | ⭐⭐⭐ | Tezcatlipoca 的烟镜，玛雅祭祀用，"神之指甲" |
| `sri_moonstone` | 斯里兰卡月光石 | moonstone | 古印度 | ⭐⭐⭐ | Chandrakanta，月神 Chandra 的眼泪 / 凝固月光 |
| `imperial_topaz` | 帝王托帕石 | topaz | 古希腊 / 巴西 | ⭐⭐ | 太阳神 Helios，Topázos 岛传说 |
| `herkimer_quartz` | 赫基默"钻石"水晶 | quartz | 莫霍克族 | ⭐⭐ | 双尖水晶，水晶头骨之争的源流之一 |
| `paraiba_tourmaline` | 帕拉伊巴碧玺 | tourmaline | 巴西原住民 | ⭐ | 1989 才被发现，"霓虹蓝"，故事现代化 |
| `koh_i_noor_diamond` | 光之山钻石 | other | 印度 / 莫卧儿 | ⭐⭐⭐ | "Koh-i-Noor"，印度神话 + 莫卧儿 + 维多利亚 |

## 第二批：扩文化半径

| ID | 名字 | 类别 | 文化 | 备注 |
|---|---|---|---|---|
| `magatama_jade` | 勾玉 | jade | 日本 | 三神器之一，天照大神 |
| `egypt_carnelian` | 埃及红玉髓 | agate | 古埃及 | Isis 之结，护身符 |
| `mesopotamia_lapis` | 美索不达米亚青金石（吉尔伽美什） | lapis | 苏美尔 | 已有 badakhshan_lapis 可合并，或独立做"出土叙事" |
| `zuni_turquoise` | 祖尼绿松石 | turquoise | 普韦布洛 / 祖尼 | 北美原住民"天石" |
| `inuit_jade` | 因纽特玉斧 | jade | 因纽特 | 北极圈玉文化 |
| `viking_amber` | 维京琥珀 | amber | 北欧 | Freyja 的眼泪（vs 已有的立陶宛版） |
| `māori_pounamu` | 毛利绿玉 / Pounamu | jade | 新西兰 | 法律：商业开采需毛利部族授权 ⚠️ |
| `russian_alexandrite` | 亚历山大变石 | other | 俄罗斯 | 1834 发现，沙皇命名，变色奇观 |

## 第三批：纯锦上添花（30-50 条远景）

- 紫水晶（amethystos，希腊葡萄酒神）
- 石榴石（普西芬妮的石榴）
- 蓝铜矿（mineral pigment in Renaissance）
- 火欧泊（克察尔科亚特尔）
- 朱砂（中国炼丹）
- 雄黄（端午 / 蛇）
- 玛瑙杯（罗马多色玛瑙）
- 海蓝宝（女神 Tethys / 渔夫护身石）
- 拉长石（Inuit "北极光石"）
- 太阳石（Vikings "日影石"）
- 玉髓（伊斯兰 nigella seal stone）
- 蜜蜡（藏地念珠）
- 茶晶（中国"墨晶"）

## 字段约定（每张草稿卡）

每个目标产出一个 `drafts/<id>.json`，结构匹配 minerals 表的新 schema：

```json
{
  "id": "ural_malachite",
  "name": "乌拉尔孔雀石",
  "name_en": "Ural Malachite",
  "region": "俄罗斯 · 乌拉尔山",
  "region_en": "Ural Mountains, Russia",
  "coordinates": [56.0, 60.0],
  "category": "malachite",
  "mineral_type": "碳酸盐 / 孔雀石",
  "color": "翡翠绿、孔雀眼纹",
  "stories": [
    {
      "culture": "乌拉尔 · 俄罗斯民间",
      "title": "铜山女主人",
      "content": "...",
      "sources": [
        { "type": "primary", "author": "Bazhov, Pavel", "title": "Малахитовая шкатулка (The Malachite Casket)", "year": 1939, "locator": "Tale: Хозяйка Медной горы" }
      ]
    }
  ],
  "image": "<wikimedia commons URL，CC 协议>",
  "image_credit": "<图片归属>",
  "legal_status": {
    "commerce": "safe",
    "notes": "乌拉尔大型矿脉 19 世纪末枯竭，市售多为刚果或亚利桑那产；俄罗斯古董件偶有流通。"
  },
  "sources": [
    { "type": "secondary", "author": "Voskoboinikov, Vyacheslav", "title": "Малахит Урала", "year": 1986 },
    { "type": "web", "title": "Mindat: Malachite", "url": "https://www.mindat.org/min-2550.html" }
  ]
}
```

## 来源等级

| 等级 | 含义 | 例 |
|---|---|---|
| `primary` | 一手文献 / 古典原典 | 普林尼《自然史》、《本草纲目》、Bazhov 原著 |
| `secondary` | 学术综述 / 专著 | 博物馆图录、学术论文 |
| `museum` | 馆藏档案 | Smithsonian、大英博物馆 |
| `web` | 在线参考 | Wikipedia、Mindat、ctext.org |

## 工作流

```
candidates.md (本文件) → 选目标 →
  WebSearch + WebFetch 拉资料 →
    drafts/<id>.json 起稿 →
      你过稿 →
        SQL import 到 Supabase
```

我做前 3 步，你做第 4 步，第 5 步两人一起。
