// 文档、源码与验收案例均来自当前检出的版本，按需加载。
import { marked } from 'marked'
import metadata from '../package.json'

const files = import.meta.glob([
  '../*.md', '../{components,docs,icons,patterns,principles,templates}/*.md', '../docs/research/*.md',
  '../{components/react,examples/embedded,showcase}/*.tsx', '../scripts/*.mjs', '../tests/*.{ts,mjs}',
  '../tokens/src/*.json', '../LICENSE',
], { query: '?raw', import: 'default' })

const siteRoot = new URL('../', location.href)
const canonicalRoot = new URL('http://127.0.0.1:5190/')
const context = new URLSearchParams(location.search)
const file = context.get('doc') || 'docs/tasks.md'
const palette = context.get('palette')
const from = context.get('from')
if (palette) document.documentElement.dataset.palette = palette
const article = document.querySelector('article')
function readerUrl(path, hash = '') {
  const url = new URL('handbook.html', location.href)
  url.searchParams.set('doc', path)
  if (from) url.searchParams.set('from', from)
  if (palette) url.searchParams.set('palette', palette)
  url.hash = hash
  return url.href
}
const home = document.querySelector('.hb-nav a')
const preview = new URL(home.href)
if (palette) preview.searchParams.set('palette', palette)
home.href = preview.href
if (from) {
  const back = document.createElement('a')
  preview.hash = from
  back.href = preview.href
  back.textContent = '回到刚才的演示'
  home.after(back)
}
document.querySelector('[data-version]').textContent = 'Vincent UX v' + metadata.version

function resolveLink(href) {
  // 相对路径以 Markdown 所在的目录为准。规范中写给本机开发服务器的案例也使用当前站点。
  const url = new URL(href, new URL(file, canonicalRoot))
  if (url.origin !== canonicalRoot.origin) return href
  const path = decodeURI(url.pathname.slice(1))
  if (files['../' + path] || (path.endsWith('/') && directoryFiles(path).length)) return readerUrl(path, url.hash)
  const target = new URL(path + url.search + url.hash, siteRoot)
  if (palette && path.startsWith('showcase/') && !target.searchParams.has('palette')) target.searchParams.set('palette', palette)
  return target.href
}

function directoryFiles(path) {
  return Object.keys(files).filter(key => key.startsWith('../' + path) && !key.slice(3 + path.length).includes('/'))
}

// 任务索引逐项阅读，规则、案例和验收条件在小屏也能一起看见。
function presentTasks(table) {
  const list = document.createElement('div')
  list.className = 'hb-tasks'
  const labels = [...table.tHead.rows[0].cells].map(cell => cell.textContent)
  for (const row of table.tBodies[0].rows) {
    const [name, ...fields] = row.cells
    const item = document.createElement('section')
    const title = document.createElement('h2')
    title.textContent = name.textContent
    const body = document.createElement('dl')
    fields.forEach((cell, index) => {
      const term = document.createElement('dt')
      term.textContent = labels[index + 1]
      const value = document.createElement('dd')
      value.append(...cell.childNodes)
      body.append(term, value)
    })
    item.append(title, body)
    list.append(item)
  }
  table.replaceWith(list)
}

function indexHeadings() {
  const seen = new Set()
  for (const heading of article.querySelectorAll('h1,h2,h3,h4,h5,h6')) {
    const base = heading.textContent.trim().toLowerCase().replace(/[^\p{L}\p{N}\p{M}\s_-]/gu, '').replace(/ /g, '-')
    let id = base
    for (let n = 1; seen.has(id); n++) id = base + '-' + n
    heading.id = id
    seen.add(id)
  }
  const sections = [...article.querySelectorAll('h2')]
  if (sections.length < 2) return
  const nav = document.createElement('nav')
  nav.className = 'hb-sections'
  nav.setAttribute('aria-label', '本页章节')
  const label = document.createElement('p')
  label.className = 'vx-meta'
  label.textContent = '本页章节'
  nav.append(label)
  for (const heading of sections) {
    const link = document.createElement('a')
    link.href = '#' + heading.id
    link.textContent = heading.textContent
    nav.append(link)
  }
  const title = article.querySelector('h1')
  const lead = title?.nextElementSibling
  const introduction = lead?.tagName === 'P' ? lead : title
  introduction?.after(nav)
}

function showText(title, content) {
  const heading = document.createElement('h1')
  heading.textContent = title
  article.append(heading, content)
}

async function showPage() {
  const loadFile = files['../' + file]
  if (loadFile && file.endsWith('.md')) {
    const markdown = (await loadFile()).replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '')
    article.innerHTML = marked.parse(markdown, { headerIds: false, mangle: false })
    for (const link of article.querySelectorAll('a[href]')) link.href = resolveLink(link.getAttribute('href'))
    if (file === 'docs/tasks.md') presentTasks(article.querySelector('table'))
    for (const table of article.querySelectorAll('table')) {
      const wrapper = document.createElement('div')
      wrapper.className = 'hb-table'
      table.replaceWith(wrapper)
      wrapper.append(table)
    }
    indexHeadings()
  } else if (loadFile) {
    const pre = document.createElement('pre')
    pre.textContent = await loadFile()
    showText(file, pre)
  } else if (file.endsWith('/') && directoryFiles(file).length) {
    const list = document.createElement('ul')
    for (const key of directoryFiles(file)) {
      const link = document.createElement('a')
      link.href = readerUrl(key.slice(3))
      link.textContent = key.split('/').at(-1)
      list.appendChild(document.createElement('li')).append(link)
    }
    showText(file, list)
  } else {
    const message = document.createElement('p')
    message.textContent = '打开项目使用指南，选择当前版本的主题。'
    showText('找不到这份指南', message)
  }

  // 只把真正需要横向滚动的表格和代码块加入键盘顺序。
  const overflow = new ResizeObserver(entries => {
    for (const { target } of entries) {
      if (target.scrollWidth > target.clientWidth) target.tabIndex = 0
      else target.removeAttribute('tabindex')
    }
  })
  for (const block of article.querySelectorAll('.hb-table, pre')) overflow.observe(block)
  document.title = article.querySelector('h1').textContent + ' · Vincent UX'
  if (location.hash) document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView()
}

try {
  const mode = localStorage.getItem('vx-theme')
  if (mode === 'dark' || mode === 'light') document.documentElement.dataset.theme = mode
} catch { /* 无存储权限时沿用系统明暗。 */ }
showPage()
