import { existsSync, readdirSync, statSync } from 'node:fs'
import { join, posix } from 'node:path'

// Keep canonical documents in the same relative layout in every consumer copy.
export function guideFiles(root) {
  const directories = ['principles', 'patterns', 'components', 'icons', 'templates', 'docs', 'docs/research']
  return ['SKILL.md', 'CONTRIBUTING.md', 'CHANGELOG.md', ...directories.flatMap(dir =>
    readdirSync(join(root, dir)).filter(f => f.endsWith('.md')).map(f => dir + '/' + f))]
}

export const localLinks = /\]\((?![a-z]+:|\/\/)([^\s)]*)\)/gi

export function portableMarkdown(root, path, source, destinations, version) {
  return source.replace(localLinks, (original, url) => {
    if (!url || url.startsWith('#')) return original
    const [file, anchor] = url.split('#')
    const target = posix.normalize(posix.join(posix.dirname(path), file))
    const local = destinations.get(target)
    const suffix = anchor ? '#' + anchor : ''
    if (local) return '](' + (posix.relative(posix.dirname(destinations.get(path)), local) || '.') + suffix + ')'
    if (target === 'showcase/index.html') return '](http://127.0.0.1:5190/showcase/' + suffix + ')'
    if (target === 'examples/embedded/index.html') return '](http://127.0.0.1:5190/examples/embedded/' + suffix + ')'
    const absolute = join(root, target)
    if (!existsSync(absolute)) throw new Error(path + ' 引用了不存在的文件 ' + url)
    const kind = statSync(absolute).isDirectory() ? 'tree' : 'blob'
    return '](https://github.com/shcjveg/vincent-ux/' + kind + '/v' + version + '/' + target + suffix + ')'
  })
}

export function taskIndex(source) {
  const cells = line => line.split('|').slice(1, -1).map(s => s.trim())
  const links = cell => [...cell.matchAll(/\[([^\]]+)\]\(([^\s)]+)\)/g)].map(([, label, url]) => ({ label, url }))
  return source.split('\n').filter(line => line.startsWith('|')).slice(2).map(line => {
    const [task, guidance = '', example = '', acceptance] = cells(line)
    return { task, guidance: links(guidance), example: links(example)[0], acceptance }
  })
}

export function taskPage(markdown, version) {
  const escape = s => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
  const link = ({ label, url }) => {
    const href = /^(?:https?:|#)/.test(url) ? url : posix.normalize(posix.join('docs', url))
    return `<a href="${escape(href)}">${escape(label)}</a>`
  }
  const cards = taskIndex(markdown).map(item => `<article class="vx-card vx-card--padded vx-stack">
      <h2 class="vx-title">${escape(item.task)}</h2><p class="vx-body">${escape(item.acceptance)}</p>
      <p>${item.guidance.map(link).join(' · ')}</p><p>操作案例　${link(item.example)}</p>
    </article>`).join('\n')
  return `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>任务指南 · Vincent UX v${version}</title>
<link rel="stylesheet" href="./styles.css"></head><body><main class="vx-page vx-page--narrow vx-stack">
<header class="vx-pagehead"><div><h1>按任务做设计</h1><p>Vincent UX v${version} · <a href="./principles/README.md">基础原则</a> · <a href="./docs/tasks.md#找不到相近任务时">设计新组件</a></p></div></header>
<label class="vx-field"><span class="vx-field-label">查找任务</span><input type="search" class="vx-input" placeholder="例如：批量、回读、范围"></label>
<p class="vx-meta">副本自带内容库和批量改交期示例。打开完整工作区、门户或报表前，从同版本设计系统仓库启动 npm run showcase。</p>
<p role="status" class="vx-meta"></p>${cards}
</main><script>
const cards = [...document.querySelectorAll('article')];
const input = document.querySelector('input');
function filter() {
  for (const card of cards) card.hidden = !card.textContent.includes(input.value.trim());
  const count = cards.filter(card => !card.hidden).length;
  document.querySelector('[role=status]').textContent = count ? count + ' 个任务' : '没有匹配的任务，可从上方「设计新组件」开始。';
}
input.addEventListener('input', filter); filter();
</script></body></html>\n`
}
