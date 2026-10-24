// 首次复制；已有差异先报告，显式 --overwrite 才覆盖。没有隐藏的同步状态。
import { mkdirSync, readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const [dest, ...flags] = process.argv.slice(2)
if (!dest || dest.startsWith('--') || flags.some(f => !['--no-react', '--overwrite', '--dry-run'].includes(f))) {
  console.error('用法：node scripts/sync.mjs <目录> [--no-react] [--dry-run] [--overwrite]')
  process.exit(2)
}
const out = resolve(dest)
const plan = [
  ['LICENSE', 'LICENSE'],
  ['THIRD_PARTY_NOTICES.md', 'THIRD_PARTY_NOTICES.md'],
  ['licenses/lucide.txt', 'licenses/lucide.txt'],
  ['tokens/dist/tokens.css', 'tokens.css'],
  ...readdirSync(join(ROOT, 'components/css')).filter(f => f.endsWith('.css')).map(f => [`components/css/${f}`, `css/${f}`]),
  ['templates/css/templates.css', 'css/templates.css'],
  ['icons/dist/sprite.svg', 'icons/sprite.svg'],
  ['scripts/audit.js', 'audit.js'],
  ['styles.css', 'styles.css'],
  ['examples/basic.html', 'example.html'],
  ...(flags.includes('--no-react') ? [] : readdirSync(join(ROOT, 'components/react')).filter(f => /\.(tsx?|jsx?)$/.test(f)).map(f => [`components/react/${f}`, `react/${f}`])),
].map(([from, to]) => {
  let content = readFileSync(join(ROOT, from), 'utf8')
  if (from === 'styles.css') content = content.replace('./tokens/dist/tokens.css', './tokens.css').replaceAll('./components/css/', './css/').replace('./templates/css/', './css/')
  if (from === 'examples/basic.html') content = content.replace('../styles.css', './styles.css').replaceAll('../icons/dist/sprite.svg', './icons/sprite.svg')
  const path = join(out, to)
  const previous = existsSync(path) ? readFileSync(path, 'utf8') : undefined
  return { path, to, content, changed: previous !== content, conflict: previous !== undefined && previous !== content }
})
const conflicts = plan.filter(f => f.conflict)
if (conflicts.length && !flags.includes('--overwrite')) {
  console.error('已有文件与来源不同，未写入任何文件：\n' + conflicts.map(f => `  ${f.to}`).join('\n'))
  console.error('比较并保留本地修改后，使用 --overwrite 显式覆盖；--dry-run 可预览。')
  process.exit(1)
}
const changed = plan.filter(f => f.changed)
if (flags.includes('--dry-run')) {
  console.log(changed.map(f => `${f.conflict ? '覆盖' : '新增'} ${f.to}`).join('\n') || '无需更新')
} else {
  for (const file of changed) {
    mkdirSync(dirname(file.path), { recursive: true })
    writeFileSync(file.path, file.content)
  }
  console.log(`vincent-ux → ${out}：${plan.length} 个文件，更新 ${changed.length} 个；打开 example.html 查看接入示例`)
}
