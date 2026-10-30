// 由 tokens/src/*.tokens.json 生成 tokens/dist/tokens.css 与 tokens.json
// 用法：node scripts/build-tokens.mjs        （无依赖，Node 18+）
//
// 规则
// - 基础变量（base）：与主题无关，直接写成 --vx-<路径>
// - 主题与品牌变量（theme / brand）：每个有 light / dark 两个值
//   - 颜色写成 light-dark(浅, 深)，跟随 color-scheme
//   - 阴影、模糊等非颜色值 light-dark() 不支持，分别写进浅色与暗色两段
// - :root 默认跟随系统；<html data-theme="light|dark"> 强制指定
// - 配色主题（tokens/src/palettes.json）：<html data-palette="主题 id"> 切换，与明暗正交。
//   每套主题只给参数，色值从默认配色派生：明度不变，只换色相与彩度（见 derive）
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { fromOklch, format, parse, toOklch } from './color.mjs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'))
const read = (f) => JSON.parse(readFileSync(join(ROOT, 'tokens/src', f), 'utf8'))

const PREFIX = 'vx'
const flat = [] // { name, type, value | light/dark, description }

function walk(node, path, inherited) {
  for (const [k, v] of Object.entries(node)) {
    if (k.startsWith('$')) continue
    if (v && typeof v === 'object' && ('$value' in v || 'light' in v)) {
      flat.push({ name: [...path, k].join('-'), path: [...path, k], type: v.$type ?? inherited, value: v.$value, light: v.light, dark: v.dark, description: v.$description })
    } else if (v && typeof v === 'object') {
      walk(v, [...path, k], v.$type ?? inherited)
    }
  }
}
for (const f of ['base.tokens.json', 'theme.tokens.json', 'brand.tokens.json']) walk(read(f), [], undefined)

const fmt = (t) => {
  if (t.type === 'cubicBezier' && Array.isArray(t.value)) return `cubic-bezier(${t.value.join(', ')})`
  return String(t.value)
}
const v = (t) => `--${PREFIX}-${t.name}`

const base = flat.filter((t) => t.value !== undefined)
const themed = flat.filter((t) => t.light !== undefined)
const colors = themed.filter((t) => t.type === 'color')
const others = themed.filter((t) => t.type !== 'color')

const header = `/* vincent-ux v${pkg.version} · tokens/dist/tokens.css · 由 scripts/build-tokens.mjs 生成，不要手改 */`
const css = `${header}

:root {
  color-scheme: light dark;
${base.map((t) => `  ${v(t)}: ${fmt(t)};`).join('\n')}
${colors.map((t) => `  ${v(t)}: light-dark(${t.light}, ${t.dark});`).join('\n')}
${others.map((t) => `  ${v(t)}: ${t.light};`).join('\n')}
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) {
${others.map((t) => `    ${v(t)}: ${t.dark};`).join('\n')}
  }
}

:root[data-theme='light'] {
  color-scheme: light;
${others.map((t) => `  ${v(t)}: ${t.light};`).join('\n')}
}

:root[data-theme='dark'] {
  color-scheme: dark;
${others.map((t) => `  ${v(t)}: ${t.dark};`).join('\n')}
}
`

// —— 配色主题 ——
// 角色：中性层（面、文字、线、填充、墨色、阴影、中性图表色）跟主题的中性色相；强调色（含焦点环、强调图表色）
// 跟主题的强调色；危急色只换色相；涨跌色（data）不随主题变，保证正负含义稳定。
const ACCENT_BASE_CHROMA = 0.098
const role = (p) => {
  const [group, key] = p
  if (group === 'brand') return key.startsWith('critical') ? 'critical' : 'accent'
  if (group === 'focus') return 'accent'
  if (group === 'viz') return key === 'accent' || ['series-1', 'series-3', 'series-5'].includes(key) ? 'accent' : 'neutral'
  if (['surface', 'fill', 'text', 'line', 'ink', 'shadow'].includes(group)) return 'neutral'
  return null
}
function shift(color, r, palette, mode) {
  const c = parse(color)
  const [L, C, h] = toOklch(c)
  let next
  if (r === 'neutral') {
    const k = mode === 'dark' ? palette.neutral.darkChroma ?? palette.neutral.chroma : palette.neutral.chroma
    next = [L, C * k, palette.neutral.hue]
  } else if (r === 'accent') next = [L + (mode === 'light' ? palette.accent.lightness ?? 0 : 0), C * (palette.accent.chroma / ACCENT_BASE_CHROMA), palette.accent.hue]
  else next = [L, C, palette.critical.hue]
  return format([...fromOklch(next), c[3]])
}
const derive = (t, r, palette, mode) => t.type === 'color'
  ? shift(t[mode], r, palette, mode)
  : String(t[mode]).replace(/rgba?\([^)]*\)|#[0-9A-Fa-f]{6}\b/g, (m) => shift(m, r, palette, mode))

const paletteSource = read('palettes.json')
const palettes = Object.entries(paletteSource).filter(([id, p]) => !id.startsWith('$') && !p.default).map(([id, p]) => ({
  id, meta: p,
  tokens: themed.filter((t) => role(t.path)).map((t) => ({ ...t, light: derive(t, role(t.path), p, 'light'), dark: derive(t, role(t.path), p, 'dark') })),
}))
const paletteCSS = palettes.map(({ id, meta, tokens }) => {
  const sel = `:root[data-palette='${id}']`
  const c = tokens.filter((t) => t.type === 'color'), o = tokens.filter((t) => t.type !== 'color')
  return `/* ${meta.name}：${meta.tone} */
${sel} {
${c.map((t) => `  ${v(t)}: light-dark(${t.light}, ${t.dark});`).join('\n')}
${o.map((t) => `  ${v(t)}: ${t.light};`).join('\n')}
}

@media (prefers-color-scheme: dark) {
  ${sel}:not([data-theme='light']) {
${o.map((t) => `    ${v(t)}: ${t.dark};`).join('\n')}
  }
}

${sel}[data-theme='dark'] {
${o.map((t) => `  ${v(t)}: ${t.dark};`).join('\n')}
}
`
}).join('\n')

mkdirSync(join(ROOT, 'tokens/dist'), { recursive: true })
writeFileSync(join(ROOT, 'tokens/dist/tokens.css'), css + (paletteCSS ? `\n${paletteCSS}` : ''))
writeFileSync(
  join(ROOT, 'tokens/dist/tokens.json'),
  JSON.stringify({
    $source: `vincent-ux v${pkg.version}`,
    tokens: flat.map((t) => ({ var: v(t), ...t })),
    palettes: Object.fromEntries([
      ...Object.entries(paletteSource).filter(([id, p]) => !id.startsWith('$') && p.default).map(([id, p]) => [id, { ...p, tokens: [] }]),
      ...palettes.map(({ id, meta, tokens }) => [id, { ...meta, tokens: tokens.map((t) => ({ var: v(t), path: t.path, light: t.light, dark: t.dark })) }]),
    ]),
  }, null, 2) + '\n',
)
console.log(`✓ ${flat.length} 个变量、${palettes.length + 1} 套配色 → tokens/dist/tokens.css`)
