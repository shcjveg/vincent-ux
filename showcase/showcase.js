// 展示页的交互：纯 CSS 外观示例（明暗由左下角 ThemeToggle 切换）。色板、间距、图标从生成产物读取，保证和源数据一致
import packageMetadata from '../package.json'
document.querySelector('[data-version]').textContent = `v${packageMetadata.version} · 展示与验收`
const spriteUrl = new URL('../icons/dist/sprite.svg', import.meta.url).href
const tokensUrl = new URL('../tokens/dist/tokens.json', import.meta.url).href
const root = document.documentElement
const $ = (s, el = document) => el.querySelector(s)
const $$ = (s, el = document) => [...el.querySelectorAll(s)]
let renderSwatches = () => {}

// 色板与配色主题：名称与数值跟随当前明暗与配色
fetch(tokensUrl)
  .then((r) => r.json())
  .then(({ tokens, palettes = {} }) => {
    const byName = Object.fromEntries(tokens.map((t) => [t.name, t]))
    const box = $('[data-swatches]'), cards = $('[data-palettes]')
    const current = () => root.dataset.palette || Object.keys(palettes).find((id) => palettes[id].default)
    // 某套配色在当前明暗下的取值：主题覆盖了就用覆盖值，否则用默认配色
    const value = (id, name) => {
      const mode = root.dataset.theme || 'light', o = palettes[id]?.tokens.find((t) => t.var === `--vx-${name}`)
      return o ? o[mode] : byName[name]?.[mode] ?? byName[name]?.value
    }
    // 切换只改根元素属性；导航里的配色选择器（React Select）、左下角明暗切换与这里都监听根元素属性
    const apply = (id) => { if (palettes[id]?.default) delete root.dataset.palette; else root.dataset.palette = id }
    new MutationObserver(() => renderSwatches()).observe(root, { attributes: true, attributeFilter: ['data-palette', 'data-theme'] })
    cards.addEventListener('click', (e) => { const card = e.target.closest('[data-palette-id]'); if (card) apply(card.dataset.paletteId) })
    renderSwatches = () => {
      box.innerHTML = box.dataset.swatches
        .split(' ')
        .map((n) => `<div class="sc-swatch"><i style="background:var(--vx-${n})"></i><b>${n}</b><code>${byName[n] ? value(current(), n) : '缺失'}</code></div>`)
        .join('')
      cards.innerHTML = Object.entries(palettes).map(([id, p]) => {
        const c = (n) => value(id, n)
        return `<button type="button" class="sc-palette" data-palette-id="${id}" aria-pressed="${id === current()}">
          <span class="sc-palette-preview" style="background:${c('surface-shell')};color:${c('text-primary')}">
            <div style="background:${c('surface-card')}"><span style="color:${c('text-tertiary')}">本月成交</span><strong data-tone="accent" style="color:${c('brand-accent')}">¥ 82,400</strong></div>
            <div style="background:${c('surface-card')}"><span style="color:${c('text-tertiary')}">超时</span><strong data-tone="critical" style="color:${c('brand-critical')}">3 件</strong></div>
            <span class="sc-palette-viz" style="grid-column:1/-1">${[1, 2, 3, 4, 5, 6].map((i) => `<i style="background:${c(`viz-series-${i}`)}"></i>`).join('')}</span>
          </span>
          <b>${p.name}</b>
          <p>${p.axes.warmCool} · ${p.axes.softHard} · ${p.axes.clearGrayish}　${p.tone}</p>
          <p>${p.scenarios}</p>
        </button>`
      }).join('')
    }
    renderSwatches()
  })

// 图标：从 sprite 里列出全部含义
fetch(spriteUrl)
  .then((r) => r.text())
  .then((svg) => {
    const ids = [...svg.matchAll(/<symbol id="([^"]+)"/g)].map((m) => m[1])
    $('[data-icons]').innerHTML = ids
      .map((id) => `<div class="sc-icon"><svg class="vx-icon"><use href="${spriteUrl}#${id}"/></svg>${id}</div>`)
      .join('')
  })

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
for (const button of $$('.vx-nav-item')) button.title = $('.vx-nav-item-label', button)?.textContent || ''
for (const button of $$('button.vx-switch')) button.addEventListener('click', () => button.setAttribute('aria-checked', String(button.getAttribute('aria-checked') !== 'true')))
for (const seg of $$('.vx-seg')) for (const button of $$('button', seg)) button.addEventListener('click', () => {
  for (const item of $$('button', seg)) item.setAttribute('aria-pressed', String(item === button))
})

for (const choice of $$('.vx-choice')) choice.addEventListener('click', () => {
  const group = choice.closest('[data-choice-group="single"]')
  if (group) for (const item of $$('.vx-choice', group)) item.setAttribute('aria-pressed', String(item === choice))
  else choice.setAttribute('aria-pressed', String(choice.getAttribute('aria-pressed') !== 'true'))
})
