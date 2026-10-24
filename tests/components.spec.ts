import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.beforeEach(async ({ page }) => {
  await page.goto('/showcase/')
  await expect(page.getByRole('searchbox', { name: '搜索内容', exact: true })).toBeVisible()
})
const browse = (page: import('@playwright/test').Page) => page.getByTestId('browser-demo')

test('搜索、组合筛选和移除条件保持一致', async ({ page }) => {
  const demo = browse(page)
  await demo.getByRole('combobox', { name: '内容类型' }).click()
  await page.getByRole('option', { name: '模板', exact: true }).click()
  await expect(demo.getByText('共 3 项', { exact: true })).toBeVisible()
  await demo.getByRole('searchbox').fill('周')
  await expect(demo.getByText('共 1 项', { exact: true })).toBeVisible()
  await demo.getByRole('button', { name: '清空搜索内容' }).click()
  await expect(demo.getByRole('searchbox')).toBeFocused()
  await expect(demo.getByText('共 3 项', { exact: true })).toBeVisible()
  await demo.getByRole('button', { name: '移除类型：模板' }).click()
  await expect(demo.getByText('共 8 项', { exact: true })).toBeVisible()
})

test('列表与网格切换保留选择，分页有清晰边界', async ({ page }) => {
  const demo = browse(page)
  await demo.getByRole('checkbox', { name: '选择本周运营回顾', exact: true }).check()
  await demo.getByRole('button', { name: '列表', exact: true }).click()
  await expect(demo.locator('.vx-browse-list')).toBeVisible()
  await expect(demo.getByRole('checkbox', { name: '选择本周运营回顾', exact: true })).toBeChecked()
  await expect(demo.getByRole('button', { name: '上一页' })).toBeDisabled()
  const origin = await demo.locator('.vx-collection').evaluate(el => ({ x: el.getBoundingClientRect().left + scrollX, y: el.getBoundingClientRect().top + scrollY }))
  await demo.getByRole('button', { name: '下一页' }).click()
  await expect(demo.locator('.vx-browse-item')).toHaveCount(2)
  expect(await demo.locator('.vx-collection').evaluate(el => ({ x: el.getBoundingClientRect().left + scrollX, y: el.getBoundingClientRect().top + scrollY }))).toEqual(origin)
  await expect(demo.getByRole('button', { name: '下一页' })).toBeDisabled()
  await expect(demo.getByText('已选 1 项', { exact: true })).toBeVisible()
})

test('空结果提供恢复动作；加载和失败可以重试', async ({ page }) => {
  const demo = browse(page)
  await demo.getByRole('searchbox').fill('找不到的内容')
  await expect(demo.getByText('没有匹配的内容', { exact: true })).toBeVisible()
  await demo.getByRole('button', { name: '清除筛选', exact: true }).click()
  await expect(demo.locator('.vx-browse-item')).toHaveCount(6)
  await demo.locator('summary').click()
  await demo.getByRole('button', { name: '演示请求失败' }).click()
  await expect(demo.getByRole('alert')).toHaveText('暂时无法更新内容，请重试。')
  await demo.getByRole('button', { name: '重试', exact: true }).click()
  await expect(demo.locator('.vx-collection')).toHaveAttribute('aria-busy', 'true')
  await expect(demo.locator('.vx-collection')).toHaveAttribute('aria-busy', 'false')
  await expect(demo.getByRole('alert')).toHaveCount(0)
})

test('下拉可键盘操作，表单值和标签正确', async ({ page }) => {
  const form = page.getByRole('form', { name: '表单示例' })
  const select = form.getByRole('combobox', { name: '发布渠道' })
  await select.focus()
  await page.keyboard.press('ArrowDown')
  await expect(page.getByRole('option', { name: '新渠道（暂未开放）' })).toBeDisabled()
  await page.getByRole('option', { name: '网站', exact: true }).click()
  expect(await form.evaluate(el => new FormData(el as HTMLFormElement).get('channel'))).toBe('web')
  await expect(select).toBeFocused()
})

