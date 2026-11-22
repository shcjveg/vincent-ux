// 展示页的交互：纯 CSS 外观示例（明暗由目录中的 ThemeToggle 切换）。色板、间距、图标从生成产物读取，保证和源数据一致
import iconCatalog from '../icons/icons.json'
import principles from '../principles/README.md?raw'
import catalog from '../tokens/dist/palettes.json'
import packageMetadata from '../package.json'
document.querySelector('[data-version]').textContent = `v${packageMetadata.version} · 展示与验收`
const spriteUrl = new URL('../icons/dist/sprite.svg', import.meta.url).href
const root = document.documentElement
const $ = (s, el = document) => el.querySelector(s)
const $$ = (s, el = document) => [...el.querySelectorAll(s)]

// 首页的评审问题直接读取正式原则表。
const principleTable = principles.split('\n\n').find(block => block.startsWith('| 原则 |'))
for (const row of principleTable.split('\n').slice(2)) {
  const [, name, , question] = row.split('|')
  const pair = document.createElement('div')
  for (const [tag, text] of [['dt', name], ['dd', question]]) {
    const field = document.createElement(tag)
    field.textContent = text.trim()
    pair.append(field)
  }
  $('[data-principles]').append(pair)
}

// 正文章节给出名称和所属组，目录与阅读顺序自然一致。
const sections = $$('.sc-main > section[id]')
const chapters = $('[data-chapters]')
let group
for (const section of sections) {
  const category = section.dataset.catalog
  if (category && category !== group) {
    const label = document.createElement('p')
    label.className = 'vx-meta'
    label.textContent = category
    chapters.append(label)
  }
  group = category
  const anchor = document.createElement('a')
  anchor.href = '#' + section.id
  anchor.textContent = $('h2', section).textContent
  chapters.append(anchor)
}

const catalogMenu = $('.sc-catalog')
const narrow = matchMedia('(max-width: 740px)')
const fitMenu = () => { catalogMenu.open = !narrow.matches }
fitMenu()
narrow.addEventListener('change', fitMenu)
catalogMenu.addEventListener('click', event => {
  const link = event.target.closest('a[href^="#"]')
  if (!link || !narrow.matches) return
  catalogMenu.open = false
  const section = document.getElementById(link.hash.slice(1))
  section.tabIndex = -1
  section.focus({ preventScroll: true })
})
catalogMenu.addEventListener('keydown', event => {
  if (event.key === 'Escape' && catalogMenu.open && !event.defaultPrevented && !event.target.closest('[role="combobox"]')) {
    catalogMenu.open = false
    $('summary', catalogMenu).focus()
  }
})
const chapterLinks = $$('.sc-catalog a[href^="#"]')
function markChapter() {
  const chapter = sections.findLast(el => el.getBoundingClientRect().top <= innerHeight * 0.2) || sections[0]
  for (const link of chapterLinks) {
    if (link.hash === '#' + chapter.id) link.setAttribute('aria-current', 'location')
    else link.removeAttribute('aria-current')
  }
}
let pendingFrame
function requestChapterUpdate() {
  if (pendingFrame) return
  pendingFrame = requestAnimationFrame(() => { pendingFrame = undefined; markChapter() })
}
window.addEventListener('scroll', requestChapterUpdate, { passive: true })
window.addEventListener('resize', requestChapterUpdate)
markChapter()

// 从演示查规则时，保留示例位置和正在核对的配色。
const guideLinks = $$('main a[href*="handbook.html?doc="]')
function linkToGuides() {
  for (const link of guideLinks) {
    const url = new URL(link.href)
    const origin = link.closest('.sc-sec').id
    if (origin !== 'handbook') url.searchParams.set('from', origin)
    if (root.dataset.palette) url.searchParams.set('palette', root.dataset.palette)
    else url.searchParams.delete('palette')
    link.href = url
  }
}

