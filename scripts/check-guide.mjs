import { existsSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { guideFiles, localLinks, requirementIndex } from './guide-files.mjs'

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

// 展示页的指南链接也应随原文章节的改名一起更新。
for (const page of ['showcase/index.html', 'showcase/handbook.html']) {
  for (const [, href] of read(page).matchAll(/href="([^"]*\?doc=[^"]+)"/g)) {
    const url = new URL(href, 'https://example.org/showcase/')
    const issue = checkLink('README.md', url.searchParams.get('doc') + url.hash)
    if (issue) errors.push(page + ' ' + issue)
  }
}

const requirements = requirementIndex(read('docs/tasks.md'))
if (!requirements.length) errors.push('设计要求与验收索引为空')
for (const { topic, rule, acceptance, guidance, examples } of requirements) {
  if (!topic || !rule || !acceptance || !guidance.length || !examples.length)
    errors.push('请补全设计要求、验收方法及对应的规范与示例：' + topic)
}
for (const err of errors) console.error(err)
if (errors.length) process.exitCode = 1
else console.log(`✓ 指南链接有效，${requirements.length} 项设计要求均附验收方法与示例`)
