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

for (const f of files) {
  const rel = relative(process.cwd(), f)
  const src = readFileSync(f, 'utf8')
  const code = src.replace(/\/\*[\s\S]*?\*\//g, match => match.replace(/[^\n]/g, ' ')).replace(/^\s*\/\/.*$/gm, '')
  if (/tokens\.css$/.test(f)) continue
  code.split('\n').forEach((line, i) => {
    const at = `${rel}:${i + 1}`
    if (extname(f) === '.css' && /(#[0-9a-f]{3,8}\b|rgba?\(|hsla?\()/i.test(line) && !/var\(--/.test(line.split(':')[0])) {
      if (!/^\s*--/.test(line)) errors.push(`${at} 裸色值：${line.trim()}`)
    }
    if (process.argv.slice(2).length && extname(f) === '.css' && !/vendor[\\/]vincent-ux/.test(f) && !f.startsWith(ROOT) && /var\(--vx-brand-(accent|critical)(-bright)?\)/.test(line))
      warnings.push(`${at} 页面直接用品牌色，改用语气：元素上写 data-tone，样式取 var(--vx-tone) / var(--vx-tone-soft)，或用 .vx-text-accent / .vx-text-critical / .vx-tag--*`)
    const m = extname(f) === '.css' && line.match(/^\s*(padding|margin|gap)[a-z-]*\s*:\s*([^;]+)/)
    if (m) for (const v of m[2].matchAll(/(-?\d+(?:\.\d+)?)px/g)) if (!SPACE.has(Math.abs(Number(v[1])))) errors.push(`${at} 间距 ${v[1]}px 不在 tokens/src/base.tokens.json 刻度里`)
    for (const n of forbidden) {
      const re = new RegExp(`(['"\`<\\s{,])${n}(['"\`\\s/>,}])`)
      if (re.test(line) && /icon|lucide|from|<|name=/i.test(line)) errors.push(`${at} 禁用图标：${n}`)
    }
  })
}

// 图标：React 组件里的含义必须和 icons.json 一一对应；使用方直接 import lucide-react 的地方提示改用 <Icon>
const meanings = Object.values(icons.meanings).flatMap((g) => Object.keys(g).filter((k) => !k.startsWith('$')))
const iconSrc = readFileSync(join(ROOT, 'components/react/Icon.tsx'), 'utf8')
const iconKeys = [...iconSrc.slice(iconSrc.indexOf('const ICONS'), iconSrc.indexOf('satisfies')).matchAll(/'?([a-z][a-z-]*)'?:\s*[A-Z]/g)].map((m) => m[1])
for (const k of meanings) if (!iconKeys.includes(k)) errors.push(`Icon.tsx 缺少含义 ${k}（icons.json 里有）`)
for (const k of iconKeys) if (!meanings.includes(k)) errors.push(`Icon.tsx 的含义 ${k} 没有在 icons.json 登记`)
if (process.argv.slice(2).length)
  for (const f of files)
    if (/\.(tsx|jsx)$/.test(f) && !/(vincent-ux|components)[\\/]react[\\/]Icon\.tsx$/.test(f) && /from ['"]lucide-react['"]/.test(readFileSync(f, 'utf8')))
      warnings.push(`${relative(process.cwd(), f)} 直接引用 lucide-react，改用 <Icon name="含义" />`)

// 按实际用途检查；透明面先与底层合成，普通小字一律 4.5:1。
const rgb = value => {
  if (value.startsWith('#')) return [1, 3, 5].map(i => parseInt(value.slice(i, i + 2), 16)).concat(1)
  const values = value.match(/[\d.]+/g)?.map(Number)
  if (!values || values.length < 3) throw new Error(`不支持的颜色：${value}`)
  return values.length === 3 ? [...values, 1] : values
}
const blend = (front, back) => front.slice(0, 3).map((c, i) => c * front[3] + back[i] * (1 - front[3])).concat(1)
const lum = color => color.slice(0, 3).map(v => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }).reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0)
const contrast = (fg, bg) => { const [hi, lo] = [lum(blend(fg, bg)), lum(bg)].sort((a, b) => b - a); return (hi + 0.05) / (lo + 0.05) }
if (!process.argv.slice(2).length) {
  const t = JSON.parse(readFileSync(join(ROOT, 'tokens/src/theme.tokens.json'), 'utf8'))
  const b = JSON.parse(readFileSync(join(ROOT, 'tokens/src/brand.tokens.json'), 'utf8'))
  const verify = (label, fg, bg, min) => { const r = contrast(rgb(fg), bg); if (r < min) errors.push(`对比度 ${label} = ${r.toFixed(2)}，需 ≥ ${min}`) }
  for (const mode of ['light', 'dark']) {
    const surfaces = Object.entries(t.surface).filter(([key]) => !key.startsWith('$') && key !== 'scrim')
    for (const [surface, value] of surfaces) {
      for (const under of ['canvas', 'card']) {
        const bg = blend(rgb(value[mode]), rgb(t.surface[under][mode]))
        for (const k of ['primary', 'secondary', 'tertiary']) verify(`${mode} text-${k} / ${surface}`, t.text[k][mode], bg, 4.5)
        for (const k of ['accent', 'critical']) verify(`${mode} brand-${k} / ${surface}`, b.brand[k][mode], bg, 4.5)
        verify(`${mode} focus / ${surface}`, t.focus.ring[mode], bg, 3)
        verify(`${mode} control / ${surface}`, t.line.control[mode], bg, 3)
      }
    }
    for (const tone of ['accent', 'critical']) {
      const bg = blend(rgb(b.brand[`${tone}-soft`][mode]), rgb(t.surface.card[mode]))
      verify(`${mode} ${tone} / soft`, b.brand[tone][mode], bg, 4.5)
    }
    for (const stop of ['base', 'top']) verify(`${mode} 主按钮 ${stop}`, t.text['on-strong'][mode], rgb(t.ink[stop][mode]), 4.5)
    verify(`${mode} 红色计数`, t.text['on-critical'][mode], rgb(b.brand.critical[mode]), 4.5)
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
