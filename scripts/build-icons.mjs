// 由 icons/icons.json 生成 icons/dist/sprite.svg：给没有构建步骤的纯 HTML 页面离线使用
// 用法：node scripts/build-icons.mjs <含 lucide-react 的 node_modules 目录>
// 页面里：<svg class="vx-icon"><use href="icons/dist/sprite.svg#chat"/></svg>（id 是含义名）
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const NM = process.argv[2]
if (!NM || !existsSync(join(NM, 'lucide-react'))) {
  console.error('用法：node scripts/build-icons.mjs <含 lucide-react 的 node_modules 目录>')
  process.exit(2)
}
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'))
const spec = JSON.parse(readFileSync(join(ROOT, 'icons/icons.json'), 'utf8'))

// 读 lucide-react 的图标数据：node 数组 [[标签, 属性], ...]
function readIcon(name) {
  const file = join(NM, 'lucide-react/dist/esm/icons', `${name}.mjs`)
  if (!existsSync(file)) throw new Error(`lucide 里没有图标 ${name}`)
  const src = readFileSync(file, 'utf8')
  // 改过名的图标是一行转发：export { default } from './新名.mjs'
  const alias = src.match(/export \{ default \} from '\.\/([a-z0-9-]+)\.mjs'/)
  if (alias) return readIcon(alias[1])
  const m = src.match(/const __iconData = (\{[\s\S]*?\n\});/)
  if (!m) throw new Error(`读不出 ${name} 的图标数据`)
  return Function(`return ${m[1]}`)().node
}

const attrs = (o) =>
  Object.entries(o)
    .filter(([k]) => k !== 'key')
    .map(([k, v]) => `${k}="${v}"`)
    .join(' ')

const symbols = []
for (const group of Object.values(spec.meanings)) {
  for (const [meaning, name] of Object.entries(group)) {
    if (meaning.startsWith('$')) continue
    const inner = readIcon(name).map(([tag, a]) => `<${tag} ${attrs(a)}/>`).join('')
    symbols.push(
      `<symbol id="${meaning}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${spec.strokeWidth}" stroke-linecap="round" stroke-linejoin="round">${inner}</symbol>`,
    )
  }
}

mkdirSync(join(ROOT, 'icons/dist'), { recursive: true })
const head = `<!-- vincent-ux v${pkg.version} · icons/dist/sprite.svg · 由 scripts/build-icons.mjs 生成，不要手改 -->`
writeFileSync(join(ROOT, 'icons/dist/sprite.svg'), `${head}\n<svg xmlns="http://www.w3.org/2000/svg">\n${symbols.join('\n')}\n</svg>\n`)
console.log(`✓ ${symbols.length} 个图标 → icons/dist/sprite.svg`)
