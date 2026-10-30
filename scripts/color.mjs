// 颜色换算：sRGB ↔ OKLCH，超出 sRGB 时只降彩度、保留明度与色相。无依赖。
// build-tokens 用它从默认配色派生各主题，check 用它核对对比度。

/** '#RRGGBB' 或 'rgba(r, g, b, a)' → [r, g, b, a]（r/g/b 0–255）。 */
export function parse(value) {
  if (value.startsWith('#')) return [1, 3, 5].map((i) => parseInt(value.slice(i, i + 2), 16)).concat(1)
  const n = value.match(/[\d.]+/g)?.map(Number)
  if (!n || n.length < 3) throw new Error(`不支持的颜色：${value}`)
  return n.length === 3 ? [...n, 1] : n
}

const hex2 = (v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0').toUpperCase()
/** [r, g, b, a] → '#RRGGBB' 或 'rgba(r, g, b, a)'，与源文件写法一致。 */
export function format([r, g, b, a]) {
  if (a === 1) return `#${hex2(r)}${hex2(g)}${hex2(b)}`
  return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${+a.toFixed(3)})`
}

const toLinear = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4 }
const fromLinear = (c) => 255 * (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055)

export function toOklch([r, g, b]) {
  const [R, G, B] = [r, g, b].map(toLinear)
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B)
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B)
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B)
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
  const Bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  return [L, Math.hypot(A, Bb), ((Math.atan2(Bb, A) * 180) / Math.PI + 360) % 360]
}

function lchToLinear([L, C, h]) {
  const a = C * Math.cos((h * Math.PI) / 180), b = C * Math.sin((h * Math.PI) / 180)
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s]
}
const inGamut = (lin) => lin.every((c) => c >= -1e-4 && c <= 1 + 1e-4)

/** OKLCH → [r, g, b]；超出 sRGB 时二分降低彩度。 */
export function fromOklch([L, C, h]) {
  let lo = 0, hi = C, c = C
  if (!inGamut(lchToLinear([L, C, h]))) {
    for (let i = 0; i < 24; i++) { c = (lo + hi) / 2; if (inGamut(lchToLinear([L, c, h]))) lo = c; else hi = c }
    c = lo
  }
  return lchToLinear([L, c, h]).map(fromLinear)
}

/** 透明色先与底色合成，再算 WCAG 对比度。 */
export const blend = (front, back) => front.slice(0, 3).map((c, i) => c * front[3] + back[i] * (1 - front[3])).concat(1)
const lum = (c) => c.slice(0, 3).map(toLinear).reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0)
export function contrast(fg, bg) {
  const [hi, lo] = [lum(blend(fg, bg)), lum(bg)].sort((a, b) => b - a)
  return (hi + 0.05) / (lo + 0.05)
}