// 色板与配色主题：名称与数值跟随当前明暗与配色
{
  const palettes = Object.fromEntries(catalog.map(p => [p.id, p]))
  const box = $('[data-swatches]'), grid = $('[data-palettes]')
  const media = matchMedia('(prefers-color-scheme: dark)')
  const current = () => root.dataset.palette || catalog.find(p => p.default).id
  // 切换只改根元素属性；导航里的配色选择器（React Select）、目录的明暗切换与这里都监听根元素属性
  const apply = (id) => { if (palettes[id]?.default) delete root.dataset.palette; else root.dataset.palette = id }
  const requested = new URL(location.href).searchParams.get('palette')
  if (requested && Object.hasOwn(palettes, requested)) apply(requested)
  linkToGuides()
  new MutationObserver(changes => {
    if (changes.some(change => change.attributeName === 'data-palette')) {
      const url = new URL(location.href)
      if (root.dataset.palette) url.searchParams.set('palette', root.dataset.palette)
      else url.searchParams.delete('palette')
      history.replaceState(history.state, '', url)
      linkToGuides()
    }
    renderSwatches()
  }).observe(root, { attributes: true, attributeFilter: ['data-palette', 'data-theme'] })
  media.addEventListener('change', () => renderSwatches())
  // 色卡就是该主题的一小块界面。与门户共用按钮 CSS，切换明暗时就地更新。
  grid.innerHTML = Object.entries(palettes).map(([id, p]) => `
    <article class="sc-palette vx-theme" data-palette="${id}">
      <h4>${p.name}</h4>
      <dl class="sc-palette-roles" data-vx-swatch>
        <div><dt>页面</dt><dd class="sc-palette-paper"></dd></div>
        <div><dt>正文</dt><dd class="sc-palette-ink"></dd></div>
        <div><dt>操作</dt><dd class="sc-palette-action"></dd></div>
      </dl>
      <button type="button" class="vx-btn vx-btn--sm vx-btn--primary" data-palette-id="${id}" aria-label="应用配色 · ${p.name}">
        应用配色
      </button>
    </article>`).join('')
  grid.addEventListener('click', event => {
    const button = event.target.closest('button[data-palette-id]')
    if (button) apply(button.dataset.paletteId)
  })
  box.innerHTML = box.dataset.swatches.split(' ').map(name =>
    `<div class="sc-swatch"><i style="background:var(--vx-${name})"></i><b>${name}</b><code></code></div>`).join('')
  function renderSwatches() {
    for (const sample of $$('.sc-swatch', box)) {
      $('code', sample).textContent = getComputedStyle($('i', sample)).backgroundColor
    }
    for (const button of $$('[data-palette-id]', grid)) {
      const id = button.dataset.paletteId, card = button.closest('article')
      const selected = id === current()
      card.toggleAttribute('data-current', selected)
      button.setAttribute('aria-pressed', String(selected))
      button.textContent = selected ? '✓ 应用配色' : '应用配色'
    }
  }
  renderSwatches()
}

// 直接按图标含义目录铺开，深链接首次定位时图标区已有完整高度。
const iconNames = Object.values(iconCatalog.meanings).flatMap(group => Object.keys(group).filter(name => !name.startsWith('$')))
$('[data-icons]').innerHTML = iconNames.map(id =>
  `<div class="sc-icon"><svg class="vx-icon"><use href="${spriteUrl}#${id}"/></svg>${id}</div>`).join('')

// 间距与圆角：直接用变量画出来
const spaces = $('[data-spaces]')
if (spaces)
  spaces.innerHTML = spaces.dataset.spaces
    .split(' ')
    .map((n) => `<div class="sc-swatch"><i style="width:var(--vx-space-${n});height:var(--vx-space-${n});min-height:4px;background:var(--vx-brand-accent-bright)"></i><code>space-${n}</code></div>`)
    .join('')
const radii = $('[data-radii]')
if (radii)
  radii.innerHTML = radii.dataset.radii
    .split(' ')
    .map((n) => `<div class="sc-swatch"><i style="width:64px;height:48px;border-radius:var(--vx-radius-${n});background:var(--vx-surface-card);box-shadow:var(--vx-shadow-card)"></i><code>radius-${n}</code></div>`)
    .join('')

// 外观示例中的轻交互；完整交互与状态由 react.tsx 的实际组件展示。
for (const svg of $$('svg:not([aria-label])')) svg.setAttribute('aria-hidden', 'true')

for (const choice of $$('.vx-choice')) choice.addEventListener('click', () => {
  const group = choice.closest('[data-choice-group="single"]')
  if (group) for (const item of $$('.vx-choice', group)) item.setAttribute('aria-pressed', String(item === choice))
  else choice.setAttribute('aria-pressed', String(choice.getAttribute('aria-pressed') !== 'true'))
})

const pin = $('[data-pin]')
pin.addEventListener('click', () => {
  const pressed = pin.getAttribute('aria-pressed') !== 'true'
  pin.setAttribute('aria-pressed', String(pressed))
  $('span', pin).textContent = pressed ? '已置顶' : '置顶'
})
const fileInput = $('.vx-dropzone input[type=file]')
fileInput.addEventListener('change', () => {
  $('span', fileInput.parentElement).textContent = fileInput.files[0]?.name || '选择本地素材包'
})
