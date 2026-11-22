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

export function websiteNeutral([lightness, chroma], palette, mode, [group, key], shellLightness) {
  const isSurface = group === 'surface'
  const seed = (mode === 'light') === isSurface ? palette.paper : palette.ink
  if (mode === 'light' && ((group === 'text' && key === 'primary') || (group === 'ink' && key === 'base')) && seed[0] <= 0.3) return seed
  // 暗色墨底允许保留参考色的明度差；承载面和次级字一起移动，保留分层与可读性。
  const darkShift = Math.max(-0.014, Math.min(0.023, (palette.ink[0] - 0.2) * 0.14))
  if (group === 'text' && Object.hasOwn(readingChroma, key)) {
    const surface = mode === 'light' ? palette.paper : palette.ink
    const lift = mode === 'dark' && key !== 'primary' ? Math.max(0, darkShift) : 0
    return readingTone(lightness + lift, seed, surface, key)
  }
  // 白底或黑底缺少色相时，画布和承载区从另一种基础色取得轻微色调。
  // 保留原有层级和文字对比，同时让明暗两种画布都能辨认主题。
  if (isSurface && ['canvas', 'shell', 'inset', 'card', 'card-hover'].includes(key)) {
    const other = mode === 'light' ? palette.ink : palette.paper
    const tint = seed[1] < 0.012 ? other : seed
    // 保留各层的顺序，把整组表面的明度锚在本主题的纸色或墨色上。
    // 高明度纸色可直接成为浅色承载区。极亮的纸色仍为白卡留出一档空间。
    if (mode === 'light' && key === 'shell' && seed[0] >= 0.94 && seed[0] <= 0.985) return seed
    const shift = mode === 'light'
      ? Math.max(0, Math.min(0.032, seed[0] - shellLightness))
      : darkShift
    const surfaceL = mode === 'light' && key.startsWith('card') ? lightness : lightness + shift
    const strength = seed === tint ? 0.85 : 0.22
    return [Math.min(1, surfaceL), Math.min(tint[1] * strength, 0.085), tint[2]]
  }
  // 保持原本白卡、细线等层级，用参考色给大面轻染色，给正文和墨色较多彩度。
  return [lightness, Math.min(seed[1], chroma * 3.5, isSurface ? 0.045 : 0.10), seed[2]]
}

// 先保留指定底色，优先使用可读的配套字色。极黑/极白覆盖中明度底色的临界区。
function inkOn(fill, preferred) {
  const background = parse(fill)
  return preferred.find(ink => contrast(parse(ink), background) >= 4.5)
    ?? (contrast(parse('#FFFFFF'), background) > contrast(parse('#000000'), background) ? '#FFFFFF' : '#000000')
}

export function websiteBrandField([field, companion]) {
  const ink = inkOn(field, [companion])
  return [['field', field], ['on-field', ink]].map(([key, color]) => ({
    path: ['brand', key], name: 'brand-' + key, type: 'color', light: color, dark: color,
  }))
}

// 同一套动作生成规则接受品牌原色，也接受基础主题各模式自己的强调色。
function actionOn(fill, mode, surfaces) {
  const [sourceL, sourceC, hue] = toOklch(parse(fill))
  const tone = (l, c) => format([...fromOklch([Math.max(0, Math.min(1, l)), c, hue]), 1])
  const text = inkOn(fill, [tone(0.18, 0.012), tone(0.985, 0.006)])
  // 沿同一色相略调明度，从字色可读的选项中取与常态区分较清楚的一档。
  const hover = [-0.065, 0.065].map(delta => tone(sourceL + delta, sourceC))
    .filter(color => contrast(parse(text), parse(color)) >= 4.5)
    .sort((a, b) => contrast(parse(b), parse(fill)) - contrast(parse(a), parse(fill)))[0]
  const paints = [fill, hover].map(parse)
  const needsEdge = surfaces.filter(surface => paints.some(paint => contrast(paint, surface) < 3))
  let edge = 'transparent'
  if (needsEdge.length) {
    for (let step = 1; step <= 100; step++) {
      edge = tone(sourceL + step * (mode === 'dark' ? 0.01 : -0.01), sourceC)
      if (needsEdge.every(surface => contrast(parse(edge), surface) >= 3)) break
    }
  }
  return { fill, 'fill-hover': hover, text, edge }
}

export function paletteAction(tokens, brandFill) {
  const pair = mode => {
    const token = name => tokens.find(t => t.name === name)[mode]
    const canvas = parse(token('surface-canvas'))
    const surfaces = tokens.filter(t => t.path[0] === 'surface' && t.path[1] !== 'scrim')
      .map(t => blend(parse(t[mode]), canvas))
    const action = actionOn(brandFill ?? token('brand-accent'), mode, surfaces)
    const strong = parse(token('ink-base'))
    const needsEdge = [action.fill, action['fill-hover']].some(fill => contrast(parse(fill), strong) < 3)
    return { ...action, 'edge-on-strong': needsEdge ? token('text-on-strong') : 'transparent' }
  }
  const light = pair('light'), dark = pair('dark')
  return Object.keys(light).map(key => ({
    path: ['action', key], name: 'action-' + key, type: 'color', light: light[key], dark: dark[key],
  }))
}
