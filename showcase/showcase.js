// 展示页的交互：纯 CSS 外观示例（明暗由目录中的 ThemeToggle 切换）。色板、间距、图标从生成产物读取，保证和源数据一致
import iconCatalog from '../icons/icons.json'
import principles from '../principles/README.md?raw'
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
let previousCategory
let chapterList
for (const section of sections) {
  const category = section.dataset.catalog
  const anchor = document.createElement('a')
  section.tabIndex = -1
  anchor.href = '#' + section.id
  anchor.textContent = $('h2', section).textContent
  if (!category) {
    chapters.append(anchor)
    continue
  }
  if (category !== previousCategory) {
    const group = document.createElement('div')
    group.className = 'vx-index-group'
    const heading = document.createElement('h3')
    heading.className = 'vx-index-label'
    heading.textContent = category
    chapterList = document.createElement('ul')
    group.append(heading, chapterList)
    chapters.append(group)
    previousCategory = category
  }
  chapterList.appendChild(document.createElement('li')).append(anchor)
}

// 共用一份目录。窄屏先读项目指南，页首链接可直接跳到正文里的目录。
const catalogNav = $('#demo-index')
const side = $('.sc-toc')
const guide = $('#handbook')
const narrow = matchMedia('(max-width: 740px)')
function placeCatalog() {
  if (narrow.matches) guide.after(catalogNav)
  else side.append(catalogNav)
}
placeCatalog()
narrow.addEventListener('change', placeCatalog)
const chapterLinks = $$('.sc-catalog a[href^="#"]')
function markChapter() {
  const readingLine = innerHeight * 0.2
  const index = catalogNav.getBoundingClientRect()
  const inCatalog = narrow.matches && index.top <= readingLine && index.bottom > readingLine
  const chapter = sections.findLast(el => el.getBoundingClientRect().top <= readingLine) || sections[0]
  for (const link of chapterLinks) {
    if (!inCatalog && link.hash === '#' + chapter.id) link.setAttribute('aria-current', 'location')
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
// 直达锚点后，挂载主题卡与示例也会移动章节边界。
new ResizeObserver(requestChapterUpdate).observe($('.sc-main'))
markChapter()

// 从演示查规则时，保留示例位置和正在核对的配色。
const guideLinks = $$('main a[href*="handbook.html?doc="], main a[href^="../examples/"]')
function linkToGuides() {
  for (const link of guideLinks) {
    const url = new URL(link.href)
    const origin = link.closest('.sc-sec').id
    if (origin !== 'handbook' && url.searchParams.has('doc')) url.searchParams.set('from', origin)
    if (root.dataset.palette) url.searchParams.set('palette', root.dataset.palette)
    else url.searchParams.delete('palette')
    link.href = url
  }
}

// 色板与配色主题：名称与数值跟随当前明暗与配色
{
  const box = $('[data-swatches]')
  const media = matchMedia('(prefers-color-scheme: dark)')
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
  box.innerHTML = box.dataset.swatches.split(' ').map(name =>
    `<div class="sc-swatch"><i style="background:var(--vx-${name})"></i><b>${name}</b><code></code></div>`).join('')
  function renderSwatches() {
    for (const sample of $$('.sc-swatch', box)) {
      const paint = getComputedStyle($('i', sample))
      $('code', sample).textContent = paint.backgroundImage === 'none' ? paint.backgroundColor : paint.backgroundImage
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
