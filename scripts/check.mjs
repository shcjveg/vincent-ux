// 质量检查：设计系统自己用，也可以在使用方项目里跑
// 用法：node scripts/check.mjs [目录...]      默认检查本仓库的 components/ 与 templates/
// 检查项
//   1. 裸色值：CSS 里出现 #hex / rgb() / hsl()（设计变量文件与注释除外）
//   2. 间距刻度：padding / margin / gap 用了不在刻度里的 px 值（不在刻度时失败）
//   3. 禁用图标：引用了 icons.json forbidden 里的图标
//   4. 对比度：主题文字色在各级面上的对比度（只对本仓库）
//   5. 使用方页面 CSS 直接用品牌色（只提示）：颜色语义应由设计系统的语义类承担
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { dirname, join, extname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const targets = process.argv.slice(2).length ? process.argv.slice(2) : [join(ROOT, 'components'), join(ROOT, 'templates')]
const icons = JSON.parse(readFileSync(join(ROOT, 'icons/icons.json'), 'utf8'))
const baseTokens = JSON.parse(readFileSync(join(ROOT, 'tokens/src/base.tokens.json'), 'utf8'))
const SPACE = new Set(Object.entries(baseTokens.space).filter(([k]) => !k.startsWith('$')).map(([, v]) => parseFloat(v.$value)))
for (const target of targets) if (!existsSync(target)) { console.error(`检查目录不存在：${target}`); process.exit(2) }

const files = []
const walk = (p) => {
  if (!existsSync(p)) return
  if (statSync(p).isDirectory()) {
    for (const e of readdirSync(p)) if (!['node_modules', 'dist', '.git', '.showcase-dist', 'test-results', 'playwright-report'].includes(e)) walk(join(p, e))
  } else if (['.css', '.tsx', '.ts', '.jsx', '.js', '.html'].includes(extname(p))) files.push(p)
}
targets.forEach(walk)

const errors = []
const warnings = []
const pascal = (s) => s.split('-').map((x) => x[0].toUpperCase() + x.slice(1)).join('')
const forbidden = icons.forbidden.names.flatMap((n) => [n, pascal(n)])

// 同步目录由宿主决定。用发布内容辨认系统样式，业务修改后的副本仍按页面检查。
const consumer = process.argv.length > 2
const shippedCSS = consumer ? new Set([
  ...readdirSync(join(ROOT, 'components/css')).filter(f => f.endsWith('.css')).map(f => 'components/css/' + f),
  'templates/css/templates.css', 'tokens/dist/embedded.css',
].map(f => readFileSync(join(ROOT, f), 'utf8'))) : new Set()
const iconSrc = readFileSync(join(ROOT, 'components/react/Icon.tsx'), 'utf8')

for (const f of files) {
  const rel = relative(process.cwd(), f)
  const src = readFileSync(f, 'utf8')
  const pageCSS = consumer && extname(f) === '.css' && !shippedCSS.has(src)
  if (consumer && /\.(tsx|jsx)$/.test(f) && src !== iconSrc && /from ['"]lucide-react['"]/.test(src))
    warnings.push(`${rel} 直接引用 lucide-react，改用 <Icon name="含义" />`)
  const code = src.replace(/\/\*[\s\S]*?\*\//g, match => match.replace(/[^\n]/g, ' ')).replace(/^\s*\/\/.*$/gm, '')
  if (/tokens\.css$/.test(f)) continue
  code.split('\n').forEach((line, i) => {
    const at = `${rel}:${i + 1}`
    if (extname(f) === '.css' && /(#[0-9a-f]{3,8}\b|rgba?\(|hsla?\()/i.test(line) && !/var\(--/.test(line.split(':')[0])) {
      if (!/^\s*--/.test(line)) errors.push(`${at} 裸色值：${line.trim()}`)
    }
    if (pageCSS && /var\(--vx-brand-(accent|critical)(-bright)?\)/.test(line))
      warnings.push(`${at} 页面直接用品牌色，改用语气：元素上写 data-tone，样式取 var(--vx-tone) / var(--vx-tone-soft)，或用 .vx-text-accent / .vx-text-critical / .vx-tag--*`)
    for (const n of forbidden) {
      const re = new RegExp(`(['"\`<\\s{,])${n}(['"\`\\s/>,}])`)
      if (re.test(line) && /icon|lucide|from|<|name=/i.test(line)) errors.push(`${at} 禁用图标：${n}`)
    }
  })
  if (extname(f) === '.css') {
    const internal = !process.argv.slice(2).length
    const declarations = /(?:^|[;{])\s*((?:padding|margin)(?:-[\w-]+)?|(?:row-|column-)?gap|font-size|border-radius)\s*:\s*([^;}]+)/gm
    for (const match of code.matchAll(declarations)) {
      for (const size of match[2].matchAll(/(-?\d+(?:\.\d+)?)px\b/g)) {
        const at = `${rel}:${code.slice(0, match.index + match[0].indexOf(match[1])).split('\n').length}`
        const spacing = !['font-size', 'border-radius'].includes(match[1])
        if (spacing && !SPACE.has(Math.abs(Number(size[1])))) errors.push(`${at} 间距 ${size[0]} 不在设计刻度里`)
        else if (internal) errors.push(`${at} ${match[1]} 的 ${size[0]} 应使用对应设计变量`)
      }
    }
  }
}

// 图标：React 组件里的含义必须和 icons.json 一一对应；使用方直接 import lucide-react 的地方提示改用 <Icon>
const meanings = Object.values(icons.meanings).flatMap((g) => Object.keys(g).filter((k) => !k.startsWith('$')))
const iconKeys = [...iconSrc.slice(iconSrc.indexOf('const ICONS'), iconSrc.indexOf('satisfies')).matchAll(/'?([a-z][a-z-]*)'?:\s*[A-Z]/g)].map((m) => m[1])
for (const k of meanings) if (!iconKeys.includes(k)) errors.push(`Icon.tsx 缺少含义 ${k}（icons.json 里有）`)
for (const k of iconKeys) if (!meanings.includes(k)) errors.push(`Icon.tsx 的含义 ${k} 没有在 icons.json 登记`)

// 按实际用途检查；透明面先与底层合成，普通小字一律 4.5:1。默认配色与每套配色主题（tokens/dist/tokens.json 的 palettes）逐套核对。
if (!process.argv.slice(2).length) {
  const { blend, contrast, parse: rgb, toOklch } = await import('./color.mjs')
  const source = { theme: JSON.parse(readFileSync(join(ROOT, 'tokens/src/theme.tokens.json'), 'utf8')), brand: JSON.parse(readFileSync(join(ROOT, 'tokens/src/brand.tokens.json'), 'utf8')) }
  const { palettes = {} } = JSON.parse(readFileSync(join(ROOT, 'tokens/dist/tokens.json'), 'utf8'))
  for (const [id, palette] of Object.entries(palettes)) {
    const t = structuredClone(source.theme), b = structuredClone(source.brand)
    for (const { path, light, dark } of palette.tokens) {
      const [group, key] = path, target = group === 'brand' || group === 'viz' ? b : t
      Object.assign(target[group][key], { light, dark })
    }
    const verify = (label, fg, bg, min) => { const r = contrast(rgb(fg), bg); if (r < min) errors.push(`对比度 [${id}] ${label} = ${r.toFixed(2)}，需 ≥ ${min}`) }
    // 强调色（选中、等你动手）与危急色（阻断、超时）色相至少隔 40°，免得两种语气看成一种。
    const hue = (c) => toOklch(rgb(c))[2], gap = (x, y) => { const d = Math.abs(x - y) % 360; return Math.min(d, 360 - d) }
    for (const mode of ['light', 'dark']) {
      const d = gap(hue(b.brand.accent[mode]), hue(b.brand.critical[mode]))
      if (d < 40) errors.push(`色相 [${id}] ${mode} brand-accent 与 brand-critical 只隔 ${d.toFixed(0)}°，需 ≥ 40°`)
    }
    for (const mode of ['light', 'dark']) {
      const readingInk = {
        primary: t.text.primary[mode], secondary: t.text.secondary[mode], tertiary: t.text.tertiary[mode],
        link: t.text.link[mode] ?? b.brand.accent[mode],
      }
      const verifyReading = (bg, label) => {
        for (const [role, value] of Object.entries(readingInk)) verify(`${mode} text-${role} / ${label}`, value, bg, 4.5)
      }
      const surfaces = Object.entries(t.surface).filter(([key]) => !key.startsWith('$') && key !== 'scrim')
      for (const [surface, value] of surfaces) {
        for (const under of ['canvas', 'card']) {
          const bg = blend(rgb(value[mode]), rgb(t.surface[under][mode]))
          for (const k of ['positive', 'negative']) if (t.data?.[k]) verify(`${mode} data-${k} / ${surface}`, t.data[k][mode], bg, 4.5)
          verifyReading(bg, surface)
          for (const k of ['accent', 'critical', 'warning']) verify(`${mode} brand-${k} / ${surface}`, b.brand[k][mode], bg, 4.5)
          verify(`${mode} focus / ${surface}`, t.focus.ring[mode], bg, 3)
          verify(`${mode} control / ${surface}`, t.line.control[mode], bg, 3)
        }
      }
      for (const surface of ['shell', 'card']) {
        const bg = rgb(t.surface[surface][mode])
        const hierarchy = ['primary', 'secondary', 'tertiary', 'muted'].map(k => contrast(rgb(t.text[k][mode]), bg))
        if (hierarchy.some((ratio, i) => i > 0 && ratio >= hierarchy[i - 1])) errors.push(`[${id}] ${mode} 在 ${surface} 上的文字层级次序有误`)
        verify(`${mode} text-muted / ${surface}`, t.text.muted[mode], bg, 4.5)
        for (const state of ['hover', 'selected']) verifyReading(blend(rgb(t.fill[state][mode]), bg), `${surface} + ${state}`)
      }
      for (const tone of ['accent', 'critical', 'warning']) {
        const bg = blend(rgb(b.brand[`${tone}-soft`][mode]), rgb(t.surface.card[mode]))
        verifyReading(bg, `${tone}-soft`)
        verify(`${mode} ${tone} / soft`, b.brand[tone][mode], bg, 4.5)
      }
      const label = t.action.text[mode] ?? t.text['on-strong'][mode]
      const edge = t.action.edge[mode] ?? 'transparent'
      if (palette.swatches && toOklch(rgb(label))[1] > 0.025) errors.push(`主动作 [${id}] ${mode} 字色过艳`)
      const paints = [t.action.fill[mode] ?? t.ink.base[mode], t.action['fill-hover'][mode] ?? t.ink.top[mode]]
      if (!t.action.fill[mode]) paints.push(t.ink.top[mode])
      for (const fill of new Set(paints)) {
        const paint = rgb(fill)
        verify(`${mode} 主动作文字 / ${fill}`, label, paint, 4.5)
        for (const [key, surface] of surfaces) {
          const bg = blend(rgb(surface[mode]), rgb(t.surface.canvas[mode]))
          if (Math.max(contrast(paint, bg), edge === 'transparent' ? 0 : contrast(rgb(edge), bg)) < 3) {
            errors.push(`主动作 [${id}] ${mode} 边界 / ${key} 未达 3:1`)
          }
        }
      }
      for (const stop of ['base', 'top']) verify(`${mode} 主按钮 ${stop}`, t.text['on-strong'][mode], rgb(t.ink[stop][mode]), 4.5)
      verify(`${mode} 红色计数`, t.text['on-critical'][mode], rgb(b.brand.critical[mode]), 4.5)
    }
  }
}

// 使用方也检查变量拼写；设计系统公开变量可按需引入，自定义局部变量以本次源码声明为准。
const tokenCSS = readFileSync(join(ROOT, 'tokens/dist/tokens.css'), 'utf8')
const source = files.map(f => readFileSync(f, 'utf8')).join('\n')
const publicCSS = ['base', 'atoms', 'molecules', 'organisms'].map(name => readFileSync(join(ROOT, `components/css/${name}.css`), 'utf8')).join('\n')
const definitions = new Set([...(tokenCSS + publicCSS + source).matchAll(/(--vx-[\w-]+)['"]?\s*:/g)].map(m => m[1]))
for (const f of files) {
  const code = readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
  for (const variable of new Set([...code.matchAll(/var\(\s*(--vx-[\w-]+)\s*\)/g)].map(m => m[1])))
    if (!definitions.has(variable)) errors.push(`${relative(process.cwd(), f)} 未定义变量：${variable}`)
}

for (const w of warnings) console.log('提示 ' + w)
for (const e of errors) console.log('✗ ' + e)
console.log(errors.length ? `\n${errors.length} 个问题，${warnings.length} 条提示` : `✓ 通过（${files.length} 个文件，${warnings.length} 条提示）`)
process.exit(errors.length ? 1 : 0)
