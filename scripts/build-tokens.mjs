// 由 tokens/src/*.tokens.json 生成 tokens/dist/tokens.css 与 tokens.json
// 用法：node scripts/build-tokens.mjs        （无依赖，Node 18+）
//
// 规则
// - 基础变量（base）：与主题无关，直接写成 --vx-<路径>
// - 主题与品牌变量（theme / brand）：每个有 light / dark 两个值
//   - 颜色写成 light-dark(浅, 深)，跟随 color-scheme
//   - 阴影、模糊等非颜色值 light-dark() 不支持，分别写进浅色与暗色两段
// - :root 默认跟随系统；<html data-theme="light|dark"> 强制指定
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
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
      flat.push({ name: [...path, k].join('-'), type: v.$type ?? inherited, value: v.$value, light: v.light, dark: v.dark, description: v.$description })
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

mkdirSync(join(ROOT, 'tokens/dist'), { recursive: true })
writeFileSync(join(ROOT, 'tokens/dist/tokens.css'), css)
writeFileSync(
  join(ROOT, 'tokens/dist/tokens.json'),
  JSON.stringify({ $source: `vincent-ux v${pkg.version}`, tokens: flat.map((t) => ({ var: v(t), ...t })) }, null, 2) + '\n',
)
console.log(`✓ ${flat.length} 个变量 → tokens/dist/tokens.css`)
