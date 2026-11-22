import { blend, contrast, format, fromOklch, parse, toOklch } from './color.mjs'

export function websitePalette(swatches) {
  if (swatches.length !== 3 || swatches.some(value => !/^#[0-9a-f]{6}$/i.test(value))) {
    throw new Error('网站配色需要三个六位十六进制色号')
  }
  const [first, second, action] = swatches.map(value => toOklch(parse(value)))
  const [ink, paper] = first[0] <= second[0] ? [first, second] : [second, first]
  // 遇到红橙色主按钮时，选中与链接沿用同组的冷色；墨色配奶油白时沿用系统金。
  const criticalHue = 30
  const safeAccent = [action, ink, paper].find(([, chroma, hue]) => {
    const gap = Math.abs(hue - criticalHue)
    return chroma > 0.035 && Math.min(gap, 360 - gap) >= 48
  }) ?? [0.5, 0.098, 83]
  return { ink, paper, accent: { hue: safeAccent[2], chroma: Math.min(safeAccent[1], 0.12), lightness: -0.02 }, critical: { hue: criticalHue } }
}

// 标题、正文和注释各自保留系统明度。沿前景与承载面的色调取色，
// 字越次要，彩度上限越低。OKLab 的 a/b 可直接插值，近灰色不会引入任意色相。
const readingChroma = { primary: 0.065, secondary: 0.036, tertiary: 0.023, muted: 0.016, disabled: 0.010 }

function readingTone(lightness, foreground, surface, key) {
  if (key === 'primary') return [lightness, Math.min(foreground[1], readingChroma.primary), foreground[2]]
  const angle = color => color[2] * Math.PI / 180
  const axis = trig => foreground[1] * trig(angle(foreground)) * 0.7 + surface[1] * trig(angle(surface)) * 0.3
  const a = axis(Math.cos), b = axis(Math.sin)
  const bodyChroma = Math.min(readingChroma.secondary, Math.hypot(a, b))
  return [lightness, bodyChroma * readingChroma[key] / readingChroma.secondary, Math.atan2(b, a) * 180 / Math.PI]
}

export function websiteTextLink(swatches) {
  const [, chroma, hue] = toOklch(parse(swatches[2]))
  const color = lightness => format([...fromOklch([lightness, Math.min(chroma, 0.12), hue]), 1])
  return { path: ['text', 'link'], name: 'text-link', type: 'color', light: color(0.43), dark: color(0.80) }
}

export function websiteNeutral([lightness, chroma], palette, mode, [group, key]) {
  const isSurface = group === 'surface'
  const seed = (mode === 'light') === isSurface ? palette.paper : palette.ink
  // 接近工作台原有层级时直接保留原色，例如奶油白的承载面与墨黑正文。
  if (mode === 'light' && group === 'surface' && key === 'shell' && seed[0] >= 0.945 && seed[0] <= 0.97 && seed[1] <= 0.045) return seed
  if (mode === 'light' && ((group === 'text' && key === 'primary') || (group === 'ink' && key === 'base')) && seed[0] <= 0.3) return seed
  if (group === 'text' && Object.hasOwn(readingChroma, key)) {
    const surface = mode === 'light' ? palette.paper : palette.ink
    return readingTone(lightness, seed, surface, key)
  }
  // 保持原本白卡、细线等层级，用参考色给大面轻染色，给正文和墨色较多彩度。
  return [lightness, Math.min(seed[1], chroma * 3.5, isSurface ? 0.045 : 0.10), seed[2]]
}

// 参考色提供色相；按钮的墨色、底、悬停和边界针对实际承载面一起配对。
export function websiteAction(swatches, tokens) {
  const [sourceL, sourceC, hue] = toOklch(parse(swatches[2]))
  const tone = (l, c) => format([...fromOklch([l, Math.min(sourceC, c), hue]), 1])
  const pair = mode => {
    const dark = mode === 'dark'
    const pale = dark || sourceL >= 0.78
    const l = pale ? Math.min(dark ? 0.81 : 0.87, Math.max(dark ? 0.77 : 0.80, sourceL)) : Math.min(0.51, sourceL)
    const fill = tone(l, pale ? 0.13 : 0.15)
    const hover = tone(l + (dark ? 0.045 : -0.045), pale ? 0.13 : 0.15)
    const text = pale ? tone(0.235, 0.018) : tone(0.98, 0.007)
    const paints = [fill, hover].map(parse)
    const canvas = parse(tokens.find(t => t.name === 'surface-canvas')[mode])
    const surfaces = tokens.filter(t => t.path[0] === 'surface' && t.path[1] !== 'scrim')
      .map(t => blend(parse(t[mode]), canvas))
    const needsEdge = surfaces.filter(surface => paints.some(paint => contrast(paint, surface) < 3))
    let edge = 'transparent'
    if (needsEdge.length) {
      for (let step = 1; step <= 100; step++) {
        const candidate = tone(Math.max(0, Math.min(1, l + step * (dark ? 0.01 : -0.01))), 0.045)
        if (needsEdge.every(surface => contrast(parse(candidate), surface) >= 3)) {
          edge = candidate
          break
        }
      }
    }
    return { fill, 'fill-hover': hover, text, edge }
  }
  const light = pair('light'), dark = pair('dark')
  return Object.keys(light).map(key => ({
    path: ['action', key], name: 'action-' + key, type: 'color', light: light[key], dark: dark[key],
  }))
}
