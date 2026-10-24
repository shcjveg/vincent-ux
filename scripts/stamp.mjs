// 给每个可拷贝文件写上来源标记（第一行），版本号取 package.json
// 标记格式：vincent-ux vX.Y.Z · <相对路径>
// 已有标记的文件只更新版本号；新文件在第一行插入。
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, relative, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const { version } = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'))
const DIRS = ['principles', 'tokens/dist', 'icons', 'components', 'patterns', 'templates']
const FILES = ['SKILL.md', 'styles.css', 'scripts/audit.js']
const COMMENT = { '.md': ['<!-- ', ' -->'], '.css': ['/* ', ' */'], '.ts': ['// ', ''], '.tsx': ['// ', ''], '.js': ['// ', ''], '.mjs': ['// ', ''] }
const MARK = /vincent-ux v\d+\.\d+\.\d+ · /

let n = 0
function stampFile(p) {
  const c = COMMENT[extname(p)]
  if (!c) return
  const rel = relative(ROOT, p)
  const line = `${c[0]}vincent-ux v${version} · ${rel}${c[1]}`
  const src = readFileSync(p, 'utf8')
  // Markdown 若以 frontmatter 开头，标记放在 frontmatter 之后，不破坏格式
  const lines = src.split('\n')
  let at = 0
  if (extname(p) === '.md' && lines[0] === '---') at = lines.indexOf('---', 1) + 1
  const has = lines.findIndex((l, i) => i >= at && i <= at + 2 && MARK.test(l))
  if (has >= 0) lines[has] = line
  else lines.splice(at, 0, ...(at ? ['', line] : [line]))
  const out = lines.join('\n')
  if (out !== src) { writeFileSync(p, out); n++ }
}
const visit = (dir) => {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e)
    if (statSync(p).isDirectory()) visit(p)
    else stampFile(p)
  }
}
for (const d of DIRS) { try { visit(join(ROOT, d)) } catch {} }
for (const f of FILES) stampFile(join(ROOT, f))
// JSON 不能写注释，来源写在 $source 字段
{
  const p = join(ROOT, 'icons/icons.json')
  const d = JSON.parse(readFileSync(p, 'utf8'))
  const src = `vincent-ux v${version} · icons/icons.json`
  if (d.$source !== src) { writeFileSync(p, JSON.stringify({ $source: src, ...d, $source: src }, null, 2) + '\n'); n++ }
}
console.log(`✓ 来源标记 v${version}：更新 ${n} 个文件`)
