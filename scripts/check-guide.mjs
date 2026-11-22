import { existsSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { guideFiles, localLinks, taskIndex } from './guide-files.mjs'

const root = fileURLToPath(new URL('..', import.meta.url))
const read = path => readFileSync(join(root, path), 'utf8')
const errors = []
function checkLink(path, url) {
  const [file, fragment] = url.split('#')
  const target = resolve(root, dirname(path), file || path.split('/').at(-1))
  if (!target.startsWith(resolve(root) + sep) || !existsSync(target)) return '缺少目标 ' + url
  if (!fragment || !statSync(target).isFile()) return
  const source = readFileSync(target, 'utf8')
  const anchor = decodeURIComponent(fragment)
  if (target.endsWith('.html')) {
    if (!source.includes('id="' + anchor + '"')) return '缺少页面位置 ' + url
  } else if (target.endsWith('.md')) {
    const headings = [...source.matchAll(/^#{1,6}\s+(.+)$/gm)].map(m => m[1].trim().toLowerCase()
      .replace(/[^\p{L}\p{N}\p{M}\s_-]/gu, '').replace(/ /g, '-'))
    if (!headings.includes(anchor) && !source.includes('id="' + anchor + '"')) return '缺少小节 ' + url
  }
}

for (const path of [...guideFiles(root), 'README.md']) {
  const source = read(path).replace(/^```[^\n]*\n[\s\S]*?^```\s*$/gm, '')
  for (const [, url] of source.matchAll(localLinks)) {
    const issue = checkLink(path, url)
    if (issue) errors.push(path + ' ' + issue)
  }
}

const tasks = taskIndex(read('docs/tasks.md'))
for (const { task, guidance, example, acceptance } of tasks) {
  if (!task || !guidance.length || !example || !acceptance)
    errors.push('请补全任务的判断依据、案例与验收：' + task)
}
for (const err of errors) console.error(err)
if (errors.length) process.exitCode = 1
else console.log(`✓ 指南链接及 ${tasks.length} 项任务的规则、案例与回归入口一致`)