test('错误输入保留独立焦点环；忙碌按钮不会被 Enter 重复提交', async ({ page }) => {
  const form = page.getByRole('form', { name: '表单示例' })
  const price = form.getByRole('spinbutton', { name: '售价（美元）' })
  await price.fill('-1')
  await price.focus()
  await expect(price).toHaveAttribute('aria-invalid', 'true')
  expect(await price.evaluate(el => getComputedStyle(el).outlineStyle)).toBe('solid')
  await expect(price).toHaveAccessibleDescription(/售价要大于 0/)
  await price.fill('28')
  await form.getByRole('combobox').click()
  await page.getByRole('option', { name: '网站', exact: true }).click()
  await form.evaluate(el => { el.setAttribute('data-submits', '0'); el.addEventListener('submit', () => el.setAttribute('data-submits', String(Number(el.getAttribute('data-submits')) + 1))) })
  const save = form.getByRole('button', { name: '保存设置', exact: true })
  await save.click()
  await expect(save).toBeDisabled()
  await page.keyboard.press('Enter')
  await page.keyboard.press('Enter')
  await expect(form).toHaveAttribute('data-submits', '1')
  await expect(form.getByRole('status')).toHaveText('已保存设置。')
})

test('模态和详情抽屉关闭后恢复触发点', async ({ page }) => {
  const trigger = page.getByRole('button', { name: '打开确认框' })
  await trigger.click()
  const dialog = page.getByRole('dialog', { name: '确认发布' })
  await expect(dialog).toBeVisible()
  await expect(dialog).toHaveAttribute('aria-modal', 'true')
  await expect.poll(() => dialog.evaluate(el => el.contains(document.activeElement))).toBe(true)
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press('Tab')
    await expect.poll(() => dialog.evaluate(el => el.contains(document.activeElement))).toBe(true)
  }
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(trigger).toBeFocused()
  const item = browse(page).getByRole('button', { name: '本周运营回顾', exact: true })
  await item.click()
  await expect(page.getByRole('dialog', { name: '本周运营回顾' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(item).toBeFocused()
})

test('页签方向键、关闭焦点和 Delete 可用', async ({ page }) => {
  const overview = page.getByRole('tab', { name: '概览', exact: true })
  await overview.focus()
  await page.keyboard.press('ArrowRight')
  const detail = page.getByRole('tab', { name: '明细', exact: true })
  await expect(detail).toBeFocused()
  await expect(detail).toHaveAttribute('aria-selected', 'true')
  await page.keyboard.press('Delete')
  await expect(detail).toHaveCount(0)
  await expect(overview).toBeFocused()
  await page.getByRole('button', { name: '恢复明细页签' }).click()
  await page.getByRole('tab', { name: '明细', exact: true }).click()
  const close = page.getByRole('button', { name: '关闭明细', exact: true })
  await close.focus()
  await expect(close).toHaveCSS('opacity', '1')
})

test('侧栏折叠仍有名称，关闭聊天恢复入口', async ({ page }) => {
  const app = page.locator('[data-demo-app]')
  await app.getByRole('button', { name: '收起侧栏', exact: true }).click()
  await expect(app.getByRole('button', { name: '商品', exact: true })).toBeVisible()
  await expect(app.getByRole('button', { name: '订单发货', exact: true })).toBeVisible()
  await app.locator('[data-open-chat]').click()
  await app.getByRole('button', { name: '关闭对话', exact: true }).click()
  await expect(app.locator('[data-open-chat]')).toBeFocused()
})

test('导览不会抢输入方向键，目标缺失可自动结束', async ({ page }) => {
  const demo = browse(page)
  await demo.locator('summary').click()
  const trigger = demo.getByRole('button', { name: '开始浏览导览' })
  await trigger.click()
  const guide = page.getByRole('dialog', { name: '浏览内容' })
  await expect(guide.getByText('先找到内容', { exact: true })).toBeVisible()
  await demo.getByRole('searchbox').fill('运营')
  await page.keyboard.press('ArrowRight')
  await expect(guide.getByText('先找到内容', { exact: true })).toBeVisible()
  await guide.getByRole('button', { name: '退出导览', exact: true }).last().click()
  await expect(trigger).toBeFocused()
  await demo.getByRole('button', { name: '验证缺失目标' }).click()
  await expect(guide).toHaveCount(0)
})

test('决定卡失败可重试，执行中所有选项禁用', async ({ page }) => {
  const card = page.locator('.vx-decision').filter({ hasText: '是否应用新的发布设置' })
  await card.getByRole('button', { name: '应用设置' }).click()
  await expect(card.getByRole('button', { name: '稍后处理' })).toBeDisabled()
  await expect(card.getByRole('alert')).toHaveText('连接中断，尚未应用。请重试。')
  await card.getByRole('button', { name: '应用设置' }).click()
  await expect(card.getByRole('status')).toHaveText('已应用设置')
})

for (const theme of ['light', 'dark']) {
  test(`${theme} 主题：展示审计与真实交互区无障碍扫描`, async ({ page }) => {
    await page.locator(`[data-theme-set="${theme}"]`).click()
    await page.waitForTimeout(250)
    const findings = await page.evaluate(() => (window as unknown as { vxAudit: () => unknown[] }).vxAudit())
    expect(findings).toEqual([])
    const a11y = await new AxeBuilder({ page }).include('#browse').include('#interactive').include('#guide').include('#molecules-demo').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
    expect(a11y.violations).toEqual([])
  })
}

test('窄桌面窗口保留可用内容宽度', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 })
  const app = page.locator('[data-demo-app]')
  // 无会话状态必须一起收起；单纯检查横向溢出无法发现逐字竖排。
  await app.locator('.vx-nav-item--sub').evaluate(el => {
    const empty = document.createElement('p')
    empty.className = 'vx-nav-empty'
    empty.textContent = '派给 AI 助理的事会留在这里'
    el.replaceWith(empty)
  })
  await expect(app.locator('.vx-nav-empty')).toBeHidden()
  await expect(app.getByRole('button', { name: '新对话', exact: true })).toBeVisible()
  await app.locator('.vx-nav-account').evaluate(el => {
    const action = document.createElement('button')
    action.className = 'vx-icon-btn'
    action.textContent = '切换'
    el.append(action)
  })
  const accountFits = () => app.locator('.vx-nav-account').evaluate(el => {
    const nav = el.closest('.vx-nav')!.getBoundingClientRect()
    return [...el.children].filter(child => (child as HTMLElement).offsetWidth).every(child => {
      const bounds = child.getBoundingClientRect()
      return bounds.left >= nav.left && bounds.right <= nav.right
    })
  })
  expect(await accountFits()).toBe(true)
  await app.getByRole('button', { name: '收起侧栏', exact: true }).click()
  await expect(app.locator('.vx-nav-empty')).toBeHidden()
  expect(await accountFits()).toBe(true)
  await app.locator('[data-open-chat]').click()
  const renderWidth = await app.locator('.vx-render').evaluate(el => el.clientWidth)
  expect(renderWidth).toBeGreaterThan(250)
  await expect(app.getByRole('textbox', { name: '交代要做的事' })).toBeVisible()
  await page.screenshot({ path: 'test-results/showcase-1024.png', fullPage: true })
})


