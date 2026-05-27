// WGS-84（国际 GPS / 我们矿物数据用的标准）→ GCJ-02（高德 / 火星坐标系，中国官方用的"加密"坐标）
// 中国境内偏移 100-700 米；境外不偏移。
// 算法来自 EvilTransform（公开算法，多个开源库都有同款实现）。
//
// 必要性：高德地图底图本身是 GCJ-02 渲染的；如果我们用 WGS-84 坐标点直接放到高德底图上，
// 中国境内的点（和田、抹谷、寿山、合浦、拉萨…）会偏几百米，显示在错误位置。
// 境外点不需要转。

const a = 6378245.0
const ee = 0.00669342162296594323

function isOutsideChina(lng, lat) {
  return lng < 72.004 || lng > 137.8347 || lat < 0.8293 || lat > 55.8271
}

function transformLat(x, y) {
  let ret = -100 + 2 * x + 3 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x))
  ret += ((20 * Math.sin(6 * x * Math.PI) + 20 * Math.sin(2 * x * Math.PI)) * 2) / 3
  ret += ((20 * Math.sin(y * Math.PI) + 40 * Math.sin((y / 3) * Math.PI)) * 2) / 3
  ret += ((160 * Math.sin((y / 12) * Math.PI) + 320 * Math.sin((y * Math.PI) / 30)) * 2) / 3
  return ret
}

function transformLng(x, y) {
  let ret = 300 + x + 2 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x))
  ret += ((20 * Math.sin(6 * x * Math.PI) + 20 * Math.sin(2 * x * Math.PI)) * 2) / 3
  ret += ((20 * Math.sin(x * Math.PI) + 40 * Math.sin((x / 3) * Math.PI)) * 2) / 3
  ret += ((150 * Math.sin((x / 12) * Math.PI) + 300 * Math.sin((x / 30) * Math.PI)) * 2) / 3
  return ret
}

// 输入 [lat, lng] (我们项目里所有坐标都用这个顺序，跟 Leaflet 一致)
// 返回 [lat, lng] 转换后的高德坐标
export function toAMapCoords(latLng) {
  if (!latLng) return latLng
  const [lat, lng] = latLng
  if (isOutsideChina(lng, lat)) return latLng
  const dLat = transformLat(lng - 105, lat - 35)
  const dLng = transformLng(lng - 105, lat - 35)
  const radLat = (lat / 180) * Math.PI
  let magic = Math.sin(radLat)
  magic = 1 - ee * magic * magic
  const sqrtMagic = Math.sqrt(magic)
  const correctedLat = lat + (dLat * 180) / (((a * (1 - ee)) / (magic * sqrtMagic)) * Math.PI)
  const correctedLng = lng + (dLng * 180) / ((a / sqrtMagic) * Math.cos(radLat) * Math.PI)
  return [correctedLat, correctedLng]
}

// 边界框转换（用于 flyToBounds）
export function toAMapBounds(bounds) {
  return [toAMapCoords(bounds[0]), toAMapCoords(bounds[1])]
}
