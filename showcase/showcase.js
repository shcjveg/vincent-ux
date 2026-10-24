// 展示页的交互：主题切换、收起区、模板演示。色板、间距、图标从生成产物读取，保证和源数据一致
const spriteUrl = new URL('../icons/dist/sprite.svg', import.meta.url).href
const tokensUrl = new URL('../tokens/dist/tokens.json', import.meta.url).href
const root = document.documentElement
const $ = (s, el = document) => el.querySelector(s)
const $$ = (s, el = document) => [...el.querySelectorAll(s)]
let renderSwatches = () => {}

// 主题：浅色 / 暗色
for (const b of $$('[data-theme-set]')) {
  b.addEventListener('click', () => {
    root.dataset.theme = b.dataset.themeSet
    renderSwatches()
    for (const x of $$('[data-theme-set]')) x.setAttribute('aria-pressed', String(x === b))
  })
}

// 收起区
for (const f of $$('[data-fold]')) {
  const head = $('.vx-fold-head', f)
  const body = $('.vx-fold-body', f)
  const act = $('.vx-fold-act', f)
  head.addEventListener('click', () => {
    const open = head.getAttribute('aria-expanded') !== 'true'
    head.setAttribute('aria-expanded', String(open))
    f.dataset.open = String(open)
    body.hidden = !open
    // 行式收起区只有箭头；普通收起区的文字在计数之后
    const word = [...act.childNodes].find((n) => n.nodeType === 3 && /展开|收起/.test(n.textContent))
    if (word) word.textContent = open ? '收起' : '展开'
  })
}

// 模板演示：收起左栏、打开 / 关闭对话；对话打开时右下角入口隐藏
const app = $('[data-demo-app]')
if (app) {
  const chat = $('[data-demo-chat]', app)
  const ask = $('[data-open-chat]', app)
  $('[data-toggle-nav]', app).addEventListener('click', (e) => {
    const collapsed = app.dataset.nav !== 'collapsed'
    app.dataset.nav = collapsed ? 'collapsed' : ''
    e.currentTarget.setAttribute('aria-label', collapsed ? '展开侧栏' : '收起侧栏')
    $('use', e.currentTarget).setAttribute('href', `${spriteUrl}#${collapsed ? 'expand-sidebar' : 'collapse-sidebar'}`)
  })
  ask.addEventListener('click', () => {
    chat.hidden = false
    ask.hidden = true
    $('textarea', chat).focus()
  })
  $('[data-close-chat]', app).addEventListener('click', () => {
    chat.hidden = true
    ask.hidden = false
    ask.focus()
  })
  const ta = $('textarea', chat)
  const send = $('.vx-composer-send', chat)
  ta.addEventListener('input', () => (send.disabled = !ta.value.trim()))
}

// 色板：名称与数值跟随当前主题
fetch(tokensUrl)
  .then((r) => r.json())
  .then(({ tokens }) => {
    const byName = Object.fromEntries(tokens.map((t) => [t.name, t]))
    const box = $('[data-swatches]')
    renderSwatches = () => { box.innerHTML = box.dataset.swatches
      .split(' ')
      .map((n) => {
        const t = byName[n]
        return `<div class="sc-swatch"><i style="background:var(--vx-${n})"></i><b>${n}</b><code>${t ? (t[root.dataset.theme || 'light'] ?? t.value) : '缺失'}</code></div>`
      })
      .join('') }
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
for (const seg of $$('.vx-seg:not(.sc-theme)')) for (const button of $$('button', seg)) button.addEventListener('click', () => {
  for (const item of $$('button', seg)) item.setAttribute('aria-pressed', String(item === button))
})

for (const choice of $$('.vx-choice')) choice.addEventListener('click', () => {
  const group = choice.closest('[data-choice-group="single"]')
  if (group) for (const item of $$('.vx-choice', group)) item.setAttribute('aria-pressed', String(item === choice))
  else choice.setAttribute('aria-pressed', String(choice.getAttribute('aria-pressed') !== 'true'))
})
