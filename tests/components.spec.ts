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

test('真实工作区侧栏折叠仍有名称，关闭聊天恢复页签焦点', async ({ page }) => {
  const app = page.getByTestId('session-workspace')
  await app.getByRole('button', { name: '收起示例导航', exact: true }).click()
  await expect(app.getByRole('button', { name: '引用资料', exact: true })).toBeVisible()
  await expect(app.getByRole('button', { name: '资料核对', exact: true })).toBeVisible()
  await app.getByRole('button',{name:'讨论这份草稿',exact:true}).click()
  await app.getByRole('button', { name: '收起示例对话', exact: true }).click()
  await expect(app.getByRole('tab',{name:'方案草稿',exact:true})).toBeFocused()
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
  await card.getByRole('button', { name: '确认方案' }).click()
  await expect(card.getByRole('radio', { name: '稍后处理' })).toBeDisabled()
  await expect(card.getByRole('alert')).toHaveText('连接中断，尚未应用。请重试。')
  await card.getByRole('button', { name: '确认方案' }).click()
  await expect(card.getByRole('status')).toHaveText('已应用设置')
})

test('决定卡自定义决定单轮交办，调整与接管携带当前选择', async ({ page }) => {
  const card=page.locator('.vx-decision').filter({hasText:'是否应用新的发布设置'})
  await expect(card.getByText('执行方式 · 自动')).toBeVisible()
  await card.getByRole('button',{name:'与 AI 调整'}).click()
  await expect(page.getByRole('status').filter({hasText:'带入会话：应用设置'})).toBeVisible()
  await card.getByRole('button',{name:'人工接管'}).click()
  await expect(page.getByRole('status').filter({hasText:'人工接管：查看原始渠道设置'})).toBeVisible()
  await card.getByRole('radio',{name:'填写我的决定'}).check()
  await expect(card.getByRole('button',{name:'交给 AI 按此准备'})).toBeDisabled()
  await card.getByRole('textbox',{name:'我的决定与限制'}).fill('只为网站渠道准备新设置')
  await card.getByRole('button',{name:'交给 AI 按此准备'}).click()
  await expect(card.getByRole('status')).toHaveText('已交给 AI 准备：只为网站渠道准备新设置')
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

test('真实工作区在窄桌面展开与折叠后保留可用正文宽度', async ({ page }) => {
  await page.setViewportSize({width:1024,height:768})
  const app=page.getByTestId('session-workspace')
  await expect(app.getByRole('button',{name:'收起示例导航',exact:true})).toBeVisible()
  await app.getByRole('button',{name:'收起示例导航',exact:true}).click()
  await expect(app.locator('.vx-nav-account-more')).toBeHidden()
  await app.getByRole('button',{name:'讨论这份草稿',exact:true}).click()
  expect(await app.locator('.vx-render').evaluate(el=>el.clientWidth)).toBeGreaterThan(250)
  await expect(app.getByRole('textbox',{name:'示例对话输入'})).toBeVisible()
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
  const weekly = demo.getByRole('button', { name: /^本周内 3 项待处理/ })
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

test('横向导览保留操作门槛，完成与退出分开，浅深色文字可读', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const demo = page.getByTestId('guide-demo')
  for (const theme of ['light', 'dark']) {
    await page.evaluate(theme => document.documentElement.setAttribute('data-theme', theme), theme)
    await demo.getByRole('button', { name: '体验底部横向导览' }).click()
    const guide = page.getByRole('dialog', { name: '浏览偏好导览' })
    await expect(guide.locator('.vx-guide-hole')).toHaveAttribute('data-target', 'guide-workspace')
    const card = guide.locator('.vx-guide-card')
    expect((await card.boundingBox())!.width).toBeGreaterThan(1300)
    expect((await card.boundingBox())!.height).toBeLessThan(220)
    await guide.getByRole('button', { name: '下一步' }).click()
    await expect(guide.locator('.vx-guide-hole')).toHaveAttribute('data-target', 'guide-preference')
    await guide.getByRole('button', { name: '下一步' }).click()
    await expect(guide.locator('.vx-guide-hole')).toHaveAttribute('data-target', 'guide-save')
    await expect(guide.getByRole('button', { name: '完成导览' })).toBeDisabled()
    await card.focus(); await page.keyboard.press('ArrowRight')
    await expect(guide).toBeVisible()
    await demo.getByRole('button', { name: '保存浏览偏好' }).click()
    await expect(guide.getByRole('button', { name: '完成导览' })).toBeEnabled()
    expect((await new AxeBuilder({ page }).include('.vx-guide').withTags(['wcag2a', 'wcag2aa']).analyze()).violations).toEqual([])
    await guide.getByRole('button', { name: '完成导览' }).click()
    await expect(demo.getByText('导览已完成', { exact: true })).toBeVisible()
    expect(await page.evaluate(() => document.body.style.getPropertyValue('--vx-guide-space'))).toBe('')
  }
})

test('沉浸式选择保持内容聚合与焦点循环', async ({ page }) => {
  const trigger = page.getByRole('button', { name: '选择使用路线', exact: true })
  await trigger.click()
  const dialog = page.getByRole('dialog', { name: '选择使用路线' })
  await expect(dialog).toHaveAttribute('aria-modal', 'true')
  const head = (await dialog.getByRole('heading').boundingBox())!
  const last = (await dialog.getByRole('button', { name: '返回工作区' }).boundingBox())!
  expect(head.y).toBeGreaterThan(150)
  expect(last.y - head.y).toBeLessThan(600)
  await dialog.getByRole('button', { name: '返回工作区' }).focus(); await page.keyboard.press('Tab')
  await expect.poll(() => page.evaluate(() => !!document.activeElement?.closest('.vx-stage-dialog'))).toBe(true)
  await page.keyboard.press('Escape'); await expect(dialog).toHaveCount(0); await expect(trigger).toBeFocused()
})

test('响应式欢迎页整组平衡，固定步骤不随选项数量移动', async ({ page }) => {
  await page.evaluate(() => {
    document.body.innerHTML = '<div class="vx-onboard-shell"><main class="vx-onboard"><header class="vx-onboard-top">工作区</header><div class="vx-onboard-main"><section class="vx-onboard-step"><h1>让工作有条理</h1><p>从一个清晰的动作开始。</p></section></div><footer class="vx-onboard-foot"><button class="vx-btn">开始</button></footer></main></div>'
  })
  for (const [width, height] of [[1512, 827], [2560, 1440], [375, 812]]) {
    await page.setViewportSize({ width, height })
    await expect.poll(async () => page.locator('.vx-onboard').evaluate(el => {
      const r = el.getBoundingClientRect(); return Math.abs((r.top + r.bottom) / 2 - innerHeight / 2)
    })).toBeLessThan(2)
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0)
  }
  await page.locator('.vx-onboard').evaluate(el => el.classList.add('vx-onboard--fixed'))
  const geometry = () => page.locator('.vx-onboard-main').evaluate(el => ({ top: el.getBoundingClientRect().top, bottom: el.getBoundingClientRect().bottom }))
  const before = await geometry()
  await page.locator('.vx-onboard-step').evaluate(el => { for (let i = 0; i < 30; i++) el.append(Object.assign(document.createElement('p'), { textContent: '可选择的内容' })) })
  expect(await geometry()).toEqual(before)
})

test('说明 tooltip 可通过键盘读取且与触发器关联', async ({ page }) => {
  const trigger = page.getByRole('button', { name: '保存设置说明' })
  await trigger.focus()
  const tip = page.getByRole('tooltip')
  await expect(tip).toBeVisible()
  await expect(trigger).toHaveAttribute('aria-describedby', await tip.getAttribute('id') as string)
  await expect(tip).toHaveCSS('max-width', '260px')
  await page.keyboard.press('Escape')
  await expect(tip).toBeHidden()
})

test('说明 tooltip 支持点击固定、再次点击、外部点击与触屏', async ({ page, browser }) => {
  const trigger = page.getByRole('button', {name:'保存设置说明'})
  await trigger.click()
  await expect(page.getByRole('tooltip')).toBeVisible()
  await page.mouse.move(0,0)
  await expect(page.getByRole('tooltip')).toBeVisible()
  await trigger.click()
  await expect(page.getByRole('tooltip')).toBeHidden()
  await trigger.click()
  await expect(page.getByRole('tooltip')).toBeVisible()
  await page.getByRole('searchbox',{name:'搜索内容',exact:true}).click()
  await expect(page.getByRole('tooltip')).toBeHidden()
  const context=await browser.newContext({hasTouch:true,viewport:{width:390,height:844}})
  const touch=await context.newPage()
  await touch.goto('/showcase/')
  await touch.getByRole('button',{name:'保存设置说明'}).tap()
  await expect(touch.getByRole('tooltip')).toBeVisible()
  await touch.getByRole('button',{name:'保存设置说明'}).tap()
  await expect(touch.getByRole('tooltip')).toBeHidden()
  await context.close()
})


test('对象摘要悬停预览、点击与键盘打开详情', async ({ page }) => {
  const trigger=page.getByRole('button',{name:'查看便携收纳盒详情'})
  await trigger.hover()
  await expect(page.getByLabel('便携收纳盒预览',{exact:true})).toBeVisible()
  await page.keyboard.press('Escape')
  await trigger.click()
  await expect(page.getByRole('dialog',{name:'对象详情'})).toBeVisible()
  await page.keyboard.press('Escape')
  await trigger.focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('dialog',{name:'对象详情'})).toBeVisible()
})


test('板块卡片统一动作位置，标题说明支持点击、悬停和键盘', async ({ page }) => {
  const card=page.getByLabel('板块卡片示例',{exact:true}), chat=card.getByRole('button',{name:'讨论这份报告'}), action=card.getByRole('button',{name:'打开报告'})
  const title=card.getByRole('heading',{name:'报告摘要'}), a=await chat.boundingBox(), t=await title.boundingBox(), d=await action.boundingBox()
  expect(a!.x+a!.width).toBeLessThanOrEqual(t!.x)
  expect(d!.x).toBeGreaterThan(t!.x+t!.width)
  await expect(action.locator('svg')).toHaveCount(0)
  const label=card.getByRole('button',{name:'已完成说明'})
  await expect(label).toHaveText('已完成')
  expect(await label.evaluate(e=>getComputedStyle(e).textDecorationStyle)).toBe('dashed')
  await label.hover(); await expect(page.getByRole('tooltip')).toContainText('来源：任务日志')
  await label.click(); await page.mouse.move(0,0); await expect(page.getByRole('tooltip')).toBeVisible()
  await page.keyboard.press('Escape'); await expect(page.getByRole('tooltip')).toBeHidden()
  await label.focus(); await page.keyboard.press('Enter'); await expect(page.getByRole('tooltip')).toBeVisible()
  await page.keyboard.press('Escape'); await action.click(); await expect(page.getByRole('dialog',{name:'对象详情'})).toBeVisible()
})

test('缩窄页签条时显示当前页和关闭入口，手动滚动不被拉回', async ({ page }) => {
  const detail = page.getByRole('tab', { name: '明细', exact: true })
  await detail.click()
  const strip = page.getByRole('tablist', { name: '内容页签' })
  const viewport = strip.locator('..')
  const scrollY = await page.evaluate(() => window.scrollY)
  await viewport.evaluate(el => { el.style.flex = '0 0 80px'; el.style.width = '80px' })
  await expect.poll(() => strip.evaluate(el => el.scrollLeft)).toBeGreaterThan(0)
  const close = page.getByRole('button', { name: '关闭明细', exact: true })
  await expect(close).toBeVisible()
  const bounds = await viewport.boundingBox(), target = await close.boundingBox()
  expect(target!.x + target!.width).toBeLessThanOrEqual(bounds!.x + bounds!.width)
  expect(await page.evaluate(() => window.scrollY)).toBe(scrollY)
  await strip.evaluate(el => { el.scrollLeft = 0 })
  await page.waitForTimeout(100)
  expect(await strip.evaluate(el => el.scrollLeft)).toBe(0)
  await page.getByRole('tab', { name: '概览', exact: true }).focus()
  await page.keyboard.press('ArrowRight')
  await expect(close).toBeVisible()
  await close.click()
  await expect(detail).toHaveCount(0)
})


test('终点角标独立于标题，完成后移除；用户菜单支持键盘和焦点恢复', async ({ page }) => {
  await page.goto('/showcase/')
  const decision = page.locator('.vx-decision').filter({has:page.getByRole('heading',{name:'是否应用新的发布设置？',exact:true})})
  await expect(decision.locator('.vx-attention-corner')).toHaveCount(1)
  await expect(decision.locator('h4 .vx-dot')).toHaveCount(0)
  const offset = await decision.locator('.vx-attention-corner').evaluate(dot => {const r=dot.getBoundingClientRect(),c=dot.closest('.vx-decision')!.getBoundingClientRect();return [r.left-c.left,r.top-c.top]})
  expect(offset.every(n=>n>=7&&n<=10)).toBeTruthy()
  await decision.getByRole('button',{name:'确认方案',exact:true}).click()
  await expect(decision.getByRole('alert')).toBeVisible()
  await expect(decision.locator('.vx-attention-corner')).toHaveCount(1)
  await decision.getByRole('button',{name:'确认方案',exact:true}).click()
  await expect(decision.locator('.vx-attention-corner')).toHaveCount(0)
  const app=page.getByTestId('session-workspace')
  await app.getByRole('button',{name:'收起示例导航',exact:true}).click()
  const trigger = app.getByRole('button',{name:'示例用户菜单',exact:true})
  await trigger.focus(); await page.keyboard.press('Enter')
  await expect(page.getByRole('menu',{name:'示例用户菜单'})).toBeVisible()
  await page.keyboard.press('Escape'); await expect(trigger).toBeFocused()
  await trigger.click(); await page.getByRole('menuitem',{name:'展开示例导航',exact:true}).click()
  await expect(page.getByRole('menu')).toHaveCount(0)
  await expect(app.getByRole('button',{name:'收起示例导航',exact:true})).toBeVisible()
})


test('待办实例选择不提交，自定义需输入，确认后从待办移到历史', async ({page})=>{
 const demo=page.getByTestId('task-card-demo')
 await demo.getByRole('radio',{name:'自定义',exact:true}).check()
 await expect(demo.getByRole('button',{name:'交给 AI 继续',exact:true})).toBeDisabled()
 await expect(demo.locator('.vx-attention-corner')).toHaveCount(1)
 await demo.getByRole('textbox',{name:'处理要求'}).fill('沿用当前范围，先核对来源')
 await demo.getByRole('button',{name:'交给 AI 继续',exact:true}).click()
 await expect(demo.locator('.vx-task-card')).toHaveCount(0)
 await demo.getByRole('button',{name:'历史已办',exact:true}).click()
 await expect(demo.locator('.vx-task-card')).toHaveCount(1)
 await expect(demo.locator('.vx-attention-corner')).toHaveCount(0)
  await expect(demo.getByRole('radio',{name:'自定义',exact:true})).toBeChecked()
 for(const radio of await demo.getByRole('radio').all())await expect(radio).toBeDisabled()
 await expect(demo.getByRole('textbox',{name:'处理要求'})).toHaveValue('沿用当前范围，先核对来源')
 await expect(demo.getByRole('button',{name:'交给 AI 继续',exact:true})).toHaveAttribute('aria-pressed','true')
 await expect(demo.getByRole('button',{name:'交给 AI 继续',exact:true})).toBeDisabled()
 await expect(demo.getByRole('button',{name:'进入对话',exact:true})).toBeEnabled()
})

test('待办语义按钮、角标和状态在窄屏中可辨识且可达',async({page})=>{
 await page.setViewportSize({width:390,height:844})
 const demo=page.getByTestId('task-card-demo')
 await demo.scrollIntoViewIfNeeded()
 await expect(demo.getByRole('button',{name:'交给 AI 继续',exact:true})).toHaveCSS('color','rgb(34, 107, 72)')
 await expect(demo.getByRole('button',{name:'中止，转人工接管',exact:true})).toHaveCSS('color','rgb(174, 47, 29)')
 await demo.getByRole('button',{name:'进入对话',exact:true}).click()
 await expect(demo).toContainText('建议版本 2')
 await expect(demo.locator('.vx-task-card')).toHaveCount(1)
 await demo.getByRole('button',{name:'中止，转人工接管',exact:true}).click()
 await demo.getByRole('button',{name:'历史已办',exact:true}).click()
 await expect(demo.getByRole('button',{name:'中止，转人工接管',exact:true})).toHaveAttribute('aria-pressed','true')
 await expect(demo.locator('.vx-task-card-result')).toHaveCount(0)
 expect((await new AxeBuilder({page}).include('[data-testid="task-card-demo"]').analyze()).violations).toEqual([])
})

test('待办提交期间锁定选择与动作，失败保留输入并可重试',async({page})=>{
 await page.clock.install({time:new Date('2026-10-26T12:00:00')})
 await page.clock.pauseAt(new Date('2026-10-26T12:01:00'))
 const demo=page.getByTestId('task-card-demo'),card=demo.locator('.vx-task-card')
 await demo.getByRole('radio',{name:'自定义',exact:true}).check()
 await demo.getByRole('textbox',{name:'处理要求'}).fill('先核对来源，再继续准备')
 await demo.getByText('体验提交状态',{exact:true}).click()
 await demo.getByRole('checkbox',{name:'下次提交失败'}).check()
 const submit=demo.getByRole('button',{name:'交给 AI 继续',exact:true})
 await submit.click();await expect(card).toHaveAttribute('aria-busy','true')
 await expect(submit).toHaveAttribute('aria-busy','true')
 await expect(card.locator('.vx-attention-corner')).toHaveCount(1)
 for(const button of await card.getByRole('button').all())await expect(button).toBeDisabled()
 for(const radio of await card.getByRole('radio').all())await expect(radio).toBeDisabled()
 await expect(card.getByRole('textbox')).toBeDisabled()
 await submit.evaluate(button=>(button as HTMLButtonElement).click())
 await page.keyboard.press('Enter');await expect(demo).toContainText('提交尝试：1')
 await page.clock.fastForward(700)
 await expect(card).toHaveAttribute('aria-busy','false')
 await expect(card.getByRole('alert')).toHaveText('暂时无法提交，请重试。')
 await expect(card.getByRole('textbox')).toHaveValue('先核对来源，再继续准备')
 await expect(card.locator('.vx-attention-corner')).toHaveCount(1)
 await submit.click();await expect(demo).toContainText('提交尝试：2')
 await page.clock.fastForward(700);await expect(card).toHaveCount(0)
 await demo.getByRole('button',{name:'历史已办',exact:true}).click()
 await expect(demo.getByRole('textbox',{name:'处理要求'})).toHaveValue('先核对来源，再继续准备')
})

test('月历连续前后切月，Tab 保持目标月份的日期入口',async({page})=>{
 await page.clock.setFixedTime(new Date('2026-10-26T12:00:00'))
 const demo=page.getByTestId('date-comparison-demo')
 await demo.getByRole('button',{name:'时间范围',exact:true}).click()
 const popup=page.locator('.vx-date-popup'),next=popup.getByRole('button',{name:'下个月',exact:true})
 for(let i=0;i<8;i++)await next.click()
 await next.press('Tab')
 await expect(popup.getByRole('gridcell',{name:'2027年6月1日',exact:true})).toBeFocused()
 const previous=popup.getByRole('button',{name:'上个月',exact:true})
 for(let i=0;i<10;i++)await previous.click()
 await next.focus();await next.press('Tab')
 await expect(popup.getByRole('gridcell',{name:'2026年8月1日',exact:true})).toBeFocused()
})

test('选择器支持搜索无结果、键盘选择且无对号占位', async ({page})=>{
 const trigger=browse(page).getByRole('combobox',{name:'内容类型',exact:true})
 await trigger.click();const search=page.getByRole('combobox',{name:'搜索内容类型',exact:true})
 await search.fill('不存在');await expect(page.getByText('没有匹配项',{exact:true})).toBeVisible()
 await search.fill('模板');await expect(page.getByRole('option')).toHaveCount(1);await search.press('ArrowDown');await search.press('Enter')
 await expect(trigger).toBeFocused();await expect(trigger).toHaveText('模板')
 await trigger.click();await expect(page.locator('.vx-option-check')).toHaveCount(0);await page.keyboard.press('Escape');await expect(trigger).toBeFocused()
})

test('日期浮层保留草稿边界，排序按钮切换图标且不改变日期范围', async({page})=>{
 const demo=page.getByTestId('task-card-demo'),date=demo.getByRole('button',{name:/^时间范围/}),sort=demo.locator('.vx-sort-toggle')
 await date.click();await page.getByRole('button',{name:'最近 7 天',exact:true}).click();await page.getByRole('button',{name:'应用',exact:true}).click();await expect(date).toContainText('更新时间 · 最近 7 天')
 await expect(sort).toHaveText('更新时间');await expect(sort.locator('[data-icon=sort-desc]')).toHaveCount(1);await sort.click();await expect(sort.locator('[data-icon=sort-asc]')).toHaveCount(1);await expect(sort).toBeFocused();await sort.press('Enter');await expect(sort.locator('[data-icon=sort-desc]')).toHaveCount(1);await expect(demo.getByRole('combobox',{name:'排序依据'})).toHaveCount(0);await expect(date).toContainText('更新时间 · 最近 7 天')
 await date.click();await page.getByRole('button',{name:'自定义',exact:true}).click();await page.getByLabel('起始日期',{exact:true}).fill('2099-03-02');await page.getByLabel('截止日期',{exact:true}).fill('2099-03-01');await expect(page.getByRole('button',{name:'应用',exact:true})).toBeDisabled();await page.keyboard.press('Escape');await expect(page.locator('.vx-date-popup')).toBeHidden();await expect(date).toContainText('最近 7 天')
 await date.click();await page.getByRole('button',{name:'具体日期',exact:true}).click();const day=page.getByLabel('具体日期',{exact:true});await day.fill('2099-03-02');await day.blur();await expect(day).toHaveValue('2099-03-02');const apply=page.getByRole('button',{name:'应用',exact:true});await expect(apply).toBeEnabled();await apply.click();await expect(page.locator('.vx-date-popup')).toBeHidden();await expect(date).toContainText('2099-03-02')
})

test('连续月历跨月选择、键盘跨年、单日与对比范围可应用', async({page})=>{
 const demo=page.getByTestId('date-comparison-demo'),date=demo.getByRole('button',{name:/^时间范围/})
 await date.click();await page.getByLabel('起始日期',{exact:true}).fill('2026-09-27');await page.getByLabel('截止日期',{exact:true}).fill('2026-10-24')
 await page.getByLabel('起始日期',{exact:true}).focus();await page.getByRole('gridcell',{name:'2026年9月27日',exact:true}).click();await page.getByRole('gridcell',{name:'2026年10月24日',exact:true}).click()
 await expect(page.getByLabel('起始日期',{exact:true})).toHaveValue('2026-09-27');await expect(page.getByLabel('截止日期',{exact:true})).toHaveValue('2026-10-24');await expect(page.locator('.vx-calendar-week [data-endpoint]')).toHaveCount(2)
 await page.getByRole('switch',{name:'对比上一时段',exact:true}).check();await expect(page.getByText('对比：2026-08-30 — 2026-09-26',{exact:true})).toBeVisible();await page.getByRole('button',{name:'应用',exact:true}).click()
 await date.click();await expect(page.getByRole('switch',{name:'对比上一时段',exact:true})).toBeChecked();await page.getByRole('button',{name:'具体日期',exact:true}).click();await page.getByLabel('具体日期',{exact:true}).fill('2026-12-31');const last=page.getByRole('gridcell',{name:'2026年12月31日',exact:true});await last.focus();await page.keyboard.press('ArrowRight');await expect(page.getByRole('gridcell',{name:'2027年1月1日',exact:true})).toBeFocused();await page.keyboard.press('Enter');await expect(page.getByLabel('具体日期',{exact:true})).toHaveValue('2027-01-01');await page.getByRole('button',{name:'取消',exact:true}).click();await expect(date).toContainText('2026-09-27—2026-10-24')
})

test('月历浮层在窄屏与短窗口保留底部动作，展开不移动正文', async({page})=>{
 for(const viewport of [{width:1440,height:1000},{width:390,height:844},{width:320,height:640},{width:760,height:500}]){
  await page.setViewportSize(viewport);await page.goto('/showcase/');const trigger=page.getByTestId('task-card-demo').getByRole('button',{name:/^时间范围/});await trigger.scrollIntoViewIfNeeded();await trigger.click();const popup=page.locator('.vx-date-popup');await expect(popup).toBeVisible();await expect(popup.getByRole('button',{name:'取消',exact:true})).toBeInViewport();await expect(popup.getByRole('button',{name:'应用',exact:true})).toBeInViewport();const box=await popup.boundingBox();expect(box!.x).toBeGreaterThanOrEqual(0);expect(box!.x+box!.width).toBeLessThanOrEqual(viewport.width);expect(box!.y+box!.height).toBeLessThanOrEqual(viewport.height+1);await page.keyboard.press('Escape')
 }
})


test('快捷范围以周一为周界，跨闰年的十二个月起止正确', async({page})=>{
 await page.clock.install({time:new Date('2024-02-29T12:00:00')});await page.reload();await page.getByTestId('task-card-demo').getByRole('button',{name:/^时间范围/}).click();await page.getByRole('button',{name:'最近 12 个月',exact:true}).click();await expect(page.getByLabel('起始日期',{exact:true})).toHaveValue('2023-03-01');await expect(page.getByLabel('截止日期',{exact:true})).toHaveValue('2024-02-29');await page.getByRole('button',{name:'本周 周一至今天',exact:true}).click();await expect(page.getByLabel('起始日期',{exact:true})).toHaveValue('2024-02-26');await page.getByRole('button',{name:'上月',exact:true}).click();await expect(page.getByLabel('起始日期',{exact:true})).toHaveValue('2024-01-01');await expect(page.getByLabel('截止日期',{exact:true})).toHaveValue('2024-01-31')
 const results=await new AxeBuilder({page}).include('.vx-date-popup').analyze();expect(results.violations).toEqual([])
})


test('状态区只保留类型、紧迫度和更新时间',async({page})=>{
 const status=page.getByTestId('task-card-demo').locator('.vx-task-status')
 expect(await status.locator('[data-status-part]').evaluateAll(xs=>xs.map(x=>x.getAttribute('data-status-part')))).toEqual(['type','urgency','timestamps'])
 await expect(status.locator('time')).toHaveCount(1)
 await expect(status.locator('time')).toHaveText('于 10/25 10:00 更新')
 await expect(status.locator('.vx-tag')).toHaveCount(0)
})

test('状态保持单行且时间对齐右侧',async({page})=>{
 for(const width of [1440,760,390]){await page.setViewportSize({width,height:1000});const result=await page.getByTestId('task-card-demo').locator('.vx-task-status').evaluate(e=>{const row=e.getBoundingClientRect(),main=e.querySelector('.vx-task-status-main')!.getBoundingClientRect(),time=e.querySelector('time')!.getBoundingClientRect();return{rowRight:row.right,timeRight:time.right,mainY:main.y+main.height/2,timeY:time.y+time.height/2,width:e.clientWidth,scroll:e.scrollWidth}});expect(Math.abs(result.mainY-result.timeY)).toBeLessThan(2);expect(Math.abs(result.rowRight-result.timeRight)).toBeLessThan(2);expect(result.scroll).toBeLessThanOrEqual(result.width+1)}
})


test('下拉筛选首项统一为全部，收起显示字段名称',async({page})=>{
 for(const label of ['内容类型','内容状态']){const trigger=browse(page).getByRole('combobox',{name:label,exact:true});await expect(trigger).toHaveText(label);await trigger.click();await expect(page.getByRole('option').first()).toHaveText('全部');await page.keyboard.press('Escape')}
})


test('历史面包屑替换页头并通过一级标题返回',async({page})=>{
 const demo=page.getByTestId('task-card-demo');await demo.getByRole('button',{name:'历史已办',exact:true}).click();const path=demo.getByRole('navigation',{name:'页面路径',exact:true});await expect(path.getByRole('heading',{name:'历史已办',exact:true})).toHaveAttribute('aria-current','page');await path.getByRole('button',{name:'待办事项',exact:true}).focus();await page.keyboard.press('Enter');await expect(path).toHaveCount(0);await expect(demo.getByRole('button',{name:'历史已办',exact:true})).toBeVisible()
})


test('页签红点定位在文字左上方，不改变标签宽度',async({page})=>{
 const tab=page.getByRole('tab',{name:'明细',exact:true});const before=await tab.boundingBox();const mark=await tab.locator('.vx-dot').evaluate(e=>{const dot=e.getBoundingClientRect(),text=e.closest('.vx-tab-caption')!.querySelector('.vx-tab-text')!.getBoundingClientRect();return {left:text.left-dot.left,top:dot.top-text.top,position:getComputedStyle(e.parentElement!).position}});expect(mark.position).toBe('absolute');expect(mark.left).toBeGreaterThan(0);expect(mark.left).toBeLessThanOrEqual(8);expect(mark.top).toBeLessThanOrEqual(1);await tab.click();await expect(tab.locator('.vx-dot')).toBeVisible();expect(Math.abs((await tab.boundingBox())!.width-before!.width)).toBeLessThan(1);await page.getByRole('tab',{name:'概览',exact:true}).click();await expect(tab.locator('.vx-dot')).toBeVisible();expect(Math.abs((await tab.boundingBox())!.width-before!.width)).toBeLessThan(1)
})

test('浏览排序复用更新时间按钮，先排序再分页并保留筛选与选择',async({page})=>{
 const demo=browse(page),sort=demo.getByRole('button',{name:/^更新时间：/})
 await expect(sort).toHaveAccessibleName('更新时间：新到旧，点击切换为旧到新')
 const titles=()=>demo.locator('.vx-result-title').allTextContents()
 expect((await titles())[0]).toBe('本周运营回顾')
 await demo.getByRole('checkbox',{name:'选择本周运营回顾',exact:true}).check()
 await demo.getByRole('button',{name:'下一页',exact:true}).click()
 await sort.click()
 await expect(demo.getByRole('button',{name:'上一页',exact:true})).toBeDisabled()
 expect(await titles()).toEqual(['年度规划草案','周会记录模板','产品反馈汇总','月度数据复盘','访谈要点','新项目启动清单'])
 await expect(sort).toHaveAttribute('data-order','asc');await expect(sort.locator('[data-icon=sort-asc]')).toHaveCount(1)
 await expect(demo.getByText('已选 1 项',{exact:true})).toBeVisible()
 await demo.getByRole('button',{name:'列表',exact:true}).click();await expect(sort).toHaveAttribute('data-order','asc')
 await demo.getByRole('combobox',{name:'内容类型',exact:true}).click();await page.getByRole('option',{name:'模板',exact:true}).click()
 expect(await titles()).toEqual(['周会记录模板','新项目启动清单','内容发布检查表'])
 await expect(demo.getByText('共 3 项',{exact:true})).toBeVisible()
 await sort.focus();await sort.press('Enter');await expect(sort).toBeFocused()
 expect(await titles()).toEqual(['内容发布检查表','新项目启动清单','周会记录模板'])
 await expect(demo.getByRole('combobox',{name:'内容类型',exact:true})).toHaveText('模板')
 await expect(demo.getByRole('combobox',{name:'排序',exact:true})).toHaveCount(0)
 const dates=await demo.locator('.vx-data-time time').evaluateAll(xs=>xs.map(e=>Date.parse(e.getAttribute('datetime')!)))
 expect(dates).toEqual([...dates].sort((a,b)=>b-a))
})