test('选择卡用键盘切换状态，保存保留所选值', async ({ page }) => {
  const demo = page.getByTestId('guide-demo')
  const cards = demo.getByRole('group', { name: '默认浏览方式' })
  const grid = cards.getByRole('button', { name: /^摘要卡片/ })
  await grid.focus()
  await page.keyboard.press('Space')
  await expect(grid).toHaveAttribute('aria-pressed', 'true')
  await expect(cards.getByRole('button', { name: /^精简列表/ })).toHaveAttribute('aria-pressed', 'false')
  await demo.getByRole('button', { name: '保存浏览偏好' }).click()
  await expect(demo.getByRole('status')).toContainText('摘要卡片')
})

test('导览穿过裁剪容器、允许操作目标，并在完成后恢复入口', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 1024, height: 768 })
  const demo = page.getByTestId('guide-demo')
  const trigger = demo.getByRole('button', { name: '开始功能导览' })
  await trigger.click()
  const guide = page.getByRole('dialog', { name: '浏览偏好导览' })
  const hole = guide.locator('.vx-guide-hole')
  await expect(hole).toHaveAttribute('data-target', 'guide-workspace')
  expect(await guide.evaluate(el => el.parentElement === document.body)).toBe(true)
  await expect(guide).toHaveAttribute('aria-modal', 'false')
  await demo.getByRole('textbox', { name: '工作区名称' }).fill('我的资料库')
  await page.keyboard.press('ArrowRight')
  await expect(guide.getByRole('heading', { name: '工作区名称' })).toBeVisible()
  await demo.locator('[data-tour="guide-workspace"]').evaluate(el => window.scrollBy(0, el.getBoundingClientRect().bottom + 40))
  await expect(hole).toHaveCount(0)
  await expect(guide.getByRole('button', { name: '退出导览' })).toBeVisible()
  await guide.getByRole('button', { name: '下一步' }).click()
  await expect(hole).toHaveAttribute('data-target', 'guide-preference')
  await demo.getByRole('button', { name: /^摘要卡片/ }).click()
  await expect(demo.getByRole('button', { name: /^摘要卡片/ })).toHaveAttribute('aria-pressed', 'true')
  await guide.getByRole('button', { name: '下一步' }).click()
  await expect(hole).toHaveAttribute('data-target', 'guide-save')
  await expect(demo.getByRole('status')).toHaveText('')
  await guide.getByRole('button', { name: '完成导览' }).click()
  await expect(guide).toHaveCount(0)
  await expect(trigger).toBeFocused()
  await expect(demo.getByRole('textbox', { name: '工作区名称' })).toHaveValue('我的资料库')
})


