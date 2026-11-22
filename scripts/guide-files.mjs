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

export function requirementIndex(source) {
  const cells = line => line.split('|').slice(1, -1).map(s => s.trim())
  const links = cell => [...cell.matchAll(/\[([^\]]+)\]\(([^\s)]+)\)/g)].map(([, label, url]) => ({ label, url }))
  return source.split('\n').filter(line => line.startsWith('|')).slice(2).map(line => {
    const [topic, rule, acceptance, guidance = '', example = ''] = cells(line)
    return { topic, rule, acceptance, guidance: links(guidance), examples: links(example) }
  })
}

export function requirementPage(markdown, version, themeScript) {
  const escape = s => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
  const link = ({ label, url }) => {
    const href = /^(?:https?:|#)/.test(url) ? url : posix.normalize(posix.join('docs', url))
    return `<a${/\.html(?:[?#]|$)|\/showcase\//.test(href) ? ' data-vx-theme-link' : ''} href="${escape(href)}">${escape(label)}</a>`
  }
  const cards = requirementIndex(markdown).map(item => `<article class="vx-card vx-card--padded vx-stack">
      <h2 class="vx-title">${escape(item.topic)}</h2><p class="vx-body">${escape(item.rule)}</p>
      <p><strong>验收方法</strong>　${escape(item.acceptance)}</p>
      <p class="vx-nav-links">规范原文　${item.guidance.map(link).join(' · ')}</p>
      <p class="vx-nav-links">应用示例　${item.examples.map(link).join(' · ')}</p>
    </article>`).join('\n')
  return `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>设计要求与验收 · Vincent UX v${version}</title>
<script>${themeScript}</script><link rel="stylesheet" href="./styles.css"></head><body><main class="vx-page vx-page--narrow vx-stack">
<header class="vx-pagehead"><div><h1>设计要求与验收</h1><p>Vincent UX v${version} · <a href="./principles/README.md">基础原则</a> · <a href="./docs/tasks.md#没有现成组件时">设计新组件</a></p></div></header>
<label class="vx-field"><span class="vx-field-label">查找设计要求</span><input type="search" class="vx-input" placeholder="例如：对齐、范围、部分失败"></label>
<p class="vx-meta">本页可直接查阅。链接到本机展示页的示例需先在同版本设计系统仓库运行 <code>npm run showcase</code>。</p>
<p role="status" class="vx-meta"></p>${cards}
</main><script>
const palette = document.documentElement.dataset.palette;
  if (palette) {
    for (const link of document.querySelectorAll('a[data-vx-theme-link]')) {
      const target = new URL(link.href)
      if (!target.searchParams.has('palette')) target.searchParams.set('palette', palette)
      link.href = target.href
    }
  }
const cards = [...document.querySelectorAll('article')];
const input = document.querySelector('input');
function filter() {
  for (const card of cards) card.hidden = !card.textContent.includes(input.value.trim());
  const count = cards.filter(card => !card.hidden).length;
  document.querySelector('[role=status]').textContent = count ? count + ' 项设计要求' : '没有匹配的设计要求，可从上方「设计新组件」开始。';
}
input.addEventListener('input', filter); filter();
</script></body></html>\n`
}
