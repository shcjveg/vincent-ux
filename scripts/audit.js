// vincent-ux v1.4.1 · scripts/audit.js
// 规则检查（在浏览器里跑）：把视觉与交互原则里能机器判断的部分变成断言，截图评审只看机器判断不了的。
// 用法：页面里注入本文件后调用 window.vxAudit()，返回 [{ rule, text, where }]；空数组表示已覆盖规则无发现，不等于完整可访问性认证。
// Playwright：await page.addScriptTag({ path }); const r = await page.evaluate(() => vxAudit())
// 规则与出处
//   dot       入口只用点、选中态保留；处理终点角标放卡片左上角，列表行不重复     patterns/todo-and-badge.md
//             [data-entry]：页面里本身就是入口的元素（如「更多」里的列表行、链路节点），可以带红点
//   critical / accent 的合法出处：设计系统的语义类，或用 data-tone 声明了语气的元素
//   primary   每个区域最多一个主按钮                                                      principles/visual.md
//   critical  危急色只经由语义类出现（红点、危急标签、亏损金额等），页面不自己上朱红           principles/visual.md
//   accent    强调色只经由语义类出现（钱、选中、等你动手）                                    principles/visual.md
//   due       时限不用危急标签表达，用墨色加粗（.vx-due）                                      patterns/decision.md
//   ai        页面里的 AI 入口带对话图标，且不带「去别页」的箭头                               patterns/delegate.md
//   fold      收起区的摘要行带计数（「N 项 展开」）                                          patterns/todo-and-badge.md
;(function () {
  const CRITICAL_OK = [
    '.vx-dot', '.vx-badge', '.vx-tag--critical', '.vx-text-critical', '.vx-money--neg', '.vx-btn--danger',
    '.vx-field-error', '.vx-stat-delta--down', '.vx-bar--critical', '.vx-callout--critical', '[data-state="blocked"]', '[data-tone="critical"]',
  ]
  const ACCENT_OK = [
    'a[href]', '.vx-stat-delta--up', '.vx-money--accent', '.vx-tag--accent', '.vx-money', '.vx-stat-value--accent', '.vx-bar', '.vx-spark', '.vx-callout--accent', '.vx-dot--accent',
    '.vx-choice', '.vx-guide-progress', '.vx-text-accent', '[data-tone="accent"]', '[aria-pressed="true"]', '[aria-selected="true"]',
  ]
  const ENTRY = '.vx-nav-item, .vx-tab, .vx-todo-group-head, [data-entry]'
  const REGION = '[data-vx-region], .vx-browse-item, .vx-card, .vx-decision, .vx-flow, .vx-chat, .vx-guide-card, .vx-pagehead, .vx-dialog, .vx-drawer'

  const visible = (el) => {
    const r = el.getBoundingClientRect()
    return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden' && !el.closest('[hidden], [inert], [aria-hidden="true"]')
  }
  const text = (el) => (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40)
  const where = (el) => {
    const parts = []
    for (let n = el; n && n !== document.body && parts.length < 3; n = n.parentElement) {
      const c = [...n.classList].find((x) => x.startsWith('vx-')) || [...n.classList][0]
      if (c) parts.unshift('.' + c)
    }
    return parts.join(' > ')
  }
  // 把设计变量解析成浏览器里的实际颜色，再和每个元素的计算值比较
  const resolve = (v) => {
    const p = document.createElement('i')
    p.style.color = `var(${v})`
    document.body.appendChild(p)
    const c = getComputedStyle(p).color
    p.remove()
    return c
  }

  window.vxAudit = function (root = document) {
    const out = []
    const add = (rule, el, extra) => out.push({ rule, text: extra || text(el), where: where(el) })
    const all = [...root.querySelectorAll('*')].filter(visible)

    for (const d of root.querySelectorAll('.vx-dot:not(.vx-dot--neutral):not(.vx-dot--accent)')) {
      if (!visible(d) || d.closest('[data-vx-swatch]')) continue
      const endpoint = d.closest('[data-attention="endpoint"]')
      if (endpoint) {
        const card = d.closest('.vx-card, .vx-decision, .vx-task-card, [data-pending-card="true"]')
        if (!card || !d.classList.contains('vx-attention-corner') || d.closest('h2, h3, h4, .vx-row-title, .vx-todo')) add('dot', d, '终点角标必须属于处理卡片，不进入标题行或待办列表')
        else {
          const r = d.getBoundingClientRect(), c = card.getBoundingClientRect()
          if (r.left - c.left > 12 || r.top - c.top > 12 || r.left < c.left || r.top < c.top) add('dot', d, '终点角标未放在卡片左上角')
        }
        continue
      }
      const entry = d.closest(ENTRY)
      if (!entry) add('dot', d, '内容里的红点：' + text(d.parentElement))
    }

    for (const badge of root.querySelectorAll('.vx-nav-item .vx-badge, .vx-nav-item .vx-count, .vx-tab .vx-badge, .vx-todo .vx-dot'))
      if (visible(badge)) add('dot', badge, '导航入口不计数，待办列表项不重复红点')

    const regions = new Map()
    for (const b of root.querySelectorAll('.vx-btn--primary')) {
      if (!visible(b) || b.disabled) continue
      const r = b.closest(REGION) || document.body
      regions.set(r, [...(regions.get(r) || []), b])
    }
    for (const [r, bs] of regions) if (bs.length > 1) add('primary', r, `${bs.length} 个主按钮：${bs.map(text).join(' / ')}`)

    const critical = resolve('--vx-brand-critical')
    const accent = resolve('--vx-brand-accent')
    for (const el of all) {
      if (el.closest('[data-vx-swatch]')) continue
      const cs = getComputedStyle(el)
      const own = (prop) => cs[prop] !== (el.parentElement ? getComputedStyle(el.parentElement)[prop] : '')
      for (const [rule, color, ok] of [['critical', critical, CRITICAL_OK], ['accent', accent, ACCENT_OK]]) {
        const hit = (cs.color === color && own('color') && el.childNodes.length) || cs.backgroundColor === color
        if (hit && !ok.some((s) => el.closest(s))) add(rule, el)
      }
    }

    for (const t of root.querySelectorAll('.vx-tag--critical'))
      if (visible(t) && /剩|小时|天内|天后|前$/.test(text(t))) add('due', t, '时限用了危急标签：' + text(t))

    for (const b of root.querySelectorAll('button, a')) {
      if (!visible(b) || b.closest('.vx-chat, .vx-nav, .vx-guide-card, .vx-ask, .vx-fold-head, .vx-todo')) continue
      if (!/AI 助理|再问问|在对话里/.test(text(b))) continue
      if (!b.querySelector('[data-icon="chat"], use[href$="#chat"]')) add('ai', b, 'AI 入口缺对话图标：' + text(b))
      if (b.querySelector('[data-icon="next"], use[href$="#next"]')) add('ai', b, 'AI 入口带了跳页箭头：' + text(b))
    }

    // 行式收起区是「一行对象展开看详情」，摘要就是对象本身，不要求计数
    for (const h of root.querySelectorAll('.vx-fold[data-counted="true"] > .vx-fold-head'))
      if (visible(h) && !h.querySelector('.vx-count')) add('fold', h, '收起区没有计数：' + text(h.querySelector('.vx-fold-summary') || h))

    // 基础语义检查；不能替代辅助技术实测或完整的可访问名称计算。
    const name = el => el.getAttribute('aria-label') || (el.getAttribute('aria-labelledby') || '').split(' ').map(id => document.getElementById(id)?.textContent || '').join('').trim() || [...(el.labels || [])].map(label => label.textContent).join('').trim() || (el.matches('button, a') ? el.textContent.trim() : '') || el.getAttribute('title')
    for (const el of all.filter(el => el.matches('button, a[href], input:not([type="hidden"]), textarea, select'))) {
      if (!name(el)) add('label', el, '控件缺少可访问名称')
      if (el.matches('[data-loading="true"]') && !el.disabled && el.getAttribute('aria-disabled') !== 'true') add('busy', el, '加载按钮未禁用')
      if (el.getAttribute('aria-controls') && !document.getElementById(el.getAttribute('aria-controls'))) add('controls', el, 'aria-controls 目标不存在')
    }
    return out
  }
})()