test('待办分组与简化展开行保留键盘操作、详情和焦点恢复', async ({ page }) => {
  const demo = page.getByTestId('molecules-demo')
  const weekly = demo.getByRole('button', { name: /^本周内 3 件/ })
  await weekly.focus()
  await page.keyboard.press('Enter')
  await expect(weekly).toHaveAttribute('aria-expanded', 'true')
  const item = demo.getByRole('button', { name: /^核对本周库存/ })
  await item.click()
  const drawer = page.getByRole('dialog', { name: '核对本周库存' })
  await expect(drawer).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(item).toBeFocused()
  const row = demo.getByRole('button', { name: /^补齐示例商品的资质材料/ })
  await row.focus()
  await page.keyboard.press('Space')
  await expect(row).toHaveAttribute('aria-expanded', 'true')
  await expect(demo.getByText('需要取得认证报告，核对持证主体与商品信息后再提交上架。')).toBeVisible()
  await page.keyboard.press('Space')
  await expect(row).toHaveAttribute('aria-expanded', 'false')
  await expect(demo.getByText('需要取得认证报告，核对持证主体与商品信息后再提交上架。')).toBeHidden()
})

test('弹窗内容增减保持顶部锚点，长内容在正文滚动', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const height of [1000, 360]) {
    await page.setViewportSize({ width: 1024, height })
    await page.getByRole('button', { name: '打开确认框' }).click()
    const dialog = page.getByRole('dialog', { name: '确认发布' })
    await expect(dialog).toBeVisible()
    const origin = await dialog.evaluate(el => { const r = el.getBoundingClientRect(); return { x: r.left, y: r.top } })
    for (const count of [0, 1, 80, 0]) {
      // 动态内容夹具：隔离 item 数量对真实弹窗布局的影响。
      await dialog.locator('.vx-overlay-body').evaluate((el, count) => {
        el.querySelector('[data-layout-items]')?.remove()
        const list = document.createElement('ul')
        list.dataset.layoutItems = ''
        for (let i = 0; i < count; i++) {
          const item = document.createElement('li')
          item.textContent = `第 ${i + 1} 项待发布内容，包含一段用于检查换行和滚动的说明。`
          list.append(item)
        }
        el.append(list)
      }, count)
      expect(await dialog.evaluate(el => { const r = el.getBoundingClientRect(); return { x: r.left, y: r.top } })).toEqual(origin)
      expect((await dialog.boundingBox())!.y + (await dialog.boundingBox())!.height).toBeLessThanOrEqual(height - 23)
      if (count === 80) {
        expect(await dialog.locator('.vx-overlay-body').evaluate(el => el.scrollHeight > el.clientHeight)).toBe(true)
        await expect(dialog.getByRole('button', { name: '发布内容', exact: true })).toBeInViewport()
      }
    }
    await page.keyboard.press('Escape')
    await expect(dialog).toHaveCount(0)
  }
})

test('引导页选项从零项到多项保持正文起点', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.evaluate(() => {
    const fixture = document.createElement('div')
    fixture.id = 'onboard-layout-fixture'
    fixture.innerHTML = '<main class="vx-onboard"><header class="vx-onboard-top">设置工作区</header><div class="vx-onboard-main"><section class="vx-onboard-step"><h1>选择内容</h1><ul></ul></section></div><footer class="vx-onboard-foot">下一步</footer></main>'
    document.body.append(fixture)
  })
  const step = page.locator('#onboard-layout-fixture .vx-onboard-step')
  await expect(step).toHaveCSS('transform', 'none')
  const origin = await step.evaluate(el => ({ x: el.getBoundingClientRect().left + scrollX, y: el.getBoundingClientRect().top + scrollY }))
  for (const count of [1, 8, 0]) {
    await step.locator('ul').evaluate((el, count) => { el.replaceChildren(...Array.from({ length: count }, (_, i) => { const item = document.createElement('li'); item.textContent = `内容选项 ${i + 1}`; return item })) }, count)
    expect(await step.evaluate(el => ({ x: el.getBoundingClientRect().left + scrollX, y: el.getBoundingClientRect().top + scrollY }))).toEqual(origin)
  }
})


test('导览保留完整目标，说明卡避让并在空间允许时保持停靠位置', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 1024, height: 768 })
  const demo = page.getByTestId('guide-demo')
  const target = demo.locator('[data-tour="guide-workspace"]')
  await demo.locator('.sc-guide-sample').evaluate(el => { (el as HTMLElement).style.transform = 'none' })
  await target.evaluate(el => { Object.assign((el as HTMLElement).style, { position: 'fixed', left: '200px', top: '500px', width: '624px', height: '160px', zIndex: '1' }) })
  await demo.getByRole('button', { name: '开始功能导览' }).click()
  const guide = page.getByRole('dialog', { name: '浏览偏好导览' })
  const card = guide.locator('.vx-guide-card')
  const hole = guide.locator('.vx-guide-hole')
  await expect(hole).toHaveAttribute('data-target', 'guide-workspace')
  const geometry = () => guide.evaluate(el => {
    const h = el.querySelector('.vx-guide-hole')!.getBoundingClientRect()
    const c = el.querySelector('.vx-guide-card')!.getBoundingClientRect()
    const t = document.querySelector('[data-tour="guide-workspace"]')!.getBoundingClientRect()
    return { covers: h.left <= t.left && h.top <= t.top && h.right >= t.right && h.bottom >= t.bottom,
      clear: c.right + 10 <= h.left || c.left >= h.right + 10 || c.bottom + 10 <= h.top || c.top >= h.bottom + 10,
      inside: c.left >= 0 && c.top >= 0 && c.right <= innerWidth && c.bottom <= innerHeight }
  })
  await expect.poll(geometry).toEqual({ covers: true, clear: true, inside: true })
  await expect(card).toHaveAttribute('data-placement', 'top')
  const origin = await card.boundingBox()
  await guide.locator('.vx-guide-text').evaluate(el => { el.textContent += ' 更多功能说明。'.repeat(8) })
  await expect.poll(geometry).toEqual({ covers: true, clear: true, inside: true })
  expect((await card.boundingBox())!.y).toBe(origin!.y)
  // 目标移到上方后说明卡换边；不会裁短目标，或移动实际页面功能来迁就卡片。
  await target.evaluate(el => { (el as HTMLElement).style.top = '80px' })
  await expect.poll(geometry).toEqual({ covers: true, clear: true, inside: true })
  await expect(card).toHaveAttribute('data-placement', 'bottom')
  // 高目标占据中间时，改为侧边停靠。
  await target.evaluate(el => { Object.assign((el as HTMLElement).style, { left: '600px', top: '24px', width: '380px', height: '710px' }) })
  await expect.poll(geometry).toEqual({ covers: true, clear: true, inside: true })
  await expect(card).toHaveAttribute('data-placement', 'left')
  await page.setViewportSize({ width: 640, height: 768 })
  await target.evaluate(el => { Object.assign((el as HTMLElement).style, { left: '24px', top: '450px', width: '592px', height: '220px' }) })
  await expect.poll(geometry).toEqual({ covers: true, clear: true, inside: true })
  await expect(card).toHaveAttribute('data-placement', 'top')
})


test('表格只在溢出时提供键盘滚动，不撑开工作区', async ({ page }) => {
  const fixture = page.getByTestId('table-demo')
  const region = fixture.getByRole('region', { name: '处理明细' })
  await expect(region).not.toHaveAttribute('tabindex', '0')
  await fixture.evaluate(el => { (el as HTMLElement).style.width = '420px' })
  await expect(region).toHaveAttribute('tabindex', '0')
  await region.focus()
  await page.keyboard.press('ArrowRight')
  await expect.poll(() => region.evaluate(el => el.scrollLeft)).toBeGreaterThan(0)
  expect(await fixture.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true)
  await fixture.evaluate(el => { (el as HTMLElement).style.width = '' })
  await expect(region).not.toHaveAttribute('tabindex', '0')
})

test('工作区操作不混入页签键盘顺序或页签列表语义', async ({ page }) => {
  const list = page.getByRole('tablist', { name: '内容页签' })
  await expect(list.getByText('工作区操作')).toHaveCount(0)
  await list.getByRole('tab', { name: '概览' }).focus()
  await page.keyboard.press('ArrowRight')
  await expect(list.getByRole('tab', { name: '明细' })).toBeFocused()
  await expect(page.getByRole('tabpanel', { name: '明细' })).toBeVisible()
  await page.keyboard.press('Delete')
  await expect(list.getByRole('tab', { name: '概览' })).toBeFocused()
})


test('导览导航引起宿主重渲染时，每一步只进入一次', async ({ page }) => {
  const demo = page.getByTestId('guide-demo')
  await demo.getByRole('button', { name: '开始功能导览' }).click()
  const guide = page.getByRole('dialog', { name: '浏览偏好导览' })
  await expect(guide.locator('.vx-guide-title')).toHaveText('工作区名称')
  await expect(demo).toHaveAttribute('data-visits', '1')
  await guide.getByRole('button', { name: '下一步' }).click()
  await expect(guide.locator('.vx-guide-title')).toHaveText('浏览方式')
  await expect(demo).toHaveAttribute('data-visits', '2')
})
